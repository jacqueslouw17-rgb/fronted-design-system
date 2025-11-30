/**
 * Flow 6 Company Admin Dashboard v1 - Profile Details Editor
 * Combines Company & Admin Details + Hiring Locations in 2-step editor
 * Does NOT include password fields (handled in separate Change Password section)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Globe, Loader2, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Flow6ProfileDetailsProps {
  formData: {
    companyName?: string;
    hqCountry?: string;
    adminName?: string;
    adminEmail?: string;
    payrollCurrency?: string[];
    payoutDay?: string;
    selectedCountries?: string[];
  };
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const COUNTRIES = [
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
];

const CURRENCIES = [
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

const Flow6ProfileDetails = ({ formData, onSave, onCancel }: Flow6ProfileDetailsProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    hqCountry: formData.hqCountry || "",
    adminName: formData.adminName || "",
    adminEmail: formData.adminEmail || "",
    payrollCurrency: formData.payrollCurrency || [],
    payoutDay: formData.payoutDay || "",
    selectedCountries: formData.selectedCountries || [],
  });

  const handleFieldChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      toast.success("Profile details saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = data.companyName && data.hqCountry && data.adminName && data.adminEmail;
  const isStep2Valid = data.selectedCountries.length > 0;

  return (
    <div className="space-y-6">
      {/* Clickable Step Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCurrentStep(1)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-left",
            currentStep === 1 && "bg-primary/10 border border-primary/20",
            currentStep !== 1 && "bg-card/40 border border-border/30 hover:bg-card/60 hover:border-primary/10"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
            currentStep === 1 && "bg-primary/20 text-primary",
            currentStep !== 1 && "bg-muted/30 text-muted-foreground"
          )}>
            1
          </div>
          <span className={cn(
            "text-sm font-medium whitespace-nowrap",
            currentStep === 1 ? "text-primary" : "text-foreground"
          )}>
            Company & Admin Details
          </span>
        </button>

        <button
          onClick={() => setCurrentStep(2)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-left",
            currentStep === 2 && "bg-primary/10 border border-primary/20",
            currentStep !== 2 && "bg-card/40 border border-border/30 hover:bg-card/60 hover:border-primary/10"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
            currentStep === 2 && "bg-primary/20 text-primary",
            currentStep !== 2 && "bg-muted/30 text-muted-foreground"
          )}>
            2
          </div>
          <span className={cn(
            "text-sm font-medium whitespace-nowrap",
            currentStep === 2 ? "text-primary" : "text-foreground"
          )}>
            Hiring Locations
          </span>
        </button>
      </div>

      {/* Step 1: Company & Admin Details */}
      {currentStep === 1 && (
        <div className="space-y-5 max-w-xl mx-auto">
          {/* Company Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Company Information
              </h3>
            </div>
            
            <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  placeholder="Company name"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hqCountry" className="text-sm">
                  HQ Country <span className="text-destructive">*</span>
                </Label>
                <Select value={data.hqCountry} onValueChange={(val) => handleFieldChange('hqCountry', val)}>
                  <SelectTrigger className="text-sm">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="payrollCurrency" className="text-sm">
                  Payroll Currencies <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-sm h-10 hover:bg-card hover:text-foreground"
                    >
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {data.payrollCurrency.length > 0 ? (
                          data.payrollCurrency.map((currency) => (
                            <span
                              key={currency}
                              className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                            >
                              {currency}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFieldChange('payrollCurrency', data.payrollCurrency.filter(c => c !== currency));
                                }}
                                className="rounded-sm p-0.5"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Select currencies</span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="p-1.5 space-y-0.5">
                      {CURRENCIES.map((currency) => {
                        const isSelected = data.payrollCurrency.includes(currency.value);
                        return (
                          <div
                            key={currency.value}
                            className="flex items-center space-x-2.5 px-2.5 py-2 hover:bg-primary/5 rounded-md cursor-pointer transition-colors"
                            onClick={() => {
                              const newCurrencies = isSelected
                                ? data.payrollCurrency.filter(c => c !== currency.value)
                                : [...data.payrollCurrency, currency.value];
                              handleFieldChange('payrollCurrency', newCurrencies);
                            }}
                          >
                            <Checkbox checked={isSelected} onCheckedChange={() => {}} />
                            <label className="text-sm cursor-pointer flex-1 text-foreground">
                              {currency.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoutDay" className="text-sm">
                  Preferred Payout Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="payoutDay"
                  type="number"
                  min="1"
                  max="31"
                  value={data.payoutDay}
                  onChange={(e) => handleFieldChange('payoutDay', e.target.value)}
                  placeholder="e.g., 25"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Day of the month (1-31)
                </p>
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Admin Details
              </h3>
            </div>
            
            <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="text-sm">
                  Admin Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="adminName"
                  value={data.adminName}
                  onChange={(e) => handleFieldChange('adminName', e.target.value)}
                  placeholder="Full name"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-sm">
                  Admin Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={data.adminEmail}
                  onChange={(e) => handleFieldChange('adminEmail', e.target.value)}
                  placeholder="email@company.com"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex-1"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Hiring Locations */}
      {currentStep === 2 && (
        <div className="space-y-5 max-w-xl mx-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Hiring Locations
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Select the countries where you plan to hire or manage employees.
            </p>
          </div>

          <div className="space-y-3 bg-card/40 border border-border/40 rounded-lg p-4">
            <Label className="text-sm font-medium">Countries</Label>
            <div className="grid grid-cols-1 gap-2">
              {COUNTRIES.map((country) => {
                const isSelected = data.selectedCountries.includes(country.code);
                return (
                  <div
                    key={country.code}
                    onClick={() => {
                      const newCountries = isSelected
                        ? data.selectedCountries.filter(c => c !== country.code)
                        : [...data.selectedCountries, country.code];
                      handleFieldChange('selectedCountries', newCountries);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30 bg-card/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                      </div>
                      <Checkbox checked={isSelected} onCheckedChange={() => {}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {data.selectedCountries.length > 0 && (
            <div className="space-y-2 bg-card/40 border border-border/40 rounded-lg p-4">
              <Label className="text-sm font-medium">Selected</Label>
              <div className="flex flex-wrap gap-2">
                {data.selectedCountries.map((code) => {
                  const country = COUNTRIES.find(c => c.code === code);
                  return (
                    <Badge key={code} variant="secondary" className="text-xs">
                      {country?.flag} {country?.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex-1"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flow6ProfileDetails;
