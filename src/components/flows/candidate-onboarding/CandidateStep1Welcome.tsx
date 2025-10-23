import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2 } from "lucide-react";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep1Welcome = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step1Props) => {
  const [gdprAccepted, setGdprAccepted] = useState(formData.gdprAccepted || false);

  const handleContinue = () => {
    if (!gdprAccepted) return;
    onComplete("welcome_consent", { gdprAccepted });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      {/* How Kurt Works Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Your AI Assistant
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Once you're onboarded, Kurt will help you navigate your dashboard and answer questions
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">Kurt helps you understand</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI assistant answers questions about your contract and benefits
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">You stay in control</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All important actions require your explicit approval
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">Full transparency</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All updates and changes are visible in your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome & Information Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
          What We Need
        </h3>
        <p className="text-sm text-muted-foreground">
          We'll collect your personal details, tax information, and payment details to generate your employment contract.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.fullName || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Data Privacy & Security</p>
                  <p className="text-xs text-muted-foreground">
                    Your personal information is encrypted and stored securely. We only use it to generate your employment contract and maintain compliance records. You can request deletion at any time.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="gdpr"
                    checked={gdprAccepted}
                    onCheckedChange={(checked) => setGdprAccepted(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="gdpr" className="text-xs font-normal cursor-pointer">
                    I understand and agree to the data processing terms outlined above
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        {isProcessing ? (
          <Button disabled size="lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleContinue} 
            disabled={!gdprAccepted}
            size="lg"
            className="gap-2"
          >
            Let's get started
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep1Welcome;
