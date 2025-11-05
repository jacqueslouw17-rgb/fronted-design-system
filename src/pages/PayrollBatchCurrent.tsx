import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, CheckSquare, Play, TrendingUp, ArrowLeft, Lock, RefreshCw, Info, Clock, X, AlertCircle, Download, FileText, Building2, Receipt, Activity, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { useAgentState } from "@/hooks/useAgentState";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays } from "date-fns";

type PayrollStep = "review-fx" | "exceptions" | "approvals" | "execute" | "track";

const steps = [
  { id: "review-fx", label: "Review FX", icon: DollarSign },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
  { id: "approvals", label: "Approvals", icon: CheckSquare },
  { id: "execute", label: "Execute", icon: Play },
  { id: "track", label: "Track & Reconcile", icon: TrendingUp },
] as const;

interface ContractorPayment {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  netPay: number;
  currency: string;
  estFees: number;
  fxRate: number;
  recvLocal: number;
  eta: string;
  employmentType: "employee" | "contractor";
  employerTaxes?: number; // Only for employees
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
  {
    id: "exc-3",
    contractorId: "6",
    contractorName: "Maria Santos",
    type: "doc-expiry",
    description: "Work permit expires Nov 15, 2024 (within 30 days)",
    severity: "medium",
    resolved: false,
    snoozed: false,
  },
  {
    id: "exc-4",
    contractorId: "2",
    contractorName: "Sophie Laurent",
    type: "over-threshold",
    description: "Payment amount €5,800 exceeds auto-approval threshold (€5,000)",
    severity: "low",
    resolved: false,
    snoozed: false,
  },
];

const contractorsByCurrency: Record<string, ContractorPayment[]> = {
  EUR: [
    { id: "1", name: "David Martinez", country: "Portugal", countryCode: "PT", netPay: 4200, currency: "EUR", estFees: 25, fxRate: 0.92, recvLocal: 4200, eta: "Oct 30", employmentType: "contractor" },
    { id: "2", name: "Sophie Laurent", country: "France", countryCode: "FR", netPay: 5800, currency: "EUR", estFees: 35, fxRate: 0.92, recvLocal: 5800, eta: "Oct 30", employmentType: "employee", employerTaxes: 1740 },
    { id: "3", name: "Marco Rossi", country: "Italy", countryCode: "IT", netPay: 4500, currency: "EUR", estFees: 28, fxRate: 0.92, recvLocal: 4500, eta: "Oct 30", employmentType: "contractor" },
  ],
  NOK: [
    { id: "4", name: "Alex Hansen", country: "Norway", countryCode: "NO", netPay: 65000, currency: "NOK", estFees: 250, fxRate: 10.45, recvLocal: 65000, eta: "Oct 31", employmentType: "employee", employerTaxes: 9750 },
    { id: "5", name: "Emma Wilson", country: "Norway", countryCode: "NO", netPay: 72000, currency: "NOK", estFees: 280, fxRate: 10.45, recvLocal: 72000, eta: "Oct 31", employmentType: "contractor" },
  ],
  PHP: [
    { id: "6", name: "Maria Santos", country: "Philippines", countryCode: "PH", netPay: 280000, currency: "PHP", estFees: 850, fxRate: 56.2, recvLocal: 280000, eta: "Oct 30", employmentType: "employee", employerTaxes: 42000 },
    { id: "7", name: "Jose Reyes", country: "Philippines", countryCode: "PH", netPay: 245000, currency: "PHP", estFees: 750, fxRate: 56.2, recvLocal: 245000, eta: "Oct 30", employmentType: "contractor" },
    { id: "8", name: "Luis Hernandez", country: "Philippines", countryCode: "PH", netPay: 260000, currency: "PHP", estFees: 800, fxRate: 56.2, recvLocal: 260000, eta: "Oct 30", employmentType: "contractor" },
  ],
};

export default function PayrollBatchCurrent() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialStep = searchParams.get('step') as PayrollStep | null;
  
  // Get selected payee from navigation state
  const selectedPayeeFromState = location.state?.selectedPayee;
  const [currentStep, setCurrentStep] = useState<PayrollStep>(initialStep || "review-fx");
  const [frequency, setFrequency] = useState("monthly");
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const { setOpen, addMessage, isSpeaking: isAgentSpeaking } = useAgentState();
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
  const [userRole] = useState<"admin" | "user">("admin"); // In real app, get from auth/Supabase
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<Record<string, "pending" | "processing" | "complete">>({});
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(
    selectedPayeeFromState ? selectedPayeeFromState.id : null
  );

  // Remove the highlight after 3 seconds
  React.useEffect(() => {
    if (newlyAddedId) {
      // Show success toast
      toast.success("Payee added to batch successfully!", {
        description: `${selectedPayeeFromState?.name} has been added to the current batch.`,
      });
      
      const timer = setTimeout(() => {
        setNewlyAddedId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId, selectedPayeeFromState]);

  // If a payee was selected from pipeline, use that; otherwise use mock data
  const allContractors = selectedPayeeFromState 
    ? [{
        id: selectedPayeeFromState.id,
        name: selectedPayeeFromState.name,
        country: selectedPayeeFromState.country,
        countryCode: selectedPayeeFromState.country.slice(0, 2).toUpperCase(),
        netPay: parseFloat(selectedPayeeFromState.salary?.replace(/[^0-9.]/g, '') || '5000'),
        currency: "USD",
        estFees: 50,
        fxRate: 1.0,
        recvLocal: parseFloat(selectedPayeeFromState.salary?.replace(/[^0-9.]/g, '') || '5000'),
        eta: "Oct 30",
        employmentType: selectedPayeeFromState.employmentType || "contractor",
        employerTaxes: selectedPayeeFromState.employmentType === "employee" ? parseFloat(selectedPayeeFromState.salary?.replace(/[^0-9.]/g, '') || '5000') * 0.15 : undefined,
      }]
    : [
        ...contractorsByCurrency.EUR,
        ...contractorsByCurrency.NOK,
        ...contractorsByCurrency.PHP,
      ];

  // Group contractors by currency dynamically
  const groupedByCurrency = allContractors.reduce((acc, contractor) => {
    if (!acc[contractor.currency]) {
      acc[contractor.currency] = [];
    }
    acc[contractor.currency].push(contractor);
    return acc;
  }, {} as Record<string, ContractorPayment[]>);

  // Track & Reconcile step state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedPayeeForReschedule, setSelectedPayeeForReschedule] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [rescheduleReason, setRescheduleReason] = useState<string>("bank-delay");
  const [notifyContractor, setNotifyContractor] = useState(true);
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

  const handleViewReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    setReceiptModalOpen(true);
  };

  const handleOpenReschedule = (receipt: any) => {
    setSelectedPayeeForReschedule(receipt);
    setRescheduleDate(addDays(new Date(), 1)); // Default to next business day
    setRescheduleReason("bank-delay");
    setNotifyContractor(true);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleDate || !selectedPayeeForReschedule) return;

    // Update the ETA for the selected payee
    setPaymentReceipts(prev => 
      prev.map(receipt => 
        receipt.payeeId === selectedPayeeForReschedule.payeeId
          ? { ...receipt, eta: format(rescheduleDate, "MMM dd, yyyy") }
          : receipt
      )
    );

    // Close modal
    setRescheduleModalOpen(false);

    // Show notification
    const reasonText = rescheduleReason === "holiday" ? "holiday" : "bank delay";
    const notifyText = notifyContractor 
      ? ` ${selectedPayeeForReschedule.payeeName} has been notified.`
      : "";
    
    toast.success(`Payout rescheduled to ${format(rescheduleDate, "MMM dd, yyyy")} due to ${reasonText}.${notifyText}`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Payee", "Amount", "Currency", "Status", "Rail", "Reference", "Paid At", "FX Rate", "FX Fee", "Processing Fee"],
      ...paymentReceipts.map(r => [
        r.payeeName,
        r.amount,
        r.ccy,
        r.status,
        r.rail,
        r.providerRef,
        r.paidAt || "Pending",
        r.fxRate,
        r.fxFee,
        r.processingFee
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-batch-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const handleDownloadAuditPDF = () => {
    toast.info("Audit PDF generation would be implemented with a PDF library");
  };

  const handleSyncToAccounting = (system: string) => {
    toast.info(`Sync to ${system} would be implemented with accounting integration`);
  };

  const handleKurtAction = (action: string) => {
    setOpen(true);
    
    switch (action) {
      case "fx-summary":
        addMessage({
          role: "kurt",
          text: `💱 **FX Summary for October Payroll**\n\nCurrent rates locked in:\n• USD → EUR: 0.92 (+0.3% vs last month)\n• USD → NOK: 10.45 (-0.8%)\n• USD → PHP: 56.2 (+1.2%)\n\n**Total FX Variance:** +2.3% favorable\n**Estimated Savings:** $15,240\n\nRates will be locked for 24 hours once batch is confirmed.`,
          actionButtons: [
            { label: "Lock Rates", action: "lock-fx-rates", variant: "default" },
            { label: "View Details", action: "fx-details", variant: "outline" }
          ]
        });
        break;
      case "check-exceptions":
        addMessage({
          role: "kurt",
          text: `⚠️ **Exception Check Complete**\n\nFound 2 items requiring attention:\n\n1. **Emma Wilson**: Bank details pending verification\n2. **Luis Hernandez**: Holiday payout adjustment needed\n\nAll other contractors cleared for processing.`,
          actionButtons: [
            { label: "Resolve Exceptions", action: "resolve-exceptions", variant: "default" }
          ]
        });
        break;
      case "approval-status":
        addMessage({
          role: "kurt",
          text: `✅ **Approval Status**\n\n**Finance Approval:** Pending\n**HR Approval:** Approved by Sarah Chen\n**Final Sign-off:** Awaiting your approval\n\nOnce all approvals complete, batch will be ready to execute.`,
          actionButtons: [
            { label: "Request Approval", action: "request-approval", variant: "default" }
          ]
        });
        break;
      default:
        addMessage({ role: "kurt", text: `Processing: ${action}` });
    }
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

  const activeExceptions = exceptions.filter(exc => !exc.resolved && !exc.snoozed);
  const allExceptionsResolved = activeExceptions.length === 0;

  const handleRequestApproval = () => {
    setIsRequestingApproval(true);
    
    // Simulate sending request
    setTimeout(() => {
      setApprovalStatus("requested");
      setApprovalTimeline(prev => prev.map((item, idx) => 
        idx === 0 ? { ...item, timestamp: new Date() } : item
      ));
      setIsRequestingApproval(false);
      toast.success("Approval request sent to Howard (CFO)");
      
      // Simulate CFO viewing after 3 seconds
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
    
    // Auto-advance to Execute step after approval
    setTimeout(() => {
      setCurrentStep("execute");
    }, 1500);
  };

  const handleExecutePayroll = async () => {
    setIsExecuting(true);
    
    // Initialize all as pending
    const initialProgress: Record<string, "pending" | "processing" | "complete"> = {};
    allContractors.forEach(c => {
      initialProgress[c.id] = "pending";
    });
    setExecutionProgress(initialProgress);

    // Process each contractor sequentially with animation
    for (const contractor of allContractors) {
      // Mark as processing
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "processing" }));
      
      // Simulate processing time (800ms - 1.5s per contractor)
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      
      // Mark as complete
      setExecutionProgress(prev => ({ ...prev, [contractor.id]: "complete" }));
    }

    // All done
    setIsExecuting(false);
    toast.success("Payroll batch executed successfully!");
    
    // Auto-advance to Track & Reconcile step
    setTimeout(() => {
      setCurrentStep("track");
    }, 1500);
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "review-fx":
        // Check if no payees selected
        if (allContractors.length === 0) {
          return (
            <div className="space-y-6">
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Payees Selected</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      Select people in 'Payroll Ready' to start a batch.
                    </p>
                    <Button onClick={() => navigate('/flows/contract-flow')} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go to Pipeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
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
                <Button
                  size="sm"
                  onClick={handleLockRates}
                  disabled={fxRatesLocked}
                  className="gap-2"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Lock Rate (15 min)
                </Button>
              </div>
            </div>

            {/* Currency Tables - Render dynamically based on grouped contractors */}
            {Object.entries(groupedByCurrency).map(([currency, contractors]) => {
              const currencySymbols: Record<string, string> = {
                EUR: "€",
                NOK: "kr",
                PHP: "₱",
                USD: "$",
              };
              const symbol = currencySymbols[currency] || currency;
              
              return (
                <Card key={currency} className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs">Country</TableHead>
                          <TableHead className="text-xs text-right">Net Pay ({currency})</TableHead>
                          <TableHead className="text-xs text-right">Est. Fees</TableHead>
                          <TableHead className="text-xs text-right">FX Rate</TableHead>
                          <TableHead className="text-xs text-right">Recv (Local)</TableHead>
                          <TableHead className="text-xs">ETA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractors.map((contractor) => {
                          const isNewlyAdded = newlyAddedId === contractor.id;
                          return (
                            <TableRow 
                              key={contractor.id}
                              className={cn(
                                isNewlyAdded && "animate-fade-in relative"
                              )}
                            >
                              <TableCell className="font-medium text-sm">
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
                              <TableCell className="text-sm">{contractor.country}</TableCell>
                              <TableCell className="text-right text-sm">{symbol}{contractor.netPay.toLocaleString()}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{symbol}{contractor.estFees}</TableCell>
                              <TableCell className="text-right text-sm font-mono">{contractor.fxRate}</TableCell>
                              <TableCell className="text-right text-sm font-medium">{symbol}{contractor.recvLocal.toLocaleString()}</TableCell>
                              <TableCell className="text-sm">{contractor.eta}</TableCell>
                              {isNewlyAdded && (
                                <div className="absolute inset-0 border-2 border-primary/50 rounded-md pointer-events-none animate-pulse" />
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
                    <p className="text-xs text-muted-foreground mb-1">Total Net Pay</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${(allContractors.reduce((sum, c) => sum + c.netPay, 0) / 1000).toFixed(1)}K
                    </p>
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
            <div className="pt-4 border-t border-border">
              <Button 
                className="w-full h-11 text-sm font-medium"
                onClick={() => setCurrentStep("exceptions")}
              >
                Continue to Exceptions
              </Button>
            </div>
          </div>
        );

      case "exceptions":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Exception Review</h3>

            {/* Empty state when no exceptions at all */}
            {exceptions.length === 0 && (
              <Card className="border-accent-green-outline/30 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-green-fill/30 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-accent-green-text" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">All Clear</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No exceptions found. You can proceed to approvals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Green banner when all resolved */}
            {exceptions.length > 0 && allExceptionsResolved && (
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

              {/* Resolved exceptions */}
              {exceptions.filter(exc => exc.resolved).length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Resolved</p>
                  <div className="space-y-2">
                    {exceptions.filter(exc => exc.resolved).map((exception) => (
                      <div
                        key={exception.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20"
                      >
                        <CheckCircle2 className="h-4 w-4 text-accent-green-text flex-shrink-0" />
                        <span className="text-xs text-foreground">{exception.contractorName}</span>
                        <span className="text-xs text-muted-foreground">• {exception.type.split('-').join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Snoozed exceptions */}
              {exceptions.filter(exc => exc.snoozed).length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Snoozed to Next Cycle</p>
                  <div className="space-y-2">
                    {exceptions.filter(exc => exc.snoozed).map((exception) => (
                      <div
                        key={exception.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground">{exception.contractorName}</span>
                        <span className="text-xs text-muted-foreground">• {exception.type.split('-').join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="pt-4 border-t border-border">
              <Button
                className="w-full h-11 text-sm font-medium"
                disabled={!allExceptionsResolved}
                onClick={() => setCurrentStep("approvals")}
              >
                {allExceptionsResolved ? "Send for Approval" : `Resolve ${activeExceptions.length} Exception${activeExceptions.length !== 1 ? 's' : ''} to Continue`}
              </Button>
            </div>
          </div>
        );

      case "approvals":
        // Calculate separate totals for employees vs contractors
        const employees = allContractors.filter(c => c.employmentType === "employee");
        const contractors = allContractors.filter(c => c.employmentType === "contractor");
        
        const employeesTotalNetPay = employees.reduce((sum, e) => sum + e.netPay, 0);
        const employeesTotalEmployerTaxes = employees.reduce((sum, e) => sum + (e.employerTaxes || 0), 0);
        const employeesTotalCost = employeesTotalNetPay + employeesTotalEmployerTaxes;
        
        const contractorsTotalNetPay = contractors.reduce((sum, c) => sum + c.netPay, 0);
        
        const requiresCFOApproval = employeesTotalCost > 50000; // $50K threshold
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Financial Approval</h3>

            {/* Approval Card for CFO */}
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

                {/* Financial Summary */}
                <div className="space-y-4">
                  {/* Employee vs Contractor Breakdown */}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Total Amount</p>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">EUR</span>
                          <span className="text-sm font-semibold">€14,500</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">NOK</span>
                          <span className="text-sm font-semibold">kr137,000</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">PHP</span>
                          <span className="text-sm font-semibold">₱785,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">FX Variance</p>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">vs Last Month</span>
                          <span className="text-sm font-semibold text-accent-green-text">+2.3%</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Est. Savings</span>
                          <span className="text-sm font-semibold text-accent-green-text">$15.2K</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Payees</p>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground mt-1">{employees.length} employees, {contractors.length} contractors</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">SLA Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                        <span className="text-sm font-medium text-foreground">On Track</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">2 days until deadline</p>
                    </div>
                  </div>
                </div>

                {/* Employee Tax Approval Note */}
                {requiresCFOApproval && (
                  <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground mb-1">Employee Approval Required</p>
                        <p className="text-xs text-muted-foreground">
                          Employee payments with employer taxes total ${(employeesTotalCost / 1000).toFixed(1)}K, which exceeds the auto-approval threshold of $50K. CFO approval is required. Contractor payments do not require approval.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Flags */}
                <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">SLA Risk Assessment</p>
                      <p className="text-xs text-muted-foreground">
                        Payment processing by Oct 30 required to meet contractor payment dates. No critical blockers identified.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval Timeline */}
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

                {/* Action Buttons */}
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

            {/* Info Note */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">Approval Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Requesting approval will send an email and Slack message to Howard with a secure deep-link to review and approve this batch.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer CTA */}
            {approvalStatus !== "approved" && (
              <div className="pt-4 border-t border-border">
                <Button
                  className="w-full h-11 text-sm font-medium"
                  disabled
                >
                  Waiting for Approval
                </Button>
              </div>
            )}
          </div>
        );

      case "execute":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Execute Payroll</h3>

            {/* Execution Summary Panel */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Batch Summary</h3>
                  
                  <div className="space-y-3">
                    {/* Summary by Provider/Rail */}
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

                    {/* Auto-retry Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            id="auto-retry"
                            checked={autoRetryEnabled}
                            onChange={(e) => setAutoRetryEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label htmlFor="auto-retry" className="text-sm font-medium text-foreground cursor-pointer">
                            Auto-retry on soft failure
                          </label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Automatically retry payments that fail due to temporary issues (network, rate limits)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pre-execution Checklist */}
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

                {/* Live Progress List */}
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

                {/* Execute CTA */}
                {!isExecuting && Object.keys(executionProgress).length === 0 && (
                  <Button 
                    className="w-full h-11 text-sm font-medium bg-primary hover:bg-primary/90"
                    onClick={handleExecutePayroll}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Payroll Now
                  </Button>
                )}

                {/* Execution Complete */}
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

            {/* Info Note */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">Execution Process</p>
                    <p className="text-xs text-muted-foreground">
                      Payments will be initiated immediately and processed according to each payment rail's standard timing (SEPA: 1-2 days, Local: same day, SWIFT: 2-5 days).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "track":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Track & Reconcile</h2>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Live Tracking
              </Badge>
            </div>

            {/* Three Widget Layout */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Transaction Monitor */}
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
                          onClick={() => handleOpenReschedule(receipt)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
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

              {/* FX Snapshot */}
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
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">NOK/USD</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Locked
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">10.4500</p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Spread:</span>
                        <span>0.80%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span>kr 520.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">PHP/USD</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Locked
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">56.2000</p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Spread:</span>
                        <span>1.20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span>₱3,360.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reconciliation */}
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
                  <Button
                    onClick={() => navigate('/audit-trail')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Audit Log
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
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/flows/contract-flow')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Genie Header */}
        <AgentHeader
          title="October Payroll"
          subtitle="Review FX, exceptions, approvals — then execute."
          showPulse={true}
          isActive={isAgentSpeaking}
          isMuted={isKurtMuted}
          onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
          placeholder="Try: 'FX summary' or 'Check exceptions'..."
          tags={
            <div className="flex items-center gap-3">
              <AgentSuggestionChips
                chips={[
                  {
                    label: "FX Summary",
                    variant: "primary",
                    onAction: () => handleKurtAction("fx-summary"),
                  },
                  {
                    label: "Check Exceptions",
                    variant: "default",
                    onAction: () => handleKurtAction("check-exceptions"),
                  },
                  {
                    label: "Approval Status",
                    variant: "default",
                    onAction: () => handleKurtAction("approval-status"),
                  },
                ]}
              />
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="w-32 h-8 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {/* Main Content: Stepper + Content */}
        <div className="flex gap-6">
          {/* Left: Stepper */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-80 flex-shrink-0"
          >
            <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">Batch Steps</h3>
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = getCurrentStepIndex() > index;
                  const Icon = step.icon;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id as PayrollStep)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                        isActive && "bg-primary/10 border border-primary/20",
                        !isActive && !isCompleted && "hover:bg-muted/30",
                        isCompleted && "bg-accent-green-fill/10 border border-accent-green-outline/20"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full",
                        isActive && "bg-primary/20",
                        isCompleted && "bg-accent-green-fill/30",
                        !isActive && !isCompleted && "bg-muted/30"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                        ) : (
                          <Icon className={cn(
                            "h-4 w-4",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : isCompleted ? "text-accent-green-text" : "text-foreground"
                        )}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isCompleted ? "Complete" : isActive ? "In Progress" : "Pending"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Right: Step Content */}
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <ScrollArea className="h-[calc(100vh-300px)]">
              {renderStepContent()}
            </ScrollArea>

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
                {/* Exception Details */}
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

                {/* Fix Form - Dynamic based on exception type */}
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

                {selectedException.type === "doc-expiry" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Document Status</Label>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Work Permit</p>
                        <p className="text-sm font-medium">Expires: Nov 15, 2024</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confirm renewal is in progress or snooze until documents are updated.
                    </p>
                  </div>
                )}

                {selectedException.type === "over-threshold" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Approval Required</Label>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Payment Amount</span>
                          <span className="text-sm font-medium">€5,800</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Auto-approval Limit</span>
                          <span className="text-sm font-medium">€5,000</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manual approval required for amounts exceeding threshold.
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
                {/* Header */}
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

                {/* Payment Details */}
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
                      <p className="text-xs text-muted-foreground mb-1">Payment Rail</p>
                      <p className="font-semibold text-foreground">{selectedReceipt.rail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className="font-semibold text-foreground">{selectedReceipt.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">ETA</p>
                      <p className="font-semibold text-foreground">{selectedReceipt.eta}</p>
                    </div>
                    {selectedReceipt.paidAt && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Paid At</p>
                        <p className="font-semibold text-foreground">
                          {new Date(selectedReceipt.paidAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FX Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Foreign Exchange</h4>
                  <div className="p-4 rounded-lg bg-muted/20 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Exchange Rate</span>
                      <span className="font-medium text-foreground">{selectedReceipt.fxRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">FX Spread</span>
                      <span className="font-medium text-foreground">{(selectedReceipt.fxSpread * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">FX Fee</span>
                      <span className="font-medium text-foreground">{selectedReceipt.fxFee.toFixed(2)} {selectedReceipt.ccy}</span>
                    </div>
                  </div>
                </div>

                {/* Fees */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Processing Fees</h4>
                  <div className="p-4 rounded-lg bg-muted/20 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Processing Fee</span>
                      <span className="font-medium text-foreground">{selectedReceipt.processingFee.toFixed(2)} {selectedReceipt.ccy}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total Fees</span>
                      <span className="text-foreground">
                        {(selectedReceipt.fxFee + selectedReceipt.processingFee).toFixed(2)} {selectedReceipt.ccy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceiptModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => toast.info("Download receipt functionality would be implemented here")}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Payout Modal */}
        <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Reschedule Payout
              </DialogTitle>
            </DialogHeader>
            {selectedPayeeForReschedule && (
              <div className="space-y-6">
                {/* Payee Info */}
                <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                  <p className="font-semibold text-foreground">{selectedPayeeForReschedule.payeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayeeForReschedule.amount.toLocaleString()} {selectedPayeeForReschedule.ccy} • {selectedPayeeForReschedule.rail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current ETA: {selectedPayeeForReschedule.eta}
                  </p>
                </div>

                {/* New Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="reschedule-date" className="text-sm font-medium">
                    New Payout Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="reschedule-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !rescheduleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rescheduleDate ? format(rescheduleDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={rescheduleDate}
                        onSelect={setRescheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Reason Select */}
                <div className="space-y-2">
                  <Label htmlFor="reschedule-reason" className="text-sm font-medium">
                    Reason
                  </Label>
                  <Select value={rescheduleReason} onValueChange={setRescheduleReason}>
                    <SelectTrigger id="reschedule-reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="bank-delay">Bank Delay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notify Contractor Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-contractor"
                    checked={notifyContractor}
                    onCheckedChange={(checked) => setNotifyContractor(checked === true)}
                  />
                  <label
                    htmlFor="notify-contractor"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Notify contractor of schedule change
                  </label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRescheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmReschedule} disabled={!rescheduleDate}>
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
