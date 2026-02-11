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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronsUpDown, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import StandardInput from "@/components/shared/StandardInput";
import { cn } from "@/lib/utils";

// Full list of countries with flags
const COUNTRIES = [
  { value: "AF", label: "Afghanistan", flag: "🇦🇫" },
  { value: "AX", label: "Åland Islands", flag: "🇦🇽" },
  { value: "AL", label: "Albania", flag: "🇦🇱" },
  { value: "DZ", label: "Algeria", flag: "🇩🇿" },
  { value: "AS", label: "American Samoa", flag: "🇦🇸" },
  { value: "AD", label: "Andorra", flag: "🇦🇩" },
  { value: "AO", label: "Angola", flag: "🇦🇴" },
  { value: "AI", label: "Anguilla", flag: "🇦🇮" },
  { value: "AQ", label: "Antarctica", flag: "🇦🇶" },
  { value: "AG", label: "Antigua and Barbuda", flag: "🇦🇬" },
  { value: "AR", label: "Argentina", flag: "🇦🇷" },
  { value: "AM", label: "Armenia", flag: "🇦🇲" },
  { value: "AU", label: "Australia", flag: "🇦🇺" },
  { value: "AT", label: "Austria", flag: "🇦🇹" },
  { value: "AZ", label: "Azerbaijan", flag: "🇦🇿" },
  { value: "BS", label: "Bahamas", flag: "🇧🇸" },
  { value: "BH", label: "Bahrain", flag: "🇧🇭" },
  { value: "BD", label: "Bangladesh", flag: "🇧🇩" },
  { value: "BB", label: "Barbados", flag: "🇧🇧" },
  { value: "BE", label: "Belgium", flag: "🇧🇪" },
  { value: "BZ", label: "Belize", flag: "🇧🇿" },
  { value: "BJ", label: "Benin", flag: "🇧🇯" },
  { value: "BT", label: "Bhutan", flag: "🇧🇹" },
  { value: "BO", label: "Bolivia", flag: "🇧🇴" },
  { value: "BR", label: "Brazil", flag: "🇧🇷" },
  { value: "BG", label: "Bulgaria", flag: "🇧🇬" },
  { value: "CA", label: "Canada", flag: "🇨🇦" },
  { value: "CL", label: "Chile", flag: "🇨🇱" },
  { value: "CN", label: "China", flag: "🇨🇳" },
  { value: "CO", label: "Colombia", flag: "🇨🇴" },
  { value: "HR", label: "Croatia", flag: "🇭🇷" },
  { value: "CY", label: "Cyprus", flag: "🇨🇾" },
  { value: "CZ", label: "Czech Republic", flag: "🇨🇿" },
  { value: "DK", label: "Denmark", flag: "🇩🇰" },
  { value: "EG", label: "Egypt", flag: "🇪🇬" },
  { value: "EE", label: "Estonia", flag: "🇪🇪" },
  { value: "FI", label: "Finland", flag: "🇫🇮" },
  { value: "FR", label: "France", flag: "🇫🇷" },
  { value: "DE", label: "Germany", flag: "🇩🇪" },
  { value: "GR", label: "Greece", flag: "🇬🇷" },
  { value: "HK", label: "Hong Kong", flag: "🇭🇰" },
  { value: "HU", label: "Hungary", flag: "🇭🇺" },
  { value: "IS", label: "Iceland", flag: "🇮🇸" },
  { value: "IN", label: "India", flag: "🇮🇳" },
  { value: "ID", label: "Indonesia", flag: "🇮🇩" },
  { value: "IE", label: "Ireland", flag: "🇮🇪" },
  { value: "IL", label: "Israel", flag: "🇮🇱" },
  { value: "IT", label: "Italy", flag: "🇮🇹" },
  { value: "JP", label: "Japan", flag: "🇯🇵" },
  { value: "KE", label: "Kenya", flag: "🇰🇪" },
  { value: "XK", label: "Kosovo", flag: "🇽🇰" },
  { value: "LV", label: "Latvia", flag: "🇱🇻" },
  { value: "LT", label: "Lithuania", flag: "🇱🇹" },
  { value: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { value: "MY", label: "Malaysia", flag: "🇲🇾" },
  { value: "MX", label: "Mexico", flag: "🇲🇽" },
  { value: "NL", label: "Netherlands", flag: "🇳🇱" },
  { value: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { value: "NG", label: "Nigeria", flag: "🇳🇬" },
  { value: "NO", label: "Norway", flag: "🇳🇴" },
  { value: "PK", label: "Pakistan", flag: "🇵🇰" },
  { value: "PH", label: "Philippines", flag: "🇵🇭" },
  { value: "PL", label: "Poland", flag: "🇵🇱" },
  { value: "PT", label: "Portugal", flag: "🇵🇹" },
  { value: "RO", label: "Romania", flag: "🇷🇴" },
  { value: "RU", label: "Russia", flag: "🇷🇺" },
  { value: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "RS", label: "Serbia", flag: "🇷🇸" },
  { value: "SG", label: "Singapore", flag: "🇸🇬" },
  { value: "SK", label: "Slovakia", flag: "🇸🇰" },
  { value: "SI", label: "Slovenia", flag: "🇸🇮" },
  { value: "ZA", label: "South Africa", flag: "🇿🇦" },
  { value: "KR", label: "South Korea", flag: "🇰🇷" },
  { value: "ES", label: "Spain", flag: "🇪🇸" },
  { value: "SE", label: "Sweden", flag: "🇸🇪" },
  { value: "CH", label: "Switzerland", flag: "🇨🇭" },
  { value: "TW", label: "Taiwan", flag: "🇹🇼" },
  { value: "TH", label: "Thailand", flag: "🇹🇭" },
  { value: "TR", label: "Turkey", flag: "🇹🇷" },
  { value: "UA", label: "Ukraine", flag: "🇺🇦" },
  { value: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "VN", label: "Vietnam", flag: "🇻🇳" },
];

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);

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

  const selectedCountry = COUNTRIES.find(c => c.value === hqCountry);

  const isFormValid = 
    fullName.trim().length > 0 && 
    email.trim().length > 0 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
    companyName.trim().length > 0 && 
    hqCountry.length > 0 &&
    password.length >= 8 &&
    termsAccepted;

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

    onComplete("admin_account", {
      fullName,
      email,
      password,
      companyName,
      hqCountry
    });
    navigate("/flows/company-admin-dashboard");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Form */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-5 space-y-4">
        <p className="text-xs text-muted-foreground">All fields are required.</p>

        <StandardInput 
          id="fullName" 
          label="Full Name" 
          value={fullName} 
          onChange={setFullName} 
          type="text" 
          error={errors.fullName} 
          placeholder="John Doe" 
        />

        <StandardInput 
          id="email" 
          label="Email" 
          value={email} 
          onChange={() => {}} 
          type="email" 
          error={errors.email} 
          placeholder="you@company.com"
          disabled
          helpText="Email is linked to your invitation and cannot be changed"
        />

        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm">
            Company Name
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
            HQ Country
          </Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between text-sm font-normal h-10"
              >
                {selectedCountry ? (
                  <span>{selectedCountry.flag} {selectedCountry.label}</span>
                ) : (
                  <span className="text-muted-foreground">Select country</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border z-50" align="start">
              <Command>
                <CommandInput placeholder="Search country..." className="h-10" />
                <CommandList className="max-h-[240px]">
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {COUNTRIES.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.label}
                        onSelect={() => {
                          setHqCountry(country.value);
                          setCountryOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            hqCountry === country.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.flag} {country.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.hqCountry && <p className="text-xs text-destructive">{errors.hqCountry}</p>}
        </div>

        <StandardInput 
          id="password" 
          label="Password" 
          value={password} 
          onChange={setPassword} 
          type="password" 
          error={errors.password} 
          helpText="Minimum 8 characters" 
          placeholder="••••••••" 
        />

        <p className="text-xs text-center text-muted-foreground pt-2">
          🔒 Secure sign-in. Your credentials are never shared.
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-card/40 border border-border/40 rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <label htmlFor="terms" className="text-sm text-foreground leading-snug cursor-pointer select-none">
            I agree to the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setTermsSheetOpen(true);
              }}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Terms &amp; Conditions
            </button>
          </label>
        </div>
      </div>

      {/* Terms Sheet (right-side drawer — consistent with project patterns) */}
      <Sheet open={termsSheetOpen} onOpenChange={setTermsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0 [&>button]:hidden">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-6 py-5 flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Terms &amp; Conditions</SheetTitle>
            <button
              onClick={() => setTermsSheetOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using the Fronted platform, you agree to the following terms and conditions.
              These terms govern your use of the platform as a Company Admin.
            </p>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">1. Platform Usage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are granted access to manage payroll, employee data, and compliance workflows
                on behalf of your organization. You agree to use the platform responsibly and in
                accordance with applicable laws.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">2. Data Privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All employee and contractor data processed through the platform is handled in
                compliance with GDPR and relevant data protection regulations. You are responsible
                for ensuring the accuracy of the data you submit.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">3. Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You agree to maintain the confidentiality of your login credentials and to notify
                us immediately of any unauthorized access to your account.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">4. Liability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The platform is provided "as is." While we take reasonable measures to ensure
                accuracy and uptime, we are not liable for any indirect damages arising from
                platform use.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">5. Amendments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We reserve the right to update these terms at any time. Continued use of the
                platform constitutes acceptance of any changes.
              </p>
            </section>

            <div className="pt-4 pb-2">
              <Button
                onClick={() => {
                  setTermsAccepted(true);
                  setTermsSheetOpen(false);
                }}
                className="w-full"
              >
                I agree
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Action Button */}
      <div>
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