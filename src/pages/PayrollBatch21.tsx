import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { usePayrollBatch21 } from "@/hooks/usePayrollBatch21";
import { BatchSummaryTiles } from "@/components/payroll/BatchSummaryTiles";
import { PayeeTable } from "@/components/payroll/PayeeTable";
import { FXPanel } from "@/components/payroll/FXPanel";
import { ApprovalsPanel } from "@/components/payroll/ApprovalsPanel";
import { ExecutionMonitor } from "@/components/payroll/ExecutionMonitor";
import { ReconciliationPanel } from "@/components/payroll/ReconciliationPanel";
import { AuditLogViewer } from "@/components/payroll/AuditLogViewer";
import { toast } from "@/hooks/use-toast";
import { mockPayrollPayees } from "@/data/mockPayrollData";
import type { FXSnapshot } from "@/types/payroll";

// Flow 2.1 — fully detached copy of the PayrollBatch experience
const PayrollBatch21: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const batchId = searchParams.get("id");

  const {
    createBatch,
    getBatch,
    updateBatchStatus,
    updatePayeeStatus,
    setFXSnapshot,
    addApproval,
    addEvent,
    addReceipt,
    updateReceipt,
    removePayee,
  } = usePayrollBatch21();

  // Create a new demo batch automatically if none is provided
  useEffect(() => {
    // SEO - Title
    document.title = "Flow 2.1 — Admin Payroll Batch";

    if (!batchId) {
      const period = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
      const id = createBatch(period, mockPayrollPayees, "admin-001");
      // Replace URL with the new id without adding to history
      navigate(`/payroll-batch?id=${id}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, createBatch, navigate]);

  const batch = batchId ? getBatch(batchId) : null;
  const [activeTab, setActiveTab] = useState("review");

  useEffect(() => {
    if (batchId && !batch) {
      // If an invalid id is provided, create a fresh one
      const period = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
      const id = createBatch(period, mockPayrollPayees, "admin-001");
      navigate(`/payroll-batch?id=${id}`, { replace: true });
    }
  }, [batchId, batch, createBatch, navigate]);

  if (!batch) return null;

  const handleRecalculateFX = () => {
    const snapshot: FXSnapshot = {
      provider: "Mock",
      baseCcy: "USD",
      quotes: batch.payees.map((p) => ({
        ccy: p.currency,
        rate: p.proposedFxRate || Math.random() * 50 + 10,
        fee: Math.floor(Math.random() * 50) + 10,
      })),
      varianceBps: Math.floor(Math.random() * 20) - 10,
    };
    setFXSnapshot(batch.id, snapshot);
    addEvent(batch.id, {
      at: new Date().toISOString(),
      actor: "Genie",
      message: "FX rates recalculated",
      level: "info",
    });
    toast({ title: "FX rates recalculated" });
  };

  const handleLockRate = () => {
    if (!batch.fxSnapshot) return;
    const lockedSnapshot: FXSnapshot = {
      ...batch.fxSnapshot,
      lockedAt: new Date().toISOString(),
      lockTtlSec: 900, // 15 minutes
    };
    setFXSnapshot(batch.id, lockedSnapshot);
    addEvent(batch.id, {
      at: new Date().toISOString(),
      actor: "System",
      message: "FX rate locked for 15 minutes",
      level: "info",
    });
    toast({ title: "FX rate locked for 15 minutes" });
  };

  const handleSendToCFO = () => {
    updateBatchStatus(batch.id, "AwaitingApproval");
    addApproval(batch.id, {
      actorId: "admin-001",
      role: "Admin",
      action: "Requested",
      at: new Date().toISOString(),
    });
    addEvent(batch.id, {
      at: new Date().toISOString(),
      actor: "User",
      message: "Batch sent to CFO for approval",
      level: "info",
    });
    toast({ title: "Sent to CFO for approval" });
  };

  const handleApprove = (note: string) => {
    updateBatchStatus(batch.id, "Approved");
    addApproval(batch.id, {
      actorId: "cfo-001",
      role: "CFO",
      action: "Approved",
      at: new Date().toISOString(),
      note: note || undefined,
    });
    addEvent(batch.id, {
      at: new Date().toISOString(),
      actor: "User",
      message: "Batch approved by CFO",
      level: "info",
    });
    toast({ title: "Batch approved" });
  };

  const handleDecline = (note: string) => {
    updateBatchStatus(batch.id, "Draft");
    addApproval(batch.id, {
      actorId: "cfo-001",
      role: "CFO",
      action: "Declined",
      at: new Date().toISOString(),
      note: note || undefined,
    });
    addEvent(batch.id, {
      at: new Date().toISOString(),
      actor: "User",
      message: "Batch declined by CFO",
      level: "warn",
    });
    toast({ title: "Batch declined", variant: "destructive" });
  };

  const handleExecute = () => {
    if (batch.status !== "Approved") {
      toast({ title: "Batch must be approved first", variant: "destructive" });
      return;
    }

    updateBatchStatus(batch.id, "Executing");
    addEvent(batch.id, {
      at: new Date().toISOString(),
      actor: "System",
      message: "Batch execution initiated",
      level: "info",
    });

    // Simulate payment processing
    batch.payees.forEach((payee, index) => {
      setTimeout(() => {
        addReceipt(batch.id, {
          payeeId: payee.workerId,
          providerRef: `REF-${Date.now()}-${index}`,
          amount: payee.gross,
          ccy: payee.currency,
          status: "Initiated",
        });
        updatePayeeStatus(batch.id, payee.workerId, "EXECUTING");

        setTimeout(() => {
          updateReceipt(batch.id, payee.workerId, { status: "InTransit" });
        }, 2000);

        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% success rate
          updateReceipt(batch.id, payee.workerId, {
            status: success ? "Paid" : "Failed",
            paidAt: success ? new Date().toISOString() : undefined,
            failureReason: success ? undefined : "Insufficient funds or bank error",
          });
          updatePayeeStatus(batch.id, payee.workerId, success ? "PAID" : "ON_HOLD");
        }, 4000);
      }, index * 500);
    });

    setTimeout(() => {
      const allPaid = batch.payees.every((p) => {
        const receipt = batch.receipts.find((r) => r.payeeId === p.workerId);
        return receipt?.status === "Paid";
      });
      if (allPaid) {
        updateBatchStatus(batch.id, "Completed");
        addEvent(batch.id, {
          at: new Date().toISOString(),
          actor: "System",
          message: "All payments completed successfully",
          level: "info",
        });
      }
    }, batch.payees.length * 500 + 5000);

    toast({ title: "Execution started" });
    setActiveTab("execution");
  };

  const handleRetry = (payeeId: string) => {
    updateReceipt(batch.id, payeeId, { status: "Initiated" });
    updatePayeeStatus(batch.id, payeeId, "EXECUTING");
    
    setTimeout(() => {
      updateReceipt(batch.id, payeeId, { status: "InTransit" });
    }, 1000);

    setTimeout(() => {
      updateReceipt(batch.id, payeeId, {
        status: "Paid",
        paidAt: new Date().toISOString(),
        failureReason: undefined,
      });
      updatePayeeStatus(batch.id, payeeId, "PAID");
    }, 3000);

    toast({ title: "Retrying payment" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/flows")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Batch #{batch.id.split("-")[1]} • {batch.period}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {batch.payees.length} payees • Total Est. ${batch.totals.gross.toLocaleString()}
                </p>
              </div>
            </div>
            {batch.status === "Approved" && (
              <Button onClick={handleExecute}>Execute Batch</Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <BatchSummaryTiles batch={batch} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="fx">FX & Fees</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-6">
            <PayeeTable
              payees={batch.payees}
              onRemove={(id) => {
                removePayee(batch.id, id);
                toast({ title: "Payee removed from batch" });
              }}
            />
          </TabsContent>

          <TabsContent value="fx">
            <FXPanel
              snapshot={batch.fxSnapshot}
              onRecalculate={handleRecalculateFX}
              onLockRate={handleLockRate}
            />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalsPanel
              batch={batch}
              onSendToCFO={handleSendToCFO}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          </TabsContent>

          <TabsContent value="execution">
            <ExecutionMonitor batch={batch} onRetry={handleRetry} />
          </TabsContent>

          <TabsContent value="reconcile">
            <ReconciliationPanel
              batch={batch}
              onUploadBankFile={() => toast({ title: "Bank file upload (stub)" })}
              onSyncBankAPI={() => toast({ title: "Bank API sync (stub)" })}
            />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer
              batch={batch}
              onGeneratePDF={() => toast({ title: "Generate PDF (stub)" })}
              onExportCSV={() => toast({ title: "Export CSV (stub)" })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PayrollBatch21;
