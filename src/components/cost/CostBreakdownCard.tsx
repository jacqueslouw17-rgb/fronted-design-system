import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, BarChart3 } from "lucide-react";
import { FXBadge } from "./FXBadge";
import { FeeToggleSwitch } from "./FeeToggleSwitch";
import { TooltipExplain } from "./TooltipExplain";
import { ComparisonChart } from "./ComparisonChart";
import { useCostCalculator } from "@/hooks/useCostCalculator";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { toast } from "@/hooks/use-toast";

interface CostBreakdownCardProps {
  jurisdiction?: string;
  currency?: string;
  gross?: number;
  employerRate?: number;
  feeRate?: number;
  feeModel?: "GROSS" | "TOTAL_COST";
  fxSpot?: number;
  fxSpread?: number;
  competitorEnabled?: boolean;
}

export const CostBreakdownCard = ({
  jurisdiction: initialJurisdiction = "Sweden",
  currency: initialCurrency = "SEK",
  gross: initialGross = 40000,
  employerRate: initialEmployerRate = 0.3142,
  feeRate: initialFeeRate = 0.15,
  feeModel: initialFeeModel = "TOTAL_COST",
  fxSpot: initialFxSpot,
  fxSpread: initialFxSpread,
  competitorEnabled = true,
}: CostBreakdownCardProps) => {
  const [jurisdiction, setJurisdiction] = useState(initialJurisdiction);
  const [currency, setCurrency] = useState(initialCurrency);
  const [gross, setGross] = useState(initialGross);
  const [employerRate, setEmployerRate] = useState(initialEmployerRate);
  const [feeRate, setFeeRate] = useState(initialFeeRate);
  const [feeModel, setFeeModel] = useState<"GROSS" | "TOTAL_COST">(initialFeeModel);
  const [fxSpot, setFxSpot] = useState<number | undefined>(initialFxSpot);
  const [fxSpread, setFxSpread] = useState<number | undefined>(initialFxSpread);
  const [showComparison, setShowComparison] = useState(false);
  const [prevState, setPrevState] = useState({ feeModel, feeRate, gross, employerRate });

  const { addAuditEntry, viewAudit } = useAuditTrail();

  const calculation = useCostCalculator({
    gross,
    employerRate,
    feeRate,
    feeModel,
    fxSpot,
    fxSpread,
  });

  // Track changes and log to audit
  useEffect(() => {
    if (
      prevState.feeModel !== feeModel ||
      prevState.feeRate !== feeRate ||
      prevState.gross !== gross ||
      prevState.employerRate !== employerRate
    ) {
      addAuditEntry({
        user: "current-user",
        action: "COST_VISUALIZER_UPDATE",
        before: prevState,
        after: { feeModel, feeRate, gross, employerRate },
      });
      setPrevState({ feeModel, feeRate, gross, employerRate });
    }
  }, [feeModel, feeRate, gross, employerRate]);

  const handleSavePolicy = () => {
    const policy = { feeModel, feeRate };
    localStorage.setItem("policy", JSON.stringify(policy));
    toast({
      title: "Policy saved",
      description: "Default fee model and rate saved successfully.",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cost Breakdown</span>
            {calculation.effectiveRate && (
              <FXBadge
                spot={fxSpot!}
                spread={fxSpread}
                effectiveRate={calculation.effectiveRate}
              />
            )}
          </CardTitle>
          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <Label htmlFor="jurisdiction" className="text-xs">Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sweden">🇸🇪 Sweden</SelectItem>
                  <SelectItem value="Norway">🇳🇴 Norway</SelectItem>
                  <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                  <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="currency" className="text-xs">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEK">SEK</SelectItem>
                  <SelectItem value="NOK">NOK</SelectItem>
                  <SelectItem value="PHP">PHP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gross" className="text-xs">Gross Salary</Label>
              <Input
                id="gross"
                type="number"
                value={gross}
                onChange={(e) => setGross(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="employerRate" className="text-xs">Employer Rate</Label>
              <Input
                id="employerRate"
                type="number"
                step="0.0001"
                value={employerRate}
                onChange={(e) => setEmployerRate(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="feeRate" className="text-xs">Fee Rate</Label>
              <Input
                id="feeRate"
                type="number"
                step="0.01"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                Gross Salary
                <TooltipExplain formula="Base salary amount" source="User input" />
              </span>
              <span className="font-mono">{currency} {formatAmount(calculation.gross)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                Employer Tax
                <TooltipExplain
                  formula={`Gross × ${(employerRate * 100).toFixed(2)}%`}
                  source={`${jurisdiction} tax authority`}
                />
              </span>
              <span className="font-mono text-muted-foreground">
                +{currency} {formatAmount(calculation.employerTax)}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center">
                Subtotal (Gross + Tax)
                <TooltipExplain formula="Gross + Employer Tax" />
              </span>
              <span className="font-mono">{currency} {formatAmount(calculation.totalCostBase)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                Fronted Fee
                <TooltipExplain
                  formula={
                    feeModel === "GROSS"
                      ? `Gross × ${(feeRate * 100).toFixed(0)}%`
                      : `(Gross + Tax) × ${(feeRate * 100).toFixed(0)}%`
                  }
                  source="Company policy"
                />
              </span>
              <span className="font-mono text-muted-foreground">
                +{currency} {formatAmount(calculation.fee)}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Final Total</span>
              <span className="font-mono">{currency} {formatAmount(calculation.finalTotal)}</span>
            </div>
          </div>

          <FeeToggleSwitch feeModel={feeModel} onChange={setFeeModel} />
        </CardContent>

        <CardFooter className="flex gap-2">
          {competitorEnabled && (
            <Button
              variant="outline"
              onClick={() => setShowComparison(true)}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Compare
            </Button>
          )}
          <Button onClick={handleSavePolicy} className="gap-2">
            <Save className="h-4 w-4" />
            Save as default policy
          </Button>
          <Button variant="ghost" onClick={viewAudit} className="ml-auto text-xs">
            View in Audit
          </Button>
        </CardFooter>
      </Card>

      <ComparisonChart
        open={showComparison}
        onOpenChange={setShowComparison}
        frontedTotal={calculation.finalTotal}
        currency={currency}
      />
    </>
  );
};
