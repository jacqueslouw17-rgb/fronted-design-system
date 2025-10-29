import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Chrome, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import StandardInput from "./StandardInput";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthOptionsProps {
  onComplete: (method: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const AuthOptions = ({ onComplete, isProcessing = false }: AuthOptionsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string; avatar?: string } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check for existing Google session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user = session.user;
        const userData = {
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
        };
        
        setGoogleUser(userData);
        // Notify parent that Google auth is complete
        onComplete('google', userData);
      }
    };
    
    checkSession();
  }, [onComplete]);

  const handleMethodSelect = async (method: string) => {
    if (method === "email") {
      setSelectedMethod("email");
      // Immediately register email as the selected method
      onComplete(method, {});
    } else if (method === "google") {
      setIsAuthenticating(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/flows/admin/onboarding`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) {
          toast({
            title: "Authentication error",
            description: error.message,
            variant: "destructive"
          });
          setIsAuthenticating(false);
        }
        // If successful, user will be redirected and page will reload with session
      } catch (error) {
        console.error("Google auth error:", error);
        toast({
          title: "Authentication error",
          description: "Failed to initiate Google sign-in",
          variant: "destructive"
        });
        setIsAuthenticating(false);
      }
    } else {
      // For other OAuth methods, complete immediately (placeholder)
      onComplete(method);
    }
  };

  const handleEmailSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Update the parent with the full email data
    onComplete("email", { email, password, preferredLanguage });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Choose how you'd like to sign up</h3>
      </div>

      {googleUser ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg border border-border bg-card space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {googleUser.avatar ? (
                <img src={googleUser.avatar} alt={googleUser.name} className="h-10 w-10 rounded-full" />
              ) : (
                <Chrome className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{googleUser.name}</p>
              <p className="text-xs text-muted-foreground">{googleUser.email}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Signed in with Google
          </p>
        </motion.div>
      ) : selectedMethod === null && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 h-12 text-sm hover:bg-primary/10 hover:text-foreground"
            onClick={() => handleMethodSelect("google")}
            disabled={isProcessing || isAuthenticating}
          >
            <Chrome className="h-5 w-5 text-[#4285F4]" />
            <span className="flex-1 text-left">
              {isAuthenticating ? "Opening Google..." : "Continue with Google"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 h-12 text-sm hover:bg-primary/10 hover:text-foreground"
            onClick={() => handleMethodSelect("microsoft")}
            disabled={isProcessing}
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="11" height="11" fill="#F25022" />
              <rect x="12" width="11" height="11" fill="#7FBA00" />
              <rect y="12" width="11" height="11" fill="#00A4EF" />
              <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
            </svg>
            <span className="flex-1 text-left">Continue with Microsoft</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 h-12 text-sm hover:bg-primary/10 hover:text-foreground"
            onClick={() => handleMethodSelect("email")}
            disabled={isProcessing}
          >
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-left">Continue with Email + Password</span>
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            🔒 Secure sign-in. Your credentials are never shared.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedMethod === "email" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedMethod(null);
                setEmail("");
                setPassword("");
                setErrors({});
              }}
              className="text-xs"
            >
              ← Back to options
            </Button>

            <StandardInput
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              required
              error={errors.email}
              placeholder="you@company.com"
            />

            <div className="space-y-1">
              <StandardInput
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                required
                error={errors.password}
                helpText="Minimum 8 characters"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const suggestedPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                    .map(b => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'[b % 72])
                    .join('');
                  setPassword(suggestedPassword);
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                className="text-xs text-primary hover:text-primary/80 h-auto p-0"
              >
                ✨ Let Kurt suggest a password
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthOptions;
