/**
 * Flow 6 v2 - Payroll Tab
 * 
 * IMPORTANT: This is a 1:1 clone of Flow 7 PayrollBatch content.
 * The component embeds Flow 7's PayrollBatch directly but WITHOUT the outer shell
 * (Topbar, AgentLayout, main container) since those are provided by CompanyAdminDashboardV2.
 * 
 * Role-specific changes:
 * - "Send to Client" → "Approve Payroll"
 * - "Proxy (Fronted only)" button is hidden
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CountryRulesDrawer from "@/components/payroll/CountryRulesDrawer";
import EmployeePayrollDrawer from "@/components/payroll/EmployeePayrollDrawer";
import LeaveDetailsDrawer from "@/components/payroll/LeaveDetailsDrawer";
import { OverrideExceptionModal } from "@/components/payroll/OverrideExceptionModal";
import { LeaveAttendanceExceptionDrawer } from "@/components/payroll/LeaveAttendanceExceptionDrawer";
import { ExecutionMonitor } from "@/components/payroll/ExecutionMonitor";
import { ExecutionConfirmationDialog } from "@/components/payroll/ExecutionConfirmationDialog";
import { ExecutionLog, ExecutionLogData, ExecutionLogWorker } from "@/components/payroll/ExecutionLog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, CheckSquare, Play, TrendingUp, RefreshCw, Lock, Info, Clock, X, XCircle, AlertCircle, Download, FileText, Building2, Receipt, Activity, Settings, Plus, Check, Search, Users, Briefcase, Send, ChevronDown, ChevronUp } from "lucide-react";
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
import { addDays, format } from "date-fns";
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
  type: "missing-bank" | "fx-mismatch" | "pending-leave" | "unverified-identity" | "below-minimum-wage" | "allowance-exceeds-cap" | "missing-govt-id" | "incorrect-contribution-tier" | "missing-13th-month" | "ot-holiday-type-not-selected" | "invalid-work-type-combination" | "night-differential-invalid-hours" | "missing-employer-sss" | "missing-withholding-tax" | "status-mismatch" | "employment-ending-this-period" | "end-date-before-period" | "upcoming-contract-end" | "missing-hours" | "missing-dates" | "end-date-passed-active" | "deduction-exceeds-gross" | "missing-tax-fields" | "adjustment-exceeds-cap" | "contribution-table-year-missing";
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

// Currency symbols helper
const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    EUR: "€",
    NOK: "kr",
    PHP: "₱",
    USD: "$",
    GBP: "£"
  };
  return symbols[currency] || currency;
};

export const F6v2_PayrollTab: React.FC = () => {
  const navigate = useNavigate();
  const { getSettings } = useCountrySettings();
  
  // Core state - matching Flow 7 PayrollBatch exactly
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review-fx");
  const [fxRatesLocked, setFxRatesLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Review page filters and snooze
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<"all" | "employee" | "contractor">("all");
  const [snoozedWorkers, setSnoozedWorkers] = useState<string[]>([]);
  const [showSnoozedSection, setShowSnoozedSection] = useState(true);
  
  // Execute page filters
  const [executeEmploymentType, setExecuteEmploymentType] = useState<"all" | "employees" | "contractors">("all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [payoutPeriod, setPayoutPeriod] = useState<"full" | "first-half" | "second-half">("full");
  const [exceptions, setExceptions] = useState<PayrollException[]>(initialExceptions);
  const [fixDrawerOpen, setFixDrawerOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<PayrollException | null>(null);
  const [bankAccountType, setBankAccountType] = useState("");
  
  // Override modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [exceptionToOverride, setExceptionToOverride] = useState<PayrollException | null>(null);
  const [overrideJustification, setOverrideJustification] = useState("");
  
  // Exceptions grouping filter
  const [exceptionGroupFilter, setExceptionGroupFilter] = useState<"all" | "fixable" | "non-fixable">("all");
  
  // Leave/attendance exception drawer
  const [leaveAttendanceDrawerOpen, setLeaveAttendanceDrawerOpen] = useState(false);
  const [selectedLeaveException, setSelectedLeaveException] = useState<PayrollException | null>(null);
  
  // Execution confirmation state
  const [executionConfirmOpen, setExecutionConfirmOpen] = useState(false);
  const [pendingExecutionCohort, setPendingExecutionCohort] = useState<"all" | "employees" | "contractors" | null>(null);
  
  // Execution log state
  const [executionLog, setExecutionLog] = useState<ExecutionLogData | null>(null);
  
  // PH bi-monthly payroll toggle
  const [phPayrollHalf, setPhPayrollHalf] = useState<"1st" | "2nd">(() => {
    const currentDay = new Date().getDate();
    return currentDay < 15 ? "1st" : "2nd";
  });
  
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<Record<string, "pending" | "processing" | "complete" | "failed">>({});
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedPayeeForReschedule, setSelectedPayeeForReschedule] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [rescheduleReason, setRescheduleReason] = useState<string>("bank-delay");
  const [notifyContractor, setNotifyContractor] = useState(true);
  const [showLeaveSection, setShowLeaveSection] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedLeaveContractor, setSelectedLeaveContractor] = useState<ContractorPayment | null>(null);
  const [leaveRecords, setLeaveRecords] = useState<Record<string, LeaveRecord>>({});
  const [leaveSelectorOpen, setLeaveSelectorOpen] = useState(false);
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  const [selectedLeaveWorkers, setSelectedLeaveWorkers] = useState<string[]>([]);
  const [contractorDrawerOpen, setContractorDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<ContractorPayment | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [additionalFees, setAdditionalFees] = useState<Record<string, { amount: number; accepted: boolean }>>({});
  const [scrollStates, setScrollStates] = useState<Record<string, boolean>>({});
  const [paymentDetailDrawerOpen, setPaymentDetailDrawerOpen] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<ContractorPayment | null>(null);
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
  
  // Mark as complete confirmation state
  const [isMarkCompleteConfirmOpen, setIsMarkCompleteConfirmOpen] = useState(false);
  const [hasUnresolvedIssues, setHasUnresolvedIssues] = useState(false);
  const [unresolvedIssues, setUnresolvedIssues] = useState({ blockingExceptions: 0, failedPayouts: 0, failedPostings: 0 });
  const [forceCompleteJustification, setForceCompleteJustification] = useState("");
  
  const allContractors = Object.values(contractorsByCurrency).flat();
  
  const [payrollCycleData, setPayrollCycleData] = useState<{
    previous: {
      label: string;
      totalSalaryCost: number;
      frontedFees: number;
      totalPayrollCost: number;
      completedDate?: string;
      nextPayrollRun?: string;
      nextPayrollYear?: string;
      previousBatch: { employeesPaid: number; amountProcessed: number; skippedSnoozed: number };
      status: "completed" | "active" | "upcoming";
      hasData: boolean;
    };
    current: {
      label: string;
      totalSalaryCost: number;
      frontedFees: number;
      totalPayrollCost: number;
      nextPayrollRun?: string;
      nextPayrollYear?: string;
      completedDate?: string;
      previousBatch: { employeesPaid: number; amountProcessed: number; skippedSnoozed: number };
      status: "completed" | "active" | "upcoming";
      hasData: boolean;
    };
    next: {
      label: string;
      totalSalaryCost: number | null;
      frontedFees: number | null;
      totalPayrollCost: number | null;
      nextPayrollRun?: string;
      nextPayrollYear?: string;
      opensOn?: string;
      previousBatch: { employeesPaid: number; amountProcessed: number; skippedSnoozed: number };
      status: "completed" | "active" | "upcoming";
      hasData: boolean;
    };
  }>({
    previous: {
      label: "October 2025",
      totalSalaryCost: 118240,
      frontedFees: 3547,
      totalPayrollCost: 121787,
      completedDate: "Oct 15, 2025",
      previousBatch: { employeesPaid: 8, amountProcessed: 118240, skippedSnoozed: 0 },
      status: "completed",
      hasData: true
    },
    current: {
      label: "November 2025",
      totalSalaryCost: 124850,
      frontedFees: 3742,
      totalPayrollCost: 128592,
      nextPayrollRun: "Nov 15",
      nextPayrollYear: "2025",
      previousBatch: { employeesPaid: 8, amountProcessed: 118240, skippedSnoozed: 0 },
      status: "active",
      hasData: true
    },
    next: {
      label: "December 2025",
      totalSalaryCost: null,
      frontedFees: null,
      totalPayrollCost: null,
      nextPayrollRun: "Dec 15",
      nextPayrollYear: "2025",
      opensOn: "Dec 12, 2025",
      previousBatch: { employeesPaid: 0, amountProcessed: 0, skippedSnoozed: 0 },
      status: "upcoming",
      hasData: false
    }
  });
  
  const [paymentReceipts, setPaymentReceipts] = useState([
    { payeeId: "1", payeeName: "David Martinez", amount: 4200, ccy: "EUR", status: "Paid", providerRef: "SEPA-2025-001", paidAt: new Date().toISOString(), rail: "SEPA", fxRate: 0.92, fxSpread: 0.005, fxFee: 21.0, processingFee: 25.0, eta: "1-2 business days" },
    { payeeId: "2", payeeName: "Sophie Laurent", amount: 5800, ccy: "EUR", status: "Paid", providerRef: "SEPA-2025-002", paidAt: new Date().toISOString(), rail: "SEPA", fxRate: 0.92, fxSpread: 0.005, fxFee: 29.0, processingFee: 35.0, eta: "1-2 business days" },
    { payeeId: "4", payeeName: "Alex Hansen", amount: 65000, ccy: "NOK", status: "InTransit", providerRef: "LOCAL-2025-001", rail: "Local", fxRate: 10.45, fxSpread: 0.008, fxFee: 520.0, processingFee: 250.0, eta: "Same day" },
    { payeeId: "6", payeeName: "Maria Santos", amount: 280000, ccy: "PHP", status: "InTransit", providerRef: "SWIFT-2025-001", rail: "SWIFT", fxRate: 56.2, fxSpread: 0.012, fxFee: 3360.0, processingFee: 850.0, eta: "3-5 business days" }
  ]);
  
  const currentCycleData = payrollCycleData[selectedCycle];
  
  // Filter allContractors based on employment type filter
  const filteredContractors = allContractors.filter(c => {
    if (employmentTypeFilter === "all") return true;
    return employmentTypeFilter === "employee" ? c.employmentType === "employee" : c.employmentType === "contractor";
  });
  
  const activeContractors = filteredContractors.filter(c => !snoozedWorkers.includes(c.id));
  const snoozedContractorsList = allContractors.filter(c => snoozedWorkers.includes(c.id));
  
  // Filtered workers for execution
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
    if (!acc[contractor.currency]) {
      acc[contractor.currency] = [];
    }
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
  
  // Pro-rating calculation helpers
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
  
  const handleViewLeaveDetails = (contractor: ContractorPayment) => {
    setSelectedLeaveContractor(contractor);
    setLeaveModalOpen(true);
  };
  
  const handleOpenContractorDetail = (contractor: ContractorPayment) => {
    setSelectedContractor(contractor);
    setContractorDrawerOpen(true);
  };
  
  const handleToggleAdditionalFee = (contractorId: string, accept: boolean) => {
    setAdditionalFees(prev => ({
      ...prev,
      [contractorId]: { amount: prev[contractorId]?.amount || 50, accepted: accept }
    }));
    setLastUpdated(new Date());
    toast.success(`Additional fee ${accept ? 'accepted' : 'declined'} – totals updated.`);
  };
  
  const handleTableScroll = (currency: string, e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setScrollStates(prev => ({ ...prev, [currency]: scrollLeft > 0 }));
  };
  
  const handleOpenEmployeePayroll = (employee: ContractorPayment) => {
    setSelectedEmployee(employee);
    setEmployeePayrollDrawerOpen(true);
  };
  
  const handleSaveEmployeePayroll = (data: ContractorPayment) => {
    toast.success("Employee payroll updated and recalculated");
  };
  
  const handleResolveException = (exceptionId?: string) => {
    const exception = exceptionId ? exceptions.find(exc => exc.id === exceptionId) : selectedException;
    if (!exception) return;
    setExceptions(prev => prev.map(exc => exc.id === exception.id ? { ...exc, resolved: true } : exc));
    if (exceptionId) {
      toast.success(`Exception acknowledged for ${exception.contractorName}`);
    } else {
      setFixDrawerOpen(false);
      toast.success(`Exception resolved for ${exception.contractorName}`);
    }
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
        ? {
            ...exc,
            resolved: true,
            overrideInfo: {
              overriddenBy: "Current User",
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
    
    const initialProgress: Record<string, "pending" | "processing" | "complete"> = {};
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
        errorMessage: isFailed
          ? `Payment processing error: ${contractor.employmentType === "employee" ? "Payroll system rejected posting" : "Bank account validation failed"}`
          : undefined
      });
    }
    
    setIsExecuting(false);
    const employeeCount = workersToExecute.filter(c => c.employmentType === "employee").length;
    const contractorCount = workersToExecute.filter(c => c.employmentType === "contractor").length;
    
    setExecutionLog({ timestamp: new Date(), cohort: pendingExecutionCohort, employeeCount, contractorCount, workers: logWorkers });
    
    const successCount = logWorkers.filter(w => w.status === "success").length;
    const failureCount = logWorkers.filter(w => w.status === "failed").length;
    const cohortLabel = pendingExecutionCohort === "all" ? "all workers" : pendingExecutionCohort === "employees" ? "employees" : "contractors";
    
    if (failureCount === 0) {
      toast.success(`Payroll batch processed successfully for ${cohortLabel}! ${successCount} workers completed.`);
    } else {
      toast.warning(`Batch completed with ${failureCount} failure${failureCount > 1 ? 's' : ''}. Check execution log for details.`);
    }
    setPendingExecutionCohort(null);
  };
  
  const getPaymentStatus = (contractorId: string): "Paid" | "InTransit" | "Failed" => {
    if (currentCycleData.status === "completed") return "Paid";
    const receipt = paymentReceipts.find(r => r.payeeId === contractorId);
    return receipt?.status === "Paid" ? "Paid" : receipt?.status === "InTransit" ? "InTransit" : "InTransit";
  };
  
  const filteredTrackContractors = allContractors.filter(c => {
    const matchesStatus = statusFilter === "all" || getPaymentStatus(c.id) === statusFilter;
    const matchesType = workerTypeFilter === "all" || c.employmentType === workerTypeFilter;
    return matchesStatus && matchesType;
  });
  
  const paidCount = allContractors.filter(c => getPaymentStatus(c.id) === "Paid").length;
  const pendingCount = allContractors.filter(c => getPaymentStatus(c.id) === "InTransit").length;
  const failedCount = allContractors.filter(c => getPaymentStatus(c.id) === "Failed").length;
  
  const handleCompleteAndReturnToOverview = () => {
    const blockingExcs = exceptions.filter(e => e.isBlocking && !e.resolved && !e.overrideInfo);
    const failedPayouts = executionLog?.workers.filter(w => w.status === "failed" && w.employmentType === "contractor") || [];
    const failedPostings = executionLog?.workers.filter(w => w.status === "failed" && w.employmentType === "employee") || [];
    const hasIssues = blockingExcs.length > 0 || failedPayouts.length > 0 || failedPostings.length > 0;
    
    setUnresolvedIssues({
      blockingExceptions: blockingExcs.length,
      failedPayouts: failedPayouts.length,
      failedPostings: failedPostings.length,
    });
    setHasUnresolvedIssues(hasIssues);
    setIsMarkCompleteConfirmOpen(true);
  };
  
  const confirmMarkComplete = (forced = false) => {
    setPayrollCycleData(prev => ({
      ...prev,
      current: { ...prev.current, status: "completed", completedDate: "Nov 15, 2025" }
    }));
    setIsMarkCompleteConfirmOpen(false);
    setForceCompleteJustification("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(forced ? "November payroll cycle completed with unresolved issues and is now locked" : "November payroll cycle completed");
  };
  
  const handleGoBackToFix = () => {
    setIsMarkCompleteConfirmOpen(false);
    if (unresolvedIssues.blockingExceptions > 0) {
      setCurrentStep("exceptions");
    } else {
      setCurrentStep("execute");
    }
  };
  
  const handleViewException = (workerId: string) => {
    const workerException = exceptions.find(exc => exc.contractorId === workerId);
    if (!workerException) {
      const worker = allContractors.find(c => c.id === workerId);
      if (worker) {
        const newException: PayrollException = {
          id: `exec-fail-${workerId}-${Date.now()}`,
          contractorId: workerId,
          contractorName: worker.name,
          contractorCountry: worker.country,
          type: "missing-bank",
          description: "Payment execution failed - see execution log for details",
          severity: "high",
          resolved: false,
          snoozed: false,
          ignored: false,
          canFixInPayroll: false,
          isBlocking: true
        };
        setExceptions(prev => [newException, ...prev]);
      }
    }
    setCurrentStep("exceptions");
    toast.info(`Navigated to Exceptions for ${allContractors.find(c => c.id === workerId)?.name}`);
  };
  
  // Auto-switch to Track & Reconcile for completed payrolls
  useEffect(() => {
    if (currentCycleData.status === "completed") {
      setCurrentStep("track");
    } else if (currentCycleData.status === "active" && currentStep === "track") {
      setCurrentStep("review-fx");
    }
  }, [selectedCycle, currentCycleData.status]);

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  // Calculate totals
  const employeeCount = activeContractors.filter(c => c.employmentType === "employee").length;
  const contractorCount = activeContractors.filter(c => c.employmentType === "contractor").length;
  const employeeGross = activeContractors.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + getPaymentDue(c), 0);
  const contractorGross = activeContractors.filter(c => c.employmentType === "contractor").reduce((sum, c) => sum + getPaymentDue(c), 0);

  return (
    <div className="space-y-6">
      {/* Payroll Overview Header - Matching Flow 7 exactly */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Payroll Overview</h2>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  currentCycleData.status === "completed" && "bg-green-500/10 text-green-600 border-green-500/30",
                  currentCycleData.status === "active" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                  currentCycleData.status === "upcoming" && "bg-muted text-muted-foreground"
                )}
              >
                {currentCycleData.status === "completed" ? "Completed" : currentCycleData.status === "active" ? "In Progress" : "Upcoming"}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <Select value={selectedCycle} onValueChange={(v) => setSelectedCycle(v as "previous" | "current" | "next")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">{payrollCycleData.previous.label}</SelectItem>
                  <SelectItem value="current">{payrollCycleData.current.label}</SelectItem>
                  <SelectItem value="next">{payrollCycleData.next.label}</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Country Rules Button */}
              <Button variant="outline" size="sm" onClick={() => setCountryRulesDrawerOpen(true)}>
                <Building2 className="h-4 w-4 mr-2" />
                Country Rules
              </Button>
            </div>
          </div>
          
          {/* KPI Cards - 4 cards matching Flow 7 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-muted/30 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Total Salary Cost</span>
                </div>
                <p className="text-2xl font-bold">
                  ${currentCycleData.totalSalaryCost?.toLocaleString() ?? "—"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Receipt className="h-4 w-4" />
                  <span className="text-xs font-medium">Fronted Fees Est.</span>
                </div>
                <p className="text-2xl font-bold">
                  ${currentCycleData.frontedFees?.toLocaleString() ?? "—"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-medium">Total Payroll Cost</span>
                </div>
                <p className="text-2xl font-bold">
                  ${currentCycleData.totalPayrollCost?.toLocaleString() ?? "—"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30 border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Next Payroll Run</span>
                </div>
                <p className="text-2xl font-bold">
                  {currentCycleData.status === "completed" 
                    ? (currentCycleData as any).completedDate || "Completed"
                    : currentCycleData.nextPayrollRun 
                      ? `${currentCycleData.nextPayrollRun}, ${currentCycleData.nextPayrollYear || new Date().getFullYear()}`
                      : "—"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Step Pills - Matching Flow 7 */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = index < getCurrentStepIndex();
              const isDisabled = currentCycleData.status === "upcoming";
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => !isDisabled && setCurrentStep(step.id)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-md",
                      !isActive && !isDisabled && "bg-muted/50 text-muted-foreground hover:bg-muted",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                    {step.label}
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-border" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Worker Breakdown Summary */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Employees: <span className="font-semibold text-foreground">{employeeCount}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            Contractors: <span className="font-semibold text-foreground">{contractorCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={employmentTypeFilter} onValueChange={(v) => setEmploymentTypeFilter(v as "all" | "employee" | "contractor")}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers</SelectItem>
              <SelectItem value="employee">Employees</SelectItem>
              <SelectItem value="contractor">Contractors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Step Content Placeholder - Would contain the full tables/forms from Flow 7 */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          {currentStep === "review-fx" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">FX Review</h3>
                {fxRatesLocked && lockedAt && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1.5">
                    <Lock className="h-3 w-3" />
                    Locked at {lockedAt}
                  </Badge>
                )}
              </div>
              
              {/* Leave & Attendance Section - Collapsible */}
              <Collapsible open={showLeaveSection} onOpenChange={setShowLeaveSection}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/30 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Leave & Attendance</span>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(leaveRecords).length} records
                      </Badge>
                    </div>
                    {showLeaveSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="rounded-lg border border-border/40 p-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Leave and attendance data will be displayed here. Click on a worker row to edit their leave details.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Currency Tables */}
              {Object.entries(groupedByCurrency).map(([currency, workers]) => {
                const symbol = getCurrencySymbol(currency);
                const contractorsList = workers.filter(c => c.employmentType === "contractor");
                const employeesList = workers.filter(c => c.employmentType === "employee");
                const currencyTotal = workers.reduce((sum, c) => sum + getPaymentDue(c), 0);
                
                return (
                  <div key={currency} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{currency}</h4>
                        <span className="text-sm text-muted-foreground">
                          Employees: {employeesList.length} | Contractors: {contractorsList.length}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        Total: {symbol}{currencyTotal.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* PH Bi-Monthly Toggle */}
                    {currency === "PHP" && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <span className="text-xs font-medium text-muted-foreground">Select Payout Half:</span>
                        <div className="inline-flex rounded-lg border border-border bg-background p-1 gap-1">
                          <button
                            onClick={() => setPhPayrollHalf("1st")}
                            className={cn(
                              "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                              phPayrollHalf === "1st" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            1st Half Payout
                          </button>
                          <button
                            onClick={() => setPhPayrollHalf("2nd")}
                            className={cn(
                              "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                              phPayrollHalf === "2nd" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            2nd Half Payout
                          </button>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-0.5 hover:bg-muted rounded">
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-[200px]">
                                {phPayrollHalf === "1st" 
                                  ? "1st Half (1-15): 50% of Base + 50% of Allowances (no deductions)"
                                  : "2nd Half (16-End): 50% of Base + 50% of Allowances + all mandatory deductions"
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    {/* Workers Table */}
                    <div className="rounded-lg border border-border/40 overflow-hidden">
                      <div className="overflow-x-auto" onScroll={(e) => handleTableScroll(currency, e)}>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="sticky left-0 z-20 bg-muted/30 min-w-[180px]">Worker</TableHead>
                              <TableHead className="min-w-[100px]">Type</TableHead>
                              <TableHead className="min-w-[80px] text-center">FTE%</TableHead>
                              <TableHead className="min-w-[120px]">Country</TableHead>
                              <TableHead className="min-w-[100px]">Status</TableHead>
                              <TableHead className="min-w-[110px] text-right">Gross Pay</TableHead>
                              <TableHead className="min-w-[100px] text-right">Deductions</TableHead>
                              <TableHead className="min-w-[110px] text-right">Net Pay</TableHead>
                              <TableHead className="min-w-[90px]">ETA</TableHead>
                              <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workers.map((contractor) => {
                              const paymentDue = getPaymentDue(contractor);
                              const isPHEmployee = contractor.countryCode === "PH" && contractor.employmentType === "employee";
                              const phMultiplier = isPHEmployee ? 0.5 : 1;
                              const grossPay = contractor.baseSalary * phMultiplier;
                              const netPay = isPHEmployee ? grossPay : paymentDue;
                              
                              return (
                                <TableRow 
                                  key={contractor.id} 
                                  className="hover:bg-muted/30 cursor-pointer"
                                  onClick={() => {
                                    if (contractor.employmentType === "employee") {
                                      handleOpenEmployeePayroll(contractor);
                                    } else {
                                      handleOpenContractorDetail(contractor);
                                    }
                                  }}
                                >
                                  <TableCell className={cn("font-medium sticky left-0 z-10 bg-background", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                                    {contractor.name}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        contractor.employmentType === "employee" 
                                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                                          : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                                      )}
                                    >
                                      {contractor.employmentType === "employee" ? "Employee" : "Contractor"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">{contractor.ftePercent || 100}%</TableCell>
                                  <TableCell>{contractor.country}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        contractor.status === "Active" && "bg-green-500/10 text-green-600 border-green-500/30",
                                        contractor.status === "Terminated" && "bg-red-500/10 text-red-600 border-red-500/30",
                                        contractor.status === "On Hold" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                      )}
                                    >
                                      {contractor.status || "Active"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">{symbol}{grossPay.toLocaleString()}</TableCell>
                                  <TableCell className="text-right text-muted-foreground">—</TableCell>
                                  <TableCell className="text-right font-semibold">{symbol}{Math.round(netPay).toLocaleString()}</TableCell>
                                  <TableCell>{contractor.eta}</TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-7 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSnoozeWorker(contractor.id);
                                      }}
                                    >
                                      Snooze
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Snoozed Workers Section */}
              {snoozedContractorsList.length > 0 && (
                <Collapsible open={showSnoozedSection} onOpenChange={setShowSnoozedSection}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-muted/30 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Snoozed Workers</span>
                        <Badge variant="outline" className="text-xs">{snoozedContractorsList.length}</Badge>
                      </div>
                      {showSnoozedSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-2">
                      {snoozedContractorsList.map(worker => (
                        <div key={worker.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg opacity-60">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{worker.name}</span>
                            <Badge variant="outline" className="text-xs">{worker.country}</Badge>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleUndoSnooze(worker.id)}>
                            Restore
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
          
          {currentStep === "exceptions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exceptions</h3>
                <div className="flex items-center gap-2">
                  <Select value={exceptionGroupFilter} onValueChange={(v) => setExceptionGroupFilter(v as "all" | "fixable" | "non-fixable")}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exceptions</SelectItem>
                      <SelectItem value="fixable">Fixable Here</SelectItem>
                      <SelectItem value="non-fixable">Requires External Fix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {blockingCount > 0 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {blockingCount} blocking exception{blockingCount > 1 ? 's' : ''} must be resolved before execution
                    </span>
                  </div>
                </div>
              )}
              
              {activeExceptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">All exceptions resolved!</p>
                  <p className="text-sm">You can proceed to execution.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(exceptionGroupFilter === "all" ? activeExceptions : exceptionGroupFilter === "fixable" ? fixableExceptions : nonFixableExceptions).map(exception => (
                    <Card key={exception.id} className={cn("border", exception.isBlocking ? "border-red-500/30 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5")}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{exception.contractorName}</span>
                              {exception.contractorCountry && (
                                <Badge variant="outline" className="text-xs">{exception.contractorCountry}</Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  exception.isBlocking ? "bg-red-500/10 text-red-600 border-red-500/30" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                )}
                              >
                                {exception.isBlocking ? "Blocking" : "Warning"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{exception.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {exception.canFixInPayroll ? (
                              <Button size="sm" variant="outline" onClick={() => handleResolveException(exception.id)}>
                                Fix Here
                              </Button>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="outline" disabled>
                                      External Fix Required
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">This issue must be fixed in the worker's profile or contract</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {exception.isBlocking && (
                              <Button size="sm" variant="destructive" onClick={() => handleOpenOverrideModal(exception)}>
                                Override
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleSnoozeException(exception.id)}>
                              Snooze
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === "execute" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Execute Payroll</h3>
              </div>
              
              {/* Cohort Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Employees</span>
                        </div>
                        <p className="text-2xl font-bold">{executeFilteredWorkers.filter(c => c.employmentType === "employee").length}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${executeFilteredWorkers.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + getPaymentDue(c), 0).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={() => handleExecuteClick("employees")} disabled={isExecuting || blockingCount > 0}>
                        <Send className="h-4 w-4 mr-2" />
                        Post to Payroll
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Contractors</span>
                        </div>
                        <p className="text-2xl font-bold">{executeFilteredWorkers.filter(c => c.employmentType === "contractor").length}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${executeFilteredWorkers.filter(c => c.employmentType === "contractor").reduce((sum, c) => sum + getPaymentDue(c), 0).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={() => handleExecuteClick("contractors")} disabled={isExecuting || blockingCount > 0}>
                        <Send className="h-4 w-4 mr-2" />
                        Pay via Payout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Execute All Button */}
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  onClick={() => handleExecuteClick("all")} 
                  disabled={isExecuting || blockingCount > 0}
                  className="gap-2"
                >
                  <Play className="h-5 w-5" />
                  Execute All Workers
                </Button>
              </div>
              
              {/* Execution Progress */}
              {isExecuting && (
                <Card className="border-border/40 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="font-medium">Processing payroll...</span>
                    </div>
                    <div className="space-y-2">
                      {executeFilteredWorkers.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <span>{c.name}</span>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            executionProgress[c.id] === "complete" && "bg-green-500/10 text-green-600",
                            executionProgress[c.id] === "processing" && "bg-blue-500/10 text-blue-600",
                            executionProgress[c.id] === "failed" && "bg-red-500/10 text-red-600"
                          )}>
                            {executionProgress[c.id] || "pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Execution Log */}
              {executionLog && !isExecuting && (
                <Card className="border-border/40 bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Execution Log</h4>
                    <div className="space-y-2">
                      {executionLog.workers.map(w => (
                        <div key={w.id} className="flex items-center justify-between text-sm">
                          <span>{w.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", w.status === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                              {w.status}
                            </Badge>
                            {w.status === "failed" && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleViewException(w.id)}>
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {currentStep === "track" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Track & Reconcile</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", paidCount === allContractors.length && "bg-green-500/10 text-green-600 border-green-500/30")}>
                    {paidCount}/{allContractors.length} Paid
                  </Badge>
                </div>
              </div>
              
              {/* Status Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{paidCount}</p>
                    <p className="text-sm text-muted-foreground">Paid</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">In Transit</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "Paid" | "InTransit" | "Failed")}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="InTransit">In Transit</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={workerTypeFilter} onValueChange={(v) => setWorkerTypeFilter(v as "all" | "employee" | "contractor")}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="employee">Employees</SelectItem>
                    <SelectItem value="contractor">Contractors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Track Table */}
              <div className="rounded-lg border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Worker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrackContractors.map(contractor => {
                      const status = getPaymentStatus(contractor.id);
                      const receipt = paymentReceipts.find(r => r.payeeId === contractor.id);
                      
                      return (
                        <TableRow key={contractor.id}>
                          <TableCell className="font-medium">{contractor.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", contractor.employmentType === "employee" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30")}>
                              {contractor.employmentType === "employee" ? "Employee" : "Contractor"}
                            </Badge>
                          </TableCell>
                          <TableCell>{contractor.country}</TableCell>
                          <TableCell className="text-right font-medium">
                            {getCurrencySymbol(contractor.currency)}{getPaymentDue(contractor).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", status === "Paid" && "bg-green-500/10 text-green-600 border-green-500/30", status === "InTransit" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", status === "Failed" && "bg-red-500/10 text-red-600 border-red-500/30")}>
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {receipt?.providerRef || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mark Complete Button - Company Admin version uses "Approve Payroll" */}
              {currentCycleData.status === "active" && (
                <div className="flex justify-center pt-4">
                  <Button size="lg" onClick={handleCompleteAndReturnToOverview} className="gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Approve Payroll
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Drawers and Modals */}
      <CountryRulesDrawer open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen} />
      
      {selectedEmployee && (
        <EmployeePayrollDrawer
          open={employeePayrollDrawerOpen}
          onOpenChange={setEmployeePayrollDrawerOpen}
          employee={selectedEmployee}
          onSave={handleSaveEmployeePayroll}
        />
      )}
      
      <OverrideExceptionModal
        open={overrideModalOpen}
        onOpenChange={setOverrideModalOpen}
        exception={exceptionToOverride ? {
          contractorName: exceptionToOverride.contractorName,
          type: exceptionToOverride.type,
          description: exceptionToOverride.description,
          severity: exceptionToOverride.severity,
          contractorCountry: exceptionToOverride.contractorCountry
        } : null}
        justification={overrideJustification}
        onJustificationChange={setOverrideJustification}
        onConfirm={handleConfirmOverride}
      />
      
      <LeaveAttendanceExceptionDrawer
        open={leaveAttendanceDrawerOpen}
        onOpenChange={setLeaveAttendanceDrawerOpen}
        exception={selectedLeaveException}
        onResolve={(resolution) => {
          if (selectedLeaveException) {
            if (resolution === "unpaid-leave") {
              handleResolveException(selectedLeaveException.id);
            } else if (resolution === "worked-days") {
              handleResolveException(selectedLeaveException.id);
            } else {
              handleSnoozeException(selectedLeaveException.id);
            }
            setLeaveAttendanceDrawerOpen(false);
          }
        }}
      />
      
      <ExecutionConfirmationDialog
        open={executionConfirmOpen}
        onOpenChange={setExecutionConfirmOpen}
        onConfirm={handleConfirmExecution}
        cohort={pendingExecutionCohort || "all"}
        employeeCount={executeFilteredWorkers.filter(c => c.employmentType === "employee").length}
        contractorCount={executeFilteredWorkers.filter(c => c.employmentType === "contractor").length}
        employeeTotal={executeFilteredWorkers.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + getPaymentDue(c), 0)}
        contractorTotal={executeFilteredWorkers.filter(c => c.employmentType === "contractor").reduce((sum, c) => sum + getPaymentDue(c), 0)}
        currency="USD"
      />
      
      {/* Mark Complete Confirmation Dialog */}
      <AlertDialog open={isMarkCompleteConfirmOpen} onOpenChange={setIsMarkCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasUnresolvedIssues ? "Unresolved Issues Remain" : "Approve Payroll Cycle?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasUnresolvedIssues ? (
                <div className="space-y-3">
                  <p>The following issues are still unresolved:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {unresolvedIssues.blockingExceptions > 0 && (
                      <li>{unresolvedIssues.blockingExceptions} blocking exception{unresolvedIssues.blockingExceptions > 1 ? 's' : ''}</li>
                    )}
                    {unresolvedIssues.failedPayouts > 0 && (
                      <li>{unresolvedIssues.failedPayouts} failed contractor payout{unresolvedIssues.failedPayouts > 1 ? 's' : ''}</li>
                    )}
                    {unresolvedIssues.failedPostings > 0 && (
                      <li>{unresolvedIssues.failedPostings} failed employee posting{unresolvedIssues.failedPostings > 1 ? 's' : ''}</li>
                    )}
                  </ul>
                  <div className="pt-2">
                    <Label>Justification (required to force complete)</Label>
                    <Textarea
                      value={forceCompleteJustification}
                      onChange={(e) => setForceCompleteJustification(e.target.value)}
                      placeholder="Explain why you're completing with unresolved issues..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                "This will mark the payroll cycle as complete and lock it. Are you sure?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {hasUnresolvedIssues && (
              <Button variant="outline" onClick={handleGoBackToFix}>
                Go Back to Fix
              </Button>
            )}
            <AlertDialogAction
              onClick={() => confirmMarkComplete(hasUnresolvedIssues)}
              disabled={hasUnresolvedIssues && !forceCompleteJustification.trim()}
            >
              {hasUnresolvedIssues ? "Force Approve" : "Approve Payroll"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
