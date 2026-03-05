/**
 * F1v4_DoneWorkerDetailDrawer - Right-side panel for Done workers
 * 
 * Shows a clean, scannable summary of collected onboarding data
 * organized into logical sections. Includes lifecycle actions
 * (terminate, resign, end contract).
 */

import React, { useState } from "react";
import { AgreementViewerSheet } from "./F1v6_AgreementViewerSheet";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  User,
  Briefcase,
  Wallet,
  Building2,
  Shield,
  History,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Clock,
  Award,
  UserX,
  LogOut,
  CalendarOff,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export type WorkerLifecycleStatus = "active" | "contract-ended" | "resigned" | "terminated";

export interface DoneWorkerData {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  employmentType: "contractor" | "employee";
  // Lifecycle
  workerStatus?: WorkerLifecycleStatus;
  endDate?: string;
  endReason?: string;
  // Personal details
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  // Employment & contract
  startDate?: string;
  contractStatus?: "drafted" | "signed" | "completed";
  workLocation?: string;
  // Payroll details
  payFrequency?: "monthly" | "fortnightly";
  paymentSchedule?: string;
  firstPayrollNote?: string;
  // Bank details
  bankCountry?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  swiftBic?: string;
  // Compliance (country-specific)
  tin?: string;
  philHealthNumber?: string;
  nationalId?: string;
  idDocumentStatus?: "uploaded" | "verified" | "missing";
  optionalUploads?: { name: string; status: "uploaded" | "verified" | "missing" }[];
  // Audit
  detailsSubmittedOn?: string;
  verifiedBy?: string;
  lastUpdated?: string;
  completedOn?: string;
  // Missing data
  missingDetails?: { field: string; message: string }[];
  // Document verification state
  documentsVerified?: boolean;
  needsDocumentVerification?: boolean;
}

interface F1v4_DoneWorkerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: DoneWorkerData | null;
  onGoToDataCollection?: (workerId: string) => void;
  onLifecycleAction?: (workerId: string, action: WorkerLifecycleStatus, endDate: string, reason: string) => void;
  verificationMode?: boolean;
  onDocumentsVerified?: (workerId: string) => void;
}

const countryPayFrequencyDefaults: Record<string, { frequency: "monthly" | "fortnightly"; schedule: string }> = {
  "Philippines": { frequency: "fortnightly", schedule: "15th and 30th of each month" },
  "Norway": { frequency: "monthly", schedule: "Last business day of month" },
  "Singapore": { frequency: "monthly", schedule: "Last business day of month" },
  "Spain": { frequency: "monthly", schedule: "Last business day of month" },
  "Portugal": { frequency: "monthly", schedule: "Last business day of month" },
  "Germany": { frequency: "monthly", schedule: "Last business day of month" },
  "France": { frequency: "monthly", schedule: "Last business day of month" },
  "Italy": { frequency: "monthly", schedule: "Last business day of month" },
  "Poland": { frequency: "monthly", schedule: "Last business day of month" },
  "Ireland": { frequency: "monthly", schedule: "Last business day of month" },
};

type ActionType = "terminated" | "resigned" | "contract-ended";

const lifecycleStatusConfig: Record<WorkerLifecycleStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
  "active": {
    label: "Active",
    badgeClass: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20",
    icon: CheckCircle2,
  },
  "contract-ended": {
    label: "Contract ended",
    badgeClass: "bg-muted text-muted-foreground border-border",
    icon: CalendarOff,
  },
  "resigned": {
    label: "Resigned",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    icon: LogOut,
  },
  "terminated": {
    label: "Terminated",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    icon: UserX,
  },
};

/* ── Section Card (matches configure drawer pattern) ── */
const SectionCard: React.FC<{
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}> = ({ title, badge, defaultOpen = true, children, headerAction }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 px-5 py-3 bg-muted/30 border-b border-border/40 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-tight">{title}</h3>
            </div>
            {badge}
            {headerAction && (
              <div onClick={(e) => e.stopPropagation()}>
                {headerAction}
              </div>
            )}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground/60 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-3 space-y-3">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const F1v4_DoneWorkerDetailDrawer: React.FC<F1v4_DoneWorkerDetailDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  onGoToDataCollection,
  onLifecycleAction,
  verificationMode = false,
  onDocumentsVerified,
}) => {
  const [actionView, setActionView] = useState<ActionType | null>(null);
  const [actionDate, setActionDate] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const confirmationLabels: Record<ActionType, { title: string; description: string; buttonLabel: string; buttonClass: string }> = {
    "terminated": {
      title: "Terminate this worker?",
      description: `Are you sure you want to terminate ${worker?.name || "this worker"}? This will end their employment and remove them from future payroll runs.`,
      buttonLabel: "Yes, terminate",
      buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    "resigned": {
      title: "Confirm resignation?",
      description: `Are you sure you want to record ${worker?.name || "this worker"}'s resignation? They will be included in payroll up to their last working day.`,
      buttonLabel: "Yes, record resignation",
      buttonClass: "bg-amber-600 text-white hover:bg-amber-700",
    },
    "contract-ended": {
      title: "End this contract?",
      description: `Are you sure you want to mark ${worker?.name || "this worker"}'s contract as ended? They will be removed from future payroll runs after the end date.`,
      buttonLabel: "Yes, end contract",
      buttonClass: "bg-muted-foreground text-background hover:bg-muted-foreground/90",
    },
  };

  if (!worker) return null;

  const workerStatus = worker.workerStatus || "active";
  const isActive = workerStatus === "active";
  const isEmployee = worker.employmentType === "employee";
  const statusConfig = lifecycleStatusConfig[workerStatus];

  const resetActionView = () => {
    setActionView(null);
    setActionDate("");
    setActionReason("");
  };

  const handleSubmitAction = () => {
    if (!actionView || !actionDate) return;
    onLifecycleAction?.(worker.id, actionView, actionDate, actionReason);
    resetActionView();
  };

  const handleClose = (open: boolean) => {
    if (!open) resetActionView();
    onOpenChange(open);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatMaskedAccount = (accountNumber?: string) => {
    if (!accountNumber) return "••••••••";
    if (accountNumber.length <= 4) return accountNumber;
    return "••••" + accountNumber.slice(-4);
  };

  const countryDefaults = countryPayFrequencyDefaults[worker.country] || { frequency: "monthly", schedule: "Last business day of month" };
  const payFrequency = worker.payFrequency || countryDefaults.frequency;
  const paymentSchedule = worker.paymentSchedule || countryDefaults.schedule;
  const isPhilippines = worker.country === "Philippines";

  const mockData = {
    email: worker.email || `${worker.name.toLowerCase().replace(" ", ".")}@email.com`,
    phone: worker.phone || "+63 917 123 4567",
    dateOfBirth: worker.dateOfBirth || "March 15, 1992",
    nationality: worker.nationality || worker.country,
    address: worker.address || `123 Main Street, ${worker.country}`,
    startDate: worker.startDate || "February 1, 2026",
    contractStatus: worker.contractStatus || "completed",
    workLocation: worker.workLocation || worker.country,
    bankCountry: worker.bankCountry || worker.country,
    bankName: worker.bankName || (worker.country === "Philippines" ? "BDO Unibank" : worker.country === "Ireland" ? "AIB" : "Local Bank"),
    accountHolder: worker.accountHolder || worker.name,
    accountNumber: worker.accountNumber || "1234567890",
    swiftBic: worker.swiftBic || "BNORPHMM",
    tin: worker.tin || "123-456-789-000",
    philHealthNumber: isPhilippines ? (worker.philHealthNumber || "12-345678901-2") : undefined,
    nationalId: worker.nationalId || "PSA-1234567890",
    idDocumentStatus: worker.idDocumentStatus || "verified",
    detailsSubmittedOn: worker.detailsSubmittedOn || "January 20, 2026",
    verifiedBy: worker.verifiedBy || "Fronted System",
    lastUpdated: worker.lastUpdated || "January 25, 2026",
    completedOn: worker.completedOn || "January 28, 2026",
  };

  const hasMissingDetails = worker.missingDetails && worker.missingDetails.length > 0;

  const DetailRow = ({ label, value, className }: { label: string; value?: string; icon?: React.ElementType; className?: string }) => (
    <div className={cn("flex items-start justify-between gap-4 py-1.5", className)}>
      <span className="text-sm text-muted-foreground truncate">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value || "—"}</span>
    </div>
  );

  const StatusBadge = ({ status }: { status: "uploaded" | "verified" | "missing" }) => {
    const config = {
      uploaded: { label: "Uploaded", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      verified: { label: "Verified", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
      missing: { label: "Missing", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const c = config[status];
    return <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", c.className)}>{c.label}</Badge>;
  };

  const DocumentRow = ({ name, status, fileName, onView }: { 
    name: string; 
    status: "uploaded" | "verified" | "missing"; 
    fileName: string;
    actionType?: "download" | "view";
    onView?: () => void;
  }) => {
    if (status === "missing") {
      return (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/40 bg-muted/20">
          <div className="min-w-0">
            <span className="text-sm text-muted-foreground truncate">{name}</span>
          </div>
          <StatusBadge status="missing" />
        </div>
      );
    }

    const handleOpen = () => {
      if (onView) {
        onView();
      } else {
        window.open("#", "_blank");
      }
    };

    return (
      <button
        onClick={handleOpen}
        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border/40 bg-card/30 hover:bg-muted/40 hover:border-border/60 transition-colors w-full text-left group cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-[11px] text-muted-foreground">{fileName}</p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground shrink-0 transition-colors" />
      </button>
    );
  };

  // Action labels
  const actionLabels: Record<ActionType, { title: string; description: string; dateLabel: string; buttonLabel: string; buttonClass: string }> = {
    "terminated": {
      title: "Terminate worker",
      description: `Confirm termination of ${worker.name}. This will end their employment and remove them from future payroll runs.`,
      dateLabel: "Last working day",
      buttonLabel: "Confirm termination",
      buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    "resigned": {
      title: "Record resignation",
      description: `Record that ${worker.name} has resigned. They will be included in payroll up to their last working day.`,
      dateLabel: "Last working day",
      buttonLabel: "Confirm resignation",
      buttonClass: "bg-amber-600 text-white hover:bg-amber-700",
    },
    "contract-ended": {
      title: "End contract",
      description: `Mark ${worker.name}'s contract as ended. They will be removed from future payroll runs after the end date.`,
      dateLabel: "Last working day",
      buttonLabel: "Confirm end date",
      buttonClass: "bg-muted-foreground text-background hover:bg-muted-foreground/90",
    },
  };

  // If action view is open, show the confirmation form
  if (actionView) {
    const labels = actionLabels[actionView];
    const ActionIcon = actionView === "terminated" ? UserX : actionView === "resigned" ? LogOut : CalendarOff;
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-[85%] sm:w-[520px] sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
          {/* Simplified header — no large icon circle */}
          <SheetHeader className="px-6 pt-8 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={resetActionView}
                className="p-1.5 rounded-md hover:bg-muted transition-colors -ml-1"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div>
                <SheetTitle className="text-base">{labels.title}</SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{worker.name} · {worker.countryFlag} {worker.country}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 space-y-4">
            {/* Context note */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {labels.description}
            </p>

            {/* Form fields in a section card */}
            <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
              <div className="p-4 space-y-4">
                {/* Date field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">{labels.dateLabel}</label>
                  <Input
                    type="date"
                    value={actionDate}
                    onChange={(e) => setActionDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Reason field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Reason <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Textarea
                    placeholder={
                      actionView === "terminated" 
                        ? "e.g. Performance issues, end of project..." 
                        : actionView === "resigned" 
                        ? "e.g. Personal reasons, new opportunity..." 
                        : "e.g. Contract period completed, project ended..."
                    }
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons — contextually below form */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-9 text-sm"
                onClick={resetActionView}
              >
                Cancel
              </Button>
              <Button
                className={cn("flex-1 h-9 text-sm", labels.buttonClass)}
                disabled={!actionDate}
                onClick={() => setPendingAction(actionView)}
              >
                {labels.buttonLabel}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[85%] sm:w-[520px] sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
        {/* Header — matches payroll drawer pattern */}
        <SheetHeader className="px-5 pt-4 pb-3 border-b border-border/30 shrink-0">
          <SheetDescription className="sr-only">Worker details</SheetDescription>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold text-foreground leading-tight truncate">{worker.name}</SheetTitle>
              <span className="text-base shrink-0">{worker.countryFlag}</span>
              {(worker.needsDocumentVerification && !worker.documentsVerified) ? (
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shrink-0">
                  Inactive
                </span>
              ) : !verificationMode ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer shrink-0",
                      isActive
                        ? "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20 hover:bg-accent-green-fill/20"
                        : cn(statusConfig.badgeClass, "hover:opacity-80")
                    )}>
                      {!isActive && <statusConfig.icon className="h-3 w-3" />}
                      {statusConfig.label}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {!isActive && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onLifecycleAction?.(worker.id, "active", "", "")}
                          className="gap-2 text-accent-green-text focus:text-accent-green-text"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Reactivate</p>
                            <p className="text-xs text-muted-foreground">Set back to active status</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {workerStatus !== "terminated" && (
                      <DropdownMenuItem 
                        onClick={() => setActionView("terminated")}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <UserX className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Terminate</p>
                          <p className="text-xs text-muted-foreground">End employment immediately</p>
                        </div>
                      </DropdownMenuItem>
                    )}
                    {isEmployee && workerStatus !== "resigned" && (
                      <DropdownMenuItem 
                        onClick={() => setActionView("resigned")}
                        className="gap-2 text-amber-700 focus:text-amber-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Record resignation</p>
                          <p className="text-xs text-muted-foreground">Employee has resigned</p>
                        </div>
                      </DropdownMenuItem>
                    )}
                    {workerStatus !== "contract-ended" && (
                      <DropdownMenuItem 
                        onClick={() => setActionView("contract-ended")}
                        className="gap-2"
                      >
                        <CalendarOff className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">End contract</p>
                          <p className="text-xs text-muted-foreground">Contract period has ended</p>
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{isEmployee ? "Employee" : "Contractor"} · {worker.role}</p>
          </div>
          {!isActive && worker.endDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {workerStatus === "resigned" ? "Last working day" : workerStatus === "terminated" ? "Terminated on" : "Contract ended"}: {worker.endDate}
            </p>
          )}
          {!isActive && worker.endReason && (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Reason: {worker.endReason}
            </p>
          )}
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6 pt-3 space-y-3">

            {/* Missing Details Alert (if any) */}
            {hasMissingDetails && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-700 mb-1">Missing detail</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      This worker is marked Done, but we're missing some information. Please review.
                    </p>
                    {worker.missingDetails?.map((item, idx) => (
                      <div key={idx} className="text-xs text-amber-600 mb-1">
                        • {item.field}: {item.message}
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 h-7 text-xs gap-1.5 hover:bg-amber-500/10"
                      onClick={() => onGoToDataCollection?.(worker.id)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Go to data collection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-3">
              
              {/* 1) Personal Profile */}
              <SectionCard title="Personal Profile" defaultOpen={false}>
                <div className="space-y-0.5">
                  <DetailRow label="Full name" value={worker.name} />
                  <DetailRow label="Email" value={mockData.email} />
                  <DetailRow label="Phone" value={mockData.phone} />
                  <DetailRow label="Date of birth" value={mockData.dateOfBirth} />
                  <DetailRow label="Nationality" value={mockData.nationality} />
                  <DetailRow label="Residential address" value={mockData.address} />
                  <DetailRow label="National ID" value={mockData.nationalId} />
                </div>
              </SectionCard>

              {/* 2) Working Engagement */}
              <SectionCard 
                title="Working Engagement" 
                defaultOpen={false}
              >
                <div className="space-y-0.5">
                  <DetailRow 
                    label="Worker type" 
                    value={isEmployee ? "Employee (EOR)" : "Contractor (COR)"} 
                  />
                  <DetailRow label="Role / title" value={worker.role} />
                  <DetailRow label="Country" value={`${worker.countryFlag} ${worker.country}`} />
                  <DetailRow label="Start date" value={mockData.startDate} />
                  {!isActive && worker.endDate && (
                    <DetailRow 
                      label={workerStatus === "resigned" ? "Last working day" : workerStatus === "terminated" ? "Termination date" : "End date"} 
                      value={worker.endDate} 
                    />
                  )}
                  <div className="flex items-center justify-between gap-4 py-1.5">
                    <span className="text-sm text-muted-foreground">Contract status</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 capitalize",
                        !isActive && "bg-muted text-muted-foreground border-border",
                        isActive && mockData.contractStatus === "completed" && "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20",
                        isActive && mockData.contractStatus === "signed" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                        isActive && mockData.contractStatus === "drafted" && "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {!isActive ? workerStatus.replace("-", " ") : mockData.contractStatus}
                    </Badge>
                  </div>
                  <DetailRow label="Work location" value={mockData.workLocation} />
                  <DetailRow 
                    label={isEmployee ? "Salary" : "Consultancy fee"} 
                    value={worker.salary} 
                  />
                </div>

                {/* Terms sub-section */}
                <div className="border-t border-border/40 pt-3 mt-2">
                  <p className="text-[11px] text-muted-foreground mb-2">Contract terms</p>
                  <div className="space-y-0.5">
                    <DetailRow label="Probation period" value="180 days" />
                    <DetailRow label="Notice period" value="30 days" />
                    <DetailRow label="Annual leave" value={isPhilippines ? "5 days" : "25 days"} />
                    <DetailRow label="Sick leave" value={isPhilippines ? "5 days" : "365 days"} />
                    <DetailRow label="Weekly hours" value={isPhilippines ? "48 hrs" : "37.5 hrs"} />
                  </div>
                </div>
              </SectionCard>

              {/* 3) Payroll Parameters */}
              <SectionCard title="Payroll Parameters" defaultOpen={false}>
                <div className="space-y-0.5">
                  <DetailRow label="TIN" value={mockData.tin} />
                  {isPhilippines && mockData.philHealthNumber && (
                    <DetailRow label="PhilHealth number" value={mockData.philHealthNumber} />
                  )}
                  {worker.firstPayrollNote && (
                    <div className="mt-2 p-2.5 rounded-lg bg-muted/50">
                      <p className="text-[11px] text-muted-foreground">{worker.firstPayrollNote}</p>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* 4) Payout Destination */}
              <SectionCard title="Payout Destination" defaultOpen={false}>
                <div className="space-y-0.5">
                  <DetailRow label="Bank country" value={mockData.bankCountry} />
                  <DetailRow label="Bank name" value={mockData.bankName} />
                  <DetailRow label="Account holder" value={mockData.accountHolder} />
                  <DetailRow label="Account number" value={formatMaskedAccount(mockData.accountNumber)} />
                  {mockData.swiftBic && (
                    <DetailRow label="SWIFT / BIC" value={mockData.swiftBic} />
                  )}
                </div>
              </SectionCard>

              {/* 5) Documents */}
              <SectionCard 
                title="Documents" 
                defaultOpen={verificationMode || (worker.needsDocumentVerification && !worker.documentsVerified)}
                badge={worker.documentsVerified ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20">
                    Verified
                  </Badge>
                ) : undefined}
                headerAction={(worker.needsDocumentVerification && !worker.documentsVerified) || verificationMode ? (
                  <Button
                    size="sm"
                    className="h-6 px-3 text-[11px] gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary transition-colors font-medium"
                    variant="ghost"
                    onClick={() => onDocumentsVerified?.(worker.id)}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Verify All
                  </Button>
                ) : undefined}
              >
                <div className="space-y-2">
                  <DocumentRow 
                    name="Identity document"
                    status={verificationMode ? "uploaded" : mockData.idDocumentStatus}
                    fileName={`${worker.name.split(" ")[0]}_ID_doc.pdf`}
                  />
                  {verificationMode && worker.country === "India" && (
                    <>
                      <DocumentRow 
                        name="PAN Card"
                        status="uploaded"
                        fileName={`${worker.name.split(" ")[0]}_PAN_Card.pdf`}
                      />
                      <DocumentRow 
                        name="Investment proof (80C/80D)"
                        status="uploaded"
                        fileName={`${worker.name.split(" ")[0]}_Investment_Proof.pdf`}
                      />
                    </>
                  )}
                  <DocumentRow 
                    name={isEmployee ? "Employment agreement" : "Contractor agreement"}
                    status="verified"
                    fileName={`${worker.name.replace(/\s+/g, "_")}_Agreement_Signed.pdf`}
                  />
                  {worker.optionalUploads?.filter(u => u.status !== "missing").map((upload, idx) => (
                    <DocumentRow
                      key={idx}
                      name={upload.name}
                      status={upload.status}
                      fileName={`${worker.name.split(" ")[0]}_${upload.name.replace(/\s+/g, "_")}.pdf`}
                    />
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Agreement Viewer Overlay - rendered outside parent Sheet */}
    <AgreementViewerSheet 
      open={showAgreement} 
      onClose={() => setShowAgreement(false)} 
      worker={worker}
      isEmployee={isEmployee}
    />

    {/* Confirmation dialog */}
    <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{pendingAction && confirmationLabels[pendingAction].title}</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingAction && confirmationLabels[pendingAction].description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(pendingAction && confirmationLabels[pendingAction].buttonClass)}
            onClick={() => {
              if (pendingAction && actionDate) {
                onLifecycleAction?.(worker.id, pendingAction, actionDate, actionReason);
                setPendingAction(null);
                resetActionView();
              }
            }}
          >
            {pendingAction && confirmationLabels[pendingAction].buttonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default F1v4_DoneWorkerDetailDrawer;
