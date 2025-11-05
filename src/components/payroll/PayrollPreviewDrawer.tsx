import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit } from "lucide-react";
import type { PayrollPayee } from "@/types/payroll";

interface PayrollPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payee: PayrollPayee | null;
  onEdit?: () => void;
  onIncludeInBatch?: () => void;
  onSimulateFX?: () => void;
  onSendToCFO?: () => void;
  onViewBatch?: () => void;
}

export const PayrollPreviewDrawer: React.FC<PayrollPreviewDrawerProps> = ({
  open,
  onOpenChange,
  payee,
  onEdit,
  onIncludeInBatch,
  onSimulateFX,
  onSendToCFO,
  onViewBatch,
}) => {
  if (!payee) return null;

  const adjustmentsTotal = payee.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  const totalGross = payee.gross + adjustmentsTotal;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Payroll Preview: {payee.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Worker Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Country</span>
                <span className="text-sm font-medium text-foreground">{payee.countryCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Currency</span>
                <span className="text-sm font-medium text-foreground">{payee.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={payee.status === "Ready" ? "default" : "secondary"}>
                  {payee.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Base Compensation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gross Salary</span>
                <span className="text-sm font-medium text-foreground">
                  {payee.gross.toLocaleString()} {payee.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employer Costs</span>
                <span className="text-sm font-medium text-foreground">
                  {payee.employerCosts.toLocaleString()} {payee.currency}
                </span>
              </div>
            </div>
          </div>

          {payee.adjustments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Adjustments ({payee.adjustments.length})
                </h3>
                <div className="space-y-2">
                  {payee.adjustments.map((adj, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">{adj.label}</p>
                        <p className="text-xs text-muted-foreground">{adj.type}</p>
                        {adj.note && (
                          <p className="text-xs text-muted-foreground mt-1">{adj.note}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        +{adj.amount.toLocaleString()} {payee.currency}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-border/30">
                    <span className="text-sm font-semibold text-foreground">Total Adjustments</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{adjustmentsTotal.toLocaleString()} {payee.currency}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">FX Details</h3>
            <div className="space-y-2">
              {payee.proposedFxRate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Proposed Rate</span>
                  <span className="text-sm font-medium text-foreground">
                    {payee.proposedFxRate.toFixed(4)}
                  </span>
                </div>
              )}
              {payee.fxFee && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">FX Fee</span>
                  <span className="text-sm font-medium text-foreground">${payee.fxFee}</span>
                </div>
              )}
              {payee.eta && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ETA</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(payee.eta).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Total Gross Pay</span>
              <span className="text-lg font-bold text-foreground">
                {totalGross.toLocaleString()} {payee.currency}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              {onIncludeInBatch && (
                <Button onClick={onIncludeInBatch} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Payroll Batch
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              {onSimulateFX && (
                <Button onClick={onSimulateFX} variant="outline" className="flex-1">
                  Simulate FX
                </Button>
              )}
              {onSendToCFO && (
                <Button onClick={onSendToCFO} variant="outline" className="flex-1">
                  Send to CFO for Approval
                </Button>
              )}
            </div>
            
            {onViewBatch && (
              <Button onClick={onViewBatch} variant="outline" className="w-full">
                View Batch Progress
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
