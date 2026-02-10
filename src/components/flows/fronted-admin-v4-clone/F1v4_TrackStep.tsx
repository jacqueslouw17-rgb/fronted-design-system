/**
 * F1v4_TrackStep - Track & Reconcile with payment status
 * 
 * Simplified: Only two statuses - "in-progress" and "paid"
 * Fronted admin manually marks each worker as paid
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  CheckCircle2, 
  Download, 
  FileText,
  Users,
  Briefcase,
  Clock,
  ChevronLeft,
  ChevronDown,
  DollarSign,
  Receipt,
  Building2,
  TrendingUp,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { toast } from "sonner";
import { F1v4_WorkerDetailDrawer, WorkerData } from "./F1v4_WorkerDetailDrawer";
import { F1v4_PayslipPreviewModal } from "./F1v4_PayslipPreviewModal";
import { F1v4_PayrollStepper, F1v4_PayrollStep } from "./F1v4_PayrollStepper";

interface PayrollPeriod {
  id: string;
  label: string;
  status: "current" | "processing" | "paid";
}

// Historical payroll data
interface HistoricalPayroll {
  id: string;
  period: string;
  paidDate: string;
  grossPay: string;
  adjustments: string;
  fees: string;
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount: number;
  workers: WorkerData[];
}

const HISTORICAL_PAYROLLS: HistoricalPayroll[] = [
  {
    id: "dec-2025",
    period: "December 2025",
    paidDate: "Dec 28, 2025",
    grossPay: "$118.4K",
    adjustments: "$6.8K",
    fees: "$3,512",
    totalCost: "$121.9K",
    employeeCount: 3,
    contractorCount: 4,
    currencyCount: 3,
    workers: [
      { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-112234" },
      { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-112235" },
      { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-112236" },
      { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "ready", netPay: 65000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-112237" },
      { id: "5", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "ready", netPay: 72000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-112238" },
      { id: "6", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-112239" },
    ],
  },
  {
    id: "nov-2025",
    period: "November 2025",
    paidDate: "Nov 28, 2025",
    grossPay: "$115.2K",
    adjustments: "$5.4K",
    fees: "$3,380",
    totalCost: "$118.6K",
    employeeCount: 3,
    contractorCount: 3,
    currencyCount: 3,
    workers: [
      { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-111234" },
      { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-111235" },
      { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-111236" },
      { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "ready", netPay: 65000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-111237" },
      { id: "5", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "ready", netPay: 72000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-111238" },
      { id: "6", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0, paymentStatus: "paid", providerRef: "PAY-2025-111239" },
    ],
  },
];

interface F1v4_TrackStepProps {
  company: CompanyPayrollData;
  onBack?: () => void;
  onClose?: () => void;
  hideHeader?: boolean;
  isHistorical?: boolean;
  paidDate?: string;
  showStepper?: boolean;
  currentStep?: F1v4_PayrollStep;
  completedSteps?: F1v4_PayrollStep[];
  onStepClick?: (step: F1v4_PayrollStep) => void;
}

export type WorkerPaymentStatus = "paid" | "in-progress";

const MOCK_TRACKED_WORKERS: WorkerData[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0, paymentStatus: "in-progress" },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0, paymentStatus: "in-progress" },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000, issues: 0, paymentStatus: "in-progress" },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "ready", netPay: 65000, issues: 0, paymentStatus: "in-progress" },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200, issues: 0, paymentStatus: "in-progress" },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "ready", netPay: 72000, issues: 0, paymentStatus: "in-progress" },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0, paymentStatus: "in-progress" },
];

const paymentStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  paid: { label: "Paid", icon: CheckCircle2, color: "text-accent-green-text", bg: "bg-accent-green/10" },
  "in-progress": { label: "In progress", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
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
  isHistorical: isHistoricalProp = false,
  paidDate: paidDateProp,
  showStepper = false,
  currentStep = "track",
  completedSteps = ["submissions", "exceptions", "approve"],
  onStepClick,
}) => {
  const [currentWorkers, setCurrentWorkers] = useState<WorkerData[]>(MOCK_TRACKED_WORKERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState(0);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payslipWorker, setPayslipWorker] = useState<WorkerData | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("current");
  const [allPaidDialogOpen, setAllPaidDialogOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  const periods: PayrollPeriod[] = [
    { id: "current", label: "January 2026", status: "processing" },
    { id: "dec-2025", label: "December 2025", status: "paid" },
    { id: "nov-2025", label: "November 2025", status: "paid" },
  ];

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
  const isViewingHistorical = selectedPeriodId !== "current";
  const selectedHistoricalPayroll = isViewingHistorical 
    ? HISTORICAL_PAYROLLS.find(p => p.id === selectedPeriodId) 
    : null;
  
  const workers = isViewingHistorical && selectedHistoricalPayroll 
    ? selectedHistoricalPayroll.workers 
    : currentWorkers;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  const paidCount = workers.filter(w => w.paymentStatus === "paid").length;
  const inProgressCount = workers.filter(w => w.paymentStatus === "in-progress").length;
  const progressPercent = workers.length > 0 ? Math.round((paidCount / workers.length) * 100) : 0;
  const allPaid = paidCount === workers.length && workers.length > 0;

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: in-progress first, then paid
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    const priority = (status: string | undefined) => {
      if (status === "in-progress") return 0;
      return 1;
    };
    return priority(a.paymentStatus) - priority(b.paymentStatus);
  });

  const handleMarkAsPaid = (workerId: string) => {
    setCurrentWorkers(prev => prev.map(w => 
      w.id === workerId ? { ...w, paymentStatus: "paid" as const, providerRef: `PAY-2026-${Date.now().toString().slice(-6)}` } : w
    ));
    toast.success("Marked as paid");
  };

  const handleMarkAllPaid = () => {
    setCurrentWorkers(prev => prev.map(w => 
      w.paymentStatus !== "paid" 
        ? { ...w, paymentStatus: "paid" as const, providerRef: `PAY-2026-${Date.now().toString().slice(-6)}` } 
        : w
    ));
    setAllPaidDialogOpen(false);
    toast.success("All workers marked as paid");
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
    const config = paymentStatusConfig[worker.paymentStatus || "in-progress"];
    const StatusIcon = config.icon;
    const TypeIcon = worker.type === "employee" ? Users : Briefcase;

    return (
      <div 
        key={worker.id}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-muted/30 border border-border/20 cursor-pointer hover:bg-muted/50 transition-colors"
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

  const isHistorical = isViewingHistorical;
  const paidDate = selectedHistoricalPayroll?.paidDate;
  
  const displayMetrics = isViewingHistorical && selectedHistoricalPayroll 
    ? {
        grossPay: selectedHistoricalPayroll.grossPay,
        adjustments: selectedHistoricalPayroll.adjustments,
        fees: selectedHistoricalPayroll.fees,
        totalCost: selectedHistoricalPayroll.totalCost,
        employeeCount: selectedHistoricalPayroll.employeeCount,
        contractorCount: selectedHistoricalPayroll.contractorCount,
        currencyCount: selectedHistoricalPayroll.currencyCount,
      }
    : {
        grossPay: "$124.9K",
        adjustments: "$8.2K",
        fees: "$3,742",
        totalCost: "$128.6K",
        employeeCount: employees.length,
        contractorCount: contractors.length,
        currencyCount: 3,
      };

  const renderPeriodDropdown = () => (
    <div className="relative" ref={periodDropdownRef}>
      <button
        onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
        className={cn(
          "flex items-center gap-1.5 text-lg font-semibold text-foreground",
          "hover:text-foreground/80 transition-colors",
          "focus:outline-none"
        )}
      >
        {selectedPeriod?.label} Payroll
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isPeriodDropdownOpen && "rotate-180"
        )} />
      </button>

      {isPeriodDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[200px] bg-card border border-border/40 rounded-lg shadow-lg py-1 backdrop-blur-sm">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => {
                setSelectedPeriodId(period.id);
                setIsPeriodDropdownOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left text-sm",
                "hover:bg-muted/50 transition-colors",
                period.id === selectedPeriodId && "bg-muted/30"
              )}
            >
              <span className={cn(
                "font-medium",
                period.id === selectedPeriodId ? "text-foreground" : "text-muted-foreground"
              )}>
                {period.label}
              </span>
              {period.status === "paid" && (
                <span className="flex items-center gap-1 text-[11px] text-accent-green-text">
                  <CheckCircle2 className="h-3 w-3" />
                  Paid
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderSummaryCard = () => (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardContent className="py-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {renderPeriodDropdown()}
            {isHistorical || allPaid ? (
              <Badge variant="outline" className="bg-accent-green/10 text-accent-green-text border-accent-green/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Paid
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Clock className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm">Gross Pay</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{displayMetrics.grossPay}</p>
            <p className="text-xs text-muted-foreground mt-1">Salaries + Contractor fees</p>
          </div>

          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="text-sm">Adjustments</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{displayMetrics.adjustments}</p>
            <p className="text-xs text-muted-foreground mt-1">Bonuses, overtime & expenses</p>
          </div>

          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Fronted Fees</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{displayMetrics.fees}</p>
            <p className="text-xs text-muted-foreground mt-1">Transaction + Service</p>
          </div>

          <div className="bg-primary/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm">Total Cost</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{displayMetrics.totalCost}</p>
            <p className="text-xs text-muted-foreground mt-1">Pay + All Fees</p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-3 border-t border-border/30">
          <span>Employees: <strong className="text-foreground">{displayMetrics.employeeCount}</strong></span>
          <span className="text-border">·</span>
          <span>Contractors: <strong className="text-foreground">{displayMetrics.contractorCount}</strong></span>
          <span className="text-border">·</span>
          <span>Currencies: <strong className="text-foreground">{displayMetrics.currencyCount}</strong></span>
        </div>
      </CardContent>
    </Card>
  );

  const renderTrackingTable = () => (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Progress Hero */}
      <div className="px-6 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-start justify-between mb-4">
          <div>
            {isHistorical ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <span className="px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green-text text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Paid
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
                  <span className="text-lg text-muted-foreground">of {workers.length}</span>
                  <span className="text-sm text-muted-foreground">payments paid</span>
                </div>
                {paidDate && (
                  <p className="text-xs text-muted-foreground mt-1">Paid on {paidDate}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
                  <span className="text-lg text-muted-foreground">of {workers.length}</span>
                  <span className="text-sm text-muted-foreground">payments reconciled</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Click a worker to view breakdown and mark as paid</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {!isHistorical && inProgressCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setAllPaidDialogOpen(true)}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                All Paid
              </Button>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{employees.length}</span>
              <span>employees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{contractors.length}</span>
              <span>contractors</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {!isHistorical && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-1" />
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent-green" />
                <span className="text-muted-foreground">{paidCount} paid</span>
              </div>
              {inProgressCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">{inProgressCount} in progress</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Worker List */}
      <CardContent className="p-4">
        <div className="max-h-[320px] overflow-y-auto space-y-1">
          {sortedWorkers.map(renderWorkerRow)}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {renderSummaryCard()}
      {renderTrackingTable()}
    </div>
  );

  if (hideHeader) {
    return (
      <>
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
        />

        <F1v4_PayslipPreviewModal
          open={payslipModalOpen}
          onOpenChange={setPayslipModalOpen}
          worker={payslipWorker}
        />
      </>
    );
  }

  return (
    <>
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
      />

      <F1v4_PayslipPreviewModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        worker={payslipWorker}
      />
    </>
  );
};

export default F1v4_TrackStep;
