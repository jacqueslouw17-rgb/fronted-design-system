/**
 * Flow 2 v2 - Review & Submit Step (F2v2_ namespaced)
 * 
 * Read-only summary of all collected data with edit links.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Shield, Edit2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Topbar from '@/components/dashboard/Topbar';
import { RoleLensProvider } from '@/contexts/RoleLensContext';
import { F2v2_Stepper, F2v2_STEPS } from '@/components/flows/candidate-data-v2/F2v2_Stepper';
import { useF2v2_FormStore, F2v2_Analytics } from '@/stores/F2v2_FormStore';

const F2v2_ReviewSubmit: React.FC = () => {
  const navigate = useNavigate();
  const { 
    core, 
    payroll,
    setCurrentStep,
    saveDraft,
    submit,
    F2v2_version
  } = useF2v2_FormStore();

  useEffect(() => {
    setCurrentStep(3);
    F2v2_Analytics.track('entered_review_step');
  }, [setCurrentStep]);

  const handleBack = () => {
    navigate('/candidate-data-collection-v2/payroll');
  };

  const handleSaveDraft = () => {
    saveDraft();
    toast.success('Draft saved', {
      description: 'You can continue editing this form later'
    });
  };

  const handleSubmit = () => {
    // Build F2v2_Payload
    const F2v2_Payload = {
      version: F2v2_version,
      submitted_at: new Date().toISOString(),
      profile: {
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
      employment: {
        type: payroll.employment_type,
        country_code: payroll.country_code,
        currency: payroll.currency,
        start_date: payroll.start_date,
      },
      compensation: payroll.employment_type === 'employee' 
        ? {
            rate_structure: payroll.employee_rate_structure,
            base_amount: payroll.employee_base_amount,
            allowances: payroll.employee_allowances,
            overtime_eligible: payroll.employee_overtime_eligible,
            hours_per_week: payroll.employee_hours_per_week,
          }
        : {
            billing_model: payroll.contractor_billing_model,
            hourly_rate: payroll.contractor_hourly_rate,
            max_hours_per_period: payroll.contractor_max_hours_per_period,
            retainer_amount: payroll.contractor_retainer_amount,
            billing_cadence: payroll.contractor_billing_cadence,
            invoice_cadence: payroll.contractor_invoice_cadence,
            timesheet_required: payroll.contractor_timesheet_required,
          },
    };

    // Log to console (v2-only action)
    console.log('[F2v2_SubmitAction] Payload:', JSON.stringify(F2v2_Payload, null, 2));
    F2v2_Analytics.track('submitted_candidate_data_v2', F2v2_Payload);

    submit();
    toast.success('Form submitted successfully!');
    navigate('/candidate-data-collection-v2/success');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payroll.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

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
              <F2v2_Stepper currentStep={3} steps={F2v2_STEPS} />

              {/* Header with v2 staging tag */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">Review Your Information</h1>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Version: v2 (staging)
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Please review all details before submitting. Click "Edit" to make changes.
                </p>
              </div>

              {/* Profile Section */}
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Profile Information</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/candidate-data-collection-v2/core')}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{core.fullName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{core.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium">{core.role || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ID Type</p>
                    <p className="font-medium capitalize">{core.idType?.replace('-', ' ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ID Number</p>
                    <p className="font-medium">{core.idNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Residence</p>
                    <p className="font-medium">{core.taxResidence || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">{core.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nationality</p>
                    <p className="font-medium">{core.nationality || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{core.address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Type Section */}
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Employment Type</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/candidate-data-collection-v2/core')}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize text-base px-3 py-1">
                    {payroll.employment_type === 'employee' ? 'EOR Employee' : 'COR Contractor'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {payroll.employment_type === 'employee' ? 'Salary-based compensation' : 'Hourly or fixed-rate billing'}
                  </span>
                </div>
              </div>

              {/* Compensation Section */}
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Compensation</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/candidate-data-collection-v2/payroll')}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{payroll.start_date || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Currency</p>
                    <p className="font-medium">{payroll.currency || '—'}</p>
                  </div>

                  {payroll.employment_type === 'employee' && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Rate Structure</p>
                        <p className="font-medium capitalize">
                          {payroll.employee_rate_structure?.replace('_', ' ') || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Base Amount</p>
                        <p className="font-medium">{formatCurrency(payroll.employee_base_amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Overtime Eligible</p>
                        <p className="font-medium">{payroll.employee_overtime_eligible ? 'Yes' : 'No'}</p>
                      </div>
                      {payroll.employee_hours_per_week && (
                        <div>
                          <p className="text-muted-foreground">Hours per Week</p>
                          <p className="font-medium">{payroll.employee_hours_per_week}</p>
                        </div>
                      )}
                    </>
                  )}

                  {payroll.employment_type === 'contractor' && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Billing Model</p>
                        <p className="font-medium capitalize">{payroll.contractor_billing_model || '—'}</p>
                      </div>
                      {payroll.contractor_billing_model === 'hourly' && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Hourly Rate</p>
                            <p className="font-medium">{formatCurrency(payroll.contractor_hourly_rate)}</p>
                          </div>
                          {payroll.contractor_max_hours_per_period && (
                            <div>
                              <p className="text-muted-foreground">Max Hours per Period</p>
                              <p className="font-medium">{payroll.contractor_max_hours_per_period}</p>
                            </div>
                          )}
                        </>
                      )}
                      {payroll.contractor_billing_model === 'fixed' && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Retainer Amount</p>
                            <p className="font-medium">{formatCurrency(payroll.contractor_retainer_amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Billing Cadence</p>
                            <p className="font-medium capitalize">
                              {payroll.contractor_billing_cadence?.replace('_', ' ') || '—'}
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-muted-foreground">Invoice Cadence</p>
                        <p className="font-medium capitalize">
                          {payroll.contractor_invoice_cadence?.replace('-', ' ') || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timesheet Required</p>
                        <p className="font-medium">{payroll.contractor_timesheet_required ? 'Yes' : 'No'}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Allowances for employee */}
                {payroll.employment_type === 'employee' && payroll.employee_allowances.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm mb-2">Allowances</p>
                    <div className="space-y-2">
                      {payroll.employee_allowances.map((allowance) => (
                        <div key={allowance.id} className="flex justify-between text-sm">
                          <span>{allowance.label || 'Unnamed'}</span>
                          <span className="font-medium">{formatCurrency(allowance.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    <p className="text-sm text-muted-foreground">
                      Once you submit, our team will review your information and proceed with the next steps. 
                      You'll receive an email confirmation shortly.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Confirmation checklist */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Personal information verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Employment type selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Compensation details configured</span>
                </div>
              </div>

              {/* Compliance Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>GDPR Compliant • Your data is encrypted and secure</span>
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
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default F2v2_ReviewSubmit;
