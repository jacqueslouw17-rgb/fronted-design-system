/**
 * F1v4_DoneWorkerDetailDrawer - Right-side panel for Done workers
 * 
 * Shows a clean, scannable summary of collected onboarding data
 * organized into logical sections.
 */

import React from "react";
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
} from "lucide-react";

export interface DoneWorkerData {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  employmentType: "contractor" | "employee";
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
};

export const F1v4_DoneWorkerDetailDrawer: React.FC<F1v4_DoneWorkerDetailDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  onGoToDataCollection,
}) => {
  if (!worker) return null;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatMaskedAccount = (accountNumber?: string) => {
    if (!accountNumber) return "••••••••";
    if (accountNumber.length <= 4) return accountNumber;
    return "••••" + accountNumber.slice(-4);
  };

  // Get country-specific pay frequency defaults
  const countryDefaults = countryPayFrequencyDefaults[worker.country] || { frequency: "monthly", schedule: "Last business day of month" };
  const payFrequency = worker.payFrequency || countryDefaults.frequency;
  const paymentSchedule = worker.paymentSchedule || countryDefaults.schedule;

  // Check if worker is from Philippines (for special fortnightly note)
  const isPhilippines = worker.country === "Philippines";

  // Mock data for demonstration
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
    bankName: worker.bankName || (worker.country === "Philippines" ? "BDO Unibank" : worker.country === "Norway" ? "DNB Bank" : "Local Bank"),
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

  const DetailRow = ({ label, value, icon: Icon, className }: { label: string; value?: string; icon?: React.ElementType; className?: string }) => (
    <div className={cn("flex items-start justify-between gap-4 py-1.5", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[520px] sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/40 shrink-0 bg-background pt-12">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-accent-green-outline/30">
              <AvatarFallback className="bg-accent-green-fill/20 text-accent-green-text text-lg font-semibold">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {worker.name}
                </h2>
                <span className="text-xl">{worker.countryFlag}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className="bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20 text-xs gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Payroll ready
                </Badge>
                <Badge variant="outline" className="text-xs bg-muted/30">
                  {worker.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All required details collected and verified.
              </p>
              {mockData.completedOn && (
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Completed on: {mockData.completedOn}
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
            <Accordion type="multiple" defaultValue={["personal", "employment", "payroll", "bank"]} className="space-y-2">
              
              {/* A) Personal Details */}
              <AccordionItem value="personal" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Personal details</span>
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
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* B) Employment & Contract */}
              <AccordionItem value="employment" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Employment & contract</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <DetailRow 
                      label="Worker type" 
                      value={worker.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"} 
                    />
                    <DetailRow label="Role / title" value={worker.role} />
                    <DetailRow label="Start date" value={mockData.startDate} icon={Calendar} />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Contract status</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 capitalize",
                          mockData.contractStatus === "completed" && "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20",
                          mockData.contractStatus === "signed" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                          mockData.contractStatus === "drafted" && "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {mockData.contractStatus}
                      </Badge>
                    </div>
                    <DetailRow label="Work location" value={mockData.workLocation} icon={MapPin} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* C) Payroll Details */}
              <AccordionItem value="payroll" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Payroll details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Pay frequency</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/20 capitalize"
                      >
                        {payFrequency}
                      </Badge>
                    </div>
                    <DetailRow 
                      label={worker.employmentType === "employee" ? "Salary" : "Consultancy fee"} 
                      value={worker.salary} 
                    />
                    <DetailRow label="Payment schedule" value={paymentSchedule} />
                    {isPhilippines && payFrequency === "fortnightly" && (
                      <div className="mt-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <p className="text-[11px] text-blue-600 leading-relaxed">
                          <strong>Note:</strong> In PH fortnightly schedules, a worker may still be paid after their end date depending on payout timing. Review before excluding.
                        </p>
                      </div>
                    )}
                    {worker.firstPayrollNote && (
                      <div className="mt-2 p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[11px] text-muted-foreground">{worker.firstPayrollNote}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* D) Bank Details */}
              <AccordionItem value="bank" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Bank details</span>
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

              {/* E) Compliance (Country-specific) */}
              <AccordionItem value="compliance" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Compliance</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50">
                      {worker.country}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <DetailRow label="TIN" value={mockData.tin} />
                    {isPhilippines && mockData.philHealthNumber && (
                      <DetailRow label="PhilHealth number" value={mockData.philHealthNumber} />
                    )}
                    <DetailRow label="National ID / Government ID" value={mockData.nationalId} />
                    <div className="flex items-center justify-between gap-4 py-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Identity document</span>
                      </div>
                      <StatusBadge status={mockData.idDocumentStatus} />
                    </div>
                    {worker.optionalUploads?.map((upload, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-1.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{upload.name}</span>
                        </div>
                        <StatusBadge status={upload.status} />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* F) Audit / Status Trail */}
              <AccordionItem value="audit" className="border border-border/40 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Audit trail</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-0.5">
                    <DetailRow label="Details submitted on" value={mockData.detailsSubmittedOn} icon={Calendar} />
                    <DetailRow label="Verified by" value={mockData.verifiedBy} icon={Award} />
                    <DetailRow label="Last updated" value={mockData.lastUpdated} icon={Clock} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default F1v4_DoneWorkerDetailDrawer;
