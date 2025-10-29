import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Globe, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
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

const Step3Localization = ({ formData, onComplete, isProcessing: externalProcessing, isLoadingFields = false }: Step3Props) => {
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
      toast({
        title: "Country blocks loaded",
        description: `Loaded compliance rules for ${selectedCountries.length} countries`
      });
      
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="max-w-[250px]">
                <p className="text-xs">
                  This helps us tailor compliance and payroll setup per location.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        <Button
          onClick={handleLoadBlocks}
          size="lg"
          className="w-full"
          disabled={loading || selectedCountries.length === 0 || externalProcessing}
        >
        {(loading || externalProcessing) ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "Load Blocks & Continue"
        )}
        </Button>
      )}
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step3Localization;
