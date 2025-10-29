import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, User, Calendar, Loader2, Info, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import StandardInput from "@/components/shared/StandardInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isAutoFilling, setIsAutoFilling] = useState(true);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    primaryContactName: formData.primaryContactName || "",
    primaryContactEmail: formData.primaryContactEmail || "",
    hqCountry: formData.hqCountry || "",
    payrollCurrency: formData.payrollCurrency || "",
    payrollFrequency: formData.payrollFrequency || "monthly",
    payoutDay: formData.payoutDay || "25",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { speak } = useTextToSpeech();

  // Auto-fill data on mount
  useEffect(() => {
    if (isAutoFilling) {
      speak("Retrieving your details from your ATS...");
      
      const timer = setTimeout(() => {
        const fieldsToAutoFill = new Set<string>();
        
        // Auto-fill with mock data from ATS
        const mockData = {
          companyName: formData.companyName || "Fronted Inc",
          primaryContactName: formData.primaryContactName || "Joe Smith",
          primaryContactEmail: formData.primaryContactEmail || "joe@fronted.com",
          hqCountry: formData.hqCountry || "NO",
          payrollCurrency: formData.payrollCurrency || "NOK",
          payrollFrequency: formData.payrollFrequency || "monthly",
          payoutDay: formData.payoutDay || "25",
        };

        setData(mockData);
        
        // Track which fields were auto-filled
        fieldsToAutoFill.add('companyName');
        fieldsToAutoFill.add('primaryContactName');
        fieldsToAutoFill.add('primaryContactEmail');
        fieldsToAutoFill.add('hqCountry');
        fieldsToAutoFill.add('payrollCurrency');
        
        setAutoFilledFields(fieldsToAutoFill);
        setIsAutoFilling(false);
        
        // Kurt speaks again after loading
        setTimeout(() => {
          speak("I've pre-filled your organization's details from your ATS. Please review and confirm they're correct.");
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAutoFilling, speak, formData]);

  // Watch for formData updates from Kurt
  useEffect(() => {
    if (!isAutoFilling && formData.companyName && formData.companyName !== data.companyName) {
      setData({
        companyName: formData.companyName || "",
        primaryContactName: formData.primaryContactName || "",
        primaryContactEmail: formData.primaryContactEmail || "",
        hqCountry: formData.hqCountry || "",
        payrollCurrency: formData.payrollCurrency || "",
        payrollFrequency: formData.payrollFrequency || "monthly",
        payoutDay: formData.payoutDay || "25",
      });
    }
  }, [formData, data.companyName, isAutoFilling]);

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
    if (!data.payrollCurrency) newErrors.payrollCurrency = "Payroll currency is required";
    
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

  const handleFieldChange = (fieldName: string, value: string) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    // Remove auto-fill indicator when user edits the field
    if (autoFilledFields.has(fieldName)) {
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  if (isAutoFilling || isLoadingFields) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <AudioWaveVisualizer isActive={true} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h3 className="text-lg font-semibold">Retrieving your details...</h3>
            <p className="text-sm text-muted-foreground">Please wait a moment</p>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-5 max-w-xl mx-auto"
      >
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
            <div className="flex items-center justify-between">
              <Label htmlFor="companyName" className="text-sm">
                Company Name <span className="text-destructive">*</span>
              </Label>
              {autoFilledFields.has('companyName') && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-filled by Kurt
                </motion.span>
              )}
            </div>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              placeholder="Fronted Test Co"
              className="text-sm"
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hqCountry" className="text-sm">
                HQ Country <span className="text-destructive">*</span>
              </Label>
              {autoFilledFields.has('hqCountry') && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-filled by Kurt
                </motion.span>
              )}
            </div>
            <Select value={data.hqCountry} onValueChange={(val) => handleFieldChange('hqCountry', val)}>
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="payrollCurrency" className="text-sm">
                Payroll Currency <span className="text-destructive">*</span>
              </Label>
              {autoFilledFields.has('payrollCurrency') && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-filled by Kurt
                </motion.span>
              )}
            </div>
            <Select value={data.payrollCurrency} onValueChange={(val) => handleFieldChange('payrollCurrency', val)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select payroll currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
            {errors.payrollCurrency && (
              <p className="text-xs text-destructive">{errors.payrollCurrency}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Choose the currency you'll use for payroll. You can adjust this later for each country setup.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Admin Contact */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Primary Admin Contact
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contactName" className="text-sm">
                Full Name <span className="text-destructive">*</span>
              </Label>
              {autoFilledFields.has('primaryContactName') && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-filled by Kurt
                </motion.span>
              )}
            </div>
            <Input
              id="contactName"
              value={data.primaryContactName}
              onChange={(e) => handleFieldChange('primaryContactName', e.target.value)}
              placeholder="John Doe"
              className="text-sm"
            />
            {errors.primaryContactName && (
              <p className="text-xs text-destructive">{errors.primaryContactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contactEmail" className="text-sm">
                Email <span className="text-destructive">*</span>
              </Label>
              {autoFilledFields.has('primaryContactEmail') && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-filled by Kurt
                </motion.span>
              )}
            </div>
            <Input
              id="contactEmail"
              type="email"
              value={data.primaryContactEmail}
              onChange={(e) => handleFieldChange('primaryContactEmail', e.target.value)}
              placeholder="john@fronted.com"
              className="text-sm"
            />
            {errors.primaryContactEmail && (
              <p className="text-xs text-destructive">{errors.primaryContactEmail}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Add only the primary setup admin for this pilot. You can invite other team members once Fronted goes live.
          </p>
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
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm">Payroll Frequency</Label>
            <Select
              value={data.payrollFrequency}
              onValueChange={(val) => handleFieldChange('payrollFrequency', val)}
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
              onChange={(e) => handleFieldChange('payoutDay', e.target.value)}
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
    </motion.div>
    </AnimatePresence>
  );
};

export default Step2OrgProfileSimplified;
