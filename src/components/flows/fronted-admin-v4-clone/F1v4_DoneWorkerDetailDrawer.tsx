/**
 * F1v4_DoneWorkerDetailDrawer - Right-side panel for Done workers
 * 
 * Shows a clean, scannable summary of collected onboarding data
 * organized into logical sections. Includes lifecycle actions
 * (terminate, resign, end contract).
 */

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  FileText,
  Upload,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

interface F1v4_DoneWorkerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: DoneWorkerData | null;
  onGoToDataCollection?: (workerId: string) => void;
  onLifecycleAction?: (workerId: string, action: WorkerLifecycleStatus, endDate: string, reason: string) => void;
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

export const F1v4_DoneWorkerDetailDrawer: React.FC<F1v4_DoneWorkerDetailDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  onGoToDataCollection,
  onLifecycleAction,
}) => {
  const [actionView, setActionView] = useState<ActionType | null>(null);
  const [actionDate, setActionDate] = useState("");
  const [actionReason, setActionReason] = useState("");

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

  // Action labels
  const actionLabels: Record<ActionType, { title: string; description: string; dateLabel: string; buttonLabel: string; buttonClass: string }> = {
    "terminated": {
      title: "Terminate worker",
      description: `Confirm termination of ${worker.name}. This will end their employment and remove them from future payroll runs.`,
      dateLabel: "Termination date",
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
      dateLabel: "Contract end date",
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
        <SheetContent className="w-[520px] sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
          <SheetHeader className="px-6 py-5 border-b border-border/40 shrink-0 bg-background pt-12">
            <div className="flex items-center gap-3">
              <button
                onClick={resetActionView}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  actionView === "terminated" && "bg-destructive/10",
                  actionView === "resigned" && "bg-amber-500/10",
                  actionView === "contract-ended" && "bg-muted",
                )}>
                  <ActionIcon className={cn(
                    "h-5 w-5",
                    actionView === "terminated" && "text-destructive",
                    actionView === "resigned" && "text-amber-600",
                    actionView === "contract-ended" && "text-muted-foreground",
                  )} />
                </div>
                <div>
                  <SheetTitle className="text-base">{labels.title}</SheetTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{worker.name} · {worker.countryFlag} {worker.country}</p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div className="p-4 rounded-xl border border-border/40 bg-muted/30">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {labels.description}
              </p>
            </div>

            {/* Date input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{labels.dateLabel}</Label>
              <Input
                type="date"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Reason
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </Label>
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
                className="resize-none"
              />
            </div>

            {/* Worker summary */}
            <div className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Worker summary</h4>
              <div className="space-y-1">
                <DetailRow label="Name" value={worker.name} />
                <DetailRow label="Role" value={worker.role} />
                <DetailRow label="Type" value={isEmployee ? "Employee (EOR)" : "Contractor (COR)"} />
                <DetailRow label="Compensation" value={worker.salary} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/40 shrink-0 bg-background flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetActionView}
            >
              Cancel
            </Button>
            <Button
              className={cn("flex-1", labels.buttonClass)}
              disabled={!actionDate}
              onClick={handleSubmitAction}
            >
              {labels.buttonLabel}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[520px] sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/40 shrink-0 bg-background pt-12">
          <div className="flex items-start gap-4">
            <Avatar className={cn(
              "h-14 w-14 border-2",
              isActive 
                ? "border-accent-green-outline/30" 
                : "border-border/40"
            )}>
              <AvatarFallback className={cn(
                "text-lg font-semibold",
                isActive 
                  ? "bg-accent-green-fill/20 text-accent-green-text" 
                  : "bg-muted text-muted-foreground"
              )}>
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {worker.name}
                    </h2>
                    <span className="text-xl">{worker.countryFlag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {worker.role} · {isEmployee ? "Employee (EOR)" : "Contractor (COR)"}
                  </p>
                </div>

                {/* Status badge / dropdown — top right */}
                {isActive ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer shrink-0",
                        "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20 hover:bg-accent-green-fill/20"
                      )}>
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
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
                      {isEmployee && (
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs gap-1 shrink-0", statusConfig.badgeClass)}
                  >
                    <statusConfig.icon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                )}
              </div>

              {/* End date/reason if not active */}
              {!isActive && worker.endDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  {workerStatus === "resigned" ? "Last working day" : workerStatus === "terminated" ? "Terminated on" : "Contract ended"}: {worker.endDate}
                </p>
              )}
              {!isActive && worker.endReason && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Reason: {worker.endReason}
                </p>
              )}

              {isActive && (
                <p className="text-xs text-muted-foreground mt-2">
                  All details collected and verified.
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">

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

            {/* Accordion Sections */}
            <Accordion type="multiple" defaultValue={["personal-profile", "working-engagement", "payroll-parameters", "payout-destination"]} className="space-y-2">
              
              {/* 1) Personal Profile */}
              <AccordionItem value="personal-profile" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Personal Profile</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <DetailRow label="Full name" value={worker.name} />
                    <DetailRow label="Email" value={mockData.email} icon={Mail} />
                    <DetailRow label="Phone" value={mockData.phone} icon={Phone} />
                    <DetailRow label="Date of birth" value={mockData.dateOfBirth} icon={Calendar} />
                    <DetailRow label="Nationality" value={mockData.nationality} icon={Globe} />
                    <DetailRow label="Residential address" value={mockData.address} icon={MapPin} />
                    <DetailRow label="TIN" value={mockData.tin} />
                    {isPhilippines && mockData.philHealthNumber && (
                      <DetailRow label="PhilHealth number" value={mockData.philHealthNumber} />
                    )}
                    <DetailRow label="National ID / Government ID" value={mockData.nationalId} />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-sm text-muted-foreground">Identity document</span>
                      <StatusBadge status={mockData.idDocumentStatus} />
                    </div>
                    {worker.optionalUploads?.map((upload, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-1.5">
                        <span className="text-sm text-muted-foreground">{upload.name}</span>
                        <StatusBadge status={upload.status} />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2) Working Engagement */}
              <AccordionItem value="working-engagement" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Working Engagement</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <DetailRow 
                      label="Worker type" 
                      value={isEmployee ? "Employee (EOR)" : "Contractor (COR)"} 
                    />
                    <DetailRow label="Role / title" value={worker.role} />
                    <DetailRow label="Start date" value={mockData.startDate} icon={Calendar} />
                    {!isActive && worker.endDate && (
                      <DetailRow 
                        label={workerStatus === "resigned" ? "Last working day" : workerStatus === "terminated" ? "Termination date" : "End date"} 
                        value={worker.endDate} 
                        icon={CalendarOff} 
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
                    <DetailRow label="Work location" value={mockData.workLocation} icon={MapPin} />
                    <DetailRow 
                      label={isEmployee ? "Salary" : "Consultancy fee"} 
                      value={worker.salary} 
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3) Payroll Parameters */}
              <AccordionItem value="payroll-parameters" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Payroll Parameters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <span className="text-sm text-muted-foreground">Pay frequency</span>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/20 capitalize"
                      >
                        {payFrequency}
                      </Badge>
                    </div>
                    <DetailRow 
                      label={isEmployee ? "Salary" : "Consultancy fee"} 
                      value={worker.salary} 
                    />
                    <DetailRow label="Payment schedule" value={paymentSchedule} />
                    {worker.firstPayrollNote && (
                      <div className="mt-2 p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[11px] text-muted-foreground">{worker.firstPayrollNote}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4) Payout Destination */}
              <AccordionItem value="payout-destination" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Payout Destination</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <DetailRow label="Bank country" value={mockData.bankCountry} icon={Globe} />
                    <DetailRow label="Bank name" value={mockData.bankName} icon={Building2} />
                    <DetailRow label="Account holder" value={mockData.accountHolder} />
                    <DetailRow label="Account number" value={formatMaskedAccount(mockData.accountNumber)} icon={CreditCard} />
                    {mockData.swiftBic && (
                      <DetailRow label="SWIFT / BIC" value={mockData.swiftBic} />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Audit trail hidden for now */}
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default F1v4_DoneWorkerDetailDrawer;
