import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
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
}

interface RequiredFields {
  idType: string;
  idNumber: string;
  taxResidence: string;
  nationality: string;
  address: string;
  bankName: string;
  accountNumber: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

const CandidateDataCollection: React.FC = () => {
  const navigate = useNavigate();
  
  // Pre-filled data from ATS
  const [prefilledData] = useState<PrefilledData>({
    fullName: "Emma Wilson",
    email: "emma.wilson@example.com",
    role: "Senior Backend Developer",
    salary: "£6,500/mo",
    employmentType: "Employee"
  });

  // Required fields state
  const [formData, setFormData] = useState<RequiredFields>({
    idType: "",
    idNumber: "",
    taxResidence: "",
    nationality: "",
    address: "",
    bankName: "",
    accountNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  const [isDraft, setIsDraft] = useState(false);

  const isFormValid = () => {
    return (
      formData.idType &&
      formData.idNumber &&
      formData.taxResidence &&
      formData.nationality &&
      formData.address &&
      formData.bankName &&
      formData.accountNumber
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
          <div className="max-w-4xl mx-auto p-8 pb-32 space-y-6">
            {/* Header Message Block */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        Kurt will handle the details
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Once this form is submitted, I'll automatically notify the ATS — no manual steps needed.
                      </p>
                      <p className="text-xs text-muted-foreground/80 italic">
                        GDPR & UK Employment Law Compliant
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <Accordion type="multiple" defaultValue={["company-data", "candidate-data"]} className="space-y-4">
                    {/* Pre-Filled Company Data Section */}
                    <AccordionItem value="company-data" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Company Data</span>
                          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                            Pre-filled
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Full Name
                            <span className="text-xs text-muted-foreground ml-2">Prefilled from ATS</span>
                          </Label>
                          <Input
                            value={prefilledData.fullName}
                            disabled
                            className="bg-muted/30 cursor-not-allowed"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Email
                            <span className="text-xs text-muted-foreground ml-2">Prefilled from ATS</span>
                          </Label>
                          <Input
                            value={prefilledData.email}
                            disabled
                            className="bg-muted/30 cursor-not-allowed"
                          />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Role
                            <span className="text-xs text-muted-foreground ml-2">Prefilled from ATS</span>
                          </Label>
                          <Input
                            value={prefilledData.role}
                            disabled
                            className="bg-muted/30 cursor-not-allowed"
                          />
                        </div>

                        {/* Salary */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Salary
                            <span className="text-xs text-muted-foreground ml-2">Prefilled from ATS</span>
                          </Label>
                          <Input
                            value={prefilledData.salary}
                            disabled
                            className="bg-muted/30 cursor-not-allowed"
                          />
                        </div>

                        {/* Employment Type */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Employment Type
                            <span className="text-xs text-muted-foreground ml-2">Confirmed by admin</span>
                          </Label>
                          <Input
                            value={prefilledData.employmentType}
                            disabled
                            className="bg-muted/30 cursor-not-allowed"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Required Candidate Data Section */}
                    <AccordionItem value="candidate-data" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Candidate Data</span>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                            Required
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-6">
                        {/* ID Type & Number */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            ID Type & Number
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <Select value={formData.idType} onValueChange={(value) => setFormData({ ...formData, idType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
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
                        </div>

                        {/* Tax Residence */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            Tax Residence
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <Input
                            placeholder="Enter tax residence country"
                            value={formData.taxResidence}
                            onChange={(e) => setFormData({ ...formData, taxResidence: e.target.value })}
                          />
                        </div>

                        {/* Nationality */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            Nationality
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <Input
                            placeholder="Enter nationality"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            Address
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <Input
                            placeholder="Enter full address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          />
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            Bank Details
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <div className="space-y-3">
                            <Input
                              placeholder="Bank Name"
                              value={formData.bankName}
                              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                            <Input
                              placeholder="Account Number / IBAN"
                              value={formData.accountNumber}
                              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Emergency Contact (Optional) */}
                        <div className="space-y-4">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            Emergency Contact
                            <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground">Optional</Badge>
                          </Label>
                          <div className="space-y-3">
                            <Input
                              placeholder="Name"
                              value={formData.emergencyContactName}
                              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            />
                            <Input
                              placeholder="Phone"
                              value={formData.emergencyContactPhone}
                              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={handleSendForm}
                    disabled={!isFormValid()}
                    className="gap-2"
                  >
                    {isFormValid() && <Check className="h-4 w-4" />}
                    Send Form
                  </Button>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                This form will be sent to: <span className="font-medium text-foreground">{prefilledData.fullName}</span> — {prefilledData.role}
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default CandidateDataCollection;
