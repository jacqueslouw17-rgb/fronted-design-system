/**
 * Flow 6 v2 - Payroll Clone (Company Admin Self-Run)
 * 
 * 1:1 Clone of Flow 7 – Fronted Admin Payroll v1 (PayrollBatch.tsx)
 * This is the full payroll workbench adapted for Company Admin.
 * 
 * Only minimal CTA changes:
 * - "Send to Client" → "Approve Payroll"
 * - Hide "Proxy Approve" (Fronted-only)
 * - Company Admin info banner instead of "Managed by Fronted"
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, Circle, DollarSign, AlertTriangle, Play, TrendingUp, 
  RefreshCw, Lock, Info, Clock, X, XCircle, AlertCircle, Download, 
  FileText, Building2, Receipt, Activity, Settings, Plus, Check, 
  Search, Users, Briefcase, Send, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

// Types matching PayrollBatch.tsx
type PayrollStep = "review-fx" | "exceptions" | "execute" | "track";

const steps = [
  { id: "review-fx" as const, label: "Review FX", icon: DollarSign },
  { id: "exceptions" as const, label: "Exceptions", icon: AlertTriangle },
  { id: "execute" as const, label: "Execute", icon: Play },
  { id: "track" as const, label: "Track & Reconcile", icon: TrendingUp }
];

interface ContractorPayment {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  netPay: number;
  baseSalary: number;
  currency: string;
  estFees: number;
  fxRate: number;
  recvLocal: number;
  eta: string;
  employmentType: "employee" | "contractor";
  employerTaxes?: number;
  status?: "Active" | "Terminated" | "Contract Ended" | "On Hold";
  endDate?: string;
  compensationType?: "Monthly" | "Daily" | "Hourly" | "Project-Based";
  hourlyRate?: number;
  hoursWorked?: number;
  expectedMonthlyHours?: number;
  startDate?: string;
  role?: string;
  ftePercent?: number;
}

interface PayrollException {
  id: string;
  contractorId: string;
  contractorName: string;
  contractorCountry?: string;
  type: string;
  description: string;
  severity: "high" | "medium" | "low";
  resolved: boolean;
  snoozed: boolean;
  ignored: boolean;
  formSent?: boolean;
  canFixInPayroll: boolean;
  isBlocking: boolean;
  overrideInfo?: {
    overriddenBy: string;
    overriddenAt: string;
    justification: string;
  };
}

// Mock data matching PayrollBatch.tsx structure
const contractorsByCurrency: Record<string, ContractorPayment[]> = {
  EUR: [
    { id: "1", name: "David Martinez", country: "Portugal", countryCode: "PT", baseSalary: 4200, netPay: 4200, currency: "EUR", estFees: 25, fxRate: 0.92, recvLocal: 4200, eta: "Oct 30", employmentType: "contractor", status: "Active" },
    { id: "2", name: "Sophie Laurent", country: "France", countryCode: "FR", baseSalary: 5800, netPay: 5800, currency: "EUR", estFees: 35, fxRate: 0.92, recvLocal: 5800, eta: "Oct 30", employmentType: "employee", employerTaxes: 1740, status: "Active" },
    { id: "3", name: "Marco Rossi", country: "Italy", countryCode: "IT", baseSalary: 4500, netPay: 4500, currency: "EUR", estFees: 28, fxRate: 0.92, recvLocal: 4500, eta: "Oct 30", employmentType: "contractor", status: "Active" },
  ],
  NOK: [
    { id: "4", name: "Alex Hansen", country: "Norway", countryCode: "NO", baseSalary: 65000, netPay: 65000, currency: "NOK", estFees: 250, fxRate: 10.45, recvLocal: 65000, eta: "Oct 31", employmentType: "employee", employerTaxes: 9750, status: "Active" },
    { id: "5", name: "Emma Wilson", country: "Norway", countryCode: "NO", baseSalary: 72000, netPay: 72000, currency: "NOK", estFees: 280, fxRate: 10.45, recvLocal: 72000, eta: "Oct 31", employmentType: "contractor", status: "Active" },
  ],
  PHP: [
    { id: "6", name: "Maria Santos", country: "Philippines", countryCode: "PH", baseSalary: 280000, netPay: 280000, currency: "PHP", estFees: 850, fxRate: 56.2, recvLocal: 280000, eta: "Oct 30", employmentType: "employee", employerTaxes: 42000, status: "Active" },
    { id: "7", name: "Jose Reyes", country: "Philippines", countryCode: "PH", baseSalary: 245000, netPay: 245000, currency: "PHP", estFees: 750, fxRate: 56.2, recvLocal: 245000, eta: "Oct 30", employmentType: "contractor", status: "Active" },
    { id: "8", name: "Luis Hernandez", country: "Philippines", countryCode: "PH", baseSalary: 260000, netPay: 260000, currency: "PHP", estFees: 800, fxRate: 56.2, recvLocal: 260000, eta: "Oct 30", employmentType: "contractor", status: "Active" },
  ],
};

const initialExceptions: PayrollException[] = [
  {
    id: "exc-1",
    contractorId: "5",
    contractorName: "Emma Wilson",
    contractorCountry: "Norway",
    type: "missing-bank",
    description: "Bank account IBAN/routing number missing – cannot process payment",
    severity: "high",
    resolved: false,
    snoozed: false,
    ignored: false,
    formSent: false,
    canFixInPayroll: true,
    isBlocking: true,
  },
  {
    id: "exc-2",
    contractorId: "7",
    contractorName: "Luis Hernandez",
    contractorCountry: "Philippines",
    type: "fx-mismatch",
    description: "Currency preference set to USD but contract specifies PHP",
    severity: "medium",
    resolved: false,
    snoozed: false,
    ignored: false,
    formSent: false,
    canFixInPayroll: false,
    isBlocking: false,
  },
];

export const F6v2_PayrollClone: React.FC = () => {
  // State matching PayrollBatch.tsx
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review-fx");
  const [fxRatesLocked, setFxRatesLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<"all" | "employee" | "contractor">("all");
  const [snoozedWorkers, setSnoozedWorkers] = useState<string[]>([]);
  const [showSnoozedSection, setShowSnoozedSection] = useState(true);
  const [executeEmploymentType, setExecuteEmploymentType] = useState<"all" | "employees" | "contractors">("all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [payoutPeriod, setPayoutPeriod] = useState<"full" | "first-half" | "second-half">("full");
  const [exceptions, setExceptions] = useState<PayrollException[]>(initialExceptions);
  const [exceptionGroupFilter, setExceptionGroupFilter] = useState<"all" | "fixable" | "non-fixable">("all");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [exceptionToOverride, setExceptionToOverride] = useState<PayrollException | null>(null);
  const [overrideJustification, setOverrideJustification] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<Record<string, "pending" | "processing" | "complete" | "failed">>({});
  const [executionConfirmOpen, setExecutionConfirmOpen] = useState(false);
  const [pendingExecutionCohort, setPendingExecutionCohort] = useState<"all" | "employees" | "contractors" | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "InTransit" | "Failed">("all");
  const [workerTypeFilter, setWorkerTypeFilter] = useState<"all" | "employee" | "contractor">("all");
  const [selectedCycle, setSelectedCycle] = useState<"previous" | "current" | "next">("current");
  const [contractorDrawerOpen, setContractorDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<ContractorPayment | null>(null);
  const [countryRulesDrawerOpen, setCountryRulesDrawerOpen] = useState(false);
  const [payrollApproved, setPayrollApproved] = useState(false);

  // All contractors flattened
  const allContractors = Object.values(contractorsByCurrency).flat();
  
  // Filter contractors
  const filteredContractors = allContractors.filter(c => {
    if (snoozedWorkers.includes(c.id)) return false;
    if (employmentTypeFilter === "all") return true;
    return c.employmentType === employmentTypeFilter;
  });

  const snoozedContractorsList = allContractors.filter(c => snoozedWorkers.includes(c.id));

  // Group by currency
  const groupedByCurrency = filteredContractors.reduce((acc, contractor) => {
    if (!acc[contractor.currency]) acc[contractor.currency] = [];
    acc[contractor.currency].push(contractor);
    return acc;
  }, {} as Record<string, ContractorPayment[]>);

  // Execution filtered workers
  const executeFilteredWorkers = allContractors.filter(c => {
    if (snoozedWorkers.includes(c.id)) return false;
    if (executeEmploymentType === "employees") return c.employmentType === "employee";
    if (executeEmploymentType === "contractors") return c.employmentType === "contractor";
    return true;
  });

  // Payroll cycle data
  const payrollCycleData = {
    previous: { label: "October 2025", status: "completed" as const, totalSalaryCost: 118240, frontedFees: 3547, totalPayrollCost: 121787 },
    current: { label: "November 2025", status: "active" as const, totalSalaryCost: 124850, frontedFees: 3742, totalPayrollCost: 128592 },
    next: { label: "December 2025", status: "upcoming" as const, totalSalaryCost: null, frontedFees: null, totalPayrollCost: null },
  };
  const currentCycleData = payrollCycleData[selectedCycle];

  // Exception counts
  const activeExceptions = exceptions.filter(exc => !exc.resolved && !exc.snoozed && !exc.ignored);
  const snoozedExceptions = exceptions.filter(exc => exc.snoozed);
  const acknowledgedExceptions = exceptions.filter(exc => exc.resolved && !exc.ignored);
  const ignoredExceptions = exceptions.filter(exc => exc.ignored);
  const allExceptionsResolved = activeExceptions.length === 0;

  // Totals
  const employeeCount = filteredContractors.filter(c => c.employmentType === "employee").length;
  const contractorCount = filteredContractors.filter(c => c.employmentType === "contractor").length;
  const totalGross = filteredContractors.reduce((sum, c) => sum + c.baseSalary, 0);
  const totalFees = filteredContractors.reduce((sum, c) => sum + c.estFees, 0);
  const totalEmployerCosts = filteredContractors.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + (c.employerTaxes || 0), 0);

  // Handlers
  const handleLockRates = () => {
    const now = new Date();
    setFxRatesLocked(true);
    setLockedAt(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    toast.success("FX rates locked for 15 minutes");
  };

  const handleRefreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setFxRatesLocked(false);
      setLockedAt(null);
      toast.success("FX quotes refreshed");
    }, 1000);
  };

  const handleSnoozeWorker = (workerId: string) => {
    setSnoozedWorkers(prev => [...prev, workerId]);
    const worker = allContractors.find(c => c.id === workerId);
    toast.success(`${worker?.name} snoozed for this cycle`);
  };

  const handleUndoSnooze = (workerId: string) => {
    setSnoozedWorkers(prev => prev.filter(id => id !== workerId));
    const worker = allContractors.find(c => c.id === workerId);
    toast.success(`${worker?.name} restored to batch`);
  };

  const handleResolveException = (exceptionId: string) => {
    setExceptions(prev => prev.map(exc => 
      exc.id === exceptionId ? { ...exc, resolved: true } : exc
    ));
    toast.success("Exception resolved");
  };

  const handleSnoozeException = (exceptionId: string) => {
    const exception = exceptions.find(exc => exc.id === exceptionId);
    setExceptions(prev => prev.map(exc => 
      exc.id === exceptionId ? { ...exc, snoozed: true } : exc
    ));
    toast.info(`${exception?.contractorName || 'Exception'} snoozed to next cycle`);
  };

  const handleOpenOverrideModal = (exception: PayrollException) => {
    setExceptionToOverride(exception);
    setOverrideJustification("");
    setOverrideModalOpen(true);
  };

  const handleConfirmOverride = () => {
    if (!exceptionToOverride || !overrideJustification.trim()) {
      toast.error("Please provide a justification for the override");
      return;
    }
    setExceptions(prev => prev.map(exc => 
      exc.id === exceptionToOverride.id 
        ? { ...exc, resolved: true, overrideInfo: { overriddenBy: "Company Admin", overriddenAt: new Date().toISOString(), justification: overrideJustification } }
        : exc
    ));
    toast.success(`Exception overridden for ${exceptionToOverride.contractorName}`);
    setOverrideModalOpen(false);
    setExceptionToOverride(null);
    setOverrideJustification("");
  };

  const handleExecuteClick = (cohort: "all" | "employees" | "contractors") => {
    setPendingExecutionCohort(cohort);
    setExecutionConfirmOpen(true);
  };

  const handleConfirmExecution = async () => {
    if (!pendingExecutionCohort) return;
    setExecutionConfirmOpen(false);
    setIsExecuting(true);

    let workersToExecute = executeFilteredWorkers;
    if (pendingExecutionCohort === "employees") {
      workersToExecute = executeFilteredWorkers.filter(c => c.employmentType === "employee");
    } else if (pendingExecutionCohort === "contractors") {
      workersToExecute = executeFilteredWorkers.filter(c => c.employmentType === "contractor");
    }

    const initialProgress: Record<string, "pending" | "processing" | "complete" | "failed"> = {};
    workersToExecute.forEach(c => { initialProgress[c.id] = "pending"; });
    setExecutionProgress(initialProgress);

    for (const contractor of workersToExecute) {
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "processing" }));
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 500));
      const isFailed = Math.random() < 0.1;
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: isFailed ? "failed" : "complete" }));
    }

    setIsExecuting(false);
    const successCount = workersToExecute.filter(w => executionProgress[w.id] !== "failed").length;
    const cohortLabel = pendingExecutionCohort === "all" ? "all workers" : pendingExecutionCohort;
    toast.success(`Payroll executed for ${cohortLabel}`);
    setPendingExecutionCohort(null);
  };

  const handleApprovePayroll = () => {
    setPayrollApproved(true);
    toast.success("Payroll approved! Payments will execute on schedule.");
  };

  const getPaymentStatus = (contractorId: string): "Paid" | "InTransit" | "Failed" => {
    if (currentCycleData.status === "completed" || payrollApproved) return "Paid";
    const progress = executionProgress[contractorId];
    if (progress === "complete") return "Paid";
    if (progress === "failed") return "Failed";
    return "InTransit";
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "review-fx":
        return renderReviewStep();
      case "exceptions":
        return renderExceptionsStep();
      case "execute":
        return renderExecuteStep();
      case "track":
        return renderTrackStep();
      default:
        return null;
    }
  };

  // Review FX Step
  const renderReviewStep = () => (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">FX Review</h3>
          {selectedCycle === "previous" && <Badge variant="outline" className="text-xs bg-muted/30">Read-Only Mode</Badge>}
          {fxRatesLocked && lockedAt && (
            <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30 gap-1.5">
              <Lock className="h-3 w-3" />
              Locked at {lockedAt}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!fxRatesLocked && selectedCycle !== "previous" && (
            <Button variant="outline" size="sm" onClick={handleLockRates} className="gap-2">
              <Lock className="h-3.5 w-3.5" />
              Lock FX Rates
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setCountryRulesDrawerOpen(true)} className="gap-2">
            <Settings className="h-3.5 w-3.5" />
            Country Rules
          </Button>
        </div>
      </div>

      {/* Employment Type Filter */}
      <div className="flex justify-start mb-4">
        <Tabs value={employmentTypeFilter} onValueChange={v => setEmploymentTypeFilter(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="employee" className="text-xs">Employee</TabsTrigger>
            <TabsTrigger value="contractor" className="text-xs">Contractor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Currency Tables */}
      {Object.entries(groupedByCurrency).map(([currency, contractors]) => {
        const currencySymbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
        const symbol = currencySymbols[currency] || currency;
        const contractorsList = contractors.filter(c => c.employmentType === "contractor");
        const employeesList = contractors.filter(c => c.employmentType === "employee");

        return (
          <Card key={currency} className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{currency} Payments</span>
                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                    Employees: {employeesList.length}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-secondary/5 border-secondary/20">
                    Contractors: {contractorsList.length}
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs min-w-[180px]">Name</TableHead>
                      <TableHead className="text-xs min-w-[100px]">Type</TableHead>
                      <TableHead className="text-xs min-w-[100px]">Country</TableHead>
                      <TableHead className="text-xs min-w-[80px]">Status</TableHead>
                      <TableHead className="text-xs text-right min-w-[100px]">Gross Pay</TableHead>
                      <TableHead className="text-xs text-right min-w-[100px]">Net Pay</TableHead>
                      <TableHead className="text-xs text-right min-w-[80px]">Fees</TableHead>
                      <TableHead className="text-xs min-w-[80px]">ETA</TableHead>
                      <TableHead className="text-xs min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractors.map(contractor => (
                      <TableRow 
                        key={contractor.id} 
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => { setSelectedContractor(contractor); setContractorDrawerOpen(true); }}
                      >
                        <TableCell className="font-medium text-sm">{contractor.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", 
                            contractor.employmentType === "employee" 
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                              : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                          )}>
                            {contractor.employmentType === "employee" ? "Employee" : "Contractor"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{contractor.country}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs",
                            contractor.status === "Active" && "bg-green-500/10 text-green-600 border-green-500/30",
                            contractor.status === "Terminated" && "bg-red-500/10 text-red-600 border-red-500/30"
                          )}>
                            {contractor.status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{symbol}{contractor.baseSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{symbol}{contractor.netPay.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.estFees}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{contractor.eta}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={e => { e.stopPropagation(); handleSnoozeWorker(contractor.id); }}
                          >
                            Snooze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Per-currency subtotals */}
              <div className="p-3 bg-muted/20 border-t border-border">
                <div className="flex gap-4">
                  <div className="px-3 py-2 bg-secondary/10 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Contractors</p>
                    <p className="text-sm font-semibold">{symbol}{contractorsList.reduce((sum, c) => sum + c.netPay + c.estFees, 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{contractorsList.length} workers</p>
                  </div>
                  <div className="px-3 py-2 bg-primary/10 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Employees</p>
                    <p className="text-sm font-semibold">{symbol}{employeesList.reduce((sum, c) => sum + c.netPay + c.estFees + (c.employerTaxes || 0), 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{employeesList.length} workers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Snoozed Workers Section */}
      {snoozedContractorsList.length > 0 && (
        <Card className="border-border/20 bg-muted/10">
          <CardContent className="p-4">
            <Collapsible open={showSnoozedSection} onOpenChange={setShowSnoozedSection}>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Circle className="h-3.5 w-3.5" />
                  Snoozed Workers ({snoozedContractorsList.length})
                </h4>
                {showSnoozedSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="space-y-2">
                  {snoozedContractorsList.map(contractor => (
                    <div key={contractor.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{contractor.name}</span>
                        <Badge variant="outline" className="text-[10px]">{contractor.country}</Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleUndoSnooze(contractor.id)}>
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* Bottom Summary */}
      <Card className="border-border/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Workers</p>
                <p className="text-lg font-bold">{filteredContractors.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Gross</p>
                <p className="text-lg font-bold">${totalGross.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employer Costs</p>
                <p className="text-lg font-bold">${totalEmployerCosts.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fronted Fees</p>
                <p className="text-lg font-bold">${totalFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Step 1 of 4 – Review FX</div>
        <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("exceptions")}>
          Next: Exceptions →
        </Button>
      </div>
    </div>
  );

  // Exceptions Step
  const renderExceptionsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Exceptions</h3>
        <Tabs value={exceptionGroupFilter} onValueChange={v => setExceptionGroupFilter(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">All ({exceptions.filter(e => !e.resolved && !e.snoozed && !e.ignored).length})</TabsTrigger>
            <TabsTrigger value="fixable" className="text-xs">Fixable in Payroll</TabsTrigger>
            <TabsTrigger value="non-fixable" className="text-xs">Requires External Fix</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Active Exceptions */}
      {activeExceptions.length === 0 ? (
        <Card className="border-accent-green-outline/30 bg-accent-green-fill/10">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-accent-green-text mx-auto mb-2" />
            <p className="text-sm font-semibold text-accent-green-text">All exceptions resolved!</p>
            <p className="text-xs text-muted-foreground mt-1">You can proceed to execution.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeExceptions
            .filter(exc => {
              if (exceptionGroupFilter === "fixable") return exc.canFixInPayroll;
              if (exceptionGroupFilter === "non-fixable") return !exc.canFixInPayroll;
              return true;
            })
            .map(exception => (
              <Card key={exception.id} className={cn(
                "border-border/20",
                exception.severity === "high" && "border-l-4 border-l-red-500",
                exception.severity === "medium" && "border-l-4 border-l-amber-500",
                exception.severity === "low" && "border-l-4 border-l-blue-500"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{exception.contractorName}</span>
                        {exception.contractorCountry && (
                          <Badge variant="outline" className="text-xs">{exception.contractorCountry}</Badge>
                        )}
                        <Badge variant="outline" className={cn("text-xs",
                          exception.isBlocking ? "bg-red-500/10 text-red-600 border-red-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        )}>
                          {exception.isBlocking ? "Blocking" : "Warning"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{exception.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exception.canFixInPayroll ? "Can be fixed in payroll" : "Requires external fix (profile/contract)"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {exception.isBlocking && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleOpenOverrideModal(exception)}>
                          Override
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSnoozeException(exception.id)}>
                        Snooze
                      </Button>
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleResolveException(exception.id)}>
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Snoozed Exceptions */}
      {snoozedExceptions.length > 0 && (
        <Card className="border-border/20 bg-muted/10">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Circle className="h-3.5 w-3.5" />
              Skipped to Next Cycle ({snoozedExceptions.length})
            </h4>
            <div className="space-y-2">
              {snoozedExceptions.map(exception => (
                <div key={exception.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{exception.contractorName}</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">Skipped</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Excluded from this payroll</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acknowledged Exceptions */}
      {acknowledgedExceptions.length > 0 && (
        <Card className="border-border/20 bg-accent-green-fill/5">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-accent-green-text mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Acknowledged & Proceeding ({acknowledgedExceptions.length})
            </h4>
            <div className="space-y-2">
              {acknowledgedExceptions.map(exception => (
                <div key={exception.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{exception.contractorName}</span>
                    <Badge variant="outline" className="text-[10px] bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30">Acknowledged</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("review-fx")}>
          ← Previous: Review
        </Button>
        <div className="text-xs text-muted-foreground">Step 2 of 4 – Exceptions</div>
        <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("execute")}>
          Next: Execute →
        </Button>
      </div>
    </div>
  );

  // Execute Step
  const renderExecuteStep = () => (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-border/20 bg-blue-500/5">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-600">
            You can run and approve payroll from here. If you prefer Fronted to execute on your behalf, contact your account manager.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground">Execute Payroll</h3>

      {/* Employment Type Selector */}
      <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Execute for:</span>
            <Select value={executeEmploymentType} onValueChange={v => setExecuteEmploymentType(v as any)}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="employees">Employees Only</SelectItem>
                <SelectItem value="contractors">Contractors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Warning if exceptions exist */}
      {activeExceptions.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Resolve exceptions before executing payroll</p>
                <p className="text-xs text-muted-foreground">{activeExceptions.length} unresolved exception(s) must be cleared first</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Summary */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Batch Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Payee Breakdown</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Contractors (COR)</span>
                    <span className="text-xs font-medium">{executeFilteredWorkers.filter(c => c.employmentType === "contractor").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Employees (EOR)</span>
                    <span className="text-xs font-medium">{executeFilteredWorkers.filter(c => c.employmentType === "employee").length}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">${executeFilteredWorkers.reduce((sum, c) => sum + c.netPay, 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Processing Time</p>
                <p className="text-2xl font-bold text-foreground">~2 min</p>
              </div>
            </div>
          </div>

          {!isExecuting && Object.keys(executionProgress).length === 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                <span className="text-muted-foreground">FX rates locked</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {allExceptionsResolved ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span className="text-muted-foreground">
                  {allExceptionsResolved ? "All exceptions resolved" : `${activeExceptions.length} exception(s) pending`}
                </span>
              </div>
            </div>
          )}

          {/* Execution Progress */}
          {(isExecuting || Object.keys(executionProgress).length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Processing Batch</h4>
                <Badge variant="outline" className="text-xs">
                  {Object.values(executionProgress).filter(s => s === "complete").length} / {executeFilteredWorkers.length}
                </Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {executeFilteredWorkers.map(contractor => {
                  const status = executionProgress[contractor.id] || "pending";
                  return (
                    <motion.div
                      key={contractor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        status === "complete" && "bg-accent-green-fill/10 border-accent-green-outline/20",
                        status === "failed" && "bg-red-500/10 border-red-500/30",
                        status === "processing" && "bg-blue-500/10 border-blue-500/20 animate-pulse",
                        status === "pending" && "bg-muted/20 border-border"
                      )}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background">
                        {status === "complete" && <CheckCircle2 className="h-4 w-4 text-accent-green-text" />}
                        {status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                        {status === "processing" && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                        {status === "pending" && <Circle className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{contractor.name}</p>
                        <p className="text-xs text-muted-foreground">{contractor.country} • {contractor.currency}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{contractor.employmentType}</Badge>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Execute Buttons - COMPANY ADMIN VERSION */}
          {!isExecuting && Object.keys(executionProgress).length === 0 && (
            <div className="flex items-center gap-3">
              <Button onClick={() => handleExecuteClick("all")} disabled={!allExceptionsResolved} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Execute All
              </Button>
              <Button variant="outline" onClick={() => handleExecuteClick("employees")} disabled={!allExceptionsResolved}>
                Employees Only
              </Button>
              <Button variant="outline" onClick={() => handleExecuteClick("contractors")} disabled={!allExceptionsResolved}>
                Contractors Only
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("exceptions")}>
          ← Previous: Exceptions
        </Button>
        <div className="text-xs text-muted-foreground">Step 3 of 4 – Execute</div>
        <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("track")}>
          Next: Track →
        </Button>
      </div>
    </div>
  );

  // Track & Reconcile Step
  const renderTrackStep = () => {
    const employees = filteredContractors.filter(c => c.employmentType === "employee");
    const contractors = filteredContractors.filter(c => c.employmentType === "contractor");
    const paidCount = filteredContractors.filter(c => getPaymentStatus(c.id) === "Paid").length;
    const pendingCount = filteredContractors.filter(c => getPaymentStatus(c.id) === "InTransit").length;
    const failedCount = filteredContractors.filter(c => getPaymentStatus(c.id) === "Failed").length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Track & Reconcile</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              Audit PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Employees</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                  <p className="text-xs text-muted-foreground">Posted to payroll system</p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Posted</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Contractors</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{contractors.length}</p>
                  <p className="text-xs text-muted-foreground">Sent for payment</p>
                </div>
                <Badge className={cn(
                  paidCount === filteredContractors.length 
                    ? "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}>
                  {paidCount === filteredContractors.length ? "All Paid" : `${pendingCount} Pending`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Details Table */}
        <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs value={workerTypeFilter} onValueChange={v => setWorkerTypeFilter(v as any)}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground">Payment Details</h4>
                <TabsList className="grid w-auto grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="employee">Employees</TabsTrigger>
                  <TabsTrigger value="contractor">Contractors</TabsTrigger>
                </TabsList>
              </div>

              <div className="overflow-x-auto">
                {(workerTypeFilter === "all" || workerTypeFilter === "employee") && employees.length > 0 && (
                  <div className="mb-6">
                    {workerTypeFilter === "all" && (
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-blue-600" />
                        <h5 className="text-sm font-semibold text-blue-600">Employees ({employees.length})</h5>
                      </div>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-500/5">
                          <TableHead className="text-xs font-medium">Employee</TableHead>
                          <TableHead className="text-xs font-medium text-right">Posted Amount</TableHead>
                          <TableHead className="text-xs font-medium text-center">Status</TableHead>
                          <TableHead className="text-xs font-medium">Reference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map(employee => (
                          <TableRow key={employee.id} className="hover:bg-blue-500/5">
                            <TableCell>
                              <span className="font-medium text-foreground">{employee.name}</span>
                              <p className="text-xs text-muted-foreground">{employee.country} • {employee.currency}</p>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{employee.currency} {employee.netPay.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Posted
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">PR-{employee.id}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {(workerTypeFilter === "all" || workerTypeFilter === "contractor") && contractors.length > 0 && (
                  <div>
                    {workerTypeFilter === "all" && (
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <h5 className="text-sm font-semibold text-primary">Contractors ({contractors.length})</h5>
                      </div>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary/5">
                          <TableHead className="text-xs font-medium">Contractor</TableHead>
                          <TableHead className="text-xs font-medium text-right">Payout Amount</TableHead>
                          <TableHead className="text-xs font-medium text-center">Payment Status</TableHead>
                          <TableHead className="text-xs font-medium">Provider Ref</TableHead>
                          <TableHead className="text-xs font-medium text-center">Receipt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractors.map(contractor => {
                          const status = getPaymentStatus(contractor.id);
                          return (
                            <TableRow key={contractor.id} className="hover:bg-primary/5">
                              <TableCell>
                                <span className="font-medium text-foreground">{contractor.name}</span>
                                <p className="text-xs text-muted-foreground">{contractor.country} • {contractor.currency}</p>
                              </TableCell>
                              <TableCell className="text-right font-semibold">{contractor.currency} {contractor.netPay.toLocaleString()}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={cn("text-[10px]",
                                  status === "Paid" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
                                  status === "InTransit" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
                                  status === "Failed" && "bg-red-500/10 text-red-600 border-red-500/30"
                                )}>
                                  {status === "Paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  {status === "InTransit" && <Clock className="h-3 w-3 mr-1" />}
                                  {status === "Failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">TXN-{contractor.id}</TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  <Receipt className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Navigation - COMPANY ADMIN VERSION: "Approve Payroll" instead of "Send to Client" */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("execute")}>
            ← Previous: Execute
          </Button>
          
          {!payrollApproved ? (
            <Button className="h-9 px-4 text-sm" onClick={handleApprovePayroll}>
              Approve Payroll
            </Button>
          ) : (
            <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Payroll Approved
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedCycle} onValueChange={v => setSelectedCycle(v as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="previous">October 2025 (Completed)</SelectItem>
            <SelectItem value="current">November 2025 (Active)</SelectItem>
            <SelectItem value="next">December 2025 (Upcoming)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs",
            currentCycleData.status === "completed" && "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30",
            currentCycleData.status === "active" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
            currentCycleData.status === "upcoming" && "bg-muted/30 text-muted-foreground border-border/30"
          )}>
            {currentCycleData.status === "completed" ? "Completed" : currentCycleData.status === "active" ? "Active" : "Upcoming"}
          </Badge>
        </div>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Salary Cost</p>
            <p className="text-2xl font-bold text-foreground">${currentCycleData.totalSalaryCost?.toLocaleString() || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Fronted Fees (Est.)</p>
            <p className="text-2xl font-bold text-foreground">${currentCycleData.frontedFees?.toLocaleString() || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Payroll Cost</p>
            <p className="text-2xl font-bold text-foreground">${currentCycleData.totalPayrollCost?.toLocaleString() || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Workers</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{filteredContractors.length}</p>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-[10px]">E: {employeeCount}</Badge>
                <Badge variant="outline" className="text-[10px]">C: {contractorCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Pills */}
      {currentCycleData.status !== "upcoming" && (
        <div className="flex items-center gap-3 overflow-x-auto py-2">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = getCurrentStepIndex() > index;
            const Icon = step.icon;
            const isDisabled = selectedCycle === "previous" && step.id !== "track";

            return (
              <TooltipProvider key={step.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (currentCycleData.status === "active" || (currentCycleData.status === "completed" && step.id === "track")) {
                          setCurrentStep(step.id as PayrollStep);
                        }
                      }}
                      disabled={isDisabled}
                      className={cn(
                        "group inline-flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all",
                        isActive && currentCycleData.status === "active" && "bg-primary/10 border-primary/20",
                        isCompleted && "bg-accent-green-fill/10 border-accent-green-outline/20",
                        !isActive && !isCompleted && currentCycleData.status === "active" && "bg-muted/20 border-border/50 hover:bg-muted/30",
                        isDisabled && "opacity-50 cursor-not-allowed bg-muted/10 border-border/30"
                      )}
                    >
                      <span className={cn(
                        "inline-flex items-center justify-center w-6 h-6 rounded-full",
                        isActive && "bg-primary/20",
                        isCompleted && "bg-accent-green-fill/30",
                        !isActive && !isCompleted && "bg-muted/30"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                        ) : (
                          <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                        )}
                      </span>
                      <span className={cn(
                        "text-sm font-medium",
                        isActive ? "text-primary" : isCompleted ? "text-accent-green-text" : "text-foreground"
                      )}>
                        {step.label}
                      </span>
                    </button>
                  </TooltipTrigger>
                  {isDisabled && (
                    <TooltipContent side="bottom">
                      <p className="text-xs">This step is read-only for completed cycles.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      {/* Step Content */}
      {currentCycleData.status !== "upcoming" ? (
        <motion.div
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      ) : (
        <Card className="border-border/20 bg-card/30">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">December Payroll Not Started</h4>
            <p className="text-sm text-muted-foreground">Data will appear once time or compensation details are submitted.</p>
          </CardContent>
        </Card>
      )}

      {/* Contractor Detail Drawer */}
      <Sheet open={contractorDrawerOpen} onOpenChange={setContractorDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedContractor && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selectedContractor.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn("text-xs",
                    selectedContractor.employmentType === "employee" 
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                      : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                  )}>
                    {selectedContractor.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{selectedContractor.country}</span>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Payment Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Payment Breakdown
                  </h4>
                  <Card className="border-border/20 bg-card/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Base Salary</span>
                        <span className="text-sm font-semibold">{selectedContractor.currency} {selectedContractor.baseSalary.toLocaleString()}</span>
                      </div>
                      {selectedContractor.employmentType === "employee" && selectedContractor.employerTaxes && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Employer Tax</span>
                          <span className="text-sm font-medium text-amber-600">+{selectedContractor.currency} {selectedContractor.employerTaxes.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fronted Fee</span>
                        <span className="text-sm font-medium text-amber-600">+{selectedContractor.currency} {selectedContractor.estFees.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Net Pay</span>
                        <span className="text-lg font-bold text-foreground">{selectedContractor.currency} {selectedContractor.netPay.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Worker Profile */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Worker Profile
                  </h4>
                  <Card className="border-border/20 bg-card/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedContractor.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Country</p>
                          <p className="font-medium">{selectedContractor.country}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Employment Type</p>
                          <p className="font-medium capitalize">{selectedContractor.employmentType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Currency</p>
                          <p className="font-medium">{selectedContractor.currency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-medium">{selectedContractor.status || "Active"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">FX Rate</p>
                          <p className="font-medium">{selectedContractor.fxRate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setContractorDrawerOpen(false)}>Close</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Country Rules Drawer */}
      <Sheet open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Country Rules</SheetTitle>
            <p className="text-sm text-muted-foreground">Based on Country Ruleset – managed by Fronted, read-only</p>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <Card className="border-border/20 bg-card/30">
              <CardContent className="p-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Philippines (PH)</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pay Cycle</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Bi-monthly (1st-15th, 16th-End)</span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Proration Method</span>
                    <span className="text-sm font-medium">Calendar days (21.67 days/month)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SSS Employer Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">9.5%</span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">13th Month Pay</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Mandatory (December)</span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/20 bg-card/30">
              <CardContent className="p-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Norway (NO)</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pay Cycle</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Monthly (end of month)</span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Employer Tax</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">14.1%</span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Country rules are derived from the Country Ruleset managed by Fronted. Contact your account manager to request changes.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setCountryRulesDrawerOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Override Exception Modal */}
      <AlertDialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override Blocking Exception</AlertDialogTitle>
            <AlertDialogDescription>
              {exceptionToOverride && (
                <div className="space-y-3 mt-3">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm font-medium text-foreground">{exceptionToOverride.contractorName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exceptionToOverride.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Justification (required)</Label>
                    <Textarea 
                      value={overrideJustification}
                      onChange={e => setOverrideJustification(e.target.value)}
                      placeholder="Explain why this exception should be overridden..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverride} disabled={!overrideJustification.trim()}>
              Confirm Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Execution Confirmation Dialog */}
      <AlertDialog open={executionConfirmOpen} onOpenChange={setExecutionConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payroll Execution</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>You are about to execute payroll for:</div>
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                {(pendingExecutionCohort === "all" || pendingExecutionCohort === "employees") && (
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      Employees: {executeFilteredWorkers.filter(c => c.employmentType === "employee").length} workers
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Employees will be posted to the payroll system.
                    </div>
                  </div>
                )}
                {(pendingExecutionCohort === "all" || pendingExecutionCohort === "contractors") && (
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">
                      Contractors: {executeFilteredWorkers.filter(c => c.employmentType === "contractor").length} workers
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Contractors will be sent for payment via the payout system.
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm">Do you want to proceed with this execution?</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExecution}>Execute now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default F6v2_PayrollClone;
