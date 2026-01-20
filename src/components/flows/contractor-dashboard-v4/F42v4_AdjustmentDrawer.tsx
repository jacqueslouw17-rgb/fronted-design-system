/**
 * Flow 4.2 — Contractor Dashboard v4
 * Request Adjustment Drawer (right-side panel)
 * 
 * ALIGNED: Matches F41v4_AdjustmentModal card-based UI patterns.
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
import { Upload, X, FileText, Image, ArrowLeft, Receipt, Clock, Gift, AlertCircle } from 'lucide-react';

export type ContractorRequestType = 'expense' | 'additional-hours' | 'bonus' | 'correction' | null;

interface F42v4_AdjustmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  contractType: F42v4_ContractType;
  initialType?: ContractorRequestType;
  onBack?: () => void; // Called when back is pressed at type selection level
}

const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

// Invoice period bounds (mock - in real app would come from store)
const invoicePeriodStart = new Date(2025, 11, 1); // Dec 1, 2025
const invoicePeriodEnd = new Date(2025, 11, 31); // Dec 31, 2025
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
      label: 'Bonus / Commission', 
      description: 'Request additional pay',
      icon: Gift 
    },
    { 
      id: 'correction' as ContractorRequestType, 
      label: 'Correction', 
      description: 'Flag an error',
      icon: AlertCircle 
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
  onBack 
}: F42v4_AdjustmentDrawerProps) => {
  const { addAdjustment } = useF42v4_DashboardStore();
  
  // Selection state
  const [selectedType, setSelectedType] = useState<ContractorRequestType>(null);
  
  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);
  
  // Additional hours form state
  const [hours, setHours] = useState('');
  const [hoursMemo, setHoursMemo] = useState('');
  
  // Bonus form state
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusDescription, setBonusDescription] = useState('');
  
  // Correction form state
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [correctionAttachment, setCorrectionAttachment] = useState<File | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requestTypeOptions = getRequestTypeOptions(contractType);

  const resetForm = () => {
    setSelectedType(initialType);
    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseReceipt(null);
    setHours('');
    setHoursMemo('');
    setBonusAmount('');
    setBonusDescription('');
    setCorrectionDescription('');
    setCorrectionAttachment(null);
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

  // Set initial type when drawer opens
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

  const validateAdditionalHours = () => {
    const newErrors: Record<string, string> = {};
    if (!hours || parseFloat(hours) <= 0) newErrors.hours = 'Hours must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBonus = () => {
    const newErrors: Record<string, string> = {};
    if (!bonusAmount || parseFloat(bonusAmount) <= 0) newErrors.bonusAmount = 'Amount must be greater than 0';
    if (!bonusDescription.trim()) newErrors.bonusDescription = 'Description is required';
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

  const handleSubmitAdditionalHours = () => {
    if (!validateAdditionalHours()) return;

    addAdjustment({
      type: 'Additional hours',
      label: `${hours}h`,
      amount: null,
      description: hoursMemo,
      hours: parseFloat(hours),
    });

    toast.success("Additional hours submitted for review.");
    handleClose();
  };

  const handleSubmitBonus = () => {
    if (!validateBonus()) return;

    addAdjustment({
      type: 'Bonus',
      label: 'Bonus/Commission',
      amount: parseFloat(bonusAmount),
      description: bonusDescription,
    });

    toast.success("Bonus request submitted for review.");
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
                {selectedType === null && 'Request an adjustment'}
                {selectedType === 'expense' && 'Expense request'}
                {selectedType === 'additional-hours' && 'Additional hours'}
                {selectedType === 'bonus' && 'Bonus / Commission'}
                {selectedType === 'correction' && 'Correction request'}
              </SheetTitle>
              <SheetDescription>
                {selectedType === null && 'Submit an adjustment for the current invoice cycle.'}
                {selectedType === 'expense' && 'Submit an expense for reimbursement.'}
                {selectedType === 'additional-hours' && 'Log extra hours worked.'}
                {selectedType === 'bonus' && 'Request a bonus or commission payment.'}
                {selectedType === 'correction' && 'Flag an error to be corrected.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 py-6 overflow-y-auto">
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

          {/* Expense Form */}
          {selectedType === 'expense' && (
            <div className="space-y-5">
              <InvoicePeriodBadge />

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
                />
                {errors.expenseDescription && <p className="text-xs text-destructive">{errors.expenseDescription}</p>}
              </div>

              {renderFileUpload(expenseReceipt, setExpenseReceipt, 'expenseReceipt', true)}
            </div>
          )}

          {/* Additional Hours Form */}
          {selectedType === 'additional-hours' && (
            <div className="space-y-5">
              <InvoicePeriodBadge />

              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={cn(errors.hours && 'border-destructive')}
                />
                {errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}
              </div>

              <div className="space-y-2">
                <Label>Memo (optional)</Label>
                <Textarea
                  placeholder="Additional notes about the work"
                  value={hoursMemo}
                  onChange={(e) => setHoursMemo(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-xs text-muted-foreground">
                  Your rate applies automatically; final amount will be calculated.
                </p>
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

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Reason for bonus/commission request"
                  value={bonusDescription}
                  onChange={(e) => setBonusDescription(e.target.value)}
                  className={cn(errors.bonusDescription && 'border-destructive')}
                />
                {errors.bonusDescription && <p className="text-xs text-destructive">{errors.bonusDescription}</p>}
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-xs text-muted-foreground">
                  Subject to admin approval.
                </p>
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
            </div>
          )}
        </div>

        {/* Fixed bottom actions - only show when a type is selected */}
        {selectedType && (
          <div className="flex gap-3 pt-4 border-t border-border/40 mt-auto">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedType === 'expense') handleSubmitExpense();
                if (selectedType === 'additional-hours') handleSubmitAdditionalHours();
                if (selectedType === 'bonus') handleSubmitBonus();
                if (selectedType === 'correction') handleSubmitCorrection();
              }} 
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
