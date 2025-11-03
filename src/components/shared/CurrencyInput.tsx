import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrencyInputProps {
  value: string | number;
  onChange: (value: string) => void;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  showCurrencySelect?: boolean;
}

const CURRENCIES = [
  { code: "NOK", symbol: "kr", label: "Norwegian Krone" },
  { code: "PHP", symbol: "₱", label: "Philippine Peso" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
];

const CurrencyInput = ({
  value,
  onChange,
  currency = "NOK",
  onCurrencyChange,
  label = "Amount",
  required = false,
  error,
  helpText,
  disabled = false,
  showCurrencySelect = true
}: CurrencyInputProps) => {
  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const formatCurrency = (val: string) => {
    // Remove all non-digits and decimal points
    const cleaned = val.replace(/[^\d.]/g, "");
    
    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    
    // Format with thousand separators
    const [whole, decimal] = parts;
    const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="currencyAmount">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        {showCurrencySelect ? (
          <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                {selectedCurrency.code}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center justify-center w-[60px] px-3 rounded-md border border-input bg-muted/50 text-sm font-medium">
            {selectedCurrency.symbol}
          </div>
        )}
        <Input
          id="currencyAmount"
          value={value}
          onChange={handleInputChange}
          placeholder="0.00"
          disabled={disabled}
          className="flex-1"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helpText && !error && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default CurrencyInput;
