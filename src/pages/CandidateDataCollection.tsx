import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { RoleLensProvider } from "@/contexts/RoleLensContext";

interface PrefilledData {
  fullName: string;
  email: string;
  role: string;
  salary: string;
  employmentType: string;
  startDate: string | null;
}

interface RequiredFields {
  idType: string;
  idNumber: string;
  taxResidence: string;
  city: string;
  nationality: string;
  address: string;
  bankName: string;
  accountNumber: string;
  payFrequency: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

const CandidateDataCollection: React.FC = () => {
  const navigate = useNavigate();
  
  // Pre-filled data from ATS
  const [prefilledData] = useState<PrefilledData>({
    fullName: "Sofia Rodriguez",
    email: "sofia.rodriguez@email.com",
    role: "Marketing Manager",
    salary: "$72,000 USD",
    employmentType: "Contractor",
    startDate: "2025-02-01" // null if not available from ATS
  });

  // Required fields state
  const [formData, setFormData] = useState<RequiredFields>({
    idType: "",
    idNumber: "",
    taxResidence: "",
    city: "",
    nationality: "",
    address: "",
    bankName: "",
    accountNumber: "",
    payFrequency: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  const [isDraft, setIsDraft] = useState(false);

  const isFormValid = () => {
    return (
      formData.idType &&
      formData.idNumber &&
      formData.taxResidence &&
      formData.city &&
      formData.nationality &&
      formData.address &&
      formData.bankName &&
      formData.accountNumber &&
      formData.payFrequency
    );
  };

  const handleSendForm = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Form sent successfully to " + prefilledData.fullName, {
      description: "Kurt will handle the ATS notification automatically"
    });
    navigate("/flows/admin-dashboard");
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    toast.success("Draft saved", {
      description: "You can continue editing this form later"
    });
  };

  const handleCancel = () => {
    navigate("/flows/admin-dashboard");
  };

  return (
    <RoleLensProvider initialRole="admin">
      <div className="flex flex-col h-screen bg-background">
        <Topbar
          userName="Joe User"
          profileSettingsUrl="/admin/profile-settings"
          dashboardUrl="/flows/admin-dashboard"
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
                <h1 className="text-2xl font-bold mb-2">Onboarding Data Collection Form</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-lg">🇲🇽</span>
                  <span>{prefilledData.fullName} • {prefilledData.role}</span>
                </div>
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
                      Once this form is submitted, I'll automatically notify the ATS — no manual steps needed.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Compliance Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>GDPR & Mexico Employment Law Compliant</span>
              </div>

              {/* Single Step Form */}
              <div className="space-y-6 bg-card rounded-lg border border-border p-6">
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

                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Input value={prefilledData.employmentType} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Confirmed by admin</p>
                </div>

                {prefilledData.startDate && (
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input value={prefilledData.startDate} disabled className="bg-muted/50" />
                    <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                  </div>
                )}

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
                    value={formData.idType} 
                    onValueChange={(value) => setFormData({ ...formData, idType: value })}
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
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Tax Residence
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="e.g., Mexico"
                    value={formData.taxResidence}
                    onChange={(e) => setFormData({ ...formData, taxResidence: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    City
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="e.g., Monterrey"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Nationality
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="e.g., Mexican"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Address
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Textarea
                    placeholder="Full residential address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Bank Details
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    placeholder="Bank Name"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Account Number / IBAN"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Pay Frequency
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Select 
                    value={formData.payFrequency} 
                    onValueChange={(value) => setFormData({ ...formData, payFrequency: value })}
                  >
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
                  <Input
                    placeholder="Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Phone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview message */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  This form will be sent to:
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
                  onClick={handleSendForm}
                  disabled={!isFormValid()}
                  className="flex-1"
                >
                  Send Form
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default CandidateDataCollection;
