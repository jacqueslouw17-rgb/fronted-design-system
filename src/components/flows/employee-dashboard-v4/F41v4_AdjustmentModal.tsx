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
import { F41v4_TimeInput } from './F41v4_TimeInput';

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
  otherCategory: string; // For "Other" category specification
  amount: string;
  receipt: File | null;
}

// Overtime line item type for multi-overtime submissions
interface OvertimeLineItem {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  calculatedHours: number;
}

// Bonus line item type for multi-bonus submissions
interface BonusLineItem {
  id: string;
  amount: string;
  attachment: File | null;
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
    { id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }
  ]);
  
  // Legacy single expense state (kept for compatibility)
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);
  const [expenseNotes, setExpenseNotes] = useState('');
  
  // Overtime form state - multiple line items with date/time
  const [overtimeItems, setOvertimeItems] = useState<OvertimeLineItem[]>([
    { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }
  ]);
  
  // Bonus form state - multiple line items
  const [bonusItems, setBonusItems] = useState<BonusLineItem[]>([
    { id: crypto.randomUUID(), amount: '', attachment: null }
  ]);
  
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track which date popover is open (by item id)
  const [openDatePopoverId, setOpenDatePopoverId] = useState<string | null>(null);


  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }]);
    setExpenseCategory(initialExpenseCategory);
    setExpenseAmount(initialExpenseAmount);
    setExpenseDescription('');
    setExpenseReceipt(null);
    setExpenseNotes('');
    setOvertimeItems([{ id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
    setBonusItems([{ id: crypto.randomUUID(), amount: '', attachment: null }]);
    setErrors({});
  };

  // Expense line item helpers
  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, { id: crypto.randomUUID(), category: '', otherCategory: '', amount: '', receipt: null }]);
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

  // Overtime line item helpers
  const addOvertimeItem = () => {
    setOvertimeItems(prev => [...prev, { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
  };

  const removeOvertimeItem = (id: string) => {
    if (overtimeItems.length === 1) return;
    setOvertimeItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate hours from start/end time
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    // Handle overnight shifts (end time before start time)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100; // Round to 2 decimal places
  };

  const updateOvertimeItem = (id: string, field: keyof OvertimeLineItem, value: string | Date | undefined) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Recalculate hours if time fields changed
      if (field === 'startTime' || field === 'endTime') {
        const startTime = field === 'startTime' ? (value as string) : item.startTime;
        const endTime = field === 'endTime' ? (value as string) : item.endTime;
        updated.calculatedHours = calculateHours(startTime, endTime);
      }
      
      return updated;
    }));
  };

  // Bonus line item helpers
  const addBonusItem = () => {
    setBonusItems(prev => [...prev, { id: crypto.randomUUID(), amount: '', attachment: null }]);
  };

  const removeBonusItem = (id: string) => {
    if (bonusItems.length === 1) return;
    setBonusItems(prev => prev.filter(item => item.id !== id));
  };

  const updateBonusItem = (id: string, field: keyof BonusLineItem, value: string | File | null) => {
    setBonusItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    // If we have onBack callback (came from breakdown drawer), always use it
    if (onBack) {
      handleClose();
      onBack();
      return;
    }
    // Otherwise, if opened with initialType, close instead of going back to selection
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
      setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }]);
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
      // Validate "Other" category requires specification
      if (item.category === 'Other' && !item.otherCategory.trim()) {
        newErrors[`expense_${index}_otherCategory`] = 'Please specify';
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

  const validateOvertimeItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    overtimeItems.forEach((item, index) => {
      if (!item.date) {
        newErrors[`overtime_${index}_date`] = 'Required';
        hasError = true;
      }
      if (!item.startTime) {
        newErrors[`overtime_${index}_startTime`] = 'Required';
        hasError = true;
      }
      if (!item.endTime) {
        newErrors[`overtime_${index}_endTime`] = 'Required';
        hasError = true;
      }
      if (item.startTime && item.endTime && item.calculatedHours <= 0) {
        newErrors[`overtime_${index}_endTime`] = 'End must be after start';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
  };

  const validateBonusItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    bonusItems.forEach((item, index) => {
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`bonus_${index}_amount`] = 'Required';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
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
    if (!validateOvertimeItems()) return;

    // Submit each overtime entry
    overtimeItems.forEach(item => {
      const dateLabel = item.date ? format(item.date, 'MMM d') : '';
      addAdjustment({
        type: 'Overtime',
        label: `${item.calculatedHours}h on ${dateLabel}`,
        amount: null,
        description: `${item.startTime} – ${item.endTime}`,
        hours: item.calculatedHours,
      });
    });

    const totalHours = overtimeItems.reduce((sum, item) => sum + item.calculatedHours, 0);
    const count = overtimeItems.length;
    toast.success(`${count} overtime entr${count > 1 ? 'ies' : 'y'} submitted (${totalHours}h total).`);
    handleClose();
  };

  const handleSubmitBonus = () => {
    if (!validateBonusItems()) return;

    // Submit each bonus item
    bonusItems.forEach((item, index) => {
      addAdjustment({
        type: 'Bonus',
        label: bonusItems.length > 1 ? `Bonus request #${index + 1}` : 'Bonus request',
        amount: parseFloat(item.amount),
        receiptUrl: item.attachment ? URL.createObjectURL(item.attachment) : undefined,
      });
    });

    const count = bonusItems.length;
    const total = bonusItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    toast.success(`${count} bonus request${count > 1 ? 's' : ''} submitted for review.`);
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
                {selectedType === null && 'Request adjustments'}
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
                          onValueChange={(val) => {
                            updateExpenseItem(item.id, 'category', val);
                            // Clear otherCategory if switching away from Other
                            if (val !== 'Other') {
                              updateExpenseItem(item.id, 'otherCategory', '');
                            }
                          }}
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

                    {/* Other category specification - show only when "Other" is selected */}
                    {item.category === 'Other' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Specify category</Label>
                        <Input
                          type="text"
                          placeholder="e.g., Office supplies"
                          value={item.otherCategory}
                          onChange={(e) => updateExpenseItem(item.id, 'otherCategory', e.target.value)}
                          className={cn(
                            "h-9",
                            errors[`expense_${index}_otherCategory`] && 'border-destructive'
                          )}
                        />
                        {errors[`expense_${index}_otherCategory`] && (
                          <p className="text-xs text-destructive">{errors[`expense_${index}_otherCategory`]}</p>
                        )}
                      </div>
                    )}

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

          {/* Overtime Form - Multiple Items with Date/Time */}
          {selectedType === 'overtime' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              {/* Overtime Line Items */}
              <div className="space-y-3">
                {overtimeItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button - only show if more than 1 item */}
                    {overtimeItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOvertimeItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}

                    {/* Item number badge */}
                    {overtimeItems.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Entry {index + 1}
                        </span>
                      </div>
                    )}

                    {/* Date picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Date</Label>
                      <Popover 
                        open={openDatePopoverId === item.id} 
                        onOpenChange={(open) => setOpenDatePopoverId(open ? item.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-9 justify-start text-left font-normal",
                              !item.date && "text-muted-foreground",
                              errors[`overtime_${index}_date`] && 'border-destructive'
                            )}
                          >
                            {item.date ? format(item.date, 'PPP') : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={item.date}
                            onSelect={(date) => {
                              updateOvertimeItem(item.id, 'date', date);
                              setOpenDatePopoverId(null); // Auto-close on selection
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Start & End Time row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Start time</Label>
                        <F41v4_TimeInput
                          value={item.startTime}
                          onChange={(val) => updateOvertimeItem(item.id, 'startTime', val)}
                          hasError={!!errors[`overtime_${index}_startTime`]}
                        />
                        {errors[`overtime_${index}_startTime`] && (
                          <p className="text-xs text-destructive">{errors[`overtime_${index}_startTime`]}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">End time</Label>
                        <F41v4_TimeInput
                          value={item.endTime}
                          onChange={(val) => updateOvertimeItem(item.id, 'endTime', val)}
                          hasError={!!errors[`overtime_${index}_endTime`]}
                        />
                        {errors[`overtime_${index}_endTime`] && (
                          <p className="text-xs text-destructive">{errors[`overtime_${index}_endTime`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Auto-calculated hours display */}
                    {item.calculatedHours > 0 && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-xs text-muted-foreground">Duration</span>
                        <span className="text-sm font-semibold text-primary tabular-nums">
                          {item.calculatedHours}h
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add another overtime button */}
                <button
                  type="button"
                  onClick={addOvertimeItem}
                  className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span>
                  Add another entry
                </button>
              </div>

              {/* Total summary - only show if multiple items or hours calculated */}
              {(overtimeItems.length > 1 || overtimeItems.some(item => item.calculatedHours > 0)) && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-sm text-muted-foreground">
                    Total {overtimeItems.length > 1 ? `(${overtimeItems.length} entries)` : ''}
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {overtimeItems.reduce((sum, item) => sum + item.calculatedHours, 0)}h
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Overtime is reviewed by your company before payroll approval. Rate per company policy.
              </p>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitOvertime} className="flex-1">
                  Submit {overtimeItems.length > 1 ? `${overtimeItems.length} entries` : 'request'}
                </Button>
              </div>
            </div>
          )}

          {/* Bonus Form - Multiple Items */}
          {selectedType === 'bonus-correction' && (
            <div className="space-y-5">
              <PayPeriodBadge />

              {/* Bonus Line Items */}
              <div className="space-y-3">
                {bonusItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button - only show if more than 1 item */}
                    {bonusItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBonusItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}

                    {/* Item number badge */}
                    {bonusItems.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Bonus {index + 1}
                        </span>
                      </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Amount ({currency})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => updateBonusItem(item.id, 'amount', e.target.value)}
                        className={cn(
                          "h-9",
                          errors[`bonus_${index}_amount`] && 'border-destructive'
                        )}
                      />
                      {errors[`bonus_${index}_amount`] && (
                        <p className="text-xs text-destructive">{errors[`bonus_${index}_amount`]}</p>
                      )}
                    </div>

                    {/* Attachment upload - compact */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Attachment (optional)</Label>
                      {item.attachment ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                          {item.attachment.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs text-foreground truncate flex-1">
                            {item.attachment.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateBonusItem(item.id, 'attachment', null)}
                            className="p-1 rounded hover:bg-muted"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload document</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateBonusItem(item.id, 'attachment', file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add another bonus button */}
                <button
                  type="button"
                  onClick={addBonusItem}
                  className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span>
                  Add another bonus
                </button>
              </div>

              {/* Total summary - only show if multiple items or has amount */}
              {(bonusItems.length > 1 || bonusItems.some(item => item.amount)) && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-sm text-muted-foreground">
                    Total {bonusItems.length > 1 ? `(${bonusItems.length} requests)` : ''}
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {currency} {bonusItems
                      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                This request is subject to admin approval before being included.
              </p>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitBonus} className="flex-1">
                  Submit {bonusItems.length > 1 ? `${bonusItems.length} requests` : 'request'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
