import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2, Globe } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthOptions from "@/components/shared/AuthOptions";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  isInviteMode?: boolean;
}

const Step1IntroTrust = ({ formData, onComplete, onOpenDrawer, isProcessing = false, isLoadingFields = false, isInviteMode = false }: Step1Props) => {
  const [authMethod, setAuthMethod] = useState(formData.authMethod || "");
  const [authData, setAuthData] = useState<Record<string, any>>(formData.authData || {});
  const [preferredLanguage, setPreferredLanguage] = useState(formData.preferredLanguage || "en");

  const handleAuthComplete = useCallback((method: string, data?: Record<string, any>) => {
    setAuthMethod(method);
    setAuthData(data || {});
  }, []);

  const handleContinue = () => {
    if (!authMethod) {
      toast({
        title: "Sign-in method required",
        description: "Please choose how you'd like to sign in",
        variant: "destructive"
      });
      return;
    }
    
    onComplete("intro_trust_model", {
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
          We'll Handle the Setup
        </h3>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4">
          <ul className="space-y-2.5">
            {[
              "Company profile and settings",
              "Approval workflows and notifications",
              "Your personalized dashboard"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 flex-shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
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
          <AuthOptions onComplete={handleAuthComplete} isProcessing={isProcessing} hidePassword={isInviteMode} />
        )}

        {/* Preferred Language - Hidden for now */}
        {/* <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <Label htmlFor="language" className="text-sm">
              Preferred Language <span className="text-destructive">*</span>
            </Label>
          </div>
          {isLoadingFields ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="no">Norwegian (Norsk)</SelectItem>
                <SelectItem value="es">Spanish (Español)</SelectItem>
                <SelectItem value="fr">French (Français)</SelectItem>
                <SelectItem value="de">German (Deutsch)</SelectItem>
                <SelectItem value="pt">Portuguese (Português)</SelectItem>
                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                <SelectItem value="tl">Tagalog</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div> */}
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
              isInviteMode ? "Continue" : "Get Started"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Step1IntroTrust;
