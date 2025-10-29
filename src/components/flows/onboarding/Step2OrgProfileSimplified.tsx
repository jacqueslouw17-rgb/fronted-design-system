import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, User, Calendar, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import StandardInput from "@/components/shared/StandardInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const Step2OrgProfileSimplified = ({ 
  formData, 
  onComplete, 
  isProcessing: externalProcessing, 
  isLoadingFields = false 
}: Step2Props) => {
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    primaryContactName: formData.primaryContactName || "",
    primaryContactEmail: formData.primaryContactEmail || "",
    allowPayrollContracts: formData.allowPayrollContracts || false,
    hqCountry: formData.hqCountry || "",
    payrollFrequency: formData.payrollFrequency || "monthly",
    payoutDay: formData.payoutDay || "25",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Watch for formData updates from Kurt
  useEffect(() => {
    if (formData.companyName && formData.companyName !== data.companyName) {
      setData({
        companyName: formData.companyName || "",
        primaryContactName: formData.primaryContactName || "",
        primaryContactEmail: formData.primaryContactEmail || "",
        allowPayrollContracts: formData.allowPayrollContracts || false,
        hqCountry: formData.hqCountry || "",
        payrollFrequency: formData.payrollFrequency || "monthly",
        payoutDay: formData.payoutDay || "25",
      });
    }
  }, [formData, data.companyName]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName) newErrors.companyName = "Company name is required";
    if (!data.primaryContactName) newErrors.primaryContactName = "Name is required";
    if (!data.primaryContactEmail) {
      newErrors.primaryContactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.primaryContactEmail)) {
      newErrors.primaryContactEmail = "Invalid email format";
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

    toast({
      title: "Organization profile saved",
      description: "Your company information has been recorded"
    });

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

  return (
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
          {isLoadingFields ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : (
            <>
              <StandardInput
                id="companyName"
                label="Company Name"
                value={data.companyName}
                onChange={(val) => setData(prev => ({ ...prev, companyName: val }))}
                required
                error={errors.companyName}
                placeholder="Fronted Test Co"
              />

              <div className="space-y-2">
                <Label htmlFor="hqCountry" className="text-sm">
                  HQ Country <span className="text-destructive">*</span>
                </Label>
                <Select value={data.hqCountry} onValueChange={(val) => setData(prev => ({ ...prev, hqCountry: val }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                    <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                    <SelectItem value="IN">🇮🇳 India</SelectItem>
                    <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hqCountry && (
                  <p className="text-xs text-destructive">{errors.hqCountry}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Sets default currency and date formats
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary Contact Person (Simplified for Internal Pilot) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Primary Contact Person (Simplified for Internal Pilot)
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          {isLoadingFields ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-5 w-full" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Only one person will be added during onboarding — the main admin contact.
              </p>

              <StandardInput
                id="contactName"
                label="Name"
                value={data.primaryContactName}
                onChange={(val) => setData(prev => ({ ...prev, primaryContactName: val }))}
                required
                error={errors.primaryContactName}
                placeholder="John Doe"
              />

              <StandardInput
                id="contactEmail"
                label="Email"
                value={data.primaryContactEmail}
                onChange={(val) => setData(prev => ({ ...prev, primaryContactEmail: val }))}
                type="email"
                required
                error={errors.primaryContactEmail}
                placeholder="john@fronted.com"
              />

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="allowPayrollContracts"
                  checked={data.allowPayrollContracts}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, allowPayrollContracts: checked as boolean }))
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="allowPayrollContracts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Allow this person to also handle payroll and contracts.
                  </label>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                For now, just add the main person responsible for setup. You can invite others later once Fronted goes live.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Payroll Frequency & Payout Schedule */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Payroll Frequency & Payout Schedule
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          {isLoadingFields ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm">Payroll Frequency</Label>
                <Select
                  value={data.payrollFrequency}
                  onValueChange={(val) => setData(prev => ({ ...prev, payrollFrequency: val }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {data.payrollFrequency && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {getFrequencyHint(data.payrollFrequency)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoutDay" className="text-sm">Preferred Payout Date</Label>
                <Input
                  id="payoutDay"
                  type="number"
                  min="1"
                  max="31"
                  value={data.payoutDay}
                  onChange={(e) => setData(prev => ({ ...prev, payoutDay: e.target.value }))}
                  className="text-sm"
                />
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
                          Fronted automatically handles FX conversions using real-time exchange rates from our banking partners.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">FX Provider</p>
                    <p className="text-xs text-muted-foreground">
                      Handled by Fronted — FX rates applied automatically
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isLoadingFields ? (
        <Skeleton className="h-11 w-full" />
      ) : (
        <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing}>
          {externalProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      )}
    </div>
  );
};

export default Step2OrgProfileSimplified;
