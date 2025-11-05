import React from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Calendar, BanknoteIcon } from "lucide-react";
import type { PayrollPayee } from "@/types/payroll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PayrollPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payee: PayrollPayee | null;
  role?: string;
  onApproveExecute?: () => void;
  onReschedule?: () => void;
  onNotifyContractor?: () => void;
}

export const PayrollPreviewDrawer: React.FC<PayrollPreviewDrawerProps> = ({
  open,
  onOpenChange,
  payee,
  role = "Software Engineer",
  onApproveExecute,
  onReschedule,
  onNotifyContractor,
}) => {
  if (!payee) return null;

  const adjustmentsTotal = payee.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  const totalGross = payee.gross + adjustmentsTotal;
  const employerTax = payee.employerCosts;
  const conversionFee = payee.fxFee || 0;
  const totalCostToEmployer = totalGross + employerTax + conversionFee;
  
  // Mock data for display
  const midMarketRate = payee.proposedFxRate ? payee.proposedFxRate * 0.995 : undefined;
  const baseCurrency = "USD";
  const baseSalary = payee.proposedFxRate ? totalGross / payee.proposedFxRate : totalGross;
  
  const getCountryFlag = (code: string) => {
    const flags: Record<string, string> = {
      'BR': '🇧🇷', 'AR': '🇦🇷', 'MX': '🇲🇽', 'CO': '🇨🇴',
      'GB': '🇬🇧', 'US': '🇺🇸', 'CA': '🇨🇦', 'DE': '🇩🇪',
    };
    return flags[code] || '🌍';
  };
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "Paid") return "default";
    if (status === "Executing") return "secondary";
    if (status === "Failed") return "destructive";
    return "outline";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {/* Header */}
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{getCountryFlag(payee.countryCode)}</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{payee.name}</h2>
                <p className="text-sm text-muted-foreground">{role}</p>
                <p className="text-xs text-muted-foreground mt-1">{payee.countryCode}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant={getStatusVariant(payee.status)} className="w-fit">
            Payroll: {payee.status}
          </Badge>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Payment Summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Payment Summary</h3>
          
          <div className="grid gap-3">
            {/* Salary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Salary</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {totalGross.toLocaleString()} {payee.currency}
                </p>
                {payee.proposedFxRate && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {baseSalary.toLocaleString(undefined, { maximumFractionDigits: 2 })} {baseCurrency}
                  </p>
                )}
              </div>
            </div>

            {/* FX Rate */}
            {payee.proposedFxRate && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium text-foreground">FX Rate</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {payee.proposedFxRate.toFixed(4)} (locked)
                  </p>
                  {midMarketRate && (
                    <p className="text-xs text-muted-foreground">
                      Mid-market: {midMarketRate.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bank Fee & ETA */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Payout Date</span>
              </div>
              <div className="text-right">
                {payee.eta && (
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(payee.eta).toLocaleDateString()}
                  </p>
                )}
                {payee.fxFee && (
                  <p className="text-xs text-muted-foreground">
                    Bank fee: ${payee.fxFee}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Breakdown Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Breakdown</h3>
          
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-sm">Gross Salary</TableCell>
                  <TableCell className="text-sm text-right font-medium">
                    {totalGross.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {payee.currency}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-sm">Employer Tax</TableCell>
                  <TableCell className="text-sm text-right font-medium">
                    {employerTax.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {payee.currency}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-sm">Conversion Fee</TableCell>
                  <TableCell className="text-sm text-right font-medium">
                    {conversionFee.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {baseCurrency}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell className="text-sm">Total Cost to Employer</TableCell>
                  <TableCell className="text-sm text-right">
                    {totalCostToEmployer.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {payee.currency}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Actions */}
        <div className="space-y-3">
          {onApproveExecute && (
            <Button onClick={onApproveExecute} className="w-full" size="lg">
              Approve & Execute
            </Button>
          )}
          
          <div className="flex gap-3">
            {onReschedule && (
              <Button onClick={onReschedule} variant="outline" className="flex-1">
                Reschedule
              </Button>
            )}
            {onNotifyContractor && (
              <Button onClick={onNotifyContractor} variant="outline" className="flex-1">
                Notify Contractor
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
