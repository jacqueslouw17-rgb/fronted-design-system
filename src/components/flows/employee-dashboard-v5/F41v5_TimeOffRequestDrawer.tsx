/**
 * Flow 4.1 — Employee Dashboard v5
 * Dedicated Time Off Request Drawer - Premium, streamlined leave request form
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v4 or any other flow.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useF41v5_DashboardStore, type F41v5_LeaveType } from '@/stores/F41v5_DashboardStore';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plane, Check, Sun, Sparkles, AlertTriangle, MapPin, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchCountryRules,
  calculateBusinessDays,
  validateLeaveRequest,
  getWeekendDayNames,
  type CountryRules,
  type Holiday,
} from '@/utils/countryLeaveUtils';

interface F41v5_TimeOffRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectedId?: string;
  rejectionReason?: string;
  initialLeaveType?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

const leaveTypes: { value: F41v5_LeaveType; label: string; icon: string }[] = [
  { value: 'Vacation', label: 'Vacation', icon: '🌴' },
  { value: 'Sick', label: 'Sick', icon: '🤒' },
  { value: 'Compassionate', label: 'Compassionate', icon: '💜' },
  { value: 'Maternity', label: 'Maternity', icon: '🏝️' },
];

const COUNTRY_NAMES: Record<string, string> = {
  NO: 'Norway',
  PH: 'Philippines',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  AE: 'UAE',
  SA: 'Saudi Arabia',
  IN: 'India',
  AU: 'Australia',
  SG: 'Singapore',
  JP: 'Japan',
};

export const F41v5_TimeOffRequestDrawer = ({ 
  open, 
  onOpenChange, 
  rejectedId, 
  rejectionReason,
  initialLeaveType,
  initialStartDate,
  initialEndDate
}: F41v5_TimeOffRequestDrawerProps) => {
  const { addLeaveRequest, employeeCountry, leaveRequests, withdrawLeaveRequest } = useF41v5_DashboardStore();
  
  const [countryRules, setCountryRules] = useState<CountryRules | null>(null);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [leaveType, setLeaveType] = useState<F41v5_LeaveType>('Vacation');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open && employeeCountry && !countryRules) {
      setIsLoadingRules(true);
      fetchCountryRules(employeeCountry)
        .then(rules => {
          if (rules) setCountryRules(rules);
        })
        .finally(() => setIsLoadingRules(false));
    }
  }, [open, employeeCountry, countryRules]);

  // Pre-fill form when resubmitting a rejected leave
  useEffect(() => {
    if (open && rejectedId && initialLeaveType) {
      // Pre-fill leave type
      const validLeaveType = leaveTypes.find(t => t.value === initialLeaveType);
      if (validLeaveType) {
        setLeaveType(validLeaveType.value);
      }
      
      // Pre-fill dates
      if (initialStartDate && initialEndDate) {
        setDateRange({
          from: new Date(initialStartDate),
          to: new Date(initialEndDate)
        });
      }
    }
  }, [open, rejectedId, initialLeaveType, initialStartDate, initialEndDate]);

  const startDate = dateRange?.from;
  const endDate = dateRange?.to ?? dateRange?.from;
  const isSingleDay = startDate && endDate && startDate.toDateString() === endDate.toDateString();

  const usedVacationLeave = useMemo(() => {
    return leaveRequests
      .filter(l => l.leaveType === 'Vacation' && l.status !== 'Admin rejected')
      .reduce((sum, l) => sum + l.totalDays, 0);
  }, [leaveRequests]);

  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    let days = 0;
    if (countryRules) {
      days = calculateBusinessDays(
        startDate,
        endDate,
        countryRules.weekendDays,
        countryRules.holidays
      );
    } else {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    if (isSingleDay && isHalfDay && days === 1) {
      return 0.5;
    }
    return days;
  }, [startDate, endDate, countryRules, isSingleDay, isHalfDay]);

  const validation = useMemo(() => {
    if (!startDate || !endDate || !countryRules) return null;
    return validateLeaveRequest(startDate, endDate, countryRules, usedVacationLeave);
  }, [startDate, endDate, countryRules, usedVacationLeave]);

  const holidayDates = useMemo(() => {
    if (!countryRules) return new Set<string>();
    return new Set(countryRules.holidays.map(h => h.date));
  }, [countryRules]);

  const holidaysInRange = useMemo(() => {
    if (!startDate || !endDate || !countryRules) return [];
    const holidays: Holiday[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const holiday = countryRules.holidays.find(h => h.date === dateStr);
      if (holiday) holidays.push(holiday);
      current.setDate(current.getDate() + 1);
    }
    return holidays;
  }, [startDate, endDate, countryRules]);

  const resetForm = () => {
    setLeaveType('Vacation');
    setDateRange(undefined);
    setIsHalfDay(false);
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
    await new Promise(resolve => setTimeout(resolve, 600));

    // If resubmitting, withdraw the old rejected leave first
    if (rejectedId) {
      withdrawLeaveRequest(rejectedId);
    }

    addLeaveRequest({
      leaveType,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      totalDays: calculatedDays,
      reason: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      toast.success('Time off request submitted');
      handleClose();
    }, 1500);
  };

  const modifiers = useMemo(() => {
    if (!countryRules) return {};
    return {
      holiday: countryRules.holidays.map(h => new Date(h.date)),
    };
  }, [countryRules]);

  const modifiersClassNames = {
    holiday: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium',
  };

  const payPeriodStart = new Date(2026, 0, 1);
  const payPeriodEnd = new Date(2026, 0, 31);
  const payPeriodLabel = `${format(payPeriodStart, 'MMM d')} – ${format(payPeriodEnd, 'MMM d')}`;
  
  const spansPayPeriods = useMemo(() => {
    if (!startDate || !endDate) return false;
    return startDate < payPeriodStart || endDate > payPeriodEnd;
  }, [startDate, endDate]);

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
                {calculatedDays} business {calculatedDays === 1 ? 'day' : 'days'} of {leaveType.toLowerCase()}
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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto border-l-0 sm:border-l p-0">
        <div className="bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] p-6 pb-8">
          <SheetHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-lg">Request time off</SheetTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {COUNTRY_NAMES[employeeCountry] || employeeCountry} rules apply
                  </span>
                  {isLoadingRules && (
                    <span className="text-xs text-muted-foreground/60">Loading holidays...</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="text-xs font-normal bg-background/50">
                Pay period: {payPeriodLabel}
              </Badge>
              {countryRules && (
                <>
                  <Badge variant="secondary" className="text-xs font-normal">
                    Weekend: {getWeekendDayNames(countryRules.weekendDays)}
                  </Badge>
                  {countryRules.maxAnnualLeave > 0 && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      Annual allowance: {countryRules.maxAnnualLeave} days
                    </Badge>
                  )}
                </>
              )}
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Rejection notification for resubmissions */}
          {!!rejectedId && rejectionReason && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-destructive">Rejected by admin</p>
                <p className="text-sm text-destructive/80">{rejectionReason}</p>
              </div>
            </div>
          )}

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
              Tap a date for single day, or two dates for a range. 
              {countryRules && (
                <span className="text-amber-600 dark:text-amber-400"> Holidays are highlighted.</span>
              )}
            </p>
            
            <div className={cn(
              "rounded-xl border bg-card overflow-hidden transition-colors",
              errors.dates ? "border-destructive" : "border-border/60"
            )}>
              <div className="flex items-center justify-center py-3 px-2">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  defaultMonth={payPeriodStart}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="pointer-events-auto"
                  classNames={{
                    months: "flex flex-col sm:flex-row gap-4 sm:gap-6",
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
                    day_today: "ring-2 ring-primary/30 text-foreground font-semibold",
                    day_outside: "text-muted-foreground/40 aria-selected:bg-primary/5 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground/30",
                    day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground rounded-none",
                    day_hidden: "invisible",
                  }}
                />
              </div>
              
              <div className="flex items-center justify-center gap-4 py-2 px-4 border-t border-border/40 bg-muted/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-500/30 border border-amber-300 dark:border-amber-500/50" />
                  <span className="text-xs text-muted-foreground">Public holiday</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded ring-2 ring-primary/30" />
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {dateRange?.from && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-primary/[0.04] border border-primary/20">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">
                        {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
                          ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
                          : format(dateRange.from, 'EEE, MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Plane className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {calculatedDays === 0.5 ? '0.5 day' : `${calculatedDays} ${calculatedDays === 1 ? 'day' : 'days'}`}
                        </span>
                      </div>
                      {leaveType === 'Vacation' && countryRules && countryRules.maxAnnualLeave > 0 && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span className={cn(
                            "text-sm",
                            countryRules.maxAnnualLeave - usedVacationLeave - calculatedDays < 0 
                              ? "text-destructive font-medium" 
                              : "text-muted-foreground"
                          )}>
                            {countryRules.maxAnnualLeave - usedVacationLeave - calculatedDays} left
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isSingleDay && (
                    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">Half day only</span>
                        <span className="text-xs text-muted-foreground">(0.5 day)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsHalfDay(!isHalfDay)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                          isHalfDay 
                            ? "bg-primary border-transparent" 
                            : "bg-muted-foreground/20 border-border"
                        )}
                        role="switch"
                        aria-checked={isHalfDay}
                      >
                        <span
                          className={cn(
                            "pointer-events-none block h-4 w-4 rounded-full shadow-md ring-0 transition-transform",
                            isHalfDay 
                              ? "translate-x-4 bg-primary-foreground" 
                              : "translate-x-0 bg-foreground/70"
                          )}
                        />
                      </button>
                    </div>
                  )}

                  {spansPayPeriods && (
                    <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-muted/50 border border-border/40">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        This request spans pay periods. Days will be split across payroll cycles automatically.
                      </span>
                    </div>
                  )}

                  {holidaysInRange.length > 0 && (
                    <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        <span className="font-medium">Includes {holidaysInRange.length} holiday{holidaysInRange.length > 1 ? 's' : ''}:</span>
                        <span className="ml-1">
                          {holidaysInRange.map(h => h.localName).join(', ')}
                        </span>
                        <span className="block mt-0.5 text-amber-600/80 dark:text-amber-400/80">
                          These won't be deducted from your leave balance.
                        </span>
                      </div>
                    </div>
                  )}

                  {validation?.warnings.map((warning, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-2 py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-amber-700 dark:text-amber-300">{warning}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs text-muted-foreground text-center px-4">
            Once approved, this time off will be reflected in your payroll
          </p>
        </div>

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
