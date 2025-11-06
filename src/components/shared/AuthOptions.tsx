import { useState, useEffect } from "react";
import StandardInput from "./StandardInput";

interface AuthOptionsProps {
  onComplete: (method: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const AuthOptions = ({ onComplete, isProcessing = false }: AuthOptionsProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-notify parent that email method is selected on mount
  useEffect(() => {
    onComplete("email", {});
  }, [onComplete]);

  // Update parent when email or password changes with valid data
  useEffect(() => {
    if (email && password && password.length >= 8 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onComplete("email", { email, password });
    }
  }, [email, password, onComplete]);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="text-center space-y-1.5 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Create your Fronted account</h3>
        <p className="text-sm text-muted-foreground">Sign up securely with your work email.</p>
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
