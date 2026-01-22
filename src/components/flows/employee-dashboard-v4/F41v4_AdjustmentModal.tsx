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
import { useF41v4_DashboardStore, type LeaveRequest } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, CalendarIcon, ArrowLeft, Plane, Receipt, Clock, Gift, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// TimeOffSummary component - read-only display of *approved* leave impacting this pay period.
// Always renders (with a calm placeholder) so employees can find it reliably.
const TimeOffSummary = ({ leaveRequests }: { leaveRequests: LeaveRequest[] }) => {
  const approvedLeave = leaveRequests.filter((l) => l.status === 'Admin approved');
  const totalApprovedDays = approvedLeave.reduce((sum, l) => sum + l.totalDays, 0);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.toDateString() === end.toDateString()) return format(start, 'MMM d');
    return `${format(start, 'MMM d')}–${format(end, 'd')}`;
  };

  return (
    <section
      aria-label="Approved time off summary"
      className="p-4 rounded-xl border border-border/60 bg-card/50"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/40">
          <Plane className="h-5 w-5 text-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Time off</p>
              <p className="text-xs text-muted-foreground">Approved (this pay period)</p>
            </div>

            {approvedLeave.length > 0 && (
              <Badge
                variant="outline"
                className="bg-muted/40 text-[10px] px-1.5 py-0"
              >
                <Check className="h-2.5 w-2.5 mr-0.5" />
                {totalApprovedDays} {totalApprovedDays === 1 ? 'day' : 'days'} approved
              </Badge>
            )}
          </div>

          {approvedLeave.length > 0 ? (
            <div className="space-y-1.5 mt-3">
              {approvedLeave.slice(0, 3).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{leave.leaveType}</span>
                  <span className="text-foreground font-medium tabular-nums shrink-0">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </span>
                </div>
              ))}
              {approvedLeave.length > 3 && (
                <p className="text-[11px] text-muted-foreground">
                  +{approvedLeave.length - 3} more
                </p>
              )}

              <p className="text-[11px] text-muted-foreground/70 mt-3 pt-2 border-t border-border/30">
                This is already approved and will be included in payroll.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-foreground">No approved time off this period</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pending requests stay in the dashboard until approved.
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-2">
                Example: 2 days approved · Jan 12–13
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export type RequestType = 'leave' | 'expense' | 'overtime' | 'bonus-correction' | null;

interface F41v4_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  initialType?: RequestType;
  onBack?: () => void; // Called when back is pressed at type selection level
}

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];


// Pay period bounds (mock - in real app would come from store)
const payPeriodStart = new Date(2026, 0, 1); // Jan 1, 2026
const payPeriodEnd = new Date(2026, 0, 31); // Jan 31, 2026
const payPeriodLabel = 'Jan 1 – Jan 31';

const requestTypeOptions = [
  { 
    id: 'expense' as RequestType, 
    label: 'Expense', 
    description: 'Submit a reimbursement',
    icon: Receipt,
    disabled: false 
  },
  { 
    id: 'overtime' as RequestType, 
    label: 'Overtime', 
    description: 'Log extra hours',
    icon: Clock,
    disabled: false 
  },
  { 
    id: 'bonus-correction' as RequestType, 
    label: 'Bonus', 
    description: 'Request a bonus',
    icon: Gift,
    disabled: false 
  },
];

export const F41v4_AdjustmentModal = ({ open, onOpenChange, currency, initialType = null, onBack }: F41v4_AdjustmentModalProps) => {
  const { addAdjustment, leaveRequests } = useF41v4_DashboardStore();
  
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
  
  
  const [errors, setErrors] = useState<Record<string, string>>({});


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
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    // If we're at type selection level and have onBack, call it
    if (selectedType === null && onBack) {
      handleClose();
      onBack();
      return;
    }
    // If opened with initialType, close instead of going back to selection
    if (initialType) {
      handleClose();
    } else {
      setSelectedType(null);
      setErrors({});
    }
  };

  // Check if we should show back arrow at type selection level
  const showBackAtSelection = selectedType === null && onBack;

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
            {(selectedType || showBackAtSelection) && (
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
                {selectedType === 'leave' && 'Log time off'}
                {selectedType === 'expense' && 'Expense request'}
                {selectedType === 'overtime' && 'Overtime request'}
                {selectedType === 'bonus-correction' && 'Bonus request'}
              </SheetTitle>
              <SheetDescription>
                {selectedType === null && 'Request a change for this pay period.'}
                {selectedType === 'leave' && 'Log approved time off so payroll reflects it correctly.'}
                {selectedType === 'expense' && 'Submit an expense for reimbursement.'}
                {selectedType === 'overtime' && 'Log overtime hours worked.'}
                {selectedType === 'bonus-correction' && 'Request a bonus for this pay period.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6">
          {/* Type Selection Grid */}
          {selectedType === null && (
            <div className="space-y-4">
              {/* Approved Time Off - Read-only summary */}
              <TimeOffSummary leaveRequests={leaveRequests} />
              
              {/* Adjustment types */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submit a request</p>
                <div className="grid grid-cols-3 gap-2">
                  {requestTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedType(option.id)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-primary/[0.02] transition-all text-center group"
                      >
                        <div className="p-2.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{option.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
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

          {/* Bonus Form */}
          {selectedType === 'bonus-correction' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              {/* Amount */}
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

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Reason for bonus request"
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
