import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NationalitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const NATIONALITIES = [
  { value: "NO", label: "🇳🇴 Norwegian", flag: "🇳🇴" },
  { value: "PH", label: "🇵🇭 Filipino", flag: "🇵🇭" },
  { value: "IN", label: "🇮🇳 Indian", flag: "🇮🇳" },
  { value: "US", label: "🇺🇸 American", flag: "🇺🇸" },
  { value: "GB", label: "🇬🇧 British", flag: "🇬🇧" },
  { value: "SE", label: "🇸🇪 Swedish", flag: "🇸🇪" },
  { value: "DK", label: "🇩🇰 Danish", flag: "🇩🇰" },
  { value: "FI", label: "🇫🇮 Finnish", flag: "🇫🇮" },
  { value: "DE", label: "🇩🇪 German", flag: "🇩🇪" },
  { value: "FR", label: "🇫🇷 French", flag: "🇫🇷" },
];

const NationalitySelect = ({ 
  value, 
  onValueChange, 
  label = "Nationality",
  required = false,
  placeholder = "Select nationality" 
}: NationalitySelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="nationality">
        {label} {required && "*"}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="nationality">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card z-50">
          {NATIONALITIES.map((nationality) => (
            <SelectItem key={nationality.value} value={nationality.value}>
              {nationality.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NationalitySelect;
