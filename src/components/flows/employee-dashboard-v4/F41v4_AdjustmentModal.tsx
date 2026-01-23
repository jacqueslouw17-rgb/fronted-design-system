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
import { useF41v4_DashboardStore } from '@/stores/F41v4_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, ArrowLeft, Receipt, Clock, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Note: TimeOffSummary has been moved to the main dashboard TimeOffSection component.
// This modal now only handles payroll-related adjustments (expense/overtime/bonus).

export type RequestType = 'leave' | 'expense' | 'overtime' | 'bonus-correction' | null;

interface F41v4_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  initialType?: RequestType;
  initialExpenseCategory?: string; // Pre-fill expense category (e.g., for resubmit)
  initialExpenseAmount?: string; // Pre-fill expense amount (e.g., for resubmit)
  onBack?: () => void; // Called when back is pressed at type selection level
}

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

// Expense line item type for multi-expense submissions
interface ExpenseLineItem {
  id: string;
  category: string;
  amount: string;
  receipt: File | null;
}


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

export const F41v4_AdjustmentModal = ({ open, onOpenChange, currency, initialType = null, initialExpenseCategory = '', initialExpenseAmount = '', onBack }: F41v4_AdjustmentModalProps) => {
  const { addAdjustment } = useF41v4_DashboardStore();
  
  // Selection state
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  
  // Expense form state - multiple line items
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: initialExpenseCategory, amount: initialExpenseAmount, receipt: null }
  ]);
  
  // Legacy single expense state (kept for compatibility)
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
    setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, amount: initialExpenseAmount, receipt: null }]);
    setExpenseCategory(initialExpenseCategory);
    setExpenseAmount(initialExpenseAmount);
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

  // Expense line item helpers
  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, { id: crypto.randomUUID(), category: '', amount: '', receipt: null }]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) return;
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseLineItem, value: string | File | null) => {
    setExpenseItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
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

  // Set initial type and pre-fill when modal opens
  useEffect(() => {
    if (open && initialType) {
      setSelectedType(initialType);
    }
    if (open && (initialExpenseCategory || initialExpenseAmount)) {
      setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, amount: initialExpenseAmount, receipt: null }]);
    }
  }, [open, initialType, initialExpenseCategory, initialExpenseAmount]);

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
  const validateExpenseItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    expenseItems.forEach((item, index) => {
      if (!item.category) {
        newErrors[`expense_${index}_category`] = 'Required';
        hasError = true;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`expense_${index}_amount`] = 'Required';
        hasError = true;
      }
      if (!item.receipt) {
        newErrors[`expense_${index}_receipt`] = 'Receipt required';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Submit handlers
  const handleSubmitExpenses = () => {
    if (!validateExpenseItems()) return;

    // Submit each expense item
    expenseItems.forEach(item => {
      addAdjustment({
        type: 'Expense',
        label: item.category,
        amount: parseFloat(item.amount),
        category: item.category,
        receiptUrl: item.receipt ? URL.createObjectURL(item.receipt) : undefined,
      });
    });

    const count = expenseItems.length;
    toast.success(`${count} expense${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
    
    // If opened from breakdown drawer, return to it
    if (onBack) {
      onBack();
    }
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
                {selectedType === 'expense' && 'Expense request'}
                {selectedType === 'overtime' && 'Overtime request'}
                {selectedType === 'bonus-correction' && 'Bonus request'}
              </SheetTitle>
              <SheetDescription>
                {selectedType === null && 'Submit expenses, overtime, or bonus requests for this pay period.'}
                {selectedType === 'expense' && 'Submit an expense for reimbursement.'}
                {selectedType === 'overtime' && 'Log overtime hours worked.'}
                {selectedType === 'bonus-correction' && 'Request a bonus for this pay period.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6">
          {/* Type Selection Grid - Payroll adjustments only (Time off is on main dashboard) */}
          {selectedType === null && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What would you like to submit?</p>
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
          )}


          {/* Expense Form - Multiple Items */}
          {selectedType === 'expense' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              {/* Expense Line Items */}
              <div className="space-y-3">
                {expenseItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button - only show if more than 1 item */}
                    {expenseItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpenseItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}

                    {/* Item number badge */}
                    {expenseItems.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Expense {index + 1}
                        </span>
                      </div>
                    )}

                    {/* Category & Amount row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Category</Label>
                        <Select 
                          value={item.category} 
                          onValueChange={(val) => updateExpenseItem(item.id, 'category', val)}
                        >
                          <SelectTrigger className={cn(
                            "h-9",
                            errors[`expense_${index}_category`] && 'border-destructive'
                          )}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Amount ({currency})</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(item.id, 'amount', e.target.value)}
                          className={cn(
                            "h-9",
                            errors[`expense_${index}_amount`] && 'border-destructive'
                          )}
                        />
                      </div>
                    </div>

                    {/* Receipt upload - compact */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Receipt</Label>
                      {item.receipt ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                          {item.receipt.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs text-foreground truncate flex-1">
                            {item.receipt.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateExpenseItem(item.id, 'receipt', null)}
                            className="p-1 rounded hover:bg-muted"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ) : (
                        <label className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border border-dashed cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]",
                          errors[`expense_${index}_receipt`] ? 'border-destructive' : 'border-border/60'
                        )}>
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload receipt</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateExpenseItem(item.id, 'receipt', file);
                                setErrors(prev => {
                                  const { [`expense_${index}_receipt`]: _, ...rest } = prev;
                                  return rest;
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add another expense button */}
                <button
                  type="button"
                  onClick={addExpenseItem}
                  className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span>
                  Add another expense
                </button>
              </div>

              {/* Total summary - only show if multiple items */}
              {expenseItems.length > 1 && expenseItems.some(item => item.amount) && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-sm text-muted-foreground">Total ({expenseItems.length} items)</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {currency} {expenseItems
                      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitExpenses} className="flex-1">
                  Submit {expenseItems.length > 1 ? `${expenseItems.length} expenses` : 'expense'}
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
