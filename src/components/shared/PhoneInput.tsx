import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
}

const COUNTRY_CODES = [
  { code: "+47", country: "NO", flag: "🇳🇴", label: "Norway" },
  { code: "+63", country: "PH", flag: "🇵🇭", label: "Philippines" },
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", label: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "United Kingdom" },
  { code: "+46", country: "SE", flag: "🇸🇪", label: "Sweden" },
  { code: "+45", country: "DK", flag: "🇩🇰", label: "Denmark" },
];

const PhoneInput = ({
  value,
  onChange,
  countryCode = "+47",
  onCountryCodeChange,
  label = "Phone Number",
  required = false,
  error,
  helpText,
  disabled = false
}: PhoneInputProps) => {
  const [selectedCode, setSelectedCode] = useState(countryCode);

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    onCountryCodeChange?.(code);
  };

  const formatPhoneNumber = (phone: string, code: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");
    
    // Format based on country
    switch (code) {
      case "+47": // Norway: XX XX XX XX
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
      case "+63": // Philippines: XXX XXX XXXX
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
      case "+91": // India: XXXXX XXXXX
        return cleaned.replace(/(\d{5})(\d{5})/, "$1 $2");
      case "+1": // US: (XXX) XXX-XXXX
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      case "+44": // UK: XXXX XXX XXXX
        return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
      default:
        return cleaned;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCode);
    onChange(formatted);
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === selectedCode);

  return (
    <div className="space-y-2">
      <Label htmlFor="phoneNumber">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        <Select value={selectedCode} onValueChange={handleCodeChange} disabled={disabled}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              {selectedCountry && `${selectedCountry.flag} ${selectedCountry.code}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {COUNTRY_CODES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.flag} {country.code} {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id="phoneNumber"
          value={value}
          onChange={handleInputChange}
          placeholder="Enter phone number"
          disabled={disabled}
          className="flex-1"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helpText && !error && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default PhoneInput;
