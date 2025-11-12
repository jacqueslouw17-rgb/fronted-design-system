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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, CheckSquare, Play, TrendingUp, RefreshCw, Lock, Info, Clock, X, AlertCircle, Download, FileText, Building2, Receipt, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format } from "date-fns";

type PayrollStep = "review-fx" | "exceptions" | "approvals" | "execute" | "track";

const steps = [
  { id: "review-fx", label: "Review FX", icon: DollarSign },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
  { id: "approvals", label: "Approvals", icon: CheckSquare },
  { id: "execute", label: "Execute", icon: Play },
  { id: "track", label: "Track & Reconcile", icon: TrendingUp },
] as const;

interface LeaveRecord {
  contractorId: string;
  leaveDays: number;
  workingDays: number;
  leaveReason?: string;
  leaveDate?: string;
  approvedBy?: string;
  clientConfirmed: boolean;
  contractorReported: boolean;
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
}

interface PayrollException {
  id: string;
  contractorId: string;
  contractorName: string;
  type: "missing-bank" | "holiday-rails" | "doc-expiry" | "over-threshold";
  description: string;
  severity: "high" | "medium" | "low";
  resolved: boolean;
  snoozed: boolean;
}

const initialExceptions: PayrollException[] = [
  {
    id: "exc-1",
    contractorId: "5",
    contractorName: "Emma Wilson",
    type: "missing-bank",
    description: "Bank account type not specified (Checking/Savings required)",
    severity: "high",
    resolved: false,
    snoozed: false,
  },
  {
    id: "exc-2",
    contractorId: "7",
    contractorName: "Luis Hernandez",
    type: "holiday-rails",
    description: "Holiday payout adjustment of +$850 needs approval",
    severity: "medium",
    resolved: false,
    snoozed: false,
  },
];

const contractorsByCurrency: Record<string, ContractorPayment[]> = {
  EUR: [
    { 
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
      employmentType: "contractor" 
    },
    { 
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
      leaveData: {
        contractorId: "2",
        leaveDays: 2,
        workingDays: 21.67,
        leaveReason: "Personal leave",
        leaveDate: "Nov 10-11, 2025",
        approvedBy: "HR Manager",
        clientConfirmed: true,
        contractorReported: true
      }
    },
    { 
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
      employmentType: "contractor" 
    },
  ],
  NOK: [
    { 
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
      employerTaxes: 9750 
    },
    { 
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
      leaveData: {
        contractorId: "5",
        leaveDays: 1,
        workingDays: 21.67,
        leaveReason: "Sick leave",
        leaveDate: "Nov 8, 2025",
        approvedBy: "Manager",
        clientConfirmed: true,
        contractorReported: true
      }
    },
  ],
  PHP: [
    { 
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
      employerTaxes: 42000 
    },
    { 
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
      employmentType: "contractor" 
    },
    { 
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
      employmentType: "contractor" 
    },
  ],
};

const PayrollBatch: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { isSpeaking, addMessage, setLoading, setOpen } = useAgentState();
  const [viewMode, setViewMode] = useState<"tracker" | "payroll">("payroll");
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review-fx");
  const [fxRatesLocked, setFxRatesLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exceptions, setExceptions] = useState<PayrollException[]>(initialExceptions);
  const [fixDrawerOpen, setFixDrawerOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<PayrollException | null>(null);
  const [bankAccountType, setBankAccountType] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "requested" | "viewed" | "approved">("pending");
  const [approvalTimeline, setApprovalTimeline] = useState<Array<{ status: string; timestamp: Date | null }>>([
    { status: "requested", timestamp: null },
    { status: "viewed", timestamp: null },
    { status: "approved", timestamp: null },
  ]);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  const [userRole] = useState<"admin" | "user">("admin");
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<Record<string, "pending" | "processing" | "complete">>({});
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
  const [contractorDrawerOpen, setContractorDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<ContractorPayment | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [additionalFees, setAdditionalFees] = useState<Record<string, { amount: number; accepted: boolean }>>({});
  const [oneTimeAdjustment, setOneTimeAdjustment] = useState<number>(0);
  const [scrollStates, setScrollStates] = useState<Record<string, boolean>>({});

  // Initialize leave records from contractor data
  React.useEffect(() => {
    const initialLeaveRecords: Record<string, LeaveRecord> = {};
    allContractors.forEach(contractor => {
      if (contractor.leaveData) {
        initialLeaveRecords[contractor.id] = contractor.leaveData;
      }
    });
    setLeaveRecords(initialLeaveRecords);
  }, []);

  // Pro-rating calculation helpers
  const calculateProratedPay = (baseSalary: number, leaveDays: number, workingDays: number = 21.67) => {
    const dailyRate = baseSalary / workingDays;
    const payDays = workingDays - leaveDays;
    const proratedPay = dailyRate * payDays;
    return {
      dailyRate,
      payDays,
      proratedPay,
      difference: baseSalary - proratedPay
    };
  };

  const getPaymentDue = (contractor: ContractorPayment): number => {
    const leaveData = leaveRecords[contractor.id];
    if (!leaveData || leaveData.leaveDays === 0) {
      return contractor.baseSalary;
    }
    const { proratedPay } = calculateProratedPay(contractor.baseSalary, leaveData.leaveDays, leaveData.workingDays);
    return proratedPay;
  };

  const handleUpdateLeave = (contractorId: string, updates: Partial<LeaveRecord>) => {
    setLeaveRecords(prev => ({
      ...prev,
      [contractorId]: {
        ...prev[contractorId],
        contractorId,
        workingDays: 21.67,
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
    setOneTimeAdjustment(0);
    setContractorDrawerOpen(true);
  };

  const handleSaveContractorAdjustment = () => {
    if (selectedContractor && oneTimeAdjustment !== 0) {
      // In real implementation, update contractor payment data
      toast.success(`Adjustment saved for ${selectedContractor.name}. Totals recalculated.`);
      setLastUpdated(new Date());
      setContractorDrawerOpen(false);
    }
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
  const [paymentReceipts, setPaymentReceipts] = useState([
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ]);

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const allContractors = [
    ...contractorsByCurrency.EUR,
    ...contractorsByCurrency.NOK,
    ...contractorsByCurrency.PHP,
  ];

  const groupedByCurrency = allContractors.reduce((acc, contractor) => {
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
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
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

  const handleResolveException = () => {
    if (!selectedException) return;

    setExceptions(prev => prev.map(exc =>
      exc.id === selectedException.id
        ? { ...exc, resolved: true }
        : exc
    ));
    setFixDrawerOpen(false);
    toast.success(`Exception resolved for ${selectedException.contractorName}`);
  };

  const handleSnoozeException = (exceptionId: string) => {
    setExceptions(prev => prev.map(exc =>
      exc.id === exceptionId
        ? { ...exc, snoozed: true }
        : exc
    ));
    toast.info("Exception snoozed to next cycle");
  };

  const handleRequestApproval = () => {
    setIsRequestingApproval(true);
    
    setTimeout(() => {
      setApprovalStatus("requested");
      setApprovalTimeline(prev => prev.map((item, idx) => 
        idx === 0 ? { ...item, timestamp: new Date() } : item
      ));
      setIsRequestingApproval(false);
      toast.success("Approval request sent to Howard (CFO)");
      
      setTimeout(() => {
        setApprovalStatus("viewed");
        setApprovalTimeline(prev => prev.map((item, idx) => 
          idx === 1 ? { ...item, timestamp: new Date() } : item
        ));
        toast.info("Howard has viewed the approval request");
      }, 3000);
    }, 1500);
  };

  const handleAdminOverride = () => {
    setApprovalStatus("approved");
    setApprovalTimeline(prev => prev.map((item, idx) => 
      idx === 2 ? { ...item, timestamp: new Date() } : item
    ));
    toast.success("Approved via admin override");
    
    setTimeout(() => {
      setCurrentStep("execute");
    }, 1500);
  };

  const handleExecutePayroll = async () => {
    setIsExecuting(true);
    
    const initialProgress: Record<string, "pending" | "processing" | "complete"> = {};
    allContractors.forEach(c => {
      initialProgress[c.id] = "pending";
    });
    setExecutionProgress(initialProgress);

    for (const contractor of allContractors) {
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "processing" }));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "complete" }));
    }

    setIsExecuting(false);
    toast.success("Payroll batch executed successfully!");
    
    setTimeout(() => {
      setCurrentStep("track");
    }, 1500);
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

    setPaymentReceipts(prev => 
      prev.map(receipt => 
        receipt.payeeId === selectedPayeeForReschedule.payeeId
          ? { ...receipt, eta: format(rescheduleDate, "MMM dd, yyyy") }
          : receipt
      )
    );

    setRescheduleModalOpen(false);

    const reasonText = rescheduleReason === "holiday" ? "holiday" : "bank delay";
    const notifyText = notifyContractor 
      ? ` ${selectedPayeeForReschedule.payeeName} has been notified.`
      : "";
    
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

  const activeExceptions = exceptions.filter(exc => !exc.resolved && !exc.snoozed);
  const allExceptionsResolved = activeExceptions.length === 0;

  const renderStepContent = () => {
    switch (currentStep) {
      case "review-fx":
        return (
              <div className="space-y-3">
            {/* Status Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">FX Review</h3>
                {fxRatesLocked && lockedAt && (
                  <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30 gap-1.5">
                    <Lock className="h-3 w-3" />
                    Locked at {lockedAt}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshQuote}
                  disabled={isRefreshing || fxRatesLocked}
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                  Refresh Quote
                </Button>
                {/* Lock Rate button temporarily hidden - logic preserved for future reactivation */}
              </div>
            </div>

            {/* Leave & Attendance Section */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => setShowLeaveSection(!showLeaveSection)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">Leave & Attendance</h4>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(leaveRecords).filter(id => leaveRecords[id]?.leaveDays > 0).length} with leave
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {showLeaveSection ? "Hide details" : "View details"}
                    </span>
                    <div className={cn(
                      "transition-transform duration-200",
                      showLeaveSection && "rotate-180"
                    )}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </button>

                {showLeaveSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-3">
                        Pro-rated salaries calculated using: Base Salary ÷ 21.67 × (Working Days - Leave Days)
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs text-right">Leave Days</TableHead>
                            <TableHead className="text-xs text-right">Working Days</TableHead>
                            <TableHead className="text-xs text-right">Pay Days</TableHead>
                            <TableHead className="text-xs text-right">Base Salary</TableHead>
                            <TableHead className="text-xs text-right">Payment Due</TableHead>
                            <TableHead className="text-xs text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allContractors.map((contractor) => {
                            const leaveData = leaveRecords[contractor.id];
                            const hasLeave = leaveData && leaveData.leaveDays > 0;
                            const workingDays = leaveData?.workingDays || 21.67;
                            const leaveDays = leaveData?.leaveDays || 0;
                            const payDays = workingDays - leaveDays;
                            const paymentDue = getPaymentDue(contractor);
                            
                            return (
                              <TableRow key={contractor.id} className={cn(
                                hasLeave && "bg-amber-500/5"
                              )}>
                                <TableCell className="text-sm font-medium">{contractor.name}</TableCell>
                                <TableCell className="text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    max="31"
                                    step="0.5"
                                    value={leaveDays}
                                    onChange={(e) => handleUpdateLeave(contractor.id, { 
                                      leaveDays: parseFloat(e.target.value) || 0 
                                    })}
                                    className="w-16 px-2 py-1 text-xs text-right border border-border rounded bg-background"
                                  />
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground">
                                  {workingDays.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-xs font-medium">
                                  {payDays.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                  {contractor.currency} {contractor.baseSalary.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right text-sm font-semibold">
                                  {contractor.currency} {Math.round(paymentDue).toLocaleString()}
                                  {hasLeave && (
                                    <div className="text-xs text-amber-600 mt-0.5">
                                      -{contractor.currency} {Math.round(contractor.baseSalary - paymentDue).toLocaleString()}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {leaveData?.clientConfirmed && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                                              ✓
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Client confirmed</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {hasLeave && !leaveData?.clientConfirmed && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                              ⏳
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Awaiting confirmation</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Currency Tables */}
            {Object.entries(groupedByCurrency).map(([currency, contractors]) => {
              const currencySymbols: Record<string, string> = {
                EUR: "€",
                NOK: "kr",
                PHP: "₱",
                USD: "$",
              };
              const symbol = currencySymbols[currency] || currency;
              
              return (
                <Card key={currency} className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{currency} Payments</span>
                        <Badge variant="outline" className="text-xs">{contractors.length} {contractors.length === 1 ? 'payee' : 'payees'}</Badge>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7">
                              <Info className="h-3.5 w-3.5" />
                              Why this rate?
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold text-xs">Mid-Market Rate</p>
                              <p className="text-xs text-muted-foreground">
                                Rate: {contractors[0].fxRate} USD → {currency}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Source: Wise mid-market rate
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t">
                                <Clock className="h-3 w-3" />
                                <span>Updated 2 minutes ago</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Horizontal Scroll Container */}
                    <div 
                      className="overflow-visible whitespace-nowrap"
                    >
                      <Table 
                        className="relative min-w-max"
                        containerProps={{ className: "overflow-x-auto", onScroll: (e) => handleTableScroll(currency, e) }}
                      >
                        <TableHeader>
                          <TableRow>
                            <TableHead className={cn(
                              "text-xs sticky left-0 z-30 min-w-[180px] transition-all duration-200",
                              scrollStates[currency] ? "bg-card shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]" : "bg-transparent"
                            )}>
                              Name
                            </TableHead>
                            <TableHead className="text-xs min-w-[120px]">Role</TableHead>
                            <TableHead className="text-xs min-w-[120px]">Country</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Gross Pay</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Deductions</TableHead>
                            <TableHead className="text-xs text-right min-w-[110px]">Net Pay</TableHead>
                            <TableHead className="text-xs text-right min-w-[100px]">Est. Fees</TableHead>
                            <TableHead className="text-xs text-right min-w-[150px]">Additional Fees</TableHead>
                            <TableHead className="text-xs text-right min-w-[130px]">Total Payable</TableHead>
                            <TableHead className="text-xs min-w-[100px]">Status</TableHead>
                            <TableHead className="text-xs min-w-[90px]">ETA</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {contractors.map((contractor) => {
                          const leaveData = leaveRecords[contractor.id];
                          const hasLeave = leaveData && leaveData.leaveDays > 0;
                          const paymentDue = getPaymentDue(contractor);
                          const difference = contractor.baseSalary - paymentDue;
                          const grossPay = contractor.baseSalary;
                          const deductions = 0; // Placeholder - would be calculated based on taxes
                          const netPay = paymentDue;
                          const additionalFee = additionalFees[contractor.id];
                          const totalPayable = netPay + contractor.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                          
                          return (
                            <TableRow 
                              key={contractor.id}
                              className="cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => handleOpenContractorDetail(contractor)}
                            >
                              <TableCell className={cn(
                                "font-medium text-sm sticky left-0 z-30 min-w-[180px] transition-all duration-200",
                                scrollStates[currency] ? "bg-card shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]" : "bg-transparent"
                              )}>
                                <div className="flex items-center gap-2">
                                  {contractor.name}
                                  {hasLeave && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewLeaveDetails(contractor);
                                            }}
                                            className="inline-flex"
                                          >
                                            <Badge 
                                              variant="outline" 
                                              className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 cursor-pointer hover:bg-amber-500/20"
                                            >
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
                                    </TooltipProvider>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[120px]">
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
                              <TableCell className="text-sm min-w-[120px]">{contractor.country}</TableCell>
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
                                        <p className="font-semibold">Deductions</p>
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
                                  <Select
                                    value={additionalFee?.accepted ? "accept" : "decline"}
                                    onValueChange={(value) => {
                                      handleToggleAdditionalFee(contractor.id, value === "accept");
                                    }}
                                  >
                                    <SelectTrigger 
                                      className="w-24 h-7 text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                    >
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
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30"
                                >
                                  Ready
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm min-w-[90px]">{contractor.eta}</TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {/* Total Summary Row */}
                        <TableRow className="bg-muted/50 font-semibold border-t-2 border-border">
                          <TableCell colSpan={3} className={cn(
                            "text-sm sticky left-0 z-20 transition-all duration-200",
                            scrollStates[currency] ? "bg-card shadow-[2px_0_6px_0px_rgba(0,0,0,0.06)]" : "bg-transparent"
                          )}>
                            Total {currency}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {symbol}{contractors.reduce((sum, c) => sum + c.baseSalary, 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {symbol}{contractors.reduce((sum, c) => {
                              const leaveData = leaveRecords[c.id];
                              return sum + (leaveData?.leaveDays > 0 ? c.baseSalary - getPaymentDue(c) : 0);
                            }, 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {symbol}{contractors.reduce((sum, c) => sum + getPaymentDue(c), 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {symbol}{contractors.reduce((sum, c) => sum + c.estFees, 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {symbol}{contractors.reduce((sum, c) => {
                              const additionalFee = additionalFees[c.id];
                              return sum + (additionalFee?.accepted ? additionalFee.amount : 0);
                            }, 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm font-bold">
                            {symbol}{contractors.reduce((sum, c) => {
                              const additionalFee = additionalFees[c.id];
                              return sum + getPaymentDue(c) + c.estFees + (additionalFee?.accepted ? additionalFee.amount : 0);
                            }, 0).toLocaleString()}
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Summary Card */}
            <Card className="border-border/40 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Payees</p>
                    <p className="text-2xl font-bold text-foreground">{allContractors.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Payment Due</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${(allContractors.reduce((sum, c) => sum + getPaymentDue(c), 0) / 1000).toFixed(1)}K
                    </p>
                    {Object.keys(leaveRecords).some(id => leaveRecords[id]?.leaveDays > 0) && (
                      <p className="text-xs text-amber-600 mt-1">
                        Includes pro-rated adjustments
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Est. Fees</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${allContractors.reduce((sum, c) => sum + c.estFees, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer CTA */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Step 1 of 5 – FX Review
              </div>
              <Button 
                className="h-11 px-6 text-sm font-medium"
                onClick={() => setCurrentStep("exceptions")}
              >
                Go to Exceptions
              </Button>
            </div>
          </div>
        );

      case "exceptions":
        return (
          <div className="space-y-6">
            {/* Step Label */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Step 2 of 5 – Exceptions
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-foreground">Exception Review</h3>

            {allExceptionsResolved && (
              <Card className="border-accent-green-outline/30 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-green-fill/30">
                      <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">All Clear</p>
                      <p className="text-xs text-muted-foreground">All issues resolved - you can proceed to approvals.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exception List */}
            {exceptions.length > 0 && (
              <div className="space-y-3">
              {activeExceptions.map((exception) => {
                const severityConfig = {
                  high: { color: "border-red-500/30 bg-red-500/5", icon: "text-red-600" },
                  medium: { color: "border-amber-500/30 bg-amber-500/5", icon: "text-amber-600" },
                  low: { color: "border-blue-500/30 bg-blue-500/5", icon: "text-blue-600" },
                };

                const config = severityConfig[exception.severity];

                return (
                  <Card key={exception.id} className={cn("border", config.color)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
                          <AlertTriangle className={cn("h-4 w-4", config.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {exception.contractorName}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {exception.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {exception.description}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs"
                              onClick={() => handleOpenFixDrawer(exception)}
                            >
                              Fix
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleSnoozeException(exception.id)}
                            >
                              Snooze to Next Cycle
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}

            {/* Summary */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-foreground">{activeExceptions.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-accent-green-text">
                      {exceptions.filter(exc => exc.resolved).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Snoozed</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {exceptions.filter(exc => exc.snoozed).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer CTA */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("review-fx")}
              >
                Back to FX Review
              </Button>
              <Button
                className="h-11 px-6 text-sm font-medium"
                disabled={!allExceptionsResolved}
                onClick={() => setCurrentStep("approvals")}
              >
                {allExceptionsResolved ? "Go to Approvals" : `Resolve ${activeExceptions.length} Exception${activeExceptions.length !== 1 ? 's' : ''} First`}
              </Button>
            </div>
          </div>
        );

      case "approvals":
        const employees = allContractors.filter(c => c.employmentType === "employee");
        const contractors = allContractors.filter(c => c.employmentType === "contractor");
        
        const employeesTotalNetPay = employees.reduce((sum, e) => sum + e.netPay, 0);
        const employeesTotalEmployerTaxes = employees.reduce((sum, e) => sum + (e.employerTaxes || 0), 0);
        const employeesTotalCost = employeesTotalNetPay + employeesTotalEmployerTaxes;
        
        const contractorsTotalNetPay = contractors.reduce((sum, c) => sum + c.netPay, 0);
        
        return (
          <div className="space-y-6">
            {/* Step Label */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Step 3 of 5 – Financial Approval
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-foreground">Financial Approval</h3>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">CFO Approval Required</h3>
                    <p className="text-xs text-muted-foreground">Howard Mitchell • Chief Financial Officer</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      approvalStatus === "approved" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
                      approvalStatus === "requested" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                      approvalStatus === "viewed" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                      approvalStatus === "pending" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {approvalStatus === "approved" && "Approved"}
                    {approvalStatus === "requested" && "Pending"}
                    {approvalStatus === "viewed" && "Under Review"}
                    {approvalStatus === "pending" && "Not Requested"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                          Employees
                        </Badge>
                        <span className="text-xs text-muted-foreground">({employees.length})</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Net Pay</span>
                          <span className="text-sm font-medium">${(employeesTotalNetPay / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Employer Taxes</span>
                          <span className="text-sm font-medium text-amber-600">+${(employeesTotalEmployerTaxes / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="pt-2 border-t border-border flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-foreground">Total Cost</span>
                          <span className="text-base font-bold text-foreground">${(employeesTotalCost / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                          Contractors
                        </Badge>
                        <span className="text-xs text-muted-foreground">({contractors.length})</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Net Pay</span>
                          <span className="text-sm font-medium">${(contractorsTotalNetPay / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Employer Taxes</span>
                          <span className="text-sm font-medium text-muted-foreground">N/A</span>
                        </div>
                        <div className="pt-2 border-t border-border flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-foreground">Total Cost</span>
                          <span className="text-base font-bold text-foreground">${(contractorsTotalNetPay / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Approval Timeline</p>
                  <div className="space-y-2">
                    {approvalTimeline.map((item, index) => {
                      const isActive = approvalStatus === item.status || 
                        (approvalStatus === "approved" && item.status !== "approved") ||
                        (approvalStatus === "viewed" && item.status === "requested");
                      
                      return (
                        <div key={item.status} className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors",
                            isActive || item.timestamp 
                              ? "bg-accent-green-fill border-accent-green-outline" 
                              : "bg-muted border-border"
                          )}>
                            {item.timestamp ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                            ) : (
                              <Circle className={cn(
                                "h-2 w-2",
                                isActive ? "fill-accent-green-text" : "fill-muted-foreground"
                              )} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm font-medium",
                              item.timestamp ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </p>
                            {item.timestamp && (
                              <p className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {approvalStatus !== "approved" && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={approvalStatus !== "pending" || isRequestingApproval}
                      onClick={handleRequestApproval}
                    >
                      {isRequestingApproval ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Request Approval"
                      )}
                    </Button>
                    {userRole === "admin" && (
                      <Button
                        className="flex-1"
                        onClick={handleAdminOverride}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Now (Admin Override)
                      </Button>
                    )}
                  </div>
                )}

                {approvalStatus === "approved" && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20">
                    <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Approved</p>
                      <p className="text-xs text-muted-foreground">Ready to execute payroll batch</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "execute":
        return (
          <div className="space-y-6">
            {/* Step Label */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Step 4 of 5 – Execute Payroll
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-foreground">Execute Payroll</h3>

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
                        <p className="text-xs text-muted-foreground mb-2">Total Amount</p>
                        <p className="text-2xl font-bold text-foreground">$747K</p>
                        <p className="text-xs text-muted-foreground mt-1">across 8 contractors</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">Processing Time</p>
                        <p className="text-2xl font-bold text-foreground">~2 min</p>
                        <p className="text-xs text-muted-foreground mt-1">estimated duration</p>
                      </div>
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
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                      <span className="text-muted-foreground">All exceptions resolved</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                      <span className="text-muted-foreground">CFO approval received</span>
                    </div>
                  </div>
                )}

                {(isExecuting || Object.keys(executionProgress).length > 0) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">Processing Payments</h4>
                      <Badge variant="outline" className="text-xs">
                        {Object.values(executionProgress).filter(s => s === "complete").length} / {allContractors.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allContractors.map((contractor) => {
                        const status = executionProgress[contractor.id] || "pending";
                        
                        return (
                          <motion.div
                            key={contractor.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                              status === "complete" && "bg-accent-green-fill/10 border-accent-green-outline/20",
                              status === "processing" && "bg-blue-500/10 border-blue-500/20 animate-pulse",
                              status === "pending" && "bg-muted/20 border-border"
                            )}
                          >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background">
                              {status === "complete" && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                >
                                  <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                                </motion.div>
                              )}
                              {status === "processing" && (
                                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                              )}
                              {status === "pending" && (
                                <Circle className="h-3 w-3 text-muted-foreground" />
                              )}
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

                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px]",
                                status === "complete" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
                                status === "processing" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                                status === "pending" && "bg-muted text-muted-foreground"
                              )}
                            >
                              {status === "complete" && "Sent"}
                              {status === "processing" && "Processing"}
                              {status === "pending" && "Queued"}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isExecuting && Object.keys(executionProgress).length === 0 && (
                  <Button 
                    className="w-full h-11 text-sm font-medium bg-primary hover:bg-primary/90"
                    onClick={handleExecutePayroll}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Payroll Now
                  </Button>
                )}

                {!isExecuting && Object.keys(executionProgress).length > 0 && 
                 Object.values(executionProgress).every(s => s === "complete") && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-accent-green-text" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Batch Executed Successfully</p>
                      <p className="text-xs text-muted-foreground">
                        All {allContractors.length} payments processed • Advancing to tracking...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "track":
        return (
          <div className="space-y-6">
            {/* Step Label */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Step 5 of 5 – Track & Reconcile
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Live Tracking
              </Badge>
            </div>

            <h2 className="text-xl font-semibold text-foreground">Track & Reconcile</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Transaction Monitor</h3>
                </div>
                <div className="space-y-3">
                  {paymentReceipts.map((receipt) => (
                    <div
                      key={receipt.payeeId}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/40"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-foreground">{receipt.payeeName}</p>
                          <Badge
                            variant={receipt.status === "Paid" ? "default" : "outline"}
                            className={
                              receipt.status === "Paid"
                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            }
                          >
                            {receipt.status === "Paid" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {receipt.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{receipt.amount.toLocaleString()} {receipt.ccy}</span>
                          <span>•</span>
                          <span>{receipt.rail}</span>
                          <span>•</span>
                          <span>ETA: {receipt.eta}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ref: {receipt.providerRef}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">FX Snapshot</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">EUR/USD</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Locked
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">0.9200</p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Spread:</span>
                        <span>0.50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span>€25.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Reconciliation</h3>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={handleDownloadAuditPDF}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Audit PDF
                  </Button>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground mb-2">Sync to Accounting</p>
                  <Button
                    onClick={() => handleSyncToAccounting("Xero")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Sync to Xero
                  </Button>
                  <Button
                    onClick={() => handleSyncToAccounting("QuickBooks")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Sync to QuickBooks
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 px-6 bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">Step: {currentStep}</h3>
            <p className="text-sm text-muted-foreground">
              This step content will be displayed here.
            </p>
          </div>
        );
    }
  };

  const handleKurtAction = async (action: string) => {
    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
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
      text: response,
    });

    setLoading(false);
  };

  return (
    <RoleLensProvider initialRole="admin">
      <div className="flex flex-col h-screen">
        {/* Topbar */}
        <Topbar
          userName={`${userData.firstName} ${userData.lastName}`}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={toggleDrawer}
        />

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
                <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                     style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                     style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
              </div>
              <div className="relative z-10">
                <motion.div 
                  key="payroll-pipeline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="max-w-7xl mx-auto p-8 pb-32 space-y-2">
                    {/* Agent Header */}
                    <AgentHeader
                      title={`Welcome ${userData.firstName}, review payroll`}
                      subtitle="Kurt can help with: FX rates, compliance checks, or payment execution."
                      showPulse={true}
                      showInput={false}
                      simplified={false}
                      // tags={
                      //   <AgentHeaderTags 
                      //     onAnyUpdates={() => handleKurtAction('any-updates')}
                      //     onAskKurt={() => handleKurtAction('ask-kurt')}
                      //   />
                      // }
                    />

                    {/* View Mode Switch */}
                    <div className="flex items-center justify-center py-2">
                      <Tabs 
                        value={viewMode} 
                        onValueChange={(value) => setViewMode(value as "tracker" | "payroll")}
                      >
                        <TabsList className="grid w-[280px] grid-cols-2">
                          <TabsTrigger value="tracker">Tracker</TabsTrigger>
                          <TabsTrigger value="payroll">Payroll</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Conditional View */}
                    <div className="pt-6">
                      {viewMode === "tracker" ? (
                      /* Pipeline Tracking - Full Width */
                      <div className="space-y-4">
                        <div className="mt-3">
                          <PipelineView 
                            mode="full-pipeline-with-payroll"
                            contractors={[
                              // Early stage candidates from Flow 2
                              {
                                id: "display-1",
                                name: "Liam Chen",
                                country: "Singapore",
                                countryFlag: "🇸🇬",
                                role: "Frontend Developer",
                                salary: "SGD 7,500/mo",
                                status: "offer-accepted" as const,
                                formSent: false,
                                dataReceived: false,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "display-2",
                                name: "Sofia Rodriguez",
                                country: "Mexico",
                                countryFlag: "🇲🇽",
                                role: "Marketing Manager",
                                salary: "MXN 45,000/mo",
                                status: "data-pending" as const,
                                formSent: true,
                                dataReceived: false,
                                employmentType: "employee" as const,
                              },
                              {
                                id: "display-3",
                                name: "Elena Popescu",
                                country: "Romania",
                                countryFlag: "🇷🇴",
                                role: "Backend Developer",
                                salary: "RON 18,000/mo",
                                status: "drafting" as const,
                                formSent: false,
                                dataReceived: true,
                                employmentType: "contractor" as const,
                              },
                              // Certified and payroll candidates
                              {
                                id: "cert-0",
                                name: "David Martinez",
                                country: "Portugal",
                                countryFlag: "🇵🇹",
                                role: "Technical Writer",
                                salary: "€4,200/mo",
                                status: "CERTIFIED" as const,
                                employmentType: "contractor" as const,
                              },
                              {
                                id: "cert-1",
                                name: "Emma Wilson",
                                country: "United Kingdom",
                                countryFlag: "🇬🇧",
                                role: "Senior Backend Developer",
                                salary: "£6,500/mo",
                                status: "PAYROLL_PENDING" as const,
                                employmentType: "employee" as const,
                                payrollMonth: "current" as const,
                              },
                              {
                                id: "cert-2",
                                name: "Luis Hernandez",
                                country: "Spain",
                                countryFlag: "🇪🇸",
                                role: "Product Manager",
                                salary: "€5,200/mo",
                                status: "IN_BATCH" as const,
                                employmentType: "contractor" as const,
                                payrollMonth: "current" as const,
                              },
                              {
                                id: "cert-3",
                                name: "Yuki Tanaka",
                                country: "Japan",
                                countryFlag: "🇯🇵",
                                role: "UI/UX Designer",
                                salary: "¥650,000/mo",
                                status: "EXECUTING" as const,
                                employmentType: "contractor" as const,
                                payrollMonth: "current" as const,
                              },
                              {
                                id: "cert-4",
                                name: "Sophie Dubois",
                                country: "France",
                                countryFlag: "🇫🇷",
                                role: "Data Scientist",
                                salary: "€5,800/mo",
                                status: "PAID" as const,
                                employmentType: "employee" as const,
                                payrollMonth: "last" as const,
                              },
                              {
                                id: "cert-5",
                                name: "Ahmed Hassan",
                                country: "Egypt",
                                countryFlag: "🇪🇬",
                                role: "Mobile Developer",
                                salary: "EGP 45,000/mo",
                                status: "ON_HOLD" as const,
                                employmentType: "contractor" as const,
                                payrollMonth: "current" as const,
                              },
                              {
                                id: "cert-6",
                                name: "Anna Kowalski",
                                country: "Poland",
                                countryFlag: "🇵🇱",
                                role: "QA Engineer",
                                salary: "PLN 15,000/mo",
                                status: "PAYROLL_PENDING" as const,
                                employmentType: "employee" as const,
                                payrollMonth: "current" as const,
                              },
                              {
                                id: "cert-7",
                                name: "Marcus Silva",
                                country: "Brazil",
                                countryFlag: "🇧🇷",
                                role: "Full Stack Developer",
                                salary: "R$ 18,000/mo",
                                status: "PAYROLL_PENDING" as const,
                                employmentType: "contractor" as const,
                                payrollMonth: "current" as const,
                              },
                              {
                                id: "cert-8",
                                name: "Priya Sharma",
                                country: "India",
                                countryFlag: "🇮🇳",
                                role: "DevOps Engineer",
                                salary: "₹2,50,000/mo",
                                status: "PAYROLL_PENDING" as const,
                                employmentType: "employee" as const,
                                payrollMonth: "next" as const,
                              },
                              {
                                id: "cert-9",
                                name: "Lars Anderson",
                                country: "Sweden",
                                countryFlag: "🇸🇪",
                                role: "Security Engineer",
                                salary: "SEK 58,000/mo",
                                status: "PAID" as const,
                                employmentType: "contractor" as const,
                                payrollMonth: "last" as const,
                              },
                              {
                                id: "cert-10",
                                name: "Isabella Costa",
                                country: "Portugal",
                                countryFlag: "🇵🇹",
                                role: "Content Strategist",
                                salary: "€3,200/mo",
                                status: "PAYROLL_PENDING" as const,
                                employmentType: "employee" as const,
                                payrollMonth: "current" as const,
                              },
                            ]}
                            onDraftContract={(ids) => {
                              console.log("Draft contracts for:", ids);
                            }}
                            onSignatureComplete={() => {
                              console.log("Signatures complete");
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Payroll Batch Workflow */
                      <div className="space-y-6">
                        {/* Payroll Overview Section */}
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-6">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground mb-1">Payroll Overview</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Summary of current payroll cycle and key metrics
                                  </p>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-xs font-medium text-primary">Monthly Runs Only</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs">
                                      <p className="text-xs">
                                        Payroll runs are scheduled monthly — next run available on the 15th or prior weekday.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                {/* Total Salary Cost */}
                                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <p className="text-xs text-muted-foreground">Total Salary Cost</p>
                                  </div>
                                  <p className="text-2xl font-semibold text-foreground">$124,850</p>
                                  <p className="text-xs text-muted-foreground mt-1">This Month</p>
                                </div>

                                {/* Fronted Fees */}
                                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <p className="text-xs text-muted-foreground">Fronted Fees (Est.)</p>
                                  </div>
                                  <p className="text-2xl font-semibold text-foreground">$3,742</p>
                                  <p className="text-xs text-muted-foreground mt-1">Transaction + Service</p>
                                </div>

                                {/* Total Payroll Cost */}
                                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <p className="text-xs text-muted-foreground">Total Payroll Cost</p>
                                  </div>
                                  <p className="text-2xl font-semibold text-foreground">$128,592</p>
                                  <p className="text-xs text-muted-foreground mt-1">Salary + Fees</p>
                                </div>

                                {/* Next Payroll Run */}
                                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <p className="text-xs text-muted-foreground">Next Payroll Run</p>
                                  </div>
                                  <p className="text-2xl font-semibold text-foreground">Nov 15</p>
                                  <p className="text-xs text-muted-foreground mt-1">2025 (or prior weekday)</p>
                                </div>
                              </div>

                              {/* Previous Batch Summary */}
                              <div className="p-4 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20">
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                                  <p className="text-sm font-medium text-foreground">Previous Batch Summary</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Employees Paid</p>
                                    <p className="text-lg font-semibold text-foreground">8</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Amount Processed</p>
                                    <p className="text-lg font-semibold text-foreground">$118,240</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Skipped/Snoozed</p>
                                    <p className="text-lg font-semibold text-foreground">0</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Existing Batch Workflow */}
                        <div className="space-y-4">
                          {/* Horizontal Steps - Clean sticky */}
                          <div className="sticky top-16 z-30 py-4">
                            <div className="flex items-center gap-3 overflow-x-auto">
                              {steps.map((step, index) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = getCurrentStepIndex() > index;
                                const Icon = step.icon;
                                return (
                                  <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(step.id as PayrollStep)}
                                    className={cn(
                                      "group inline-flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all",
                                      isActive && "bg-primary/10 border-primary/20",
                                      isCompleted && "bg-accent-green-fill/10 border-accent-green-outline/20",
                                      !isActive && !isCompleted && "bg-muted/20 border-border/50 hover:bg-muted/30"
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
                                );
                              })}
                            </div>
                          </div>

                          {/* Right: Step Content */}
                        <motion.div
                          key={currentStep}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex-1 min-w-0"
                        >
                          <div>
                            {renderStepContent()}
                          </div>

                          {/* Navigation */}
                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                            <Button
                              variant="outline"
                              disabled={getCurrentStepIndex() === 0}
                              onClick={() => {
                                const prevIndex = getCurrentStepIndex() - 1;
                                if (prevIndex >= 0) {
                                  setCurrentStep(steps[prevIndex].id as PayrollStep);
                                }
                              }}
                            >
                              Previous Step
                            </Button>
                            <Button
                              disabled={getCurrentStepIndex() === steps.length - 1}
                              onClick={() => {
                                const nextIndex = getCurrentStepIndex() + 1;
                                if (nextIndex < steps.length) {
                                  setCurrentStep(steps[nextIndex].id as PayrollStep);
                                }
                              }}
                            >
                              Next Step
                            </Button>
                          </div>
                        </motion.div>
                        </div>
                        </div>
                      )}
                    </div>

                    {/* Fix Exception Drawer */}
                    <Sheet open={fixDrawerOpen} onOpenChange={setFixDrawerOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle className="text-lg font-semibold">
                              Fix Exception: {selectedException?.contractorName}
                            </SheetTitle>
                          </SheetHeader>

                          {selectedException && (
                            <div className="mt-6 space-y-6">
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

                              {selectedException.type === "missing-bank" && (
                                <div className="space-y-4">
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
                                </div>
                              )}

                              {selectedException.type === "holiday-rails" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Holiday Adjustment</Label>
                                    <div className="p-3 rounded-lg bg-muted/30">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground">Base Pay</span>
                                        <span className="text-sm font-medium">$4,650</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Holiday Bonus</span>
                                        <span className="text-sm font-medium text-accent-green-text">+$850</span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Approve the holiday adjustment to include in this batch.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <SheetFooter className="mt-6 flex-row gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setFixDrawerOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={handleResolveException}
                              disabled={selectedException?.type === "missing-bank" && !bankAccountType}
                            >
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
                          {selectedReceipt && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                                <div>
                                  <p className="text-lg font-semibold text-foreground">{selectedReceipt.payeeName}</p>
                                  <p className="text-sm text-muted-foreground">Reference: {selectedReceipt.providerRef}</p>
                                </div>
                                <Badge
                                  variant={selectedReceipt.status === "Paid" ? "default" : "outline"}
                                  className={
                                    selectedReceipt.status === "Paid"
                                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                                      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                  }
                                >
                                  {selectedReceipt.status}
                                </Badge>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold text-foreground">Payment Details</h4>
                                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                    <p className="font-semibold text-foreground">
                                      {selectedReceipt.amount.toLocaleString()} {selectedReceipt.ccy}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Rail</p>
                                    <p className="font-semibold text-foreground">{selectedReceipt.rail}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">FX Rate</p>
                                    <p className="font-semibold text-foreground">{selectedReceipt.fxRate}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Processing Fee</p>
                                    <p className="font-semibold text-foreground">
                                      {selectedReceipt.processingFee?.toLocaleString()} {selectedReceipt.ccy}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
                          {selectedLeaveContractor && leaveRecords[selectedLeaveContractor.id] && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                                <div>
                                  <p className="text-lg font-semibold text-foreground">{selectedLeaveContractor.name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedLeaveContractor.country}</p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-500/10 text-amber-600 border-amber-500/30"
                                >
                                  {leaveRecords[selectedLeaveContractor.id].leaveDays} Days Leave
                                </Badge>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold text-foreground">Leave Information</h4>
                                <div className="space-y-3 p-4 rounded-lg bg-muted/20">
                                  {leaveRecords[selectedLeaveContractor.id].leaveDate && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Leave Date(s)</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {leaveRecords[selectedLeaveContractor.id].leaveDate}
                                      </p>
                                    </div>
                                  )}
                                  {leaveRecords[selectedLeaveContractor.id].leaveReason && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Reason</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {leaveRecords[selectedLeaveContractor.id].leaveReason}
                                      </p>
                                    </div>
                                  )}
                                  {leaveRecords[selectedLeaveContractor.id].approvedBy && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Approved By</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {leaveRecords[selectedLeaveContractor.id].approvedBy}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold text-foreground">Payment Calculation</h4>
                                <div className="space-y-2 p-4 rounded-lg bg-muted/20">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Base Salary</span>
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
                                      -{selectedLeaveContractor.currency} {Math.round(selectedLeaveContractor.baseSalary - getPaymentDue(selectedLeaveContractor)).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Info className="h-4 w-4 text-blue-600" />
                                <p className="text-xs text-blue-600">
                                  Formula: Base Salary ÷ 21.67 × Pay Days
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Contractor Detail Drawer */}
                      <Sheet open={contractorDrawerOpen} onOpenChange={setContractorDrawerOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                          {selectedContractor && (
                            <>
                              <SheetHeader>
                                <SheetTitle className="text-xl">
                                  {selectedContractor.name}
                                </SheetTitle>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      selectedContractor.employmentType === "employee" 
                                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                                        : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                                    )}
                                  >
                                    {selectedContractor.employmentType === "employee" ? "Employee" : "Contractor"}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">•</span>
                                  <span className="text-sm text-muted-foreground">{selectedContractor.country}</span>
                                </div>
                              </SheetHeader>

                              <div className="space-y-6 mt-6">
                                {/* Payment Breakdown */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Payment Breakdown
                                  </h4>
                                  <Card className="border-border/20 bg-card/30">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Base Salary</span>
                                        <span className="text-sm font-semibold">
                                          {selectedContractor.currency} {selectedContractor.baseSalary.toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      {selectedContractor.employmentType === "employee" && selectedContractor.employerTaxes && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Benefits (included)</span>
                                          <span className="text-sm font-medium text-blue-600">
                                            +{selectedContractor.currency} {selectedContractor.employerTaxes.toLocaleString()}
                                          </span>
                                        </div>
                                      )}

                                      {leaveRecords[selectedContractor.id]?.leaveDays > 0 && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">Leave Deduction</span>
                                          <span className="text-sm font-medium text-amber-600">
                                            -{selectedContractor.currency} {Math.round(selectedContractor.baseSalary - getPaymentDue(selectedContractor)).toLocaleString()}
                                          </span>
                                        </div>
                                      )}

                                      <Separator />

                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Net Pay</span>
                                        <span className="text-lg font-bold text-foreground">
                                          {selectedContractor.currency} {Math.round(getPaymentDue(selectedContractor)).toLocaleString()}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-sm">Est. Fees</span>
                                        <span className="text-sm">
                                          +{selectedContractor.currency} {selectedContractor.estFees}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-sm">Additional Fees</span>
                                        <span className="text-sm">
                                          +{selectedContractor.currency} {additionalFees[selectedContractor.id]?.accepted ? (additionalFees[selectedContractor.id]?.amount || 50) : 0}
                                        </span>
                                      </div>

                                      <Separator />

                                      <div className="flex items-center justify-between">
                                        <span className="text-base font-bold text-foreground">Total Payable</span>
                                        <span className="text-xl font-bold text-primary">
                                          {selectedContractor.currency} {Math.round(
                                            getPaymentDue(selectedContractor) + 
                                            selectedContractor.estFees + 
                                            (additionalFees[selectedContractor.id]?.accepted ? (additionalFees[selectedContractor.id]?.amount || 50) : 0)
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* FX Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    FX Details
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

                                {/* One-time Adjustment */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-foreground">Adjustments</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor="adjustment" className="text-sm font-medium mb-2 block">
                                        One-time Adjustment
                                      </Label>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{selectedContractor.currency}</span>
                                        <input
                                          id="adjustment"
                                          type="number"
                                          value={oneTimeAdjustment}
                                          onChange={(e) => setOneTimeAdjustment(parseFloat(e.target.value) || 0)}
                                          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                                          placeholder="0"
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Enter positive for bonus, negative for deduction
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {oneTimeAdjustment !== 0 && (
                                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-blue-600">
                                        Adjusted Total Payable
                                      </span>
                                      <span className="text-lg font-bold text-blue-600">
                                        {selectedContractor.currency} {Math.round(
                                          getPaymentDue(selectedContractor) + 
                                          selectedContractor.estFees + 
                                          (additionalFees[selectedContractor.id]?.accepted ? (additionalFees[selectedContractor.id]?.amount || 50) : 0) +
                                          oneTimeAdjustment
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <SheetFooter className="mt-6">
                                <Button
                                  variant="outline"
                                  onClick={() => setContractorDrawerOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSaveContractorAdjustment}
                                  disabled={oneTimeAdjustment === 0}
                                >
                                  Save & Recalculate
                                </Button>
                              </SheetFooter>
                            </>
                          )}
                        </SheetContent>
                      </Sheet>
                  </div>
                </motion.div>
              </div>
            </div>
            <FloatingKurtButton />
          </AgentLayout>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default PayrollBatch;
