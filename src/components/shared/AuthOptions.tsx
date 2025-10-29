import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Chrome } from "lucide-react";
import { useState } from "react";
import StandardInput from "./StandardInput";
import { motion, AnimatePresence } from "framer-motion";

interface AuthOptionsProps {
  onComplete: (method: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const AuthOptions = ({ onComplete, isProcessing = false }: AuthOptionsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMethodSelect = (method: string) => {
    if (method === "email") {
      setSelectedMethod("email");
    } else {
      // For OAuth methods, complete immediately (placeholder)
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
    onComplete("email", { email, password });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Choose how you'd like to sign in</h3>
      </div>

      {selectedMethod === null && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 h-12 text-sm hover:bg-accent"
            onClick={() => handleMethodSelect("google")}
            disabled={isProcessing}
          >
            <Chrome className="h-5 w-5 text-[#4285F4]" />
            <span className="flex-1 text-left">Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 h-12 text-sm hover:bg-accent"
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
            className="w-full justify-start gap-3 h-12 text-sm hover:bg-accent"
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
              onClick={handleEmailSubmit}
              size="lg"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? "Creating account..." : "Create account"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthOptions;
