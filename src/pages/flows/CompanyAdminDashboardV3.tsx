import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import AgentHeaderTags from "@/components/agent/AgentHeaderTags";
import FloatingKurtButton from "@/components/FloatingKurtButton";
import CountryRulesDrawer from "@/components/payroll/CountryRulesDrawer";
import { CA3_PayrollSection } from "@/components/flows/company-admin-v3/CA3_PayrollSection";
import { CA3_LeavesTab } from "@/components/flows/company-admin-v3/CA3_LeavesTab";
import { CA_PayrollOverviewCard } from "@/components/flows/company-admin-v2/CA_PayrollOverviewCard";
import { CA_ReviewFXTotalsCard } from "@/components/flows/company-admin-v2/CA_ReviewFXTotalsCard";
import { CA_ResolveItemsDrawer } from "@/components/flows/company-admin-v2/CA_ResolveItemsDrawer";
import { CA_IssuesBar } from "@/components/flows/company-admin-v2/CA_IssuesBar";
import { CA_CurrencyWorkersDrawer } from "@/components/flows/company-admin-v2/CA_CurrencyWorkersDrawer";
import { CA_BatchReviewHeader } from "@/components/flows/company-admin-v2/CA_BatchReviewHeader";
import { CA_ClientReviewSection } from "@/components/flows/company-admin-v2/CA_ClientReviewSection";
import { CA_AllItemsSection } from "@/components/flows/company-admin-v2/CA_AllItemsSection";
import { CA_BatchSidebar } from "@/components/flows/company-admin-v2/CA_BatchSidebar";
import { CA_RequestChangesModal } from "@/components/flows/company-admin-v2/CA_RequestChangesModal";
import { CA_ItemDetailDrawer } from "@/components/flows/company-admin-v2/CA_ItemDetailDrawer";
import { mockAdjustments, mockLeaveChanges, mockBlockingAlerts, mockFXTotalsData, mockEmployeePreviewData, mockContractorPreviewData } from "@/components/flows/company-admin-v2/CA_PayrollData";
import { CA_WorkerPreviewRow } from "@/components/flows/company-admin-v2/CA_PayrollTypes";
import { CA_PayPeriodDropdown } from "@/components/flows/company-admin-v2/CA_PayPeriodDropdown";
import { CA_CompletedPaymentDetailsCard } from "@/components/flows/company-admin-v2/CA_CompletedPaymentDetailsCard";
import { CA_PayrollRunSummaryCard } from "@/components/flows/company-admin-v2/CA_PayrollRunSummaryCard";
import { CA_FXReviewStepper, FXReviewStep } from "@/components/flows/company-admin-v2/CA_FXReviewStepper";
import { CA_LeaveAttendanceInfoRow } from "@/components/flows/company-admin-v2/CA_LeaveAttendanceInfoRow";
import { CA_LeaveAttendanceDrawer } from "@/components/flows/company-admin-v2/CA_LeaveAttendanceDrawer";
import { CA_WorkerWorkbenchDrawer, WorkbenchWorker } from "@/components/flows/company-admin-v2/CA_WorkerWorkbenchDrawer";
import { CA_BulkActionsBar } from "@/components/flows/company-admin-v2/CA_BulkActionsBar";
import { CA_BulkEditDrawer } from "@/components/flows/company-admin-v2/CA_BulkEditDrawer";
import { CA_SkipConfirmationModal, CA_ResetConfirmationModal } from "@/components/flows/company-admin-v2/CA_BulkConfirmationModals";
import { createMockBatch, mockClientReviewItems, mockBatchWorkers, mockBatchSummary, mockAuditLog } from "@/components/flows/company-admin-v2/CA_BatchData";
import { CA_Adjustment, CA_LeaveChange } from "@/components/flows/company-admin-v2/CA_PayrollTypes";
import { CA_PaymentBatch, CA_BatchAdjustment } from "@/components/flows/company-admin-v2/CA_BatchTypes";
import { CA_PayrollModePill, CA_PayrollModeTableBadge, CA_PayrollModeWorkerTag, getPayrollModeForCountry } from "@/components/flows/company-admin-v2/CA_PayrollModeIndicator";
import EmployeePayrollDrawer from "@/components/payroll/EmployeePayrollDrawer";
import LeaveDetailsDrawer from "@/components/payroll/LeaveDetailsDrawer";
import { OverrideExceptionModal } from "@/components/payroll/OverrideExceptionModal";
import { LeaveAttendanceExceptionDrawer } from "@/components/payroll/LeaveAttendanceExceptionDrawer";
import { ExecutionMonitor } from "@/components/payroll/ExecutionMonitor";
import { ExecutionConfirmationDialog } from "@/components/payroll/ExecutionConfirmationDialog";
import { ExecutionLog, ExecutionLogData, ExecutionLogWorker } from "@/components/payroll/ExecutionLog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, CheckSquare, Play, TrendingUp, RefreshCw, Lock, Info, Clock, X, XCircle, AlertCircle, Download, FileText, Building2, Receipt, Activity, Settings, Plus, Check, Search, Users, Briefcase, Send, Calendar } from "lucide-react";
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
// V3 Simplified step flow: Review → Resolve Checks → Submit to Fronted → Track
type PayrollStep = "review" | "resolve" | "submit" | "track";
const steps = [{
  id: "review",
  label: "Review",
  icon: DollarSign
}, {
  id: "resolve",
  label: "Resolve Checks",
  icon: AlertTriangle
}, {
  id: "submit",
  label: "Submit",
  icon: Send
}, {
  id: "track",
  label: "Track",
  icon: TrendingUp
}] as const;
interface LeaveRecord {
  contractorId: string;
  leaveDays: number;
  workingDays: number;
  leaveReason?: string;
  leaveDate?: string;
  approvedBy?: string;
  clientConfirmed: boolean;
  contractorReported: boolean;
  // Enhanced leave tracking
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
  endDate?: string; // ISO date string for last working day
  // Contractor compensation type fields
  compensationType?: "Monthly" | "Daily" | "Hourly" | "Project-Based";
  hourlyRate?: number;
  hoursWorked?: number;
  expectedMonthlyHours?: number;
  // Override settings for this payroll cycle
  allowEmploymentOverride?: boolean;
  // Employee-specific fields
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
  // PH specific
  sssEmployee?: number;
  sssEmployer?: number;
  philHealthEmployee?: number;
  philHealthEmployer?: number;
  pagIbigEmployee?: number;
  pagIbigEmployer?: number;
  withholdingTax?: number;
  withholdingTaxOverride?: boolean;
  // NO specific
  holidayPay?: number;
  employerTax?: number;
  pension?: number;
  allowOverride?: boolean;
  // Additional payroll fields
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
  canFixInPayroll: boolean; // Can be resolved within payroll vs requires external fix
  isBlocking: boolean; // Blocks execution unless overridden
  overrideInfo?: {
    overriddenBy: string;
    overriddenAt: string;
    justification: string;
  };
}
const initialExceptions: PayrollException[] = [{
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
  // Can be fixed by opening worker panel
  isBlocking: true // Blocks execution
}, {
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
  // Must be fixed in contract/profile
  isBlocking: false // Warning only
}];
const contractorsByCurrency: Record<string, ContractorPayment[]> = {
  EUR: [{
    id: "1",
    name: "David Martinez",
    country: "Portugal",
    countryCode: "PT",
    baseSalary: 4200,
    netPay: 4200,
    currency: "EUR",
    estFees: 25,
    fxRate: 0.92,
    recvLocal: 4200,
    eta: "Oct 30",
    employmentType: "contractor",
    status: "Active"
  }, {
    id: "2",
    name: "Sophie Laurent",
    country: "France",
    countryCode: "FR",
    baseSalary: 5800,
    netPay: 5800,
    currency: "EUR",
    estFees: 35,
    fxRate: 0.92,
    recvLocal: 5800,
    eta: "Oct 30",
    employmentType: "employee",
    employerTaxes: 1740,
    status: "Active",
    endDate: "2025-12-15" // Upcoming contract end example
  }, {
    id: "3",
    name: "Marco Rossi",
    country: "Italy",
    countryCode: "IT",
    baseSalary: 4500,
    netPay: 4500,
    currency: "EUR",
    estFees: 28,
    fxRate: 0.92,
    recvLocal: 4500,
    eta: "Oct 30",
    employmentType: "contractor",
    status: "Terminated" // Example of status mismatch
  }],
  NOK: [{
    id: "4",
    name: "Alex Hansen",
    country: "Norway",
    countryCode: "NO",
    baseSalary: 65000,
    netPay: 65000,
    currency: "NOK",
    estFees: 250,
    fxRate: 10.45,
    recvLocal: 65000,
    eta: "Oct 31",
    employmentType: "employee",
    employerTaxes: 9750,
    status: "Active",
    endDate: "2025-11-12" // Employment ending this period (Nov 1-15)
  }, {
    id: "5",
    name: "Emma Wilson",
    country: "Norway",
    countryCode: "NO",
    baseSalary: 72000,
    netPay: 72000,
    currency: "NOK",
    estFees: 280,
    fxRate: 10.45,
    recvLocal: 72000,
    eta: "Oct 31",
    employmentType: "contractor",
    status: "Active"
  }],
  PHP: [{
    id: "6",
    name: "Maria Santos",
    country: "Philippines",
    countryCode: "PH",
    baseSalary: 280000,
    netPay: 280000,
    currency: "PHP",
    estFees: 850,
    fxRate: 56.2,
    recvLocal: 280000,
    eta: "Oct 30",
    employmentType: "employee",
    employerTaxes: 42000,
    status: "Active"
  }, {
    id: "7",
    name: "Jose Reyes",
    country: "Philippines",
    countryCode: "PH",
    baseSalary: 245000,
    netPay: 245000,
    currency: "PHP",
    estFees: 750,
    fxRate: 56.2,
    recvLocal: 245000,
    eta: "Oct 30",
    employmentType: "contractor",
    status: "Active"
  }, {
    id: "8",
    name: "Luis Hernandez",
    country: "Philippines",
    countryCode: "PH",
    baseSalary: 260000,
    netPay: 260000,
    currency: "PHP",
    estFees: 800,
    fxRate: 56.2,
    recvLocal: 260000,
    eta: "Oct 30",
    employmentType: "contractor",
    status: "Active",
    endDate: "2025-10-28" // End date before current period (Nov 1-15)
  }, {
    id: "9",
    name: "Carlos Diaz",
    country: "Philippines",
    countryCode: "PH",
    baseSalary: 0,
    // Not used for hourly
    netPay: 0,
    // Will be calculated
    currency: "PHP",
    estFees: 450,
    fxRate: 56.2,
    recvLocal: 0,
    eta: "Oct 30",
    employmentType: "contractor",
    status: "Active",
    compensationType: "Hourly",
    hourlyRate: 850,
    hoursWorked: 160,
    expectedMonthlyHours: 160
  }]
};
const CompanyAdminDashboardV3: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOpen: isDrawerOpen,
    toggle: toggleDrawer
  } = useDashboardDrawer();
  const {
    isSpeaking,
    addMessage,
    setLoading,
    setOpen
  } = useAgentState();
  const {
    getSettings
  } = useCountrySettings();
  const [viewMode, setViewMode] = useState<"payroll" | "batch-review">("payroll");
  // Main dashboard tab state
  const [activeTab, setActiveTab] = useState<"payroll" | "leaves">("payroll");
  // workersSearchQuery removed - Workers table removed from this flow

  // Batch Review State
  const [currentBatch, setCurrentBatch] = useState<CA_PaymentBatch | null>(null);
  const [batchClientReviewItems, setBatchClientReviewItems] = useState<CA_BatchAdjustment[]>(mockClientReviewItems);
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false);
  const [itemDetailDrawerOpen, setItemDetailDrawerOpen] = useState(false);
  const [selectedBatchItem, setSelectedBatchItem] = useState<CA_BatchAdjustment | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review");
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

  // Execution log state - persists last batch results
  const [executionLog, setExecutionLog] = useState<ExecutionLogData | null>(null);
  // PH bi-monthly payroll toggle (1st-half / 2nd-half)
  const [phPayrollHalf, setPhPayrollHalf] = useState<"1st" | "2nd">(() => {
    const currentDay = new Date().getDate();
    return currentDay < 15 ? "1st" : "2nd";
  });
  // Approval logic temporarily disabled - auto-approved for MVP
  // TODO: reinstate dual-approval flow later
  const approvalStatus = "auto-approved";
  const [userRole] = useState<"admin" | "user">("admin");
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
  const [additionalFees, setAdditionalFees] = useState<Record<string, {
    amount: number;
    accepted: boolean;
  }>>({});
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
  const [contractorAdjustments, setContractorAdjustments] = useState<Record<string, Array<{
    id: string;
    name: string;
    amount: number;
  }>>>({});
  const [contractors, setContractors] = useState<ContractorPayment[]>(() => [...contractorsByCurrency.EUR, ...contractorsByCurrency.NOK, ...contractorsByCurrency.PHP]);
  const allContractors = Object.values(contractorsByCurrency).flat();

  // Mark as complete confirmation state
  const [isMarkCompleteConfirmOpen, setIsMarkCompleteConfirmOpen] = useState(false);
  const [hasUnresolvedIssues, setHasUnresolvedIssues] = useState(false);
  const [unresolvedIssues, setUnresolvedIssues] = useState({
    blockingExceptions: 0,
    failedPayouts: 0,
    failedPostings: 0
  });
  const [forceCompleteJustification, setForceCompleteJustification] = useState("");

  // Flow 6 v2 - Enhanced Payroll State
  const [resolveDrawerOpen, setResolveDrawerOpen] = useState(false);
  const [resolveDrawerPreSelectedCurrency, setResolveDrawerPreSelectedCurrency] = useState<string | undefined>(undefined);
  const [currencyWorkersDrawerOpen, setCurrencyWorkersDrawerOpen] = useState(false);
  const [currencyWorkersDrawerCurrency, setCurrencyWorkersDrawerCurrency] = useState<string>("");
  const [caAdjustments, setCaAdjustments] = useState<CA_Adjustment[]>(mockAdjustments);
  const [caLeaveChanges, setCaLeaveChanges] = useState<CA_LeaveChange[]>(mockLeaveChanges);
  const [caFxFilter, setCaFxFilter] = useState<"all" | "employees" | "contractors">("all");
  const [caSelectedCountries, setCaSelectedCountries] = useState<string[]>([]);

  // Worker Workbench Drawer state (FX Review step)
  const [workerWorkbenchOpen, setWorkerWorkbenchOpen] = useState(false);
  const [selectedWorkbenchWorker, setSelectedWorkbenchWorker] = useState<WorkbenchWorker | null>(null);

  // Bulk selection state (FX Review step) - per currency table
  const [selectedWorkersByCurrency, setSelectedWorkersByCurrency] = useState<Record<string, Set<string>>>({});
  const [bulkEditDrawerOpen, setBulkEditDrawerOpen] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState<"edit" | "adjustment">("edit");
  const [skipConfirmationOpen, setSkipConfirmationOpen] = useState(false);
  const [resetConfirmationOpen, setResetConfirmationOpen] = useState(false);
  const [currentBulkCurrency, setCurrentBulkCurrency] = useState<string>("");
  const [skippedWorkerIds, setSkippedWorkerIds] = useState<Set<string>>(new Set());

  // Bulk selection handlers
  const getSelectedWorkersForCurrency = (currency: string): string[] => {
    return Array.from(selectedWorkersByCurrency[currency] || new Set());
  };
  const getSelectedWorkersCount = (currency: string): number => {
    return selectedWorkersByCurrency[currency]?.size || 0;
  };
  const isWorkerSelected = (currency: string, workerId: string): boolean => {
    return selectedWorkersByCurrency[currency]?.has(workerId) || false;
  };
  const toggleWorkerSelection = (currency: string, workerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedWorkersByCurrency(prev => {
      const currentSet = new Set(prev[currency] || []);
      if (currentSet.has(workerId)) {
        currentSet.delete(workerId);
      } else {
        currentSet.add(workerId);
      }
      return {
        ...prev,
        [currency]: currentSet
      };
    });
  };
  const toggleSelectAll = (currency: string, workerIds: string[], isAllSelected: boolean) => {
    setSelectedWorkersByCurrency(prev => {
      if (isAllSelected) {
        return {
          ...prev,
          [currency]: new Set()
        };
      } else {
        return {
          ...prev,
          [currency]: new Set(workerIds)
        };
      }
    });
  };
  const clearSelection = (currency: string) => {
    setSelectedWorkersByCurrency(prev => ({
      ...prev,
      [currency]: new Set()
    }));
  };
  const handleBulkEdit = (currency: string) => {
    setCurrentBulkCurrency(currency);
    setBulkEditMode("edit");
    setBulkEditDrawerOpen(true);
  };
  const handleBulkAddAdjustment = (currency: string) => {
    setCurrentBulkCurrency(currency);
    setBulkEditMode("adjustment");
    setBulkEditDrawerOpen(true);
  };
  const handleBulkSkip = (currency: string) => {
    setCurrentBulkCurrency(currency);
    setSkipConfirmationOpen(true);
  };
  const handleBulkReset = (currency: string) => {
    setCurrentBulkCurrency(currency);
    setResetConfirmationOpen(true);
  };
  const confirmBulkSkip = () => {
    const selectedIds = getSelectedWorkersForCurrency(currentBulkCurrency);
    setSkippedWorkerIds(prev => {
      const newSet = new Set(prev);
      selectedIds.forEach(id => newSet.add(id));
      return newSet;
    });
    clearSelection(currentBulkCurrency);
    setSkipConfirmationOpen(false);
    toast.success(`${selectedIds.length} worker${selectedIds.length !== 1 ? 's' : ''} skipped for this batch`);
  };
  const confirmBulkReset = () => {
    const selectedIds = getSelectedWorkersForCurrency(currentBulkCurrency);
    // In a real implementation, this would reset overrides
    clearSelection(currentBulkCurrency);
    setResetConfirmationOpen(false);
    toast.success(`Reset payroll overrides for ${selectedIds.length} worker${selectedIds.length !== 1 ? 's' : ''}`);
  };
  const handleBulkEditApply = (data: any) => {
    const selectedIds = getSelectedWorkersForCurrency(currentBulkCurrency);
    // In a real implementation, this would apply the changes
    console.log("Applying bulk edit to workers:", selectedIds, data);
    clearSelection(currentBulkCurrency);
    toast.success(`Applied changes to ${selectedIds.length} worker${selectedIds.length !== 1 ? 's' : ''}`);
  };
  const getSelectedWorkersData = (currency: string) => {
    const selectedIds = getSelectedWorkersForCurrency(currency);
    const currencyWorkers = contractorsByCurrency[currency] || [];
    return currencyWorkers.filter(w => selectedIds.includes(w.id)).map(w => ({
      id: w.id,
      name: w.name,
      country: w.country,
      currency: w.currency,
      employmentType: w.employmentType
    }));
  };

  // Handler for opening Worker Workbench drawer from FX Review tables
  const handleOpenWorkerWorkbench = (contractor: ContractorPayment) => {
    const workbenchWorker: WorkbenchWorker = {
      id: contractor.id,
      name: contractor.name,
      employmentType: contractor.employmentType,
      country: contractor.country,
      countryCode: contractor.countryCode,
      currency: contractor.currency,
      payFrequency: "Monthly",
      baseSalary: contractor.baseSalary,
      grossPay: contractor.baseSalary,
      netPay: contractor.netPay || contractor.baseSalary,
      estFees: contractor.estFees,
      employerTaxes: contractor.employerTaxes,
      deductions: contractor.withholdingTax,
      startDate: contractor.startDate,
      endDate: contractor.endDate,
      status: contractor.status,
      ftePercent: contractor.ftePercent,
      compensationType: contractor.compensationType,
      hourlyRate: contractor.hourlyRate,
      hoursWorked: contractor.hoursWorked
    };
    setSelectedWorkbenchWorker(workbenchWorker);
    setWorkerWorkbenchOpen(true);
  };

  // Handle save and recalculate from workbench drawer
  const handleWorkbenchSaveAndRecalculate = (workerId: string, updates: any) => {
    // In a real implementation, this would update the contractor data and recalculate totals
    console.log("Recalculating for worker:", workerId, updates);
    // For now, just show a toast - the mock data doesn't persist
    toast.success("Payroll totals recalculated");
  };
  const handleResolveWithCurrency = (currency?: string) => {
    setResolveDrawerPreSelectedCurrency(currency);
    setResolveDrawerOpen(true);
  };
  const handleNetToPayClick = (currency: string) => {
    setCurrencyWorkersDrawerCurrency(currency);
    setCurrencyWorkersDrawerOpen(true);
  };

  // Get workers by currency for the drawer
  const getWorkersByCurrency = (currency: string): {
    employees: CA_WorkerPreviewRow[];
    contractors: CA_WorkerPreviewRow[];
  } => {
    const employees = mockEmployeePreviewData.filter(e => e.currency === currency);
    const contractors = mockContractorPreviewData.filter(c => c.currency === currency);
    return {
      employees,
      contractors
    };
  };
  const handleApproveAdjustment = (id: string) => {
    setCaAdjustments(prev => prev.map(a => a.id === id ? {
      ...a,
      status: "approved" as const
    } : a));
    toast.success("Adjustment approved");
  };
  const handleRejectAdjustment = (id: string) => {
    setCaAdjustments(prev => prev.map(a => a.id === id ? {
      ...a,
      status: "rejected" as const
    } : a));
    toast.info("Adjustment rejected");
  };
  const handleApproveLeave = (id: string) => {
    setCaLeaveChanges(prev => prev.map(l => l.id === id ? {
      ...l,
      status: "approved" as const
    } : l));
    toast.success("Leave approved");
  };
  const handleRejectLeave = (id: string) => {
    setCaLeaveChanges(prev => prev.map(l => l.id === id ? {
      ...l,
      status: "rejected" as const
    } : l));
    toast.info("Leave rejected");
  };
  const handleCreateBatch = () => {
    const batch = createMockBatch();
    setCurrentBatch(batch);
    setBatchClientReviewItems(mockClientReviewItems);
    setCurrentStep("review"); // Reset to first step when creating batch
    toast.success("Payment batch created.");
  };
  const handleApproveBatchItem = (id: string) => {
    setBatchClientReviewItems(prev => prev.map(item => item.id === id ? {
      ...item,
      status: "approved" as const
    } : item));
    toast.success("Adjustment approved");
  };
  const handleRejectBatchItem = (id: string) => {
    setBatchClientReviewItems(prev => prev.map(item => item.id === id ? {
      ...item,
      status: "rejected" as const
    } : item));
    toast.info("Adjustment rejected");
  };
  const handleApproveAllBatchItems = () => {
    setBatchClientReviewItems(prev => prev.map(item => item.status === "client_review" ? {
      ...item,
      status: "approved" as const
    } : item));
    toast.success("All adjustments approved");
  };
  const handleViewBatchItem = (id: string) => {
    const item = batchClientReviewItems.find(i => i.id === id);
    setSelectedBatchItem(item);
    setItemDetailDrawerOpen(true);
  };
  const handleApproveBatch = () => {
    if (!currentBatch) return;
    setCurrentBatch({
      ...currentBatch,
      status: "client_approved"
    });
    toast.success(`Batch approved. Fronted will execute on ${currentBatch.payoutDate}.`);
  };
  const handleRequestChanges = (reason: string) => {
    if (!currentBatch) return;
    setCurrentBatch({
      ...currentBatch,
      status: "requires_changes"
    });
    toast.success("Request sent. We'll notify you when it's resolved.");
    setViewMode("payroll");
  };
  const handleBackToPayroll = () => {
    setCurrentBatch(null);
    setCurrentStep("review");
    setViewMode("payroll");
  };

  // Filter allContractors based on employment type filter
  const filteredContractors = allContractors.filter(c => {
    if (employmentTypeFilter === "all") return true;
    return employmentTypeFilter === "employee" ? c.employmentType === "employee" : c.employmentType === "contractor";
  });

  // Split contractors into active and snoozed
  const activeContractors = filteredContractors.filter(c => !snoozedWorkers.includes(c.id));
  const snoozedContractorsList = allContractors.filter(c => snoozedWorkers.includes(c.id));

  // Handler functions for snooze
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

  // Filtered workers for execution based on selections and snoozed state
  const executeFilteredWorkers = allContractors.filter(c => {
    // First, exclude snoozed workers
    if (snoozedWorkers.includes(c.id)) return false;

    // Filter by employment type
    if (executeEmploymentType === 'employees') {
      if (c.employmentType !== 'employee') return false;

      // Additional filters for employees only
      if (selectedCountries.length > 0 && !selectedCountries.includes(c.countryCode)) return false;
      // Payout period filtering would go here if we had the data to support it
    } else if (executeEmploymentType === 'contractors') {
      if (c.employmentType !== 'contractor') return false;
    }
    return true;
  });
  const [payrollCycleData, setPayrollCycleData] = useState<{
    previous: {
      label: string;
      totalSalaryCost: number;
      frontedFees: number;
      totalPayrollCost: number;
      completedDate?: string;
      nextPayrollRun?: string;
      nextPayrollYear?: string;
      previousBatch: {
        employeesPaid: number;
        amountProcessed: number;
        skippedSnoozed: number;
      };
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
      previousBatch: {
        employeesPaid: number;
        amountProcessed: number;
        skippedSnoozed: number;
      };
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
      previousBatch: {
        employeesPaid: number;
        amountProcessed: number;
        skippedSnoozed: number;
      };
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
      previousBatch: {
        employeesPaid: 8,
        amountProcessed: 118240,
        skippedSnoozed: 0
      },
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
      previousBatch: {
        employeesPaid: 8,
        amountProcessed: 118240,
        skippedSnoozed: 0
      },
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
      previousBatch: {
        employeesPaid: 0,
        amountProcessed: 0,
        skippedSnoozed: 0
      },
      status: "upcoming",
      hasData: false
    }
  });

  // Pro-rating calculation helpers
  const calculateProratedPay = (baseSalary: number, leaveDays: number, workingDays: number = 21.67, countryCode?: string) => {
    // Use country-specific divisor from Country Settings
    const isPH = countryCode === "PH";
    const isNO = countryCode === "NO";
    const phSettings = getSettings("PH");
    const noSettings = getSettings("NO");
    const daysPerMonth = isPH ? phSettings.daysPerMonth : isNO ? noSettings.daysPerMonth : workingDays;
    const dailyRate = baseSalary / daysPerMonth;
    const payDays = daysPerMonth - leaveDays;
    const proratedPay = dailyRate * payDays;
    return {
      dailyRate,
      payDays,
      proratedPay,
      difference: baseSalary - proratedPay
    };
  };
  const getPaymentDue = (contractor: ContractorPayment): number => {
    // For hourly contractors, calculate based on hours worked
    if (contractor.compensationType === "Hourly" && contractor.hourlyRate && contractor.hoursWorked) {
      const basePayment = contractor.hourlyRate * contractor.hoursWorked;
      const adjustments = getTotalAdjustments(contractor.id);
      return basePayment + adjustments;
    }
    const leaveData = leaveRecords[contractor.id];
    let payment = contractor.baseSalary;
    if (leaveData && leaveData.leaveDays > 0) {
      const {
        proratedPay
      } = calculateProratedPay(contractor.baseSalary, leaveData.leaveDays, leaveData.workingDays, contractor.countryCode // Pass country code for correct divisor
      );
      payment = proratedPay;
    }

    // Add adjustments
    const adjustments = getTotalAdjustments(contractor.id);
    return payment + adjustments;
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
  const handleSaveContractorAdjustment = () => {
    if (selectedContractor) {
      // In real implementation, update contractor payment data
      toast.success(`Changes saved for ${selectedContractor.name}. Totals recalculated.`);
      setLastUpdated(new Date());
      setContractorDrawerOpen(false);
    }
  };
  const addContractorAdjustment = (contractorId: string) => {
    setContractorAdjustments(prev => ({
      ...prev,
      [contractorId]: [...(prev[contractorId] || []), {
        id: Date.now().toString(),
        name: "",
        amount: 0
      }]
    }));
  };
  const updateContractorAdjustment = (contractorId: string, adjustmentId: string, field: "name" | "amount", value: string | number) => {
    setContractorAdjustments(prev => ({
      ...prev,
      [contractorId]: (prev[contractorId] || []).map(adj => adj.id === adjustmentId ? {
        ...adj,
        [field]: value
      } : adj)
    }));
  };
  const removeContractorAdjustment = (contractorId: string, adjustmentId: string) => {
    setContractorAdjustments(prev => ({
      ...prev,
      [contractorId]: (prev[contractorId] || []).filter(adj => adj.id !== adjustmentId)
    }));
  };
  const getTotalAdjustments = (contractorId: string) => {
    const adjustments = contractorAdjustments[contractorId] || [];
    return adjustments.reduce((sum, adj) => sum + (Number(adj.amount) || 0), 0);
  };
  const getLeaveDeduction = (contractor: ContractorPayment): number => {
    const leaveData = leaveRecords[contractor.id];
    if (!leaveData || leaveData.leaveDays === 0) {
      return 0;
    }
    const {
      proratedPay
    } = calculateProratedPay(contractor.baseSalary, leaveData.leaveDays, leaveData.workingDays, contractor.countryCode // Pass country code for correct divisor
    );
    return contractor.baseSalary - proratedPay;
  };
  const handleToggleAdditionalFee = (contractorId: string, accept: boolean) => {
    setAdditionalFees(prev => ({
      ...prev,
      [contractorId]: {
        amount: prev[contractorId]?.amount || 50,
        accepted: accept
      }
    }));
    setLastUpdated(new Date());
    toast.success(`Additional fee ${accept ? 'accepted' : 'declined'} – totals updated.`);
  };
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) !== 1 ? 's' : ''} ago`;
  };
  const handleTableScroll = (currency: string, e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setScrollStates(prev => ({
      ...prev,
      [currency]: scrollLeft > 0
    }));
  };
  const [paymentReceipts, setPaymentReceipts] = useState([{
    payeeId: "1",
    payeeName: "David Martinez",
    amount: 4200,
    ccy: "EUR",
    status: "Paid",
    providerRef: "SEPA-2025-001",
    paidAt: new Date().toISOString(),
    rail: "SEPA",
    fxRate: 0.92,
    fxSpread: 0.005,
    fxFee: 21.0,
    processingFee: 25.0,
    eta: "1-2 business days"
  }, {
    payeeId: "2",
    payeeName: "Sophie Laurent",
    amount: 5800,
    ccy: "EUR",
    status: "Paid",
    providerRef: "SEPA-2025-002",
    paidAt: new Date().toISOString(),
    rail: "SEPA",
    fxRate: 0.92,
    fxSpread: 0.005,
    fxFee: 29.0,
    processingFee: 35.0,
    eta: "1-2 business days"
  }, {
    payeeId: "4",
    payeeName: "Alex Hansen",
    amount: 65000,
    ccy: "NOK",
    status: "InTransit",
    providerRef: "LOCAL-2025-001",
    rail: "Local",
    fxRate: 10.45,
    fxSpread: 0.008,
    fxFee: 520.0,
    processingFee: 250.0,
    eta: "Same day"
  }, {
    payeeId: "6",
    payeeName: "Maria Santos",
    amount: 280000,
    ccy: "PHP",
    status: "InTransit",
    providerRef: "SWIFT-2025-001",
    rail: "SWIFT",
    fxRate: 56.2,
    fxSpread: 0.012,
    fxFee: 3360.0,
    processingFee: 850.0,
    eta: "3-5 business days"
  }]);
  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };
  const currentCycleData = payrollCycleData[selectedCycle];

  // Auto-switch to Track & Reconcile for completed payrolls
  React.useEffect(() => {
    if (currentCycleData.status === "completed") {
      setCurrentStep("track");
    } else if (currentCycleData.status === "active" && currentStep === "track") {
      setCurrentStep("review");
    }
  }, [selectedCycle, currentCycleData.status]);

  // Validate and generate exceptions based on contractor data (only on initial load)
  React.useEffect(() => {
    const validatePayrollExceptions = (contractors: ContractorPayment[]): PayrollException[] => {
      const detectedExceptions: PayrollException[] = [...initialExceptions];
      let exceptionCounter = detectedExceptions.length + 1;
      contractors.forEach(contractor => {
        const isPH = contractor.countryCode === "PH";
        const isEmployee = contractor.employmentType === "employee";

        // Mini Prompt 1: Minimum Wage Validation (PH only)
        if (isPH) {
          const monthlyMinimumWage = 13000; // Example: PHP 13,000 minimum wage
          const dailyMinimumWage = 570; // Example: PHP 570 daily minimum
          const dailyRate = contractor.baseSalary / 22; // Using default divisor

          if (contractor.baseSalary < monthlyMinimumWage || dailyRate < dailyMinimumWage) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "below-minimum-wage",
              description: "Salary below minimum wage for this region.",
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: true
            });
          }
        }

        // Mini Prompt 2: Validate Allowances Exceeding Caps (PH only)
        if (isPH && isEmployee && contractor.lineItems) {
          const nonTaxableAllowances = contractor.lineItems.filter(item => !item.taxable);
          const totalNonTaxable = nonTaxableAllowances.reduce((sum, item) => sum + item.amount, 0);
          const allowanceCap = 90000; // Example: PHP 90,000 annual cap / 12 = 7,500 monthly

          if (totalNonTaxable > allowanceCap) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "allowance-exceeds-cap",
              description: "Non-taxable allowance exceeds government cap. Excess will be taxable.",
              severity: "medium",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: false
            });
          }
        }

        // Mini Prompt 3: Missing Govt. ID Numbers (PH only)
        if (isPH && isEmployee) {
          const missingIds: string[] = [];
          if (!contractor.nationalId) missingIds.push("TIN");
          if (!contractor.sssEmployee) missingIds.push("SSS");
          if (!contractor.philHealthEmployee) missingIds.push("PhilHealth");
          if (!contractor.pagIbigEmployee) missingIds.push("Pag-IBIG");
          if (missingIds.length > 0) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "missing-govt-id",
              description: `Missing mandatory government ID: ${missingIds.join(", ")}`,
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: false,
              // Must be fixed in worker profile
              isBlocking: true
            });
          }
        }

        // Mini Prompt 4: Incorrect Contribution Tier Based on Salary (PH only)
        if (isPH && isEmployee && contractor.sssEmployee) {
          // Example SSS brackets (simplified)
          const sssTable = [{
            min: 0,
            max: 4250,
            contribution: 180
          }, {
            min: 4250,
            max: 4750,
            contribution: 202.50
          }, {
            min: 4750,
            max: 5250,
            contribution: 225
          }, {
            min: 5250,
            max: 5750,
            contribution: 247.50
          }
          // ... more brackets
          ];
          const monthlySalary = contractor.baseSalary;
          const correctBracket = sssTable.find(b => monthlySalary >= b.min && monthlySalary < b.max);
          if (correctBracket && contractor.sssEmployee !== correctBracket.contribution) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "incorrect-contribution-tier",
              description: "Contribution tier does not match correct salary bracket.",
              severity: "medium",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: false
            });
          }
        }

        // Mini Prompt 5: 13th Month Pay Not Included (PH employees only)
        if (isPH && isEmployee) {
          const has13thMonth = contractor.lineItems?.some(item => item.name.toLowerCase().includes("13th month"));
          if (!has13thMonth) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "missing-13th-month",
              description: "13th month is mandatory for this worker type.",
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: true
            });
          }
        }

        // Mini Prompt 6: OT/Holiday Pay Type Not Selected
        // Placeholder for when overtimeHolidayEntries are available in contractor data

        // Mini Prompt 7: Invalid Work Type Combination
        // Placeholder for when overtimeHolidayEntries are available

        // Mini Prompt 8: Night Differential Outside Valid Hours
        // Placeholder for when time-based entries are available

        // Mini Prompt 9: Missing Employer Cost for SSS (PH employees only)
        if (isPH && isEmployee && contractor.sssEmployee && !contractor.sssEmployer) {
          detectedExceptions.push({
            id: `exc-${exceptionCounter++}`,
            contractorId: contractor.id,
            contractorName: contractor.name,
            contractorCountry: contractor.country,
            type: "missing-employer-sss",
            description: "Employer SSS contribution is required.",
            severity: "high",
            resolved: false,
            snoozed: false,
            ignored: false,
            canFixInPayroll: true,
            isBlocking: true
          });
        }

        // Mini Prompt 10: Withholding Tax Input Missing When Required
        if (isEmployee && contractor.withholdingTax === undefined) {
          detectedExceptions.push({
            id: `exc-${exceptionCounter++}`,
            contractorId: contractor.id,
            contractorName: contractor.name,
            contractorCountry: contractor.country,
            type: "missing-withholding-tax",
            description: "Withholding Tax rate or fixed amount is required.",
            severity: "medium",
            resolved: false,
            snoozed: false,
            ignored: false,
            canFixInPayroll: true,
            isBlocking: false
          });
        }

        // Status Check: Inactive workers in batch
        const workerStatus = contractor.status || "Active";
        if (workerStatus !== "Active") {
          detectedExceptions.push({
            id: `exc-${exceptionCounter++}`,
            contractorId: contractor.id,
            contractorName: contractor.name,
            contractorCountry: contractor.country,
            type: "status-mismatch",
            description: `This worker is not marked as Active (current status: ${workerStatus}). Review if they should be included in this pay run.`,
            severity: "high",
            resolved: false,
            snoozed: false,
            ignored: false,
            canFixInPayroll: true,
            isBlocking: false
          });
        }

        // End-date checks (only for Active workers)
        if (workerStatus === "Active" && contractor.endDate) {
          const endDate = new Date(contractor.endDate);
          // Current payroll period: November 1-15, 2025
          const periodStart = new Date("2025-11-01");
          const periodEnd = new Date("2025-11-15");
          const periodEndPlus30 = new Date(periodEnd);
          periodEndPlus30.setDate(periodEndPlus30.getDate() + 30);

          // Check if end date falls inside current payroll period
          if (endDate >= periodStart && endDate <= periodEnd) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "employment-ending-this-period",
              description: `Employee ending this month — verify prorated pay. Last working day: ${format(endDate, "MMM d, yyyy")}.`,
              severity: "medium",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: false
            });
          }
          // Check if end date is before current period
          else if (endDate < periodStart) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "end-date-before-period",
              description: `This worker's end date (${format(endDate, "MMM d, yyyy")}) is before this pay period. Confirm if they should be removed from this run.`,
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: false
            });
          }
          // Check if end date is within 30 days after period (non-blocking info)
          else if (endDate > periodEnd && endDate <= periodEndPlus30) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "upcoming-contract-end",
              description: `This worker's contract ends on ${format(endDate, "MMM d, yyyy")}. Check if any final pay or adjustments are needed next cycle.`,
              severity: "low",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: false,
              isBlocking: false
            });
          }
        }

        // Mini Prompt B: Missing Hours for Hourly Contractors
        if (contractor.employmentType === "contractor" && contractor.compensationType === "Hourly") {
          if (!contractor.hoursWorked || contractor.hoursWorked === 0) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "missing-hours",
              description: "Enter the total hours worked this period to calculate pay.",
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: true
            });
          }
        }

        // NEW: Missing Start Date or End Date
        if (!contractor.startDate) {
          detectedExceptions.push({
            id: `exc-${exceptionCounter++}`,
            contractorId: contractor.id,
            contractorName: contractor.name,
            contractorCountry: contractor.country,
            type: "missing-dates",
            description: "Start date is required for all workers.",
            severity: "high",
            resolved: false,
            snoozed: false,
            ignored: false,
            canFixInPayroll: false,
            isBlocking: true
          });
        }

        // NEW: End Date passed but worker still marked Active
        if (contractor.endDate && contractor.status === "Active") {
          const endDate = new Date(contractor.endDate);
          const today = new Date();
          if (endDate < today) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "end-date-passed-active",
              description: `End date (${format(endDate, "MMM d, yyyy")}) has passed but worker is still marked as Active.`,
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: false
            });
          }
        }

        // NEW: Deduction amount exceeding gross pay
        if (isEmployee && contractor.baseSalary) {
          // Calculate total deductions (rough estimate for validation)
          const taxDeduction = contractor.baseSalary * 0.15; // Estimate
          const socialDeduction = contractor.sssEmployee || 0;
          const philHealthDeduction = contractor.philHealthEmployee || 0;
          const pagIbigDeduction = contractor.pagIbigEmployee || 0;
          const totalDeductions = taxDeduction + socialDeduction + philHealthDeduction + pagIbigDeduction;
          if (totalDeductions > contractor.baseSalary) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "deduction-exceeds-gross",
              description: `Total deductions (${contractor.currency} ${totalDeductions.toLocaleString()}) exceed gross pay (${contractor.currency} ${contractor.baseSalary.toLocaleString()}).`,
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: true
            });
          }
        }

        // NEW: Missing mandatory tax/contribution fields (for employees)
        if (isEmployee && isPH) {
          const missingFields: string[] = [];
          if (!contractor.sssEmployee) missingFields.push("SSS Employee");
          if (!contractor.sssEmployer) missingFields.push("SSS Employer");
          if (!contractor.philHealthEmployee) missingFields.push("PhilHealth Employee");
          if (!contractor.philHealthEmployer) missingFields.push("PhilHealth Employer");
          if (!contractor.pagIbigEmployee) missingFields.push("Pag-IBIG");
          if (missingFields.length > 0) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "missing-tax-fields",
              description: `Missing mandatory contribution fields: ${missingFields.join(", ")}`,
              severity: "high",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: true,
              isBlocking: true
            });
          }
        }

        // NEW: Adjustment line amount exceeds configured caps
        if (contractor.lineItems && contractor.lineItems.length > 0) {
          contractor.lineItems.forEach(item => {
            if (item.cap && item.amount > item.cap) {
              detectedExceptions.push({
                id: `exc-${exceptionCounter++}`,
                contractorId: contractor.id,
                contractorName: contractor.name,
                contractorCountry: contractor.country,
                type: "adjustment-exceeds-cap",
                description: `Adjustment "${item.name}" amount (${contractor.currency} ${item.amount.toLocaleString()}) exceeds configured cap (${contractor.currency} ${item.cap.toLocaleString()}).`,
                severity: "medium",
                resolved: false,
                snoozed: false,
                ignored: false,
                canFixInPayroll: true,
                isBlocking: false
              });
            }
          });
        }

        // NEW: PH-specific - Contribution table year missing
        if (isPH && isEmployee) {
          // This would check if the SSS/PhilHealth/Pag-IBIG tables have the current year configured
          // For now, we'll flag if SSS contribution is exactly 0 or missing (indicating table might not be configured)
          const currentYear = new Date().getFullYear();
          if (!contractor.sssEmployee || contractor.sssEmployee === 0) {
            detectedExceptions.push({
              id: `exc-${exceptionCounter++}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCountry: contractor.country,
              type: "contribution-table-year-missing",
              description: `SSS contribution table for ${currentYear} may not be configured. Please verify country settings.`,
              severity: "medium",
              resolved: false,
              snoozed: false,
              ignored: false,
              canFixInPayroll: false,
              isBlocking: false
            });
          }
        }
      });
      return detectedExceptions;
    };

    // Only validate once on mount, preserve existing exception states
    setExceptions(prev => {
      // If we already have exceptions beyond the initial ones, preserve them
      if (prev.length > initialExceptions.length) {
        return prev;
      }
      return validatePayrollExceptions(allContractors);
    });
  }, []); // Empty dependency array - only run once on mount

  const groupedByCurrency = activeContractors.reduce((acc, contractor) => {
    if (!acc[contractor.currency]) {
      acc[contractor.currency] = [];
    }
    acc[contractor.currency].push(contractor);
    return acc;
  }, {} as Record<string, ContractorPayment[]>);
  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };
  const handleLockRates = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    setFxRatesLocked(true);
    setLockedAt(timeString);
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
  const handleOpenFixDrawer = (exception: PayrollException) => {
    setSelectedException(exception);
    setFixDrawerOpen(true);
    setBankAccountType("");
  };
  const handleResolveException = (exceptionId?: string) => {
    const exception = exceptionId ? exceptions.find(exc => exc.id === exceptionId) : selectedException;
    if (!exception) return;
    setExceptions(prev => prev.map(exc => exc.id === exception.id ? {
      ...exc,
      resolved: true
    } : exc));
    if (exceptionId) {
      toast.success(`Exception acknowledged for ${exception.contractorName}`);
    } else {
      setFixDrawerOpen(false);
      toast.success(`Exception resolved for ${exception.contractorName}`);
    }
  };
  const handleSnoozeException = (exceptionId: string) => {
    const exception = exceptions.find(exc => exc.id === exceptionId);
    setExceptions(prev => prev.map(exc => exc.id === exceptionId ? {
      ...exc,
      snoozed: true
    } : exc));
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
    setExceptions(prev => prev.map(exc => exc.id === exceptionToOverride.id ? {
      ...exc,
      resolved: true,
      overrideInfo: {
        overriddenBy: "Current User",
        // In production, use actual user
        overriddenAt: new Date().toISOString(),
        justification: overrideJustification
      }
    } : exc));
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
      // Use existing snooze functionality
      handleSnoozeException(exceptionId);
    } else {
      // Mark as resolved and update worker data
      setExceptions(prev => prev.map(exc => exc.id === exceptionId ? {
        ...exc,
        resolved: true
      } : exc));

      // Update contractor data based on resolution
      const contractor = allContractors.find(c => c.id === exception.contractorId);
      if (contractor && resolution === "unpaid-leave") {
        // Apply unpaid leave proration
        toast.success(`${exception.contractorName} marked as unpaid leave - earnings adjusted`);
      } else if (contractor && resolution === "worked-days") {
        // Treat as fully worked
        toast.success(`${exception.contractorName} will be paid for full expected days`);
      }
    }
    setLeaveAttendanceDrawerOpen(false);
    setSelectedLeaveException(null);
  };
  const handleSendFormToCandidate = (exception: PayrollException) => {
    setExceptions(prev => prev.map(exc => exc.id === exception.id ? {
      ...exc,
      formSent: true
    } : exc));
    toast.success(`Form sent to ${exception.contractorName}`);
  };

  // Approval handlers temporarily disabled - auto-approved for MVP
  // TODO: reinstate dual-approval flow later
  // const handleRequestApproval = () => { ... }
  // const handleAdminOverride = () => { ... }

  // Open confirmation dialog for execution
  const handleExecuteClick = (cohort: "all" | "employees" | "contractors") => {
    setPendingExecutionCohort(cohort);
    setExecutionConfirmOpen(true);
  };

  // Confirm and execute payroll
  const handleConfirmExecution = async () => {
    if (!pendingExecutionCohort) return;
    setExecutionConfirmOpen(false);
    setIsExecuting(true);

    // Filter workers based on cohort
    let workersToExecute = executeFilteredWorkers;
    if (pendingExecutionCohort === "employees") {
      workersToExecute = executeFilteredWorkers.filter(c => c.employmentType === "employee");
    } else if (pendingExecutionCohort === "contractors") {
      workersToExecute = executeFilteredWorkers.filter(c => c.employmentType === "contractor");
    }
    const initialProgress: Record<string, "pending" | "processing" | "complete"> = {};
    workersToExecute.forEach(c => {
      initialProgress[c.id] = "pending";
    });
    setExecutionProgress(initialProgress);

    // Track results for execution log
    const logWorkers: ExecutionLogWorker[] = [];
    for (const contractor of workersToExecute) {
      setExecutionProgress(prev => ({
        ...prev,
        [contractor.id]: "processing"
      }));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      // Simulate random failures (10% chance) for demo purposes
      const isFailed = Math.random() < 0.1;
      setExecutionProgress(prev => ({
        ...prev,
        [contractor.id]: isFailed ? "failed" : "complete"
      }));

      // Add to log
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

    // Create execution log entry
    const employeeCount = workersToExecute.filter(c => c.employmentType === "employee").length;
    const contractorCount = workersToExecute.filter(c => c.employmentType === "contractor").length;
    setExecutionLog({
      timestamp: new Date(),
      cohort: pendingExecutionCohort,
      employeeCount,
      contractorCount,
      workers: logWorkers
    });
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

  // Legacy handler - now redirects to new flow
  const handleExecutePayroll = () => {
    handleExecuteClick("all");
  };

  // Navigate to exceptions with context for a specific worker
  const handleViewException = (workerId: string) => {
    // Find if there's an existing exception for this worker
    const workerException = exceptions.find(exc => exc.contractorId === workerId);
    if (!workerException) {
      // Create a temporary exception for this execution failure
      const worker = allContractors.find(c => c.id === workerId);
      if (worker) {
        const newException: PayrollException = {
          id: `exec-fail-${workerId}-${Date.now()}`,
          contractorId: workerId,
          contractorName: worker.name,
          contractorCountry: worker.country,
          type: "missing-bank",
          // Generic type for execution failures
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

    // Navigate to exceptions step
    setCurrentStep("resolve");

    // Scroll to the worker's exception after a brief delay
    setTimeout(() => {
      const exceptionRow = document.querySelector(`[data-worker-id="${workerId}"]`);
      if (exceptionRow) {
        exceptionRow.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 300);
    toast.info(`Navigated to Exceptions for ${allContractors.find(c => c.id === workerId)?.name}`);
  };
  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setReceiptModalOpen(true);
  };
  const handleOpenReschedule = (receipt: any) => {
    setSelectedPayeeForReschedule(receipt);
    setRescheduleDate(addDays(new Date(), 1));
    setRescheduleReason("bank-delay");
    setNotifyContractor(true);
    setRescheduleModalOpen(true);
  };
  const handleConfirmReschedule = () => {
    if (!rescheduleDate || !selectedPayeeForReschedule) return;
    setPaymentReceipts(prev => prev.map(receipt => receipt.payeeId === selectedPayeeForReschedule.payeeId ? {
      ...receipt,
      eta: format(rescheduleDate, "MMM dd, yyyy")
    } : receipt));
    setRescheduleModalOpen(false);
    const reasonText = rescheduleReason === "holiday" ? "holiday" : "bank delay";
    const notifyText = notifyContractor ? ` ${selectedPayeeForReschedule.payeeName} has been notified.` : "";
    toast.success(`Payout rescheduled to ${format(rescheduleDate, "MMM dd, yyyy")} due to ${reasonText}.${notifyText}`);
  };
  const handleExportCSV = () => {
    toast.success("CSV exported successfully");
  };
  const handleDownloadAuditPDF = () => {
    toast.info("Audit PDF generation would be implemented with a PDF library");
  };
  const handleSyncToAccounting = (system: string) => {
    toast.info(`Sync to ${system} would be implemented with accounting integration`);
  };
  const handleOpenPaymentDetail = (contractor: ContractorPayment) => {
    setSelectedPaymentDetail(contractor);
    setPaymentDetailDrawerOpen(true);
  };
  const handleOpenEmployeePayroll = (employee: ContractorPayment) => {
    console.log('[PayrollBatch] Opening EmployeePayrollDrawer with', employee);
    setSelectedEmployee(employee);
    setEmployeePayrollDrawerOpen(true);
  };
  const handleSaveEmployeePayroll = (data: ContractorPayment) => {
    // Note: In production, this would update the backend state
    // For now, mock data remains static
    toast.success("Employee payroll updated and recalculated");
  };
  const handleReturnToPayrollOverview = () => {
    setViewMode("payroll");
    setCurrentStep("review");
    toast.success("Returned to Payroll Overview");
  };
  const handleCompleteAndReturnToOverview = () => {
    // Check for unresolved issues before proceeding
    const blockingExceptions = exceptions.filter(e => e.isBlocking && !e.resolved && !e.overrideInfo);
    const failedPayouts = executionLog?.workers.filter(w => w.status === "failed" && w.employmentType === "contractor") || [];
    const failedPostings = executionLog?.workers.filter(w => w.status === "failed" && w.employmentType === "employee") || [];
    const hasIssues = blockingExceptions.length > 0 || failedPayouts.length > 0 || failedPostings.length > 0;
    setUnresolvedIssues({
      blockingExceptions: blockingExceptions.length,
      failedPayouts: failedPayouts.length,
      failedPostings: failedPostings.length
    });
    setHasUnresolvedIssues(hasIssues);
    setIsMarkCompleteConfirmOpen(true);
  };
  const confirmMarkComplete = (forced = false) => {
    // Mark November as completed
    setPayrollCycleData(prev => ({
      ...prev,
      current: {
        ...prev.current,
        status: "completed",
        completedDate: "Nov 15, 2025"
      }
    }));
    setIsMarkCompleteConfirmOpen(false);
    setForceCompleteJustification("");

    // Reset batch state to show completed view (like October/previous)
    setCurrentBatch(null);
    setCurrentStep("review");
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    toast.success(forced ? "November payroll cycle completed with unresolved issues and is now locked" : "November payroll cycle completed");
  };
  const handleGoBackToFix = () => {
    setIsMarkCompleteConfirmOpen(false);
    // Navigate to Resolve Checks if blocking exceptions exist, otherwise to Submit
    if (unresolvedIssues.blockingExceptions > 0) {
      setCurrentStep("resolve");
    } else {
      setCurrentStep("submit");
    }
  };
  const getPaymentStatus = (contractorId: string): "Paid" | "InTransit" | "Failed" => {
    // For completed payroll cycles, all payments are marked as Paid
    if (currentCycleData.status === "completed") {
      return "Paid";
    }
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
  const allPaymentsPaid = paidCount === allContractors.length;
  const activeExceptions = exceptions.filter(exc => !exc.resolved && !exc.snoozed && !exc.ignored);
  const snoozedExceptions = exceptions.filter(exc => exc.snoozed);
  const acknowledgedExceptions = exceptions.filter(exc => exc.resolved && !exc.ignored);
  const ignoredExceptions = exceptions.filter(exc => exc.ignored);
  const allExceptionsResolved = activeExceptions.length === 0;
  const renderStepContent = () => {
    switch (currentStep) {
      case "review":
        return <div className="space-y-3">
            {/* Admin Context Helper */}
            

            {/* Status Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Payroll Mode Pills - show modes for all countries in current batch */}
                {(() => {
                  const phWorkers = allContractors.filter(c => c.countryCode === "PH");
                  const noWorkers = allContractors.filter(c => c.countryCode === "NO");
                  return (
                    <>
                      {phWorkers.length > 0 && <CA_PayrollModePill mode="automated" size="sm" />}
                      {noWorkers.length > 0 && <CA_PayrollModePill mode="manual" size="sm" />}
                    </>
                  );
                })()}
                {selectedCycle === "previous" && <Badge variant="outline" className="text-xs bg-muted/30">
                    Read-Only Mode
                  </Badge>}
                {fxRatesLocked && lockedAt && <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30 gap-1.5">
                    <Lock className="h-3 w-3" />
                    Locked at {lockedAt}
                  </Badge>}
              </div>
              <div className="flex items-center gap-2">
                {/* Refresh Quote button temporarily hidden - logic preserved for future reactivation */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshQuote}
                  disabled={isRefreshing || fxRatesLocked}
                  className="gap-2"
                 >
                  <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                  Refresh Quote
                 </Button> */}
                {/* Lock Rate button temporarily hidden - logic preserved for future reactivation */}
              </div>
            </div>

            {/* Employment Type Filter */}
            <div className="flex justify-start mb-4 mt-6 py-0">
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
            const currencySymbols: Record<string, string> = {
              EUR: "€",
              NOK: "kr",
              PHP: "₱",
              USD: "$"
            };
            const symbol = currencySymbols[currency] || currency;

            // Group by employment type
            const contractorsList = contractors.filter(c => c.employmentType === "contractor");
            const employeesList = contractors.filter(c => c.employmentType === "employee");
            // Get all worker IDs in this currency table for select-all
            const allWorkerIdsInCurrency = [...contractorsList, ...employeesList].map(w => w.id);
            const selectedCount = getSelectedWorkersCount(currency);
            const isAllSelected = selectedCount > 0 && selectedCount === allWorkerIdsInCurrency.length;
            const isSomeSelected = selectedCount > 0 && selectedCount < allWorkerIdsInCurrency.length;
            return <Card key={currency} className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{currency} Payments</span>
                        {/* Payroll Mode Badge - based on country for this currency */}
                        {(() => {
                          const countryCode = contractors[0]?.countryCode || "";
                          const mode = getPayrollModeForCountry(countryCode);
                          return <CA_PayrollModeTableBadge mode={mode} />;
                        })()}
                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                          Employees: {employeesList.length}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-secondary/5 border-secondary/20">
                          Contractors: {contractorsList.length}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Bulk Actions Bar */}
                    {selectedCycle !== "previous" && <CA_BulkActionsBar selectedCount={selectedCount} onClearSelection={() => clearSelection(currency)} onBulkEdit={() => handleBulkEdit(currency)} onAddAdjustment={() => handleBulkAddAdjustment(currency)} onSkipInBatch={() => handleBulkSkip(currency)} onResetToDefaults={() => handleBulkReset(currency)} />}
                    
                    {/* Horizontal Scroll Container */}
                    <div className="overflow-visible whitespace-nowrap">
                      <Table className="relative min-w-max" containerProps={{
                    className: "overflow-x-auto",
                    onScroll: e => handleTableScroll(currency, e)
                  }}>
                        <TableHeader>
                          <TableRow>
                            {/* Checkbox Column - Sticky */}
                            {selectedCycle !== "previous" && <TableHead className={cn("text-xs min-w-[40px] w-[40px] sticky left-0 z-30 bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]")}>
                                <Checkbox checked={isAllSelected} className={cn(isSomeSelected && "data-[state=checked]:bg-primary/50")} onCheckedChange={() => toggleSelectAll(currency, allWorkerIdsInCurrency, isAllSelected)} onClick={e => e.stopPropagation()} />
                              </TableHead>}
                            <TableHead className={cn("text-xs sticky left-0 z-30 min-w-[180px] bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", selectedCycle !== "previous" && "left-[40px]")}>
                              Name
                            </TableHead>
                            <TableHead className="text-xs min-w-[120px]">Employment Type</TableHead>
                            <TableHead className="text-xs min-w-[80px]">FTE %</TableHead>
                            <TableHead className="text-xs min-w-[120px]">Country</TableHead>
                            <TableHead className="text-xs min-w-[100px]">Status</TableHead>
                            <TableHead className="text-xs text-right min-w-[100px]">Scheduled Days</TableHead>
                            <TableHead className="text-xs text-right min-w-[100px]">Actual Days</TableHead>
                            <TableHead className="text-xs min-w-[140px]">Leave Taken</TableHead>
                            <TableHead className="text-xs text-right min-w-[100px]">Net Payable Days</TableHead>
                            <TableHead className="text-xs min-w-[110px]">Start Date</TableHead>
                            <TableHead className="text-xs min-w-[110px]">End Date</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Hours Worked</TableHead>
                            <TableHead className="text-xs min-w-[130px]">Compensation Type</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Gross Pay</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Adjustments</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Net Pay</TableHead>
                            <TableHead className="text-xs text-right min-w-[100px]">Est. Fees</TableHead>
                            <TableHead className="text-xs text-right min-w-[150px]">Additional Fees</TableHead>
                            <TableHead className="text-xs text-right min-w-[130px]">Total Payable</TableHead>
                            <TableHead className="text-xs min-w-[100px]">Payment Status</TableHead>
                            <TableHead className="text-xs min-w-[90px]">ETA</TableHead>
                            <TableHead className="text-xs text-right min-w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {/* Contractors Sub-Group */}
                        {contractorsList.length > 0 && <>
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                              {selectedCycle !== "previous" && <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20 min-w-[40px] w-[40px]", scrollStates[currency] && "backdrop-blur-md")}></TableCell>}
                              <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20", scrollStates[currency] && "backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", selectedCycle !== "previous" && "left-[40px]")} colSpan={selectedCycle === "previous" ? 1 : undefined}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Contractors ({contractorsList.length})
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell colSpan={selectedCycle !== "previous" ? 21 : 21} className="py-2 bg-muted/20"></TableCell>
                            </TableRow>
                            {contractorsList.map(contractor => {
                          const leaveData = leaveRecords[contractor.id];
                          const hasLeave = leaveData && leaveData.leaveDays > 0;
                          const paymentDue = getPaymentDue(contractor);
                          const difference = contractor.baseSalary - paymentDue;
                          const grossPay = contractor.baseSalary;
                          const deductions = 0; // Placeholder - would be calculated based on taxes
                          const netPay = paymentDue;
                          const additionalFee = additionalFees[contractor.id];
                          const totalPayable = netPay + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                          const isSelected = isWorkerSelected(currency, contractor.id);
                          const isSkipped = skippedWorkerIds.has(contractor.id);
                          return <TableRow key={contractor.id} className={cn("transition-colors", selectedCycle !== "previous" && "cursor-pointer", isSelected && "bg-primary/10", !isSelected && "hover:bg-primary/5", isSkipped && "opacity-50")} onClick={() => {
                            if (selectedCycle === "previous") return;
                            handleOpenWorkerWorkbench(contractor);
                          }}>
                              {/* Checkbox Cell - Sticky */}
                              {selectedCycle !== "previous" && <TableCell className={cn("min-w-[40px] w-[40px] sticky left-0 z-30 bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", isSelected && "bg-primary/10", !isSelected && "bg-card/30")}>
                                  <Checkbox checked={isSelected} onCheckedChange={() => {}} onClick={e => toggleWorkerSelection(currency, contractor.id, e)} />
                                </TableCell>}
                              <TableCell className={cn("font-medium text-sm sticky left-0 z-30 min-w-[180px] bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", selectedCycle !== "previous" && "left-[40px]")}>
                                <div className="flex items-center gap-2">
                                  {contractor.name}
                                  {isSkipped && <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                                      Skipped this batch
                                    </Badge>}
                                  {hasLeave && <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button onClick={e => {
                                        e.stopPropagation();
                                        handleViewLeaveDetails(contractor);
                                      }} className="inline-flex">
                                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 cursor-pointer hover:bg-amber-500/20">
                                              -{leaveData.leaveDays}d Leave
                                            </Badge>
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-xs space-y-1">
                                            <p className="font-semibold">Leave Impact</p>
                                            <p>Prorated Pay: {symbol}{Math.round(difference).toLocaleString()} less</p>
                                            <p className="text-muted-foreground">Click to view details</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>}
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                <Badge variant="outline" className={cn("text-xs", contractor.employmentType === "employee" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30")}>
                                  {contractor.employmentType === "employee" ? "Employee" : "Contractor"}
                                </Badge>
                              </TableCell>
                              {/* FTE % */}
                              <TableCell className="text-sm text-center min-w-[80px]">
                                {contractor.ftePercent || 100}%
                              </TableCell>
                              <TableCell className="text-sm min-w-[120px]">{contractor.country}</TableCell>
                              {/* Employment Status */}
                              <TableCell className="min-w-[100px]">
                                <Badge variant="outline" className={cn("text-xs", contractor.status === "Active" && "bg-green-500/10 text-green-600 border-green-500/30", contractor.status === "Terminated" && "bg-red-500/10 text-red-600 border-red-500/30", contractor.status === "Contract Ended" && "bg-orange-500/10 text-orange-600 border-orange-500/30", contractor.status === "On Hold" && "bg-gray-500/10 text-gray-600 border-gray-500/30")}>
                                  {contractor.status || "Active"}
                                </Badge>
                              </TableCell>
                              {/* Scheduled Days */}
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[100px]">
                                {leaveData?.scheduledDays || 22}d
                              </TableCell>
                              {/* Actual Days */}
                              <TableCell className="text-right text-sm text-foreground min-w-[100px]">
                                {leaveData?.actualDays || 22}d
                              </TableCell>
                              {/* Leave Taken with breakdown */}
                              <TableCell className="min-w-[140px]">
                                {hasLeave ? <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {leaveData.leaveBreakdown ? Object.entries(leaveData.leaveBreakdown).filter(([_, days]) => days && days > 0).map(([type, days]) => `${type}: ${days}d`).join(", ") : `${leaveData.leaveDays}d`}
                                    </span>
                                    {leaveData.hasPendingLeave && <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Pending leave approval</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>}
                                    {leaveData.hasMissingAttendance && <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Missing timesheet data</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>}
                                    <button onClick={e => {
                                  e.stopPropagation();
                                  setSelectedWorkerForLeave(contractor);
                                  setLeaveDetailsDrawerOpen(true);
                                }} className="text-xs text-primary hover:underline">
                                      View details
                                    </button>
                                  </div> : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              {/* Net Payable Days */}
                              <TableCell className="text-right text-sm font-medium text-accent-green-text min-w-[100px]">
                                {leaveData?.actualDays ? leaveData.actualDays - (leaveData.leaveDays || 0) : 22}d
                              </TableCell>
                              {/* Start Date */}
                              <TableCell className="text-sm text-muted-foreground min-w-[110px]">
                                {contractor.startDate ? format(new Date(contractor.startDate), "MMM d, yyyy") : "—"}
                              </TableCell>
                              {/* End Date */}
                              <TableCell className="text-sm text-muted-foreground min-w-[110px]">
                                {contractor.endDate ? format(new Date(contractor.endDate), "MMM d, yyyy") : "—"}
                              </TableCell>
                              {/* Hours Worked - for hourly contractors */}
                              <TableCell className="text-right text-sm min-w-[110px]">
                                {contractor.compensationType === "Hourly" ? <Input type="number" value={contractor.hoursWorked || ""} onChange={e => {
                                const hours = parseFloat(e.target.value) || 0;
                                setContractors(prev => prev.map(c => c.id === contractor.id ? {
                                  ...c,
                                  hoursWorked: hours,
                                  baseSalary: (c.hourlyRate || 0) * hours,
                                  netPay: (c.hourlyRate || 0) * hours
                                } : c));
                              }} onClick={e => e.stopPropagation()} className="h-7 text-sm text-right" disabled={selectedCycle === "previous"} /> : "—"}
                              </TableCell>
                              {/* Compensation Type - shows type and rate if hourly */}
                              <TableCell className="text-sm min-w-[130px]">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-foreground font-medium">
                                    {contractor.compensationType || "Monthly"}
                                  </span>
                                  {contractor.compensationType === "Hourly" && contractor.hourlyRate && <span className="text-xs text-muted-foreground">
                                      {symbol}{contractor.hourlyRate.toLocaleString()}/hr
                                    </span>}
                                </div>
                              </TableCell>
                              {/* Gross Pay */}
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[110px]">
                                {symbol}{grossPay.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[110px]">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="underline decoration-dotted cursor-help">
                                      {symbol}{hasLeave ? Math.round(difference).toLocaleString() : deductions}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs space-y-1">
                                        <p className="font-semibold">Adjustments</p>
                                        {hasLeave && <p>Leave proration: {symbol}{Math.round(difference).toLocaleString()}</p>}
                                        {contractor.employmentType === "employee" && <p>Taxes: Included in employer cost</p>}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold min-w-[110px]">
                                {symbol}{Math.round(netPay).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[100px]">{symbol}{contractor.estFees}</TableCell>
                              <TableCell className="text-right min-w-[150px]">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-sm">{symbol}{additionalFee?.amount || 50}</span>
                                  <Select value={additionalFee?.accepted ? "accept" : "decline"} onValueChange={value => {
                                  handleToggleAdditionalFee(contractor.id, value === "accept");
                                }} disabled={selectedCycle === "previous"}>
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
                              <TableCell className="text-right text-sm font-bold min-w-[130px]">
                                {symbol}{Math.round(totalPayable).toLocaleString()}
                              </TableCell>
                              <TableCell className="min-w-[100px]">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-xs bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30">
                                    Ready
                                  </Badge>
                                  <CA_PayrollModeWorkerTag mode={getPayrollModeForCountry(contractor.countryCode)} />
                                </div>
                              </TableCell>
                              <TableCell className="text-sm min-w-[90px]">{contractor.eta}</TableCell>
                              <TableCell className="text-xs text-right min-w-[120px]">
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={e => {
                                e.stopPropagation();
                                handleSnoozeWorker(contractor.id);
                              }}>
                                  Snooze
                                </Button>
                              </TableCell>
                            </TableRow>;
                        })}
                          </>}
                        
                        {/* Employees Sub-Group */}
                        {employeesList.length > 0 && <>
                            {/* PH Bi-Monthly Toggle (only for PHP currency) */}
                            {currency === "PHP" && <TableRow>
                                <TableCell colSpan={11} className="p-0">
                                  <div className="p-4">
                                    {/* Bi-Monthly Toggle with Info Icons */}
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-muted-foreground">Select Payout Half:</span>
                                      <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1 gap-1">
                                        <div className="flex items-center gap-1">
                                          <button onClick={() => setPhPayrollHalf("1st")} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", phPayrollHalf === "1st" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                            1st Half Payout
                                          </button>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button onClick={e => e.stopPropagation()} className="p-0.5 hover:bg-background/50 rounded transition-colors">
                                                  <Info className="h-3 w-3 text-blue-600" />
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent side="top" align="center" sideOffset={8} collisionPadding={8} className="max-w-xs z-50">
                                                <p className="text-xs font-semibold mb-1">1st Half (1–15)</p>
                                                <p className="text-xs text-muted-foreground">
                                                  50% of Base Salary + 50% of Allowances (no deductions)
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button onClick={() => setPhPayrollHalf("2nd")} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", phPayrollHalf === "2nd" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                                            2nd Half Payout
                                          </button>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button onClick={e => e.stopPropagation()} className="p-0.5 hover:bg-background/50 rounded transition-colors">
                                                  <Info className="h-3 w-3 text-blue-600" />
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent side="top" align="center" sideOffset={8} collisionPadding={8} className="max-w-xs z-50">
                                                <p className="text-xs font-semibold mb-1">2nd Half (16–End)</p>
                                                <p className="text-xs text-muted-foreground">
                                                  50% of Base Salary + 50% of Allowances + all mandatory deductions (SSS, PhilHealth, Pag-IBIG, Tax)
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>}
                            
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                              {selectedCycle !== "previous" && <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20 min-w-[40px] w-[40px]", scrollStates[currency] && "backdrop-blur-md")}></TableCell>}
                              <TableCell className={cn("py-2 sticky left-0 z-30 bg-muted/20", scrollStates[currency] && "backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", selectedCycle !== "previous" && "left-[40px]")}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Employees ({employeesList.length})
                                  </span>
                                  {currency === "PHP" && <Badge variant="outline" className="text-xs">
                                      {phPayrollHalf === "1st" ? "1st Half" : "2nd Half"}
                                    </Badge>}
                                </div>
                              </TableCell>
                              <TableCell colSpan={21} className="py-2 bg-muted/20"></TableCell>
                            </TableRow>
                            {employeesList.map(contractor => {
                          const leaveData = leaveRecords[contractor.id];
                          const hasLeave = leaveData && leaveData.leaveDays > 0;
                          const paymentDue = getPaymentDue(contractor);

                          // PH Bi-Monthly Logic
                          const isPHEmployee = contractor.countryCode === "PH" && contractor.employmentType === "employee";
                          const phMultiplier = isPHEmployee ? 0.5 : 1;
                          const showPHDeductions = isPHEmployee && phPayrollHalf === "2nd";
                          const difference = contractor.baseSalary - paymentDue;
                          const grossPay = contractor.baseSalary * phMultiplier;
                          const deductions = isPHEmployee && phPayrollHalf === "1st" ? 0 : 0;
                          const netPay = isPHEmployee ? grossPay - deductions : paymentDue;
                          const additionalFee = additionalFees[contractor.id];
                          const totalPayable = netPay + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                          const isSelected = isWorkerSelected(currency, contractor.id);
                          const isSkipped = skippedWorkerIds.has(contractor.id);
                          return <TableRow key={contractor.id} className={cn("transition-colors", selectedCycle !== "previous" && "cursor-pointer", isSelected && "bg-primary/10", !isSelected && "hover:bg-primary/5", isSkipped && "opacity-50")} onClick={() => {
                            if (selectedCycle === "previous") return;
                            handleOpenWorkerWorkbench(contractor);
                          }}>
                              {/* Checkbox Cell - Sticky */}
                              {selectedCycle !== "previous" && <TableCell className={cn("min-w-[40px] w-[40px] sticky left-0 z-30 bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", isSelected && "bg-primary/10", !isSelected && "bg-card/30")}>
                                  <Checkbox checked={isSelected} onCheckedChange={() => {}} onClick={e => toggleWorkerSelection(currency, contractor.id, e)} />
                                </TableCell>}
                              <TableCell className={cn("font-medium text-sm sticky left-0 z-30 min-w-[180px] bg-transparent transition-all duration-200", scrollStates[currency] && "bg-card/40 backdrop-blur-md shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]", selectedCycle !== "previous" && "left-[40px]")}>
                                <div className="flex items-center gap-2">
                                  {contractor.name}
                                  {isSkipped && <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                                      Skipped this batch
                                    </Badge>}
                                  {hasLeave && <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button onClick={e => {
                                        e.stopPropagation();
                                        handleViewLeaveDetails(contractor);
                                      }} className="inline-flex">
                                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 cursor-pointer hover:bg-amber-500/20">
                                              -{leaveData.leaveDays}d Leave
                                            </Badge>
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                          <p className="text-xs max-w-[200px]">
                                            {leaveData.clientConfirmed && leaveData.contractorReported ? "Leave confirmed by both parties" : leaveData.contractorReported ? "Awaiting client confirmation" : "Client-reported leave"}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs", contractor.employmentType === "employee" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30")}>
                                  {contractor.employmentType === "employee" ? "Employee" : "Contractor"}
                                </Badge>
                              </TableCell>
                              {/* FTE % */}
                              <TableCell className="text-sm text-center min-w-[80px]">
                                {contractor.ftePercent || 100}%
                              </TableCell>
                              <TableCell className="text-sm min-w-[120px]">{contractor.country}</TableCell>
                              {/* Employment Status */}
                              <TableCell className="min-w-[100px]">
                                <Badge variant="outline" className={cn("text-xs", contractor.status === "Active" && "bg-green-500/10 text-green-600 border-green-500/30", contractor.status === "Terminated" && "bg-red-500/10 text-red-600 border-red-500/30", contractor.status === "Contract Ended" && "bg-orange-500/10 text-orange-600 border-orange-500/30", contractor.status === "On Hold" && "bg-gray-500/10 text-gray-600 border-gray-500/30")}>
                                  {contractor.status || "Active"}
                                </Badge>
                              </TableCell>
                              {/* Scheduled Days */}
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[100px]">
                                {leaveData?.scheduledDays || 22}d
                              </TableCell>
                              {/* Actual Days */}
                              <TableCell className="text-right text-sm text-foreground min-w-[100px]">
                                {leaveData?.actualDays || 22}d
                              </TableCell>
                              {/* Leave Taken with breakdown */}
                              <TableCell className="min-w-[140px]">
                                {hasLeave ? <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {leaveData.leaveBreakdown ? Object.entries(leaveData.leaveBreakdown).filter(([_, days]) => days && days > 0).map(([type, days]) => `${type}: ${days}d`).join(", ") : `${leaveData.leaveDays}d`}
                                    </span>
                                    {leaveData.hasPendingLeave && <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Pending leave approval</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>}
                                    {leaveData.hasMissingAttendance && <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Missing timesheet data</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>}
                                    <button onClick={e => {
                                  e.stopPropagation();
                                  setSelectedWorkerForLeave(contractor);
                                  setLeaveDetailsDrawerOpen(true);
                                }} className="text-xs text-primary hover:underline">
                                      View details
                                    </button>
                                  </div> : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              {/* Net Payable Days */}
                              <TableCell className="text-right text-sm font-medium text-accent-green-text min-w-[100px]">
                                {leaveData?.actualDays ? leaveData.actualDays - (leaveData.leaveDays || 0) : 22}d
                              </TableCell>
                              {/* Start Date */}
                              <TableCell className="text-sm text-muted-foreground min-w-[110px]">
                                {contractor.startDate ? format(new Date(contractor.startDate), "MMM d, yyyy") : "—"}
                              </TableCell>
                              {/* End Date */}
                              <TableCell className="text-sm text-muted-foreground min-w-[110px]">
                                {contractor.endDate ? format(new Date(contractor.endDate), "MMM d, yyyy") : "—"}
                              </TableCell>
                              {/* Start Date */}
                              <TableCell className="text-sm text-muted-foreground min-w-[110px]">
                                {contractor.startDate ? format(new Date(contractor.startDate), "MMM d, yyyy") : "—"}
                              </TableCell>
                              {/* End Date */}
                              <TableCell className="text-sm text-muted-foreground min-w-[110px]">
                                {contractor.endDate ? format(new Date(contractor.endDate), "MMM d, yyyy") : "—"}
                              </TableCell>
                              {/* Hours Worked - Only for Hourly Contractors */}
                              <TableCell className="text-right text-sm min-w-[110px]">
                                {contractor.employmentType === "contractor" && contractor.compensationType === "Hourly" ? selectedCycle !== "previous" ? <Input type="number" value={contractor.hoursWorked || ""} onChange={e => {
                                e.stopPropagation();
                                const hours = Number(e.target.value);
                                setContractors(prev => prev.map(c => c.id === contractor.id ? {
                                  ...c,
                                  hoursWorked: hours,
                                  baseSalary: (c.hourlyRate || 0) * hours,
                                  netPay: (c.hourlyRate || 0) * hours
                                } : c));
                              }} onClick={e => e.stopPropagation()} className="w-20 h-7 text-xs text-right" placeholder="0" /> : <span className="text-muted-foreground">{contractor.hoursWorked || 0}</span> : <span className="text-muted-foreground">—</span>}
                              </TableCell>
                              {/* Compensation Type - shows type and rate if hourly */}
                              <TableCell className="text-sm min-w-[130px]">
                                {contractor.employmentType === "contractor" ? <div className="flex flex-col gap-0.5">
                                    <span className="text-foreground font-medium">
                                      {contractor.compensationType || "Monthly"}
                                    </span>
                                    {contractor.compensationType === "Hourly" && contractor.hourlyRate && <span className="text-xs text-muted-foreground">
                                        {symbol}{contractor.hourlyRate.toLocaleString()}/hr
                                      </span>}
                                  </div> : <span className="text-muted-foreground text-sm">—</span>}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[110px]">
                                {symbol}{grossPay.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[110px]">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="underline decoration-dotted cursor-help">
                                      {isPHEmployee && phPayrollHalf === "1st" ? "₱0" : `${symbol}${hasLeave ? Math.round(difference).toLocaleString() : deductions}`}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs space-y-1">
                                        <p className="font-semibold">Adjustments</p>
                                        {isPHEmployee && phPayrollHalf === "1st" && <p>Adjustments applied only on 2nd half</p>}
                                        {hasLeave && <p>Leave proration: {symbol}{Math.round(difference).toLocaleString()}</p>}
                                        {contractor.employmentType === "employee" && !isPHEmployee && <p>Taxes: Included in employer cost</p>}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold min-w-[110px]">
                                {symbol}{Math.round(netPay).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground min-w-[100px]">{symbol}{contractor.estFees}</TableCell>
                              <TableCell className="text-right min-w-[150px]">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-sm">{symbol}{additionalFee?.amount || 50}</span>
                                  <Select value={additionalFee?.accepted ? "accept" : "decline"} onValueChange={value => {
                                  handleToggleAdditionalFee(contractor.id, value === "accept");
                                }} disabled={selectedCycle === "previous"}>
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
                              <TableCell className="text-right text-sm font-bold min-w-[130px]">
                                {symbol}{Math.round(totalPayable).toLocaleString()}
                              </TableCell>
                              <TableCell className="min-w-[100px]">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-xs bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">
                                    Ready
                                  </Badge>
                                  <CA_PayrollModeWorkerTag mode={getPayrollModeForCountry(contractor.countryCode)} />
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground min-w-[90px]">{contractor.eta}</TableCell>
                              <TableCell className="text-xs text-right min-w-[120px]">
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={e => {
                                e.stopPropagation();
                                handleSnoozeWorker(contractor.id);
                              }}>
                                  Snooze
                                </Button>
                              </TableCell>
                            </TableRow>;
                        })}
                          </>}
                        
                        
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>;
          })}

            {/* Caption for FX Review context */}
            

            {/* Payroll Totals Summary */}
            

            {/* Snoozed Workers Section */}
            {snoozedContractorsList.length > 0 && <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
                <Collapsible open={showSnoozedSection} onOpenChange={setShowSnoozedSection}>
                  <div className="p-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-70 transition-opacity">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          Snoozed Workers ({snoozedContractorsList.length})
                        </h4>
                        <Badge variant="outline" className="text-xs bg-muted/50">
                          Excluded from totals
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7">
                        {showSnoozedSection ? "Hide" : "Show"}
                      </Button>
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
                          {snoozedContractorsList.map(worker => <TableRow key={worker.id}>
                              <TableCell className="font-medium">{worker.name}</TableCell>
                              <TableCell className="capitalize">{worker.employmentType}</TableCell>
                              <TableCell>{worker.country}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  Snoozed this cycle
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUndoSnooze(worker.id)}>
                                  Undo Snooze
                                </Button>
                              </TableCell>
                            </TableRow>)}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </Card>}

            {/* Footer Navigation - Step 1 of 4 */}
            <div className="pt-6 border-t border-border/30 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Step 1 of 4 – Review
              </div>
              <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("resolve")} disabled={selectedCycle === "previous"}>
                Continue to Resolve Checks →
              </Button>
            </div>
          </div>;
      case "resolve":
        const exceptionTypeLabels: Record<string, string> = {
          "missing-bank": "Missing Bank Details",
          "fx-mismatch": "FX Mismatch",
          "pending-leave": "Pending Leave Confirmation",
          "unverified-identity": "Unverified Identity",
          "below-minimum-wage": "Minimum Wage",
          "allowance-exceeds-cap": "Allowance Cap",
          "missing-govt-id": "Govt ID",
          "incorrect-contribution-tier": "Contribution Tier",
          "missing-13th-month": "13th Month Pay",
          "ot-holiday-type-not-selected": "OT/Holiday Type",
          "invalid-work-type-combination": "Work Type Conflict",
          "night-differential-invalid-hours": "Night Differential",
          "missing-employer-sss": "Employer SSS",
          "missing-withholding-tax": "Withholding Tax",
          "status-mismatch": "Status Mismatch",
          "employment-ending-this-period": "Employment Ending This Period",
          "end-date-before-period": "End Date Before Current Period",
          "upcoming-contract-end": "Upcoming Contract End",
          "missing-hours": "Missing Hours",
          "missing-dates": "Missing Dates",
          "end-date-passed-active": "End Date Passed but Active",
          "deduction-exceeds-gross": "Deduction Exceeds Gross",
          "missing-tax-fields": "Missing Tax Fields",
          "adjustment-exceeds-cap": "Adjustment Exceeds Cap",
          "contribution-table-year-missing": "Contribution Table Year Missing"
        };

        // Filter exceptions by fixability
        const fixableExceptions = activeExceptions.filter(e => e.canFixInPayroll);
        const nonFixableExceptions = activeExceptions.filter(e => !e.canFixInPayroll);
        const displayedExceptions = exceptionGroupFilter === "fixable" ? fixableExceptions : exceptionGroupFilter === "non-fixable" ? nonFixableExceptions : activeExceptions;

        // Count blocking exceptions
        const blockingCount = activeExceptions.filter(e => e.isBlocking && !e.overrideInfo).length;
        return <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Exception Review</h3>

            {/* Execution Status Banner */}
            {blockingCount > 0 && <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {blockingCount} blocking exception{blockingCount !== 1 ? 's' : ''} remaining
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {nonFixableExceptions.filter(e => e.isBlocking).length > 0 && `${nonFixableExceptions.filter(e => e.isBlocking).length} must be fixed outside Fronted Payroll • `}
                        {fixableExceptions.filter(e => e.isBlocking).length > 0 && `${fixableExceptions.filter(e => e.isBlocking).length} can be fixed here or overridden`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>}

            {/* Filter Tabs */}
            {activeExceptions.length > 0 && <Tabs value={exceptionGroupFilter} onValueChange={v => setExceptionGroupFilter(v as typeof exceptionGroupFilter)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="all">All ({activeExceptions.length})</TabsTrigger>
                  <TabsTrigger value="fixable">Fixable in Payroll ({fixableExceptions.length})</TabsTrigger>
                  <TabsTrigger value="non-fixable">Must Fix Outside ({nonFixableExceptions.length})</TabsTrigger>
                </TabsList>
              </Tabs>}

            {allExceptionsResolved && <Card className="border-accent-green-outline/30 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10 animate-fade-in">
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
              </Card>}

            {/* Active Exceptions List */}
            {displayedExceptions.length > 0 && <div className="space-y-3">
              {displayedExceptions.map(exception => {
              const severityConfig = {
                high: {
                  color: "border-amber-500/30 bg-amber-500/5",
                  icon: "text-amber-600",
                  warningIcon: true
                },
                medium: {
                  color: "border-amber-500/30 bg-amber-500/5",
                  icon: "text-amber-600",
                  warningIcon: true
                },
                low: {
                  color: "border-blue-500/30 bg-blue-500/5",
                  icon: "text-blue-600",
                  warningIcon: false
                }
              };
              const config = severityConfig[exception.severity];
              return <Card key={exception.id} className={cn("border", config.color, "transition-all duration-300")} data-worker-id={exception.contractorId}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full bg-muted/50", config.warningIcon && "animate-pulse")}>
                          <AlertTriangle className={cn("h-4 w-4", config.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                              {exception.contractorName}
                              {exception.contractorCountry && <span className="text-xs text-muted-foreground">• {exception.contractorCountry}</span>}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {exceptionTypeLabels[exception.type] || exception.type}
                            </Badge>
                            {exception.isBlocking && <Badge variant="destructive" className="text-[10px]">Blocking</Badge>}
                            {!exception.isBlocking && <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">Warning</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {exception.description}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {/* Fix Now / Validate Again / Fixed - Dynamic label based on exception type */}
                            {/* Leave/Attendance related - open dedicated drawer */}
                            {exception.type === "pending-leave" && <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleOpenLeaveAttendanceDrawer(exception)}>
                                Review Details
                              </Button>}
                            
                            {exception.type === "missing-bank" && !exception.formSent && <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSendFormToCandidate(exception)}>
                                Fix Now
                              </Button>}
                            {exception.formSent && <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10" onClick={() => handleResolveException(exception.id)}>
                                Validate Again
                              </Button>}
                            {(exception.type === "fx-mismatch" || exception.type === "unverified-identity") && <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleOpenFixDrawer(exception)}>
                                Fix Now
                              </Button>}
                            {(exception.type === "below-minimum-wage" || exception.type === "allowance-exceeds-cap" || exception.type === "missing-govt-id" || exception.type === "incorrect-contribution-tier" || exception.type === "missing-13th-month" || exception.type === "ot-holiday-type-not-selected" || exception.type === "invalid-work-type-combination" || exception.type === "night-differential-invalid-hours" || exception.type === "missing-employer-sss" || exception.type === "missing-withholding-tax" || exception.type === "missing-hours" || exception.type === "status-mismatch" || exception.type === "employment-ending-this-period" || exception.type === "end-date-before-period" || exception.type === "upcoming-contract-end" || exception.type === "missing-dates" || exception.type === "end-date-passed-active" || exception.type === "deduction-exceeds-gross" || exception.type === "missing-tax-fields" || exception.type === "adjustment-exceeds-cap" || exception.type === "contribution-table-year-missing") && <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => {
                          // Open contractor detail to fix the issue
                          const contractor = allContractors.find(c => c.id === exception.contractorId);
                          if (contractor) {
                            if (contractor.employmentType === "employee") {
                              handleOpenEmployeePayroll(contractor);
                            } else {
                              handleOpenContractorDetail(contractor);
                            }
                          }
                        }}>
                                Fix Now
                              </Button>}
                            
                            {/* Acknowledge & Proceed */}
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleResolveException(exception.id)}>
                              Acknowledge & Proceed
                            </Button>
                            
                            {/* Remove From This Cycle */}
                            <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleSnoozeException(exception.id)}>
                              Remove From This Cycle
                            </Button>
                            
                            {/* Override & Continue - Only for blocking exceptions */}
                            {exception.isBlocking && !exception.overrideInfo && <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10" onClick={() => handleOpenOverrideModal(exception)}>
                                Override & Continue
                              </Button>}
                            
                            {/* Ignore for This Cycle - Only for minor warnings (medium/low severity) */}
                            {(exception.severity === "medium" || exception.severity === "low") && <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => {
                          setExceptions(prev => prev.map(exc => exc.id === exception.id ? {
                            ...exc,
                            ignored: true
                          } : exc));
                          toast.info(`Exception ignored for ${exception.contractorName}`);
                        }}>
                                Ignore for This Cycle
                              </Button>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
            })}
            </div>}

            {/* Skipped to Next Cycle (if any) */}
            {snoozedExceptions.length > 0 && <Card className="border-border/20 bg-muted/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5" />
                    Skipped to Next Cycle ({snoozedExceptions.length})
                  </h4>
                  <div className="space-y-2">
                    {snoozedExceptions.map(exception => <div key={exception.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{exception.contractorName}</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">Skipped</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">Excluded from this payroll</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            {/* Acknowledged Exceptions (if any) */}
            {acknowledgedExceptions.length > 0 && <Card className="border-border/20 bg-accent-green-fill/5">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-accent-green-text mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Acknowledged & Proceeding ({acknowledgedExceptions.length})
                  </h4>
                  <div className="space-y-2">
                    {acknowledgedExceptions.map(exception => <div key={exception.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{exception.contractorName}</span>
                          <Badge variant="outline" className="text-[10px] bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30">Acknowledged</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">Reviewed and approved</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            {/* Ignored Exceptions (if any) */}
            {ignoredExceptions.length > 0 && <Card className="border-border/20 bg-muted/5">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5" />
                    Ignored for This Cycle ({ignoredExceptions.length})
                  </h4>
                  <div className="space-y-2">
                    {ignoredExceptions.map(exception => <div key={exception.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{exception.contractorName}</span>
                          <Badge variant="outline" className="text-[10px] bg-muted/20 text-muted-foreground border-border/30">Ignored</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">Non-blocking, proceeding anyway</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            {/* Footer Navigation - Step 2 of 4 */}
            <div className="pt-4 border-t border-border/30 flex items-center justify-between">
              <Button variant="ghost" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("review")} disabled={selectedCycle === "previous"}>
                ← Back to Review
              </Button>
              <div className="text-xs text-muted-foreground">
                Step 2 of 4 – Resolve Checks
              </div>
              <Button className="h-9 px-4 text-sm" disabled={selectedCycle === "previous"} onClick={() => setCurrentStep("submit")}>
                Continue to Submit →
              </Button>
            </div>
          </div>;

      case "submit":
        return <div className="space-y-6">
              {/* Info note for legacy batches or auto-approval context */}
              
            {/* Step Label - hidden to match Review FX style */}
            {/* <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Step 3 of 4 – Execute Payroll
              </Badge>
             </div> */}

            

            {/* Employment Type Selector */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Execute for:</span>
                    <Select value={executeEmploymentType} onValueChange={v => {
                    setExecuteEmploymentType(v as any);
                    if (v !== "employees") {
                      setSelectedCountries([]);
                      setPayoutPeriod("full");
                    }
                  }}>
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
                  
                  {/* Country + Payout Period for Employees */}
                  {executeEmploymentType === "employees" && <div className="flex items-center gap-4 pl-4 border-l-2 border-primary/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Country:</span>
                        <Select value={selectedCountries.length > 0 ? selectedCountries.join(",") : "all"} onValueChange={v => {
                      if (v === "all") {
                        setSelectedCountries([]);
                      } else {
                        setSelectedCountries(v.split(","));
                      }
                    }}>
                          <SelectTrigger className="w-[160px] h-8 text-xs">
                            <SelectValue placeholder="All countries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
                            <SelectItem value="PT">Portugal</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="NO">Norway</SelectItem>
                            <SelectItem value="PH">Philippines</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Payout Period:</span>
                        <Select value={payoutPeriod} onValueChange={v => setPayoutPeriod(v as any)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Month</SelectItem>
                            <SelectItem value="first-half">1st Half</SelectItem>
                            <SelectItem value="second-half">2nd Half</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>}
                </div>
              </CardContent>
            </Card>

            {/* Warning if exceptions exist */}
            {activeExceptions.length > 0 && <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Resolve exceptions before executing payroll</p>
                      <p className="text-xs text-muted-foreground">{activeExceptions.length} unresolved exception{activeExceptions.length !== 1 ? 's' : ''} must be cleared first</p>
                    </div>
                  </div>
                </CardContent>
              </Card>}

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Batch Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">Payment Rails</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">SEPA (EUR)</span>
                            <span className="text-xs font-medium">3 payees</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Local (NOK)</span>
                            <span className="text-xs font-medium">2 payees</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">SWIFT (PHP)</span>
                            <span className="text-xs font-medium">3 payees</span>
                          </div>
                        </div>
                      </div>

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
                        <p className="text-xs text-muted-foreground mb-2">Processing Time</p>
                        <p className="text-2xl font-bold text-foreground">~2 min</p>
                        <p className="text-xs text-muted-foreground mt-1">estimated duration</p>
                      </div>
                    </div>
                  </div>
                </div>

                {!isExecuting && Object.keys(executionProgress).length === 0 && <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                      <span className="text-muted-foreground">FX rates locked</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                      <span className="text-muted-foreground">All exceptions resolved</span>
                    </div>
                  </div>}

                {(isExecuting || Object.keys(executionProgress).length > 0) && <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">Processing Batch</h4>
                      <Badge variant="outline" className="text-xs">
                        {Object.values(executionProgress).filter(s => s === "complete").length} / {executeFilteredWorkers.length}
                      </Badge>
                    </div>
                    
                    {/* Group by employment type */}
                    {executeFilteredWorkers.filter(c => c.employmentType === "contractor").length > 0 && <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contractor Payments ({executeFilteredWorkers.filter(c => c.employmentType === "contractor").length})</h5>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {executeFilteredWorkers.filter(c => c.employmentType === "contractor").map(contractor => {
                      const status = executionProgress[contractor.id] || "pending";
                      return <motion.div key={contractor.id} initial={{
                        opacity: 0,
                        x: -20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors", status === "complete" && "bg-accent-green-fill/10 border-accent-green-outline/20", status === "failed" && "bg-red-500/10 border-red-500/30", status === "processing" && "bg-blue-500/10 border-blue-500/20 animate-pulse", status === "pending" && "bg-muted/20 border-border")}>
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background">
                                  {status === "complete" && <motion.div initial={{
                            scale: 0
                          }} animate={{
                            scale: 1
                          }} transition={{
                            type: "spring",
                            stiffness: 200
                          }}>
                                      <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                                    </motion.div>}
                                  {status === "failed" && <motion.div initial={{
                            scale: 0
                          }} animate={{
                            scale: 1
                          }} transition={{
                            type: "spring",
                            stiffness: 200
                          }}>
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </motion.div>}
                                  {status === "processing" && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                                  {status === "pending" && <Circle className="h-3 w-3 text-muted-foreground" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {contractor.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {contractor.currency === "EUR" && `€${contractor.netPay.toLocaleString()}`}
                                    {contractor.currency === "NOK" && `kr${contractor.netPay.toLocaleString()}`}
                                    {contractor.currency === "PHP" && `₱${contractor.netPay.toLocaleString()}`}
                                    {" • " + contractor.country}
                                  </p>
                                </div>

                                <Badge variant="outline" className={cn("text-[10px]", status === "complete" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30", status === "failed" && "bg-red-500/10 text-red-600 border-red-500/30", status === "processing" && "bg-blue-500/10 text-blue-600 border-blue-500/30", status === "pending" && "bg-muted text-muted-foreground")}>
                                  {status === "complete" && "Paid"}
                                  {status === "failed" && "Failed"}
                                  {status === "processing" && "Processing"}
                                  {status === "pending" && "Queued"}
                                </Badge>
                              </motion.div>;
                    })}
                        </div>
                      </div>}

                    {/* Employee Payroll Group */}
                    {executeFilteredWorkers.filter(c => c.employmentType === "employee").length > 0 && <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee Payroll ({executeFilteredWorkers.filter(c => c.employmentType === "employee").length})</h5>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {executeFilteredWorkers.filter(c => c.employmentType === "employee").map(employee => {
                      const status = executionProgress[employee.id] || "pending";
                      return <motion.div key={employee.id} initial={{
                        opacity: 0,
                        x: -20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors", status === "complete" && "bg-blue-500/10 border-blue-500/20", status === "failed" && "bg-red-500/10 border-red-500/30", status === "processing" && "bg-blue-500/10 border-blue-500/20 animate-pulse", status === "pending" && "bg-muted/20 border-border")}>
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background">
                                  {status === "complete" && <motion.div initial={{
                            scale: 0
                          }} animate={{
                            scale: 1
                          }} transition={{
                            type: "spring",
                            stiffness: 200
                          }}>
                                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    </motion.div>}
                                  {status === "failed" && <motion.div initial={{
                            scale: 0
                          }} animate={{
                            scale: 1
                          }} transition={{
                            type: "spring",
                            stiffness: 200
                          }}>
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </motion.div>}
                                  {status === "processing" && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                                  {status === "pending" && <Circle className="h-3 w-3 text-muted-foreground" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {employee.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {employee.currency === "EUR" && `€${employee.netPay.toLocaleString()}`}
                                    {employee.currency === "NOK" && `kr${employee.netPay.toLocaleString()}`}
                                    {employee.currency === "PHP" && `₱${employee.netPay.toLocaleString()}`}
                                    {" • " + employee.country}
                                  </p>
                                </div>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className={cn("text-[10px]", status === "complete" && "bg-blue-500/10 text-blue-600 border-blue-500/30", status === "failed" && "bg-red-500/10 text-red-600 border-red-500/30", status === "processing" && "bg-blue-500/10 text-blue-600 border-blue-500/30", status === "pending" && "bg-muted text-muted-foreground")}>
                                        {status === "complete" && "Posted"}
                                        {status === "failed" && "Failed"}
                                        {status === "processing" && "Posting"}
                                        {status === "pending" && "Queued"}
                                      </Badge>
                                    </TooltipTrigger>
                                    {status === "complete" && <TooltipContent>
                                        <p className="text-xs">Payroll posted for accounting. No funds transferred from Fronted.</p>
                                      </TooltipContent>}
                                  </Tooltip>
                                </TooltipProvider>
                              </motion.div>;
                    })}
                        </div>
                      </div>}
                  </div>}

                {!isExecuting && Object.keys(executionProgress).length === 0 && <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                    <Button variant="ghost" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("resolve")} disabled={selectedCycle === "previous"}>
                      ← Back to Resolve Checks
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Step 3 of 4 – Submit
                    </div>
                    <Button className="h-9 px-4 text-sm bg-primary hover:bg-primary/90" onClick={handleExecutePayroll} disabled={activeExceptions.length > 0 || selectedCycle === "previous"}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit to Fronted
                    </Button>
                  </div>}

                {!isExecuting && Object.keys(executionProgress).length > 0 && Object.values(executionProgress).every(s => s === "complete" || s === "failed") && <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20">
                      <motion.div initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} transition={{
                    type: "spring",
                    stiffness: 200
                  }}>
                        <CheckCircle2 className="h-6 w-6 text-accent-green-text" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Submitted to Fronted</p>
                        <p className="text-xs text-muted-foreground">
                          Fronted is now processing your payroll batch
                        </p>
                      </div>
                    </div>
                    
                    {/* Footer Navigation after success - Step 3 of 4 */}
                    <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                      <Button variant="ghost" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("resolve")} disabled={selectedCycle === "previous"}>
                        ← Back to Resolve Checks
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        Step 3 of 4 – Submit
                      </div>
                      <Button className="h-9 px-4 text-sm" onClick={() => setCurrentStep("track")}>
                        Continue to Track & Reconcile →
                      </Button>
                    </div>
                  </div>}
              </CardContent>
            </Card>
            
            {/* Execution Log - Shows results from last batch execution */}
            {executionLog && <ExecutionLog logData={executionLog} onViewException={handleViewException} />}
          </div>;
      case "track":
        const totalGrossPay = filteredContractors.reduce((sum, c) => sum + c.baseSalary, 0);
        const totalTaxesAndFees = filteredContractors.reduce((sum, c) => {
          const employerTax = c.employerTaxes || 0;
          const fees = c.estFees;
          return sum + employerTax + fees;
        }, 0);
        const totalNetPay = filteredContractors.reduce((sum, c) => sum + getPaymentDue(c), 0);
        const grandTotal = totalGrossPay + totalTaxesAndFees;

        // Calculate cohort-specific totals
        const employees = allContractors.filter(c => c.employmentType === "employee");
        const contractors = allContractors.filter(c => c.employmentType === "contractor");
        const employeeTotal = employees.reduce((sum, e) => sum + e.netPay, 0);
        const contractorTotal = contractors.reduce((sum, c) => sum + getPaymentDue(c), 0);
        const employeePosted = employees.length;
        const contractorsPaid = contractors.filter(c => getPaymentStatus(c.id) === "Paid").length;
        const contractorsPending = contractors.filter(c => getPaymentStatus(c.id) === "InTransit").length;
        const contractorsFailed = contractors.filter(c => getPaymentStatus(c.id) === "Failed").length;

        // Determine employee and contractor status
        const employeeStatus = employeePosted === employees.length ? "Posted" : "Partially Posted";
        const contractorStatus = contractorsPaid === contractors.length ? "Paid" : contractorsPaid > 0 ? "Partially Paid" : contractorsFailed > 0 ? "Failed" : "Pending";
        return <div className="space-y-6">
            {/* Header Context Bar */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/20 bg-card/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Track & Reconcile: November 2025</p>
                  <p className="text-xs text-muted-foreground">Monitor employee postings and contractor payouts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadAuditPDF} className="gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Audit PDF
                </Button>
              </div>
            </div>

            {selectedCycle === "previous" && <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
                <Info className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  This is a completed payroll cycle. Actions are disabled.
                </p>
              </div>}

            {/* Cohort Summary Blocks - Employees vs Contractors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employees Summary */}
              <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-semibold text-foreground">Employees</h3>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
                      {employeeStatus}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Posted Runs</span>
                      <span className="text-lg font-bold text-foreground">{employeePosted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Posted</span>
                      <span className="text-lg font-bold text-blue-600">${(employeeTotal / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="pt-2 border-t border-blue-500/20">
                      <p className="text-xs text-muted-foreground">
                        Posted to payroll system - no funds transferred from Fronted
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contractors Summary */}
              <Card className="border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-base font-semibold text-foreground">Contractors</h3>
                    </div>
                    <Badge className={cn("border", contractorStatus === "Paid" && "bg-green-500/20 text-green-700 border-green-500/30", contractorStatus === "Partially Paid" && "bg-amber-500/20 text-amber-700 border-amber-500/30", contractorStatus === "Failed" && "bg-red-500/20 text-red-700 border-red-500/30", contractorStatus === "Pending" && "bg-blue-500/20 text-blue-700 border-blue-500/30")}>
                      {contractorStatus}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payout Batches</span>
                      <span className="text-lg font-bold text-foreground">
                        {contractorsPaid} / {contractors.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Paid</span>
                      <span className="text-lg font-bold text-primary">${(contractorTotal / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="pt-2 border-t border-primary/20">
                      <p className="text-xs text-muted-foreground">
                        {contractorsPending > 0 && `${contractorsPending} pending • `}
                        {contractorsFailed > 0 && `${contractorsFailed} failed • `}
                        Sent via payment provider
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Completion State Banner */}
            {allPaymentsPaid && <motion.div initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} className="flex items-start gap-3 p-4 rounded-lg border border-accent-green-outline/20 bg-accent-green-fill/10">
                <CheckCircle2 className="h-5 w-5 text-accent-green-text flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {currentCycleData.status === "completed" ? "All payments for this historical cycle were reconciled successfully." : "All payments for this cycle have been reconciled successfully."}
                  </p>
                  {currentCycleData.status !== "completed" && <Button onClick={handleReturnToPayrollOverview} size="sm" variant="outline" className="mt-2">
                      Return to Payroll Overview
                    </Button>}
                </div>
              </motion.div>}

            {!allPaymentsPaid && (pendingCount > 0 || contractorsFailed > 0) && <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {contractorsPending > 0 && `${contractorsPending} payment${contractorsPending !== 1 ? 's' : ''} pending confirmation`}
                    {contractorsFailed > 0 && ` • ${contractorsFailed} payment${contractorsFailed !== 1 ? 's' : ''} failed`}
                  </p>
                </div>
              </div>}

            {/* Tabbed Detail View - Employees vs Contractors */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={workerTypeFilter} onValueChange={v => setWorkerTypeFilter(v as typeof workerTypeFilter)}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Payment Details</h3>
                    <TabsList className="grid w-auto grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="employee">Employees</TabsTrigger>
                      <TabsTrigger value="contractor">Contractors</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {/* Employees Table */}
                    {(workerTypeFilter === "all" || workerTypeFilter === "employee") && employees.length > 0 && <div className="mb-6">
                        {workerTypeFilter === "all" && <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-blue-600">Employees ({employees.length})</h4>
                          </div>}
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-500/5">
                              <TableHead className="text-xs font-medium">Employee</TableHead>
                              <TableHead className="text-xs font-medium text-right">Posted Amount</TableHead>
                              <TableHead className="text-xs font-medium text-center">Status</TableHead>
                              <TableHead className="text-xs font-medium">Integration Ref</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {employees.map(employee => <TableRow key={employee.id} className="hover:bg-blue-500/5 cursor-pointer transition-colors" onClick={() => handleOpenPaymentDetail(employee)}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{employee.name}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{employee.country} • {employee.currency}</p>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-foreground">
                                  {employee.currency} {employee.netPay.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Posted
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {employee.id ? `PR-${employee.id.substring(0, 8)}` : "—"}
                                  </span>
                                </TableCell>
                              </TableRow>)}
                          </TableBody>
                        </Table>
                      </div>}

                    {/* Contractors Table */}
                    {(workerTypeFilter === "all" || workerTypeFilter === "contractor") && contractors.length > 0 && <div>
                        {workerTypeFilter === "all" && <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-primary">Contractors ({contractors.length})</h4>
                          </div>}
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
                          const receipt = paymentReceipts.find(r => r.payeeId === contractor.id);
                          const netPay = getPaymentDue(contractor);
                          return <TableRow key={contractor.id} className="hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleOpenPaymentDetail(contractor)}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground">{contractor.name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{contractor.country} • {contractor.currency}</p>
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-foreground">
                                    {contractor.currency} {Math.round(netPay).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant={status === "Paid" ? "default" : "outline"} className={cn("text-[10px]", status === "Paid" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30", status === "InTransit" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", status === "Failed" && "bg-red-500/10 text-red-600 border-red-500/30")}>
                                      {status === "Paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                      {status === "InTransit" && <Clock className="h-3 w-3 mr-1" />}
                                      {status === "Failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                                      {status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {receipt ? receipt.providerRef : `TXN-${contractor.id.substring(0, 8)}`}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {receipt && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={e => {
                                e.stopPropagation();
                                handleViewReceipt(receipt);
                              }}>
                                        <Receipt className="h-3 w-3 mr-1" />
                                        View
                                      </Button>}
                                    {!receipt && <span className="text-xs text-muted-foreground">—</span>}
                                  </TableCell>
                                </TableRow>;
                        })}
                          </TableBody>
                        </Table>
                      </div>}
                  </div>
                </Tabs>

                {/* Historical Records Note */}
                {currentCycleData.status === "completed" && <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground text-center">
                      For historical records only — data is read-only and cannot be modified.
                    </p>
                  </div>}
              </CardContent>
            </Card>

            {/* Footer Navigation - Step 4 of 4 */}
            <div className="pt-4 border-t border-border/30 flex items-center justify-between">
              <Button variant="ghost" className="h-9 px-4 text-sm" onClick={() => setCurrentStep("submit")}>
                ← Back to Submit
              </Button>
              <div className="text-xs text-muted-foreground">
                Step 4 of 4 – Track
              </div>
              <Button className="h-9 px-4 text-sm" onClick={currentCycleData.status === "completed" ? handleBackToPayroll : handleCompleteAndReturnToOverview}>
                {currentCycleData.status === "completed" ? "Finish & close" : "Finish & close"}
              </Button>
            </div>
          </div>;
      default:
        return <div className="text-center py-12 px-6 bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">Step: {currentStep}</h3>
            <p className="text-sm text-muted-foreground">
              This step content will be displayed here.
            </p>
          </div>;
    }
  };
  const handleKurtAction = async (action: string) => {
    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    });
    setOpen(true);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    let response = '';
    if (action === 'any-updates') {
      response = `📊 Payroll Status Update\n\n✅ 2 contractors ready for batch\n🔄 2 contractors in current batch\n⚡ 1 contractor executing payment\n💰 1 contractor paid (last month)\n⏸️ 1 contractor on hold\n\nYou have 2 contractors ready to be added to the current payroll batch.`;
    } else if (action === 'ask-kurt') {
      response = `I'm here to help you with payroll! 
      
You can ask me about:

💱 FX rates and currency conversions
📋 Compliance checks and requirements
💸 Payment execution and timing
🔍 Batch review and adjustments
⚠️ Exception handling

**Try asking:**
• "What's the total for this batch?"
• "Any compliance issues?"
• "Show me FX rates"
• "When will payments execute?"`;
    }
    addMessage({
      role: 'kurt',
      text: response
    });
    setLoading(false);
  };
  return <RoleLensProvider initialRole="admin">
      <div className="flex flex-col h-screen">
        {/* Topbar */}
        <Topbar userName={`${userData.firstName} ${userData.lastName}`} isDrawerOpen={isDrawerOpen} onDrawerToggle={toggleDrawer} />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Dashboard Drawer */}
          <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Payroll Pipeline Main Area with Agent Layout */}
          <AgentLayout context="Payroll Pipeline">
            <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative">
              {/* Static background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10" style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))'
              }} />
                <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8" style={{
                background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))'
              }} />
              </div>
              <div className="relative z-10">
                <motion.div key="payroll-pipeline" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} exit={{
                opacity: 0
              }} className="flex-1 overflow-y-auto">
                  <div className="max-w-7xl mx-auto p-8 pb-32 space-y-2">
                    {/* Agent Header */}
                    <AgentHeader title="Company Admin · Payroll" subtitle="Kurt can help with: FX rates, compliance checks, or payment execution." showPulse={true} showInput={false} simplified={false}
                  // tags={
                  //   <AgentHeaderTags 
                  //     onAnyUpdates={() => handleKurtAction('any-updates')}
                  //     onAskKurt={() => handleKurtAction('ask-kurt')}
                  //   />
                  // }
                  />

                    {/* Elegant Tab Navigation */}
                    <div className="pt-4 pb-2">
                      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
                        <button
                          onClick={() => setActiveTab("payroll")}
                          className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            activeTab === "payroll"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Payroll
                        </button>
                        <button
                          onClick={() => setActiveTab("leaves")}
                          className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            activeTab === "leaves"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Leaves
                        </button>
                      </div>
                    </div>

                    {/* Breadcrumb for Batch Review - only in Payroll tab */}
                    {activeTab === "payroll" && viewMode === "batch-review" && <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground" onClick={handleBackToPayroll}>
                          Payroll
                        </Button>
                        <span>›</span>
                        <span className="text-foreground font-medium">Payment Batch Review (Nov 2025)</span>
                      </div>}

                    {/* Tab Content */}
                    <div className="pt-4">
                      {/* LEAVES TAB */}
                      {activeTab === "leaves" && (
                        <CA3_LeavesTab />
                      )}

                      {/* PAYROLL TAB */}
                      {activeTab === "payroll" && (viewMode === "payroll" ? (/* Payroll with Period-Based States */
                    <div className="space-y-6">
                          {/* Period content removed - dropdown moved into cards */}

                          {/* NEXT Period - Upcoming State */}
                          {selectedCycle === "next" && <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
                              <CardContent className="py-5 px-6">
                                {/* Header with title, badge, and dropdown */}
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-base font-semibold text-foreground">Upcoming Payroll</h3>
                                    <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30">
                                      Upcoming
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CA_PayPeriodDropdown value={selectedCycle} onValueChange={val => setSelectedCycle(val)} periods={payrollCycleData} />
                                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setCountryRulesDrawerOpen(true)}>
                                      <Settings className="h-3.5 w-3.5" />
                                      Country Rules
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
                                  <div className="p-4 rounded-full bg-blue-500/10">
                                    <Clock className="h-8 w-8 text-blue-600" />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-lg font-semibold text-foreground">
                                      {payrollCycleData.next.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      This payroll period is not yet open for review
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-6 pt-4">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <div className="text-left">
                                        <p className="text-xs text-muted-foreground">Opens on</p>
                                        <p className="text-sm font-medium text-foreground">{payrollCycleData.next.opensOn}</p>
                                      </div>
                                    </div>
                                    <div className="w-px h-10 bg-border" />
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                      <div className="text-left">
                                        <p className="text-xs text-muted-foreground">Payout date</p>
                                        <p className="text-sm font-medium text-foreground">{payrollCycleData.next.nextPayrollRun}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="mt-4 bg-blue-500/10 text-blue-600 border-blue-500/30">
                                    Opens T-7
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>}

                          {/* PREVIOUS Period - Read-only Completed View */}
                          {selectedCycle === "previous" && <div className="space-y-6">
                              {/* Payroll Run Summary Card */}
                              <CA_PayrollRunSummaryCard grossPay="$48.2K" netPay="$42.8K" frontedFees="$1,450" totalCost="$49.7K" employeeCount={allContractors.filter(c => c.employmentType === "employee").length} contractorCount={allContractors.filter(c => c.employmentType === "contractor").length} currencyCount={3} paidPercentage={100} selectedPeriod={selectedCycle} onPeriodChange={val => setSelectedCycle(val)} periods={payrollCycleData} onCountryRules={() => setCountryRulesDrawerOpen(true)} />
                              
                              {/* Track & Reconcile Card */}
                              <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-base font-semibold text-foreground">Track & Reconcile: {payrollCycleData.previous.label}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">Review completed employee postings and contractor payouts</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                                        <Download className="h-3.5 w-3.5" />
                                        Export CSV
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={handleDownloadAuditPDF} className="gap-2">
                                        <FileText className="h-3.5 w-3.5" />
                                        Audit PDF
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Payment Details Table */}
                              <CA_CompletedPaymentDetailsCard employees={allContractors.filter(c => c.employmentType === "employee")} contractors={allContractors.filter(c => c.employmentType === "contractor")} workerTypeFilter={workerTypeFilter} onWorkerTypeFilterChange={v => setWorkerTypeFilter(v as typeof workerTypeFilter)} onOpenPaymentDetail={handleOpenPaymentDetail} getPaymentStatus={getPaymentStatus} getPaymentDue={getPaymentDue} paymentReceipts={paymentReceipts} onViewReceipt={handleViewReceipt} />
                            </div>}

                          {/* CURRENT Period - Completed View (same as Previous) */}
                          {selectedCycle === "current" && !currentBatch && payrollCycleData.current.status === "completed" && <div className="space-y-6">
                              {/* Payroll Run Summary Card */}
                              <CA_PayrollRunSummaryCard grossPay="$52.1K" netPay="$45.3K" frontedFees="$1,580" totalCost="$53.7K" employeeCount={allContractors.filter(c => c.employmentType === "employee").length} contractorCount={allContractors.filter(c => c.employmentType === "contractor").length} currencyCount={3} paidPercentage={100} selectedPeriod={selectedCycle} onPeriodChange={val => setSelectedCycle(val)} periods={payrollCycleData} onCountryRules={() => setCountryRulesDrawerOpen(true)} />
                              
                              {/* Track & Reconcile Card */}
                              <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-base font-semibold text-foreground">Track & Reconcile: {payrollCycleData.current.label}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">Review completed employee postings and contractor payouts</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                                        <Download className="h-3.5 w-3.5" />
                                        Export CSV
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={handleDownloadAuditPDF} className="gap-2">
                                        <FileText className="h-3.5 w-3.5" />
                                        Audit PDF
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Payment Details Table */}
                              <CA_CompletedPaymentDetailsCard employees={allContractors.filter(c => c.employmentType === "employee")} contractors={allContractors.filter(c => c.employmentType === "contractor")} workerTypeFilter={workerTypeFilter} onWorkerTypeFilterChange={v => setWorkerTypeFilter(v as typeof workerTypeFilter)} onOpenPaymentDetail={handleOpenPaymentDetail} getPaymentStatus={getPaymentStatus} getPaymentDue={getPaymentDue} paymentReceipts={paymentReceipts} onViewReceipt={handleViewReceipt} />
                            </div>}

                          {/* CURRENT Period - NEW V3 Streamlined UI */}
                          {selectedCycle === "current" && !currentBatch && payrollCycleData.current.status !== "completed" && (
                            <CA3_PayrollSection payPeriod={payrollCycleData.current.label} />
                          )}

                          {/* CURRENT Period - In Batch (4-Step Flow) */}
                          {selectedCycle === "current" && currentBatch && <div className="space-y-6">
                              {/* Payroll Run Totals Card */}
                              <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
                                <CardContent className="py-5 px-6">
                                  <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-base font-semibold text-foreground">Payroll Run Totals</h3>
                                      <Badge className="text-xs font-medium bg-primary/15 text-primary border-primary/30">Current</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CA_PayPeriodDropdown value={selectedCycle} onValueChange={val => setSelectedCycle(val)} periods={payrollCycleData} />
                                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setCountryRulesDrawerOpen(true)}>
                                        <Settings className="h-3.5 w-3.5" />
                                        Country Rules
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleBackToPayroll}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Metric Cards Grid */}
                                  <div className="grid grid-cols-4 gap-4 mb-5">
                                    {/* Gross Pay */}
                  <div className="bg-primary/[0.04] rounded-xl p-4">
                                      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span className="text-sm">Gross Pay</span>
                                      </div>
                                      <p className="text-2xl font-semibold text-foreground">
                                        ${((currentBatch.employeeCount * 8500 + currentBatch.contractorCount * 5200) / 1000).toFixed(1)}K
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">Total base salaries</p>
                                    </div>

                                    {/* Net Pay */}
                  <div className="bg-primary/[0.04] rounded-xl p-4">
                                      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                        <Receipt className="h-4 w-4 text-primary" />
                                        <span className="text-sm">Net Pay</span>
                                      </div>
                                      <p className="text-2xl font-semibold text-foreground">
                                        ${((currentBatch.employeeCount * 6800 + currentBatch.contractorCount * 4800) / 1000).toFixed(1)}K
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">After adjustments</p>
                                    </div>

                                    {/* Fronted Fees */}
                  <div className="bg-primary/[0.04] rounded-xl p-4">
                                      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span className="text-sm">Fronted Fees (Est.)</span>
                                      </div>
                                      <p className="text-2xl font-semibold text-foreground">
                                        ${((currentBatch.employeeCount + currentBatch.contractorCount) * 245).toLocaleString()}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">Transaction + Service</p>
                                    </div>

                                    {/* Total Cost */}
                                    <div className="bg-primary/[0.04] rounded-xl p-4">
                                      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <span className="text-sm">Total Cost</span>
                                      </div>
                                      <p className="text-2xl font-semibold text-foreground">
                                        ${((currentBatch.employeeCount * 9200 + currentBatch.contractorCount * 5600) / 1000).toFixed(1)}K
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">Pay + All Fees</p>
                                    </div>
                                  </div>

                                  {/* Footer Stats */}
                                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-3 border-t border-border/30">
                                    <span>Employees: <strong className="text-foreground">{currentBatch.employeeCount}</strong></span>
                                    <span className="text-border">·</span>
                                    <span>Contractors: <strong className="text-foreground">{currentBatch.contractorCount}</strong></span>
                                    <span className="text-border">·</span>
                                    <span>Currencies: <strong className="text-foreground">3</strong></span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Styled Progress Stepper */}
                              <CA_FXReviewStepper currentStep={currentStep as FXReviewStep} completedSteps={(() => {
                          const stepOrder: FXReviewStep[] = ["review-fx", "exceptions", "execute", "track"];
                          const currentIndex = stepOrder.indexOf(currentStep as FXReviewStep);
                          return stepOrder.slice(0, currentIndex);
                        })()} onStepClick={step => setCurrentStep(step as PayrollStep)} />

                              {/* Step Content (Flow 7 v1 content) */}
                              {renderStepContent()}

                              {/* Worker Workbench Drawer (for FX Review step) */}
                              <CA_WorkerWorkbenchDrawer open={workerWorkbenchOpen} onOpenChange={setWorkerWorkbenchOpen} worker={selectedWorkbenchWorker} payrollPeriod="November 2025" onSaveAndRecalculate={handleWorkbenchSaveAndRecalculate} />

                              {/* Bulk Edit Drawer */}
                              <CA_BulkEditDrawer open={bulkEditDrawerOpen} onOpenChange={setBulkEditDrawerOpen} selectedWorkers={getSelectedWorkersData(currentBulkCurrency)} mode={bulkEditMode} onApply={handleBulkEditApply} />

                              {/* Skip Confirmation Modal */}
                              <CA_SkipConfirmationModal open={skipConfirmationOpen} onOpenChange={setSkipConfirmationOpen} workerCount={getSelectedWorkersCount(currentBulkCurrency)} onConfirm={confirmBulkSkip} />

                              {/* Reset Confirmation Modal */}
                              <CA_ResetConfirmationModal open={resetConfirmationOpen} onOpenChange={setResetConfirmationOpen} workerCount={getSelectedWorkersCount(currentBulkCurrency)} onConfirm={confirmBulkReset} />

                              {/* Step Navigation */}
                              

                              {/* Request Changes Modal */}
                              <CA_RequestChangesModal open={requestChangesModalOpen} onOpenChange={setRequestChangesModalOpen} onSubmit={handleRequestChanges} />
                            </div>}
                        </div>) : null)}
                    </div>

                    {/* Payment Detail Drawer */}
                    <Sheet open={paymentDetailDrawerOpen} onOpenChange={setPaymentDetailDrawerOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                          {selectedPaymentDetail && <>
                              <SheetHeader>
                                <SheetTitle className="text-xl">
                                  {selectedPaymentDetail.name} – Payment Details
                                </SheetTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className={cn("text-xs", selectedPaymentDetail.employmentType === "employee" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30")}>
                                    {selectedPaymentDetail.employmentType === "employee" ? "Employee" : "Contractor"}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">•</span>
                                  <span className="text-sm text-muted-foreground">{selectedPaymentDetail.country}</span>
                                  <span className="text-sm text-muted-foreground">•</span>
                                  <span className="text-sm text-muted-foreground">November 2025</span>
                                </div>
                              </SheetHeader>

                              <div className="space-y-6 mt-6">
                                {/* Payment Status */}
                                {getPaymentStatus(selectedPaymentDetail.id) === "Failed" && <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground mb-2">Payment Failed</p>
                                      <Button size="sm" disabled variant="outline">
                                        Reattempt Transfer
                                      </Button>
                                    </div>
                                  </div>}

                                {/* Worker Profile */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Worker Profile
                                  </h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <p className="text-xs text-muted-foreground">Name</p>
                                          <p className="font-medium">{selectedPaymentDetail.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Country</p>
                                          <p className="font-medium">{selectedPaymentDetail.country}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Employment Type</p>
                                          <p className="font-medium capitalize">{selectedPaymentDetail.employmentType}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Currency</p>
                                          <p className="font-medium">{selectedPaymentDetail.currency}</p>
                                        </div>
                        {selectedPaymentDetail.startDate && <div>
                            <p className="text-xs text-muted-foreground">Start Date</p>
                            <p className="font-medium">
                              {typeof selectedPaymentDetail.startDate === 'string' ? format(new Date(selectedPaymentDetail.startDate), "PPP") : 'Invalid date'}
                            </p>
                          </div>}
                        {selectedPaymentDetail.endDate && <div>
                            <p className="text-xs text-muted-foreground">End Date / Last Working Day</p>
                            <p className="font-medium">
                              {typeof selectedPaymentDetail.endDate === 'string' ? format(new Date(selectedPaymentDetail.endDate), "PPP") : 'Invalid date'}
                            </p>
                          </div>}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Payment Breakdown
                                  </h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Gross Pay</span>
                                        <span className="text-sm font-semibold">
                                          {selectedPaymentDetail.currency} {selectedPaymentDetail.baseSalary.toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Fronted Charge</span>
                                        <span className="text-sm font-medium text-amber-600">
                                          +{selectedPaymentDetail.currency} {selectedPaymentDetail.estFees.toLocaleString()}
                                        </span>
                                      </div>

                                      {selectedPaymentDetail.employmentType === "employee" && selectedPaymentDetail.employerTaxes && <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Employer Tax</span>
                                          <span className="text-sm font-medium text-amber-600">
                                            +{selectedPaymentDetail.currency} {selectedPaymentDetail.employerTaxes.toLocaleString()}
                                          </span>
                                        </div>}

                                      {leaveRecords[selectedPaymentDetail.id]?.leaveDays > 0 && <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Leave Deduction</span>
                                          <span className="text-sm font-medium text-amber-600">
                                            -{selectedPaymentDetail.currency} {Math.round(getLeaveDeduction(selectedPaymentDetail)).toLocaleString()}
                                          </span>
                                        </div>}

                                      <Separator />

                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Net Salary</span>
                                        <span className="text-lg font-bold text-foreground">
                                          {selectedPaymentDetail.currency} {Math.round(getPaymentDue(selectedPaymentDetail)).toLocaleString()}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Bank Account */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Bank Account</h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4">
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-muted-foreground">Account Type</p>
                                          <p className="text-sm font-medium">IBAN / SWIFT</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Account Number</p>
                                          <p className="text-sm font-mono">******* {selectedPaymentDetail.id.slice(-4)}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Payment Details</h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Payment Date</span>
                                        <span className="text-sm font-medium">Nov 15, 2025</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Reference ID</span>
                                        <span className="text-sm font-mono">
                                          {paymentReceipts.find(r => r.payeeId === selectedPaymentDetail.id)?.providerRef || "WISE-2025-XXX"}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Payment Rail</span>
                                        <span className="text-sm font-medium">
                                          {paymentReceipts.find(r => r.payeeId === selectedPaymentDetail.id)?.rail || "SWIFT"}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">ETA</span>
                                        <span className="text-sm font-medium">
                                          {paymentReceipts.find(r => r.payeeId === selectedPaymentDetail.id)?.eta || "3-5 business days"}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Actions - Only for current/active month */}
                                {selectedCycle === "current" && <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                                    <div className="flex gap-2">
                                      <Button variant="secondary" className="flex-1" onClick={() => {
                                setSelectedPayeeForReschedule(selectedPaymentDetail);
                                setRescheduleModalOpen(true);
                                setPaymentDetailDrawerOpen(false);
                              }}>
                                        Reschedule
                                      </Button>
                                      <Button variant="default" className="flex-1" onClick={() => {
                                const receipt = paymentReceipts.find(r => r.payeeId === selectedPaymentDetail.id);
                                if (receipt) {
                                  setSelectedReceipt(receipt);
                                  setReceiptModalOpen(true);
                                  setPaymentDetailDrawerOpen(false);
                                } else {
                                  toast.info("Receipt not yet available for this payment");
                                }
                              }}>
                                        View Receipt
                                      </Button>
                                    </div>
                                  </div>}
                              </div>
                            </>}
                        </SheetContent>
                      </Sheet>

                      {/* Fix Exception Drawer */}
                    <Sheet open={fixDrawerOpen} onOpenChange={setFixDrawerOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle className="text-lg font-semibold">
                              Fix Exception: {selectedException?.contractorName}
                            </SheetTitle>
                          </SheetHeader>

                          {selectedException && <div className="mt-6 space-y-6">
                              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                <div className="flex items-start gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground mb-1">
                                      {selectedException.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {selectedException.description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {selectedException.type === "missing-bank" && <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="bank-type" className="text-sm font-medium">
                                      Bank Account Type
                                    </Label>
                                    <Select value={bankAccountType} onValueChange={setBankAccountType}>
                                      <SelectTrigger id="bank-type">
                                        <SelectValue placeholder="Select account type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="checking">Checking</SelectItem>
                                        <SelectItem value="savings">Savings</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    This information is required for ACH transfers.
                                  </p>
                                </div>}

                              {selectedException.type === "fx-mismatch" && <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Currency Resolution</Label>
                                    <div className="p-3 rounded-lg bg-muted/30">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground">Contract Currency</span>
                                        <span className="text-sm font-medium">PHP</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Candidate Preference</span>
                                        <span className="text-sm font-medium text-amber-600">USD</span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Send form to candidate to confirm currency preference update.
                                  </p>
                                </div>}

                              {selectedException.type === "pending-leave" && <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Leave Confirmation</Label>
                                    <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Leave Days</span>
                                        <span className="text-sm font-medium">2 days</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Status</span>
                                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600">
                                          Awaiting Client Approval
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Leave days reported by candidate but not yet confirmed by client.
                                  </p>
                                </div>}

                              {selectedException.type === "unverified-identity" && <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Compliance Verification</Label>
                                    <div className="p-3 rounded-lg bg-muted/30">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                        <span className="text-xs font-medium">Identity documents pending review</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Candidate requires identity verification before payment processing.
                                      </p>
                                    </div>
                                  </div>
                                </div>}
                            </div>}

                          <SheetFooter className="mt-6 flex-row gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setFixDrawerOpen(false)}>
                              Cancel
                            </Button>
                            <Button className="flex-1" onClick={() => handleResolveException()} disabled={selectedException?.type === "missing-bank" && !bankAccountType}>
                              Mark as Resolved
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>

                      {/* Receipt Modal */}
                      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-primary" />
                              Payment Receipt
                            </DialogTitle>
                          </DialogHeader>
                          {selectedReceipt && (() => {
                        const contractor = allContractors.find(c => c.id === selectedReceipt.payeeId);
                        return contractor ? <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                                  <div>
                                    <p className="text-lg font-semibold text-foreground">{selectedReceipt.payeeName}</p>
                                    <p className="text-sm text-muted-foreground">Reference: {selectedReceipt.providerRef}</p>
                                  </div>
                                  <Badge variant={selectedReceipt.status === "Paid" ? "default" : "outline"} className={selectedReceipt.status === "Paid" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"}>
                                    {selectedReceipt.status}
                                  </Badge>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Payment Breakdown</h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Gross Pay</span>
                                        <span className="text-sm font-semibold">
                                          {contractor.currency} {contractor.baseSalary.toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Fronted Charge</span>
                                        <span className="text-sm font-medium text-amber-600">
                                          +{contractor.currency} {contractor.estFees.toLocaleString()}
                                        </span>
                                      </div>

                                      {contractor.employmentType === "employee" && contractor.employerTaxes && <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Employer Tax</span>
                                          <span className="text-sm font-medium text-amber-600">
                                            +{contractor.currency} {contractor.employerTaxes.toLocaleString()}
                                          </span>
                                        </div>}

                                      {leaveRecords[contractor.id]?.leaveDays > 0 && <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Leave Deduction</span>
                                          <span className="text-sm font-medium text-amber-600">
                                            -{contractor.currency} {Math.round(getLeaveDeduction(contractor)).toLocaleString()}
                                          </span>
                                        </div>}

                                      <Separator />

                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Net Salary</span>
                                        <span className="text-lg font-bold text-foreground">
                                          {contractor.currency} {Math.round(getPaymentDue(contractor)).toLocaleString()}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Transaction Details */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Transaction Details</h4>
                                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20">
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Payment Rail</p>
                                      <p className="font-semibold text-foreground">{selectedReceipt.rail}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">FX Rate</p>
                                      <p className="font-semibold text-foreground">{selectedReceipt.fxRate}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">FX Fee</p>
                                      <p className="font-semibold text-foreground">
                                        {selectedReceipt.fxFee?.toLocaleString()} {selectedReceipt.ccy}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">ETA</p>
                                      <p className="font-semibold text-foreground">{selectedReceipt.eta}</p>
                                    </div>
                                  </div>
                                </div>
                              </div> : null;
                      })()}
                        </DialogContent>
                      </Dialog>

                      {/* Leave Details Modal */}
                      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              Leave Details
                            </DialogTitle>
                          </DialogHeader>
                          {selectedLeaveContractor && leaveRecords[selectedLeaveContractor.id] && <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                                <div>
                                  <p className="text-lg font-semibold text-foreground">{selectedLeaveContractor.name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedLeaveContractor.country}</p>
                                </div>
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                  {leaveRecords[selectedLeaveContractor.id].leaveDays} Days Leave
                                </Badge>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Leave Information</h4>
                                <div className="space-y-3 p-4 rounded-lg bg-muted/20">
                                  {leaveRecords[selectedLeaveContractor.id].leaveDate && <div>
                                      <p className="text-xs text-muted-foreground mb-1">Leave Date(s)</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {leaveRecords[selectedLeaveContractor.id].leaveDate}
                                      </p>
                                    </div>}
                                  {leaveRecords[selectedLeaveContractor.id].leaveReason && <div>
                                      <p className="text-xs text-muted-foreground mb-1">Reason</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {leaveRecords[selectedLeaveContractor.id].leaveReason}
                                      </p>
                                    </div>}
                                  {leaveRecords[selectedLeaveContractor.id].approvedBy && <div>
                                      <p className="text-xs text-muted-foreground mb-1">Approved By</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {leaveRecords[selectedLeaveContractor.id].approvedBy}
                                      </p>
                                    </div>}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Payment Calculation</h4>
                                <div className="space-y-2 p-4 rounded-lg bg-muted/20">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Base Pay</span>
                                    <span className="text-sm font-medium">
                                      {selectedLeaveContractor.currency} {selectedLeaveContractor.baseSalary.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Working Days</span>
                                    <span className="text-sm font-medium">
                                      {leaveRecords[selectedLeaveContractor.id].workingDays.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Leave Days</span>
                                    <span className="text-sm font-medium text-amber-600">
                                      -{leaveRecords[selectedLeaveContractor.id].leaveDays}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Pay Days</span>
                                    <span className="text-sm font-medium">
                                      {(leaveRecords[selectedLeaveContractor.id].workingDays - leaveRecords[selectedLeaveContractor.id].leaveDays).toFixed(2)}
                                    </span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-foreground">Payment Due</span>
                                    <span className="text-lg font-bold text-foreground">
                                      {selectedLeaveContractor.currency} {Math.round(getPaymentDue(selectedLeaveContractor)).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-amber-600">
                                    <span className="text-xs">Leave Adjustment</span>
                                    <span className="text-sm font-semibold">
                                      -{selectedLeaveContractor.currency} {Math.round(getLeaveDeduction(selectedLeaveContractor)).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Info className="h-4 w-4 text-blue-600" />
                                <p className="text-xs text-blue-600">
                                  Formula: Base Pay ÷ Days Per Month × Pay Days
                                </p>
                              </div>
                            </div>}
                        </DialogContent>
                      </Dialog>

                      {/* Contractor Detail Drawer */}
                      <Sheet open={contractorDrawerOpen} onOpenChange={open => {
                    if (!open || selectedCycle !== "previous") {
                      setContractorDrawerOpen(open);
                    }
                  }}>
                        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                          {selectedContractor && <>
                              <SheetHeader>
                                <SheetTitle className="text-xl">
                                  {selectedContractor.name}
                                </SheetTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className={cn("text-xs", selectedContractor.employmentType === "employee" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30")}>
                                    {selectedContractor.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                                  </Badge>
                                   <span className="text-sm text-muted-foreground">•</span>
                                   <span className="text-sm text-muted-foreground">{selectedContractor.country}</span>
                                   <span className="text-sm text-muted-foreground">•</span>
                                   <span className="text-sm text-muted-foreground">{selectedContractor.compensationType || "Monthly"}</span>
                                  {selectedCycle === "previous" && <>
                                      <span className="text-sm text-muted-foreground">•</span>
                                      <Badge variant="outline" className="text-xs">Read Only</Badge>
                                    </>}
                                </div>
                              </SheetHeader>

                              <div className="space-y-6 mt-6">
                                {/* Payroll Details Section */}
                                {selectedCycle !== "previous" && <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Payroll Details</h4>
                                    <Card className="border-border/20 bg-card/30">
                                      <CardContent className="p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                                            <Input type="date" value={selectedContractor.startDate || ""} disabled={!selectedContractor.allowEmploymentOverride} onChange={e => {
                                      setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                        ...c,
                                        startDate: e.target.value
                                      } : c));
                                    }} className="text-sm" />
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">End Date</Label>
                                            <Input type="date" value={selectedContractor.endDate || ""} disabled={!selectedContractor.allowEmploymentOverride} onChange={e => {
                                      setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                        ...c,
                                        endDate: e.target.value || undefined
                                      } : c));
                                    }} className="text-sm" />
                                          </div>
                                        </div>
                                        <div className="space-y-1.5">
                                          <Label className="text-xs text-muted-foreground">Employment Status</Label>
                                          <Select value={selectedContractor.status || "Active"} disabled={!selectedContractor.allowEmploymentOverride} onValueChange={(value: "Active" | "Terminated" | "Contract Ended" | "On Hold") => {
                                    setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                      ...c,
                                      status: value
                                    } : c));
                                  }}>
                                            <SelectTrigger className="text-sm">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Active">Active</SelectItem>
                                              <SelectItem value="Terminated">Terminated</SelectItem>
                                              <SelectItem value="Contract Ended">End of Contract</SelectItem>
                                              <SelectItem value="On Hold">On Hold</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>}

                                {/* Payroll / Compensation Settings (Contractors Only) */}
                                {selectedContractor.employmentType === "contractor" && selectedCycle !== "previous" && <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                      <Settings className="h-4 w-4" />
                                      Payroll / Compensation
                                    </h4>
                                    <Card className="border-border/20 bg-card/30">
                                      <CardContent className="p-4 space-y-3">
                                        <div className="space-y-2">
                                          <Label className="text-sm text-muted-foreground">Compensation Type</Label>
                                          <Select value={selectedContractor.compensationType || "Monthly"} onValueChange={(value: "Monthly" | "Daily" | "Hourly" | "Project-Based") => {
                                    setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                      ...c,
                                      compensationType: value,
                                      hourlyRate: value === "Hourly" ? c.hourlyRate || 0 : undefined,
                                      hoursWorked: value === "Hourly" ? c.hoursWorked || 0 : undefined,
                                      expectedMonthlyHours: value === "Hourly" ? c.expectedMonthlyHours || 160 : undefined
                                    } : c));
                                    setSelectedContractor(prev => prev ? {
                                      ...prev,
                                      compensationType: value,
                                      hourlyRate: value === "Hourly" ? prev.hourlyRate || 0 : undefined,
                                      hoursWorked: value === "Hourly" ? prev.hoursWorked || 0 : undefined,
                                      expectedMonthlyHours: value === "Hourly" ? prev.expectedMonthlyHours || 160 : undefined
                                    } : null);
                                  }}>
                                            <SelectTrigger className="w-full">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Monthly">Fixed Monthly</SelectItem>
                                              <SelectItem value="Daily">Daily Rate</SelectItem>
                                              <SelectItem value="Hourly">Hourly Rate</SelectItem>
                                              <SelectItem value="Project-Based">Project-Based</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        {selectedContractor.compensationType === "Hourly" && <>
                                            <div className="space-y-2">
                                              <Label className="text-sm text-muted-foreground">Hourly Rate ({selectedContractor.currency})</Label>
                                              <Input type="number" value={selectedContractor.hourlyRate || ""} onChange={e => {
                                      const rate = Number(e.target.value);
                                      setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                        ...c,
                                        hourlyRate: rate,
                                        baseSalary: rate * (c.hoursWorked || 0),
                                        netPay: rate * (c.hoursWorked || 0)
                                      } : c));
                                      setSelectedContractor(prev => prev ? {
                                        ...prev,
                                        hourlyRate: rate,
                                        baseSalary: rate * (prev.hoursWorked || 0),
                                        netPay: rate * (prev.hoursWorked || 0)
                                      } : null);
                                    }} className="w-full" placeholder="0.00" />
                                            </div>
                                            <div className="space-y-2">
                                              <Label className="text-sm text-muted-foreground">Expected Monthly Hours (for projections)</Label>
                                              <Input type="number" value={selectedContractor.expectedMonthlyHours || ""} onChange={e => {
                                      const hours = Number(e.target.value);
                                      setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                        ...c,
                                        expectedMonthlyHours: hours
                                      } : c));
                                      setSelectedContractor(prev => prev ? {
                                        ...prev,
                                        expectedMonthlyHours: hours
                                      } : null);
                                    }} className="w-full" placeholder="160" />
                                              <p className="text-xs text-muted-foreground">Optional: Used for monthly cost estimates</p>
                                            </div>
                                          </>}
                                      </CardContent>
                                    </Card>
                                  </div>}

                                {/* Detailed Payment Breakdown */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Payment Breakdown
                                  </h4>
                                  <Card className="border-border/20 bg-card/30">
                                     <CardContent className="p-4 space-y-3">
                                       {/* Contractor - Hourly */}
                                       {selectedContractor.employmentType === "contractor" && selectedContractor.compensationType === "Hourly" ? <>
                                           <div className="flex items-center justify-between">
                                             <span className="text-sm text-muted-foreground">Hourly Rate</span>
                                             <span className="text-sm font-semibold">
                                               {selectedContractor.currency} {selectedContractor.hourlyRate?.toLocaleString() || 0}
                                             </span>
                                           </div>
                                           <div className="flex items-center justify-between">
                                             <span className="text-sm text-muted-foreground">Hours Worked</span>
                                             <div className="flex items-center gap-2">
                                               {selectedCycle !== "previous" ? <Input type="number" value={selectedContractor.hoursWorked || ""} onChange={e => {
                                        const hours = Number(e.target.value);
                                        setContractors(prev => prev.map(c => c.id === selectedContractor.id ? {
                                          ...c,
                                          hoursWorked: hours,
                                          baseSalary: (c.hourlyRate || 0) * hours,
                                          netPay: (c.hourlyRate || 0) * hours
                                        } : c));
                                        setSelectedContractor(prev => prev ? {
                                          ...prev,
                                          hoursWorked: hours,
                                          baseSalary: (prev.hourlyRate || 0) * hours,
                                          netPay: (prev.hourlyRate || 0) * hours
                                        } : null);
                                      }} className="w-24 h-8 text-sm" placeholder="0" /> : <span className="text-sm font-semibold">{selectedContractor.hoursWorked || 0}</span>}
                                             </div>
                                           </div>
                                         </> : (/* Base Salary / Consultancy Fee */
                                <div className="flex items-center justify-between">
                                           <span className="text-sm text-muted-foreground">
                                             {selectedContractor.employmentType === "employee" ? "Base Salary" : "Base Consultancy Fee"}
                                           </span>
                                           <span className="text-sm font-semibold">
                                             {selectedContractor.currency} {selectedContractor.baseSalary.toLocaleString()}
                                           </span>
                                         </div>)}
                                       
                                      {/* Benefits or Line Items */}
                                      {selectedContractor.employmentType === "employee" && selectedContractor.employerTaxes && <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Benefits & Line Items</span>
                                          </div>
                                          <div className="pl-4 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">• Health Insurance</span>
                                              <span className="font-medium">Taxable</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">• Pension Contribution</span>
                                              <span className="font-medium">Non-Taxable (Cap: {selectedContractor.currency} 5,000)</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">• Total Benefits</span>
                                              <span className="font-medium text-blue-600">
                                                +{selectedContractor.currency} {selectedContractor.employerTaxes.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>}

                                      <Separator />

                                      {/* Gross Pay */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Gross Pay</span>
                                        <span className="text-sm font-bold text-foreground">
                                          {selectedContractor.currency} {selectedContractor.baseSalary.toLocaleString()}
                                        </span>
                                      </div>

                                      <Separator />

                                      {/* Deductions section - label removed, only showing items */}
                                      <div className="space-y-2">
                                        {leaveRecords[selectedContractor.id]?.leaveDays > 0 && <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Leave Proration ({leaveRecords[selectedContractor.id].leaveDays}d)</span>
                                            <span className="font-medium text-amber-600">
                                              -{selectedContractor.currency} {Math.round(getLeaveDeduction(selectedContractor)).toLocaleString()}
                                            </span>
                                          </div>}
                                        {selectedContractor.employmentType === "employee" && <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Income Tax & Social Contributions</span>
                                            <span className="font-medium">Included in employer cost</span>
                                          </div>}
                                      </div>

                                      {/* Adjustment Lines */}
                                      {selectedCycle !== "previous" && <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Adjustment Lines</span>
                                            <Button size="sm" variant="ghost" onClick={() => addContractorAdjustment(selectedContractor.id)} className="h-6 text-xs">
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add
                                            </Button>
                                          </div>
                                          {contractorAdjustments[selectedContractor.id]?.length > 0 && <div className="pl-4 space-y-2">
                                              {contractorAdjustments[selectedContractor.id].map(adjustment => <div key={adjustment.id} className="flex items-center gap-2">
                                                  <Input placeholder="Description" value={adjustment.name} onChange={e => updateContractorAdjustment(selectedContractor.id, adjustment.id, "name", e.target.value)} className="h-7 text-xs flex-1" />
                                                  <Input type="number" placeholder="Amount" value={adjustment.amount || ""} onChange={e => updateContractorAdjustment(selectedContractor.id, adjustment.id, "amount", Number(e.target.value))} className="h-7 text-xs w-24" />
                                                  <Button size="sm" variant="ghost" onClick={() => removeContractorAdjustment(selectedContractor.id, adjustment.id)} className="h-7 w-7 p-0">
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>)}
                                              {contractorAdjustments[selectedContractor.id].length > 0 && <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                                                  <span className="text-muted-foreground">• Total Adjustments</span>
                                                  <span className={cn("font-medium", getTotalAdjustments(selectedContractor.id) >= 0 ? "text-green-600" : "text-amber-600")}>
                                                    {getTotalAdjustments(selectedContractor.id) >= 0 ? "+" : ""}
                                                    {selectedContractor.currency} {getTotalAdjustments(selectedContractor.id).toLocaleString()}
                                                  </span>
                                                </div>}
                                            </div>}
                                        </div>}

                                      <Separator />

                                      {/* Net Pay */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Net Pay</span>
                                        <span className="text-lg font-bold text-foreground">
                                          {selectedContractor.currency} {Math.round(getPaymentDue(selectedContractor)).toLocaleString()}
                                        </span>
                                      </div>

                                      {/* Fees */}
                                      <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-sm">Est. Fees</span>
                                        <span className="text-sm">
                                          +{selectedContractor.currency} {selectedContractor.estFees}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-sm">Additional Fees</span>
                                        <span className="text-sm">
                                          +{selectedContractor.currency} {additionalFees[selectedContractor.id]?.accepted ? additionalFees[selectedContractor.id]?.amount || 50 : 0}
                                        </span>
                                      </div>

                                      <Separator />

                                      {/* Total Payable */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-base font-bold text-foreground">Total Payable</span>
                                        <span className="text-xl font-bold text-primary">
                                          {selectedContractor.currency} {Math.round(getPaymentDue(selectedContractor) + selectedContractor.estFees + (additionalFees[selectedContractor.id]?.accepted ? additionalFees[selectedContractor.id]?.amount || 50 : 0)).toLocaleString()}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* FX Information */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Currency & FX Details
                                  </h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Currency</span>
                                        <span className="text-sm font-semibold">{selectedContractor.currency}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">FX Rate</span>
                                        <span className="text-sm font-mono">{selectedContractor.fxRate} USD → {selectedContractor.currency}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">ETA</span>
                                        <span className="text-sm font-medium">{selectedContractor.eta}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Admin Override Section */}
                                {selectedCycle !== "previous" && <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Admin Override</h4>
                                    <div className="space-y-4">
                                      {/* Base Salary Override */}
                                      <div>
                                        <Label htmlFor="salary-override" className="text-sm font-medium mb-2 block">
                                          {selectedContractor.employmentType === "employee" ? "Base Salary Override" : "Base Consultancy Fee Override"}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-muted-foreground">{selectedContractor.currency}</span>
                                          <input id="salary-override" type="number" defaultValue={selectedContractor.baseSalary} className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background" placeholder={selectedContractor.baseSalary.toString()} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Override {selectedContractor.employmentType === "employee" ? "base salary" : "base consultancy fee"} for this payroll cycle
                                        </p>
                                      </div>
                                    </div>
                                  </div>}
                              </div>

                              <SheetFooter className="mt-6">
                                <Button variant="outline" onClick={() => setContractorDrawerOpen(false)}>
                                  {selectedCycle === "previous" ? "Close" : "Cancel"}
                                </Button>
                                {selectedCycle !== "previous" && <Button onClick={handleSaveContractorAdjustment}>
                                    Save & Recalculate
                                  </Button>}
                              </SheetFooter>
                            </>}
                        </SheetContent>
                      </Sheet>
                  </div>
                </motion.div>
              </div>
            </div>
            <FloatingKurtButton />
            <CountryRulesDrawer open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen} />
            <EmployeePayrollDrawer open={employeePayrollDrawerOpen} onOpenChange={setEmployeePayrollDrawerOpen} employee={selectedEmployee} onSave={handleSaveEmployeePayroll} />
      <OverrideExceptionModal open={overrideModalOpen} onOpenChange={setOverrideModalOpen} exception={exceptionToOverride} justification={overrideJustification} onJustificationChange={setOverrideJustification} onConfirm={handleConfirmOverride} />

      <ExecutionConfirmationDialog open={executionConfirmOpen} onOpenChange={setExecutionConfirmOpen} onConfirm={handleConfirmExecution} cohort={pendingExecutionCohort || "all"} employeeCount={allContractors.filter(c => c.employmentType === "employee").length} contractorCount={allContractors.filter(c => c.employmentType === "contractor").length} employeeTotal={allContractors.filter(c => c.employmentType === "employee").reduce((sum, c) => sum + c.baseSalary, 0)} contractorTotal={allContractors.filter(c => c.employmentType === "contractor").reduce((sum, c) => sum + c.baseSalary, 0)} currency="USD" />
            <LeaveAttendanceExceptionDrawer open={leaveAttendanceDrawerOpen} onOpenChange={setLeaveAttendanceDrawerOpen} exception={selectedLeaveException} worker={selectedLeaveException ? allContractors.find(c => c.id === selectedLeaveException.contractorId) : undefined} onResolve={handleResolveLeaveAttendance} />
            <LeaveDetailsDrawer open={leaveDetailsDrawerOpen} onOpenChange={setLeaveDetailsDrawerOpen} workerName={selectedWorkerForLeave?.name || ""} workerRole={selectedWorkerForLeave?.role} country={selectedWorkerForLeave?.country || ""} employmentType={selectedWorkerForLeave?.employmentType || "contractor"} ftePercent={selectedWorkerForLeave?.ftePercent || 100} scheduledDays={selectedWorkerForLeave?.leaveData?.scheduledDays || 22} actualDays={selectedWorkerForLeave?.leaveData?.actualDays || 22} leaveEntries={selectedWorkerForLeave ? [{
            id: "leave-1",
            requestDate: "Nov 1, 2025",
            leaveStartDate: "Nov 5, 2025",
            leaveEndDate: "Nov 7, 2025",
            leaveType: "Annual",
            daysCount: 3,
            status: selectedWorkerForLeave.leaveData?.hasPendingLeave ? "Pending" : "Approved",
            approvedBy: "Jane Smith",
            recordedInFronted: true,
            notes: "Pre-approved family vacation"
          }, {
            id: "leave-2",
            requestDate: "Oct 28, 2025",
            leaveStartDate: "Nov 12, 2025",
            leaveEndDate: "Nov 12, 2025",
            leaveType: "Sick",
            daysCount: 1,
            status: "Approved",
            approvedBy: "Company HR System",
            recordedInFronted: false
          }] : []} attendanceAnomalies={selectedWorkerForLeave?.leaveData?.hasMissingAttendance ? [{
            id: "anomaly-1",
            date: "Nov 8, 2025",
            type: "Missing timesheet",
            description: "No timesheet submitted for this date",
            severity: "high"
          }] : []} />

            {/* Leave Record Selector Dialog */}
            <Dialog open={leaveSelectorOpen} onOpenChange={open => {
            setLeaveSelectorOpen(open);
            if (!open) {
              setLeaveSearchQuery("");
              setSelectedLeaveWorkers([]);
            }
          }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Leave Records</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or country..." value={leaveSearchQuery} onChange={e => setLeaveSearchQuery(e.target.value)} className="pl-9" />
                  </div>

                  {/* Worker List */}
                  <ScrollArea className="h-[400px] rounded-md border border-border bg-card/30">
                    <div className="p-4 space-y-2">
                      {(() => {
                      const availableWorkers = allContractors.filter(c => !leaveRecords[c.id] || leaveRecords[c.id]?.leaveDays === 0);
                      const filteredWorkers = availableWorkers.filter(contractor => contractor.name.toLowerCase().includes(leaveSearchQuery.toLowerCase()) || contractor.country.toLowerCase().includes(leaveSearchQuery.toLowerCase()));
                      if (filteredWorkers.length === 0) {
                        return <div className="text-center py-12">
                              <p className="text-sm text-muted-foreground">
                                {leaveSearchQuery ? "No workers found matching your search" : "All workers are already tracked for leave"}
                              </p>
                            </div>;
                      }
                      return filteredWorkers.map(contractor => {
                        const isSelected = selectedLeaveWorkers.includes(contractor.id);
                        return <div key={contractor.id} onClick={() => {
                          setSelectedLeaveWorkers(prev => isSelected ? prev.filter(id => id !== contractor.id) : [...prev, contractor.id]);
                        }} className={cn("flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer", isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50")}>
                              <Checkbox checked={isSelected} onCheckedChange={() => {
                            setSelectedLeaveWorkers(prev => isSelected ? prev.filter(id => id !== contractor.id) : [...prev, contractor.id]);
                          }} />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{contractor.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {contractor.employmentType === "employee" ? "Employee" : "Contractor"} • {contractor.country}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {contractor.currency} {contractor.baseSalary.toLocaleString()}
                              </Badge>
                            </div>;
                      });
                    })()}
                    </div>
                  </ScrollArea>

                  {/* Selection Summary */}
                  {selectedLeaveWorkers.length > 0 && <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Info className="h-4 w-4 text-primary" />
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{selectedLeaveWorkers.length}</span> worker{selectedLeaveWorkers.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => {
                  setLeaveSelectorOpen(false);
                  setLeaveSearchQuery("");
                  setSelectedLeaveWorkers([]);
                }}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                  if (selectedLeaveWorkers.length === 0) {
                    toast.error("Please select at least one worker");
                    return;
                  }
                  selectedLeaveWorkers.forEach(workerId => {
                    const phSettings = getSettings("PH");
                    handleUpdateLeave(workerId, {
                      leaveDays: 1,
                      workingDays: phSettings.daysPerMonth,
                      clientConfirmed: false
                    });
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
                  <AlertDialogTitle>
                    {hasUnresolvedIssues ? "Unresolved issues remain for this payroll run" : "Complete this payroll run?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {hasUnresolvedIssues ? <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          The following issues have not been resolved:
                        </p>
                        <div className="space-y-2 text-sm">
                          {unresolvedIssues.blockingExceptions > 0 && <div className="flex items-center gap-2 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <span>Blocking exceptions: {unresolvedIssues.blockingExceptions}</span>
                            </div>}
                          {unresolvedIssues.failedPostings > 0 && <div className="flex items-center gap-2 text-destructive">
                              <XCircle className="h-4 w-4" />
                              <span>Failed employee postings: {unresolvedIssues.failedPostings}</span>
                            </div>}
                          {unresolvedIssues.failedPayouts > 0 && <div className="flex items-center gap-2 text-destructive">
                              <XCircle className="h-4 w-4" />
                              <span>Failed contractor payouts: {unresolvedIssues.failedPayouts}</span>
                            </div>}
                        </div>
                        <div className="space-y-2 pt-2">
                          <label htmlFor="justification" className="text-sm font-medium">
                            Please provide a reason for completing this run with unresolved issues:
                          </label>
                          <Textarea id="justification" value={forceCompleteJustification} onChange={e => setForceCompleteJustification(e.target.value)} placeholder="Enter your justification here..." className="min-h-[80px]" />
                        </div>
                      </div> : "All blocking exceptions are resolved and all payouts/postings have completed. Once you mark this run as complete, it will be locked and become read-only."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setForceCompleteJustification("")}>Cancel</AlertDialogCancel>
                  {hasUnresolvedIssues ? <>
                      <Button variant="outline" onClick={handleGoBackToFix}>
                        Go back to fix issues
                      </Button>
                      <AlertDialogAction onClick={() => confirmMarkComplete(true)} disabled={!forceCompleteJustification.trim()} className="bg-destructive hover:bg-destructive/90">
                        Force complete with issues
                      </AlertDialogAction>
                    </> : <AlertDialogAction onClick={() => confirmMarkComplete(false)}>
                      Mark as complete
                    </AlertDialogAction>}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </AgentLayout>
        </main>
      </div>
    </RoleLensProvider>;
};
export default CompanyAdminDashboardV3;