/**
 * Step 1: Admin Account Setup
 * Part of Flow 5 — Company Admin Onboarding v1
 * 
 * Matches heading pattern from Flow 3 Candidate Onboarding
 */

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import AuthOptions from "@/components/shared/AuthOptions";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const Step1AdminAccount = ({ formData, onComplete, isProcessing = false, isLoadingFields = false }: Step1Props) => {
  const [authMethod, setAuthMethod] = useState(formData.authMethod || "");
  const [authData, setAuthData] = useState<Record<string, any>>(formData.authData || {});

  const handleAuthComplete = (method: string, data?: Record<string, any>) => {
    setAuthMethod(method);
    setAuthData(data || {});
  };

  const handleGetStarted = () => {
    if (!authMethod) {
      toast({
        title: "Account details required",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }
    
    onComplete("admin_account", {
      authMethod,
      authData
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Account Setup Form */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
        <AuthOptions 
          onComplete={handleAuthComplete} 
          isProcessing={isProcessing}
        />
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <Button
          onClick={handleGetStarted}
          disabled={!authMethod || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step1AdminAccount;
