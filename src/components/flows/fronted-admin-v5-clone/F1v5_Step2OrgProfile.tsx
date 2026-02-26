/**
 * Flow 1 v5 — Organization Profile Step (v5-specific clone)
 * 
 * Clone of Step2OrgProfileSimplified with Country Templates embedded
 * inside the form card. Shown in both create and edit modes.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { F1v5_CountryTemplatesSection } from "./F1v5_CountryTemplatesSection";
import { F1v5_CreationCountryTemplates, type CreationCountryEntry } from "./F1v5_CreationCountryTemplates";

interface F1v5_Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  isEditMode?: boolean;
  editModeTitle?: string;
  hasSignedContract?: boolean;
  hasCandidates?: boolean;
  // v5-specific
  companyId?: string;
  companyName?: string;
}

// Eurozone countries per acceptance criteria
const EUROZONE_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

function getDefaultCurrency(countryCode: string): string {
  return EUROZONE_COUNTRY_CODES.has(countryCode) ? "EUR" : "USD";
}

const CURRENCY_OPTIONS = [
  { code: "EUR", label: "EUR – Euro" },
  { code: "USD", label: "USD – US Dollar" },
];

const F1v5_Step2OrgProfile = ({
  formData,
  onComplete,
  isProcessing: externalProcessing,
  isEditMode = false,
  editModeTitle,
  hasSignedContract = false,
  companyId,
  companyName: companyNameProp,
}: F1v5_Step2Props) => {
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

  // Creation-mode country templates
  const [creationCountries, setCreationCountries] = useState<CreationCountryEntry[]>([]);

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

  // Auto-default currency when HQ country changes and currency is empty
  useEffect(() => {
    if (data.hqCountry && !data.defaultCurrency) {
      setData(prev => ({ ...prev, defaultCurrency: getDefaultCurrency(prev.hqCountry) }));
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

    // Creation mode: validate country templates
    if (!isEditMode) {
      if (creationCountries.length === 0) {
        newErrors.countryTemplates = "At least one country with templates is required";
      } else {
        // Check required slots per country
        const missingRequired = creationCountries.filter(c =>
          c.slots.some(s => s.required && s.status === "empty")
        );
        if (missingRequired.length > 0) {
          newErrors.countryTemplates = `Required templates missing for: ${missingRequired.map(c => c.countryName).join(", ")}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({ title: "Validation error", description: "Please fill in all required fields correctly", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const submitData = {
      ...data,
      ...(!isEditMode && { countryTemplates: creationCountries }),
    };

    onComplete("org_profile", submitData);
    setIsSubmitting(false);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setData(prev => {
      const updated = { ...prev, [fieldName]: value };
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
    hasChanges &&
    (isEditMode || (
      creationCountries.length > 0 &&
      creationCountries.every(c => c.slots.filter(s => s.required).every(s => s.status !== "empty"))
    ));

  const resolvedCompanyName = companyNameProp || data.companyName || "Company";

  return (
    <div className="space-y-5 w-full sm:max-w-xl sm:mx-auto px-1 sm:px-0">
      {isEditMode && editModeTitle}
      
      <div className="space-y-3">
        <div className="bg-card/40 border border-border/40 rounded-lg p-3 sm:p-4 space-y-4">
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
              <p className="text-xs text-muted-foreground">Company name cannot be changed as there are signed contracts for this company.</p>
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
              <p className="text-xs text-muted-foreground">Email cannot be changed as it is linked to this company's account.</p>
            )}
            {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">HQ Country</Label>
            <Popover open={hqCountryOpen} onOpenChange={setHqCountryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={hqCountryOpen} className="w-full justify-between text-sm font-normal">
                  {data.hqCountry ? HQ_COUNTRIES.find(c => c.code === data.hqCountry)?.label || data.hqCountry : "Select country"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." className="h-10" />
                  <CommandList className="max-h-[240px]">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {HQ_COUNTRIES.map(c => (
                        <CommandItem
                          key={c.code}
                          value={c.label}
                          onSelect={() => { handleFieldChange('hqCountry', c.code); setHqCountryOpen(false); }}
                          className="text-sm"
                        >
                          <Check className={cn("mr-2 h-4 w-4", data.hqCountry === c.code ? "opacity-100" : "opacity-0")} />
                          {c.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.hqCountry && <p className="text-xs text-destructive">{errors.hqCountry}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label className="text-sm">Default Currency</Label>
              <div className="inline-flex rounded-lg bg-muted/50 p-0.5 gap-0.5 self-start sm:self-auto">
                {CURRENCY_OPTIONS.map(c => (
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

          {/* Country templates — creation mode: multi-select + manage */}
          {!isEditMode && (
            <F1v5_CreationCountryTemplates
              selectedCountries={creationCountries}
              onCountriesChange={setCreationCountries}
              error={errors.countryTemplates}
            />
          )}

          {/* Country templates — edit mode: existing editor */}
          {isEditMode && companyId && (
            <F1v5_CountryTemplatesSection
              companyId={companyId}
              companyName={resolvedCompanyName}
              isEmbedded
            />
          )}
        </div>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing || isSubmitting || !isFormValid}>
        {(externalProcessing || isSubmitting) ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save Changes" : "Add"}
      </Button>
    </div>
  );
};

export default F1v5_Step2OrgProfile;
