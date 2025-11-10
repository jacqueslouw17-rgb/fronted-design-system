import { useState, useEffect } from "react";
import StandardInput from "./StandardInput";
import frontedLogo from "@/assets/fronted-logo.png";

interface AuthOptionsProps {
  onComplete: (method: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const AuthOptions = ({ onComplete, isProcessing = false }: AuthOptionsProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate and update parent when email or password changes
  useEffect(() => {
    const isEmailValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8;
    
    if (isEmailValid && isPasswordValid) {
      onComplete("email", { email, password });
    } else {
      // Clear auth method if data becomes invalid
      onComplete("", {});
    }
  }, [email, password, onComplete]);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src={frontedLogo} alt="Fronted Logo" className="h-10 object-contain" />
      </div>
      
      <div className="text-center space-y-1.5 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Welcome to Fronted</h3>
        <p className="text-sm text-muted-foreground">Sign in to continue with your onboarding.</p>
      </div>

      <div className="space-y-4">
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

        <p className="text-xs text-center text-[#A0A0A0] pt-2">
          🔒 Secure sign-in. Your credentials are never shared.
        </p>
      </div>
    </div>
  );
};

export default AuthOptions;
