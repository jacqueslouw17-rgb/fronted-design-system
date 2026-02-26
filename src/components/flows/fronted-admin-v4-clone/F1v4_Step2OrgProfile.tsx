/**
 * Flow 1 v4 — Organization Profile Step (v4-specific clone)
 * 
 * Clone of Step2OrgProfileSimplified with default currency field
 * that auto-defaults based on Eurozone membership.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface F1v4_Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  isEditMode?: boolean;
  editModeTitle?: string;
  hasSignedContract?: boolean;
  hasCandidates?: boolean;
}

// Eurozone countries per acceptance criteria
const EUROZONE_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

function getDefaultCurrency(countryCode: string): string {
  return EUROZONE_COUNTRY_CODES.has(countryCode) ? "EUR" : "USD";
}

const CURRENCIES = [
  { code: "EUR", label: "EUR – Euro" },
  { code: "USD", label: "USD – US Dollar" },
];

const F1v4_Step2OrgProfile = ({
  formData,
  onComplete,
  isProcessing: externalProcessing,
  isEditMode = false,
  editModeTitle,
  hasSignedContract = false,
}: F1v4_Step2Props) => {
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    hqCountry: formData.hqCountry || "",
    defaultCurrency: formData.defaultCurrency || "EUR",
  });
  const [originalData] = useState({
    companyName: formData.companyName || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    hqCountry: formData.hqCountry || "",
    defaultCurrency: formData.defaultCurrency || "EUR",
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
        defaultCurrency: formData.defaultCurrency || "",
      });
    }
  }, [formData, data.companyName]);

  // Auto-default currency when HQ country changes (only if currency hasn't been manually set or is empty)
  useEffect(() => {
    if (data.hqCountry) {
      const suggested = getDefaultCurrency(data.hqCountry);
      // Only auto-set if currency is empty (user hasn't picked one yet)
      if (!data.defaultCurrency) {
        setData(prev => ({ ...prev, defaultCurrency: suggested }));
      }
    }
  }, [data.hqCountry]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.companyName) newErrors.companyName = "Company name is required";
    if (!data.adminName) newErrors.adminName = "End-client name is required";
    if (!data.adminEmail) newErrors.adminEmail = "End-client email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }
    if (!data.hqCountry) newErrors.hqCountry = "HQ Country is required";
    if (!data.defaultCurrency) newErrors.defaultCurrency = "Default currency is required";
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
    setData(prev => {
      const updated = { ...prev, [fieldName]: value };
      // When country changes, auto-set currency
      if (fieldName === "hqCountry") {
        updated.defaultCurrency = getDefaultCurrency(value);
      }
      return updated;
    });
  };

  const hasChanges = isEditMode ? (
    data.companyName !== originalData.companyName ||
    data.adminName !== originalData.adminName ||
    data.adminEmail !== originalData.adminEmail ||
    data.hqCountry !== originalData.hqCountry ||
    data.defaultCurrency !== originalData.defaultCurrency
  ) : true;

  const isFormValid = data.companyName.trim().length > 0 &&
    data.adminName.trim().length > 0 &&
    data.adminEmail.trim().length > 0 &&
    data.hqCountry.trim().length > 0 &&
    data.defaultCurrency.trim().length > 0 &&
    hasChanges;

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {isEditMode && editModeTitle}
      
      <div className="space-y-3">
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm">Company Name</Label>
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
            <Label htmlFor="adminName" className="text-sm">End-client name</Label>
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
            <Label htmlFor="adminEmail" className="text-sm">End-client email</Label>
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
            <Label htmlFor="hqCountry" className="text-sm">HQ Country</Label>
            <HQCountryCombobox value={data.hqCountry} onChange={val => handleFieldChange('hqCountry', val)} />
            {errors.hqCountry && <p className="text-xs text-destructive">{errors.hqCountry}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Default Currency</Label>
                <p className="text-xs text-muted-foreground">Used across this company's dashboard</p>
              </div>
              <div className="inline-flex rounded-lg bg-muted/50 p-0.5 gap-0.5">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleFieldChange('defaultCurrency', c.code)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 ${
                      data.defaultCurrency === c.code
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
            {errors.defaultCurrency && <p className="text-xs text-destructive mt-1">{errors.defaultCurrency}</p>}
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

export default F1v4_Step2OrgProfile;
