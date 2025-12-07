/**
 * Flow 4.1 — Employee Dashboard v3
 * Request Adjustment Drawer (right-side panel)
 */

import { useState } from 'react';
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
import { useF41v3_DashboardStore, type AdjustmentType } from '@/stores/F41v3_DashboardStore';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image } from 'lucide-react';

interface F41v3_AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

const adjustmentTypes: AdjustmentType[] = ['Expense', 'Overtime', 'Bonus', 'Correction'];
const expenseCategories = ['Travel', 'Meals', 'Equipment', 'Software', 'Other'];

export const F41v3_AdjustmentModal = ({ open, onOpenChange, currency }: F41v3_AdjustmentModalProps) => {
  const { addAdjustment } = useF41v3_DashboardStore();
  
  const [type, setType] = useState<AdjustmentType>('Expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setType('Expense');
    setCategory('');
    setAmount('');
    setHours('');
    setDescription('');
    setReceipt(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'Expense') {
      if (!category) newErrors.category = 'Category is required';
      if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
      if (!receipt) newErrors.receipt = 'Receipt is required for expenses';
      if (!description.trim()) newErrors.description = 'Description is required';
    }

    if (type === 'Overtime') {
      if (!hours || parseFloat(hours) <= 0) newErrors.hours = 'Hours must be greater than 0';
    }

    if (type === 'Bonus') {
      if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
      if (!description.trim()) newErrors.description = 'Description is required';
    }

    if (type === 'Correction') {
      if (!description.trim()) newErrors.description = 'Requested change is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, receipt: 'Only PDF, JPG, and PNG files are allowed' }));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, receipt: 'File must be less than 10MB' }));
      return;
    }

    setReceipt(file);
    setErrors(prev => {
      const { receipt, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const label = type === 'Expense' ? category : 
                  type === 'Overtime' ? `${hours}h` :
                  type === 'Bonus' ? 'Bonus request' : 'Correction';

    addAdjustment({
      type,
      label,
      amount: type === 'Overtime' ? null : parseFloat(amount),
      description,
      category: type === 'Expense' ? category : undefined,
      hours: type === 'Overtime' ? parseFloat(hours) : undefined,
      receiptUrl: receipt ? URL.createObjectURL(receipt) : undefined,
    });

    toast.success("Adjustment submitted. We'll notify you after review.");
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/40">
          <SheetTitle>Request an adjustment</SheetTitle>
          <SheetDescription>
            Submit an adjustment for the current pay cycle.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-6">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {adjustmentTypes.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setType(t);
                    setErrors({});
                  }}
                  className={cn(
                    type === t && 'bg-primary text-primary-foreground'
                  )}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Expense Fields */}
          {type === 'Expense' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={cn(errors.category && 'border-destructive')}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(errors.amount && 'border-destructive')}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the expense"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(errors.description && 'border-destructive')}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label>Receipt (PDF/JPG/PNG)</Label>
                {receipt ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                    {receipt.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Image className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm flex-1 truncate">{receipt.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setReceipt(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                    errors.receipt ? 'border-destructive' : 'border-border hover:border-primary/50'
                  )}>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload receipt</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
                {errors.receipt && <p className="text-xs text-destructive">{errors.receipt}</p>}
                <p className="text-xs text-muted-foreground">Receipts are required for expenses.</p>
              </div>
            </>
          )}

          {/* Overtime Fields */}
          {type === 'Overtime' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
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
                <Label htmlFor="memo">Memo (optional)</Label>
                <Textarea
                  id="memo"
                  placeholder="Additional notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Rate per company policy; final amount will be calculated by payroll.
              </p>
            </>
          )}

          {/* Bonus Fields */}
          {type === 'Bonus' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(errors.amount && 'border-destructive')}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Reason for bonus request"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(errors.description && 'border-destructive')}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Subject to admin approval.
              </p>
            </>
          )}

          {/* Correction Fields */}
          {type === 'Correction' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Requested change</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the correction needed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(errors.description && 'border-destructive')}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label>Attachment (optional)</Label>
                {receipt ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                    {receipt.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Image className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm flex-1 truncate">{receipt.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setReceipt(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload (optional)</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </>
          )}
        </div>

        {/* Fixed bottom actions */}
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
