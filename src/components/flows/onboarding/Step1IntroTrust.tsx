import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthOptions from "@/components/shared/AuthOptions";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const Step1IntroTrust = ({ formData, onComplete, onOpenDrawer, isProcessing = false, isLoadingFields = false }: Step1Props) => {
  const [privacyAccepted, setPrivacyAccepted] = useState(formData.privacyAccepted || false);
  const [authMethod, setAuthMethod] = useState(formData.authMethod || "");
  const [authData, setAuthData] = useState<Record<string, any>>(formData.authData || {});
  const [preferredLanguage, setPreferredLanguage] = useState(formData.preferredLanguage || "en");

  // Watch for formData changes to auto-check privacy
  useEffect(() => {
    if (formData.privacyAccepted) {
      setPrivacyAccepted(true);
    }
  }, [formData.privacyAccepted]);

  const handleAuthComplete = (method: string, data?: Record<string, any>) => {
    setAuthMethod(method);
    setAuthData(data || {});
    
    toast({
      title: "Authentication method selected",
      description: `You'll sign in with ${method === 'email' ? 'email and password' : method}`,
    });
  };

  const handleContinue = () => {
    if (!privacyAccepted) {
      toast({
        title: "Privacy acceptance required",
        description: "Please accept the privacy terms to continue",
        variant: "destructive"
      });
      return;
    }

    if (!authMethod) {
      toast({
        title: "Sign-in method required",
        description: "Please choose how you'd like to sign in",
        variant: "destructive"
      });
      return;
    }
    
    onComplete("intro_trust_model", {
      privacyAccepted,
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
              "Organization profile and settings",
              "Country compliance rules (Mini-Rules)",
              "Slack and payment integrations",
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

        {/* Kurt Assistant Callout */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#EAF3FF] dark:bg-primary/10 border border-primary/20">
          <span className="text-lg leading-none flex-shrink-0">💡</span>
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

        {/* Preferred Language */}
        <div className="space-y-2 pt-2 border-t border-border/40">
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
        </div>
      </div>

      {/* Privacy & Preferences Section */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4">
        <div className="flex items-start gap-3 p-2 -m-2 rounded-md hover:bg-primary/8 transition-colors cursor-pointer" onClick={() => setPrivacyAccepted(!privacyAccepted)}>
          <Checkbox
            id="privacy"
            checked={privacyAccepted}
            onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
            className="mt-0.5 pointer-events-none"
          />
          <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer text-foreground/90 pointer-events-none">
            I accept the privacy policy and agree to data processing for contractor management purposes
          </Label>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        {isLoadingFields ? (
          <Skeleton className="h-11 w-full" />
        ) : (
          <Button
            onClick={handleContinue}
            disabled={!privacyAccepted || !authMethod || isProcessing}
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

export default Step1IntroTrust;
