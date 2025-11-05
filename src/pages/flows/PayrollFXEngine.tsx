import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle2, AlertCircle, TrendingUp, Clock, FileCheck } from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { usePayrollSync } from "@/hooks/usePayrollSync";
import { useCostCalculator } from "@/hooks/useCostCalculator";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useNavigate } from "react-router-dom";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { PayrollFXTable } from "@/components/payroll/PayrollFXTable";
import { FXLockWidget } from "@/components/payroll/FXLockWidget";
import { LiveTrackingPanel } from "@/components/payroll/LiveTrackingPanel";
import { ApprovalWorkflow } from "@/components/payroll/ApprovalWorkflow";
import { FloatingKurtButton } from "@/components/FloatingKurtButton";

type FlowPhase = "intent" | "draft" | "fx-review" | "approval" | "execution" | "reconciliation";

interface PayrollBatchItem {
  id: string;
  contractor: string;
  country: string;
  currency: string;
  grossPay: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "draft" | "processing" | "complete";
  progress: number;
}

const PayrollFXEngine = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<FlowPhase>("intent");
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const [fxRates, setFxRates] = useState<Record<string, number>>({});
  const [fxLocked, setFxLocked] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const { addAuditEntry } = useAuditTrail();

  // Mock payroll data
  const [payrollBatch, setPayrollBatch] = useState<PayrollBatchItem[]>([
    { 
      id: "1", 
      contractor: "Anna Larsen", 
      country: "🇳🇴 NO", 
      currency: "NOK", 
      grossPay: 85000, 
      bonus: 5000, 
      deductions: 2000, 
      netPay: 88000,
      status: "draft",
      progress: 0
    },
    { 
      id: "2", 
      contractor: "Maria Santos", 
      country: "🇵🇭 PH", 
      currency: "PHP", 
      grossPay: 150000, 
      bonus: 5000, 
      deductions: 2000, 
      netPay: 153000,
      status: "draft",
      progress: 0
    },
  ]);

  useEffect(() => {
    // Simulate FX rate fetch
    const rates = {
      NOK: 11.45,
      PHP: 57.10,
    };
    setFxRates(rates);
  }, []);

  const handleIntentStart = () => {
    toast.info("Kurt is analyzing contractors...");
    
    setTimeout(() => {
      setPhase("draft");
      toast.success("Found 14 active contractors — total est. cost $82,400");
    }, 1500);
  };

  const handleReviewFX = () => {
    setPhase("fx-review");
    addAuditEntry({
      user: "Admin",
      action: "Reviewed FX Rates",
      before: null,
      after: fxRates,
    });
  };

  const handleLockFX = () => {
    setFxLocked(true);
    const snapshotId = `FXSnapshot#${new Date().toISOString().split('T')[0]}-Rate${fxRates.PHP?.toString().replace('.', '')}`;
    
    addAuditEntry({
      user: "System",
      action: "FX Rate Locked",
      before: null,
      after: { snapshotId, rates: fxRates },
    });

    toast.success("FX rates locked for 15 minutes", {
      description: snapshotId,
    });
  };

  const handleSendForApproval = () => {
    setPhase("approval");
    addAuditEntry({
      user: "Ioana (Admin)",
      action: "Sent for CFO Approval",
      before: null,
      after: { batchId: "2025-11-10", totalAmount: 82400 },
    });

    toast.info("Approval request sent to Howard (CFO)");
  };

  const handleApprove = () => {
    setApprovalStatus("approved");
    setPhase("execution");
    
    addAuditEntry({
      user: "Howard (CFO)",
      action: "Approved Payroll Batch",
      before: { status: "pending" },
      after: { status: "approved" },
    });

    // Simulate execution progress
    payrollBatch.forEach((item, idx) => {
      setTimeout(() => {
        setPayrollBatch(prev => prev.map(p => 
          p.id === item.id ? { ...p, status: "processing" as const, progress: 50 } : p
        ));
      }, 1000 * (idx + 1));

      setTimeout(() => {
        setPayrollBatch(prev => prev.map(p => 
          p.id === item.id ? { ...p, status: "complete" as const, progress: 100 } : p
        ));
      }, 2000 * (idx + 1));
    });

    setTimeout(() => {
      setPhase("reconciliation");
      toast.success("✅ All 14 contractors paid successfully", {
        description: "Avg FX variance +0.11%. SLA 100%.",
      });
    }, 5000);
  };

  const suggestionChips = [
    {
      label: "Review FX",
      action: handleReviewFX,
    },
    {
      label: "Lock Rates",
      action: handleLockFX,
      disabled: !fxLocked && phase === "fx-review",
    },
    {
      label: "Send for Approval",
      action: handleSendForApproval,
    },
  ];

  return (
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName="Admin" />

          <div className="flex-1">
            <AgentLayout context="Payroll & FX Execution Engine">
              <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/5 text-foreground relative overflow-hidden min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)]">
                {/* Background gradients */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]" />
                  <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                       style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                  <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                       style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
                </div>

                <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-20 sm:pb-32 space-y-6 sm:space-y-8 relative z-10">
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard-admin')}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>

                  {/* Agent Header */}
                  <AgentHeader
                    title="Payroll & FX Execution"
                    subtitle={
                      phase === "intent" ? "Let's process your monthly payroll cycle" :
                      phase === "draft" ? "Payroll draft ready for review" :
                      phase === "fx-review" ? "Review and lock FX rates" :
                      phase === "approval" ? "Awaiting CFO approval" :
                      phase === "execution" ? "Executing payroll transfers" :
                      "Payroll completed and reconciled"
                    }
                    showPulse={true}
                    isActive={phase === "execution"}
                    isMuted={isKurtMuted}
                    onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                    tags={<AgentSuggestionChips chips={suggestionChips} />}
                  />

                  {/* Phase: Intent Recognition */}
                  {phase === "intent" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Ready to Process Payroll?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Kurt will fetch all active and approved contractors, detect currencies, and prepare the payroll draft.
                          </p>
                          <div className="flex gap-3">
                            <Button onClick={handleIntentStart} className="flex-1">
                              Yes, Prepare Payroll
                            </Button>
                            <Button variant="outline" className="flex-1">
                              View Details First
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Phase: Draft & FX Review & Approval & Execution & Reconciliation */}
                  {phase !== "intent" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* Main Content - 2 columns */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Payroll Table */}
                        <PayrollFXTable 
                          data={payrollBatch}
                          fxRates={fxRates}
                          phase={phase}
                        />

                        {/* Live Tracking Panel */}
                        {(phase === "execution" || phase === "reconciliation") && (
                          <LiveTrackingPanel 
                            data={payrollBatch}
                            fxVariance={0.11}
                            slaScore={100}
                          />
                        )}

                        {/* Actions */}
                        {phase === "draft" && (
                          <div className="flex gap-3">
                            <Button onClick={handleReviewFX} className="flex-1">
                              Review FX Conversions
                            </Button>
                            <Button onClick={handleSendForApproval} variant="outline" className="flex-1">
                              Send for Approval
                            </Button>
                          </div>
                        )}

                        {phase === "fx-review" && (
                          <div className="flex gap-3">
                            <Button onClick={handleSendForApproval} className="flex-1">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Send for CFO Approval
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Sidebar - 1 column */}
                      <div className="space-y-6">
                        {/* FX Lock Widget */}
                        {(phase === "fx-review" || phase === "approval" || phase === "execution") && (
                          <FXLockWidget 
                            rates={fxRates}
                            locked={fxLocked}
                            onLock={handleLockFX}
                          />
                        )}

                        {/* Approval Workflow */}
                        {(phase === "approval" || phase === "execution" || phase === "reconciliation") && (
                          <ApprovalWorkflow 
                            status={approvalStatus}
                            onApprove={handleApprove}
                            onReject={() => setApprovalStatus("rejected")}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reconciliation Summary */}
                  {phase === "reconciliation" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-2 border-green-500/20 bg-green-500/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Payroll Completed Successfully
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold">14</div>
                              <div className="text-xs text-muted-foreground">Contractors Paid</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">+0.11%</div>
                              <div className="text-xs text-muted-foreground">Avg FX Variance</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">100%</div>
                              <div className="text-xs text-muted-foreground">SLA Score</div>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1">
                              <FileCheck className="h-4 w-4 mr-2" />
                              Export CSV
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Create Audit PDF
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Sync with Xero
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </main>
            </AgentLayout>
          </div>

          {/* Floating Kurt Button for mobile */}
          <FloatingKurtButton />
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default PayrollFXEngine;
