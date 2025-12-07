/**
 * Flow 2 v2 - Candidate Data Collection (Single Page Form)
 * 
 * STRICT v1 parity with added:
 * - Employment Type selector at top (editable, not prefilled)
 * - Conditional minimal payroll fields based on employment type
 * 
 * CTAs: "Send Form" (primary) + "Cancel" (secondary)
 * Success: Same toast + navigation as v1
 * 
 * Version: v2 (staging)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// F2v2 Analytics (staging only)
const F2v2_Analytics = {
  track: (event: string, data?: Record<string, unknown>) => {
    console.log(`[F2v2_Analytics][staging] ${event}`, data || {});
  }
};

// Currency options
const CURRENCIES = [{
  code: 'USD',
  label: 'USD - US Dollar'
}, {
  code: 'EUR',
  label: 'EUR - Euro'
}, {
  code: 'GBP',
  label: 'GBP - British Pound'
}, {
  code: 'MXN',
  label: 'MXN - Mexican Peso'
}, {
  code: 'PHP',
  label: 'PHP - Philippine Peso'
}, {
  code: 'BRL',
  label: 'BRL - Brazilian Real'
}, {
  code: 'INR',
  label: 'INR - Indian Rupee'
}];

// F2v2 Employment Type
type F2v2_EmploymentType = 'employee' | 'contractor' | '';
type F2v2_BillingModel = 'hourly' | 'fixed' | '';

// F2v2 Form State (local, not using zustand for simplicity matching v1)
interface F2v2_FormState {
  // Employment type
  employment_type: F2v2_EmploymentType;
  // Core fields (matching v1 structure)
  idType: string;
  idNumber: string;
  taxResidence: string;
  city: string;
  nationality: string;
  address: string;
  bankName: string;
  accountNumber: string;
  payFrequency: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Payroll fields
  country_code: string;
  currency: string;
  start_date: string;
  // Employee-only
  employee_monthly_salary: string;
  employee_overtime_eligible: boolean;
  employee_hours_per_week: string;
  // Contractor-only
  contractor_billing_model: F2v2_BillingModel;
  contractor_hourly_rate: string;
  contractor_expected_hours_per_week: string;
  contractor_retainer_amount_monthly: string;
  contractor_invoice_cadence: string;
  contractor_timesheet_required: boolean;
}
const F2v2_CandidateDataForm: React.FC = () => {
  const navigate = useNavigate();

  // Pre-filled data from ATS (same as v1)
  const prefilledData = {
    fullName: "Sofia Rodriguez",
    email: "sofia.rodriguez@email.com",
    role: "Marketing Manager",
    salary: "$72,000 USD",
    startDate: "2025-02-01"
  };

  // Form state
  const [formData, setFormData] = useState<F2v2_FormState>({
    employment_type: '',
    idType: '',
    idNumber: '',
    taxResidence: '',
    city: '',
    nationality: '',
    address: '',
    bankName: '',
    accountNumber: '',
    payFrequency: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    country_code: 'MX',
    currency: 'MXN',
    start_date: '',
    employee_monthly_salary: '',
    employee_overtime_eligible: false,
    employee_hours_per_week: '',
    contractor_billing_model: '',
    contractor_hourly_rate: '',
    contractor_expected_hours_per_week: '',
    contractor_retainer_amount_monthly: '',
    contractor_invoice_cadence: 'auto_month_end',
    contractor_timesheet_required: false
  });

  // Type change confirmation
  const [pendingTypeChange, setPendingTypeChange] = useState<F2v2_EmploymentType | null>(null);
  const [showTypeChangeDialog, setShowTypeChangeDialog] = useState(false);

  // Track page open
  useEffect(() => {
    F2v2_Analytics.track('flow2_v2_opened');
  }, []);

  // Handle employment type change with confirmation
  const handleEmploymentTypeChange = (newType: F2v2_EmploymentType) => {
    const currentType = formData.employment_type;

    // Check if switching types and has data
    if (currentType && currentType !== newType) {
      const hasEmployeeData = formData.employee_monthly_salary !== '';
      const hasContractorData = formData.contractor_hourly_rate !== '' || formData.contractor_retainer_amount_monthly !== '';
      if (currentType === 'employee' && hasEmployeeData || currentType === 'contractor' && hasContractorData) {
        setPendingTypeChange(newType);
        setShowTypeChangeDialog(true);
        return;
      }
    }
    applyTypeChange(newType);
  };
  const applyTypeChange = (newType: F2v2_EmploymentType) => {
    if (newType === 'employee') {
      // Clear contractor fields
      setFormData(prev => ({
        ...prev,
        employment_type: newType,
        contractor_billing_model: '',
        contractor_hourly_rate: '',
        contractor_expected_hours_per_week: '',
        contractor_retainer_amount_monthly: '',
        contractor_invoice_cadence: 'auto_month_end',
        contractor_timesheet_required: false
      }));
    } else if (newType === 'contractor') {
      // Clear employee fields
      setFormData(prev => ({
        ...prev,
        employment_type: newType,
        employee_monthly_salary: '',
        employee_overtime_eligible: false,
        employee_hours_per_week: ''
      }));
    }
  };
  const confirmTypeChange = () => {
    if (pendingTypeChange) {
      applyTypeChange(pendingTypeChange);
      setPendingTypeChange(null);
    }
    setShowTypeChangeDialog(false);
  };

  // Validation matching v1 style
  const isFormValid = () => {
    // Core required fields (from v1)
    const coreValid = formData.idType && formData.idNumber && formData.taxResidence && formData.city && formData.nationality && formData.address && formData.bankName && formData.accountNumber && formData.payFrequency;
    if (!coreValid) return false;

    // Employment type required
    if (!formData.employment_type) return false;

    // Payroll fields
    if (!formData.currency || !formData.start_date) return false;

    // Type-specific validation
    if (formData.employment_type === 'employee') {
      const salary = parseFloat(formData.employee_monthly_salary);
      if (isNaN(salary) || salary <= 0) return false;
    }
    if (formData.employment_type === 'contractor') {
      if (!formData.contractor_billing_model) return false;
      if (formData.contractor_billing_model === 'hourly') {
        const rate = parseFloat(formData.contractor_hourly_rate);
        if (isNaN(rate) || rate <= 0) return false;
      } else if (formData.contractor_billing_model === 'fixed') {
        const retainer = parseFloat(formData.contractor_retainer_amount_monthly);
        if (isNaN(retainer) || retainer <= 0) return false;
      }
    }
    return true;
  };

  // Send Form - same success pattern as v1
  const handleSendForm = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Build F2v2_Payload
    const basePayload = {
      employment_type: formData.employment_type,
      country_code: formData.country_code,
      currency: formData.currency,
      start_date: formData.start_date,
      F2v2_version: "v2"
    };
    let F2v2_Payload: Record<string, unknown>;
    if (formData.employment_type === 'employee') {
      F2v2_Payload = {
        ...basePayload,
        employee_monthly_salary: parseFloat(formData.employee_monthly_salary),
        employee_overtime_eligible: formData.employee_overtime_eligible,
        employee_hours_per_week: formData.employee_hours_per_week ? parseInt(formData.employee_hours_per_week) : null
      };
    } else {
      F2v2_Payload = {
        ...basePayload,
        contractor_billing_model: formData.contractor_billing_model,
        contractor_timesheet_required: formData.contractor_timesheet_required
      };
      if (formData.contractor_billing_model === 'hourly') {
        F2v2_Payload.contractor_hourly_rate = parseFloat(formData.contractor_hourly_rate);
        F2v2_Payload.contractor_expected_hours_per_week = formData.contractor_expected_hours_per_week ? parseInt(formData.contractor_expected_hours_per_week) : null;
      } else {
        F2v2_Payload.contractor_retainer_amount_monthly = parseFloat(formData.contractor_retainer_amount_monthly);
        F2v2_Payload.contractor_invoice_cadence = formData.contractor_invoice_cadence;
      }
    }
    console.log('[F2v2] Payload:', F2v2_Payload);
    F2v2_Analytics.track('flow2_v2_sent', F2v2_Payload);

    // SAME SUCCESS AS v1: toast + navigate
    toast.success("Form sent successfully to " + prefilledData.fullName, {
      description: "Kurt will handle the ATS notification automatically"
    });
    navigate("/flows/admin-dashboard");
  };

  // Cancel - same as v1
  const handleCancel = () => {
    F2v2_Analytics.track('flow2_v2_cancelled');
    navigate("/flows/admin-dashboard");
  };

  // Handle billing model change
  const handleBillingModelChange = (model: F2v2_BillingModel) => {
    setFormData(prev => ({
      ...prev,
      contractor_billing_model: model,
      contractor_timesheet_required: model === 'hourly' ? true : prev.contractor_timesheet_required
    }));
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
      {/* Back Arrow - Top Left */}
      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-foreground hover:bg-transparent">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-8 pt-16 pb-32">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="space-y-8">
          {/* Centered Header with Audio Wave Animation */}
          <div className="flex flex-col items-center pt-8">
            <div className="mb-6" style={{
            maxHeight: '160px'
          }}>
              <AudioWaveVisualizer isActive={false} />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3 text-center">
              Hi Sofia! Let's complete your payroll details
            </h1>
            <p className="text-muted-foreground text-center">
              Let's gather a few more details to get your onboarding started smoothly.
            </p>
          </div>

          {/* Single Page Form */}
          <div className="space-y-6 bg-card rounded-lg border border-border p-6">
            
            {/* EMPLOYMENT TYPE - TOP (v2 addition) */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Employment Type
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <p className="text-xs text-muted-foreground">
                This decides which compensation fields you'll see.
              </p>
              <RadioGroup value={formData.employment_type} onValueChange={value => handleEmploymentTypeChange(value as F2v2_EmploymentType)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employee" id="f2v2-emp-employee" />
                  <Label htmlFor="f2v2-emp-employee" className="cursor-pointer">Employee (EOR)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contractor" id="f2v2-emp-contractor" />
                  <Label htmlFor="f2v2-emp-contractor" className="cursor-pointer">Contractor (COR)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Prefilled fields */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={prefilledData.fullName} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={prefilledData.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={prefilledData.role} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
            </div>

            <div className="space-y-2">
              <Label>Salary</Label>
              <Input value={prefilledData.salary} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
            </div>

            {prefilledData.startDate && <div className="space-y-2">
                <Label>Start Date</Label>
                <Input value={prefilledData.startDate} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
              </div>}

            {/* Divider */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-4">
                Required Fields <Badge variant="secondary" className="ml-2 text-xs">To be filled by you</Badge>
              </p>
            </div>

            {/* Required fields */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                ID Type & Number
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Select value={formData.idType} onValueChange={value => setFormData({
              ...formData,
              idType: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="national-id">National ID</SelectItem>
                  <SelectItem value="drivers-license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="ID Number" value={formData.idNumber} onChange={e => setFormData({
              ...formData,
              idNumber: e.target.value
            })} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Tax Residence
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Input placeholder="e.g., Mexico" value={formData.taxResidence} onChange={e => setFormData({
              ...formData,
              taxResidence: e.target.value
            })} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                City
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Input placeholder="e.g., Monterrey" value={formData.city} onChange={e => setFormData({
              ...formData,
              city: e.target.value
            })} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Nationality
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Input placeholder="e.g., Mexican" value={formData.nationality} onChange={e => setFormData({
              ...formData,
              nationality: e.target.value
            })} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Address
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Textarea placeholder="Full residential address" value={formData.address} onChange={e => setFormData({
              ...formData,
              address: e.target.value
            })} rows={3} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Bank Details
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Input placeholder="Bank Name" value={formData.bankName} onChange={e => setFormData({
              ...formData,
              bankName: e.target.value
            })} className="mb-2" />
              <Input placeholder="Account Number / IBAN" value={formData.accountNumber} onChange={e => setFormData({
              ...formData,
              accountNumber: e.target.value
            })} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Pay Frequency
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              <Select value={formData.payFrequency} onValueChange={value => setFormData({
              ...formData,
              payFrequency: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Pay Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Emergency Contact
                <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input placeholder="Name" value={formData.emergencyContactName} onChange={e => setFormData({
              ...formData,
              emergencyContactName: e.target.value
            })} className="mb-2" />
              <Input placeholder="Phone" value={formData.emergencyContactPhone} onChange={e => setFormData({
              ...formData,
              emergencyContactPhone: e.target.value
            })} />
            </div>

            {/* COMPENSATION BLOCK - v2 addition (conditional) */}
            {formData.employment_type && <>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {formData.employment_type === 'employee' ? 'Compensation (Employee)' : 'Compensation (Contractor)'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {formData.employment_type === 'employee' ? "We'll use this to set up your payroll. Bank details come later in onboarding." : "We'll use this to set up your invoicing. You can still submit invoices manually if needed."}
                  </p>
                </div>

                {/* Common payroll fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Country
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <Select value={formData.country_code} onValueChange={value => setFormData({
                  ...formData,
                  country_code: value
                })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="PH">Philippines</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Payment Currency
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </Label>
                    <Select value={formData.currency} onValueChange={value => setFormData({
                  ...formData,
                  currency: value
                })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sets your pay currency; bank details are collected later.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Start Date
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input type="date" value={formData.start_date} onChange={e => setFormData({
                ...formData,
                start_date: e.target.value
              })} />
                </div>

                {/* Employee-specific fields */}
                {formData.employment_type === 'employee' && <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Monthly Salary
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input text-sm">
                          {formData.currency || 'USD'}
                        </span>
                        <Input type="number" step="0.01" min="0" placeholder="0.00" value={formData.employee_monthly_salary} onChange={e => setFormData({
                    ...formData,
                    employee_monthly_salary: e.target.value
                  })} className="rounded-l-none" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Overtime Eligible</Label>
                        <p className="text-xs text-muted-foreground">Can this employee earn overtime?</p>
                      </div>
                      <Switch checked={formData.employee_overtime_eligible} onCheckedChange={checked => setFormData({
                  ...formData,
                  employee_overtime_eligible: checked
                })} />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Hours per Week
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                      </Label>
                      <Input type="number" min="1" max="80" placeholder="e.g., 40" value={formData.employee_hours_per_week} onChange={e => setFormData({
                  ...formData,
                  employee_hours_per_week: e.target.value
                })} />
                    </div>
                  </div>}

                {/* Contractor-specific fields */}
                {formData.employment_type === 'contractor' && <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        Billing Model
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </Label>
                      <RadioGroup value={formData.contractor_billing_model} onValueChange={value => handleBillingModelChange(value as F2v2_BillingModel)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hourly" id="f2v2-billing-hourly" />
                          <Label htmlFor="f2v2-billing-hourly" className="cursor-pointer">Hourly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="f2v2-billing-fixed" />
                          <Label htmlFor="f2v2-billing-fixed" className="cursor-pointer">Fixed</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Hourly fields */}
                    {formData.contractor_billing_model === 'hourly' && <>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Hourly Rate
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <div className="flex gap-2">
                            <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input text-sm">
                              {formData.currency || 'USD'}
                            </span>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" value={formData.contractor_hourly_rate} onChange={e => setFormData({
                      ...formData,
                      contractor_hourly_rate: e.target.value
                    })} className="rounded-l-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Expected Hours/Week
                            <span className="text-xs text-muted-foreground">(Optional)</span>
                          </Label>
                          <Input type="number" min="1" max="80" placeholder="e.g., 40" value={formData.contractor_expected_hours_per_week} onChange={e => setFormData({
                    ...formData,
                    contractor_expected_hours_per_week: e.target.value
                  })} />
                        </div>
                      </>}

                    {/* Fixed fields */}
                    {formData.contractor_billing_model === 'fixed' && <>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Retainer Amount (per month)
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <div className="flex gap-2">
                            <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input text-sm">
                              {formData.currency || 'USD'}
                            </span>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" value={formData.contractor_retainer_amount_monthly} onChange={e => setFormData({
                      ...formData,
                      contractor_retainer_amount_monthly: e.target.value
                    })} className="rounded-l-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Invoice Cadence
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <Select value={formData.contractor_invoice_cadence} onValueChange={value => setFormData({
                    ...formData,
                    contractor_invoice_cadence: value
                  })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Invoice Cadence" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto_month_end">Auto month-end</SelectItem>
                              <SelectItem value="manual_submit">Manual submit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>}

                    {/* Timesheet Required */}
                    {formData.contractor_billing_model && <div className="flex items-center space-x-2">
                        <Checkbox id="f2v2-timesheet-required" checked={formData.contractor_timesheet_required} onCheckedChange={checked => setFormData({
                  ...formData,
                  contractor_timesheet_required: checked as boolean
                })} disabled={formData.contractor_billing_model === 'hourly'} />
                        <Label htmlFor="f2v2-timesheet-required" className={formData.contractor_billing_model === 'hourly' ? 'text-muted-foreground' : ''}>
                          Timesheet Required
                          {formData.contractor_billing_model === 'hourly' && <span className="ml-2 text-xs text-muted-foreground">(Required for hourly)</span>}
                        </Label>
                      </div>}
                  </div>}
              </>}
          </div>

          {/* Preview message */}
          

          {/* Action Buttons - Cancel + Send Form */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="button" variant="default" onClick={handleSendForm} disabled={!isFormValid()} className="flex-1">
              Send Form
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Type Change Confirmation Dialog */}
      <AlertDialog open={showTypeChangeDialog} onOpenChange={setShowTypeChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Employment Type?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching will clear type-specific fields. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTypeChange(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTypeChange}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default F2v2_CandidateDataForm;