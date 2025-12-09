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

const WorkerStep1Welcome_v2 = ({ formData, onComplete, isProcessing = false, isLoadingFields = false }: Step1Props) => {
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

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* What We'll Set Up Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          What We'll Set Up
        </h3>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4">
          <ul className="space-y-2.5">
            {[
              "Verify and confirm your personal information",
              "Upload compliance and identity documents",
              "Set up payroll and banking details",
              "Configure work setup preferences",
              "Review your onboarding checklist"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kurt Assistant Callout */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#EAF3FF] dark:bg-primary/10 border border-primary/20 animate-[fadeSlideIn_0.6s_ease-out] motion-reduce:animate-none">
          <span className="text-lg leading-none flex-shrink-0 animate-[iconGlowPulse_2s_ease-in-out_infinite] motion-reduce:animate-none">💡</span>
          <p className="text-sm text-foreground/90 leading-relaxed">
            You'll have <span className="font-medium">Kurt</span>, your AI assistant, helping with setup and next steps whenever you need guidance.
          </p>
        </div>
      </div>

      {/* Account Setup Section */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
        {isLoadingFields ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : (
          <AuthOptions onComplete={handleAuthComplete} isProcessing={isProcessing} />
        )}
      </div>

      {/* Action Button */}
      <div className="pt-1">
        {isLoadingFields ? (
          <Skeleton className="h-11 w-full" />
        ) : (
          <Button
            onClick={handleContinue}
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
        )}
      </div>
    </div>
  );
};

export default WorkerStep1Welcome_v2;