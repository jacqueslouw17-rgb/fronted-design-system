/**
 * Flow 6 v2 - Payroll Tab (Company Admin Self-Run)
 * 
 * 1:1 Clone of Flow 7 – Fronted Admin Payroll v1
 * Adapted for Company Admin with minimal CTA changes:
 * - "Send to Client" → "Approve Payroll"
 * - Hide "Proxy Approve" (Fronted-only)
 * 
 * Company Admin info banner instead of "Managed by Fronted" banner.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DollarSign, 
  Building2, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Circle,
  Settings,
  Lock,
  Info,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  Edit2,
  Users,
  AlertTriangle,
  Calculator,
  FileText,
  MoreVertical,
  Unlock,
  X,
  XCircle,
  Eye,
  Receipt,
  Timer,
  Filter,
  ArrowRight,
  MessageSquare,
  Play,
  TrendingUp,
  Download,
  Search,
  Briefcase,
  Check,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// Payroll step type
type PayrollStep = "review" | "exceptions" | "execute" | "track";

const steps = [
  { id: "review" as const, label: "Review & FX", icon: DollarSign },
  { id: "exceptions" as const, label: "Exceptions", icon: AlertTriangle },
  { id: "execute" as const, label: "Execute", icon: Play },
  { id: "track" as const, label: "Track & Reconcile", icon: TrendingUp }
];

// Types
interface ContractorPaymentV2 {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  employmentType: "employee" | "contractor";
  baseSalary: number;
  netPay: number;
  estFees: number;
  fxRate: number;
  eta: string;
  status: "Active" | "Snoozed" | "Terminated";
  role?: string;
  employerTaxes?: number;
  compensationType?: "Monthly" | "Hourly";
  hourlyRate?: number;
  hoursWorked?: number;
}

interface PayrollExceptionV2 {
  id: string;
  contractorId: string;
  contractorName: string;
  contractorCountry?: string;
  type: string;
  description: string;
  severity: "high" | "medium" | "low";
  resolved: boolean;
  snoozed: boolean;
  canFixInPayroll: boolean;
  isBlocking: boolean;
  overrideInfo?: {
    overriddenBy: string;
    overriddenAt: string;
    justification: string;
  };
}

interface CountryRuleV2 {
  id: string;
  label: string;
  value: string;
  clientEditable: boolean;
  category: "pay" | "contributions" | "constraints";
}

// Mock data - cloned from Flow 7 structure
const contractorsByCurrencyV2: Record<string, ContractorPaymentV2[]> = {
  PHP: [
    {
      id: "1",
      name: "Maria Santos",
      country: "Philippines",
      countryCode: "PH",
      baseSalary: 85000,
      netPay: 72500,
      currency: "PHP",
      estFees: 850,
      fxRate: 56.2,
      eta: "Nov 30",
      employmentType: "employee",
      employerTaxes: 12750,
      status: "Active",
      role: "Senior Backend Engineer"
    },
    {
      id: "2",
      name: "Jose Reyes",
      country: "Philippines",
      countryCode: "PH",
      baseSalary: 65000,
      netPay: 65000,
      currency: "PHP",
      estFees: 750,
      fxRate: 56.2,
      eta: "Nov 30",
      employmentType: "contractor",
      status: "Active",
      role: "DevOps Engineer"
    }
  ],
  SGD: [
    {
      id: "3",
      name: "John Chen",
      country: "Singapore",
      countryCode: "SG",
      baseSalary: 6500,
      netPay: 5850,
      currency: "SGD",
      estFees: 65,
      fxRate: 1.35,
      eta: "Nov 30",
      employmentType: "employee",
      employerTaxes: 1105,
      status: "Active",
      role: "Product Designer"
    }
  ],
  GBP: [
    {
      id: "4",
      name: "Sarah Williams",
      country: "United Kingdom",
      countryCode: "GB",
      baseSalary: 4800,
      netPay: 4800,
      currency: "GBP",
      estFees: 48,
      fxRate: 0.79,
      eta: "Nov 30",
      employmentType: "contractor",
      status: "Active",
      role: "Frontend Developer"
    }
  ]
};

const initialExceptionsV2: PayrollExceptionV2[] = [
  {
    id: "exc-1",
    contractorId: "2",
    contractorName: "Jose Reyes",
    contractorCountry: "Philippines",
    type: "missing-bank",
    description: "Bank account details incomplete – cannot process payment",
    severity: "high",
    resolved: false,
    snoozed: false,
    canFixInPayroll: true,
    isBlocking: true
  },
  {
    id: "exc-2",
    contractorId: "4",
    contractorName: "Sarah Williams",
    contractorCountry: "United Kingdom",
    type: "fx-mismatch",
    description: "Invoice currency (USD) differs from contract currency (GBP)",
    severity: "medium",
    resolved: false,
    snoozed: false,
    canFixInPayroll: false,
    isBlocking: false
  }
];

const countryRulesConfigV2: Record<string, CountryRuleV2[]> = {
  PH: [
    { id: "r1", label: "Pay Cycle", value: "Bi-monthly (1st-15th, 16th-End)", clientEditable: false, category: "pay" },
    { id: "r2", label: "Proration Method", value: "Calendar days (21.67 days/month)", clientEditable: true, category: "pay" },
    { id: "r3", label: "SSS Employer Rate", value: "9.5%", clientEditable: false, category: "contributions" },
    { id: "r4", label: "PhilHealth Rate", value: "5% (split)", clientEditable: false, category: "contributions" },
    { id: "r5", label: "Pag-IBIG", value: "₱100 fixed", clientEditable: false, category: "contributions" },
    { id: "r6", label: "13th Month Pay", value: "Mandatory (December)", clientEditable: false, category: "constraints" },
    { id: "r7", label: "Overtime Rate", value: "125% first 2hrs, 130% after", clientEditable: true, category: "constraints" },
  ],
  SG: [
    { id: "r1", label: "Pay Cycle", value: "Monthly (end of month)", clientEditable: false, category: "pay" },
    { id: "r2", label: "Proration Method", value: "Working days", clientEditable: true, category: "pay" },
    { id: "r3", label: "CPF Employer Rate", value: "17%", clientEditable: false, category: "contributions" },
    { id: "r4", label: "CPF Employee Rate", value: "20%", clientEditable: false, category: "contributions" },
  ],
  GB: [
    { id: "r1", label: "Pay Cycle", value: "Monthly", clientEditable: false, category: "pay" },
    { id: "r2", label: "Proration Method", value: "Working days", clientEditable: true, category: "pay" },
    { id: "r3", label: "National Insurance", value: "13.8% employer", clientEditable: false, category: "contributions" },
  ]
};

export const F6v2_PayrollTab = () => {
  // Current payroll step
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review");
  
  // Cycle selection
  const [selectedCycle, setSelectedCycle] = useState<"previous" | "current" | "next">("current");
  
  // FX state
  const [fxRatesLocked, setFxRatesLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  
  // Workers state
  const [contractors] = useState(() => Object.values(contractorsByCurrencyV2).flat());
  const [snoozedWorkers, setSnoozedWorkers] = useState<string[]>([]);
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<"all" | "employee" | "contractor">("all");
  
  // Exception state
  const [exceptions, setExceptions] = useState<PayrollExceptionV2[]>(initialExceptionsV2);
  const [exceptionGroupFilter, setExceptionGroupFilter] = useState<"all" | "fixable" | "non-fixable">("all");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [exceptionToOverride, setExceptionToOverride] = useState<PayrollExceptionV2 | null>(null);
  const [overrideJustification, setOverrideJustification] = useState("");
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<Record<string, "pending" | "processing" | "complete" | "failed">>({});
  const [executionConfirmOpen, setExecutionConfirmOpen] = useState(false);
  const [pendingExecutionCohort, setPendingExecutionCohort] = useState<"all" | "employees" | "contractors" | null>(null);
  
  // Track & Reconcile state
  const [payrollApproved, setPayrollApproved] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "InTransit" | "Failed">("all");
  const [workerTypeFilter, setWorkerTypeFilter] = useState<"all" | "employee" | "contractor">("all");
  
  // Country Rules drawer
  const [countryRulesDrawerOpen, setCountryRulesDrawerOpen] = useState(false);
  const [selectedCountryForRules, setSelectedCountryForRules] = useState<string>("PH");
  const [ruleOverrides, setRuleOverrides] = useState<Record<string, Record<string, string>>>({});
  const [pendingRuleChanges, setPendingRuleChanges] = useState<Record<string, string>>({});
  
  // Worker detail drawer
  const [selectedWorker, setSelectedWorker] = useState<ContractorPaymentV2 | null>(null);
  const [workerDrawerOpen, setWorkerDrawerOpen] = useState(false);

  // Computed values
  const allContractors = contractors.filter(c => !snoozedWorkers.includes(c.id));
  const filteredContractors = allContractors.filter(c => {
    if (employmentTypeFilter === "all") return true;
    return c.employmentType === employmentTypeFilter;
  });
  
  const employeeCount = allContractors.filter(c => c.employmentType === "employee").length;
  const contractorCount = allContractors.filter(c => c.employmentType === "contractor").length;
  const totalPayroll = allContractors.reduce((sum, c) => sum + c.netPay, 0);
  const totalFees = allContractors.reduce((sum, c) => sum + c.estFees, 0);
  
  const activeExceptions = exceptions.filter(exc => !exc.resolved && !exc.snoozed);
  const blockingExceptions = activeExceptions.filter(exc => exc.isBlocking && !exc.overrideInfo);
  const snoozedExceptions = exceptions.filter(exc => exc.snoozed);

  const cycleData = {
    previous: { label: "October 2025", status: "completed" as const, payoutDate: "Oct 31, 2025" },
    current: { label: "November 2025", status: "active" as const, payoutDate: "Nov 30, 2025" },
    next: { label: "December 2025", status: "upcoming" as const, payoutDate: "Dec 31, 2025" }
  };
  const currentCycle = cycleData[selectedCycle];

  // Handlers
  const handleLockFxRates = () => {
    setFxRatesLocked(true);
    setLockedAt(new Date().toLocaleTimeString());
    toast.success("FX rates locked for this payroll run");
  };

  const handleSnoozeWorker = (workerId: string) => {
    setSnoozedWorkers(prev => [...prev, workerId]);
    toast.success("Worker snoozed for this cycle");
  };

  const handleUnsnooozeWorker = (workerId: string) => {
    setSnoozedWorkers(prev => prev.filter(id => id !== workerId));
    toast.success("Worker unsnooozed");
  };

  const handleResolveException = (exceptionId: string) => {
    setExceptions(prev => prev.map(exc => 
      exc.id === exceptionId ? { ...exc, resolved: true } : exc
    ));
    toast.success("Exception resolved");
  };

  const handleSnoozeException = (exceptionId: string) => {
    setExceptions(prev => prev.map(exc => 
      exc.id === exceptionId ? { ...exc, snoozed: true } : exc
    ));
    toast.success("Exception snoozed for this cycle");
  };

  const handleOpenOverrideModal = (exception: PayrollExceptionV2) => {
    setExceptionToOverride(exception);
    setOverrideJustification("");
    setOverrideModalOpen(true);
  };

  const handleConfirmOverride = () => {
    if (!exceptionToOverride || !overrideJustification.trim()) {
      toast.error("Please provide a justification");
      return;
    }
    
    setExceptions(prev => prev.map(exc => 
      exc.id === exceptionToOverride.id 
        ? { 
            ...exc, 
            overrideInfo: {
              overriddenBy: "Company Admin",
              overriddenAt: new Date().toISOString(),
              justification: overrideJustification
            }
          }
        : exc
    ));
    
    toast.success(`Exception overridden for ${exceptionToOverride.contractorName}`);
    setOverrideModalOpen(false);
    setExceptionToOverride(null);
    setOverrideJustification("");
  };

  const handleOpenWorkerDrawer = (worker: ContractorPaymentV2) => {
    setSelectedWorker(worker);
    setWorkerDrawerOpen(true);
  };

  const handleExecuteClick = (cohort: "all" | "employees" | "contractors") => {
    setPendingExecutionCohort(cohort);
    setExecutionConfirmOpen(true);
  };

  const handleConfirmExecution = async () => {
    if (!pendingExecutionCohort) return;
    
    setExecutionConfirmOpen(false);
    setIsExecuting(true);
    
    let workersToExecute = filteredContractors;
    if (pendingExecutionCohort === "employees") {
      workersToExecute = filteredContractors.filter(c => c.employmentType === "employee");
    } else if (pendingExecutionCohort === "contractors") {
      workersToExecute = filteredContractors.filter(c => c.employmentType === "contractor");
    }
    
    const initialProgress: Record<string, "pending" | "processing" | "complete" | "failed"> = {};
    workersToExecute.forEach(c => {
      initialProgress[c.id] = "pending";
    });
    setExecutionProgress(initialProgress);
    
    for (const contractor of workersToExecute) {
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "processing" }));
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      const isFailed = Math.random() < 0.05;
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: isFailed ? "failed" : "complete" }));
    }
    
    setIsExecuting(false);
    
    const successCount = workersToExecute.filter(w => executionProgress[w.id] !== "failed").length;
    toast.success(`Payroll executed for ${successCount} workers`);
    setPendingExecutionCohort(null);
  };

  const handleApprovePayroll = () => {
    setPayrollApproved(true);
    toast.success("Payroll approved! Payments will execute on " + currentCycle.payoutDate);
  };

  const handleSaveRuleOverride = () => {
    if (Object.keys(pendingRuleChanges).length === 0) return;
    
    setRuleOverrides(prev => ({
      ...prev,
      [selectedCountryForRules]: {
        ...prev[selectedCountryForRules],
        ...pendingRuleChanges
      }
    }));
    
    setPendingRuleChanges({});
    setCountryRulesDrawerOpen(false);
    toast.success("Rule overrides saved. Recalculating payroll...");
  };

  const getPaymentStatus = (contractorId: string): "Paid" | "InTransit" | "Failed" => {
    if (currentCycle.status === "completed" || payrollApproved) return "Paid";
    const progress = executionProgress[contractorId];
    if (progress === "complete") return "Paid";
    if (progress === "failed") return "Failed";
    return "InTransit";
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "review":
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

  // Review Step - FX and Worker Review
  const renderReviewStep = () => (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">Review & FX</h3>
          {selectedCycle === "previous" && (
            <Badge variant="outline" className="text-xs bg-muted/30">Read-Only Mode</Badge>
          )}
          {fxRatesLocked && lockedAt && (
            <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30 gap-1.5">
              <Lock className="h-3 w-3" />
              Locked at {lockedAt}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!fxRatesLocked && selectedCycle !== "previous" && (
            <Button variant="outline" size="sm" onClick={handleLockFxRates} className="gap-2">
              <Lock className="h-3.5 w-3.5" />
              Lock FX Rates
            </Button>
          )}
        </div>
      </div>

      {/* Employment Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter:</span>
        <div className="flex gap-1">
          {["all", "employee", "contractor"].map(type => (
            <Button
              key={type}
              variant={employmentTypeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setEmploymentTypeFilter(type as typeof employmentTypeFilter)}
              className="h-7 text-xs capitalize"
            >
              {type === "all" ? "All" : type === "employee" ? "Employees" : "Contractors"}
            </Button>
          ))}
        </div>
      </div>

      {/* Currency Groups */}
      {Object.entries(contractorsByCurrencyV2).map(([currency, workers]) => {
        const currencyWorkers = workers.filter(w => 
          !snoozedWorkers.includes(w.id) &&
          (employmentTypeFilter === "all" || w.employmentType === employmentTypeFilter)
        );
        
        if (currencyWorkers.length === 0) return null;
        
        const employees = currencyWorkers.filter(w => w.employmentType === "employee");
        const contractorsInCurrency = currencyWorkers.filter(w => w.employmentType === "contractor");
        const currencyTotal = currencyWorkers.reduce((sum, w) => sum + w.netPay, 0);
        
        return (
          <Card key={currency} className="border-border/20 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-4">
              {/* Currency Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-semibold">{currency}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Employees: {employees.length}, Contractors: {contractorsInCurrency.length}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{currency} {currencyTotal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Net Pay</p>
                </div>
              </div>

              {/* Workers Table */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="w-[200px]">Worker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Fees</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencyWorkers.map(worker => (
                    <TableRow 
                      key={worker.id} 
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleOpenWorkerDrawer(worker)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{worker.name}</p>
                            <p className="text-xs text-muted-foreground">{worker.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          worker.employmentType === "employee" 
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                        )}>
                          {worker.employmentType === "employee" ? "Employee" : "Contractor"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{worker.country}</TableCell>
                      <TableCell className="text-right text-sm">{currency} {worker.baseSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{currency} {worker.estFees}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{currency} {worker.netPay.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{worker.eta}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSnoozeWorker(worker.id);
                          }}
                        >
                          Snooze
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* Snoozed Workers Section */}
      {snoozedWorkers.length > 0 && (
        <Collapsible>
          <Card className="border-border/20 bg-muted/20">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-muted/50">Snoozed</Badge>
                    <span className="text-sm text-muted-foreground">{snoozedWorkers.length} workers excluded from this run</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-2">
                {contractors.filter(c => snoozedWorkers.includes(c.id)).map(worker => (
                  <div key={worker.id} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                    <span className="text-sm text-muted-foreground">{worker.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleUnsnooozeWorker(worker.id)}>
                      Unsnoooze
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredContractors.length}</span> workers ready for payroll
        </div>
        <Button onClick={() => setCurrentStep("exceptions")} className="gap-2">
          Continue to Exceptions
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Exceptions Step
  const renderExceptionsStep = () => {
    const filteredExceptions = activeExceptions.filter(exc => {
      if (exceptionGroupFilter === "all") return true;
      if (exceptionGroupFilter === "fixable") return exc.canFixInPayroll;
      return !exc.canFixInPayroll;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Exceptions</h3>
            {blockingExceptions.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {blockingExceptions.length} blocking
              </Badge>
            )}
          </div>
        </div>

        {/* Exception Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show:</span>
          <div className="flex gap-1">
            {[
              { value: "all", label: "All" },
              { value: "fixable", label: "Fixable Here" },
              { value: "non-fixable", label: "Requires External Fix" }
            ].map(filter => (
              <Button
                key={filter.value}
                variant={exceptionGroupFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setExceptionGroupFilter(filter.value as typeof exceptionGroupFilter)}
                className="h-7 text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* All Resolved State */}
        {activeExceptions.length === 0 && (
          <Card className="border-accent-green-outline/30 bg-accent-green-fill/10">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-accent-green-text mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">All Clear!</h4>
              <p className="text-sm text-muted-foreground mb-4">No exceptions to review. You can proceed to execution.</p>
              <Button onClick={() => setCurrentStep("execute")}>Continue to Execute</Button>
            </CardContent>
          </Card>
        )}

        {/* Exception List */}
        {filteredExceptions.length > 0 && (
          <div className="space-y-3">
            {filteredExceptions.map(exception => (
              <Card 
                key={exception.id} 
                className={cn(
                  "border-border/20 bg-card/30",
                  exception.isBlocking && !exception.overrideInfo && "border-destructive/30 bg-destructive/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        exception.severity === "high" ? "bg-destructive/20 text-destructive" :
                        exception.severity === "medium" ? "bg-amber-500/20 text-amber-600" :
                        "bg-blue-500/20 text-blue-600"
                      )}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{exception.contractorName}</span>
                          {exception.contractorCountry && (
                            <span className="text-xs text-muted-foreground">• {exception.contractorCountry}</span>
                          )}
                          {exception.isBlocking && !exception.overrideInfo && (
                            <Badge variant="destructive" className="text-xs">Blocking</Badge>
                          )}
                          {exception.overrideInfo && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                              Overridden
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{exception.description}</p>
                        {exception.overrideInfo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Overridden by {exception.overrideInfo.overriddenBy}: "{exception.overrideInfo.justification}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!exception.overrideInfo && (
                        <>
                          {exception.canFixInPayroll ? (
                            <Button variant="outline" size="sm" onClick={() => handleResolveException(exception.id)}>
                              Fix Now
                            </Button>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" disabled>
                                    Fix Externally
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>This requires changes in worker profile or contract</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleSnoozeException(exception.id)}>
                            Snooze
                          </Button>
                          {exception.isBlocking && (
                            <Button variant="ghost" size="sm" onClick={() => handleOpenOverrideModal(exception)}>
                              Override
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Snoozed Exceptions */}
        {snoozedExceptions.length > 0 && (
          <Collapsible>
            <Card className="border-border/20 bg-muted/20">
              <CollapsibleTrigger asChild>
                <CardContent className="p-4 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{snoozedExceptions.length} snoozed exceptions</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
            </Card>
          </Collapsible>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep("review")}>
            Back to Review
          </Button>
          <Button 
            onClick={() => setCurrentStep("execute")} 
            disabled={blockingExceptions.length > 0}
            className="gap-2"
          >
            Continue to Execute
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Execute Step
  const renderExecuteStep = () => {
    const employees = filteredContractors.filter(c => c.employmentType === "employee");
    const contractorsOnly = filteredContractors.filter(c => c.employmentType === "contractor");
    const employeeTotal = employees.reduce((sum, c) => sum + c.netPay, 0);
    const contractorTotal = contractorsOnly.reduce((sum, c) => sum + c.netPay, 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Execute Payroll</h3>
          {isExecuting && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-2">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Processing...
            </Badge>
          )}
        </div>

        {/* Cohort Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employees Cohort */}
          <Card className="border-border/20 bg-card/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-foreground">Employees</h4>
                <Badge variant="outline" className="ml-auto">{employees.length}</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                ${employeeTotal.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mb-4">Will be posted to payroll system</p>
              <Button 
                onClick={() => handleExecuteClick("employees")}
                disabled={isExecuting || employees.length === 0}
                className="w-full"
                variant="outline"
              >
                Execute Employees
              </Button>
            </CardContent>
          </Card>

          {/* Contractors Cohort */}
          <Card className="border-border/20 bg-card/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-foreground">Contractors</h4>
                <Badge variant="outline" className="ml-auto">{contractorsOnly.length}</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                ${contractorTotal.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mb-4">Will be sent via payout system</p>
              <Button 
                onClick={() => handleExecuteClick("contractors")}
                disabled={isExecuting || contractorsOnly.length === 0}
                className="w-full"
                variant="outline"
              >
                Execute Contractors
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Execute All Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => handleExecuteClick("all")}
            disabled={isExecuting || filteredContractors.length === 0}
            size="lg"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Execute All ({filteredContractors.length} workers)
          </Button>
        </div>

        {/* Execution Progress */}
        {Object.keys(executionProgress).length > 0 && (
          <Card className="border-border/20 bg-card/30">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-3">Execution Progress</h4>
              <div className="space-y-2">
                {filteredContractors.map(worker => {
                  const status = executionProgress[worker.id];
                  if (!status) return null;
                  
                  return (
                    <div key={worker.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                      <div className="flex items-center gap-2">
                        {status === "pending" && <Circle className="h-4 w-4 text-muted-foreground" />}
                        {status === "processing" && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                        {status === "complete" && <CheckCircle2 className="h-4 w-4 text-accent-green-text" />}
                        {status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm">{worker.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {worker.employmentType === "employee" ? "Employee" : "Contractor"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{status}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep("exceptions")}>
            Back to Exceptions
          </Button>
          <Button 
            onClick={() => setCurrentStep("track")}
            className="gap-2"
          >
            Continue to Track
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Track & Reconcile Step
  const renderTrackStep = () => {
    const trackFilteredWorkers = filteredContractors.filter(c => {
      const status = getPaymentStatus(c.id);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesType = workerTypeFilter === "all" || c.employmentType === workerTypeFilter;
      return matchesStatus && matchesType;
    });

    const paidCount = filteredContractors.filter(c => getPaymentStatus(c.id) === "Paid").length;
    const inTransitCount = filteredContractors.filter(c => getPaymentStatus(c.id) === "InTransit").length;
    const failedCount = filteredContractors.filter(c => getPaymentStatus(c.id) === "Failed").length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Track & Reconcile</h3>
          {payrollApproved && (
            <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/20 bg-card/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent-green-text">{paidCount}</p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card className="border-border/20 bg-card/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{inTransitCount}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          <Card className="border-border/20 bg-card/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select value={statusFilter} onValueChange={(v: typeof statusFilter) => setStatusFilter(v)}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="InTransit">In Transit</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Type:</span>
            <Select value={workerTypeFilter} onValueChange={(v: typeof workerTypeFilter) => setWorkerTypeFilter(v)}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
                <SelectItem value="contractor">Contractors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Workers Table */}
        <Card className="border-border/20 bg-card/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead>Worker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackFilteredWorkers.map(worker => {
                  const status = getPaymentStatus(worker.id);
                  return (
                    <TableRow key={worker.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-sm">{worker.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          worker.employmentType === "employee" 
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                        )}>
                          {worker.employmentType === "employee" ? "Employee" : "Contractor"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{worker.country}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {worker.currency} {worker.netPay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          status === "Paid" && "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30",
                          status === "InTransit" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                          status === "Failed" && "bg-destructive/10 text-destructive border-destructive/30"
                        )}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {status === "Paid" && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer Actions - Company Admin: Approve Payroll (not "Send to Client") */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep("execute")}>
            Back to Execute
          </Button>
          {!payrollApproved && (
            <Button onClick={handleApprovePayroll} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approve Payroll
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Company Admin Info Banner */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Self-Service Payroll</p>
                <p className="text-xs text-muted-foreground">
                  You can run and approve payroll from here. If you prefer Fronted to execute on your behalf, contact your account manager.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Overview Card */}
        <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-foreground">Payroll Overview</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-medium px-2.5 py-0.5",
                      currentCycle.status === "completed" && "bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline",
                      currentCycle.status === "active" && "bg-blue-500/20 text-blue-600 border-blue-500/40",
                      currentCycle.status === "upcoming" && "bg-amber-500/20 text-amber-600 border-amber-500/40"
                    )}
                  >
                    {currentCycle.status === "completed" ? "Completed" : currentCycle.status === "active" ? "In Progress" : "Upcoming"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Pay Period</p>
                    <p className="text-sm font-medium text-foreground">{currentCycle.label}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Primary Currency</p>
                    <p className="text-sm font-medium text-foreground">PHP (multi-currency)</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Workers Included</p>
                    <p className="text-sm font-medium text-foreground">
                      Employees: {employeeCount}, Contractors: {contractorCount}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Run Status</p>
                    <p className="text-sm font-medium text-foreground">
                      {payrollApproved ? "Approved" : currentStep === "review" ? "Draft" : currentStep === "execute" ? "Ready to Execute" : "In Review"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select 
                  value={selectedCycle} 
                  onValueChange={(value: "previous" | "current" | "next") => setSelectedCycle(value)}
                >
                  <SelectTrigger className="w-[180px] h-8 text-xs rounded-full border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous">October 2025</SelectItem>
                    <SelectItem value="current">November 2025 (Current)</SelectItem>
                    <SelectItem value="next">December 2025</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCountryRulesDrawerOpen(true)} 
                  className="h-8 px-3 gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Country Rules</span>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Salary Cost</p>
                </div>
                <p className="text-xl font-semibold text-foreground">${totalPayroll.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Fronted Fees (Est.)</p>
                </div>
                <p className="text-xl font-semibold text-foreground">${totalFees.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Payroll Cost</p>
                </div>
                <p className="text-xl font-semibold text-foreground">${(totalPayroll + totalFees).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Next Payroll Run</p>
                </div>
                <p className="text-xl font-semibold text-foreground">{currentCycle.payoutDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Pills - matching Flow 7 pattern */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isPast = steps.findIndex(s => s.id === currentStep) > index;
            const Icon = step.icon;
            
            return (
              <Button
                key={step.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "rounded-full px-4 gap-2",
                  isPast && !isActive && "bg-accent-green-fill/10 border-accent-green-outline/30 text-accent-green-text"
                )}
              >
                {isPast && !isActive ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {step.label}
              </Button>
            );
          })}
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </div>

      {/* Country Rules Drawer - with read-only/editable support */}
      <Sheet open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Country Rules
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Some rules can be overridden for this run only. Locked rules are managed by Fronted.
            </p>
          </SheetHeader>

          <div className="space-y-6">
            <Select 
              value={selectedCountryForRules} 
              onValueChange={setSelectedCountryForRules}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
              </SelectContent>
            </Select>

            <Separator />

            {/* Rules by Category */}
            {["pay", "contributions", "constraints"].map(category => {
              const rules = countryRulesConfigV2[selectedCountryForRules]?.filter(r => r.category === category) || [];
              if (rules.length === 0) return null;
              
              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground capitalize">
                    {category === "pay" ? "Pay & Proration" : category === "contributions" ? "Statutory Contributions" : "Constraints & Notes"}
                  </h4>
                  <div className="space-y-2">
                    {rules.map(rule => {
                      const overrideValue = ruleOverrides[selectedCountryForRules]?.[rule.id] || pendingRuleChanges[rule.id];
                      const displayValue = overrideValue || rule.value;
                      
                      return (
                        <div 
                          key={rule.id} 
                          className={cn(
                            "p-3 rounded-md border",
                            rule.clientEditable 
                              ? "bg-background border-border" 
                              : "bg-muted/30 border-border/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {!rule.clientEditable && <Lock className="h-3 w-3 text-muted-foreground" />}
                                {rule.clientEditable && <Unlock className="h-3 w-3 text-primary" />}
                                <span className="text-xs font-medium text-foreground">{rule.label}</span>
                              </div>
                              {rule.clientEditable ? (
                                <Input
                                  value={pendingRuleChanges[rule.id] ?? displayValue}
                                  onChange={(e) => setPendingRuleChanges(prev => ({
                                    ...prev,
                                    [rule.id]: e.target.value
                                  }))}
                                  className="h-8 text-xs mt-1"
                                />
                              ) : (
                                <p className="text-xs text-muted-foreground">{displayValue}</p>
                              )}
                            </div>
                          </div>
                          {overrideValue && (
                            <Badge variant="outline" className="mt-2 text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                              Overridden for this run
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {Object.keys(pendingRuleChanges).length > 0 && (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-600">This affects calculations in this run only.</p>
                    <p className="text-xs text-muted-foreground">Baseline rules remain unchanged.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setPendingRuleChanges({});
              setCountryRulesDrawerOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRuleOverride}
              disabled={Object.keys(pendingRuleChanges).length === 0}
            >
              Save & Recompute
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Worker Detail Drawer */}
      <Sheet open={workerDrawerOpen} onOpenChange={setWorkerDrawerOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          {selectedWorker && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                    {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <SheetTitle>{selectedWorker.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedWorker.role}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Employment Type</p>
                    <p className="text-sm font-medium capitalize">{selectedWorker.employmentType}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="text-sm font-medium">{selectedWorker.country}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Base Salary</p>
                    <p className="text-sm font-medium">{selectedWorker.currency} {selectedWorker.baseSalary.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">Net Pay</p>
                    <p className="text-sm font-medium">{selectedWorker.currency} {selectedWorker.netPay.toLocaleString()}</p>
                  </div>
                </div>

                <Separator />

                {/* Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Pay Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-md bg-accent-green-fill/10">
                      <span className="text-sm">Gross Earnings</span>
                      <span className="text-sm font-medium">{selectedWorker.currency} {selectedWorker.baseSalary.toLocaleString()}</span>
                    </div>
                    {selectedWorker.employmentType === "employee" && (
                      <>
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Deductions (Statutory)</span>
                          </div>
                          <span className="text-sm text-destructive">
                            -{selectedWorker.currency} {(selectedWorker.baseSalary - selectedWorker.netPay).toLocaleString()}
                          </span>
                        </div>
                        {selectedWorker.employerTaxes && (
                          <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Employer Contributions</span>
                            </div>
                            <span className="text-sm">{selectedWorker.currency} {selectedWorker.employerTaxes.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between p-2 rounded-md bg-primary/10">
                      <span className="text-sm font-semibold">Net Pay</span>
                      <span className="text-sm font-bold">{selectedWorker.currency} {selectedWorker.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setWorkerDrawerOpen(false)}>
                  Close
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Override Exception Modal */}
      <AlertDialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Override Blocking Exception
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to override a blocking exception for <span className="font-semibold">{exceptionToOverride?.contractorName}</span>. 
              This requires a justification for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive">{exceptionToOverride?.type}</p>
              <p className="text-xs text-muted-foreground">{exceptionToOverride?.description}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Justification (required)</Label>
              <Textarea
                value={overrideJustification}
                onChange={(e) => setOverrideJustification(e.target.value)}
                placeholder="Explain why this exception is being overridden..."
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExceptionToOverride(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmOverride}
              disabled={!overrideJustification.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
            <AlertDialogDescription>
              You are about to execute payroll for {
                pendingExecutionCohort === "all" 
                  ? `all ${filteredContractors.length} workers`
                  : pendingExecutionCohort === "employees"
                    ? `${filteredContractors.filter(c => c.employmentType === "employee").length} employees`
                    : `${filteredContractors.filter(c => c.employmentType === "contractor").length} contractors`
              }.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="p-3 rounded-md bg-muted/30 space-y-2 text-sm">
              {(pendingExecutionCohort === "all" || pendingExecutionCohort === "employees") && (
                <p className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span>Employees will be posted to the payroll system</span>
                </p>
              )}
              {(pendingExecutionCohort === "all" || pendingExecutionCohort === "contractors") && (
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Contractors will be sent for payment via payout system</span>
                </p>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExecution}>
              Execute Payroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
