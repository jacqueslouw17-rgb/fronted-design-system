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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Building2, User, Calendar, Loader2, Info, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import StandardInput from "@/components/shared/StandardInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  showAutoFillLoading?: boolean; // allow disabling auto-fill spinner in settings
  // Edit mode props
  isEditMode?: boolean;
  editModeTitle?: string;
  hasSignedContract?: boolean; // Business rule: Company name can't change if signed contract exists
  hasCandidates?: boolean; // Business rule: restrictions apply if candidates added
  existingCountries?: string[]; // Countries already set (can only add, not remove if candidates exist)
}
const Step2OrgProfileSimplified = ({
  formData,
  onComplete,
  isProcessing: externalProcessing,
  isLoadingFields = false,
  showAutoFillLoading = false,
  isEditMode = false,
  editModeTitle,
  hasSignedContract = false,
  hasCandidates = false,
  existingCountries = []
}: Step2Props) => {
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    hqCountry: formData.hqCountry || "",
    payrollCurrency: formData.payrollCurrency || (Array.isArray(formData.payrollCurrency) ? formData.payrollCurrency : []),
    payrollFrequency: formData.payrollFrequency || "monthly",
    payoutDay: formData.payoutDay || ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const { speak } = {} as any; // voice removed

  // Watch for formData updates from Kurt
  useEffect(() => {
    if (formData.companyName && formData.companyName !== data.companyName) {
      setData({
        companyName: formData.companyName || "",
        adminName: formData.adminName || "",
        adminEmail: formData.adminEmail || "",
        hqCountry: formData.hqCountry || "",
        payrollCurrency: formData.payrollCurrency || (Array.isArray(formData.payrollCurrency) ? formData.payrollCurrency : []),
        payrollFrequency: formData.payrollFrequency || "monthly",
        payoutDay: formData.payoutDay || ""
      });
    }
  }, [formData, data.companyName]);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.companyName) newErrors.companyName = "Company name is required";
    if (!data.adminName) newErrors.adminName = "Admin name is required";
    if (!data.adminEmail) newErrors.adminEmail = "Admin email is required";else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }
    if (!data.hqCountry) newErrors.hqCountry = "HQ Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = () => {
    if (!validate()) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    // No generic save notification - let the step transition speak for itself
    onComplete("org_profile", data);
  };
  const getFrequencyHint = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "Payouts every Friday";
      case "bi-weekly":
        return "Payouts every other Friday";
      case "monthly":
        return "Payouts once per month";
      default:
        return "";
    }
  };
  const handleFieldChange = (fieldName: string, value: string | string[]) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Check if all required fields are filled
  const isFormValid = data.companyName.trim().length > 0 && data.adminName.trim().length > 0 && data.adminEmail.trim().length > 0 && data.hqCountry.trim().length > 0;
  return <div className="space-y-5 max-w-xl mx-auto">
      {/* Edit Mode Title */}
      {isEditMode && editModeTitle}
      
      {/* Company Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Company Details
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input id="companyName" value={data.companyName} onChange={e => handleFieldChange('companyName', e.target.value)} placeholder="Fronted Test Co" className="text-sm" disabled={isEditMode && hasSignedContract} readOnly={isEditMode && hasSignedContract} />
            {isEditMode && hasSignedContract && <p className="text-xs text-muted-foreground">
                Company name cannot be changed as there are signed contracts for this company.
              </p>}
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminName" className="text-sm">
              End-client name <span className="text-destructive">*</span>
            </Label>
            <Input id="adminName" value={data.adminName} onChange={e => handleFieldChange('adminName', e.target.value)} placeholder="John Doe" className="text-sm" />
            {errors.adminName && <p className="text-xs text-destructive">{errors.adminName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-sm">
              End-client email <span className="text-destructive">*</span>
            </Label>
            <Input id="adminEmail" type="email" value={data.adminEmail} onChange={e => handleFieldChange('adminEmail', e.target.value)} placeholder="admin@company.com" className="text-sm" disabled={isEditMode} readOnly={isEditMode} />
            {isEditMode && <p className="text-xs text-muted-foreground">
                Email cannot be changed as it is linked to this company's account.
              </p>}
            {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hqCountry" className="text-sm">
              HQ Country <span className="text-destructive">*</span>
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

          <div className="space-y-2">
            <Label htmlFor="payrollCurrency" className="text-sm">
              Payroll Currencies
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between text-sm h-10 hover:bg-card hover:text-foreground hover:shadow-none">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {Array.isArray(data.payrollCurrency) && data.payrollCurrency.length > 0 ? data.payrollCurrency.map(currency => <span key={currency} className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors">
                          {currency}
                          <button type="button" onClick={e => {
                      e.stopPropagation();
                      const newCurrencies = data.payrollCurrency.filter((c: string) => c !== currency);
                      handleFieldChange('payrollCurrency', newCurrencies);
                    }} className="rounded-sm p-0.5">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>) : <span className="text-muted-foreground">Select currencies</span>}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-1.5 space-y-0.5">
                  {[{
                  value: "NOK",
                  label: "NOK - Norwegian Krone"
                }, {
                  value: "DKK",
                  label: "DKK - Danish Krone"
                }, {
                  value: "SEK",
                  label: "SEK - Swedish Krona"
                }, {
                  value: "PHP",
                  label: "PHP - Philippine Peso"
                }, {
                  value: "INR",
                  label: "INR - Indian Rupee"
                }, {
                  value: "USD",
                  label: "USD - US Dollar"
                }, {
                  value: "EUR",
                  label: "EUR - Euro"
                }, {
                  value: "GBP",
                  label: "GBP - British Pound"
                }].map(currency => {
                  const isSelected = Array.isArray(data.payrollCurrency) && data.payrollCurrency.includes(currency.value);
                  return <div key={currency.value} className="flex items-center space-x-2.5 px-2.5 py-2 hover:bg-primary/5 rounded-md cursor-pointer transition-colors group" onClick={() => {
                    const currentCurrencies = Array.isArray(data.payrollCurrency) ? data.payrollCurrency : [];
                    const newCurrencies = isSelected ? currentCurrencies.filter((c: string) => c !== currency.value) : [...currentCurrencies, currency.value];
                    handleFieldChange('payrollCurrency', newCurrencies);
                  }}>
                        <Checkbox checked={isSelected} onCheckedChange={() => {}} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0" />
                        <label className="text-sm cursor-pointer flex-1 text-foreground group-hover:text-primary transition-colors leading-none">
                          {currency.label}
                        </label>
                      </div>;
                })}
                </div>
              </PopoverContent>
            </Popover>
            {errors.payrollCurrency && <p className="text-xs text-destructive">{errors.payrollCurrency}</p>}
            <p className="text-xs text-muted-foreground">
              Choose the currencies you'll use for payroll. You can adjust this later for each country setup.
            </p>
          </div>
        </div>
      </div>


      {/* Payroll Frequency & Payout Schedule */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Payroll Details
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Monthly payroll frequency
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70">
                We currently support monthly payroll cycles. This ensures consistent processing and makes it easier to manage your team's payments.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutDay" className="text-sm">Preferred Payout Date</Label>
            <Input id="payoutDay" type="number" min="1" max="31" value={data.payoutDay} onChange={e => handleFieldChange('payoutDay', e.target.value)} placeholder="e.g., 25" className="text-sm" />
            <p className="text-xs text-muted-foreground">
              Day of the month (e.g., 25 = 25th of each month)
            </p>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">
                      Select a payment partner to help manage cross-border salary transfers and currency conversions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">Partner for International Payments (Optional)</p>
                <p className="text-xs text-muted-foreground">
                  Handled by Fronted — rates applied automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing || !isFormValid}>
        {externalProcessing ? <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </> : isEditMode ? "Save Changes" : "Continue"}
      </Button>
    </div>;
};
export default Step2OrgProfileSimplified;