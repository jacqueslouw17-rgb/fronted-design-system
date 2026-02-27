/**
 * Flow 5 — Step 1: Account & Company Details
 * 
 * Prefilled from invite. Worker fills password.
 * Matches Flow 2 v2 / Flow 3 v2 step content pattern.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ArrowRight, Lock, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import StandardInput from "@/components/shared/StandardInput";

const COUNTRIES = [
  { value: "AF", label: "Afghanistan", flag: "🇦🇫" },
  { value: "AX", label: "Åland Islands", flag: "🇦🇽" },
  { value: "AL", label: "Albania", flag: "🇦🇱" },
  { value: "DZ", label: "Algeria", flag: "🇩🇿" },
  { value: "AD", label: "Andorra", flag: "🇦🇩" },
  { value: "AR", label: "Argentina", flag: "🇦🇷" },
  { value: "AU", label: "Australia", flag: "🇦🇺" },
  { value: "AT", label: "Austria", flag: "🇦🇹" },
  { value: "BE", label: "Belgium", flag: "🇧🇪" },
  { value: "BR", label: "Brazil", flag: "🇧🇷" },
  { value: "CA", label: "Canada", flag: "🇨🇦" },
  { value: "CL", label: "Chile", flag: "🇨🇱" },
  { value: "CN", label: "China", flag: "🇨🇳" },
  { value: "CO", label: "Colombia", flag: "🇨🇴" },
  { value: "HR", label: "Croatia", flag: "🇭🇷" },
  { value: "CZ", label: "Czech Republic", flag: "🇨🇿" },
  { value: "DK", label: "Denmark", flag: "🇩🇰" },
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
  { value: "TH", label: "Thailand", flag: "🇹🇭" },
  { value: "TR", label: "Turkey", flag: "🇹🇷" },
  { value: "UA", label: "Ukraine", flag: "🇺🇦" },
  { value: "AE", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "VN", label: "Vietnam", flag: "🇻🇳" },
];

interface StepAccountDetailsProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const StepAccountDetails: React.FC<StepAccountDetailsProps> = ({ formData, onComplete, isProcessing }) => {
  const [fullName, setFullName] = useState(formData.adminName || "Joe Smith");
  const [email] = useState(formData.adminEmail || "joe.smith@jboxtech.com");
  const [companyName, setCompanyName] = useState(formData.companyName || "JBOX Technologies");
  const [hqCountry, setHqCountry] = useState(formData.hqCountry || "NO");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryOpen, setCountryOpen] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.value === hqCountry);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!hqCountry) newErrors.hqCountry = "HQ Country is required";
    if (!password || password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValid = fullName.trim() && companyName.trim() && hqCountry && password.length >= 8;

  const handleContinue = () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    onComplete("account_details", { fullName, email, companyName, hqCountry, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6 p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Account & Company Details</h3>
        <p className="text-sm text-muted-foreground">
          Confirm your details and set a password to access your dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <StandardInput
          id="fullName"
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          type="text"
          error={errors.fullName}
          placeholder="John Doe"
        />

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} disabled className="bg-muted/50" />
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Linked to your invitation and cannot be changed.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Company name"
          />
          {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
        </div>

        <div className="space-y-2">
          <Label>HQ Country</Label>
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
                        <Check className={cn("mr-2 h-4 w-4", hqCountry === country.value ? "opacity-100" : "opacity-0")} />
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
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default StepAccountDetails;
