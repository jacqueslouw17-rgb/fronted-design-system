import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Lock, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface StandardInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "textarea";
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  locked?: boolean;
  lockMessage?: string;
  completed?: boolean;
  rows?: number;
}

const StandardInput = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  helpText,
  placeholder,
  disabled = false,
  locked = false,
  lockMessage,
  completed = false,
  rows = 4
}: StandardInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const InputComponent = type === "textarea" ? Textarea : Input;
  
  // For password fields, toggle between "password" and "text"
  const actualType = type === "password" ? (showPassword ? "text" : "password") : type;
  const inputProps = type === "textarea" ? { rows } : { type: actualType };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {completed && !error && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3 w-3" />
            <span className="text-xs">Completed</span>
          </div>
        )}
        {locked && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground cursor-help">
                  <Lock className="h-3 w-3" />
                  <span className="text-xs">Locked</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  {lockMessage || "This field is locked and cannot be edited"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Password input with show/hide toggle */}
      {type === "password" ? (
        <div className="relative">
          <InputComponent
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || locked}
            className={locked ? "bg-muted/50 text-muted-foreground cursor-not-allowed pr-10" : "pr-10"}
            {...inputProps}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled || locked}
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent transition-colors duration-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </Button>
        </div>
      ) : (
        <InputComponent
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || locked}
          className={locked ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""}
          {...inputProps}
        />
      )}
      
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helpText && !error && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default StandardInput;
