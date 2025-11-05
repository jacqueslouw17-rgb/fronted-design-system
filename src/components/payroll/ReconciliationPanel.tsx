import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import type { PayrollBatch } from "@/types/payroll";

interface ReconciliationPanelProps {
  batch: PayrollBatch;
  onUploadBankFile?: () => void;
  onSyncBankAPI?: () => void;
}

export const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({
  batch,
  onUploadBankFile,
  onSyncBankAPI,
}) => {
  const receipts = batch.receipts || [];
  const reconciledCount = receipts.filter((r) => r.status === "Paid").length;
  const mismatchedCount = receipts.filter((r) => r.status === "Failed").length;
  const pendingCount = receipts.filter((r) => r.status === "InTransit" || r.status === "Initiated").length;

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Reconciliation Status</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Reconciled</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{reconciledCount}</p>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Mismatched</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{mismatchedCount}</p>
          </div>

          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Reconcile Payments</h4>
          <div className="grid grid-cols-2 gap-3">
            {onUploadBankFile && (
              <Button onClick={onUploadBankFile} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Bank File (CSV)
              </Button>
            )}
            {onSyncBankAPI && (
              <Button onClick={onSyncBankAPI} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Bank API
              </Button>
            )}
          </div>
        </div>
      </Card>

      {receipts.length > 0 && (
        <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-foreground mb-4">Payment Records</h4>
          <div className="space-y-2">
            {receipts.map((receipt) => {
              const payee = batch.payees.find((p) => p.workerId === receipt.payeeId);
              const isReconciled = receipt.status === "Paid";
              const isMismatched = receipt.status === "Failed";

              return (
                <div
                  key={receipt.payeeId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{payee?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {receipt.amount.toLocaleString()} {receipt.ccy} • Ref: {receipt.providerRef}
                    </p>
                    {receipt.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {new Date(receipt.paidAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    {isReconciled && <Badge variant="default">Reconciled</Badge>}
                    {isMismatched && <Badge variant="destructive">Mismatched</Badge>}
                    {!isReconciled && !isMismatched && <Badge variant="outline">Pending</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
