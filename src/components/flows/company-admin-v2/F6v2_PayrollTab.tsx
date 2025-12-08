/**
 * Flow 6 v2 - Payroll Tab
 * 
 * This is a WRAPPER component that embeds the exact same payroll UI from Flow 7.
 * The PayrollBatch page is reused directly but rendered within the Flow 6 context.
 * 
 * Only minimal CTA changes are applied:
 * - "Send to Client" → "Approve Payroll"  
 * - Hide "Proxy (Fronted only)" button
 * 
 * This ensures 100% design parity with Flow 7 Fronted Admin Payroll v1.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import CountryRulesDrawer from "@/components/payroll/CountryRulesDrawer";
import EmployeePayrollDrawer from "@/components/payroll/EmployeePayrollDrawer";
import LeaveDetailsDrawer from "@/components/payroll/LeaveDetailsDrawer";
import { OverrideExceptionModal } from "@/components/payroll/OverrideExceptionModal";
import { LeaveAttendanceExceptionDrawer } from "@/components/payroll/LeaveAttendanceExceptionDrawer";
import { ExecutionConfirmationDialog } from "@/components/payroll/ExecutionConfirmationDialog";
import { ExecutionLog, ExecutionLogData, ExecutionLogWorker } from "@/components/payroll/ExecutionLog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, Play, TrendingUp, Lock, Info, Clock, X, XCircle, AlertCircle, Download, FileText, Building2, Receipt, Settings, Plus, Check, Search, Users, Briefcase, Send, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCountrySettings } from "@/hooks/useCountrySettings";

type PayrollStep = "review-fx" | "exceptions" | "execute" | "track";

const steps = [
  { id: "review-fx" as const, label: "Review FX", icon: DollarSign },
  { id: "exceptions" as const, label: "Exceptions", icon: AlertTriangle },
  { id: "execute" as const, label: "Execute", icon: Play },
  { id: "track" as const, label: "Track & Reconcile", icon: TrendingUp }
];

interface LeaveRecord {
  contractorId: string;
  leaveDays: number;
  workingDays: number;
  leaveReason?: string;
  leaveDate?: string;
  approvedBy?: string;
  clientConfirmed: boolean;
  contractorReported: boolean;
  leaveBreakdown?: {
    Annual?: number;
    Sick?: number;
    Unpaid?: number;
    Parental?: number;
    Other?: number;
  };
  hasPendingLeave?: boolean;
  hasMissingAttendance?: boolean;
  scheduledDays?: number;
  actualDays?: number;
}

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
  leaveData?: LeaveRecord;
  status?: "Active" | "Terminated" | "Contract Ended" | "On Hold";
  endDate?: string;
  compensationType?: "Monthly" | "Daily" | "Hourly" | "Project-Based";
  hourlyRate?: number;
  hoursWorked?: number;
  expectedMonthlyHours?: number;
  allowEmploymentOverride?: boolean;
  lineItems?: Array<{
    id: string;
    name: string;
    amount: number;
    taxable: boolean;
    applyTo: "1st_half" | "2nd_half" | "both_halves" | "full_month";
    cap?: number;
  }>;
  startDate?: string;
  nationalId?: string;
  sssEmployee?: number;
  sssEmployer?: number;
  philHealthEmployee?: number;
  philHealthEmployer?: number;
  pagIbigEmployee?: number;
  pagIbigEmployer?: number;
  withholdingTax?: number;
  withholdingTaxOverride?: boolean;
  holidayPay?: number;
  employerTax?: number;
  pension?: number;
  allowOverride?: boolean;
  ftePercent?: number;
  role?: string;
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
    isBlocking: true
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
    isBlocking: false
  }
];

const contractorsByCurrency: Record<string, ContractorPayment[]> = {
  EUR: [
    { id: "1", name: "David Martinez", country: "Portugal", countryCode: "PT", baseSalary: 4200, netPay: 4200, currency: "EUR", estFees: 25, fxRate: 0.92, recvLocal: 4200, eta: "Oct 30", employmentType: "contractor", status: "Active" },
    { id: "2", name: "Sophie Laurent", country: "France", countryCode: "FR", baseSalary: 5800, netPay: 5800, currency: "EUR", estFees: 35, fxRate: 0.92, recvLocal: 5800, eta: "Oct 30", employmentType: "employee", employerTaxes: 1740, status: "Active", endDate: "2025-12-15" },
    { id: "3", name: "Marco Rossi", country: "Italy", countryCode: "IT", baseSalary: 4500, netPay: 4500, currency: "EUR", estFees: 28, fxRate: 0.92, recvLocal: 4500, eta: "Oct 30", employmentType: "contractor", status: "Terminated" }
  ],
  NOK: [
    { id: "4", name: "Alex Hansen", country: "Norway", countryCode: "NO", baseSalary: 65000, netPay: 65000, currency: "NOK", estFees: 250, fxRate: 10.45, recvLocal: 65000, eta: "Oct 31", employmentType: "employee", employerTaxes: 9750, status: "Active", endDate: "2025-11-12" },
    { id: "5", name: "Emma Wilson", country: "Norway", countryCode: "NO", baseSalary: 72000, netPay: 72000, currency: "NOK", estFees: 280, fxRate: 10.45, recvLocal: 72000, eta: "Oct 31", employmentType: "contractor", status: "Active" }
  ],
  PHP: [
    { id: "6", name: "Maria Santos", country: "Philippines", countryCode: "PH", baseSalary: 280000, netPay: 280000, currency: "PHP", estFees: 850, fxRate: 56.2, recvLocal: 280000, eta: "Oct 30", employmentType: "employee", employerTaxes: 42000, status: "Active" },
    { id: "7", name: "Jose Reyes", country: "Philippines", countryCode: "PH", baseSalary: 245000, netPay: 245000, currency: "PHP", estFees: 750, fxRate: 56.2, recvLocal: 245000, eta: "Oct 30", employmentType: "contractor", status: "Active" },
    { id: "8", name: "Luis Hernandez", country: "Philippines", countryCode: "PH", baseSalary: 260000, netPay: 260000, currency: "PHP", estFees: 800, fxRate: 56.2, recvLocal: 260000, eta: "Oct 30", employmentType: "contractor", status: "Active", endDate: "2025-10-28" },
    { id: "9", name: "Carlos Diaz", country: "Philippines", countryCode: "PH", baseSalary: 0, netPay: 0, currency: "PHP", estFees: 450, fxRate: 56.2, recvLocal: 0, eta: "Oct 30", employmentType: "contractor", status: "Active", compensationType: "Hourly", hourlyRate: 850, hoursWorked: 160, expectedMonthlyHours: 160 }
  ]
};

export const F6v2_PayrollTab: React.FC = () => {
  const { getSettings } = useCountrySettings();
  
  // Core state - matching Flow 7 PayrollBatch exactly
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review-fx");
  const [fxRatesLocked, setFxRatesLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
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
  const [leaveAttendanceDrawerOpen, setLeaveAttendanceDrawerOpen] = useState(false);
  const [selectedLeaveException, setSelectedLeaveException] = useState<PayrollException | null>(null);
  const [executionConfirmOpen, setExecutionConfirmOpen] = useState(false);
  const [pendingExecutionCohort, setPendingExecutionCohort] = useState<"all" | "employees" | "contractors" | null>(null);
  const [executionLog, setExecutionLog] = useState<ExecutionLogData | null>(null);
  const [phPayrollHalf, setPhPayrollHalf] = useState<"1st" | "2nd">(() => {
    const currentDay = new Date().getDate();
    return currentDay < 15 ? "1st" : "2nd";
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<Record<string, "pending" | "processing" | "complete" | "failed">>({});
  const [showLeaveSection, setShowLeaveSection] = useState(false);
  const [leaveRecords, setLeaveRecords] = useState<Record<string, LeaveRecord>>({});
  const [leaveSelectorOpen, setLeaveSelectorOpen] = useState(false);
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  const [selectedLeaveWorkers, setSelectedLeaveWorkers] = useState<string[]>([]);
  const [contractorDrawerOpen, setContractorDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<ContractorPayment | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [additionalFees, setAdditionalFees] = useState<Record<string, { amount: number; accepted: boolean }>>({});
  const [scrollStates, setScrollStates] = useState<Record<string, boolean>>({});
  const [countryRulesDrawerOpen, setCountryRulesDrawerOpen] = useState(false);
  const [employeePayrollDrawerOpen, setEmployeePayrollDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ContractorPayment | null>(null);
  const [leaveDetailsDrawerOpen, setLeaveDetailsDrawerOpen] = useState(false);
  const [selectedWorkerForLeave, setSelectedWorkerForLeave] = useState<ContractorPayment | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "InTransit" | "Failed">("all");
  const [workerTypeFilter, setWorkerTypeFilter] = useState<"all" | "employee" | "contractor">("all");
  const [selectedCycle, setSelectedCycle] = useState<"previous" | "current" | "next">("current");
  const [contractorAdjustments, setContractorAdjustments] = useState<Record<string, Array<{ id: string; name: string; amount: number }>>>({});
  const [contractors, setContractors] = useState<ContractorPayment[]>(() => [...contractorsByCurrency.EUR, ...contractorsByCurrency.NOK, ...contractorsByCurrency.PHP]);
  const [isMarkCompleteConfirmOpen, setIsMarkCompleteConfirmOpen] = useState(false);
  const [hasUnresolvedIssues, setHasUnresolvedIssues] = useState(false);
  const [unresolvedIssues, setUnresolvedIssues] = useState({ blockingExceptions: 0, failedPayouts: 0, failedPostings: 0 });
  const [forceCompleteJustification, setForceCompleteJustification] = useState("");
  
  const allContractors = Object.values(contractorsByCurrency).flat();
  
  const [payrollCycleData, setPayrollCycleData] = useState({
    previous: {
      label: "October 2025",
      totalSalaryCost: 118240,
      frontedFees: 3547,
      totalPayrollCost: 121787,
      completedDate: "Oct 15, 2025",
      status: "completed" as const,
      hasData: true
    },
    current: {
      label: "November 2025",
      totalSalaryCost: 124850,
      frontedFees: 3742,
      totalPayrollCost: 128592,
      nextPayrollRun: "Nov 15",
      nextPayrollYear: "2025",
      completedDate: undefined as string | undefined,
      status: "active" as "active" | "completed",
      hasData: true
    },
    next: {
      label: "December 2025",
      totalSalaryCost: null as number | null,
      frontedFees: null as number | null,
      totalPayrollCost: null as number | null,
      nextPayrollRun: "Dec 15",
      nextPayrollYear: "2025",
      opensOn: "Dec 12, 2025",
      status: "upcoming" as const,
      hasData: false
    }
  });

  const currentCycleData = payrollCycleData[selectedCycle];

  // Filter contractors
  const filteredContractors = allContractors.filter(c => {
    if (employmentTypeFilter === "all") return true;
    return employmentTypeFilter === "employee" ? c.employmentType === "employee" : c.employmentType === "contractor";
  });

  const activeContractors = filteredContractors.filter(c => !snoozedWorkers.includes(c.id));
  const snoozedContractorsList = allContractors.filter(c => snoozedWorkers.includes(c.id));

  const executeFilteredWorkers = allContractors.filter(c => {
    if (snoozedWorkers.includes(c.id)) return false;
    if (executeEmploymentType === 'employees') {
      if (c.employmentType !== 'employee') return false;
      if (selectedCountries.length > 0 && !selectedCountries.includes(c.countryCode)) return false;
    } else if (executeEmploymentType === 'contractors') {
      if (c.employmentType !== 'contractor') return false;
    }
    return true;
  });

  const groupedByCurrency = activeContractors.reduce((acc, contractor) => {
    if (!acc[contractor.currency]) acc[contractor.currency] = [];
    acc[contractor.currency].push(contractor);
    return acc;
  }, {} as Record<string, ContractorPayment[]>);

  const activeExceptions = exceptions.filter(exc => !exc.resolved && !exc.snoozed && !exc.ignored);
  const snoozedExceptions = exceptions.filter(exc => exc.snoozed);
  const acknowledgedExceptions = exceptions.filter(exc => exc.resolved && !exc.ignored);
  const allExceptionsResolved = activeExceptions.length === 0;
  const fixableExceptions = activeExceptions.filter(e => e.canFixInPayroll);
  const nonFixableExceptions = activeExceptions.filter(e => !e.canFixInPayroll);
  const blockingCount = activeExceptions.filter(e => e.isBlocking && !e.overrideInfo).length;

  // Pro-rating calculation
  const calculateProratedPay = (baseSalary: number, leaveDays: number, workingDays: number = 21.67, countryCode?: string) => {
    const isPH = countryCode === "PH";
    const isNO = countryCode === "NO";
    const phSettings = getSettings("PH");
    const noSettings = getSettings("NO");
    const daysPerMonth = isPH ? phSettings.daysPerMonth : isNO ? noSettings.daysPerMonth : workingDays;
    const dailyRate = baseSalary / daysPerMonth;
    const payDays = daysPerMonth - leaveDays;
    const proratedPay = dailyRate * payDays;
    return { dailyRate, payDays, proratedPay, difference: baseSalary - proratedPay };
  };

  const getTotalAdjustments = (contractorId: string) => {
    const adjustments = contractorAdjustments[contractorId] || [];
    return adjustments.reduce((sum, adj) => sum + (Number(adj.amount) || 0), 0);
  };

  const getPaymentDue = (contractor: ContractorPayment): number => {
    if (contractor.compensationType === "Hourly" && contractor.hourlyRate && contractor.hoursWorked) {
      const basePayment = contractor.hourlyRate * contractor.hoursWorked;
      const adjustments = getTotalAdjustments(contractor.id);
      return basePayment + adjustments;
    }
    const leaveData = leaveRecords[contractor.id];
    let payment = contractor.baseSalary;
    if (leaveData && leaveData.leaveDays > 0) {
      const { proratedPay } = calculateProratedPay(contractor.baseSalary, leaveData.leaveDays, leaveData.workingDays, contractor.countryCode);
      payment = proratedPay;
    }
    const adjustments = getTotalAdjustments(contractor.id);
    return payment + adjustments;
  };

  const getLeaveDeduction = (contractor: ContractorPayment): number => {
    const leaveData = leaveRecords[contractor.id];
    if (!leaveData || leaveData.leaveDays === 0) return 0;
    const { proratedPay } = calculateProratedPay(contractor.baseSalary, leaveData.leaveDays, leaveData.workingDays, contractor.countryCode);
    return contractor.baseSalary - proratedPay;
  };

  // Handler functions
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

  const handleUpdateLeave = (contractorId: string, updates: Partial<LeaveRecord>) => {
    setLeaveRecords(prev => ({
      ...prev,
      [contractorId]: {
        ...prev[contractorId],
        contractorId,
        workingDays: getSettings("PH").daysPerMonth,
        leaveDays: 0,
        clientConfirmed: false,
        contractorReported: false,
        ...prev[contractorId],
        ...updates
      }
    }));
  };

  const handleOpenContractorDetail = (contractor: ContractorPayment) => {
    setSelectedContractor(contractor);
    setContractorDrawerOpen(true);
  };

  const handleOpenEmployeePayroll = (employee: ContractorPayment) => {
    setSelectedEmployee(employee);
    setEmployeePayrollDrawerOpen(true);
  };

  const handleResolveException = (exceptionId?: string) => {
    const exception = exceptionId ? exceptions.find(exc => exc.id === exceptionId) : null;
    if (!exception) return;
    setExceptions(prev => prev.map(exc => exc.id === exception.id ? { ...exc, resolved: true } : exc));
    toast.success(`Exception acknowledged for ${exception.contractorName}`);
  };

  const handleSnoozeException = (exceptionId: string) => {
    const exception = exceptions.find(exc => exc.id === exceptionId);
    setExceptions(prev => prev.map(exc => exc.id === exceptionId ? { ...exc, snoozed: true } : exc));
    toast.info(`${exception?.contractorName || 'Candidate'} snoozed to next cycle`);
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

  const handleOpenLeaveAttendanceDrawer = (exception: PayrollException) => {
    setSelectedLeaveException(exception);
    setLeaveAttendanceDrawerOpen(true);
  };

  const handleResolveLeaveAttendance = (exceptionId: string, resolution: "unpaid-leave" | "worked-days" | "snooze") => {
    const exception = exceptions.find(exc => exc.id === exceptionId);
    if (!exception) return;
    if (resolution === "snooze") {
      handleSnoozeException(exceptionId);
    } else {
      setExceptions(prev => prev.map(exc => exc.id === exceptionId ? { ...exc, resolved: true } : exc));
      if (resolution === "unpaid-leave") {
        toast.success(`${exception.contractorName} marked as unpaid leave - earnings adjusted`);
      } else {
        toast.success(`${exception.contractorName} will be paid for full expected days`);
      }
    }
    setLeaveAttendanceDrawerOpen(false);
    setSelectedLeaveException(null);
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

    const logWorkers: ExecutionLogWorker[] = [];

    for (const contractor of workersToExecute) {
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "processing" }));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      const isFailed = Math.random() < 0.1;
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: isFailed ? "failed" : "complete" }));
      logWorkers.push({
        id: contractor.id,
        name: contractor.name,
        employmentType: contractor.employmentType,
        country: contractor.country,
        status: isFailed ? "failed" : "success",
        errorMessage: isFailed ? `Payment processing error: ${contractor.employmentType === "employee" ? "Payroll system rejected posting" : "Bank account validation failed"}` : undefined
      });
    }

    setIsExecuting(false);

    const employeeCount = workersToExecute.filter(c => c.employmentType === "employee").length;
    const contractorCount = workersToExecute.filter(c => c.employmentType === "contractor").length;
    setExecutionLog({ timestamp: new Date(), cohort: pendingExecutionCohort, employeeCount, contractorCount, workers: logWorkers });

    const successCount = logWorkers.filter(w => w.status === "success").length;
    const failureCount = logWorkers.filter(w => w.status === "failed").length;

    if (failureCount === 0) {
      toast.success(`Payroll batch processed successfully! ${successCount} workers completed.`);
    } else {
      toast.warning(`Batch completed with ${failureCount} failure${failureCount > 1 ? 's' : ''}. Check execution log for details.`);
    }
    setPendingExecutionCohort(null);
  };

  const handleViewException = (workerId: string) => {
    setCurrentStep("exceptions");
    toast.info(`Navigated to Exceptions`);
  };

  const handleTableScroll = (currency: string, e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setScrollStates(prev => ({ ...prev, [currency]: scrollLeft > 0 }));
  };

  const handleToggleAdditionalFee = (contractorId: string, accept: boolean) => {
    setAdditionalFees(prev => ({
      ...prev,
      [contractorId]: { amount: prev[contractorId]?.amount || 50, accepted: accept }
    }));
    setLastUpdated(new Date());
    toast.success(`Additional fee ${accept ? 'accepted' : 'declined'} – totals updated.`);
  };

  const addContractorAdjustment = (contractorId: string) => {
    setContractorAdjustments(prev => ({
      ...prev,
      [contractorId]: [...(prev[contractorId] || []), { id: Date.now().toString(), name: "", amount: 0 }]
    }));
  };

  const updateContractorAdjustment = (contractorId: string, adjustmentId: string, field: "name" | "amount", value: string | number) => {
    setContractorAdjustments(prev => ({
      ...prev,
      [contractorId]: (prev[contractorId] || []).map(adj => adj.id === adjustmentId ? { ...adj, [field]: value } : adj)
    }));
  };

  const removeContractorAdjustment = (contractorId: string, adjustmentId: string) => {
    setContractorAdjustments(prev => ({
      ...prev,
      [contractorId]: (prev[contractorId] || []).filter(adj => adj.id !== adjustmentId)
    }));
  };

  const handleSaveContractorAdjustment = () => {
    if (selectedContractor) {
      toast.success(`Changes saved for ${selectedContractor.name}. Totals recalculated.`);
      setLastUpdated(new Date());
      setContractorDrawerOpen(false);
    }
  };

  const handleCompleteAndReturnToOverview = () => {
    const blockingExceptions = exceptions.filter(e => e.isBlocking && !e.resolved && !e.overrideInfo);
    const failedPayouts = executionLog?.workers.filter(w => w.status === "failed" && w.employmentType === "contractor") || [];
    const failedPostings = executionLog?.workers.filter(w => w.status === "failed" && w.employmentType === "employee") || [];
    const hasIssues = blockingExceptions.length > 0 || failedPayouts.length > 0 || failedPostings.length > 0;
    setUnresolvedIssues({ blockingExceptions: blockingExceptions.length, failedPayouts: failedPayouts.length, failedPostings: failedPostings.length });
    setHasUnresolvedIssues(hasIssues);
    setIsMarkCompleteConfirmOpen(true);
  };

  const confirmMarkComplete = (forced = false) => {
    setPayrollCycleData(prev => ({
      ...prev,
      current: { ...prev.current, status: "completed" as const, completedDate: "Nov 15, 2025" }
    }));
    setIsMarkCompleteConfirmOpen(false);
    setForceCompleteJustification("");
    toast.success(forced ? "November payroll cycle completed with unresolved issues" : "November payroll cycle completed");
  };

  const getPaymentStatus = (contractorId: string): "Paid" | "InTransit" | "Failed" => {
    if (currentCycleData.status === "completed") return "Paid";
    const progress = executionProgress[contractorId];
    if (progress === "complete") return "Paid";
    if (progress === "failed") return "Failed";
    return "InTransit";
  };

  const filteredTrackContractors = allContractors.filter(c => {
    const matchesStatus = statusFilter === "all" || getPaymentStatus(c.id) === statusFilter;
    const matchesType = workerTypeFilter === "all" || c.employmentType === workerTypeFilter;
    return matchesStatus && matchesType;
  });

  const paidCount = allContractors.filter(c => getPaymentStatus(c.id) === "Paid").length;
  const pendingCount = allContractors.filter(c => getPaymentStatus(c.id) === "InTransit").length;
  const failedCount = allContractors.filter(c => getPaymentStatus(c.id) === "Failed").length;

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  const exceptionTypeLabels: Record<string, string> = {
    "missing-bank": "Missing Bank Details",
    "fx-mismatch": "FX Mismatch",
    "pending-leave": "Pending Leave",
    "below-minimum-wage": "Below Min Wage",
    "status-mismatch": "Status Mismatch",
  };

  // Render functions for each step
  const renderReviewStep = () => (
    <div className="space-y-3">
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
          {/* Lock Rate button hidden - matching Flow 7 */}
        </div>
      </div>

      {/* Leave & Attendance Section - matching Flow 7 exactly */}
      <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm mb-8">
        <CardContent className="p-4">
          <button onClick={() => setShowLeaveSection(!showLeaveSection)} className="w-full flex items-center justify-between group">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Leave & Attendance</h4>
                <Badge variant="outline" className="text-xs">
                  {Object.keys(leaveRecords).filter(id => leaveRecords[id]?.leaveDays > 0).length} tracked
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {showLeaveSection ? "Hide details" : "View details"}
              </span>
              <div className={cn("transition-transform duration-200", showLeaveSection && "rotate-180")}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </button>

          {showLeaveSection && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4">
              {Object.keys(leaveRecords).filter(id => leaveRecords[id]?.leaveDays > 0).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="text-center space-y-2 mb-6">
                    <h4 className="text-base font-medium text-foreground">Track Leave & Absences</h4>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Add employees or contractors who took leave this cycle. Their salaries will be automatically pro-rated based on working days.
                    </p>
                  </div>
                  <Button size="default" onClick={() => setLeaveSelectorOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Workers with Leave
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      For payroll month: {selectedCycle === "current" ? "November 2025" : selectedCycle === "previous" ? "October 2025" : "December 2025"}
                      <span className="ml-2">•</span>
                      <span className="ml-2">Pro-rated: Base Pay ÷ Days Per Month × (Working Days - Leave Days)</span>
                      <span className="ml-2 text-amber-600">*For hourly contractors, enter unpaid hours instead of days</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setLeaveSelectorOpen(true)} className="h-8 text-xs gap-1.5 hover:bg-primary/10">
                      <Plus className="h-3.5 w-3.5" />
                      Add More
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs text-right">Leave Days / Unpaid Hours</TableHead>
                        <TableHead className="text-xs text-right">Working Days</TableHead>
                        <TableHead className="text-xs text-right">Unpaid Leave Amount</TableHead>
                        <TableHead className="text-xs text-right">Payment Due</TableHead>
                        <TableHead className="text-xs text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allContractors.filter(c => leaveRecords[c.id]?.leaveDays > 0).map(contractor => {
                        const leaveData = leaveRecords[contractor.id];
                        const leaveDays = leaveData?.leaveDays || 0;
                        const isPHContractor = contractor.countryCode === "PH";
                        const isNOContractor = contractor.countryCode === "NO";
                        const phSettings = getSettings("PH");
                        const noSettings = getSettings("NO");
                        const daysPerMonth = isPHContractor ? phSettings.daysPerMonth : isNOContractor ? noSettings.daysPerMonth : 22;
                        const workingDays = leaveData?.workingDays || daysPerMonth;
                        const isHourly = contractor.employmentType === "contractor" && contractor.compensationType === "Hourly";
                        let unpaidLeaveAmount = 0;
                        if (isHourly && contractor.hourlyRate) {
                          unpaidLeaveAmount = contractor.hourlyRate * leaveDays;
                        } else {
                          const dailyRate = contractor.baseSalary / daysPerMonth;
                          unpaidLeaveAmount = dailyRate * leaveDays;
                        }
                        const paymentDue = getPaymentDue(contractor);
                        return (
                          <TableRow key={contractor.id} className={cn("transition-colors hover:bg-muted/30", !leaveData?.clientConfirmed && "bg-amber-500/5")}>
                            <TableCell className="text-sm font-medium">{contractor.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={isHourly ? "999" : "31"}
                                  step={isHourly ? "1" : "0.5"}
                                  value={leaveDays}
                                  onChange={e => handleUpdateLeave(contractor.id, { leaveDays: parseFloat(e.target.value) || 0 })}
                                  className="w-16 px-2 py-1 text-xs text-right border border-border rounded bg-background"
                                  placeholder={isHourly ? "hrs" : "days"}
                                />
                                {isHourly && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                                      <TooltipContent><p className="text-xs max-w-[200px]">For hourly contractors, enter unpaid hours</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{workingDays.toFixed(2)}</TableCell>
                            <TableCell className="text-right text-sm text-amber-600 font-medium">-{contractor.currency} {Math.round(unpaidLeaveAmount).toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm font-semibold">{contractor.currency} {Math.round(paymentDue).toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                {leaveData?.clientConfirmed && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="w-5 h-5 rounded-full bg-accent-green-fill flex items-center justify-center">
                                          <Check className="h-3 w-3 text-accent-green-text" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent><p className="text-xs">Confirmed by client</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <button onClick={() => handleUpdateLeave(contractor.id, { clientConfirmed: !leaveData?.clientConfirmed })} className="text-xs text-primary hover:underline">
                                  {leaveData?.clientConfirmed ? "Confirmed" : "Confirm"}
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Employment Type Filter */}
      <div className="flex justify-start mb-4 pt-4">
        <Tabs value={employmentTypeFilter} onValueChange={v => setEmploymentTypeFilter(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="employee" className="text-xs">Employee</TabsTrigger>
            <TabsTrigger value="contractor" className="text-xs">Contractor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Currency Tables */}
      {Object.entries(groupedByCurrency).map(([currency, currencyContractors]) => {
        const symbol = currency === "EUR" ? "€" : currency === "NOK" ? "kr" : currency === "PHP" ? "₱" : "$";
        const contractorsList = currencyContractors.filter(c => c.employmentType === "contractor");
        const employeesList = currencyContractors.filter(c => c.employmentType === "employee");

        return (
          <Card key={currency} className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{currency} Payments</span>
                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">Employees: {employeesList.length}</Badge>
                  <Badge variant="outline" className="text-xs bg-secondary/5 border-secondary/20">Contractors: {contractorsList.length}</Badge>
                </div>
              </div>

              <div className="overflow-x-auto" onScroll={e => handleTableScroll(currency, e)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn("text-xs min-w-[180px] sticky left-0 bg-card z-10", scrollStates[currency] && "shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>Name</TableHead>
                      <TableHead className="text-xs min-w-[100px]">Type</TableHead>
                      <TableHead className="text-xs min-w-[80px] text-center">FTE %</TableHead>
                      <TableHead className="text-xs min-w-[100px]">Country</TableHead>
                      <TableHead className="text-xs min-w-[80px]">Status</TableHead>
                      <TableHead className="text-xs text-right min-w-[100px]">Gross Pay</TableHead>
                      <TableHead className="text-xs text-right min-w-[100px]">Adjustments</TableHead>
                      <TableHead className="text-xs text-right min-w-[100px]">Net Pay</TableHead>
                      <TableHead className="text-xs text-right min-w-[80px]">Fees</TableHead>
                      <TableHead className="text-xs text-right min-w-[120px]">Total</TableHead>
                      <TableHead className="text-xs min-w-[80px]">ETA</TableHead>
                      <TableHead className="text-xs min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Contractors Section */}
                    {contractorsList.length > 0 && (
                      <>
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20", scrollStates[currency] && "backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contractors ({contractorsList.length})</span>
                          </TableCell>
                          <TableCell colSpan={11} className="py-2 bg-muted/20"></TableCell>
                        </TableRow>
                        {contractorsList.map(contractor => {
                          const leaveData = leaveRecords[contractor.id];
                          const hasLeave = leaveData && leaveData.leaveDays > 0;
                          const paymentDue = getPaymentDue(contractor);
                          const difference = contractor.baseSalary - paymentDue;
                          const grossPay = contractor.baseSalary;
                          const netPay = paymentDue;
                          const additionalFee = additionalFees[contractor.id];
                          const totalPayable = netPay + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                          return (
                            <TableRow key={contractor.id} className={cn("hover:bg-muted/30 transition-colors", selectedCycle !== "previous" && "cursor-pointer")} onClick={() => selectedCycle !== "previous" && handleOpenContractorDetail(contractor)}>
                              <TableCell className={cn("font-medium text-sm sticky left-0 z-30 min-w-[180px] bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                                <div className="flex items-center gap-2">
                                  {contractor.name}
                                  {hasLeave && <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">-{leaveData.leaveDays}d Leave</Badge>}
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">Contractor</Badge></TableCell>
                              <TableCell className="text-sm text-center">{contractor.ftePercent || 100}%</TableCell>
                              <TableCell className="text-sm">{contractor.country}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs", contractor.status === "Active" && "bg-green-500/10 text-green-600 border-green-500/30", contractor.status === "Terminated" && "bg-red-500/10 text-red-600 border-red-500/30")}>
                                  {contractor.status || "Active"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{symbol}{grossPay.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{hasLeave ? `-${symbol}${Math.round(difference).toLocaleString()}` : "—"}</TableCell>
                              <TableCell className="text-right text-sm font-semibold">{symbol}{Math.round(netPay).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.estFees}</TableCell>
                              <TableCell className="text-right text-sm font-bold">{symbol}{Math.round(totalPayable).toLocaleString()}</TableCell>
                              <TableCell className="text-sm">{contractor.eta}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleSnoozeWorker(contractor.id); }}>Snooze</Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </>
                    )}

                    {/* Employees Section */}
                    {employeesList.length > 0 && (
                      <>
                        {/* PH Bi-Monthly Toggle */}
                        {currency === "PHP" && (
                          <TableRow>
                            <TableCell colSpan={12} className="p-0">
                              <div className="p-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-medium text-muted-foreground">Select Payout Half:</span>
                                  <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1 gap-1">
                                    <button onClick={() => setPhPayrollHalf("1st")} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", phPayrollHalf === "1st" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                      1st Half Payout
                                    </button>
                                    <button onClick={() => setPhPayrollHalf("2nd")} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", phPayrollHalf === "2nd" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                      2nd Half Payout
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20", scrollStates[currency] && "backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employees ({employeesList.length})</span>
                              {currency === "PHP" && <Badge variant="outline" className="text-xs">{phPayrollHalf === "1st" ? "1st Half" : "2nd Half"}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell colSpan={11} className="py-2 bg-muted/20"></TableCell>
                        </TableRow>
                        {employeesList.map(contractor => {
                          const leaveData = leaveRecords[contractor.id];
                          const hasLeave = leaveData && leaveData.leaveDays > 0;
                          const paymentDue = getPaymentDue(contractor);
                          const isPHEmployee = contractor.countryCode === "PH" && contractor.employmentType === "employee";
                          const phMultiplier = isPHEmployee ? 0.5 : 1;
                          const difference = contractor.baseSalary - paymentDue;
                          const grossPay = contractor.baseSalary * phMultiplier;
                          const netPay = isPHEmployee ? grossPay : paymentDue;
                          const additionalFee = additionalFees[contractor.id];
                          const totalPayable = netPay + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                          return (
                            <TableRow key={contractor.id} className={cn("hover:bg-muted/30 transition-colors", selectedCycle !== "previous" && "cursor-pointer")} onClick={() => selectedCycle !== "previous" && handleOpenEmployeePayroll(contractor)}>
                              <TableCell className={cn("font-medium text-sm sticky left-0 z-30 min-w-[180px] bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                                <div className="flex items-center gap-2">
                                  {contractor.name}
                                  {hasLeave && <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">-{leaveData.leaveDays}d Leave</Badge>}
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">Employee</Badge></TableCell>
                              <TableCell className="text-sm text-center">{contractor.ftePercent || 100}%</TableCell>
                              <TableCell className="text-sm">{contractor.country}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs", contractor.status === "Active" && "bg-green-500/10 text-green-600 border-green-500/30", contractor.status === "Terminated" && "bg-red-500/10 text-red-600 border-red-500/30")}>
                                  {contractor.status || "Active"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{symbol}{grossPay.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{hasLeave ? `-${symbol}${Math.round(difference).toLocaleString()}` : "—"}</TableCell>
                              <TableCell className="text-right text-sm font-semibold">{symbol}{Math.round(netPay).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.estFees}</TableCell>
                              <TableCell className="text-right text-sm font-bold">{symbol}{Math.round(totalPayable).toLocaleString()}</TableCell>
                              <TableCell className="text-sm">{contractor.eta}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleSnoozeWorker(contractor.id); }}>Snooze</Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </>
                    )}
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
        <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
          <Collapsible open={showSnoozedSection} onOpenChange={setShowSnoozedSection}>
            <div className="p-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70 transition-opacity">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Snoozed Workers ({snoozedContractorsList.length})</h4>
                  <Badge variant="outline" className="text-xs bg-muted/50">Excluded from totals</Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-7">{showSnoozedSection ? "Hide" : "Show"}</Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employment Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snoozedContractorsList.map(worker => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell className="capitalize">{worker.employmentType}</TableCell>
                        <TableCell>{worker.country}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">Snoozed this cycle</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUndoSnooze(worker.id)}>Undo Snooze</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </Card>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Step 1 of 4 – FX Review</div>
        <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("exceptions")} disabled={selectedCycle === "previous"}>
          Next: Exceptions →
        </Button>
      </div>
    </div>
  );

  const renderExceptionsStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Exception Review</h3>

      {blockingCount > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{blockingCount} blocking exception{blockingCount !== 1 ? 's' : ''} remaining</p>
                <p className="text-xs text-muted-foreground">These must be resolved or overridden before execution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeExceptions.length > 0 && (
        <Tabs value={exceptionGroupFilter} onValueChange={(v) => setExceptionGroupFilter(v as typeof exceptionGroupFilter)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All ({activeExceptions.length})</TabsTrigger>
            <TabsTrigger value="fixable">Fixable in Payroll ({fixableExceptions.length})</TabsTrigger>
            <TabsTrigger value="non-fixable">Must Fix Outside ({nonFixableExceptions.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {allExceptionsResolved && (
        <Card className="border-accent-green-outline/30 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-green-fill/30">
                <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">All clear! You can now continue to batch submission.</p>
                <p className="text-xs text-muted-foreground">All mandatory exceptions have been resolved or snoozed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exception List */}
      {activeExceptions.length > 0 && (
        <div className="space-y-3">
          {(exceptionGroupFilter === "all" ? activeExceptions : exceptionGroupFilter === "fixable" ? fixableExceptions : nonFixableExceptions).map(exception => (
            <Card key={exception.id} className={cn("border transition-all duration-300", exception.severity === "high" ? "border-amber-500/30 bg-amber-500/5" : "border-border/30")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
                    <AlertTriangle className={cn("h-4 w-4", exception.severity === "high" ? "text-amber-600" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {exception.contractorName}
                        {exception.contractorCountry && <span className="text-xs text-muted-foreground">• {exception.contractorCountry}</span>}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{exceptionTypeLabels[exception.type] || exception.type}</Badge>
                      {exception.isBlocking && <Badge variant="destructive" className="text-[10px]">Blocking</Badge>}
                      {!exception.isBlocking && <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">Warning</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{exception.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleResolveException(exception.id)}>Acknowledge & Proceed</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleSnoozeException(exception.id)}>Remove From This Cycle</Button>
                      {exception.isBlocking && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleOpenOverrideModal(exception)}>Override</Button>}
                    </div>
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
                  <span className="text-xs text-muted-foreground">Reviewed and approved</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("review-fx")}>← Previous: Review</Button>
        <div className="text-xs text-muted-foreground">Step 2 of 4 – Exceptions</div>
        <Button className="h-9 px-4 text-sm" disabled={selectedCycle === "previous"} onClick={() => setCurrentStep("execute")}>Next: Execute →</Button>
      </div>
    </div>
  );

  const renderExecuteStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Execute Payroll</h3>

      {/* Execute filters */}
      <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Execute for:</span>
              <Select value={executeEmploymentType} onValueChange={v => setExecuteEmploymentType(v as any)}>
                <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="employees">Employees Only</SelectItem>
                  <SelectItem value="contractors">Contractors Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {executeEmploymentType === "employees" && (
              <div className="flex items-center gap-4 pl-4 border-l-2 border-primary/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Country:</span>
                  <Select value={selectedCountries.length > 0 ? selectedCountries.join(",") : "all"} onValueChange={v => setSelectedCountries(v === "all" ? [] : v.split(","))}>
                    <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All countries" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All countries</SelectItem>
                      <SelectItem value="PT">Portugal</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="NO">Norway</SelectItem>
                      <SelectItem value="PH">Philippines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Payout Period:</span>
                  <Select value={payoutPeriod} onValueChange={v => setPayoutPeriod(v as any)}>
                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Month</SelectItem>
                      <SelectItem value="first-half">1st Half</SelectItem>
                      <SelectItem value="second-half">2nd Half</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning if exceptions exist */}
      {!allExceptionsResolved && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Resolve exceptions before executing payroll</p>
                <p className="text-xs text-muted-foreground">{activeExceptions.length} unresolved exception{activeExceptions.length !== 1 ? 's' : ''} must be cleared first</p>
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
                <p className="text-2xl font-bold text-foreground">${executeFilteredWorkers.reduce((sum, c) => sum + getPaymentDue(c), 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Processing Time</p>
                <p className="text-2xl font-bold text-foreground">~2 min</p>
                <p className="text-xs text-muted-foreground mt-1">estimated duration</p>
              </div>
            </div>
          </div>

          {!isExecuting && Object.keys(executionProgress).length === 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {allExceptionsResolved ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                <span className="text-muted-foreground">{allExceptionsResolved ? "All exceptions resolved" : `${activeExceptions.length} exception(s) pending`}</span>
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
                    <motion.div key={contractor.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        status === "complete" && "bg-accent-green-fill/10 border-accent-green-outline/20",
                        status === "failed" && "bg-red-500/10 border-red-500/30",
                        status === "processing" && "bg-blue-500/10 border-blue-500/20 animate-pulse",
                        status === "pending" && "bg-muted/20 border-border"
                      )}>
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background">
                        {status === "complete" && <CheckCircle2 className="h-4 w-4 text-accent-green-text" />}
                        {status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                        {status === "processing" && <div className="h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />}
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

          {/* Execution Log */}
          {executionLog && !isExecuting && <ExecutionLog logData={executionLog} onViewException={handleViewException} />}

          {/* Execute Buttons */}
          {!isExecuting && Object.keys(executionProgress).length === 0 && (
            <div className="flex items-center gap-3">
              <Button onClick={() => handleExecuteClick("all")} disabled={!allExceptionsResolved} className="flex-1">
                <Play className="h-4 w-4 mr-2" />Execute All
              </Button>
              <Button variant="outline" onClick={() => handleExecuteClick("employees")} disabled={!allExceptionsResolved}>Employees Only</Button>
              <Button variant="outline" onClick={() => handleExecuteClick("contractors")} disabled={!allExceptionsResolved}>Contractors Only</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("exceptions")}>← Previous: Exceptions</Button>
        <div className="text-xs text-muted-foreground">Step 3 of 4 – Execute</div>
        <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("track")}>Next: Track →</Button>
      </div>
    </div>
  );

  const renderTrackStep = () => {
    const employees = filteredTrackContractors.filter(c => c.employmentType === "employee");
    const contractorsPaid = filteredTrackContractors.filter(c => c.employmentType === "contractor");

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Track & Reconcile</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-3.5 w-3.5" />Export CSV</Button>
            <Button variant="outline" size="sm" className="gap-2"><FileText className="h-3.5 w-3.5" />Audit PDF</Button>
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
                  <p className="text-2xl font-bold text-foreground">{contractorsPaid.length}</p>
                  <p className="text-xs text-muted-foreground">Sent for payment</p>
                </div>
                <Badge className={cn(paidCount === allContractors.length ? "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30")}>
                  {paidCount === allContractors.length ? "All Paid" : `${pendingCount} Pending`}
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
                                <CheckCircle2 className="h-3 w-3 mr-1" />Posted
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">PR-{employee.id}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {(workerTypeFilter === "all" || workerTypeFilter === "contractor") && contractorsPaid.length > 0 && (
                  <div>
                    {workerTypeFilter === "all" && (
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <h5 className="text-sm font-semibold text-primary">Contractors ({contractorsPaid.length})</h5>
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
                        {contractorsPaid.map(contractor => {
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
                                <Button variant="ghost" size="sm" className="h-7 text-xs"><Receipt className="h-3 w-3 mr-1" />View</Button>
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

        {/* Footer - Company Admin: "Approve Payroll" instead of "Send to Client" */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("execute")}>← Previous: Execute</Button>
          
          <div className="flex items-center gap-3">
            {/* Proxy button hidden for Company Admin */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 opacity-50 cursor-not-allowed" disabled>
                    Proxy (Fronted only)
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Available in Fronted Admin only.</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {currentCycleData.status !== "completed" ? (
              <Button className="h-9 px-4 text-sm" onClick={handleCompleteAndReturnToOverview}>
                Approve Payroll
              </Button>
            ) : (
              <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />Payroll Completed
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedCycle} onValueChange={v => setSelectedCycle(v as any)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
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
            <p className="text-xs text-muted-foreground">Next Payroll Run</p>
            <p className="text-2xl font-bold text-foreground">{currentCycleData.status === "active" ? `Nov 15` : currentCycleData.status === "upcoming" ? "Dec 15" : "—"}</p>
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
                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" /> : <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />}
                      </span>
                      <span className={cn("text-sm font-medium", isActive ? "text-primary" : isCompleted ? "text-accent-green-text" : "text-foreground")}>
                        {step.label}
                      </span>
                    </button>
                  </TooltipTrigger>
                  {isDisabled && (
                    <TooltipContent side="bottom"><p className="text-xs">This step is read-only for completed cycles.</p></TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      {/* Step Content */}
      {currentCycleData.status !== "upcoming" ? (
        <motion.div key={currentStep} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          {currentStep === "review-fx" && renderReviewStep()}
          {currentStep === "exceptions" && renderExceptionsStep()}
          {currentStep === "execute" && renderExecuteStep()}
          {currentStep === "track" && renderTrackStep()}
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

      {/* Drawers and Modals */}
      <CountryRulesDrawer open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen} />
      
      <EmployeePayrollDrawer 
        open={employeePayrollDrawerOpen} 
        onOpenChange={setEmployeePayrollDrawerOpen} 
        employee={selectedEmployee} 
        onSave={() => toast.success("Employee payroll updated")} 
      />

      <OverrideExceptionModal
        open={overrideModalOpen}
        onOpenChange={setOverrideModalOpen}
        exception={exceptionToOverride}
        justification={overrideJustification}
        onJustificationChange={setOverrideJustification}
        onConfirm={handleConfirmOverride}
      />

      <ExecutionConfirmationDialog
        open={executionConfirmOpen}
        onOpenChange={setExecutionConfirmOpen}
        onConfirm={handleConfirmExecution}
        cohort={pendingExecutionCohort || "all"}
        employeeCount={allContractors.filter(c => c.employmentType === "employee").length}
        contractorCount={allContractors.filter(c => c.employmentType === "contractor").length}
        employeeTotal={allContractors.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + c.baseSalary, 0)}
        contractorTotal={allContractors.filter(c => c.employmentType === "contractor").reduce((sum, c) => sum + c.baseSalary, 0)}
        currency="USD"
      />

      <LeaveAttendanceExceptionDrawer
        open={leaveAttendanceDrawerOpen}
        onOpenChange={setLeaveAttendanceDrawerOpen}
        exception={selectedLeaveException}
        worker={selectedLeaveException ? allContractors.find(c => c.id === selectedLeaveException.contractorId) : undefined}
        onResolve={handleResolveLeaveAttendance}
      />

      {/* Contractor Detail Drawer */}
      <Sheet open={contractorDrawerOpen} onOpenChange={setContractorDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedContractor && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selectedContractor.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn("text-xs", selectedContractor.employmentType === "employee" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30")}>
                    {selectedContractor.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{selectedContractor.country}</span>
                </div>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Receipt className="h-4 w-4" />Payment Breakdown</h4>
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
                        <span className="text-lg font-bold text-foreground">{selectedContractor.currency} {Math.round(getPaymentDue(selectedContractor)).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setContractorDrawerOpen(false)}>{selectedCycle === "previous" ? "Close" : "Cancel"}</Button>
                {selectedCycle !== "previous" && <Button onClick={handleSaveContractorAdjustment}>Save & Recalculate</Button>}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Leave Record Selector Dialog */}
      <Dialog open={leaveSelectorOpen} onOpenChange={open => { setLeaveSelectorOpen(open); if (!open) { setLeaveSearchQuery(""); setSelectedLeaveWorkers([]); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Leave Records</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or country..." value={leaveSearchQuery} onChange={e => setLeaveSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <ScrollArea className="h-[400px] rounded-md border border-border bg-card/30">
              <div className="p-4 space-y-2">
                {(() => {
                  const availableWorkers = allContractors.filter(c => !leaveRecords[c.id] || leaveRecords[c.id]?.leaveDays === 0);
                  const filteredWorkers = availableWorkers.filter(contractor => contractor.name.toLowerCase().includes(leaveSearchQuery.toLowerCase()) || contractor.country.toLowerCase().includes(leaveSearchQuery.toLowerCase()));
                  if (filteredWorkers.length === 0) {
                    return <div className="text-center py-12"><p className="text-sm text-muted-foreground">{leaveSearchQuery ? "No workers found matching your search" : "All workers are already tracked for leave"}</p></div>;
                  }
                  return filteredWorkers.map(contractor => {
                    const isSelected = selectedLeaveWorkers.includes(contractor.id);
                    return (
                      <div key={contractor.id} onClick={() => setSelectedLeaveWorkers(prev => isSelected ? prev.filter(id => id !== contractor.id) : [...prev, contractor.id])}
                        className={cn("flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer", isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50")}>
                        <Checkbox checked={isSelected} onCheckedChange={() => setSelectedLeaveWorkers(prev => isSelected ? prev.filter(id => id !== contractor.id) : [...prev, contractor.id])} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{contractor.name}</p>
                          <p className="text-xs text-muted-foreground">{contractor.employmentType === "employee" ? "Employee" : "Contractor"} • {contractor.country}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{contractor.currency} {contractor.baseSalary.toLocaleString()}</Badge>
                      </div>
                    );
                  });
                })()}
              </div>
            </ScrollArea>
            {selectedLeaveWorkers.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <p className="text-sm text-foreground"><span className="font-semibold">{selectedLeaveWorkers.length}</span> worker{selectedLeaveWorkers.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setLeaveSelectorOpen(false); setLeaveSearchQuery(""); setSelectedLeaveWorkers([]); }}>Cancel</Button>
            <Button onClick={() => {
              if (selectedLeaveWorkers.length === 0) { toast.error("Please select at least one worker"); return; }
              selectedLeaveWorkers.forEach(workerId => {
                const phSettings = getSettings("PH");
                handleUpdateLeave(workerId, { leaveDays: 1, workingDays: phSettings.daysPerMonth, clientConfirmed: false });
              });
              toast.success(`${selectedLeaveWorkers.length} worker${selectedLeaveWorkers.length !== 1 ? 's' : ''} added to leave tracking`);
              setLeaveSelectorOpen(false);
              setLeaveSearchQuery("");
              setSelectedLeaveWorkers([]);
            }} disabled={selectedLeaveWorkers.length === 0}>
              Add Selected ({selectedLeaveWorkers.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Complete Confirmation Dialog */}
      <AlertDialog open={isMarkCompleteConfirmOpen} onOpenChange={setIsMarkCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{hasUnresolvedIssues ? "Unresolved issues remain for this payroll run" : "Complete this payroll run?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {hasUnresolvedIssues ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">The following issues have not been resolved:</p>
                  <div className="space-y-2 text-sm">
                    {unresolvedIssues.blockingExceptions > 0 && <div className="flex items-center gap-2 text-destructive"><AlertCircle className="h-4 w-4" /><span>Blocking exceptions: {unresolvedIssues.blockingExceptions}</span></div>}
                    {unresolvedIssues.failedPostings > 0 && <div className="flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" /><span>Failed employee postings: {unresolvedIssues.failedPostings}</span></div>}
                    {unresolvedIssues.failedPayouts > 0 && <div className="flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" /><span>Failed contractor payouts: {unresolvedIssues.failedPayouts}</span></div>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="force-complete-justification" className="text-sm font-medium">Justification (required to force complete):</Label>
                    <Textarea id="force-complete-justification" placeholder="Explain why these issues can be left unresolved..." value={forceCompleteJustification} onChange={e => setForceCompleteJustification(e.target.value)} className="min-h-[80px]" />
                  </div>
                </div>
              ) : (
                <p>This will lock the {currentCycleData.label} payroll cycle as completed. Are you sure?</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {hasUnresolvedIssues ? (
              <>
                <Button variant="outline" onClick={() => { setIsMarkCompleteConfirmOpen(false); setCurrentStep(unresolvedIssues.blockingExceptions > 0 ? "exceptions" : "execute"); }}>Go back to fix issues</Button>
                <AlertDialogAction onClick={() => confirmMarkComplete(true)} disabled={!forceCompleteJustification.trim()} className="bg-amber-600 hover:bg-amber-700">Force complete with issues</AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => confirmMarkComplete(false)}>Mark as complete</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default F6v2_PayrollTab;
