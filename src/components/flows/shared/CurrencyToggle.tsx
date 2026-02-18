import React from "react";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock FX rates to USD (approximate for demo purposes)
const fxRatesToUSD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  NOK: 0.094,
  SEK: 0.096,
  DKK: 0.145,
  CHF: 1.12,
  PLN: 0.25,
  CZK: 0.044,
  HUF: 0.0027,
  RON: 0.22,
  PHP: 0.018,
  INR: 0.012,
  SGD: 0.74,
  JPY: 0.0067,
  KRW: 0.00075,
  CNY: 0.14,
  HKD: 0.13,
  TWD: 0.031,
  THB: 0.028,
  VND: 0.000041,
  MYR: 0.22,
  IDR: 0.000063,
  CAD: 0.74,
  MXN: 0.058,
  BRL: 0.20,
  ARS: 0.0012,
  COP: 0.00025,
  CLP: 0.0011,
  AUD: 0.65,
  NZD: 0.61,
  AED: 0.27,
  SAR: 0.27,
  ILS: 0.27,
  ZAR: 0.055,
  NGN: 0.00065,
  EGP: 0.021,
};

const currencySymbols: Record<string, string> = {
  EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$",
  GBP: "£", INR: "₹", JPY: "¥", KRW: "₩", CNY: "¥",
  CHF: "CHF", SEK: "kr", DKK: "kr", PLN: "zł", CZK: "Kč",
  HUF: "Ft", RON: "lei", HKD: "HK$", TWD: "NT$", THB: "฿",
  VND: "₫", MYR: "RM", IDR: "Rp", CAD: "C$", MXN: "MX$",
  BRL: "R$", ARS: "AR$", COP: "CO$", CLP: "CL$", AUD: "A$",
  NZD: "NZ$", AED: "د.إ", SAR: "﷼", ILS: "₪", ZAR: "R",
  NGN: "₦", EGP: "E£",
};

export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = fxRatesToUSD[fromCurrency] || 1;
  return amount * rate;
}

export function formatCurrencyAmount(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface CurrencyToggleProps {
  amount: number;
  localCurrency: string;
  showUSD: boolean;
  onToggle: () => void;
  previousAmount?: number;
  showPreviousAmount?: boolean;
  className?: string;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({
  amount,
  localCurrency,
  showUSD,
  onToggle,
  previousAmount,
  showPreviousAmount = false,
  className,
}) => {
  const isAlreadyUSD = localCurrency === "USD";
  const displayAmount = showUSD && !isAlreadyUSD ? convertToUSD(amount, localCurrency) : amount;
  const displayCurrency = showUSD && !isAlreadyUSD ? "USD" : localCurrency;
  const displayPrevious = previousAmount !== undefined && showPreviousAmount
    ? (showUSD && !isAlreadyUSD ? convertToUSD(previousAmount, localCurrency) : previousAmount)
    : undefined;

  return (
    <div className={cn("text-right", className)}>
      <div className="flex items-center justify-end gap-1.5">
        <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
          {showUSD && !isAlreadyUSD && "≈ "}
          {formatCurrencyAmount(displayAmount, displayCurrency)}
        </p>
        {!isAlreadyUSD && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-all duration-150",
              "border border-border/50 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
              showUSD
                ? "bg-primary/5 text-primary border-primary/30"
                : "text-muted-foreground bg-muted/30"
            )}
          >
            <ArrowLeftRight className="h-2.5 w-2.5" />
            {showUSD ? "USD" : displayCurrency}
          </button>
        )}
      </div>
      {displayPrevious !== undefined && (
        <p className="text-[10px] text-muted-foreground/60 tabular-nums">
          was {showUSD && !isAlreadyUSD && "≈ "}{formatCurrencyAmount(displayPrevious, displayCurrency)}
        </p>
      )}
    </div>
  );
};
