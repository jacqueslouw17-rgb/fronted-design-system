/**
 * Flow 4.1 — Employee Dashboard v4
 * Dedicated Time Off Request Drawer - Streamlined leave request form
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useF41v4_DashboardStore, type LeaveType } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plane, Check, Minus, Plus, Info } from 'lucide-react';
import { format, differenceInBusinessDays, addDays, startOfMonth, endOfMonth } from 'date-fns';

interface F41v4_TimeOffRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const leaveTypes: LeaveType[] = ['Annual leave', 'Sick leave', 'Unpaid leave', 'Other'];

// Pay period bounds (mock - in real app would come from store)
const payPeriodStart = new Date(2026, 0, 1); // Jan 1, 2026
const payPeriodEnd = new Date(2026, 0, 31); // Jan 31, 2026
const payPeriodLabel = 'Jan 1 – Jan 31';

export const F41v4_TimeOffRequestDrawer = ({ open, onOpenChange }: F41v4_TimeOffRequestDrawerProps) => {
  const { addLeaveRequest, periodLabel } = useF41v4_DashboardStore();
  
  // Form state with smart defaults
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual leave');
  const [dateScope, setDateScope] = useState<'this-period' | 'different'>('this-period');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate dates based on number of days (for this-period mode)
  useEffect(() => {
    if (dateScope === 'this-period') {
      // Auto-calculate dates based on numberOfDays starting from today or period start
      const today = new Date();
      const effectiveStart = today < payPeriodStart ? payPeriodStart : today;
      setStartDate(effectiveStart);
      setEndDate(addDays(effectiveStart, Math.max(0, numberOfDays - 1)));
    }
  }, [numberOfDays, dateScope]);

  // Calculate total days when in different mode
  const calculatedDays = startDate && endDate 
    ? Math.max(1, differenceInBusinessDays(endDate, startDate) + 1)
    : numberOfDays;

  const resetForm = () => {
    setLeaveType('Annual leave');
    setDateScope('this-period');
    setStartDate(undefined);
    setEndDate(undefined);
    setNumberOfDays(1);
    setNotes('');
    setErrors({});
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleDecrementDays = () => {
    if (numberOfDays > 1) {
      setNumberOfDays(prev => prev - 1);
    }
  };

  const handleIncrementDays = () => {
    if (numberOfDays < 30) {
      setNumberOfDays(prev => prev + 1);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (dateScope === 'different') {
      if (!startDate) newErrors.startDate = 'Start date is required';
      if (!endDate) newErrors.endDate = 'End date is required';
      if (startDate && endDate && endDate < startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const effectiveStartDate = dateScope === 'this-period' 
      ? startDate || payPeriodStart
      : startDate!;
    
    const effectiveEndDate = dateScope === 'this-period'
      ? endDate || addDays(payPeriodStart, numberOfDays - 1)
      : endDate!;

    addLeaveRequest({
      leaveType,
      startDate: effectiveStartDate.toISOString(),
      endDate: effectiveEndDate.toISOString(),
      totalDays: dateScope === 'this-period' ? numberOfDays : calculatedDays,
      reason: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Show success briefly then close
    setTimeout(() => {
      toast.success('Time off request submitted');
      handleClose();
    }, 1200);
  };

  // Success state
  if (showSuccess) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-md">
          <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
            <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Request submitted</h3>
              <p className="text-sm text-muted-foreground">
                {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'} of {leaveType.toLowerCase()}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Request time off</SheetTitle>
              <SheetDescription>
                Submit a leave request for this pay period
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Pay Period Context */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pay period</span>
              <span className="text-sm font-medium text-foreground">{payPeriodLabel}</span>
            </div>
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label>Leave type</Label>
            <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((lt) => (
                  <SelectItem key={lt} value={lt}>{lt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Scope Toggle */}
          <div className="space-y-2">
            <Label>Dates</Label>
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setDateScope('this-period');
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
                  dateScope === 'this-period'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                This pay period
              </button>
              <button
                type="button"
                onClick={() => setDateScope('different')}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
                  dateScope === 'different'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Different dates
              </button>
            </div>
          </div>

          {/* Number of Days Stepper (for this-period mode) */}
          {dateScope === 'this-period' && (
            <div className="space-y-2">
              <Label>Number of days</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={handleDecrementDays}
                    disabled={numberOfDays <= 1}
                    className={cn(
                      'p-3 transition-colors',
                      numberOfDays <= 1 
                        ? 'text-muted-foreground/40 cursor-not-allowed' 
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-semibold tabular-nums">
                    {numberOfDays}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementDays}
                    disabled={numberOfDays >= 30}
                    className={cn(
                      'p-3 transition-colors',
                      numberOfDays >= 30 
                        ? 'text-muted-foreground/40 cursor-not-allowed' 
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {numberOfDays === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}

          {/* Date Pickers (for different mode) */}
          {dateScope === 'different' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground',
                        errors.startDate && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'MMM d') : 'Start'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground',
                        errors.endDate && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'MMM d') : 'End'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>
              
              {/* Show calculated days when both dates selected */}
              {startDate && endDate && (
                <div className="col-span-2 pt-1">
                  <p className="text-sm text-muted-foreground">
                    {calculatedDays} {calculatedDays === 1 ? 'business day' : 'business days'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any context for your manager..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Only approved leave will be reflected in payroll
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit request'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
