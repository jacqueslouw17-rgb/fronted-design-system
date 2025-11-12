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
import { CheckCircle2, DollarSign, AlertTriangle, CheckSquare, Play, TrendingUp, RefreshCw, Lock, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  employerTaxes?: number;
}

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

const PayrollBatch: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { isSpeaking, addMessage, setLoading, setOpen } = useAgentState();
  const [viewMode, setViewMode] = useState<"tracker" | "payroll">("tracker");
  const [currentStep, setCurrentStep] = useState<PayrollStep>("review-fx");
  const [fxRatesLocked, setFxRatesLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
                        {contractors.map((contractor) => (
                          <TableRow key={contractor.id}>
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
                          </TableRow>
                        ))}
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
                    <div className="pt-6">{viewMode === "tracker" ? (
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
                    )}</div>
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
