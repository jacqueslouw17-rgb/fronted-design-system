import { useState, useEffect } from "react";
import StandardInput from "./StandardInput";

interface AuthOptionsProps {
  onComplete: (method: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  hidePassword?: boolean;
}

const AuthOptions = ({ onComplete, isProcessing = false, hidePassword = false }: AuthOptionsProps) => {
  const [fullName, setFullName] = useState("Joe Smith");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate and update parent when fields change
  useEffect(() => {
    const isNameValid = fullName.trim().length > 0;
    const isEmailValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = hidePassword || password.length >= 8;
    
    if (isNameValid && isEmailValid && isPasswordValid) {
      onComplete("email", { fullName, email, password: hidePassword ? undefined : password });
    } else {
      // Clear auth method if data becomes invalid
      onComplete("", {});
    }
  }, [fullName, email, password, onComplete, hidePassword]);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-4">
        <StandardInput
          id="fullName"
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          type="text"
          required
          error={errors.fullName}
          placeholder="John Doe"
        />

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

        {!hidePassword && (
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
        )}

        {!hidePassword && (
          <p className="text-xs text-center text-[#A0A0A0] pt-2">
            🔒 Secure sign-in. Your credentials are never shared.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthOptions;
