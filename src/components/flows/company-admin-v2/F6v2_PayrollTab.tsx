/**
 * Flow 6 v2 - Payroll Tab
 * 
 * This component embeds the EXACT PayrollBatch UI from Flow 7.
 * We import the payroll content directly and only override the CTA text.
 * 
 * The key is that Flow 7's PayrollBatch is a full page component with its own
 * Topbar/Layout, so we need to extract just the payroll content portion.
 * 
 * For now, we render PayrollBatch inline but hide the outer shell elements.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, Play, TrendingUp, Lock, Info, Clock, X, XCircle, AlertCircle, Download, FileText, Building2, Receipt, Settings, Plus, Check, Search, Users, Briefcase, Send, ChevronDown, RefreshCw } from "lucide-react";
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
import { addDays, format } from "date-fns";

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
      previousBatch: { employeesPaid: 8, amountProcessed: 118240, skippedSnoozed: 0 },
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
      previousBatch: { employeesPaid: 8, amountProcessed: 118240, skippedSnoozed: 0 },
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
      previousBatch: { employeesPaid: 0, amountProcessed: 0, skippedSnoozed: 0 },
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

  const handleViewLeaveDetails = (contractor: ContractorPayment) => {
    setSelectedWorkerForLeave(contractor);
    setLeaveDetailsDrawerOpen(true);
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

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  const exceptionTypeLabels: Record<string, string> = {
    "missing-bank": "Missing Bank Details",
    "fx-mismatch": "FX Mismatch",
    "pending-leave": "Pending Leave",
    "below-minimum-wage": "Below Min Wage",
    "status-mismatch": "Status Mismatch",
  };

  // Helper: render step pills exactly like Flow 7
  const renderStepPills = () => (
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
  );

  // This component directly embeds the PayrollBatch content
  // For exact matching, we'll render the same structure
  return (
    <div className="space-y-6">
      {/* Header with Cycle Selector and Country Rules */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <Badge variant="outline" className={cn("text-xs",
            currentCycleData.status === "completed" && "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30",
            currentCycleData.status === "active" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
            currentCycleData.status === "upcoming" && "bg-muted/30 text-muted-foreground border-border/30"
          )}>
            {currentCycleData.status === "completed" ? "Completed" : currentCycleData.status === "active" ? "Active" : "Upcoming"}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCountryRulesDrawerOpen(true)} className="gap-2">
          <Settings className="h-3.5 w-3.5" />
          Country Rules
        </Button>
      </div>

      {/* KPI Cards - matching Flow 7 exactly */}
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
            <p className="text-2xl font-bold text-foreground">
              {currentCycleData.status === "completed" ? currentCycleData.completedDate || "Completed" : 
               currentCycleData.status === "upcoming" ? currentCycleData.opensOn : 
               `${(currentCycleData as any).nextPayrollRun}, ${(currentCycleData as any).nextPayrollYear}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Step Pills - matching Flow 7 exactly */}
      {currentCycleData.status !== "upcoming" && renderStepPills()}

      {/* Step Content */}
      {currentCycleData.status !== "upcoming" ? (
        <motion.div
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === "review-fx" && (
            <div className="space-y-3">
              {/* Leave & Attendance Collapsible - matching Flow 7 */}
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
                        <div className="text-sm text-muted-foreground">Leave records displayed here...</div>
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

              {/* Currency Tables - simplified version matching Flow 7 structure */}
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
                              <TableHead className="text-xs text-right min-w-[100px]">Sched. Days</TableHead>
                              <TableHead className="text-xs text-right min-w-[100px]">Actual Days</TableHead>
                              <TableHead className="text-xs min-w-[140px]">Leave Taken</TableHead>
                              <TableHead className="text-xs text-right min-w-[100px]">Net Payable</TableHead>
                              <TableHead className="text-xs min-w-[110px]">Start Date</TableHead>
                              <TableHead className="text-xs min-w-[110px]">End Date</TableHead>
                              <TableHead className="text-xs text-right min-w-[110px]">Hours</TableHead>
                              <TableHead className="text-xs min-w-[130px]">Comp. Type</TableHead>
                              <TableHead className="text-xs text-right min-w-[110px]">Gross Pay</TableHead>
                              <TableHead className="text-xs text-right min-w-[110px]">Adjustments</TableHead>
                              <TableHead className="text-xs text-right min-w-[110px]">Net Pay</TableHead>
                              <TableHead className="text-xs text-right min-w-[100px]">Fees</TableHead>
                              <TableHead className="text-xs text-right min-w-[150px]">Addt'l Fee</TableHead>
                              <TableHead className="text-xs text-right min-w-[130px]">Total</TableHead>
                              <TableHead className="text-xs min-w-[100px]">Ready</TableHead>
                              <TableHead className="text-xs min-w-[90px]">ETA</TableHead>
                              <TableHead className="text-xs min-w-[120px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* Contractors */}
                            {contractorsList.length > 0 && (
                              <>
                                <TableRow className="bg-muted/20 hover:bg-muted/20">
                                  <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20", scrollStates[currency] && "backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contractors ({contractorsList.length})</span>
                                  </TableCell>
                                  <TableCell colSpan={21} className="py-2 bg-muted/20"></TableCell>
                                </TableRow>
                                {contractorsList.map(contractor => {
                                  const leaveData = leaveRecords[contractor.id];
                                  const hasLeave = leaveData && leaveData.leaveDays > 0;
                                  const paymentDue = getPaymentDue(contractor);
                                  const difference = contractor.baseSalary - paymentDue;
                                  const additionalFee = additionalFees[contractor.id];
                                  const totalPayable = paymentDue + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                                  return (
                                    <TableRow key={contractor.id} className={cn("hover:bg-muted/30 transition-colors cursor-pointer")} onClick={() => handleOpenContractorDetail(contractor)}>
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
                                      <TableCell className="text-right text-sm text-muted-foreground">{leaveData?.scheduledDays || 22}d</TableCell>
                                      <TableCell className="text-right text-sm text-foreground">{leaveData?.actualDays || 22}d</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{hasLeave ? `${leaveData.leaveDays}d` : "—"}</TableCell>
                                      <TableCell className="text-right text-sm font-medium text-accent-green-text">{(leaveData?.actualDays || 22) - (leaveData?.leaveDays || 0)}d</TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{contractor.startDate ? format(new Date(contractor.startDate), "MMM d, yyyy") : "—"}</TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{contractor.endDate ? format(new Date(contractor.endDate), "MMM d, yyyy") : "—"}</TableCell>
                                      <TableCell className="text-right text-sm">{contractor.compensationType === "Hourly" ? contractor.hoursWorked || 0 : "—"}</TableCell>
                                      <TableCell className="text-sm">{contractor.compensationType || "Monthly"}</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.baseSalary.toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">{hasLeave ? `-${symbol}${Math.round(difference).toLocaleString()}` : "—"}</TableCell>
                                      <TableCell className="text-right text-sm font-semibold">{symbol}{Math.round(paymentDue).toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.estFees}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <span className="text-sm">{symbol}{additionalFee?.amount || 50}</span>
                                          <Select value={additionalFee?.accepted ? "accept" : "decline"} onValueChange={value => handleToggleAdditionalFee(contractor.id, value === "accept")}>
                                            <SelectTrigger className="w-24 h-7 text-xs" onClick={e => e.stopPropagation()}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="accept" className="text-xs">Accept</SelectItem>
                                              <SelectItem value="decline" className="text-xs">Decline</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right text-sm font-bold">{symbol}{Math.round(totalPayable).toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="text-xs bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30">Ready</Badge>
                                      </TableCell>
                                      <TableCell className="text-sm">{contractor.eta}</TableCell>
                                      <TableCell>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleSnoozeWorker(contractor.id); }}>Snooze</Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </>
                            )}

                            {/* PH Bi-Monthly Toggle */}
                            {currency === "PHP" && employeesList.length > 0 && (
                              <TableRow>
                                <TableCell colSpan={22} className="p-0">
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

                            {/* Employees */}
                            {employeesList.length > 0 && (
                              <>
                                <TableRow className="bg-muted/20 hover:bg-muted/20">
                                  <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20", scrollStates[currency] && "backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employees ({employeesList.length})</span>
                                      {currency === "PHP" && <Badge variant="outline" className="text-xs">{phPayrollHalf === "1st" ? "1st Half" : "2nd Half"}</Badge>}
                                    </div>
                                  </TableCell>
                                  <TableCell colSpan={21} className="py-2 bg-muted/20"></TableCell>
                                </TableRow>
                                {employeesList.map(contractor => {
                                  const leaveData = leaveRecords[contractor.id];
                                  const hasLeave = leaveData && leaveData.leaveDays > 0;
                                  const isPHEmployee = contractor.countryCode === "PH" && contractor.employmentType === "employee";
                                  const phMultiplier = isPHEmployee ? 0.5 : 1;
                                  const paymentDue = getPaymentDue(contractor);
                                  const grossPay = contractor.baseSalary * phMultiplier;
                                  const netPay = isPHEmployee ? grossPay : paymentDue;
                                  const difference = contractor.baseSalary - paymentDue;
                                  const additionalFee = additionalFees[contractor.id];
                                  const totalPayable = netPay + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                                  return (
                                    <TableRow key={contractor.id} className={cn("hover:bg-muted/30 transition-colors cursor-pointer")} onClick={() => handleOpenEmployeePayroll(contractor)}>
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
                                      <TableCell className="text-right text-sm text-muted-foreground">{leaveData?.scheduledDays || 22}d</TableCell>
                                      <TableCell className="text-right text-sm text-foreground">{leaveData?.actualDays || 22}d</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{hasLeave ? `${leaveData.leaveDays}d` : "—"}</TableCell>
                                      <TableCell className="text-right text-sm font-medium text-accent-green-text">{(leaveData?.actualDays || 22) - (leaveData?.leaveDays || 0)}d</TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{contractor.startDate ? format(new Date(contractor.startDate), "MMM d, yyyy") : "—"}</TableCell>
                                      <TableCell className="text-sm text-muted-foreground">{contractor.endDate ? format(new Date(contractor.endDate), "MMM d, yyyy") : "—"}</TableCell>
                                      <TableCell className="text-right text-sm">—</TableCell>
                                      <TableCell className="text-sm">—</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">{symbol}{grossPay.toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">{isPHEmployee && phPayrollHalf === "1st" ? "₱0" : hasLeave ? `-${symbol}${Math.round(difference).toLocaleString()}` : "—"}</TableCell>
                                      <TableCell className="text-right text-sm font-semibold">{symbol}{Math.round(netPay).toLocaleString()}</TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.estFees}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <span className="text-sm">{symbol}{additionalFee?.amount || 50}</span>
                                          <Select value={additionalFee?.accepted ? "accept" : "decline"} onValueChange={value => handleToggleAdditionalFee(contractor.id, value === "accept")}>
                                            <SelectTrigger className="w-24 h-7 text-xs" onClick={e => e.stopPropagation()}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="accept" className="text-xs">Accept</SelectItem>
                                              <SelectItem value="decline" className="text-xs">Decline</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right text-sm font-bold">{symbol}{Math.round(totalPayable).toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="text-xs bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30">Ready</Badge>
                                      </TableCell>
                                      <TableCell className="text-sm">{contractor.eta}</TableCell>
                                      <TableCell>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); handleSnoozeWorker(contractor.id); }}>Snooze</Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </>
                            )}

                            {/* Per-type Subtotals */}
                            <TableRow className="bg-muted/30 border-t border-border">
                              <TableCell colSpan={22} className="p-0">
                                <div className="p-2 space-y-1.5">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                                    Subtotals by Type ({currency})
                                  </p>
                                  <div className="max-w-[640px] flex gap-1.5 items-stretch">
                                    <div className="px-3 py-2.5 bg-secondary/5 border border-secondary/20 rounded-lg flex-1 min-w-0">
                                      <p className="text-[10px] text-muted-foreground mb-0.5 leading-snug">Contractors</p>
                                      <p className="text-base font-semibold text-foreground leading-tight">
                                        {symbol}{contractorsList.reduce((sum, c) => sum + getPaymentDue(c) + c.estFees + (additionalFees[c.id]?.accepted ? additionalFees[c.id].amount : 0), 0).toLocaleString()}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                                        {contractorsList.length} worker{contractorsList.length !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                    <div className="px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-lg flex-1 min-w-0">
                                      <p className="text-[10px] text-muted-foreground mb-0.5 leading-snug">Employees</p>
                                      <p className="text-base font-semibold text-foreground leading-tight">
                                        {symbol}{employeesList.reduce((sum, c) => {
                                          const isPHEmployee = c.countryCode === "PH" && c.employmentType === "employee";
                                          const phMultiplier = isPHEmployee ? 0.5 : 1;
                                          const netPay = isPHEmployee ? c.baseSalary * phMultiplier : getPaymentDue(c);
                                          return sum + netPay + c.estFees + (additionalFees[c.id]?.accepted ? additionalFees[c.id].amount : 0);
                                        }, 0).toLocaleString()}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                                        {employeesList.length} worker{employeesList.length !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Snoozed Workers Section */}
              {snoozedContractorsList.length > 0 && (
                <Card className="border-border/20 bg-muted/20 backdrop-blur-sm shadow-sm">
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
                              <TableHead className="text-xs">Name</TableHead>
                              <TableHead className="text-xs">Employment Type</TableHead>
                              <TableHead className="text-xs">Country</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                              <TableHead className="text-xs text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {snoozedContractorsList.map(worker => (
                              <TableRow key={worker.id} className="opacity-60">
                                <TableCell className="font-medium text-sm">{worker.name}</TableCell>
                                <TableCell className="text-sm capitalize">{worker.employmentType}</TableCell>
                                <TableCell className="text-sm">{worker.country}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="text-xs">Snoozed this cycle</Badge>
                                </TableCell>
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
                <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("exceptions")}>
                  Next: Exceptions →
                </Button>
              </div>
            </div>
          )}

          {currentStep === "exceptions" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Exception Review</h3>
              
              {/* Exception Content - simplified */}
              {allExceptionsResolved ? (
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
              ) : (
                <div className="space-y-3">
                  {activeExceptions.map(exception => (
                    <Card key={exception.id} className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{exception.contractorName}</span>
                              <Badge variant="outline" className="text-[10px]">{exceptionTypeLabels[exception.type] || exception.type}</Badge>
                              {exception.isBlocking && <Badge variant="destructive" className="text-[10px]">Blocking</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{exception.description}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleResolveException(exception.id)}>Acknowledge</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSnoozeException(exception.id)}>Snooze</Button>
                              {exception.isBlocking && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleOpenOverrideModal(exception)}>Override</Button>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("review-fx")}>← Previous: Review</Button>
                <div className="text-xs text-muted-foreground">Step 2 of 4 – Exceptions</div>
                <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("execute")}>Next: Execute →</Button>
              </div>
            </div>
          )}

          {currentStep === "execute" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Execute Payroll</h3>
              
              <Card className="border-border/40 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Button onClick={() => handleExecuteClick("all")} disabled={!allExceptionsResolved || isExecuting}>
                      <Play className="h-4 w-4 mr-2" />
                      Execute All
                    </Button>
                    <Button variant="outline" onClick={() => handleExecuteClick("employees")} disabled={!allExceptionsResolved || isExecuting}>
                      Employees Only
                    </Button>
                    <Button variant="outline" onClick={() => handleExecuteClick("contractors")} disabled={!allExceptionsResolved || isExecuting}>
                      Contractors Only
                    </Button>
                  </div>
                  
                  {isExecuting && (
                    <div className="mt-6 space-y-2">
                      {executeFilteredWorkers.map(worker => (
                        <div key={worker.id} className={cn("flex items-center gap-3 p-3 rounded-lg border",
                          executionProgress[worker.id] === "complete" && "bg-accent-green-fill/10 border-accent-green-outline/20",
                          executionProgress[worker.id] === "failed" && "bg-red-500/10 border-red-500/30",
                          executionProgress[worker.id] === "processing" && "bg-blue-500/10 border-blue-500/20 animate-pulse"
                        )}>
                          <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                            {executionProgress[worker.id] === "complete" && <CheckCircle2 className="h-4 w-4 text-accent-green-text" />}
                            {executionProgress[worker.id] === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                            {executionProgress[worker.id] === "processing" && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                            {executionProgress[worker.id] === "pending" && <Circle className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <span className="text-sm font-medium">{worker.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {executionLog && !isExecuting && (
                    <div className="mt-6">
                      <ExecutionLog logData={executionLog} onViewException={() => setCurrentStep("exceptions")} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("exceptions")}>← Previous: Exceptions</Button>
                <div className="text-xs text-muted-foreground">Step 3 of 4 – Execute</div>
                <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("track")}>Next: Track →</Button>
              </div>
            </div>
          )}

          {currentStep === "track" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Track & Reconcile</h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">Employees</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{allContractors.filter(c => c.employmentType === "employee").length}</p>
                    <p className="text-xs text-muted-foreground">Posted to payroll system</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Contractors</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{allContractors.filter(c => c.employmentType === "contractor").length}</p>
                    <p className="text-xs text-muted-foreground">Sent for payment</p>
                  </CardContent>
                </Card>
              </div>

              {/* Footer with Company Admin CTA */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button variant="outline" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("execute")}>← Previous: Execute</Button>
                <div className="flex items-center gap-3">
                  {/* Hidden Proxy button for Company Admin */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 opacity-50 cursor-not-allowed" disabled>
                          Proxy (Fronted only)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Available in Fronted Admin only.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Company Admin CTA: "Approve Payroll" instead of "Send to Client" */}
                  <Button className="h-9 px-4 text-sm" onClick={handleCompleteAndReturnToOverview}>
                    Approve Payroll
                  </Button>
                </div>
              </div>
            </div>
          )}
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
      <EmployeePayrollDrawer open={employeePayrollDrawerOpen} onOpenChange={setEmployeePayrollDrawerOpen} employee={selectedEmployee} onSave={() => toast.success("Employee payroll updated")} />
      <LeaveDetailsDrawer open={leaveDetailsDrawerOpen} onOpenChange={setLeaveDetailsDrawerOpen} workerName={selectedWorkerForLeave?.name || ""} workerRole={selectedWorkerForLeave?.role} country={selectedWorkerForLeave?.country || ""} employmentType={selectedWorkerForLeave?.employmentType || "contractor"} ftePercent={selectedWorkerForLeave?.ftePercent || 100} scheduledDays={22} actualDays={22} leaveEntries={[]} attendanceAnomalies={[]} />
      <OverrideExceptionModal open={overrideModalOpen} onOpenChange={setOverrideModalOpen} exception={exceptionToOverride} justification={overrideJustification} onJustificationChange={setOverrideJustification} onConfirm={handleConfirmOverride} />
      <LeaveAttendanceExceptionDrawer open={leaveAttendanceDrawerOpen} onOpenChange={setLeaveAttendanceDrawerOpen} exception={selectedLeaveException} worker={selectedLeaveException ? allContractors.find(c => c.id === selectedLeaveException.contractorId) : undefined} onResolve={handleResolveLeaveAttendance} />
      <ExecutionConfirmationDialog open={executionConfirmOpen} onOpenChange={setExecutionConfirmOpen} onConfirm={handleConfirmExecution} cohort={pendingExecutionCohort || "all"} employeeCount={allContractors.filter(c => c.employmentType === "employee").length} contractorCount={allContractors.filter(c => c.employmentType === "contractor").length} employeeTotal={allContractors.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + c.baseSalary, 0)} contractorTotal={allContractors.filter(c => c.employmentType === "contractor").reduce((sum, c) => sum + c.baseSalary, 0)} currency="USD" />

      {/* Mark Complete Confirmation */}
      <AlertDialog open={isMarkCompleteConfirmOpen} onOpenChange={setIsMarkCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{hasUnresolvedIssues ? "Unresolved Issues Remain" : "Mark Payroll as Complete?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {hasUnresolvedIssues ? (
                <div className="space-y-4 mt-3">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    {unresolvedIssues.blockingExceptions > 0 && <p className="text-sm">• {unresolvedIssues.blockingExceptions} blocking exception(s)</p>}
                    {unresolvedIssues.failedPayouts > 0 && <p className="text-sm">• {unresolvedIssues.failedPayouts} failed contractor payout(s)</p>}
                    {unresolvedIssues.failedPostings > 0 && <p className="text-sm">• {unresolvedIssues.failedPostings} failed employee posting(s)</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Justification (required to force complete)</Label>
                    <Textarea value={forceCompleteJustification} onChange={e => setForceCompleteJustification(e.target.value)} placeholder="Explain why this payroll should be completed with unresolved issues..." className="min-h-[100px]" />
                  </div>
                </div>
              ) : (
                <p>This will lock the November 2025 payroll cycle as completed. Are you sure?</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {hasUnresolvedIssues ? (
              <>
                <Button variant="outline" onClick={() => { setIsMarkCompleteConfirmOpen(false); setCurrentStep("exceptions"); }}>Go Back to Fix Issues</Button>
                <AlertDialogAction onClick={() => confirmMarkComplete(true)} disabled={!forceCompleteJustification.trim()} className="bg-amber-600 hover:bg-amber-700">Force Complete</AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => confirmMarkComplete(false)}>Mark as Complete</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contractor Detail Drawer */}
      <Sheet open={contractorDrawerOpen} onOpenChange={setContractorDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedContractor && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedContractor.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{selectedContractor.country} • {selectedContractor.currency}</p>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Employment Type</p>
                    <p className="font-medium capitalize">{selectedContractor.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Base Salary</p>
                    <p className="font-medium">{selectedContractor.currency} {selectedContractor.baseSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium">{selectedContractor.status || "Active"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fees</p>
                    <p className="font-medium">{selectedContractor.currency} {selectedContractor.estFees}</p>
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setContractorDrawerOpen(false)}>Close</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Leave Selector Dialog */}
      <Dialog open={leaveSelectorOpen} onOpenChange={setLeaveSelectorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Workers with Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select workers who took leave this pay cycle.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allContractors.filter(c => !leaveRecords[c.id]?.leaveDays).map(contractor => (
                <div key={contractor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                  <Checkbox checked={false} onCheckedChange={() => {
                    handleUpdateLeave(contractor.id, { leaveDays: 1 });
                    setLeaveSelectorOpen(false);
                  }} />
                  <span className="text-sm">{contractor.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{contractor.country}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveSelectorOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default F6v2_PayrollTab;
