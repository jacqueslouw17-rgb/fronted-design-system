/**
 * Flow 2 v2 - Payroll Collection Step (F2v2_ namespaced)
 * 
 * Conditional UI based on employment type:
 * - Employee: Salary-based fields
 * - Contractor: Hourly or fixed-rate billing fields
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Shield, Plus, Trash2, Edit2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Topbar from '@/components/dashboard/Topbar';
import { RoleLensProvider } from '@/contexts/RoleLensContext';
import { F2v2_Stepper, F2v2_STEPS } from '@/components/flows/candidate-data-v2/F2v2_Stepper';
import { 
  useF2v2_FormStore, 
  F2v2_Analytics,
  F2v2_EmployeeRateStructure,
  F2v2_ContractorBillingModel,
  F2v2_ContractorBillingCadence,
  F2v2_InvoiceCadence
} from '@/stores/F2v2_FormStore';

// Currency options
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
];

const F2v2_PayrollCollection: React.FC = () => {
  const navigate = useNavigate();
  const { 
    payroll,
    setPayrollData,
    addAllowance,
    removeAllowance,
    updateAllowance,
    setCurrentStep,
    saveDraft 
  } = useF2v2_FormStore();

  useEffect(() => {
    setCurrentStep(2);
    F2v2_Analytics.track('entered_payroll_step');
    
    // If no employment type selected, redirect back
    if (!payroll.employment_type) {
      toast.error('Please select an employment type first');
      navigate('/candidate-data-collection-v2/core');
    }
  }, [setCurrentStep, payroll.employment_type, navigate]);

  const handleAddAllowance = () => {
    addAllowance({
      id: `allowance_${Date.now()}`,
      label: '',
      amount: 0
    });
  };

  const isFormValid = () => {
    if (!payroll.start_date || !payroll.currency) return false;
    
    if (payroll.employment_type === 'employee') {
      if (!payroll.employee_rate_structure) return false;
      if (!payroll.employee_base_amount || payroll.employee_base_amount <= 0) return false;
    }
    
    if (payroll.employment_type === 'contractor') {
      if (!payroll.contractor_billing_model) return false;
      
      if (payroll.contractor_billing_model === 'hourly') {
        if (!payroll.contractor_hourly_rate || payroll.contractor_hourly_rate <= 0) return false;
      }
      
      if (payroll.contractor_billing_model === 'fixed') {
        if (!payroll.contractor_retainer_amount || payroll.contractor_retainer_amount <= 0) return false;
        if (!payroll.contractor_billing_cadence) return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    navigate('/candidate-data-collection-v2/review');
  };

  const handleBack = () => {
    navigate('/candidate-data-collection-v2/core');
  };

  const handleSaveDraft = () => {
    saveDraft();
    toast.success('Draft saved', {
      description: 'You can continue editing this form later'
    });
  };

  const handleEditEmploymentType = () => {
    navigate('/candidate-data-collection-v2/core');
  };

  // Auto-enable timesheet for hourly contractors
  useEffect(() => {
    if (payroll.contractor_billing_model === 'hourly') {
      setPayrollData({ contractor_timesheet_required: true });
    }
  }, [payroll.contractor_billing_model, setPayrollData]);

  return (
    <RoleLensProvider initialRole="admin">
      <div className="flex flex-col h-screen bg-background">
        <Topbar
          userName="Candidate"
          profileSettingsUrl="/admin/profile-settings"
          dashboardUrl="/"
        />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
          <div className="max-w-3xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Stepper */}
              <F2v2_Stepper currentStep={2} steps={F2v2_STEPS} />

              {/* Header with v2 staging tag */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">Configure how you'll be paid</h1>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Version: v2 (staging)
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {payroll.employment_type === 'employee' 
                    ? "We'll use this to set up your payroll. Bank details come later in onboarding."
                    : "We'll use this to set up your invoicing. You can still submit invoices manually if needed."}
                </p>
              </div>

              {/* Employment Type Display */}
              <div className="rounded-lg border border-border bg-card/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {payroll.employment_type === 'employee' ? 'EOR Employee' : 'COR Contractor'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {payroll.employment_type === 'employee' ? 'Salary-based compensation' : 'Hourly or fixed-rate billing'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleEditEmploymentType}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-6 bg-card rounded-lg border border-border p-6">
                
                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Start Date
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <Input
                      type="date"
                      value={payroll.start_date}
                      onChange={(e) => setPayrollData({ start_date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Currency
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <Select 
                      value={payroll.currency} 
                      onValueChange={(value) => setPayrollData({ currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Currency is captured for configuration; FX is handled by Fronted later.
                    </p>
                  </div>
                </div>

                {/* Employee-specific fields */}
                {payroll.employment_type === 'employee' && (
                  <div className="space-y-6 pt-4 border-t border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      Compensation (Employee)
                    </h3>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Rate Structure
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <RadioGroup
                        value={payroll.employee_rate_structure}
                        onValueChange={(v) => setPayrollData({ employee_rate_structure: v as F2v2_EmployeeRateStructure })}
                        className="flex gap-4"
                      >
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <RadioGroupItem value="monthly_salary" id="monthly" />
                          <span>Monthly Salary</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <RadioGroupItem value="annual_salary" id="annual" />
                          <span>Annual Salary</span>
                        </label>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Base Amount ({payroll.currency})
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={payroll.employee_base_amount || ''}
                        onChange={(e) => setPayrollData({ employee_base_amount: parseFloat(e.target.value) || null })}
                      />
                    </div>

                    {/* Allowances */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Allowances (Optional)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddAllowance}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Allowance
                        </Button>
                      </div>
                      {payroll.employee_allowances.map((allowance) => (
                        <div key={allowance.id} className="flex gap-2 items-center">
                          <Input
                            placeholder="Label (e.g., Housing)"
                            value={allowance.label}
                            onChange={(e) => updateAllowance(allowance.id, { label: e.target.value })}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Amount"
                            value={allowance.amount || ''}
                            onChange={(e) => updateAllowance(allowance.id, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-32"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeAllowance(allowance.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overtime"
                        checked={payroll.employee_overtime_eligible}
                        onCheckedChange={(checked) => setPayrollData({ employee_overtime_eligible: !!checked })}
                      />
                      <label htmlFor="overtime" className="text-sm cursor-pointer">
                        Eligible for overtime pay
                      </label>
                    </div>

                    <div className="space-y-2">
                      <Label>Hours per Week (Optional)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        placeholder="e.g., 40"
                        value={payroll.employee_hours_per_week || ''}
                        onChange={(e) => setPayrollData({ employee_hours_per_week: parseInt(e.target.value) || null })}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}

                {/* Contractor-specific fields */}
                {payroll.employment_type === 'contractor' && (
                  <div className="space-y-6 pt-4 border-t border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      Compensation (Contractor)
                    </h3>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Billing Model
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <RadioGroup
                        value={payroll.contractor_billing_model}
                        onValueChange={(v) => setPayrollData({ contractor_billing_model: v as F2v2_ContractorBillingModel })}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <label 
                          htmlFor="hourly"
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            payroll.contractor_billing_model === 'hourly' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="hourly" id="hourly" />
                          <div>
                            <p className="font-medium">Hourly</p>
                            <p className="text-sm text-muted-foreground">Bill by the hour</p>
                          </div>
                        </label>
                        <label 
                          htmlFor="fixed"
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            payroll.contractor_billing_model === 'fixed' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="fixed" id="fixed" />
                          <div>
                            <p className="font-medium">Fixed / Retainer</p>
                            <p className="text-sm text-muted-foreground">Fixed amount per period</p>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    {/* Hourly fields */}
                    {payroll.contractor_billing_model === 'hourly' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Hourly Rate ({payroll.currency})
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={payroll.contractor_hourly_rate || ''}
                            onChange={(e) => setPayrollData({ contractor_hourly_rate: parseFloat(e.target.value) || null })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Hours per Period (Optional)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g., 160"
                            value={payroll.contractor_max_hours_per_period || ''}
                            onChange={(e) => setPayrollData({ contractor_max_hours_per_period: parseInt(e.target.value) || null })}
                          />
                        </div>
                      </div>
                    )}

                    {/* Fixed fields */}
                    {payroll.contractor_billing_model === 'fixed' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Retainer Amount ({payroll.currency})
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={payroll.contractor_retainer_amount || ''}
                            onChange={(e) => setPayrollData({ contractor_retainer_amount: parseFloat(e.target.value) || null })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Billing Cadence
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <Select 
                            value={payroll.contractor_billing_cadence} 
                            onValueChange={(v) => setPayrollData({ contractor_billing_cadence: v as F2v2_ContractorBillingCadence })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select cadence" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="biweekly">Biweekly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="per_milestone">Per Milestone</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Common contractor fields */}
                    {payroll.contractor_billing_model && (
                      <>
                        <div className="space-y-2">
                          <Label>Invoice Cadence</Label>
                          <RadioGroup
                            value={payroll.contractor_invoice_cadence}
                            onValueChange={(v) => setPayrollData({ contractor_invoice_cadence: v as F2v2_InvoiceCadence })}
                            className="flex gap-4"
                          >
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <RadioGroupItem value="auto-month-end" id="auto" />
                              <span>Auto (month-end)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <RadioGroupItem value="manual-submit" id="manual" />
                              <span>Manual submit</span>
                            </label>
                          </RadioGroup>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="timesheet"
                            checked={payroll.contractor_timesheet_required}
                            onCheckedChange={(checked) => setPayrollData({ contractor_timesheet_required: !!checked })}
                            disabled={payroll.contractor_billing_model === 'hourly'}
                          />
                          <label htmlFor="timesheet" className="text-sm cursor-pointer">
                            Timesheet required
                            {payroll.contractor_billing_model === 'hourly' && (
                              <span className="text-muted-foreground ml-1">(always required for hourly)</span>
                            )}
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Kurt helper */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {payroll.employment_type === 'employee' 
                        ? "Your salary will be processed through our EOR payroll. Any allowances added here will be included in your compensation package."
                        : "You'll receive payments based on your billing model. Timesheets help ensure accurate invoicing for hourly work."}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Compliance Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>GDPR Compliant • Your data is encrypted</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNext}
                  disabled={!isFormValid()}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default F2v2_PayrollCollection;
