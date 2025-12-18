/**
 * Flow 3 – Candidate Onboarding v2
 * Step 1: Welcome
 * 
 * DETACHED CLONE of v1 - changes here do NOT affect v1
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthOptions from "@/components/shared/AuthOptions";
interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}
const WorkerStep1Welcome_v2 = ({
  formData,
  onComplete,
  isProcessing = false,
  isLoadingFields = false
}: Step1Props) => {
  const [authMethod, setAuthMethod] = useState(formData.authMethod || "");
  const [authData, setAuthData] = useState<Record<string, any>>(formData.authData || {});
  const [preferredLanguage, setPreferredLanguage] = useState(formData.preferredLanguage || "en");
  const handleAuthComplete = (method: string, data?: Record<string, any>) => {
    setAuthMethod(method);
    setAuthData(data || {});
  };
  const handleContinue = () => {
    if (!authMethod) {
      toast({
        title: "Sign-in method required",
        description: "Please choose how you'd like to sign in",
        variant: "destructive"
      });
      return;
    }
    onComplete("welcome", {
      defaultInputMode: "chat",
      authMethod,
      authData,
      preferredLanguage
    });
  };
  return <div className="space-y-6 max-w-xl mx-auto">
      {/* What We'll Set Up Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          What We'll Set Up
        </h3>
        
        

        {/* Kurt Assistant Callout */}
        
      </div>

      {/* Account Setup Section */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
        {isLoadingFields ? <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </> : <AuthOptions onComplete={handleAuthComplete} isProcessing={isProcessing} />}
      </div>

      {/* Action Button */}
      <div className="pt-1">
        {isLoadingFields ? <Skeleton className="h-11 w-full" /> : <Button onClick={handleContinue} disabled={!authMethod || isProcessing} className="w-full" size="lg">
            {isProcessing ? <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </> : "Get Started"}
          </Button>}
      </div>
    </div>;
};
export default WorkerStep1Welcome_v2;