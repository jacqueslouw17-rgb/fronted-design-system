/**
 * Flow 2 v2 - Core Form Step (F2v2_ namespaced)
 * 
 * Collects personal information and employment type selection.
 * Employment type is at the top as per requirements.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Topbar from '@/components/dashboard/Topbar';
import { RoleLensProvider } from '@/contexts/RoleLensContext';
import { F2v2_Stepper, F2v2_STEPS } from '@/components/flows/candidate-data-v2/F2v2_Stepper';
import { useF2v2_FormStore, F2v2_Analytics, F2v2_EmploymentType } from '@/stores/F2v2_FormStore';

const F2v2_CoreForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    core, 
    payroll,
    setCoreData, 
    setPayrollData,
    setEmploymentType,
    clearEmployeeFields,
    clearContractorFields,
    setCurrentStep,
    saveDraft 
  } = useF2v2_FormStore();
  
  const [showTypeChangeDialog, setShowTypeChangeDialog] = useState(false);
  const [pendingType, setPendingType] = useState<F2v2_EmploymentType | null>(null);

  useEffect(() => {
    setCurrentStep(1);
    F2v2_Analytics.track('entered_core_step');
  }, [setCurrentStep]);

  const handleEmploymentTypeChange = (value: string) => {
    const newType = value as F2v2_EmploymentType;
    
    // If there's existing data for the opposite type, show confirmation
    if (payroll.employment_type && payroll.employment_type !== newType) {
      const hasEmployeeData = payroll.employee_base_amount || payroll.employee_rate_structure;
      const hasContractorData = payroll.contractor_hourly_rate || payroll.contractor_retainer_amount || payroll.contractor_billing_model;
      
      if ((payroll.employment_type === 'employee' && hasEmployeeData) ||
          (payroll.employment_type === 'contractor' && hasContractorData)) {
        setPendingType(newType);
        setShowTypeChangeDialog(true);
        return;
      }
    }
    
    setEmploymentType(newType);
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      if (pendingType === 'employee') {
        clearContractorFields();
      } else {
        clearEmployeeFields();
      }
      setEmploymentType(pendingType);
    }
    setShowTypeChangeDialog(false);
    setPendingType(null);
  };

  const isFormValid = () => {
    return (
      payroll.employment_type &&
      core.idType &&
      core.idNumber &&
      core.taxResidence &&
      core.city &&
      core.nationality &&
      core.address
    );
  };

  const handleNext = () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    navigate('/candidate-data-collection-v2/payroll');
  };

  const handleBack = () => {
    navigate('/candidate-data-collection-v2/intro');
  };

  const handleSaveDraft = () => {
    saveDraft();
    toast.success('Draft saved', {
      description: 'You can continue editing this form later'
    });
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
              <F2v2_Stepper currentStep={1} steps={F2v2_STEPS} />

              {/* Header with v2 staging tag */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">Your Information</h1>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Version: v2 (staging)
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Please verify your details and provide the required information.
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
                    <p className="text-sm text-muted-foreground">
                      Your employment type determines how you'll be compensated. Choose carefully—you can change it, but it will reset related fields.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <div className="space-y-6 bg-card rounded-lg border border-border p-6">
                
                {/* Employment Type - TOP OF FORM */}
                <div className="space-y-3 pb-4 border-b border-border">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    Employment Type
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <RadioGroup
                    value={payroll.employment_type}
                    onValueChange={handleEmploymentTypeChange}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <label 
                      htmlFor="employee"
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        payroll.employment_type === 'employee' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="employee" id="employee" />
                      <div>
                        <p className="font-medium">EOR Employee</p>
                        <p className="text-sm text-muted-foreground">Salary-based compensation</p>
                      </div>
                    </label>
                    <label 
                      htmlFor="contractor"
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        payroll.employment_type === 'contractor' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="contractor" id="contractor" />
                      <div>
                        <p className="font-medium">COR Contractor</p>
                        <p className="text-sm text-muted-foreground">Hourly or fixed-rate billing</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                {/* Prefilled fields */}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={core.fullName} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={core.email} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={core.role} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                </div>

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
              </div>

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

        {/* Type Change Confirmation Dialog */}
        <AlertDialog open={showTypeChangeDialog} onOpenChange={setShowTypeChangeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Change Employment Type?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Switching type will clear the compensation fields you've already filled for the current type. Your personal information will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingType(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmTypeChange}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleLensProvider>
  );
};

export default F2v2_CoreForm;
