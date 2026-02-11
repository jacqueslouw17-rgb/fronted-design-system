/**
 * Flow 3 – Candidate Onboarding v2
 * Step 2: Personal Profile
 * 
 * Mirrors Flow 1 v4 "Personal Profile" category with worker-friendly tone.
 * Includes identity document upload (no separate Documents section).
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, AlertCircle, Lock, Upload, FileText, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { personalInfoSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import NationalitySelect from "@/components/shared/NationalitySelect";
import { motion, AnimatePresence } from "framer-motion";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep2PersonalProfile_v2 = ({ formData, onComplete, isProcessing, isLoadingFields }: Step2Props) => {
  const hasPersistedData = formData && Object.keys(formData).length > 0 && formData.fullName;
  const country = formData.country || "Philippines";

  const [data, setData] = useState({
    fullName: formData.fullName || formData.workerName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    nationality: formData.nationality || "",
    address: formData.address || "",
    tinNumber: formData.tinNumber || "",
    philHealthNumber: formData.philHealthNumber || "",
    nationalId: formData.nationalId || "",
    identityDocUploaded: formData.identityDocUploaded || false,
  });

  const [identityFileName, setIdentityFileName] = useState<string>(formData.identityFileName || "");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(!hasPersistedData);

  // Simulate data retrieval
  useEffect(() => {
    if (isLoading && !hasPersistedData) {
      const timer = setTimeout(() => {
        setData({
          fullName: "Maria Santos",
          email: "maria.santos@example.com",
          phone: "+63 912 345 6789",
          dateOfBirth: new Date(1995, 5, 15),
          nationality: "PH",
          address: "123 Main St, Manila",
          tinNumber: "123-456-789-000",
          philHealthNumber: "12-345678901-2",
          nationalId: "1234-5678-9012-3456",
          identityDocUploaded: false,
        });
        setIsLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasPersistedData]);

  const handleInputChange = (fieldName: string, value: string) => {
    setData({ ...data, [fieldName]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) return;
      setIdentityFileName(file.name);
      setData({ ...data, identityDocUploaded: true });
    }
  };

  const handleRemoveFile = () => {
    setIdentityFileName("");
    setData({ ...data, identityDocUploaded: false });
  };

  const handleContinue = () => {
    try {
      const dataToValidate = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : ""
      };
      personalInfoSchema.parse(dataToValidate);
      setValidationError("");
      onComplete("personal_profile", { ...dataToValidate, identityFileName });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("Please fill in all required fields correctly");
      }
    }
  };

  const isValid = data.fullName && data.email && data.phone;

  const getCountrySpecificFields = () => {
    if (country === "Philippines") {
      return [
        { id: "tinNumber", label: "TIN (Tax Identification Number)", field: "tinNumber" },
        { id: "philHealthNumber", label: "PhilHealth Number", field: "philHealthNumber" },
        { id: "nationalId", label: "National ID", field: "nationalId" },
      ];
    } else if (country === "Norway") {
      return [
        { id: "nationalId", label: "National ID or D-Number", field: "nationalId" },
      ];
    }
    return [
      { id: "nationalId", label: "National ID or Passport Number", field: "nationalId" },
    ];
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="space-y-6 p-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Personal Profile</h3>
          <p className="text-sm text-muted-foreground">
            Review and confirm your personal details. Some fields are pre-filled from your contract.
          </p>
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {isLoading || isLoadingFields ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Full Name (locked) */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                Full name
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                id="fullName"
                value={data.fullName}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            {/* Email (locked) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Date of Birth (locked) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Date of birth
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                value={data.dateOfBirth ? data.dateOfBirth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            {/* Nationality (locked) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Nationality
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                value={data.nationality === 'PH' ? '🇵🇭 Filipino' : data.nationality}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            {/* Residential Address (locked) */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                Residential address
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                id="address"
                value={data.address}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            {/* Country-specific IDs */}
            {getCountrySpecificFields().map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  value={data[field.field as keyof typeof data] as string}
                  onChange={(e) => handleInputChange(field.field, e.target.value)}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                />
              </div>
            ))}

            {/* Identity Document Upload */}
            <div className="space-y-2">
              <Label>Identity document (JPG, PNG, or PDF)</Label>
              {identityFileName ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1 truncate">{identityFileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!isValid || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Saving..." : "Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep2PersonalProfile_v2;
