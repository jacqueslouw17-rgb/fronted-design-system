import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface NationalitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  autoFilled?: boolean;
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
  placeholder = "Select nationality",
  autoFilled = false
}: NationalitySelectProps) => {
  // Ensure we only pass valid values to Select so placeholder renders when invalid/empty
  const allowedValues = useMemo(() => new Set(NATIONALITIES.map(n => n.value)), []);
  const selectedValue = allowedValues.has(value) ? value : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="nationality">
          {label} {required && "*"}
        </Label>
        {autoFilled && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Auto-filled by Kurt
          </motion.span>
        )}
      </div>
      <Select value={selectedValue} onValueChange={onValueChange}>
        <SelectTrigger id="nationality">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
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
