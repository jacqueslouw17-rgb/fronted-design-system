import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
}

const CandidateStep4Bank = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false,
  buttonText = "Continue"
}: Step4Props) => {
  const { speak } = useTextToSpeech();
  const [isAutoFilling, setIsAutoFilling] = useState(true);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  
  const [data, setData] = useState({
    accountHolder: "",
    iban: "",
    swift: "",
    currency: ""
  });

  // Auto-fill data from ATS with Kurt's voice
  useEffect(() => {
    if (isAutoFilling) {
      speak("Retrieving your payroll details from the ATS... Please wait a moment.");
      
      const timer = setTimeout(() => {
        const fieldsToAutoFill = new Set<string>();
        const autoFilledData: any = {};

        // Simulate ATS data fetch
        if (formData.fullName) {
          autoFilledData.accountHolder = formData.fullName;
          fieldsToAutoFill.add('accountHolder');
        }
        
        // Auto-fill currency based on tax country
        if (formData.taxCountry) {
          const currencyMap: Record<string, string> = {
            NO: "NOK",
            PH: "PHP",
            IN: "INR",
            US: "USD",
            GB: "GBP"
          };
          autoFilledData.currency = currencyMap[formData.taxCountry] || "USD";
          fieldsToAutoFill.add('currency');
        }

        // Mock bank details from ATS (in real implementation, would come from ATS integration)
        if (formData.iban) {
          autoFilledData.iban = formData.iban;
          fieldsToAutoFill.add('iban');
        }
        if (formData.swift) {
          autoFilledData.swift = formData.swift;
          fieldsToAutoFill.add('swift');
        }

        setData(prev => ({ ...prev, ...autoFilledData }));
        setAutoFilledFields(fieldsToAutoFill);
        setIsAutoFilling(false);

        setTimeout(() => {
          speak("Some of your details were pre-filled from your company. Please review and add any missing information.");
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAutoFilling, formData, speak]);

  const handleInputChange = (fieldName: string, value: string) => {
    setData({ ...data, [fieldName]: value });
    // Remove auto-fill indicator when user edits the field
    if (autoFilledFields.has(fieldName)) {
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const handleContinue = () => {
    onComplete("bank_details", data);
  };

  const isValid = data.accountHolder && (data.iban || data.swift) && data.currency;

  // Show loading state while auto-filling
  if (isAutoFilling) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <AudioWaveVisualizer isActive={true} />
          <p className="text-sm text-muted-foreground mt-4">Retrieving your payroll details...</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Bank Account Details</h3>
        <p className="text-sm text-muted-foreground">
          We'll use this information to process your salary payments securely.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {autoFilledFields.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
            >
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Some of your details were pre-filled from your company.
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="accountHolder">Account Holder Name *</Label>
              {autoFilledFields.has('accountHolder') && (
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
              id="accountHolder"
              value={data.accountHolder}
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
              placeholder="Full name as shown on bank account"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="iban">IBAN or Account Number *</Label>
              {autoFilledFields.has('iban') && (
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
              id="iban"
              value={data.iban}
              onChange={(e) => handleInputChange('iban', e.target.value)}
              placeholder="Enter IBAN or account number"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="swift">SWIFT/BIC Code</Label>
              {autoFilledFields.has('swift') && (
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
              id="swift"
              value={data.swift}
              onChange={(e) => handleInputChange('swift', e.target.value)}
              placeholder="Optional for local transfers"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="currency">Payment Currency *</Label>
              {autoFilledFields.has('currency') && (
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
            <Select value={data.currency} onValueChange={(value) => handleInputChange('currency', value)}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
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
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        {isProcessing ? (
          <Button disabled size="lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleContinue} 
            disabled={!isValid}
            size="lg"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep4Bank;
