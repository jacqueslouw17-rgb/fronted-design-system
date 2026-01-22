/**
 * Flow 4.1 — Employee Dashboard v4
 * Dedicated Time Off Request Drawer - Premium, streamlined leave request form
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useF41v4_DashboardStore, type LeaveType } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plane, Check, Sun, Sparkles } from 'lucide-react';
import { format, differenceInBusinessDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
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

// No date restrictions - allow past dates for missed leave

export const F41v4_TimeOffRequestDrawer = ({ open, onOpenChange }: F41v4_TimeOffRequestDrawerProps) => {
  const { addLeaveRequest } = useF41v4_DashboardStore();
  
  // Form state with smart defaults
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual leave');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Derived dates from range
  const startDate = dateRange?.from;
  const endDate = dateRange?.to ?? dateRange?.from; // Single day = from only

  // Calculate total days
  const calculatedDays = startDate && endDate 
    ? Math.max(1, differenceInBusinessDays(endDate, startDate) + 1)
    : 0;

  const resetForm = () => {
    setLeaveType('Annual leave');
    setDateRange(undefined);
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
    if (!dateRange?.from) newErrors.dates = 'Please select dates';
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
                <p className="text-sm text-muted-foreground">Past or upcoming leave</p>
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

          {/* Date Range Selection - Single Calendar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">When?</Label>
              {dateRange?.from && (
                <button 
                  onClick={() => setDateRange(undefined)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
              Tap a date for single day, or two dates for a range
            </p>
            
            <div className={cn(
              "rounded-xl border bg-card overflow-hidden transition-colors",
              errors.dates ? "border-destructive" : "border-border/60"
            )}>
              <div className="flex items-center justify-center py-2">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                  classNames={{
                    months: "flex flex-col",
                    month: "space-y-3",
                    caption: "flex justify-center pt-1 relative items-center h-10",
                    caption_label: "text-sm font-semibold text-foreground",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-muted rounded-lg transition-all inline-flex items-center justify-center",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    table: "w-full border-collapse",
                    head_row: "flex justify-center",
                    head_cell: "text-muted-foreground rounded-md w-10 font-medium text-xs py-2",
                    row: "flex w-full justify-center mt-1",
                    cell: cn(
                      "relative h-10 w-10 text-center text-sm p-0",
                      "focus-within:relative focus-within:z-20",
                      "[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-none",
                      "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
                      "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
                    ),
                    day: cn(
                      "h-10 w-10 p-0 font-normal rounded-lg transition-colors",
                      "hover:bg-muted aria-selected:opacity-100",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20"
                    ),
                    day_range_end: "day-range-end",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg",
                    day_today: "bg-primary/10 text-foreground font-semibold",
                    day_outside: "text-muted-foreground/40 aria-selected:bg-primary/5 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground/30",
                    day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground rounded-none",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>

            {/* Selected range display */}
            <AnimatePresence>
              {dateRange?.from && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-primary/[0.04] border border-primary/20"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
                        ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
                        : format(dateRange.from, 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Plane className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
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
            disabled={isSubmitting || !dateRange?.from}
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
