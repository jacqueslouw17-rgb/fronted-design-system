import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Globe, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
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

const Step3Localization = ({ formData, onComplete }: Step3Props) => {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Localization & Country Blocks</h2>
        <p className="text-muted-foreground">
          Select the countries where you hire contractors. We'll load the relevant compliance rules for each.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Quick Picks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COUNTRIES.map((country) => {
              const isSelected = selectedCountries.includes(country.code);
              return (
                <div
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="font-medium">{country.name}</p>
                        <p className="text-xs text-muted-foreground">{country.code}</p>
                      </div>
                    </div>
                    <Checkbox checked={isSelected} />
                  </div>
                  <div className="space-y-1 mt-3">
                    {country.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedCountries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map((code) => {
                const country = COUNTRIES.find(c => c.code === code);
                return (
                  <Badge key={code} variant="secondary" className="text-sm px-3 py-1">
                    {country?.flag} {country?.name}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              We'll load compliance rules and tax requirements for these countries
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleLoadBlocks}
        size="lg"
        className="w-full"
        disabled={loading || selectedCountries.length === 0}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading Country Blocks...
          </>
        ) : (
          "Load Blocks & Continue"
        )}
      </Button>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step3Localization;
