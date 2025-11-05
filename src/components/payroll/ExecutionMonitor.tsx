import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import type { PayrollBatch, PaymentReceipt } from "@/types/payroll";

interface ExecutionMonitorProps {
  batch: PayrollBatch;
  onRetry?: (payeeId: string) => void;
  onBulkRetry?: () => void;
}

const getStatusIcon = (status: PaymentReceipt["status"]) => {
  switch (status) {
    case "Paid":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "Failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "InTransit":
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    case "Initiated":
      return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

const getStatusBadge = (status: PaymentReceipt["status"]) => {
  const variants: Record<PaymentReceipt["status"], { variant: any; label: string }> = {
    Initiated: { variant: "outline", label: "Initiated" },
    InTransit: { variant: "default", label: "In Transit" },
    Paid: { variant: "default", label: "Paid" },
    Failed: { variant: "destructive", label: "Failed" },
  };
  return variants[status];
};

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  batch,
  onRetry,
  onBulkRetry,
}) => {
  const receipts = batch.receipts || [];
  const totalPayees = batch.payees.length;
  const completedPayments = receipts.filter((r) => r.status === "Paid").length;
  const failedPayments = receipts.filter((r) => r.status === "Failed").length;
  const inTransit = receipts.filter((r) => r.status === "InTransit").length;
  const initiated = receipts.filter((r) => r.status === "Initiated").length;

  const progress = totalPayees > 0 ? (completedPayments / totalPayees) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Execution Status</h3>
          {failedPayments > 0 && onBulkRetry && (
            <Button onClick={onBulkRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Bulk Retry ({failedPayments})
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-foreground">
                {completedPayments} / {totalPayees} Paid
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground mb-1">Initiated</p>
              <p className="text-2xl font-bold text-yellow-600">{initiated}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">{inTransit}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">{completedPayments}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-muted-foreground mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
            </div>
          </div>
        </div>
      </Card>

      {receipts.length > 0 && (
        <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-foreground mb-4">Payment Details</h4>
          <div className="space-y-2">
            {receipts.map((receipt) => {
              const payee = batch.payees.find((p) => p.workerId === receipt.payeeId);
              const statusInfo = getStatusBadge(receipt.status);

              return (
                <div
                  key={receipt.payeeId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(receipt.status)}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{payee?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {receipt.amount.toLocaleString()} {receipt.ccy} • Ref: {receipt.providerRef}
                      </p>
                      {receipt.failureReason && (
                        <p className="text-xs text-red-600 mt-1">{receipt.failureReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    {receipt.status === "Failed" && onRetry && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRetry(receipt.payeeId)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {batch.status === "Executing" && receipts.length === 0 && (
        <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 animate-pulse" />
          <p className="text-muted-foreground">Initiating payments...</p>
        </Card>
      )}
    </div>
  );
};
