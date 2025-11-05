import { NavigateFunction } from "react-router-dom";
import { usePayrollBatch } from "@/hooks/usePayrollBatch";
import { mockPayrollPayees } from "@/data/mockPayrollData";
import { toast } from "@/hooks/use-toast";

export const executePayrollGenieAction = (
  action: string,
  navigate: NavigateFunction
): string => {
  const { createBatch, batches, updateBatchStatus, setFXSnapshot, addApproval, addEvent } = usePayrollBatch.getState();

  switch (action) {
    case "create_payroll_batch": {
      const period = new Date().toISOString().slice(0, 7);
      const batchId = createBatch(period, mockPayrollPayees, "admin-001");
      
      setTimeout(() => {
        navigate(`/payroll/batch?id=${batchId}`);
      }, 500);
      
      return `✅ Created payroll batch for ${period} with ${mockPayrollPayees.length} payees.\n\nNavigating to batch details...`;
    }

    case "simulate_fx": {
      const latestBatch = batches[batches.length - 1];
      if (latestBatch) {
        const snapshot = {
          provider: "Mock" as const,
          baseCcy: "USD",
          quotes: latestBatch.payees.map((p) => ({
            ccy: p.currency,
            rate: p.proposedFxRate || Math.random() * 50 + 10,
            fee: Math.floor(Math.random() * 50) + 10,
          })),
          varianceBps: Math.floor(Math.random() * 20) - 10,
        };
        setFXSnapshot(latestBatch.id, snapshot);
        return "🔄 FX rates simulated successfully!\n\nMid-market quotes calculated. Navigate to the FX & Fees tab to review and lock rates.";
      }
      return "⚠️ No active batch found. Create a batch first.";
    }

    case "send_for_approval": {
      const latestBatch = batches[batches.length - 1];
      if (latestBatch) {
        updateBatchStatus(latestBatch.id, "AwaitingApproval");
        addApproval(latestBatch.id, {
          actorId: "admin-001",
          role: "Admin",
          action: "Requested",
          at: new Date().toISOString(),
        });
        addEvent(latestBatch.id, {
          at: new Date().toISOString(),
          actor: "User",
          message: "Batch sent to CFO for approval",
          level: "info",
        });
        return "📨 Batch sent to CFO for approval!\n\nThe CFO will be notified and can approve or decline from their dashboard.";
      }
      return "⚠️ No active batch found. Create a batch first.";
    }

    case "execute_batch": {
      const latestBatch = batches[batches.length - 1];
      if (latestBatch && latestBatch.status === "Approved") {
        updateBatchStatus(latestBatch.id, "Executing");
        setTimeout(() => {
          navigate(`/payroll/batch?id=${latestBatch.id}`);
        }, 500);
        return "⚡ Executing batch...\n\nPayments are being initiated. Navigating to monitor progress in the Execution tab.";
      }
      return "⚠️ Batch must be approved before execution.";
    }

    case "reconcile": {
      const latestBatch = batches[batches.length - 1];
      if (latestBatch && (latestBatch.status === "Completed" || latestBatch.status === "Executing")) {
        addEvent(latestBatch.id, {
          at: new Date().toISOString(),
          actor: "User",
          message: "Batch marked as reconciled",
          level: "info",
        });
        return "✅ Batch reconciliation complete!\n\nAll payments have been matched and verified.";
      }
      return "⚠️ No completed batch found for reconciliation.";
    }

    default:
      return "I can help you manage payroll batches, FX rates, approvals, and execution. Try:\n• /genie create payroll batch\n• /genie lock FX\n• /genie send approval\n• /genie execute payroll\n• /genie reconcile";
  }
};
