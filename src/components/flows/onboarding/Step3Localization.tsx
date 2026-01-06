import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  showSkipButton?: boolean;
  isEditMode?: boolean;
}

const COUNTRIES = [
  {
    code: "NO",
    name: "Norway",
    flag: "🇳🇴",
    rules: ["A-melding reporting", "Holiday pay accrual", "Pension requirements"]
  },
  {
    code: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    rules: ["13th month pay", "PhilHealth", "SSS contributions"]
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    rules: ["Gratuity calculation", "PF/ESI", "TDS withholding"]
  },
  {
    code: "XK",
    name: "Kosovo",
    flag: "🇽🇰",
    rules: ["Withholding tax", "Social contributions", "Monthly declarations"]
  }
];

const Step3Localization = ({ formData, onComplete, isProcessing: externalProcessing, isLoadingFields = false, showSkipButton = true, isEditMode = false }: Step3Props) => {
  const hasPersistedData = formData && formData.selectedCountries && formData.selectedCountries.length > 0;
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    formData.selectedCountries || []
  );
  const [loading, setLoading] = useState(false);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleLoadBlocks = () => {
    if (selectedCountries.length === 0) {
      toast({
        title: "No countries selected",
        description: "Please select at least one country",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      // No generic loading notification - let the visual state change speak for itself
      
      onComplete("localization_country_blocks", {
        selectedCountries,
        countryRules: selectedCountries.map(code => {
          const country = COUNTRIES.find(c => c.code === code);
          return {
            code,
            name: country?.name,
            rules: country?.rules
          };
        })
      });
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Hiring Locations
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Select the countries where you plan to hire or manage employees.
        </p>
      </div>

      {/* Country Selection */}
      <div className="space-y-3 bg-card/40 border border-border/40 rounded-lg p-4">
        <Label className="text-sm font-medium">Countries</Label>
        {isLoadingFields ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {COUNTRIES.map((country) => {
            const isSelected = selectedCountries.includes(country.code);
            return (
              <div
                key={country.code}
                onClick={() => toggleCountry(country.code)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all text-sm",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30 bg-card/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="font-medium">{country.name}</span>
                  </div>
                  <Checkbox checked={isSelected} />
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {selectedCountries.length > 0 && (
        <div className="space-y-2 bg-card/40 border border-border/40 rounded-lg p-4">
          <Label className="text-sm font-medium">Selected</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((code) => {
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

      {isLoadingFields ? (
        <Skeleton className="h-11 w-full" />
      ) : (
        <div className="flex gap-3">
          {showSkipButton && (
            <Button
              onClick={() => onComplete("localization_country_blocks", { selectedCountries: [], countryRules: [] })}
              variant="ghost"
              size="lg"
              className="flex-1"
              disabled={loading || externalProcessing}
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleLoadBlocks}
            size="lg"
            className={showSkipButton ? "flex-1" : "w-full"}
            disabled={loading || selectedCountries.length === 0 || externalProcessing}
          >
          {(loading || externalProcessing) ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            isEditMode ? "Save Changes" : "Continue"
          )}
          </Button>
        </div>
      )}
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step3Localization;
