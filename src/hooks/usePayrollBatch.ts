import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PayrollBatch, PayrollPayee, FXSnapshot, ApprovalEvent, BatchEvent, PaymentReceipt, Adjustment } from "@/types/payroll";

interface PayrollBatchState {
  batches: PayrollBatch[];
  currentBatchId: string | null;
  
  createBatch: (period: string, payees: PayrollPayee[], createdBy: string) => string;
  getBatch: (id: string) => PayrollBatch | undefined;
  updateBatchStatus: (id: string, status: PayrollBatch["status"]) => void;
  updatePayeeStatus: (batchId: string, payeeId: string, status: PayrollPayee["status"]) => void;
  addAdjustment: (batchId: string, payeeId: string, adjustment: Adjustment) => void;
  removeAdjustment: (batchId: string, payeeId: string, adjustmentIndex: number) => void;
  setFXSnapshot: (batchId: string, snapshot: FXSnapshot) => void;
  addApproval: (batchId: string, approval: ApprovalEvent) => void;
  addEvent: (batchId: string, event: BatchEvent) => void;
  addReceipt: (batchId: string, receipt: PaymentReceipt) => void;
  updateReceipt: (batchId: string, payeeId: string, updates: Partial<PaymentReceipt>) => void;
  togglePayeeInclusion: (batchId: string, payeeId: string) => void;
  removePayee: (batchId: string, payeeId: string) => void;
  recalculateTotals: (batchId: string) => void;
  setCurrentBatch: (id: string | null) => void;
}

export const usePayrollBatch = create<PayrollBatchState>()(
  persist(
    (set, get) => ({
      batches: [],
      currentBatchId: null,

      createBatch: (period, payees, createdBy) => {
        const id = `batch-${Date.now()}`;
        const totals = {
          gross: payees.reduce((sum, p) => sum + p.gross, 0),
          employerCosts: payees.reduce((sum, p) => sum + p.employerCosts, 0),
          fxFees: payees.reduce((sum, p) => sum + (p.fxFee || 0), 0),
          currency: "USD",
        };

        const newBatch: PayrollBatch = {
          id,
          period,
          status: "Draft",
          payees,
          totals,
          approvals: [],
          events: [{
            at: new Date().toISOString(),
            actor: "User",
            message: `Batch created for ${period}`,
            level: "info",
          }],
          receipts: [],
          createdBy,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          batches: [...state.batches, newBatch],
          currentBatchId: id,
        }));

        return id;
      },

      getBatch: (id) => {
        return get().batches.find((b) => b.id === id);
      },

      updateBatchStatus: (id, status) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id ? { ...b, status } : b
          ),
        }));
      },

      updatePayeeStatus: (batchId, payeeId, status) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  payees: b.payees.map((p) =>
                    p.workerId === payeeId ? { ...p, status } : p
                  ),
                }
              : b
          ),
        }));
      },

      addAdjustment: (batchId, payeeId, adjustment) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  payees: b.payees.map((p) =>
                    p.workerId === payeeId
                      ? { ...p, adjustments: [...p.adjustments, adjustment] }
                      : p
                  ),
                }
              : b
          ),
        }));
        get().recalculateTotals(batchId);
      },

      removeAdjustment: (batchId, payeeId, adjustmentIndex) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  payees: b.payees.map((p) =>
                    p.workerId === payeeId
                      ? {
                          ...p,
                          adjustments: p.adjustments.filter((_, i) => i !== adjustmentIndex),
                        }
                      : p
                  ),
                }
              : b
          ),
        }));
        get().recalculateTotals(batchId);
      },

      setFXSnapshot: (batchId, snapshot) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, fxSnapshot: snapshot } : b
          ),
        }));
      },

      addApproval: (batchId, approval) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? { ...b, approvals: [...b.approvals, approval] }
              : b
          ),
        }));
      },

      addEvent: (batchId, event) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, events: [...b.events, event] } : b
          ),
        }));
      },

      addReceipt: (batchId, receipt) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, receipts: [...b.receipts, receipt] } : b
          ),
        }));
      },

      updateReceipt: (batchId, payeeId, updates) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  receipts: b.receipts.map((r) =>
                    r.payeeId === payeeId ? { ...r, ...updates } : r
                  ),
                }
              : b
          ),
        }));
      },

      togglePayeeInclusion: (batchId, payeeId) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  payees: b.payees.map((p) =>
                    p.workerId === payeeId
                      ? { ...p, status: p.status === "PAYROLL_PENDING" ? "IN_BATCH" : "PAYROLL_PENDING" }
                      : p
                  ),
                }
              : b
          ),
        }));
      },

      removePayee: (batchId, payeeId) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  payees: b.payees.filter((p) => p.workerId !== payeeId),
                }
              : b
          ),
        }));
        get().recalculateTotals(batchId);
      },

      recalculateTotals: (batchId) => {
        set((state) => ({
          batches: state.batches.map((b) => {
            if (b.id !== batchId) return b;

            const totals = {
              gross: b.payees.reduce((sum, p) => {
                const adjustmentsTotal = p.adjustments.reduce((s, a) => s + a.amount, 0);
                return sum + p.gross + adjustmentsTotal;
              }, 0),
              employerCosts: b.payees.reduce((sum, p) => sum + p.employerCosts, 0),
              fxFees: b.payees.reduce((sum, p) => sum + (p.fxFee || 0), 0),
              currency: b.totals.currency,
            };

            return { ...b, totals };
          }),
        }));
      },

      setCurrentBatch: (id) => {
        set({ currentBatchId: id });
      },
    }),
    {
      name: "payroll-batch-storage",
      partialize: (state) => ({
        batches: state.batches,
        currentBatchId: state.currentBatchId,
      }),
    }
  )
);
