/**
 * Flow 4.1 — Employee Dashboard v4
 * Dedicated Time Off Request Drawer - Premium, streamlined leave request form
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { CalendarIcon, Plane, Check, Minus, Plus, Sun, Sparkles } from 'lucide-react';
import { format, differenceInBusinessDays, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface F41v4_TimeOffRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const leaveTypes: { value: LeaveType; label: string; icon: string }[] = [
  { value: 'Annual leave', label: 'Annual leave', icon: '🌴' },
  { value: 'Sick leave', label: 'Sick leave', icon: '🏥' },
  { value: 'Unpaid leave', label: 'Unpaid leave', icon: '📋' },
  { value: 'Other', label: 'Other', icon: '📝' },
];

// Pay period bounds (mock - in real app would come from store)
const payPeriodStart = new Date(2026, 0, 1);
const payPeriodEnd = new Date(2026, 0, 31);
const payPeriodLabel = 'Jan 1 – Jan 31, 2026';

export const F41v4_TimeOffRequestDrawer = ({ open, onOpenChange }: F41v4_TimeOffRequestDrawerProps) => {
  const { addLeaveRequest } = useF41v4_DashboardStore();
  
  // Form state with smart defaults
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual leave');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate total days
  const calculatedDays = startDate && endDate 
    ? Math.max(1, differenceInBusinessDays(endDate, startDate) + 1)
    : 0;

  const resetForm = () => {
    setLeaveType('Annual leave');
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes('');
    setErrors({});
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Required';
    if (!endDate) newErrors.endDate = 'Required';
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'Must be after start';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    addLeaveRequest({
      leaveType,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      totalDays: calculatedDays,
      reason: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Show success briefly then close
    setTimeout(() => {
      toast.success('Time off request submitted');
      handleClose();
    }, 1500);
  };

  // Success state
  if (showSuccess) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-md border-l-0 sm:border-l">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-6 py-12"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="relative"
            >
              <div className="p-5 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10">
                <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-5 w-5 text-amber-500" />
              </motion.div>
            </motion.div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Request submitted</h3>
              <p className="text-sm text-muted-foreground">
                {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'} of {leaveType.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {startDate && endDate && (
                  <>
                    {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l-0 sm:border-l p-0">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] p-6 pb-8">
          <SheetHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">Request time off</SheetTitle>
                <p className="text-sm text-muted-foreground">{payPeriodLabel}</p>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Leave Type Selection - Visual cards */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What type of leave?</Label>
            <div className="grid grid-cols-2 gap-2">
              {leaveTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setLeaveType(type.value)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
                    leaveType === type.value
                      ? "border-primary bg-primary/[0.04] shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className={cn(
                    "text-sm font-medium",
                    leaveType === type.value ? "text-primary" : "text-foreground"
                  )}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">When?</Label>
            <div className="flex gap-3">
              {/* Start Date */}
              <div className="flex-1 space-y-1.5">
                <span className="text-xs text-muted-foreground">From</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !startDate && 'text-muted-foreground',
                        errors.startDate && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {startDate ? format(startDate, 'EEE, MMM d') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (date && (!endDate || endDate < date)) {
                          setEndDate(date);
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex-1 space-y-1.5">
                <span className="text-xs text-muted-foreground">To</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-12',
                        !endDate && 'text-muted-foreground',
                        errors.endDate && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {endDate ? format(endDate, 'EEE, MMM d') : 'Select date'}
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
              </div>
            </div>
            
            {/* Days summary */}
            <AnimatePresence>
              {calculatedDays > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary/[0.04] border border-primary/20"
                >
                  <Plane className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {calculatedDays} {calculatedDays === 1 ? 'business day' : 'business days'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context for your manager..."
              rows={2}
              className="resize-none bg-muted/30 border-border/60 focus:border-primary/50"
            />
          </div>

          {/* Info callout */}
          <p className="text-xs text-muted-foreground text-center px-4">
            Once approved, this time off will be reflected in your payroll
          </p>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 p-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !startDate || !endDate}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sun className="h-4 w-4" />
                </motion.div>
                Submitting...
              </span>
            ) : (
              'Submit request'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
