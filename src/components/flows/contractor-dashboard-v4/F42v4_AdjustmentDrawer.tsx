/**
 * Flow 4.2 — Contractor Dashboard v4
 * Request Adjustment Drawer (right-side panel)
 * 
 * ALIGNED: Matches F41v4_AdjustmentModal card-based UI patterns.
 * - Batch expense support with multiple line items
 * - Simplified forms (removed notes/description fields)
 * - Compact inline layout
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
import { toast } from 'sonner';
import { useF42v4_DashboardStore, type F42v4_AdjustmentType, type F42v4_ContractType } from '@/stores/F42v4_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image, ArrowLeft, Receipt, Clock, Gift, AlertCircle, Calendar } from 'lucide-react';
import { F41v4_TimeInput } from '@/components/flows/employee-dashboard-v4/F41v4_TimeInput';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

export type ContractorRequestType = 'expense' | 'additional-hours' | 'bonus' | 'correction' | null;

interface F42v4_AdjustmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  contractType: F42v4_ContractType;
  initialType?: ContractorRequestType;
  initialExpenseCategory?: string;
  initialExpenseAmount?: string;
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

// Invoice period bounds (mock - in real app would come from store)
const invoicePeriodLabel = 'Dec 1 – Dec 31';

const getRequestTypeOptions = (contractType: F42v4_ContractType) => {
  const options = [
    { 
      id: 'expense' as ContractorRequestType, 
      label: 'Expense', 
      description: 'Submit a reimbursement',
      icon: Receipt 
    },
    { 
      id: 'bonus' as ContractorRequestType, 
      label: 'Commission', 
      description: 'Request additional pay',
      icon: Gift 
    },
  ];
  
  // Only show Additional hours for hourly contracts
  if (contractType === 'hourly') {
    options.splice(1, 0, {
      id: 'additional-hours' as ContractorRequestType,
      label: 'Additional hours',
      description: 'Log extra time',
      icon: Clock
    });
  }
  
  return options;
};

export const F42v4_AdjustmentDrawer = ({ 
  open, 
  onOpenChange, 
  currency, 
  contractType,
  initialType = null,
  initialExpenseCategory = '',
  initialExpenseAmount = '',
  onBack 
}: F42v4_AdjustmentDrawerProps) => {
  const { addAdjustment } = useF42v4_DashboardStore();
  
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
  
  // Bonus form state
  const [bonusAmount, setBonusAmount] = useState('');
  
  // Correction form state
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [correctionAttachment, setCorrectionAttachment] = useState<File | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track which date popover is open (by item id)
  const [openDatePopoverId, setOpenDatePopoverId] = useState<string | null>(null);

  const requestTypeOptions = getRequestTypeOptions(contractType);

  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseItems([{ id: crypto.randomUUID(), category: initialExpenseCategory, otherCategory: '', amount: initialExpenseAmount, receipt: null }]);
    setAdditionalHoursItems([{ id: crypto.randomUUID(), date: undefined, startTime: '', endTime: '', calculatedHours: 0 }]);
    setBonusAmount('');
    setCorrectionDescription('');
    setCorrectionAttachment(null);
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

  const validateBonus = () => {
    const newErrors: Record<string, string> = {};
    if (!bonusAmount || parseFloat(bonusAmount) <= 0) newErrors.bonusAmount = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      });
    });

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
    if (!validateBonus()) return;

    addAdjustment({
      type: 'Bonus',
      label: 'Commission',
      amount: parseFloat(bonusAmount),
    });

    toast.success("Commission request submitted for review.");
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

  // Invoice period badge
  const InvoicePeriodBadge = () => (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/40 mb-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice period</span>
        <span className="text-sm font-medium text-foreground">{invoicePeriodLabel}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Adjustments submitted after the cut-off may be processed in the next invoice cycle.
      </p>
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
              <SheetDescription>
                {selectedType === null && 'Submit an adjustment for the current invoice cycle.'}
                {selectedType === 'expense' && 'Submit an expense for reimbursement.'}
                {selectedType === 'additional-hours' && 'Log extra hours worked.'}
                {selectedType === 'bonus' && 'Request a commission payment.'}
                {selectedType === 'correction' && 'Flag an error to be corrected.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 py-6 overflow-y-auto">
          {/* Type Selection Grid */}
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
              <InvoicePeriodBadge />

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

          {/* Additional Hours Form - Multi-entry */}
          {selectedType === 'additional-hours' && (
            <div className="space-y-5">
              <InvoicePeriodBadge />

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
                              "w-full justify-start text-left font-normal h-9",
                              !item.date && "text-muted-foreground",
                              errors[`additional_${index}_date`] && "border-destructive"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {item.date ? format(item.date, 'PPP') : 'Select date'}
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Start time</Label>
                        <F41v4_TimeInput
                          value={item.startTime}
                          onChange={(val) => updateAdditionalHoursItem(item.id, 'startTime', val)}
                          hasError={!!errors[`additional_${index}_startTime`]}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">End time</Label>
                        <F41v4_TimeInput
                          value={item.endTime}
                          onChange={(val) => updateAdditionalHoursItem(item.id, 'endTime', val)}
                          hasError={!!errors[`additional_${index}_endTime`]}
                        />
                        {errors[`additional_${index}_endTime`] && (
                          <p className="text-xs text-destructive">{errors[`additional_${index}_endTime`]}</p>
                        )}
                      </div>
                    </div>

                    {/* Calculated hours display */}
                    {item.calculatedHours > 0 && (
                      <div className="flex items-center justify-end pt-1">
                        <span className="text-xs text-muted-foreground">
                          = <span className="font-medium text-foreground tabular-nums">{item.calculatedHours}h</span>
                        </span>
                      </div>
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

              {/* Total summary - only show if multiple items or has calculated hours */}
              {additionalHoursItems.length > 1 && totalAdditionalHours > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-sm text-muted-foreground">Total ({additionalHoursItems.length} entries)</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {totalAdditionalHours}h
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Your rate applies automatically; final amount will be calculated.
              </p>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitAdditionalHours} className="flex-1">
                  Submit {additionalHoursItems.length > 1 ? `${additionalHoursItems.length} entries` : 'request'}
                </Button>
              </div>
            </div>
          )}

          {/* Bonus Form */}
          {selectedType === 'bonus' && (
            <div className="space-y-5">
              <InvoicePeriodBadge />

              <div className="space-y-2">
                <Label>Amount ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  className={cn(errors.bonusAmount && 'border-destructive')}
                />
                {errors.bonusAmount && <p className="text-xs text-destructive">{errors.bonusAmount}</p>}
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Subject to admin approval.
              </p>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmitBonus} className="flex-1">
                  Submit request
                </Button>
              </div>
            </div>
          )}

          {/* Correction Form */}
          {selectedType === 'correction' && (
            <div className="space-y-5">
              <InvoicePeriodBadge />

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
