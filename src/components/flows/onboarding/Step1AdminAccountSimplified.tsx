/**
 * Step 1: Simplified Admin Account + Company Details
 * Part of Flow 5 — Company Admin Onboarding v1
 * 
 * Single form with sign-in fields + company name + HQ country
 * No stepper - just one unified form
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import StandardInput from "@/components/shared/StandardInput";
interface Step1SimplifiedProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}
const Step1AdminAccountSimplified = ({
  formData,
  onComplete,
  isProcessing = false
}: Step1SimplifiedProps) => {
  const navigate = useNavigate();
  
  // Auto-populate from formData (simulating pre-filled data from invite)
  const [fullName, setFullName] = useState(formData.adminName || "Joe Smith");
  const [email] = useState(formData.adminEmail || "joe.smith@jboxtech.com");
  const [companyName, setCompanyName] = useState(formData.companyName || "JBOX Technologies");
  const [hqCountry, setHqCountry] = useState(formData.hqCountry || "NO");
  const [password, setPassword] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!hqCountry) newErrors.hqCountry = "HQ Country is required";
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = 
    fullName.trim().length > 0 && 
    email.trim().length > 0 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
    companyName.trim().length > 0 && 
    hqCountry.length > 0 &&
    password.length >= 8;

  const handleGoToDashboard = async () => {
    if (!validate()) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Complete and navigate to dashboard
    onComplete("admin_account", {
      fullName,
      email,
      password,
      companyName,
      hqCountry
    });
    navigate("/flows/company-admin-dashboard-v1");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Sign In Header */}
      <div className="space-y-2">
        
        
      </div>

      {/* Form */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
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
          onChange={() => {}} 
          type="email" 
          required 
          error={errors.email} 
          placeholder="you@company.com"
          disabled
          helpText="Email is linked to your invitation and cannot be changed"
        />

        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="companyName" 
            value={companyName} 
            onChange={e => setCompanyName(e.target.value)} 
            placeholder="Fronted Test Co" 
            className="text-sm" 
          />
          {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hqCountry" className="text-sm">
            HQ Country <span className="text-destructive">*</span>
          </Label>
          <Select value={hqCountry} onValueChange={setHqCountry}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NO">🇳🇴 Norway</SelectItem>
              <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
              <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
              <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
              <SelectItem value="IN">🇮🇳 India</SelectItem>
              <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
              <SelectItem value="US">🇺🇸 United States</SelectItem>
              <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
            </SelectContent>
          </Select>
          {errors.hqCountry && <p className="text-xs text-destructive">{errors.hqCountry}</p>}
        </div>

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

      {/* Action Button */}
      <div className="pt-1">
        <Button 
          onClick={handleGoToDashboard} 
          disabled={!isFormValid || isProcessing || isSubmitting} 
          className="w-full" 
          size="lg"
        >
          {isProcessing || isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Go to Dashboard"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step1AdminAccountSimplified;