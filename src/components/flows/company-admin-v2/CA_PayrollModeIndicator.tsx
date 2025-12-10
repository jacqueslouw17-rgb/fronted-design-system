// Flow 6 v2 & Flow 1 v4 - Payroll Mode Indicator Component
// Visual indicator for Auto vs Manual payroll mode based on country

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info, Cpu, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PayrollMode = "automated" | "manual";

// Country to payroll mode mapping
export const getPayrollModeForCountry = (countryCode: string): PayrollMode => {
  // Philippines uses automated JSON rules
  if (countryCode === "PH") return "automated";
  // Norway uses manual admin-entered values
  if (countryCode === "NO") return "manual";
  // Default to automated for other countries
  return "automated";
};

export const getPayrollModeLabel = (mode: PayrollMode): string => {
  return mode === "automated" ? "Automated (JSON rules)" : "Manual (admin-entered)";
};

export const getPayrollModeShortLabel = (mode: PayrollMode): string => {
  return mode === "automated" ? "Auto" : "Manual";
};

interface CA_PayrollModePillProps {
  mode: PayrollMode;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Mode pill for payroll header - shows the current payroll processing mode
 */
export const CA_PayrollModePill: React.FC<CA_PayrollModePillProps> = ({ 
  mode, 
  className,
  size = "md" 
}) => {
  const isAuto = mode === "automated";
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 font-medium",
        isAuto 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
          : "bg-amber-500/10 text-amber-600 border-amber-500/30",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1",
        className
      )}
    >
      {isAuto ? <Cpu className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} /> : <Edit3 className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />}
      Mode: {getPayrollModeLabel(mode)}
    </Badge>
  );
};

interface CA_PayrollModeTableBadgeProps {
  mode: PayrollMode;
  className?: string;
}

/**
 * Small inline badge for FX table headers
 */
export const CA_PayrollModeTableBadge: React.FC<CA_PayrollModeTableBadgeProps> = ({ 
  mode, 
  className 
}) => {
  const isAuto = mode === "automated";
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] px-1.5 py-0.5 gap-1 font-medium",
        isAuto 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
          : "bg-amber-500/10 text-amber-600 border-amber-500/30",
        className
      )}
    >
      {isAuto ? <Cpu className="h-2.5 w-2.5" /> : <Edit3 className="h-2.5 w-2.5" />}
      {getPayrollModeShortLabel(mode)}
    </Badge>
  );
};

interface CA_PayrollModeWorkerTagProps {
  mode: PayrollMode;
  className?: string;
}

/**
 * Subtle tag for worker rows in FX table - only shows for manual mode
 */
export const CA_PayrollModeWorkerTag: React.FC<CA_PayrollModeWorkerTagProps> = ({ 
  mode, 
  className 
}) => {
  // Only show for manual mode
  if (mode === "automated") return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[9px] px-1 py-0 gap-0.5 font-normal",
        "bg-amber-500/10 text-amber-600 border-amber-500/20",
        className
      )}
    >
      Manual
    </Badge>
  );
};

interface CA_PayrollModeInfoBannerProps {
  mode: PayrollMode;
  context?: "drawer" | "batch";
  className?: string;
}

/**
 * Info banner for worker drawer and batch review sections
 */
export const CA_PayrollModeInfoBanner: React.FC<CA_PayrollModeInfoBannerProps> = ({ 
  mode, 
  context = "drawer",
  className 
}) => {
  const isAuto = mode === "automated";
  
  const getMessage = () => {
    if (context === "drawer") {
      return isAuto 
        ? "Automated mode – amounts are calculated from country rules. Use overrides only for special cases."
        : "Manual mode – baseline amounts are entered by admin. Use this drawer to review and fine-tune.";
    }
    // Batch context
    return isAuto
      ? "Statutory rules summary calculated from country JSON configuration."
      : "This country currently runs in Manual mode. Statutory calculations are handled offline and entered by Fronted / the client. The payment batch reflects the latest reviewed values for each worker.";
  };
  
  return (
    <div 
      className={cn(
        "flex items-start gap-2 p-2.5 rounded-lg border text-xs",
        isAuto 
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
          : "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400",
        className
      )}
    >
      <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <span className="leading-relaxed">{getMessage()}</span>
    </div>
  );
};

interface CA_CountryRulesBlockProps {
  mode: PayrollMode;
  countryCode: string;
  className?: string;
}

/**
 * Country rules block for batch review - shows different content based on mode
 */
export const CA_CountryRulesBlock: React.FC<CA_CountryRulesBlockProps> = ({ 
  mode, 
  countryCode,
  className 
}) => {
  const isAuto = mode === "automated";
  
  if (isAuto) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Country Rules</span>
          <CA_PayrollModeTableBadge mode={mode} />
        </div>
        <div className="text-xs text-muted-foreground space-y-1.5">
          {countryCode === "PH" && (
            <>
              <p>• SSS contributions calculated per 2024 table</p>
              <p>• PhilHealth: 5% of basic monthly salary (shared 50/50)</p>
              <p>• Pag-IBIG: ₱200 max employee contribution</p>
              <p>• Withholding tax: Graduated rates per BIR table</p>
            </>
          )}
          {countryCode !== "PH" && (
            <p>Statutory rules applied from country configuration.</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Country Rules</span>
        <CA_PayrollModeTableBadge mode={mode} />
      </div>
      <CA_PayrollModeInfoBanner mode={mode} context="batch" />
    </div>
  );
};
