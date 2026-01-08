/**
 * ⚠️ LOCKED COMPONENT - Part of Flow 1.1 Fronted Admin Dashboard v2 ⚠️
 * 
 * This component is part of a LOCKED flow and should NOT be modified.
 * See: src/pages/AdminContractingMultiCompany.tsx
 * Flow: Flow 1.1 — Fronted Admin Dashboard v2
 * Locked Date: 2025-01-15
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  showAutoFillLoading?: boolean;
  isEditMode?: boolean;
  editModeTitle?: string;
  hasSignedContract?: boolean;
  hasCandidates?: boolean;
  existingCountries?: string[];
}

const Step2OrgProfileSimplified = ({
  formData,
  onComplete,
  isProcessing: externalProcessing,
  isEditMode = false,
  editModeTitle,
  hasSignedContract = false,
}: Step2Props) => {
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    hqCountry: formData.hqCountry || "",
  });
  const [originalData] = useState({
    companyName: formData.companyName || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    hqCountry: formData.hqCountry || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch for formData updates
  useEffect(() => {
    if (formData.companyName && formData.companyName !== data.companyName) {
      setData({
        companyName: formData.companyName || "",
        adminName: formData.adminName || "",
        adminEmail: formData.adminEmail || "",
        hqCountry: formData.hqCountry || "",
      });
    }
  }, [formData, data.companyName]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.companyName) newErrors.companyName = "Company name is required";
    if (!data.adminName) newErrors.adminName = "End-client name is required";
    if (!data.adminEmail) newErrors.adminEmail = "End-client email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }
    if (!data.hqCountry) newErrors.hqCountry = "HQ Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onComplete("org_profile", data);
    setIsSubmitting(false);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const hasChanges = isEditMode ? (
    data.companyName !== originalData.companyName ||
    data.adminName !== originalData.adminName ||
    data.adminEmail !== originalData.adminEmail ||
    data.hqCountry !== originalData.hqCountry
  ) : true;

  const isFormValid = data.companyName.trim().length > 0 && data.adminName.trim().length > 0 && data.adminEmail.trim().length > 0 && data.hqCountry.trim().length > 0 && hasChanges;

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {isEditMode && editModeTitle}
      
      <div className="space-y-3">
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm">
              Company Name
            </Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={e => handleFieldChange('companyName', e.target.value)}
              placeholder="Fronted Test Co"
              className="text-sm"
              disabled={isEditMode && hasSignedContract}
              readOnly={isEditMode && hasSignedContract}
            />
            {isEditMode && hasSignedContract && (
              <p className="text-xs text-muted-foreground">
                Company name cannot be changed as there are signed contracts for this company.
              </p>
            )}
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminName" className="text-sm">
              End-client name
            </Label>
            <Input
              id="adminName"
              value={data.adminName}
              onChange={e => handleFieldChange('adminName', e.target.value)}
              placeholder="John Doe"
              className="text-sm"
            />
            {errors.adminName && <p className="text-xs text-destructive">{errors.adminName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-sm">
              End-client email
            </Label>
            <Input
              id="adminEmail"
              type="email"
              value={data.adminEmail}
              onChange={e => handleFieldChange('adminEmail', e.target.value)}
              placeholder="admin@company.com"
              className="text-sm"
              disabled={isEditMode}
              readOnly={isEditMode}
            />
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                Email cannot be changed as it is linked to this company's account.
              </p>
            )}
            {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hqCountry" className="text-sm">
              HQ Country
            </Label>
            <Select value={data.hqCountry} onValueChange={val => handleFieldChange('hqCountry', val)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
                <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
                <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
              </SelectContent>
            </Select>
            {errors.hqCountry && <p className="text-xs text-destructive">{errors.hqCountry}</p>}
          </div>
        </div>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing || isSubmitting || !isFormValid}>
        {(externalProcessing || isSubmitting) ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isEditMode ? "Saving..." : "Adding..."}
          </>
        ) : isEditMode ? "Save Changes" : "Add"}
      </Button>
    </div>
  );
};

export default Step2OrgProfileSimplified;