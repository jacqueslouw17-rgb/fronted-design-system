/**
 * Flow 2 v2 - Candidate Data Collection (Single Page Form)
 * 
 * Matches v1 layout with added:
 * - Employment Type at top (editable)
 * - Conditional payroll fields based on employment type
 * 
 * Version: v2 (staging)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Shield, CheckCircle2 } from "lucide-react";
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
import Topbar from "@/components/dashboard/Topbar";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useF2v2_FormStore, F2v2_Analytics, F2v2_EmploymentType } from "@/stores/F2v2_FormStore";

// Currency options
const CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'MXN', label: 'MXN - Mexican Peso' },
  { code: 'PHP', label: 'PHP - Philippine Peso' },
  { code: 'BRL', label: 'BRL - Brazilian Real' },
  { code: 'INR', label: 'INR - Indian Rupee' },
];

const F2v2_CandidateDataForm: React.FC = () => {
  const navigate = useNavigate();
  
  // v2 Form Store
  const {
    core,
    payroll,
    setCoreData,
    setPayrollData,
    setEmploymentType,
    clearEmployeeFields,
    clearContractorFields,
    saveDraft,
    submit,
    reset,
  } = useF2v2_FormStore();

  // Local state for type change confirmation
  const [pendingTypeChange, setPendingTypeChange] = useState<F2v2_EmploymentType | null>(null);
  const [showTypeChangeDialog, setShowTypeChangeDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track page open
  useEffect(() => {
    F2v2_Analytics.track('flow2_v2_opened');
  }, []);

  // Pre-filled data (simulating ATS data)
  const prefilledData = {
    fullName: core.fullName || "Sofia Rodriguez",
    email: core.email || "sofia.rodriguez@email.com",
    role: core.role || "Marketing Manager",
  };

  // Initialize core data if empty
  useEffect(() => {
    if (!core.fullName) {
      setCoreData({
        fullName: "Sofia Rodriguez",
        email: "sofia.rodriguez@email.com",
        role: "Marketing Manager",
      });
    }
  }, []);

  // Handle employment type change
  const handleEmploymentTypeChange = (newType: F2v2_EmploymentType) => {
    const currentType = payroll.employment_type;
    
    // If switching types and has data in opposite type fields, show confirmation
    if (currentType && currentType !== newType) {
      const hasEmployeeData = payroll.employee_base_amount !== null || payroll.employee_allowances.length > 0;
      const hasContractorData = payroll.contractor_hourly_rate !== null || payroll.contractor_retainer_amount !== null;
      
      if ((currentType === 'employee' && hasEmployeeData) || (currentType === 'contractor' && hasContractorData)) {
        setPendingTypeChange(newType);
        setShowTypeChangeDialog(true);
        return;
      }
    }
    
    setEmploymentType(newType);
    if (newType === 'employee') {
      clearContractorFields();
    } else {
      clearEmployeeFields();
    }
  };

  const confirmTypeChange = () => {
    if (pendingTypeChange) {
      setEmploymentType(pendingTypeChange);
      if (pendingTypeChange === 'employee') {
        clearContractorFields();
      } else {
        clearEmployeeFields();
      }
      setPendingTypeChange(null);
    }
    setShowTypeChangeDialog(false);
  };

  // Validation
  const isFormValid = () => {
    // Basic required fields
    if (!payroll.employment_type) return false;
    if (!payroll.currency) return false;
    if (!payroll.start_date) return false;
    if (!core.idType || !core.idNumber) return false;
    if (!core.taxResidence || !core.city || !core.nationality || !core.address) return false;

    // Type-specific validation
    if (payroll.employment_type === 'employee') {
      if (!payroll.employee_base_amount || payroll.employee_base_amount <= 0) return false;
    }
    
    if (payroll.employment_type === 'contractor') {
      if (payroll.contractor_billing_model === 'hourly') {
        if (!payroll.contractor_hourly_rate || payroll.contractor_hourly_rate <= 0) return false;
      } else if (payroll.contractor_billing_model === 'fixed') {
        if (!payroll.contractor_retainer_amount || payroll.contractor_retainer_amount <= 0) return false;
      } else {
        return false; // No billing model selected
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Build F2v2_Payload
    const F2v2_Payload = {
      version: 'v2',
      submitted_at: new Date().toISOString(),
      core: {
        fullName: core.fullName,
        email: core.email,
        role: core.role,
        idType: core.idType,
        idNumber: core.idNumber,
        taxResidence: core.taxResidence,
        city: core.city,
        nationality: core.nationality,
        address: core.address,
      },
      payroll: {
        employment_type: payroll.employment_type,
        country_code: payroll.country_code,
        currency: payroll.currency,
        start_date: payroll.start_date,
        ...(payroll.employment_type === 'employee' ? {
          employee_rate_structure: payroll.employee_rate_structure || 'monthly_salary',
          employee_base_amount: payroll.employee_base_amount,
          employee_overtime_eligible: payroll.employee_overtime_eligible,
          employee_hours_per_week: payroll.employee_hours_per_week,
          employee_allowances: payroll.employee_allowances,
        } : {
          contractor_billing_model: payroll.contractor_billing_model,
          contractor_hourly_rate: payroll.contractor_hourly_rate,
          contractor_expected_hours_per_week: payroll.contractor_max_hours_per_period,
          contractor_retainer_amount: payroll.contractor_retainer_amount,
          contractor_invoice_cadence: payroll.contractor_invoice_cadence,
          contractor_timesheet_required: payroll.contractor_timesheet_required,
          contractor_billing_cadence: payroll.contractor_billing_cadence,
        }),
      },
    };

    console.log('[F2v2] Submitted payload:', F2v2_Payload);
    F2v2_Analytics.track('flow2_v2_submitted', F2v2_Payload);
    
    submit();
    setIsSubmitted(true);
    toast.success("Form submitted successfully!", {
      description: "Your candidate data has been saved."
    });
  };

  const handleSaveDraft = () => {
    saveDraft();
    F2v2_Analytics.track('flow2_v2_saved_draft');
    toast.success("Draft saved", {
      description: "You can continue editing this form later"
    });
  };

  const handleCancel = () => {
    navigate("/flows");
  };

  // Format currency input
  const formatCurrencyValue = (value: number | null): string => {
    if (value === null) return '';
    return value.toFixed(2);
  };

  const parseCurrencyInput = (input: string): number | null => {
    const cleaned = input.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : Math.round(parsed * 100) / 100;
  };

  if (isSubmitted) {
    return (
      <RoleLensProvider initialRole="contractor">
        <div className="flex flex-col h-screen bg-background">
          <Topbar
            userName="Sofia Rodriguez"
            profileSettingsUrl="/candidate/profile-settings"
            dashboardUrl="/flows"
          />
          <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
            <div className="max-w-4xl mx-auto p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Submission Complete!</h1>
                <p className="text-muted-foreground mb-6">
                  Your candidate data has been submitted successfully.
                </p>
                <Button onClick={() => navigate("/flows")}>
                  Return to Flows
                </Button>
              </motion.div>
            </div>
          </main>
        </div>
      </RoleLensProvider>
    );
  }

  return (
    <RoleLensProvider initialRole="contractor">
      <div className="flex flex-col h-screen bg-background">
        <Topbar
          userName="Sofia Rodriguez"
          profileSettingsUrl="/candidate/profile-settings"
          dashboardUrl="/flows"
        />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
          <div className="max-w-4xl mx-auto p-8 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">Candidate Details</h1>
                  <Badge variant="outline" className="text-xs">v2 staging</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please provide your details. This helps us set up payroll or invoicing.
                </p>
              </div>

              {/* Kurt Message Block */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground mb-1">Kurt will handle the details</p>
                    <p className="text-xs text-muted-foreground">
                      Once this form is submitted, I'll automatically notify the system — no manual steps needed.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Compliance Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>GDPR & Employment Law Compliant</span>
              </div>

              {/* Single Page Form */}
              <div className="space-y-6 bg-card rounded-lg border border-border p-6">
                
                {/* SECTION 1: Employment Type (TOP) */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    Employment Type
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This decides which compensation fields you'll see.
                  </p>
                  <RadioGroup
                    value={payroll.employment_type}
                    onValueChange={(value) => handleEmploymentTypeChange(value as F2v2_EmploymentType)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="employee" id="emp-employee" />
                      <Label htmlFor="emp-employee" className="cursor-pointer">Employee (EOR)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contractor" id="emp-contractor" />
                      <Label htmlFor="emp-contractor" className="cursor-pointer">Contractor (COR)</Label>
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

                {/* Divider */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-4">
                    Required Fields <Badge variant="secondary" className="ml-2 text-xs">To be filled by you</Badge>
                  </p>
                </div>

                {/* Required fields - Core Info */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    ID Type & Number
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Select 
                    value={core.idType} 
                    onValueChange={(value) => setCoreData({ idType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national-id">National ID</SelectItem>
                      <SelectItem value="drivers-license">Driver's License</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="ID Number"
                    value={core.idNumber}
                    onChange={(e) => setCoreData({ idNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Tax Residence
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="e.g., Mexico"
                    value={core.taxResidence}
                    onChange={(e) => setCoreData({ taxResidence: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    City
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="e.g., Monterrey"
                    value={core.city}
                    onChange={(e) => setCoreData({ city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Nationality
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="e.g., Mexican"
                    value={core.nationality}
                    onChange={(e) => setCoreData({ nationality: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Address
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Textarea
                    placeholder="Full residential address"
                    value={core.address}
                    onChange={(e) => setCoreData({ address: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* SECTION 2: Payroll / Invoicing */}
                {payroll.employment_type && (
                  <>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {payroll.employment_type === 'employee' 
                          ? 'Compensation (Employee)' 
                          : 'Compensation (Contractor)'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {payroll.employment_type === 'employee'
                          ? "We'll use this to set up your payroll. Bank details come later in onboarding."
                          : "We'll use this to set up your invoicing. You can still submit invoices manually if needed."}
                      </p>
                    </div>

                    {/* Common fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Country
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        </Label>
                        <Select 
                          value={payroll.country_code} 
                          onValueChange={(value) => setPayrollData({ country_code: value })}
                        >
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
                        <Select 
                          value={payroll.currency} 
                          onValueChange={(value) => setPayrollData({ currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          This just sets your pay currency; bank details are collected later.
                        </p>
                      </div>
                    </div>

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

                    {/* Employee-specific fields */}
                    {payroll.employment_type === 'employee' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Monthly Salary
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <div className="flex gap-2">
                            <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input text-sm">
                              {payroll.currency || 'USD'}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={payroll.employee_base_amount ?? ''}
                              onChange={(e) => setPayrollData({ 
                                employee_base_amount: parseCurrencyInput(e.target.value),
                                employee_rate_structure: 'monthly_salary'
                              })}
                              className="rounded-l-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Overtime Eligible</Label>
                            <p className="text-xs text-muted-foreground">Can this employee earn overtime?</p>
                          </div>
                          <Switch
                            checked={payroll.employee_overtime_eligible}
                            onCheckedChange={(checked) => setPayrollData({ employee_overtime_eligible: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Hours per Week
                            <span className="text-xs text-muted-foreground">(Optional)</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="80"
                            placeholder="e.g., 40"
                            value={payroll.employee_hours_per_week ?? ''}
                            onChange={(e) => setPayrollData({ 
                              employee_hours_per_week: e.target.value ? parseInt(e.target.value) : null 
                            })}
                          />
                        </div>
                      </div>
                    )}

                    {/* Contractor-specific fields */}
                    {payroll.employment_type === 'contractor' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            Billing Model
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          </Label>
                          <RadioGroup
                            value={payroll.contractor_billing_model}
                            onValueChange={(value) => setPayrollData({ 
                              contractor_billing_model: value as 'hourly' | 'fixed',
                              contractor_timesheet_required: value === 'hourly' ? true : payroll.contractor_timesheet_required
                            })}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hourly" id="billing-hourly" />
                              <Label htmlFor="billing-hourly" className="cursor-pointer">Hourly</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fixed" id="billing-fixed" />
                              <Label htmlFor="billing-fixed" className="cursor-pointer">Fixed</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Hourly fields */}
                        {payroll.contractor_billing_model === 'hourly' && (
                          <>
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                Hourly Rate
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              </Label>
                              <div className="flex gap-2">
                                <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input text-sm">
                                  {payroll.currency || 'USD'}
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={payroll.contractor_hourly_rate ?? ''}
                                  onChange={(e) => setPayrollData({ 
                                    contractor_hourly_rate: parseCurrencyInput(e.target.value) 
                                  })}
                                  className="rounded-l-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                Expected Hours/Week
                                <span className="text-xs text-muted-foreground">(Optional)</span>
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max="80"
                                placeholder="e.g., 40"
                                value={payroll.contractor_max_hours_per_period ?? ''}
                                onChange={(e) => setPayrollData({ 
                                  contractor_max_hours_per_period: e.target.value ? parseInt(e.target.value) : null 
                                })}
                              />
                            </div>
                          </>
                        )}

                        {/* Fixed fields */}
                        {payroll.contractor_billing_model === 'fixed' && (
                          <>
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                Retainer Amount (per month)
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              </Label>
                              <div className="flex gap-2">
                                <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-input text-sm">
                                  {payroll.currency || 'USD'}
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={payroll.contractor_retainer_amount ?? ''}
                                  onChange={(e) => setPayrollData({ 
                                    contractor_retainer_amount: parseCurrencyInput(e.target.value) 
                                  })}
                                  className="rounded-l-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                Invoice Cadence
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              </Label>
                              <Select 
                                value={payroll.contractor_invoice_cadence} 
                                onValueChange={(value) => setPayrollData({ 
                                  contractor_invoice_cadence: value as 'auto-month-end' | 'manual-submit' 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Invoice Cadence" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto-month-end">Auto month-end</SelectItem>
                                  <SelectItem value="manual-submit">Manual submit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {/* Timesheet Required - shown for both billing models */}
                        {payroll.contractor_billing_model && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="timesheet-required"
                              checked={payroll.contractor_timesheet_required}
                              onCheckedChange={(checked) => setPayrollData({ 
                                contractor_timesheet_required: checked as boolean 
                              })}
                              disabled={payroll.contractor_billing_model === 'hourly'}
                            />
                            <Label 
                              htmlFor="timesheet-required" 
                              className={payroll.contractor_billing_model === 'hourly' ? 'text-muted-foreground' : ''}
                            >
                              Timesheet Required
                              {payroll.contractor_billing_model === 'hourly' && (
                                <span className="ml-2 text-xs text-muted-foreground">(Required for hourly)</span>
                              )}
                            </Label>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Preview message */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  This form will be submitted for:
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{prefilledData.fullName}</p>
                    <p className="text-xs text-muted-foreground">{prefilledData.role}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  className="flex-1"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className="flex-1"
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
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
    </RoleLensProvider>
  );
};

export default F2v2_CandidateDataForm;
