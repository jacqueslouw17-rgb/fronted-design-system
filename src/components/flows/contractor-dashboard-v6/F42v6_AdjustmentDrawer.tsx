/**
 * Flow 4.2 — Contractor Dashboard v6
 * Request Adjustment Drawer (right-side panel)
 * 
 * ALIGNED: Matches F41v6_AdjustmentModal layout patterns.
 * - Single column horizontal tiles with descriptions
 * - Batch expense support with multiple line items
 * - Simplified forms (removed notes/description fields)
 * 
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useF42v6_DashboardStore, type F42v6_ContractType } from '@/stores/F42v6_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, ArrowLeft, Receipt, Clock, Gift, AlertTriangle } from 'lucide-react';
import { TagInput } from '@/components/flows/shared/TagInput';
import { F41v6_TimeInput } from '@/components/flows/employee-dashboard-v6/F41v6_TimeInput';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export type ContractorRequestType = 'expense' | 'additional-hours' | 'bonus' | 'correction' | null;

interface F42v6_AdjustmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  contractType: F42v6_ContractType;
  initialType?: ContractorRequestType;
  initialExpenseCategory?: string;
  initialExpenseAmount?: string;
  initialHours?: number;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  rejectedId?: string;
  onBack?: () => void;
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

// Additional hours line item for multi-entry submissions
interface AdditionalHoursLineItem {
  id: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  calculatedHours: number;
}

// Commission line item for multi-entry submissions
interface CommissionLineItem {
  id: string;
  amount: string;
  attachment: File | null;
}
const getRequestTypeOptions = (contractType: F42v6_ContractType) => {
  const options = [
    { 
      id: 'expense' as ContractorRequestType, 
      label: 'Expense Reimbursements', 
      description: 'Submit a reimbursement',
      icon: Receipt,
      disabled: false
    },
    { 
      id: 'bonus' as ContractorRequestType, 
      label: 'Commission', 
      description: 'Request additional pay',
      icon: Gift,
      disabled: false
    },
  ];
  
  // Only show Additional hours for hourly contracts
  if (contractType === 'hourly') {
    options.splice(1, 0, {
      id: 'additional-hours' as ContractorRequestType,
      label: 'Additional hours',
      description: 'Log extra time',
      icon: Clock,
      disabled: false
    });
  }
  
  return options;
};

export const F42v6_AdjustmentDrawer = ({ 
  open, 
  onOpenChange, 
  currency, 
  contractType,
  initialType = null,
  initialExpenseCategory = '',
  initialExpenseAmount = '',
  initialHours,
  initialDate,
  initialStartTime,
  initialEndTime,
  rejectedId,
  onBack 
}: F42v6_AdjustmentDrawerProps) => {
  const { addAdjustment, markRejectionResubmitted, adjustments } = useF42v6_DashboardStore();

  const rejectedAdjustment = rejectedId
    ? adjustments.find((adj) => adj.id === rejectedId)
    : undefined;
  const rejectionReason = rejectedAdjustment?.rejectionReason;
  
  // Selection state
  const [selectedType, setSelectedType] = useState<ContractorRequestType>(null);
  
  // Expense form state - multiple line items
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>([
    { id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }
  ]);
  
  // Additional hours form state - multiple line items
  const [additionalHoursItems, setAdditionalHoursItems] = useState<AdditionalHoursLineItem[]>([
    { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }
  ]);
  
  // Commission form state - multiple line items
  const [commissionItems, setCommissionItems] = useState<CommissionLineItem[]>([
    { id: crypto.randomUUID(), amount: '', attachment: null }
  ]);
  
  // Correction form state
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [correctionAttachment, setCorrectionAttachment] = useState<File | null>(null);
  
  const [expenseTags, setExpenseTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track which date popover is open (by item id)
  const [openDatePopoverId, setOpenDatePopoverId] = useState<string | null>(null);

  const requestTypeOptions = getRequestTypeOptions(contractType);

  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }]);
    setAdditionalHoursItems([{ id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
    setCommissionItems([{ id: crypto.randomUUID(), amount: '', attachment: null }]);
    setCorrectionDescription('');
    setCorrectionAttachment(null);
    setExpenseTags([]);
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

  // Additional hours line item helpers
  const addAdditionalHoursItem = () => {
    setAdditionalHoursItems(prev => [...prev, { id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
  };

  const removeAdditionalHoursItem = (id: string) => {
    if (additionalHoursItems.length === 1) return;
    setAdditionalHoursItems(prev => prev.filter(item => item.id !== id));
  };

  const updateAdditionalHoursItem = (id: string, field: keyof AdditionalHoursLineItem, value: Date | undefined | string | number) => {
    setAdditionalHoursItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      // Auto-calculate hours when times change
      if (field === 'startTime' || field === 'endTime') {
        updated.calculatedHours = calculateHours(
          field === 'startTime' ? value as string : item.startTime,
          field === 'endTime' ? value as string : item.endTime
        );
      }
      
      return updated;
    }));
  };

  // Commission line item helpers
  const addCommissionItem = () => {
    setCommissionItems(prev => [...prev, { id: crypto.randomUUID(), amount: '', attachment: null }]);
  };

  const removeCommissionItem = (id: string) => {
    if (commissionItems.length === 1) return;
    setCommissionItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCommissionItem = (id: string, field: keyof CommissionLineItem, value: string | File | null) => {
    setCommissionItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Calculate hours from start/end time
  const calculateHours = (start: string, end: string): number => {
    if (!start || !end || start.length < 5 || end.length < 5) return 0;
    
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return Math.round((endMinutes - startMinutes) / 60 * 100) / 100;
  };

  // Calculate total additional hours
  const totalAdditionalHours = additionalHoursItems.reduce((sum, item) => sum + item.calculatedHours, 0);

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

  // Set initial type and pre-fill when drawer opens
  useEffect(() => {
    if (open && initialType) {
      setSelectedType(initialType);
    }
    if (open && initialType === 'expense' && (initialExpenseCategory || initialExpenseAmount)) {
      setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }]);
    }
    // Pre-fill commission amount for resubmissions
    if (open && initialType === 'bonus' && initialExpenseAmount) {
      setCommissionItems([{ id: crypto.randomUUID(), amount: initialExpenseAmount, attachment: null }]);
    }
    // Pre-fill additional hours for resubmissions
    if (open && initialType === 'additional-hours') {
      const parsedDate = initialDate ? new Date(initialDate) : undefined;
      setAdditionalHoursItems([{ 
        id: crypto.randomUUID(), 
        date: parsedDate, 
        startTime: initialStartTime || '', 
        endTime: initialEndTime || '', 
        calculatedHours: initialHours || 0 
      }]);
    }
  }, [open, initialType, initialExpenseCategory, initialExpenseAmount, initialHours, initialDate, initialStartTime, initialEndTime]);

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

  const validateAdditionalHoursItems = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    additionalHoursItems.forEach((item, index) => {
      if (!item.date) {
        newErrors[`additional_${index}_date`] = 'Required';
        hasError = true;
      }
      if (!item.startTime || item.startTime.length < 5) {
        newErrors[`additional_${index}_startTime`] = 'Required';
        hasError = true;
      }
      if (!item.endTime || item.endTime.length < 5) {
        newErrors[`additional_${index}_endTime`] = 'Required';
        hasError = true;
      }
      if (item.startTime && item.endTime && item.calculatedHours <= 0) {
        newErrors[`additional_${index}_endTime`] = 'End must be after start';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
  };

  const validateCommission = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;
    
    commissionItems.forEach((item, index) => {
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`commission_${index}_amount`] = 'Amount must be greater than 0';
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    return !hasError;
  };

  const validateCorrection = () => {
    const newErrors: Record<string, string> = {};
    if (!correctionDescription.trim()) newErrors.correctionDescription = 'Requested change is required';
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

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    const count = expenseItems.length;
    toast.success(`${count} expense${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
    
    // Return to breakdown drawer if requested
    if (onBack) {
      onBack();
    }
  };

  const handleSubmitAdditionalHours = () => {
    if (!validateAdditionalHoursItems()) return;

    // Submit each additional hours item
    additionalHoursItems.forEach((item, index) => {
      addAdjustment({
        type: 'Additional hours',
        label: additionalHoursItems.length > 1 
          ? `${item.calculatedHours}h (Entry #${index + 1})`
          : `${item.calculatedHours}h`,
        amount: null,
        hours: item.calculatedHours,
        date: item.date ? format(item.date, 'yyyy-MM-dd') : undefined,
        startTime: item.startTime,
        endTime: item.endTime,
      });
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    const count = additionalHoursItems.length;
    const totalHrs = totalAdditionalHours;
    toast.success(`${count} time entr${count > 1 ? 'ies' : 'y'} submitted (${totalHrs}h total).`);
    handleClose();
    
    // Return to breakdown drawer if requested
    if (onBack) {
      onBack();
    }
  };

  const handleSubmitBonus = () => {
    if (!validateCommission()) return;

    // Submit each commission item
    commissionItems.forEach(item => {
      addAdjustment({
        type: 'Bonus',
        label: 'Commission',
        amount: parseFloat(item.amount),
        receiptUrl: item.attachment ? URL.createObjectURL(item.attachment) : undefined,
      });
    });

    // Mark the rejected item as resubmitted if this was a resubmission
    if (rejectedId) {
      markRejectionResubmitted(rejectedId);
    }

    const count = commissionItems.length;
    toast.success(`${count} commission${count > 1 ? 's' : ''} submitted for review.`);
    handleClose();
  };

  const handleSubmitCorrection = () => {
    if (!validateCorrection()) return;

    addAdjustment({
      type: 'Correction',
      label: 'Correction',
      amount: null,
      description: correctionDescription,
      receiptUrl: correctionAttachment ? URL.createObjectURL(correctionAttachment) : undefined,
    });

    toast.success("Correction submitted for review.");
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


  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col">
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
                {selectedType === 'additional-hours' && 'Additional hours'}
                {selectedType === 'bonus' && 'Commission request'}
                {selectedType === 'correction' && 'Correction request'}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {selectedType === null && 'Submit an adjustment for the current invoice cycle'}
                {selectedType === 'expense' && 'Submit expenses for reimbursement'}
                {selectedType === 'additional-hours' && 'Log your additional hours'}
                {selectedType === 'bonus' && 'Request a commission payment'}
                {selectedType === 'correction' && 'Flag an error to be corrected'}
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

          {/* Expense Form - Multiple Items */}
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

              {/* Session total - always show when items have amounts */}
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

          {/* Additional Hours Form - Multi-entry */}
          {selectedType === 'additional-hours' && (
            <div className="space-y-5">
              {/* Additional Hours Line Items */}
              <div className="space-y-3">
                {additionalHoursItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button - only show if more than 1 item */}
                    {additionalHoursItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAdditionalHoursItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}

                    {/* Item number badge */}
                    {additionalHoursItems.length > 1 && (
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
                              errors[`additional_${index}_date`] && "border-destructive"
                            )}
                          >
                            {item.date ? format(item.date, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={item.date}
                            onSelect={(date) => {
                              updateAdditionalHoursItem(item.id, 'date', date);
                              setOpenDatePopoverId(null); // Auto-close on selection
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Start & End Time row */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start time</Label>
                          <F41v6_TimeInput
                            value={item.startTime}
                            onChange={(val) => updateAdditionalHoursItem(item.id, 'startTime', val)}
                            hasError={!!errors[`additional_${index}_startTime`]}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">End time</Label>
                          <F41v6_TimeInput
                            value={item.endTime}
                            onChange={(val) => updateAdditionalHoursItem(item.id, 'endTime', val)}
                            hasError={!!errors[`additional_${index}_endTime`]}
                          />
                          {errors[`additional_${index}_endTime`] && (
                            <p className="text-xs text-destructive">{errors[`additional_${index}_endTime`]}</p>
                          )}
                        </div>
                      </div>
                      {/* Timezone indicator */}
                      <p className="text-[11px] text-muted-foreground">
                        Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                      </p>
                    </div>

                    {/* Calculated hours badge - matching employee overtime UI */}
                    {item.calculatedHours > 0 && (
                      <Badge variant="secondary" className="text-xs w-fit">
                        {item.calculatedHours}h calculated
                      </Badge>
                    )}
                  </div>
                ))}

                {/* Add another entry button */}
                <button
                  type="button"
                  onClick={addAdditionalHoursItem}
                  className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span>
                  Add another entry
                </button>
              </div>

              {/* Total hours summary - show when has calculated hours */}
              {additionalHoursItems.some(item => item.calculatedHours > 0) && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total hours</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {totalAdditionalHours}h
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Your rate applies automatically; final amount will be calculated.
              </p>

              <Button onClick={handleSubmitAdditionalHours} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Commission Form - Multi-entry support matching employee bonus pattern */}
          {selectedType === 'bonus' && (
            <div className="space-y-5">
              <div className="space-y-3">
                {commissionItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-border/60 bg-card/50 space-y-3 relative group"
                  >
                    {/* Remove button */}
                    {commissionItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCommissionItem(item.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-muted border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}

                    {/* Item number badge */}
                    {commissionItems.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Commission {index + 1}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs">Amount ({currency})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => updateCommissionItem(item.id, 'amount', e.target.value)}
                        className={cn(
                          "h-9",
                          errors[`commission_${index}_amount`] && 'border-destructive'
                        )}
                      />
                      {errors[`commission_${index}_amount`] && (
                        <p className="text-xs text-destructive">{errors[`commission_${index}_amount`]}</p>
                      )}
                    </div>

                    {/* Attachment upload - optional */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Attachment (optional)</Label>
                      {item.attachment ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/30">
                          {item.attachment.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs flex-1 truncate">{item.attachment.name}</span>
                          <button
                            type="button"
                            onClick={() => updateCommissionItem(item.id, 'attachment', null)}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border/60 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/[0.02]">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload file</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) updateCommissionItem(item.id, 'attachment', file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another commission button */}
              <button
                type="button"
                onClick={addCommissionItem}
                className="w-full p-3 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/[0.02] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span>
                Add another commission
              </button>

              {/* Session total */}
              {commissionItems.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session total</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {currency} {commissionItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSubmitBonus} className="w-full">
                Request adjustment
              </Button>
            </div>
          )}

          {/* Correction Form */}
          {selectedType === 'correction' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Requested change</Label>
                <Textarea
                  placeholder="Describe the correction needed"
                  value={correctionDescription}
                  onChange={(e) => setCorrectionDescription(e.target.value)}
                  className={cn(errors.correctionDescription && 'border-destructive')}
                />
                {errors.correctionDescription && <p className="text-xs text-destructive">{errors.correctionDescription}</p>}
              </div>

              {renderFileUpload(correctionAttachment, setCorrectionAttachment, 'correctionAttachment', false)}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitCorrection} className="flex-1">
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
