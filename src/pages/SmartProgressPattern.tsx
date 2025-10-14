import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  SmartProgress,
  useSmartProgress,
  type ProcessStep,
  type SmartProcess,
} from "@/components/SmartProgress";
import { toast } from "@/hooks/use-toast";

export default function SmartProgressPattern() {
  const { processes, addProcess, updateStep, clearCompleted } = useSmartProgress();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Sample process templates
  const sampleProcesses = {
    payroll: {
      title: "Payroll Processing",
      description: "September 2025 payroll for PH contractors",
      steps: [
        {
          id: "step-1",
          label: "Data Verified",
          description: "Employee data and hours validated",
          status: "pending" as const,
        },
        {
          id: "step-2",
          label: "Review Complete",
          description: "Payroll amounts calculated and reviewed",
          status: "pending" as const,
        },
        {
          id: "step-3",
          label: "Payment Queued",
          description: "Payments scheduled for processing",
          status: "pending" as const,
        },
        {
          id: "step-4",
          label: "Payment Sent",
          description: "Funds transferred to contractors",
          status: "pending" as const,
        },
        {
          id: "step-5",
          label: "Confirmation Received",
          description: "Payment confirmation received from bank",
          status: "pending" as const,
        },
      ],
      metadata: {
        total_amount: "$32,800",
        contractor_count: "5",
        currency: "USD",
      },
    },
    contract: {
      title: "Contract E-Signing",
      description: "Alex Hansen - Remote Engineer (Norway)",
      steps: [
        {
          id: "step-1",
          label: "Contract Drafted",
          description: "Contract prepared with policy rules",
          status: "pending" as const,
        },
        {
          id: "step-2",
          label: "Sent for Signature",
          description: "E-signature request sent to contractor",
          status: "pending" as const,
        },
        {
          id: "step-3",
          label: "Viewed by Contractor",
          description: "Contractor opened the contract",
          status: "pending" as const,
        },
        {
          id: "step-4",
          label: "Contract Signed",
          description: "Contractor completed e-signature",
          status: "pending" as const,
        },
      ],
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      metadata: {
        contract_id: "CT-2025-001",
        contractor: "Alex Hansen",
        country: "Norway",
      },
    },
    compliance: {
      title: "Compliance Verification",
      description: "KYC document verification for Maria Santos",
      steps: [
        {
          id: "step-1",
          label: "Documents Uploaded",
          description: "ID and proof of address submitted",
          status: "pending" as const,
        },
        {
          id: "step-2",
          label: "KYC Processing",
          description: "Documents sent to Onfido for verification",
          status: "pending" as const,
        },
        {
          id: "step-3",
          label: "Identity Verified",
          description: "Government ID validated successfully",
          status: "pending" as const,
        },
        {
          id: "step-4",
          label: "Compliance Approved",
          description: "All checks passed, profile activated",
          status: "pending" as const,
        },
      ],
      metadata: {
        contractor: "Maria Santos",
        country: "Philippines",
        verification_method: "Onfido",
      },
    },
    payout: {
      title: "FX Payout Execution",
      description: "Multi-currency transfer via Wise",
      steps: [
        {
          id: "step-1",
          label: "FX Rate Locked",
          description: "Exchange rate secured at ₱58.23/USD",
          status: "pending" as const,
        },
        {
          id: "step-2",
          label: "Transfer Initiated",
          description: "Payment instruction sent to Wise",
          status: "pending" as const,
        },
        {
          id: "step-3",
          label: "Bank Processing",
          description: "Funds in transit to recipient bank",
          status: "pending" as const,
        },
        {
          id: "step-4",
          label: "Payment Received",
          description: "Funds confirmed received by contractor",
          status: "pending" as const,
        },
      ],
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      metadata: {
        fx_rate: "58.23",
        amount_usd: "$32,800",
        amount_php: "₱1,905,560",
        provider: "Wise",
      },
    },
  };

  // Auto-progress simulation
  useEffect(() => {
    if (!activeDemo) return;

    const process = processes.find((p) => p.id === activeDemo);
    if (!process) return;

    const currentStepIndex = process.steps.findIndex((s) => s.status === "in-progress");
    if (currentStepIndex === -1) return;

    const timer = setTimeout(() => {
      const currentStep = process.steps[currentStepIndex];
      updateStep(process.id, currentStep.id, "complete");

      // Move to next step
      if (currentStepIndex < process.steps.length - 1) {
        const nextStep = process.steps[currentStepIndex + 1];
        updateStep(process.id, nextStep.id, "in-progress");
      } else {
        // All steps complete
        toast({
          title: "Process Complete",
          description: `${process.title} completed successfully.`,
        });
        setActiveDemo(null);
      }
    }, 3000); // 3 seconds per step

    return () => clearTimeout(timer);
  }, [activeDemo, processes, updateStep]);

  const handleStartProcess = (type: keyof typeof sampleProcesses) => {
    const template = sampleProcesses[type];
    const newProcess = addProcess(template);

    // Start first step
    updateStep(newProcess.id, template.steps[0].id, "in-progress");
    setActiveDemo(newProcess.id);

    toast({
      title: "Process Started",
      description: `${template.title} is now running.`,
    });
  };

  const handleRetry = (process: SmartProcess) => {
    const failedStep = process.steps.find((s) => s.status === "failed");
    if (failedStep) {
      updateStep(process.id, failedStep.id, "in-progress");
      setActiveDemo(process.id);
      toast({
        title: "Retrying",
        description: "Failed step is being retried.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to overview
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Smart Progress</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Pattern 26 — Multi-Step + Timed Process Tracker
            </p>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-xl font-semibold mb-3">Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">
            Smart Progress provides real-time visibility into ongoing actions — like payroll runs,
            compliance verification, or document uploads. It translates invisible backend operations
            into a smooth, human-readable progress system that maintains user confidence and reduces
            uncertainty.
          </p>
        </Card>

        {/* Demo Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Live Demo</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompleted}
              disabled={processes.length === 0}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Completed
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Start a Process</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleStartProcess("payroll")}
                disabled={!!activeDemo}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Payroll
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStartProcess("contract")}
                disabled={!!activeDemo}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Contract
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStartProcess("compliance")}
                disabled={!!activeDemo}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Compliance
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStartProcess("payout")}
                disabled={!!activeDemo}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                FX Payout
              </Button>
            </div>
            {activeDemo && (
              <p className="text-sm text-muted-foreground mt-3">
                Process running... Steps auto-advance every 3 seconds.
              </p>
            )}
          </Card>
        </div>

        {/* Progress Display */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Active Processes</h3>
          <SmartProgress onProcessRetry={handleRetry} />
        </Card>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">✨ Key Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • <strong>Live Pulse Animation</strong> — Visual feedback for in-progress steps
              </li>
              <li>
                • <strong>Step-by-Step Tracking</strong> — Sequential milestone visualization
              </li>
              <li>
                • <strong>Countdown Timers</strong> — Time-sensitive action deadlines
              </li>
              <li>
                • <strong>Mini Progress Bar</strong> — Compact overview of completion
              </li>
              <li>
                • <strong>Auto-Retry</strong> — Failed steps can be retried
              </li>
              <li>
                • <strong>Expandable Details</strong> — Full process context in drawer
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">🔗 Pattern References</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • <strong>P25</strong> — Contextual Timeline (logs each step)
              </li>
              <li>
                • <strong>P24</strong> — Confirmation Queue (approval integration)
              </li>
              <li>
                • <strong>P11</strong> — Dual Mode (chat + dashboard access)
              </li>
              <li>
                • <strong>P16</strong> — Notification Center (progress alerts)
              </li>
              <li>
                • <strong>P3</strong> — Step Card Stack (shared pattern)
              </li>
            </ul>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">📋 Use Cases Across Flows</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Contract Drafting (F2)</h4>
              <p className="text-sm text-muted-foreground">
                Track e-signing: "Drafted → Sent → Viewed → Signed" — Legal clarity
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payroll Prep (F3)</h4>
              <p className="text-sm text-muted-foreground">
                Track payroll run: "Calculated → Verified → Sent → Confirmed" — Transparency
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payout Orchestration (F4)</h4>
              <p className="text-sm text-muted-foreground">
                Monitor payouts: "FX locked → Transfer initiated → Bank received" — Trust
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Compliance Checklist (F6)</h4>
              <p className="text-sm text-muted-foreground">
                Step-by-step verification: "Docs uploaded → KYC complete → Approved"
              </p>
            </div>
          </div>
        </Card>

        {/* Microcopy Examples */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold text-lg mb-3">💬 Microcopy Examples</h3>
          <div className="space-y-3 text-sm">
            <p className="italic text-muted-foreground">
              "Payroll is running smoothly — 2 of 5 steps done."
            </p>
            <p className="italic text-muted-foreground">
              "FX confirmation will expire in 12 minutes."
            </p>
            <p className="italic text-muted-foreground">
              "All documents verified. Compliance checklist complete ✅."
            </p>
            <p className="italic text-muted-foreground">
              "Step failed: Payout confirmation not received. Retry?"
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
