/**
 * Flow 4.1 — Employee Dashboard v6
 * Request Change Drawer with tile-based type selection
 * INDEPENDENT: This is a complete clone - changes here do NOT affect v5 or any other flow.
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
import { useF41v7_DashboardStore } from '@/stores/F41v7_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, ArrowLeft, Receipt, Clock, Gift, AlertTriangle, CalendarOff } from 'lucide-react';
import { TagInput } from '@/components/flows/shared/TagInput';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { F41v7_TimeInput } from './F41v7_TimeInput';

export type RequestType = 'leave' | 'expense' | 'overtime' | 'bonus-correction' | 'unpaid-leave' | null;

interface F41v7_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  initialType?: RequestType;
  initialExpenseCategory?: string;
  initialExpenseAmount?: string;
  initialHours?: number;
  initialDays?: number; // For unpaid leave
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  rejectedId?: string;
  onBack?: () => void;
}

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

interface ExpenseLineItem {
  id: string;
  category: string;
  otherCategory: string;
  amount: string;
  receipt: File[];
}

interface OvertimeLineItem {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  calculatedHours: number;
}

interface BonusLineItem {
  id: string;
  amount: string;
  attachment: File[];
}


const requestTypeOptions = [
  { 
    id: 'expense' as RequestType, 
    label: 'Expense Reimbursements', 
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
  { 
    id: 'unpaid-leave' as RequestType, 
    label: 'Unpaid Leave', 
    description: 'Request time off without pay',
    icon: CalendarOff,
    disabled: false 
  },
];

export const F41v7_AdjustmentModal = ({ open, onOpenChange, currency, initialType = null, initialExpenseCategory = '', initialExpenseAmount = '', initialHours, initialDays, initialDate, initialStartTime, initialEndTime, rejectedId, onBack }: F41v7_AdjustmentModalProps) => {
  const { addAdjustment, markRejectionResubmitted, adjustments } = useF41v7_DashboardStore();

  const rejectedAdjustment = rejectedId
    ? adjustments.find((adj) => adj.id === rejectedId)
    : undefined;
  const rejectionReason = rejectedAdjustment?.rejectionReason;
  
  const [selectedType, setSelectedType] = useState<RequestType>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: [] }
  ]);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [overtimeItems, setOvertimeItems] = useState<OvertimeLineItem[]>([
    { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }
  ]);
  const [bonusItems, setBonusItems] = useState<BonusLineItem[]>([
    { id: crypto.randomUUID(), amount: '', attachment: [] }
  ]);
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState<string>('');
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDatePopoverId, setOpenDatePopoverId] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: [] }]);
    setExpenseCategory(initialExpenseCategory);
    setExpenseAmount(initialExpenseAmount);
    setExpenseDescription('');
    setExpenseReceipt(null);
    setExpenseNotes('');
    setExpenseTags([]);
    setOvertimeItems([{ id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
    setBonusItems([{ id: crypto.randomUUID(), amount: '', attachment: [] }]);
    setUnpaidLeaveDays(initialDays?.toString() || '');
    setErrors({});
  };

  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, { id: crypto.randomUUID(), category: '', otherCategory: '', amount: '', receipt: [] }]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) return;
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseLineItem, value: string | File[] | null) => {
    setExpenseItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addOvertimeItem = () => {
    setOvertimeItems(prev => [...prev, { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
  };

  const removeOvertimeItem = (id: string) => {
    if (overtimeItems.length === 1) return;
    setOvertimeItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  const updateOvertimeItem = (id: string, field: keyof OvertimeLineItem, value: string | Date | undefined) => {
    setOvertimeItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      if (field === 'startTime' || field === 'endTime') {
        const startTime = field === 'startTime' ? (value as string) : item.startTime;
        const endTime = field === 'endTime' ? (value as string) : item.endTime;
        updated.calculatedHours = calculateHours(startTime, endTime);
      }
      
      return updated;
    }));
  };

  const addBonusItem = () => {
    setBonusItems(prev => [...prev, { id: crypto.randomUUID(), amount: '', attachment: [] }]);
  };

  const removeBonusItem = (id: string) => {
    if (bonusItems.length === 1) return;
    setBonusItems(prev => prev.filter(item => item.id !== id));
  };

  const updateBonusItem = (id: string, field: keyof BonusLineItem, value: string | File[] | null) => {
    setBonusItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) {
      handleClose();
      onBack();
      return;
    }
    if (initialType) {
      handleClose();
    } else {
      setSelectedType(null);
      setErrors({});
    }
  };

  const showBackAtSelection = selectedType === null && onBack;

  useEffect(() => {
    if (open && initialType) {
      setSelectedType(initialType);
    }
    if (open && initialType === 'expense' && (initialExpenseCategory || initialExpenseAmount)) {
      setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: [] }]);
    }
    // Pre-fill bonus amount for resubmissions
    if (open && initialType === 'bonus-correction' && initialExpenseAmount) {
      setBonusItems([{ id: crypto.randomUUID(), amount: initialExpenseAmount, attachment: [] }]);
    }
    // Pre-fill overtime hours for resubmissions
    if (open && initialType === 'overtime') {
      const parsedDate = initialDate ? new Date(initialDate) : undefined;
      setOvertimeItems([{ 
        id: crypto.randomUUID(), 
        date: parsedDate, 
        startTime: initialStartTime || '', 
        endTime: initialEndTime || '', 
        calculatedHours: initialHours || 0 
      }]);
    }
    // Pre-fill unpaid leave days for resubmissions
    if (open && initialType === 'unpaid-leave' && initialDays) {
      setUnpaidLeaveDays(initialDays.toString());
    }
  }, [open, initialType, initialExpenseCategory, initialExpenseAmount, initialHours, initialDays, initialDate, initialStartTime, initialEndTime]);

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

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Only PDF, JPG, and PNG files are allowed' }));
      return;
    }

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

  const validateExpenseItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    expenseItems.forEach((item, index) => {
      if (!item.category) {
        newErrors[`expense_${index}_category`] = 'Required';
        hasError = true;
      }
      if (item.category === 'Other' && !item.otherCategory.trim()) {
        newErrors[`expense_${index}_otherCategory`] = 'Please specify';
        hasError = true;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`expense_${index}_amount`] = 'Required';
        hasError = true;
      }
      if (item.receipt.length === 0) {
        newErrors[`expense_${index}_receipt`] = 'At least one document required';
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

  const validateUnpaidLeave = () => {
    const newErrors: Record<string, string> = {};
    const days = parseFloat(unpaidLeaveDays);
    
    if (!unpaidLeaveDays || isNaN(days) || days <= 0) {
      newErrors['unpaid_leave_days'] = 'Please enter valid number of days';
    } else if (days > 30) {
      newErrors['unpaid_leave_days'] = 'Maximum 30 days allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitExpenses = () => {
    if (!validateExpenseItems()) return;

    const totalAmount = expenseItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const count = expenseItems.length;
    const categories = [...new Set(expenseItems.map(i => i.category))];
    const label = count === 1
      ? expenseItems[0].category
      : `${count} expenses (${categories.join(', ')})`;

    addAdjustment({
      type: 'Expense',
      label,
      amount: totalAmount,
      category: categories[0],
      receiptUrl: expenseItems[0].receipt.length > 0 ? URL.createObjectURL(expenseItems[0].receipt[0]) : undefined,
      tags: expenseTags.length > 0 ? expenseTags : undefined,
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    toast.success(`${count} expense${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
    
    if (onBack) {
      onBack();
    }
  };

  const handleSubmitOvertime = () => {
    if (!validateOvertimeItems()) return;

    const totalHours = overtimeItems.reduce((sum, item) => sum + item.calculatedHours, 0);
    const count = overtimeItems.length;
    const label = count === 1
      ? `${overtimeItems[0].calculatedHours}h on ${overtimeItems[0].date ? format(overtimeItems[0].date, 'MMM d') : ''}`
      : `${totalHours}h overtime (${count} entries)`;

    addAdjustment({
      type: 'Overtime',
      label,
      amount: null,
      hours: totalHours,
      date: overtimeItems[0].date ? format(overtimeItems[0].date, 'yyyy-MM-dd') : undefined,
      startTime: overtimeItems[0].startTime,
      endTime: overtimeItems[0].endTime,
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    toast.success(`${count} overtime entr${count > 1 ? 'ies' : 'y'} submitted (${totalHours}h total).`);
    handleClose();
  };

  const handleSubmitBonus = () => {
    if (!validateBonusItems()) return;

    const totalAmount = bonusItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const count = bonusItems.length;
    const label = count === 1 ? 'Bonus request' : `${count} bonus requests`;

    addAdjustment({
      type: 'Bonus',
      label,
      amount: totalAmount,
      receiptUrl: bonusItems[0].attachment.length > 0 ? URL.createObjectURL(bonusItems[0].attachment[0]) : undefined,
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    toast.success(`${count} bonus request${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
  };

  // Round to nearest 0.5
  const roundToNearestHalf = (value: number): number => {
    return Math.round(value * 2) / 2;
  };

  const handleSubmitUnpaidLeave = () => {
    if (!validateUnpaidLeave()) return;

    const rawDays = parseFloat(unpaidLeaveDays);
    const roundedDays = roundToNearestHalf(rawDays);
    const wasRounded = rawDays !== roundedDays;

    addAdjustment({
      type: 'Unpaid Leave',
      label: `${roundedDays} day${roundedDays !== 1 ? 's' : ''} unpaid leave`,
      amount: null,
      days: roundedDays,
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    if (wasRounded) {
      toast.success(`Unpaid leave request submitted for review.`, {
        description: `Days rounded from ${rawDays} to ${roundedDays} (nearest half day).`,
      });
    } else {
      toast.success(`Unpaid leave request submitted for review.`);
    }
    handleClose();
  };

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
                {selectedType === 'unpaid-leave' && 'Unpaid leave'}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {selectedType === null && 'Submit an adjustment for the current pay cycle'}
                {selectedType === 'expense' && 'Submit expenses for reimbursement'}
                {selectedType === 'overtime' && 'Log your overtime hours'}
                {selectedType === 'bonus-correction' && 'Request a bonus payment'}
                {selectedType === 'unpaid-leave' && 'Request time off without pay'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
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

          {/* Type Selection */}
          {selectedType === null && (
            <div className="grid grid-cols-1 gap-3">
              {requestTypeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !option.disabled && setSelectedType(option.id)}
                  disabled={option.disabled}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    option.disabled
                      ? "opacity-50 cursor-not-allowed border-border/40"
                      : "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]"
                  )}
                >
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Expense Form */}
          {selectedType === 'expense' && (
            <div className="space-y-5">
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

                    {/* Other category specification */}
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

                    {/* Attachments - multi upload */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Attachments</Label>
                      {/* Uploaded files list */}
                      {item.receipt.length > 0 && (
                        <div className="space-y-1.5">
                          {item.receipt.map((file, fileIdx) => (
                            <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="text-xs flex-1 truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = item.receipt.filter((_, i) => i !== fileIdx);
                                  updateExpenseItem(item.id, 'receipt', updated);
                                }}
                                className="p-0.5 hover:bg-muted rounded shrink-0"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Upload trigger */}
                      <label className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed cursor-pointer transition-colors",
                        errors[`expense_${index}_receipt`] 
                          ? "border-destructive bg-destructive/5" 
                          : "border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]"
                      )}>
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.receipt.length === 0 ? 'Upload documents' : 'Add more'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              updateExpenseItem(item.id, 'receipt', [...item.receipt, ...files]);
                              setErrors(prev => {
                                const { [`expense_${index}_receipt`]: _, ...rest } = prev;
                                return rest;
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {errors[`expense_${index}_receipt`] && <p className="text-[11px] text-destructive">{errors[`expense_${index}_receipt`]}</p>}
                      <p className="text-[11px] text-muted-foreground/70">Receipts, invoices, or any proof of purchase — PDF, JPG, PNG</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another expense button */}
              <button
                type="button"
                onClick={addExpenseItem}
                className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                Add another expense
              </button>

              {/* Tags (optional) */}
              <TagInput tags={expenseTags} onChange={setExpenseTags} />

              {expenseItems.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session total</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {currency} {expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitExpenses} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Overtime Form */}
          {selectedType === 'overtime' && (
            <div className="space-y-5">
              <div className="space-y-3">
                {overtimeItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >

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
                              errors[`overtime_${index}_date`] && "border-destructive"
                            )}
                          >
                            {item.date ? format(item.date, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={item.date}
                            onSelect={(date) => {
                              updateOvertimeItem(item.id, 'date', date);
                              setOpenDatePopoverId(null);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Start & End Time row */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start time</Label>
                        <F41v7_TimeInput
                            value={item.startTime}
                            onChange={(value) => updateOvertimeItem(item.id, 'startTime', value)}
                            hasError={!!errors[`overtime_${index}_startTime`]}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">End time</Label>
                          <F41v7_TimeInput
                            value={item.endTime}
                            onChange={(value) => updateOvertimeItem(item.id, 'endTime', value)}
                            hasError={!!errors[`overtime_${index}_endTime`]}
                          />
                          {errors[`overtime_${index}_endTime`] && (
                            <p className="text-xs text-destructive">{errors[`overtime_${index}_endTime`]}</p>
                          )}
                        </div>
                      </div>
                      {/* Timezone indicator */}
                      <p className="text-[11px] text-muted-foreground">
                        Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                      </p>
                    </div>

                    {/* Hours badge */}
                    {item.calculatedHours > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.calculatedHours}h calculated
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {overtimeItems.some(item => item.calculatedHours > 0) && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total hours</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {overtimeItems.reduce((sum, item) => sum + item.calculatedHours, 0)}h
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitOvertime} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Bonus Form */}
          {selectedType === 'bonus-correction' && (
            <div className="space-y-5">
              <div className="space-y-3">
                {bonusItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button */}
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

                    {/* Attachment upload - optional, multi */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Attachment (optional)</Label>
                      {item.attachment.length > 0 && (
                        <div className="space-y-1.5">
                          {item.attachment.map((file, fileIdx) => (
                            <div key={fileIdx} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="text-xs flex-1 truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = item.attachment.filter((_, i) => i !== fileIdx);
                                  updateBonusItem(item.id, 'attachment', updated);
                                }}
                                className="p-0.5 hover:bg-muted rounded shrink-0"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.attachment.length === 0 ? 'Upload files' : 'Add more'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              updateBonusItem(item.id, 'attachment', [...item.attachment, ...files]);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another bonus button */}
              <button
                type="button"
                onClick={addBonusItem}
                className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                Add another bonus
              </button>

              {bonusItems.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session total</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {currency} {bonusItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitBonus} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Unpaid Leave Form */}
          {selectedType === 'unpaid-leave' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Number of days</Label>
                  <Input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={unpaidLeaveDays}
                    onChange={(e) => setUnpaidLeaveDays(e.target.value)}
                    placeholder="e.g. 2"
                    className={cn(
                      "h-9",
                      errors['unpaid_leave_days'] && 'border-destructive'
                    )}
                  />
                  {errors['unpaid_leave_days'] && (
                    <p className="text-xs text-destructive">{errors['unpaid_leave_days']}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supports half days (e.g. 1.5)
                  </p>
                </div>
              </div>

              <Button onClick={handleSubmitUnpaidLeave} className="w-full">
                Request unpaid leave
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
