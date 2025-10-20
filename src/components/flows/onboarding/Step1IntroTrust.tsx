import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, CheckCircle2, MessageSquare } from "lucide-react";
import { useState } from "react";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
}

const Step1IntroTrust = ({ formData, onComplete, onOpenDrawer }: Step1Props) => {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [inputMode, setInputMode] = useState(formData.defaultInputMode || "chat");

  const handleContinue = () => {
    if (!privacyAccepted) return;
    
    onComplete("intro_trust_model", {
      privacyAccepted,
      defaultInputMode: inputMode
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Shield className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">Welcome to Fronted</h2>
        <p className="text-muted-foreground text-lg">
          Let's set up your global contractor management system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            How Genie Works
          </CardTitle>
          <CardDescription>
            Our AI assistant handles the heavy lifting while you stay in control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Genie prepares everything</p>
                <p className="text-sm text-muted-foreground">
                  The agent asks questions, fills forms, and suggests next steps
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">You review and confirm</p>
                <p className="text-sm text-muted-foreground">
                  Every important action requires your explicit approval
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Full transparency</p>
                <p className="text-sm text-muted-foreground">
                  All changes are logged and auditable
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What We'll Set Up</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Organization profile and settings",
              "Country compliance rules (Mini-Rules)",
              "Slack and payment integrations",
              "Approval workflows and notifications",
              "Your personalized dashboard"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
              I accept the privacy policy and agree to data processing for contractor management purposes
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preferred input mode</Label>
            <RadioGroup value={inputMode} onValueChange={setInputMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chat" id="chat" />
                <Label htmlFor="chat" className="cursor-pointer flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat with Genie (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="cursor-pointer">
                  Manual forms (Traditional)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              You can switch between modes anytime
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleContinue}
          disabled={!privacyAccepted}
          className="flex-1"
          size="lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Step1IntroTrust;
