/**
 * Flow 4.1 — Employee Dashboard v4
 * Request Change Drawer with tile-based type selection
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
import { Input } from '@/components/ui/input';
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
import { useF41v4_DashboardStore, type AdjustmentType, type LeaveType } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, CalendarIcon, ArrowLeft, Plane, Receipt, Clock, Gift, AlertCircle } from 'lucide-react';
import { format, differenceInBusinessDays, isAfter, isBefore, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export type RequestType = 'leave' | 'expense' | 'overtime' | 'bonus-correction' | null;

interface F41v4_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  initialType?: RequestType;
}

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];
const leaveTypes: LeaveType[] = ['Annual leave', 'Sick leave', 'Unpaid leave', 'Other'];

// Pay period bounds (mock - in real app would come from store)
const payPeriodStart = new Date(2026, 0, 1); // Jan 1, 2026
const payPeriodEnd = new Date(2026, 0, 31); // Jan 31, 2026
const payPeriodLabel = 'Jan 1 – Jan 31';

const requestTypeOptions = [
  { 
    id: 'leave' as RequestType, 
    label: 'Leave', 
    description: 'Request time off',
    icon: Plane 
  },
  { 
    id: 'expense' as RequestType, 
    label: 'Expense', 
    description: 'Submit a reimbursement',
    icon: Receipt 
  },
  { 
    id: 'overtime' as RequestType, 
    label: 'Overtime', 
    description: 'Log extra hours',
    icon: Clock 
  },
  { 
    id: 'bonus-correction' as RequestType, 
    label: 'Bonus / Correction', 
    description: 'Request adjustment',
    icon: Gift 
  },
];

export const F41v4_AdjustmentModal = ({ open, onOpenChange, currency, initialType = null }: F41v4_AdjustmentModalProps) => {
  const { addAdjustment, addLeaveRequest, periodLabel } = useF41v4_DashboardStore();
  
  // Selection state
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  
  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);
  const [expenseNotes, setExpenseNotes] = useState('');
  
  // Overtime form state
  const [overtimeHours, setOvertimeHours] = useState('');
  const [overtimeDate, setOvertimeDate] = useState<Date | undefined>(undefined);
  const [overtimeNotes, setOvertimeNotes] = useState('');
  
  // Bonus/Correction form state
  const [bonusCorrectionType, setBonusCorrectionType] = useState<'Bonus' | 'Correction'>('Bonus');
  const [bonusCorrectionAmount, setBonusCorrectionAmount] = useState('');
  const [bonusCorrectionReason, setBonusCorrectionReason] = useState('');
  const [bonusCorrectionAttachment, setBonusCorrectionAttachment] = useState<File | null>(null);
  
  // Leave form state
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual leave');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [leaveReason, setLeaveReason] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if dates are outside pay period
  const isDateOutsidePeriod = (date: Date | undefined) => {
    if (!date) return false;
    return isBefore(date, payPeriodStart) || isAfter(date, payPeriodEnd);
  };
  
  const hasDateWarning = isDateOutsidePeriod(startDate) || isDateOutsidePeriod(endDate);

  // Calculate total days
  const totalDays = startDate && endDate 
    ? Math.max(1, differenceInBusinessDays(endDate, startDate) + 1)
    : 0;

  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseReceipt(null);
    setExpenseNotes('');
    setOvertimeHours('');
    setOvertimeDate(undefined);
    setOvertimeNotes('');
    setBonusCorrectionType('Bonus');
    setBonusCorrectionAmount('');
    setBonusCorrectionReason('');
    setBonusCorrectionAttachment(null);
    setLeaveType('Annual leave');
    setStartDate(undefined);
    setEndDate(undefined);
    setLeaveReason('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    // If opened with initialType, close instead of going back to selection
    if (initialType) {
      handleClose();
    } else {
      setSelectedType(null);
      setErrors({});
    }
  };

  // Set initial type when modal opens
  useEffect(() => {
    if (open && initialType) {
      setSelectedType(initialType);
    }
  }, [open, initialType]);

  // Reset errors when switching types
  useEffect(() => {
    setErrors({});
  }, [selectedType]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: (file: File | null) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Only PDF, JPG, and PNG files are allowed' }));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [fieldName]: 'File must be less than 10MB' }));
      return;
    }

    setFile(file);
    setErrors(prev => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Validation functions
  const validateExpense = () => {
    const newErrors: Record<string, string> = {};
    if (!expenseCategory) newErrors.expenseCategory = 'Category is required';
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) newErrors.expenseAmount = 'Amount must be greater than 0';
    if (!expenseDescription.trim()) newErrors.expenseDescription = 'Description is required';
    if (!expenseReceipt) newErrors.expenseReceipt = 'Receipt is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOvertime = () => {
    const newErrors: Record<string, string> = {};
    if (!overtimeHours || parseFloat(overtimeHours) <= 0) newErrors.overtimeHours = 'Hours must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBonusCorrection = () => {
    const newErrors: Record<string, string> = {};
    if (bonusCorrectionType === 'Bonus') {
      if (!bonusCorrectionAmount || parseFloat(bonusCorrectionAmount) <= 0) {
        newErrors.bonusCorrectionAmount = 'Amount must be greater than 0';
      }
    }
    if (!bonusCorrectionReason.trim()) newErrors.bonusCorrectionReason = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLeave = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handlers
  const handleSubmitExpense = () => {
    if (!validateExpense()) return;

    addAdjustment({
      type: 'Expense',
      label: expenseCategory,
      amount: parseFloat(expenseAmount),
      description: expenseDescription,
      category: expenseCategory,
      receiptUrl: expenseReceipt ? URL.createObjectURL(expenseReceipt) : undefined,
    });

    toast.success("Expense submitted for review.");
    handleClose();
  };

  const handleSubmitOvertime = () => {
    if (!validateOvertime()) return;

    addAdjustment({
      type: 'Overtime',
      label: `${overtimeHours}h`,
      amount: null,
      description: overtimeNotes,
      hours: parseFloat(overtimeHours),
    });

    toast.success("Overtime submitted for review.");
    handleClose();
  };

  const handleSubmitBonusCorrection = () => {
    if (!validateBonusCorrection()) return;

    addAdjustment({
      type: bonusCorrectionType,
      label: bonusCorrectionType === 'Bonus' ? 'Bonus request' : 'Correction',
      amount: bonusCorrectionType === 'Bonus' ? parseFloat(bonusCorrectionAmount) : null,
      description: bonusCorrectionReason,
      receiptUrl: bonusCorrectionAttachment ? URL.createObjectURL(bonusCorrectionAttachment) : undefined,
    });

    toast.success(`${bonusCorrectionType} request submitted for review.`);
    handleClose();
  };

  const handleSubmitLeave = () => {
    if (!validateLeave()) return;

    addLeaveRequest({
      leaveType,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      totalDays,
      reason: leaveReason.trim() || undefined,
    });

    toast.success("Leave request submitted for review.");
    handleClose();
  };

  // Render file upload component
  const renderFileUpload = (
    file: File | null,
    setFile: (file: File | null) => void,
    fieldName: string,
    required: boolean = false
  ) => (
    <div className="space-y-2">
      <Label>{required ? 'Receipt' : 'Attachment (optional)'}</Label>
      {file ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          {file.type === 'application/pdf' ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Image className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className={cn(
          'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
          errors[fieldName] ? 'border-destructive' : 'border-border hover:border-primary/50'
        )}>
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload {required ? 'receipt' : '(optional)'}
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange(e, setFile, fieldName)}
          />
        </label>
      )}
      {errors[fieldName] && <p className="text-xs text-destructive">{errors[fieldName]}</p>}
      <p className="text-xs text-muted-foreground">PDF, JPG, or PNG up to 10MB</p>
    </div>
  );

  // Pay period badge
  const PayPeriodBadge = () => (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/40 mb-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pay period</span>
        <span className="text-sm font-medium text-foreground">{payPeriodLabel}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Requests submitted after the cut-off may be processed in the next payroll.
      </p>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            {selectedType && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <SheetTitle>
                {selectedType === null && 'Request a change'}
                {selectedType === 'leave' && 'Leave request'}
                {selectedType === 'expense' && 'Expense request'}
                {selectedType === 'overtime' && 'Overtime request'}
                {selectedType === 'bonus-correction' && (bonusCorrectionType === 'Bonus' ? 'Bonus request' : 'Correction request')}
              </SheetTitle>
              <SheetDescription>
                {selectedType === null && 'Send a request to be included in this pay period.'}
                {selectedType === 'leave' && 'Request time off for this pay period.'}
                {selectedType === 'expense' && 'Submit an expense for reimbursement.'}
                {selectedType === 'overtime' && 'Log overtime hours worked.'}
                {selectedType === 'bonus-correction' && 'Request a bonus or correction.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6">
          {/* Type Selection Grid */}
          {selectedType === null && (
            <div className="grid grid-cols-2 gap-3">
              {requestTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedType(option.id)}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-primary/[0.02] transition-all text-center group"
                  >
                    <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Leave Form */}
          {selectedType === 'leave' && (
            <div className="space-y-5">
              <PayPeriodBadge />

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

              {/* Date Range */}
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
                        {startDate ? format(startDate, 'MMM d') : 'Select'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
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
                        {endDate ? format(endDate, 'MMM d') : 'Select'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => startDate ? date < startDate : false}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                </div>
              </div>

              {/* Warning if dates outside period */}
              {hasDateWarning && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    This leave falls outside the current payroll period and may be applied next cycle.
                  </p>
                </div>
              )}

              {/* Total Days (read-only) */}
              {startDate && endDate && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total days</span>
                    <span className="text-sm font-medium text-foreground">
                      {totalDays} {totalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason (optional) */}
              <div className="space-y-2">
                <Label htmlFor="leaveReason">Notes (optional)</Label>
                <Textarea
                  id="leaveReason"
                  placeholder="Additional details"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitLeave} className="flex-1">
                  Submit request
                </Button>
              </div>
            </div>
          )}

          {/* Expense Form */}
          {selectedType === 'expense' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger className={cn(errors.expenseCategory && 'border-destructive')}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.expenseCategory && <p className="text-xs text-destructive">{errors.expenseCategory}</p>}
              </div>

              <div className="space-y-2">
                <Label>Amount ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className={cn(errors.expenseAmount && 'border-destructive')}
                />
                {errors.expenseAmount && <p className="text-xs text-destructive">{errors.expenseAmount}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of the expense"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className={cn(errors.expenseDescription && 'border-destructive')}
                  rows={2}
                />
                {errors.expenseDescription && <p className="text-xs text-destructive">{errors.expenseDescription}</p>}
              </div>

              {renderFileUpload(expenseReceipt, setExpenseReceipt, 'expenseReceipt', true)}

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Additional notes"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitExpense} className="flex-1">
                  Submit request
                </Button>
              </div>
            </div>
          )}

          {/* Overtime Form */}
          {selectedType === 'overtime' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="0"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  className={cn(errors.overtimeHours && 'border-destructive')}
                />
                {errors.overtimeHours && <p className="text-xs text-destructive">{errors.overtimeHours}</p>}
              </div>

              <div className="space-y-2">
                <Label>Date worked (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !overtimeDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {overtimeDate ? format(overtimeDate, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={overtimeDate}
                      onSelect={setOvertimeDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Additional details"
                  value={overtimeNotes}
                  onChange={(e) => setOvertimeNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Overtime is reviewed by your company before payroll approval. Rate per company policy.
              </p>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitOvertime} className="flex-1">
                  Submit request
                </Button>
              </div>
            </div>
          )}

          {/* Bonus / Correction Form */}
          {selectedType === 'bonus-correction' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              {/* Type Toggle */}
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBonusCorrectionType('Bonus')}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
                      bonusCorrectionType === 'Bonus'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Bonus
                  </button>
                  <button
                    type="button"
                    onClick={() => setBonusCorrectionType('Correction')}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
                      bonusCorrectionType === 'Correction'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Correction
                  </button>
                </div>
              </div>

              {/* Amount (only for Bonus) */}
              {bonusCorrectionType === 'Bonus' && (
                <div className="space-y-2">
                  <Label>Amount ({currency})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={bonusCorrectionAmount}
                    onChange={(e) => setBonusCorrectionAmount(e.target.value)}
                    className={cn(errors.bonusCorrectionAmount && 'border-destructive')}
                  />
                  {errors.bonusCorrectionAmount && <p className="text-xs text-destructive">{errors.bonusCorrectionAmount}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label>{bonusCorrectionType === 'Bonus' ? 'Description' : 'Describe the correction needed'}</Label>
                <Textarea
                  placeholder={bonusCorrectionType === 'Bonus' ? 'Reason for bonus request' : 'What needs to be corrected?'}
                  value={bonusCorrectionReason}
                  onChange={(e) => setBonusCorrectionReason(e.target.value)}
                  className={cn(errors.bonusCorrectionReason && 'border-destructive')}
                  rows={3}
                />
                {errors.bonusCorrectionReason && <p className="text-xs text-destructive">{errors.bonusCorrectionReason}</p>}
              </div>

              {renderFileUpload(bonusCorrectionAttachment, setBonusCorrectionAttachment, 'bonusCorrectionAttachment', false)}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                This request is subject to admin approval before being included.
              </p>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitBonusCorrection} className="flex-1">
                  Submit request
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
