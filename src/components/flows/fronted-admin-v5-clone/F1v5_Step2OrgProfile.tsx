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


const HQ_COUNTRIES = [
  { code: "NO", label: "🇳🇴 Norway" }, { code: "DK", label: "🇩🇰 Denmark" }, { code: "SE", label: "🇸🇪 Sweden" },
  { code: "FI", label: "🇫🇮 Finland" }, { code: "DE", label: "🇩🇪 Germany" }, { code: "FR", label: "🇫🇷 France" },
  { code: "NL", label: "🇳🇱 Netherlands" }, { code: "BE", label: "🇧🇪 Belgium" }, { code: "AT", label: "🇦🇹 Austria" },
  { code: "IE", label: "🇮🇪 Ireland" }, { code: "ES", label: "🇪🇸 Spain" }, { code: "PT", label: "🇵🇹 Portugal" },
  { code: "IT", label: "🇮🇹 Italy" }, { code: "GR", label: "🇬🇷 Greece" }, { code: "HR", label: "🇭🇷 Croatia" },
  { code: "BG", label: "🇧🇬 Bulgaria" }, { code: "CY", label: "🇨🇾 Cyprus" }, { code: "EE", label: "🇪🇪 Estonia" },
  { code: "LV", label: "🇱🇻 Latvia" }, { code: "LT", label: "🇱🇹 Lithuania" }, { code: "LU", label: "🇱🇺 Luxembourg" },
  { code: "MT", label: "🇲🇹 Malta" }, { code: "SK", label: "🇸🇰 Slovakia" }, { code: "SI", label: "🇸🇮 Slovenia" },
  { code: "PL", label: "🇵🇱 Poland" }, { code: "XK", label: "🇽🇰 Kosovo" }, { code: "CH", label: "🇨🇭 Switzerland" },
  { code: "GB", label: "🇬🇧 United Kingdom" }, { code: "PH", label: "🇵🇭 Philippines" }, { code: "IN", label: "🇮🇳 India" },
  { code: "SG", label: "🇸🇬 Singapore" }, { code: "JP", label: "🇯🇵 Japan" }, { code: "KR", label: "🇰🇷 South Korea" },
  { code: "US", label: "🇺🇸 United States" }, { code: "CA", label: "🇨🇦 Canada" }, { code: "MX", label: "🇲🇽 Mexico" },
  { code: "BR", label: "🇧🇷 Brazil" }, { code: "AU", label: "🇦🇺 Australia" }, { code: "NZ", label: "🇳🇿 New Zealand" },
  { code: "AE", label: "🇦🇪 United Arab Emirates" }, { code: "ZA", label: "🇿🇦 South Africa" }, { code: "IL", label: "🇮🇱 Israel" },
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
  });
  const [originalData] = useState({
    companyName: formData.companyName || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    hqCountry: formData.hqCountry || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hqCountryOpen, setHqCountryOpen] = useState(false);

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
      toast({ title: "Validation error", description: "Please fill in all required fields correctly", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const submitData = { ...data };

    onComplete("org_profile", submitData);
    setIsSubmitting(false);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
  };

  const hasChanges = isEditMode ? (
    data.companyName !== originalData.companyName ||
    data.adminName !== originalData.adminName ||
    data.adminEmail !== originalData.adminEmail ||
    data.hqCountry !== originalData.hqCountry
  ) : true;

  const isFormValid = data.companyName.trim().length > 0 &&
    data.adminName.trim().length > 0 &&
    data.adminEmail.trim().length > 0 &&
    data.hqCountry.trim().length > 0 &&
    hasChanges;

  

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

        </div>
      </div>

      <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing || isSubmitting || !isFormValid}>
        {(externalProcessing || isSubmitting) ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save Changes" : "Add"}
      </Button>
    </div>
  );
};

export default F1v5_Step2OrgProfile;
