/**
 * F1v4_TrackStep - Track & Reconcile with payment status
 * 
 * Layout aligned with CA3_TrackingView: stepper in header, progress hero, dense worker rows
 */

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle,
  Download, 
  FileText,
  Users,
  Briefcase,
  Clock,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { toast } from "sonner";
import { F1v4_WorkerDetailDrawer, WorkerData } from "./F1v4_WorkerDetailDrawer";
import { F1v4_PayslipPreviewModal } from "./F1v4_PayslipPreviewModal";
import { F1v4_PayrollStepper, F1v4_PayrollStep } from "./F1v4_PayrollStepper";

interface F1v4_TrackStepProps {
  company: CompanyPayrollData;
  onBack?: () => void;
  onClose?: () => void;
  hideHeader?: boolean;
  // Stepper props
  currentStep?: F1v4_PayrollStep;
  completedSteps?: F1v4_PayrollStep[];
  onStepClick?: (step: F1v4_PayrollStep) => void;
}

export type WorkerPaymentStatus = "paid" | "not-paid" | "in-transit" | "posted";

const MOCK_TRACKED_WORKERS: WorkerData[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001234" },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001235" },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001236" },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "ready", netPay: 65000, issues: 0, paymentStatus: "in-transit", providerRef: "PAY-2026-001237" },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200, issues: 0, paymentStatus: "not-paid" },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "ready", netPay: 72000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001238" },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0, paymentStatus: "posted", providerRef: "PAY-2026-001239" },
];

const paymentStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  paid: { label: "Paid", icon: CheckCircle2, color: "text-accent-green-text", bg: "bg-accent-green/10" },
  "not-paid": { label: "Not paid", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10" },
  "in-transit": { label: "In transit", icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10" },
  posted: { label: "Posted", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10" },
};

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷"
};

export const F1v4_TrackStep: React.FC<F1v4_TrackStepProps> = ({
  company,
  onBack,
  onClose,
  hideHeader = false,
  currentStep = "track",
  completedSteps = ["submissions", "exceptions", "approve"],
  onStepClick,
}) => {
  const [workers, setWorkers] = useState<WorkerData[]>(MOCK_TRACKED_WORKERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState(0);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payslipWorker, setPayslipWorker] = useState<WorkerData | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  const paidCount = workers.filter(w => w.paymentStatus === "paid" || w.paymentStatus === "posted").length;
  const notPaidCount = workers.filter(w => w.paymentStatus === "not-paid").length;
  const inTransitCount = workers.filter(w => w.paymentStatus === "in-transit").length;
  const progressPercent = workers.length > 0 ? Math.round((paidCount / workers.length) * 100) : 0;

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: attention first, then in-transit, then completed
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    const priority = (status: string | undefined) => {
      if (status === "not-paid") return 0;
      if (status === "in-transit") return 1;
      return 2;
    };
    return priority(a.paymentStatus) - priority(b.paymentStatus);
  });

  const handleMarkAsPaid = (workerId: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId ? { ...w, paymentStatus: "paid" as const, providerRef: `PAY-2026-${Date.now().toString().slice(-6)}` } : w
    ));
    toast.success("Marked as paid");
  };

  const handleRetryPayout = (workerId: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId ? { ...w, paymentStatus: "in-transit" as const } : w
    ));
    toast.success("Payout retry initiated");
  };

  const handleViewDetails = (worker: WorkerData) => {
    const idx = workers.findIndex(w => w.id === worker.id);
    setSelectedWorkerIndex(idx >= 0 ? idx : 0);
    setDrawerOpen(true);
  };

  const handlePayslipPreview = (worker: WorkerData) => {
    setPayslipWorker(worker);
    setPayslipModalOpen(true);
  };

  const handleExportCSV = () => toast.success("CSV exported");
  const handleDownloadAuditPDF = () => toast.success("Audit PDF downloaded");

  const renderWorkerRow = (worker: WorkerData) => {
    const config = paymentStatusConfig[worker.paymentStatus || "not-paid"];
    const StatusIcon = config.icon;
    const TypeIcon = worker.type === "employee" ? Users : Briefcase;
    const needsAttention = worker.paymentStatus === "not-paid";

    return (
      <div 
        key={worker.id}
        className={cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-muted/30 border border-border/20 cursor-pointer hover:bg-muted/50 transition-colors",
          needsAttention && "border-amber-500/30 bg-amber-500/5"
        )}
        onClick={() => handleViewDetails(worker)}
      >
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
            {getInitials(worker.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
            <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground">· {countryFlags[worker.country] || ""} {worker.country}</span>
          </div>
        </div>

        <p className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
          {formatCurrency(worker.netPay, worker.currency)}
        </p>

        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0",
          config.bg,
          config.color
        )}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <>
      {/* Progress Hero */}
      <div className="px-6 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <span className="px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green-text text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Approved
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
              <span className="text-lg text-muted-foreground">of {workers.length}</span>
              <span className="text-sm text-muted-foreground">payments reconciled</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mark payments as paid or retry failed payouts</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadAuditPDF} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Audit
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-1" />
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-accent-green" />
              <span className="text-muted-foreground">{paidCount} paid</span>
            </div>
            {inTransitCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">{inTransitCount} in transit</span>
              </div>
            )}
            {notPaidCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">{notPaidCount} not paid</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Worker List */}
      <CardContent className="p-4">
        <div className="max-h-[380px] overflow-y-auto space-y-1">
          {sortedWorkers.map(renderWorkerRow)}
        </div>
      </CardContent>
    </>
  );

  // When hideHeader is true, render content without card wrappers
  if (hideHeader) {
    return (
      <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
        {renderContent()}
        
        <F1v4_WorkerDetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          worker={workers[selectedWorkerIndex] || null}
          workers={workers}
          currentIndex={selectedWorkerIndex}
          onNavigate={setSelectedWorkerIndex}
          onPayslipPreview={handlePayslipPreview}
          isTrackStep={true}
          onMarkAsPaid={handleMarkAsPaid}
          onRetryPayout={handleRetryPayout}
        />

        <F1v4_PayslipPreviewModal
          open={payslipModalOpen}
          onOpenChange={setPayslipModalOpen}
          worker={payslipWorker}
        />
      </div>
    );
  }

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <F1v4_PayrollStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={onStepClick}
            />
          </div>
          <div className="flex items-center gap-3">
            {onClose && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onClose}
                className="h-9 text-xs"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {renderContent()}

      <F1v4_WorkerDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        worker={workers[selectedWorkerIndex] || null}
        workers={workers}
        currentIndex={selectedWorkerIndex}
        onNavigate={setSelectedWorkerIndex}
        onPayslipPreview={handlePayslipPreview}
        isTrackStep={true}
        onMarkAsPaid={handleMarkAsPaid}
        onRetryPayout={handleRetryPayout}
      />

      <F1v4_PayslipPreviewModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        worker={payslipWorker}
      />
    </Card>
  );
};

export default F1v4_TrackStep;
