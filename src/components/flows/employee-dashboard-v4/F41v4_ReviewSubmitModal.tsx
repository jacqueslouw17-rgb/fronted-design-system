/**
 * Flow 4.1 — Employee Dashboard v4
 * Review & Submit Multi-Step Modal
 * INDEPENDENT from v3 - changes here do not affect other flows.
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  ArrowLeft,
  ArrowRight,
  Receipt,
  Gift,
  PlusCircle,
  Sparkles,
  Upload,
  AlertCircle,
  Clock,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useF41v4_DashboardStore } from '@/stores/F41v4_DashboardStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface F41v4_ReviewSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  periodLabel: string;
}

type Step = 1 | 2 | 3;
type TimeWorkedOption = 'no_changes' | 'update';

interface ExpenseData {
  amount: string;
  description: string;
  receipt: File | null;
}

interface BonusData {
  amount: string;
  reason: string;
}

interface OtherAdjustmentData {
  amount: string;
  note: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const F41v4_ReviewSubmitModal = ({
  open,
  onOpenChange,
  currency,
  periodLabel,
}: F41v4_ReviewSubmitModalProps) => {
  const { confirmPay, addAdjustment, adjustments, leaveRequests } = useF41v4_DashboardStore();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1: Time worked
  const [timeWorkedOption, setTimeWorkedOption] = useState<TimeWorkedOption>('no_changes');
  const [daysWorked, setDaysWorked] = useState('22');
  const [unpaidDays, setUnpaidDays] = useState('0');

  // Step 2: Adjustments
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [expense, setExpense] = useState<ExpenseData>({ amount: '', description: '', receipt: null });
  const [bonus, setBonus] = useState<BonusData>({ amount: '', reason: '' });
  const [otherAdj, setOtherAdj] = useState<OtherAdjustmentData>({ amount: '', note: '' });

  // Step 3: Confirmation
  const [confirmed, setConfirmed] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Reset after modal close animation
      const timer = setTimeout(() => {
        setCurrentStep(1);
        setIsSubmitted(false);
        setTimeWorkedOption('no_changes');
        setDaysWorked('22');
        setUnpaidDays('0');
        setExpenseOpen(false);
        setBonusOpen(false);
        setOtherOpen(false);
        setExpense({ amount: '', description: '', receipt: null });
        setBonus({ amount: '', reason: '' });
        setOtherAdj({ amount: '', note: '' });
        setConfirmed(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const steps = [
    { number: 1, label: 'Confirm' },
    { number: 2, label: 'Adjustments' },
    { number: 3, label: 'Submit' },
  ];

  const isNoChangesMonth = timeWorkedOption === 'no_changes' && 
    !expenseOpen && !bonusOpen && !otherOpen &&
    !expense.amount && !bonus.amount && !otherAdj.amount;

  const hasAnyAdjustments = expense.amount || bonus.amount || otherAdj.amount;

  const handleNext = () => {
    if (currentStep === 1 && timeWorkedOption === 'no_changes' && !hasAnyAdjustments) {
      // Skip step 2 for "no changes" path
      setCurrentStep(3);
    } else if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && timeWorkedOption === 'no_changes' && !hasAnyAdjustments) {
      // Go back to step 1 if we skipped step 2
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const validateStep = (): boolean => {
    if (currentStep === 2) {
      // Validate opened sections
      if (expenseOpen && expense.amount && parseFloat(expense.amount) < 0) {
        toast.error('Expense amount cannot be negative');
        return false;
      }
      if (bonusOpen && bonus.amount && parseFloat(bonus.amount) < 0) {
        toast.error('Bonus amount cannot be negative');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!confirmed) {
        toast.error('Please confirm the information is correct');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    // Add any adjustments
    if (expense.amount && parseFloat(expense.amount) > 0) {
      addAdjustment({
        type: 'Expense',
        label: 'Expense claim',
        amount: parseFloat(expense.amount),
        description: expense.description,
        category: 'General',
      });
    }

    if (bonus.amount && parseFloat(bonus.amount) > 0) {
      addAdjustment({
        type: 'Bonus',
        label: 'Bonus request',
        amount: parseFloat(bonus.amount),
        description: bonus.reason,
      });
    }

    if (otherAdj.amount && parseFloat(otherAdj.amount) !== 0) {
      addAdjustment({
        type: 'Correction',
        label: 'Other adjustment',
        amount: parseFloat(otherAdj.amount),
        description: otherAdj.note,
      });
    }

    // Confirm pay
    confirmPay();
    setIsSubmitted(true);
    toast.success('Submitted for approval');
  };

  const handlePreviewPDF = () => {
    toast.info('Draft payslip preview would open here');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Submitted success state
  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-accent-green/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-accent-green-text" />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-semibold">Submitted</DialogTitle>
              <p className="text-muted-foreground">
                Your submission has been sent to your company for review.
              </p>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Company review
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Fronted approval
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Paid
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleClose} className="w-full">
                Back to dashboard
              </Button>
              <Button variant="link" className="text-sm text-muted-foreground">
                View submission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Stepper Header */}
        <div className="border-b border-border/40 pb-4 pt-2">
          <DialogTitle className="sr-only">Review and submit</DialogTitle>
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.number
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-accent-green/20 dark:text-accent-green-text'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      currentStep === step.number
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-8 h-px bg-border/60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 px-1">
          {/* Pay Period Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary" className="text-xs">
              Pay period: {periodLabel}
            </Badge>
          </div>

          {/* Step 1: Confirm basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Confirm this month</h3>
                <p className="text-sm text-muted-foreground">
                  Verify your time worked for {periodLabel}
                </p>
              </div>

              <RadioGroup
                value={timeWorkedOption}
                onValueChange={(v) => setTimeWorkedOption(v as TimeWorkedOption)}
                className="space-y-3"
              >
                <label
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                    timeWorkedOption === 'no_changes'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="no_changes" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">No changes this month</span>
                      <Check className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard working days, no updates needed
                    </p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                    timeWorkedOption === 'update'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="update" className="mt-1" />
                  <div className="flex-1">
                    <span className="font-medium">I need to update something</span>
                    <p className="text-sm text-muted-foreground mb-3">
                      Adjust days worked or leave taken
                    </p>

                    {timeWorkedOption === 'update' && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="days-worked" className="text-sm">
                            Days worked
                          </Label>
                          <Input
                            id="days-worked"
                            type="number"
                            min="0"
                            max="31"
                            value={daysWorked}
                            onChange={(e) => setDaysWorked(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unpaid-days" className="text-sm">
                            Unpaid leave days
                          </Label>
                          <Input
                            id="unpaid-days"
                            type="number"
                            min="0"
                            max="31"
                            value={unpaidDays}
                            onChange={(e) => setUnpaidDays(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Optional adjustments */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Add adjustments</h3>
                <p className="text-sm text-muted-foreground">
                  Optional: Add expenses, bonuses, or other adjustments
                </p>
              </div>

              <div className="space-y-3">
                {/* Expenses */}
                <Collapsible open={expenseOpen} onOpenChange={setExpenseOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                          <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Expenses</p>
                          <p className="text-xs text-muted-foreground">Submit receipts for reimbursement</p>
                        </div>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', expenseOpen && 'rotate-180')} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 px-1">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expense-amount" className="text-sm">Amount ({currency})</Label>
                          <Input
                            id="expense-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={expense.amount}
                            onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense-desc" className="text-sm">Description</Label>
                          <Input
                            id="expense-desc"
                            placeholder="e.g., Client lunch"
                            value={expense.description}
                            onChange={(e) => setExpense({ ...expense, description: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Receipt (optional)</Label>
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {expense.receipt ? expense.receipt.name : 'Upload receipt (PNG, JPG, PDF)'}
                          </span>
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.pdf"
                            className="hidden"
                            onChange={(e) => setExpense({ ...expense, receipt: e.target.files?.[0] || null })}
                          />
                        </label>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Bonus / One-off */}
                <Collapsible open={bonusOpen} onOpenChange={setBonusOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                          <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Bonus / One-off</p>
                          <p className="text-xs text-muted-foreground">Request a bonus or one-time payment</p>
                        </div>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', bonusOpen && 'rotate-180')} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 px-1">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bonus-amount" className="text-sm">Amount ({currency})</Label>
                        <Input
                          id="bonus-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={bonus.amount}
                          onChange={(e) => setBonus({ ...bonus, amount: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus-reason" className="text-sm">Reason</Label>
                        <Select value={bonus.reason} onValueChange={(v) => setBonus({ ...bonus, reason: v })}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="performance">Performance bonus</SelectItem>
                            <SelectItem value="project">Project completion</SelectItem>
                            <SelectItem value="referral">Referral bonus</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Other adjustment */}
                <Collapsible open={otherOpen} onOpenChange={setOtherOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <PlusCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Other adjustment</p>
                          <p className="text-xs text-muted-foreground">Add or subtract an amount (corrections)</p>
                        </div>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', otherOpen && 'rotate-180')} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 px-1">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="other-amount" className="text-sm">Amount ({currency})</Label>
                        <Input
                          id="other-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00 (use negative for deductions)"
                          value={otherAdj.amount}
                          onChange={(e) => setOtherAdj({ ...otherAdj, amount: e.target.value })}
                          className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">Use negative values for deductions</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="other-note" className="text-sm">Note</Label>
                        <Textarea
                          id="other-note"
                          placeholder="Briefly describe the adjustment"
                          value={otherAdj.note}
                          onChange={(e) => setOtherAdj({ ...otherAdj, note: e.target.value })}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                All adjustments are subject to admin approval before being included.
              </p>
            </div>
          )}

          {/* Step 3: Preview + Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Review & submit</h3>
                <p className="text-sm text-muted-foreground">
                  Preview your submission before sending
                </p>
              </div>

              {/* Quick summary */}
              {isNoChangesMonth && (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-accent-green/10 border border-emerald-200 dark:border-accent-green/30">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-accent-green-text">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Looks like a standard month ✓</span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-accent-green-text/80 mt-1">
                    No adjustments or changes to report.
                  </p>
                </div>
              )}

              {/* Draft preview */}
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Draft payslip preview</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePreviewPDF}>
                    Preview draft PDF
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is an estimate. Final amounts may vary after company review.
                </p>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium text-sm">
                    I confirm the above information is correct for this month.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By submitting, you confirm your details for {periodLabel}.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button onClick={() => { if (validateStep()) handleNext(); }} className="flex-1">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!confirmed}
                className="flex-1"
              >
                Submit for approval
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your company will review this before payroll is approved.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
