import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface MonthlyPayScheduleInputProps {
  value: string | number;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
}

const MonthlyPayScheduleInput = ({
  value,
  onChange,
  label = "Payout Day of Month",
  required = false,
  error,
  helpText = "Day of the month (e.g., 25 = 25th of each month)",
  disabled = false
}: MonthlyPayScheduleInputProps) => {
  const [validationError, setValidationError] = useState<string>("");

  const validateDay = (day: string) => {
    const dayNum = parseInt(day);
    
    if (isNaN(dayNum)) {
      setValidationError("Please enter a valid number");
      return false;
    }
    
    if (dayNum < 1 || dayNum > 31) {
      setValidationError("Day must be between 1 and 31");
      return false;
    }
    
    // Warning for days 29-31 (not all months have these days)
    if (dayNum > 28) {
      setValidationError("");
      return true;
    }
    
    setValidationError("");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue) {
      validateDay(newValue);
    } else {
      setValidationError("");
    }
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-2">
      <Label htmlFor="payoutDay">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id="payoutDay"
        type="number"
        min="1"
        max="31"
        value={value}
        onChange={handleChange}
        placeholder="25"
        disabled={disabled}
        className={displayError ? "border-destructive" : ""}
      />
      {displayError && <p className="text-xs text-destructive">{displayError}</p>}
      {helpText && !displayError && <p className="text-xs text-muted-foreground">{helpText}</p>}
      {!displayError && parseInt(value.toString()) > 28 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          ⚠️ Note: Some months may not have day {value}. Payments will be processed on the last day of the month when this occurs.
        </p>
      )}
    </div>
  );
};

export default MonthlyPayScheduleInput;
