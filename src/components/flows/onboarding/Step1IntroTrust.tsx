import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CheckCircle2, MessageSquare, Loader2, Key, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface Step1Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const Step1IntroTrust = ({ formData, onComplete, onOpenDrawer, isProcessing = false }: Step1Props) => {
  const [privacyAccepted, setPrivacyAccepted] = useState(formData.privacyAccepted || false);
  const [inputMode, setInputMode] = useState(formData.defaultInputMode || "chat");
  const [password, setPassword] = useState(formData.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Watch for formData changes to auto-check privacy
  useEffect(() => {
    if (formData.privacyAccepted) {
      setPrivacyAccepted(true);
    }
  }, [formData.privacyAccepted]);

  const generateStrongPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    setShowPassword(true);
  };

  const handleContinue = () => {
    if (!privacyAccepted || !password) return;
    
    onComplete("intro_trust_model", {
      privacyAccepted,
      defaultInputMode: inputMode,
      password
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* How Kurt Works Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            How Kurt Works
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Your AI assistant handles the heavy lifting while you stay in control
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">Kurt prepares everything</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The agent asks questions, fills forms, and suggests next steps
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-sm mb-0.5">You review and confirm</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every important action requires your explicit approval
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
                All changes are logged and auditable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What We'll Set Up Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
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
      </div>

      {/* Password Creation Section */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-primary" />
            <Label className="text-xs font-bold uppercase tracking-wide text-foreground">
              Create Your Password
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Set up a secure password for your account
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="Enter a strong password"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-xs font-medium">{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>

            {/* Password Rules */}
            {isPasswordFocused && (
              <div className="bg-card border border-border/60 rounded-md p-3 space-y-1.5 animate-fade-in">
                <p className="text-xs font-medium text-foreground/80 mb-2">Password must contain:</p>
                <div className="space-y-1.5">
                  {[
                    { key: 'minLength', label: 'At least 8 characters', met: passwordRules.minLength },
                    { key: 'hasUppercase', label: 'One uppercase letter', met: passwordRules.hasUppercase },
                    { key: 'hasLowercase', label: 'One lowercase letter', met: passwordRules.hasLowercase },
                    { key: 'hasNumber', label: 'One number', met: passwordRules.hasNumber },
                    { key: 'hasSpecial', label: 'One special character (!@#$%^&*)', met: passwordRules.hasSpecial },
                  ].map((rule) => (
                    <div key={rule.key} className="flex items-center gap-2.5 text-xs">
                      <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${
                        rule.met 
                          ? 'text-primary' 
                          : 'text-border/60'
                      }`} />
                      <span className={rule.met ? 'text-foreground' : 'text-muted-foreground'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={generateStrongPassword}
            className="w-full"
            size="sm"
          >
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Let Kurt Suggest a Strong Password
          </Button>
        </div>
      </div>

      {/* Privacy & Preferences Section */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
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

        <div className="space-y-2.5 pt-3 border-t border-border/40">
          <Label className="text-xs font-bold uppercase tracking-wide text-foreground">
            Preferred Input Mode
          </Label>
          <RadioGroup value={inputMode} onValueChange={setInputMode}>
            <div className={`flex items-center space-x-2 p-2 rounded-md transition-colors border ${inputMode === 'chat' ? 'bg-primary/10 border-primary/30' : 'hover:bg-primary/8 border-transparent'}`}>
              <RadioGroupItem value="chat" id="chat" />
              <Label htmlFor="chat" className="cursor-pointer flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Chat with Kurt <span className="text-xs text-muted-foreground">(Recommended)</span></span>
              </Label>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-md transition-colors border ${inputMode === 'manual' ? 'bg-primary/10 border-primary/30' : 'hover:bg-primary/8 border-transparent'}`}>
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="cursor-pointer text-sm">
                Manual forms <span className="text-xs text-muted-foreground">(Traditional)</span>
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground italic">
            You can switch between modes anytime
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <Button
          onClick={handleContinue}
          disabled={!privacyAccepted || !password || isProcessing}
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

export default Step1IntroTrust;
