import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Circle, DollarSign, AlertTriangle, CheckSquare, Play, TrendingUp, ArrowLeft, Lock, RefreshCw, Info, Clock, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { useAgentState } from "@/hooks/useAgentState";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    { id: "1", name: "David Martinez", country: "Portugal", countryCode: "PT", netPay: 4200, currency: "EUR", estFees: 25, fxRate: 0.92, recvLocal: 4200, eta: "Oct 30" },
    { id: "2", name: "Sophie Laurent", country: "France", countryCode: "FR", netPay: 5800, currency: "EUR", estFees: 35, fxRate: 0.92, recvLocal: 5800, eta: "Oct 30" },
    { id: "3", name: "Marco Rossi", country: "Italy", countryCode: "IT", netPay: 4500, currency: "EUR", estFees: 28, fxRate: 0.92, recvLocal: 4500, eta: "Oct 30" },
  ],
  NOK: [
    { id: "4", name: "Alex Hansen", country: "Norway", countryCode: "NO", netPay: 65000, currency: "NOK", estFees: 250, fxRate: 10.45, recvLocal: 65000, eta: "Oct 31" },
    { id: "5", name: "Emma Wilson", country: "Norway", countryCode: "NO", netPay: 72000, currency: "NOK", estFees: 280, fxRate: 10.45, recvLocal: 72000, eta: "Oct 31" },
  ],
  PHP: [
    { id: "6", name: "Maria Santos", country: "Philippines", countryCode: "PH", netPay: 280000, currency: "PHP", estFees: 850, fxRate: 56.2, recvLocal: 280000, eta: "Oct 30" },
    { id: "7", name: "Jose Reyes", country: "Philippines", countryCode: "PH", netPay: 245000, currency: "PHP", estFees: 750, fxRate: 56.2, recvLocal: 245000, eta: "Oct 30" },
    { id: "8", name: "Luis Hernandez", country: "Philippines", countryCode: "PH", netPay: 260000, currency: "PHP", estFees: 800, fxRate: 56.2, recvLocal: 260000, eta: "Oct 30" },
  ],
};

export default function PayrollBatchCurrent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review-fx");
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

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "review-fx":
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

            {/* EUR Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">EUR Payments</span>
                    <Badge variant="outline" className="text-xs">3 contractors</Badge>
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
                            Rate: 0.92 USD → EUR
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
                      <TableHead className="text-xs">Country</TableHead>
                      <TableHead className="text-xs text-right">Net Pay (EUR)</TableHead>
                      <TableHead className="text-xs text-right">Est. Fees</TableHead>
                      <TableHead className="text-xs text-right">FX Rate</TableHead>
                      <TableHead className="text-xs text-right">Recv (Local)</TableHead>
                      <TableHead className="text-xs">ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractorsByCurrency.EUR.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell className="font-medium text-sm">{contractor.name}</TableCell>
                        <TableCell className="text-sm">{contractor.country}</TableCell>
                        <TableCell className="text-right text-sm">€{contractor.netPay.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">€{contractor.estFees}</TableCell>
                        <TableCell className="text-right text-sm font-mono">{contractor.fxRate}</TableCell>
                        <TableCell className="text-right text-sm font-medium">€{contractor.recvLocal.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{contractor.eta}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* NOK Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">NOK Payments</span>
                    <Badge variant="outline" className="text-xs">2 contractors</Badge>
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
                            Rate: 10.45 USD → NOK
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
                      <TableHead className="text-xs">Country</TableHead>
                      <TableHead className="text-xs text-right">Net Pay (NOK)</TableHead>
                      <TableHead className="text-xs text-right">Est. Fees</TableHead>
                      <TableHead className="text-xs text-right">FX Rate</TableHead>
                      <TableHead className="text-xs text-right">Recv (Local)</TableHead>
                      <TableHead className="text-xs">ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractorsByCurrency.NOK.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell className="font-medium text-sm">{contractor.name}</TableCell>
                        <TableCell className="text-sm">{contractor.country}</TableCell>
                        <TableCell className="text-right text-sm">kr{contractor.netPay.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">kr{contractor.estFees}</TableCell>
                        <TableCell className="text-right text-sm font-mono">{contractor.fxRate}</TableCell>
                        <TableCell className="text-right text-sm font-medium">kr{contractor.recvLocal.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{contractor.eta}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* PHP Table */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">PHP Payments</span>
                    <Badge variant="outline" className="text-xs">3 contractors</Badge>
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
                            Rate: 56.2 USD → PHP
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
                      <TableHead className="text-xs">Country</TableHead>
                      <TableHead className="text-xs text-right">Net Pay (PHP)</TableHead>
                      <TableHead className="text-xs text-right">Est. Fees</TableHead>
                      <TableHead className="text-xs text-right">FX Rate</TableHead>
                      <TableHead className="text-xs text-right">Recv (Local)</TableHead>
                      <TableHead className="text-xs">ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractorsByCurrency.PHP.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell className="font-medium text-sm">{contractor.name}</TableCell>
                        <TableCell className="text-sm">{contractor.country}</TableCell>
                        <TableCell className="text-right text-sm">₱{contractor.netPay.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">₱{contractor.estFees}</TableCell>
                        <TableCell className="text-right text-sm font-mono">{contractor.fxRate}</TableCell>
                        <TableCell className="text-right text-sm font-medium">₱{contractor.recvLocal.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{contractor.eta}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card className="border-border/40 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Contractors</p>
                    <p className="text-2xl font-bold text-foreground">8</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Net Pay</p>
                    <p className="text-2xl font-bold text-foreground">$747K</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Est. Savings</p>
                    <p className="text-2xl font-bold text-accent-green-text">+$15.2K</p>
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

            {/* Green banner when all resolved */}
            {allExceptionsResolved && (
              <Card className="border-accent-green-outline/30 bg-gradient-to-br from-accent-green-fill/20 to-accent-green-fill/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-green-fill/30">
                      <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">No blocking exceptions</p>
                      <p className="text-xs text-muted-foreground">All issues resolved - ready to proceed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exception List */}
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
        return (
          <div className="space-y-4">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Approval Workflow</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent-green-fill/20 border border-accent-green-outline/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                      <div>
                        <p className="text-sm font-medium text-foreground">HR Approval</p>
                        <p className="text-xs text-muted-foreground">Approved by Sarah Chen</p>
                      </div>
                    </div>
                    <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">
                      Approved
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Finance Approval</p>
                        <p className="text-xs text-muted-foreground">Awaiting John Mitchell</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <Circle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Final Sign-off</p>
                        <p className="text-xs text-muted-foreground">Your approval required</p>
                      </div>
                    </div>
                    <Button size="sm">
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "execute":
        return (
          <div className="space-y-4">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Batch Execution Summary</h3>
                  <Badge className="bg-primary/20 text-primary">Ready to Execute</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Total Contractors</p>
                    <p className="text-2xl font-bold text-foreground">8</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-foreground">$747K</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                    <span className="text-muted-foreground">FX rates locked</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                    <span className="text-muted-foreground">All exceptions resolved</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-accent-green-text" />
                    <span className="text-muted-foreground">Approvals complete</span>
                  </div>
                </div>

                <Button className="w-full h-10 bg-primary hover:bg-primary/90 font-semibold">
                  <Play className="h-4 w-4 mr-2" />
                  Execute Payroll Batch
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Funds will be transferred within 2-3 business days
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "track":
        return (
          <div className="space-y-4">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Batch Tracking</h3>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-accent-green-fill/20 border border-accent-green-outline/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Initiated</span>
                      <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                    </div>
                    <p className="text-xs text-muted-foreground">Oct 28, 2024 at 2:30 PM</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Processing</span>
                      <Circle className="h-4 w-4 text-muted-foreground animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground">Expected completion: Oct 30, 2024</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/10 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Completed</span>
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Reconciliation</h3>
                <p className="text-xs text-muted-foreground">
                  Once batch completes, reconciliation report will be available for download.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Download Report
                </Button>
              </CardContent>
            </Card>
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
          Back to Pipeline
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
      </div>
    </div>
  );
}
