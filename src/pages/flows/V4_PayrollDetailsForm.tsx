/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Candidate Payroll Details Form
 * 
 * Trimmed-down version that only asks for payroll details.
 * Contract/person data shown as read-only summary.
 * 
 * Accessed via link sent to candidate from "Collect Payroll Details" column
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle2, Building2, CreditCard, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import frontedLogo from "@/assets/fronted-logo.png";

// Bank country options
const COUNTRIES = [
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
];

// Mock candidate data (would come from token/API in real implementation)
const MOCK_CANDIDATE = {
  id: "c1-1",
  firstName: "Maria",
  lastName: "Santos",
  fullName: "Maria Santos",
  email: "maria.santos@email.com",
  role: "Senior Developer",
  country: "Philippines",
  countryCode: "PH",
  salary: "PHP 120,000/mo",
  currency: "PHP",
  startDate: "2025-02-01",
  employmentType: "contractor" as const,
};

interface PayrollFormState {
  bank_country: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  swift_bic: string;
  routing_code: string;
  pay_frequency: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const V4_PayrollDetailsForm: React.FC = () => {
  const navigate = useNavigate();
  const { candidateToken } = useParams();
  
  // In real implementation, fetch candidate data using token
  const candidate = MOCK_CANDIDATE;
  
  const [formData, setFormData] = useState<PayrollFormState>({
    bank_country: candidate.countryCode,
    bank_name: "",
    account_holder_name: candidate.fullName,
    account_number: "",
    swift_bic: "",
    routing_code: "",
    pay_frequency: "monthly",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleInputChange = (field: keyof PayrollFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.bank_country &&
      formData.bank_name.trim() !== "" &&
      formData.account_holder_name.trim() !== "" &&
      formData.account_number.trim() !== ""
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required bank details");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("[V4_PayrollDetailsForm] Submitting:", formData);
    
    toast.success("Payroll details submitted successfully!", {
      description: "Your admin will be notified and payroll setup will be completed."
    });
    
    setIsSubmitting(false);
    
    // Navigate to success or dashboard
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
      {/* Header with Logo */}
      <div className="absolute top-6 left-6">
        <img src={frontedLogo} alt="Fronted" className="h-8 w-auto cursor-pointer" onClick={() => navigate("/")} />
      </div>

      <div className="max-w-3xl mx-auto px-8 pt-20 pb-32">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6" style={{ maxHeight: '180px' }}>
            <AudioWaveVisualizer isActive={isSpeaking} />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Hi {candidate.firstName}! Let's complete your payroll details
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            We just need your bank and payment details so we can process your payroll smoothly.
          </p>
        </motion.div>

        {/* Contract Summary Card (Read-only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 border-border/40 bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employment Type</p>
                  <p className="font-medium capitalize">{candidate.employmentType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{candidate.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Country</p>
                  <p className="font-medium">{candidate.country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Salary</p>
                  <p className="font-medium">{candidate.salary}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{candidate.startDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Shield className="h-4 w-4 text-primary" />
          <span>GDPR & {candidate.country} Payment Regulations Compliant</span>
        </div>

        {/* Payroll Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Bank Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <Label className="text-base font-semibold">Bank Details</Label>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Required</Badge>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_country">Bank Country</Label>
                <Select 
                  value={formData.bank_country} 
                  onValueChange={(value) => handleInputChange("bank_country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Defaults to your work country, but you can change it if your bank is elsewhere
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">
                  Bank Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  placeholder="e.g., BDO Unibank, DBS Bank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_holder_name">
                  Account Holder Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => handleInputChange("account_holder_name", e.target.value)}
                  placeholder="Name as it appears on your bank account"
                />
                <p className="text-xs text-muted-foreground">
                  Pre-filled from your profile – edit if different on bank account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">
                  Account Number / IBAN <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange("account_number", e.target.value)}
                  placeholder="Enter your account number or IBAN"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="swift_bic">SWIFT / BIC Code</Label>
                  <Input
                    id="swift_bic"
                    value={formData.swift_bic}
                    onChange={(e) => handleInputChange("swift_bic", e.target.value)}
                    placeholder="e.g., BABOROPH"
                  />
                  <p className="text-xs text-muted-foreground">Required for international transfers</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routing_code">Routing / Branch Code</Label>
                  <Input
                    id="routing_code"
                    value={formData.routing_code}
                    onChange={(e) => handleInputChange("routing_code", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pay Frequency (Read-only or selectable) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <Label className="text-base font-semibold">Pay Frequency</Label>
            </div>

            <div className="space-y-2">
              <Select 
                value={formData.pay_frequency} 
                onValueChange={(value) => handleInputChange("pay_frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="semi-monthly">Semi-monthly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                May already be set in your contract – this is your preference
              </p>
            </div>
          </div>

          <Separator />

          {/* Emergency Contact (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <Label className="text-base font-semibold">Emergency Contact</Label>
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                  placeholder="Contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                  placeholder="+63 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex gap-4"
        >
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Payroll Details
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default V4_PayrollDetailsForm;
