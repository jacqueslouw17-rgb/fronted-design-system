import { NavigateFunction } from "react-router-dom";
import { usePayrollBatch } from "@/hooks/usePayrollBatch";
import { mockPayrollPayees } from "@/data/mockPayrollData";
import { toast } from "@/hooks/use-toast";

export const executePayrollGenieAction = (
  action: string,
  navigate: NavigateFunction
): string => {
  const { createBatch } = usePayrollBatch.getState();

  switch (action) {
    case "create_payroll_batch": {
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const batchId = createBatch(period, mockPayrollPayees, "admin-001");
      
      setTimeout(() => {
        navigate(`/payroll/batch?id=${batchId}`);
      }, 500);
      
      return `✅ Created October payroll batch with ${mockPayrollPayees.length} payees.\n\nNavigating to batch details...`;
    }

    case "simulate_fx":
      return "🔄 Simulating FX rates...\n\nI'll calculate mid-market quotes and propose lock windows. Navigate to the FX & Fees tab to review.";

    case "send_for_approval":
      return "📨 Sending batch to CFO for approval...\n\nThe CFO will be notified and can approve or decline from their dashboard.";

    case "execute_batch":
      return "⚡ Executing batch...\n\nPayments are being initiated. You can monitor progress in the Execution tab.";

    default:
      return "I can help you manage payroll batches, FX rates, approvals, and execution. What would you like to do?";
  }
};
