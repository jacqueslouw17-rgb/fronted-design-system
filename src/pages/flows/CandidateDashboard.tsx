import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileCheck, Loader2, Clock, AlertCircle, Circle, Users, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ChecklistItemCard from "@/components/candidate/ChecklistItemCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getChecklistForProfile, ChecklistRequirement } from "@/data/candidateChecklistData";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import ProgressBar from "@/components/ProgressBar";
import { usePayrollSync } from "@/hooks/usePayrollSync";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { useAgentState } from "@/hooks/useAgentState";
import { cn } from "@/lib/utils";

const CandidateDashboard = () => {
  const candidateProfile = {
    name: "Maria Santos",
    country: "PH",
    type: "Contractor" as const,
  };

  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const [checklistRequirements, setChecklistRequirements] = useState<any[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const { setOpen } = useAgentState();

  // Collapsible states
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [payrollOpen, setPayrollOpen] = useState(true);

  // Payroll sync state
  const { contractors, getContractorStatus } = usePayrollSync();
  const contractorId = "maria_santos_ph";
  const contractor = getContractorStatus(contractorId);

  // Initialize demo contractor if not exists and sync with onboarding
  useEffect(() => {
    if (!contractor) {
      const { addContractor } = usePayrollSync.getState();
      addContractor({
        id: contractorId,
        name: "Maria Santos",
        country: "Philippines",
        flag: "🇵🇭",
        checklist: [
          { id: "contract_signed", label: "Contract Signed", status: "complete", kurtMessage: "✓ Contract verified by Fronted." },
          { id: "onboarding_docs", label: "Onboarding Documents", status: "waiting", kurtMessage: "Complete your onboarding checklist below" },
          { id: "compliance_review", label: "Compliance Review", status: "pending", kurtMessage: "Pending onboarding completion" },
          { id: "payroll_setup", label: "Payroll System Setup", status: "pending", kurtMessage: "Pending compliance review" },
          { id: "first_payment", label: "First Payment Ready", status: "pending" },
        ],
        progress: 20,
        issues: [],
      });
    }
  }, [contractor, contractorId]);

  useEffect(() => {
    const profile = getChecklistForProfile(candidateProfile.country, candidateProfile.type);
    if (profile) {
      setChecklistRequirements(profile.requirements);
    }
  }, [candidateProfile.country, candidateProfile.type]);

  const verifiedCount = checklistRequirements.filter((req) => req.status === "verified").length;
  const progressPercentage = checklistRequirements.length > 0
    ? Math.round((verifiedCount / checklistRequirements.length) * 100)
    : 0;

  // Calculate unified progress (onboarding feeds into payroll)
  const payrollCompleted = contractor?.checklist.filter(i => i.status === 'complete').length || 0;
  const payrollTotal = contractor?.checklist.length || 0;
  
  // Overall progress combines both sections as one flow
  const totalSteps = checklistRequirements.length + payrollTotal;
  const completedSteps = verifiedCount + payrollCompleted;
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  useEffect(() => {
    if (progressPercentage === 100 && !showCompletion) {
      setShowCompletion(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success("🎉 All onboarding requirements verified!");
    }
  }, [progressPercentage, showCompletion]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-accent-green-text" />;
      case "waiting":
        return <Clock className="h-4 w-4 text-accent-yellow-text" />;
      case "pending":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "border-accent-green-outline/30 bg-accent-green-fill/10";
      case "waiting":
        return "border-accent-yellow-outline/30 bg-accent-yellow-fill/10";
      case "pending":
        return "border-border bg-muted/30";
      default:
        return "border-border bg-muted/30";
    }
  };

  const suggestionChips = [
    {
      label: "Any Updates?",
      onAction: () => {
        setOpen(true);
        toast.info("Opening Kurt to check for updates...");
      },
      disabled: false,
    },
    {
      label: "Ask Kurt",
      onAction: () => {
        setOpen(true);
      },
      disabled: false,
    },
  ];

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName={candidateProfile.name} profileSettingsUrl="/candidate/profile-settings" dashboardUrl="/candidate-dashboard" />

          <div className="flex-1">
            <AgentLayout context="Candidate Dashboard">
              <main className="flex-1 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
                {/* Static background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                  <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                       style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
                  <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                       style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
                </div>

                <div className="max-w-5xl mx-auto p-8 pb-32 space-y-8 relative z-10">
                  {/* Agent Header */}
                  <AgentHeader
                    title={`Hi ${candidateProfile.name.split(" ")[0]}, I'm here if you need help! 👋`}
                    subtitle="Track your onboarding progress and access important information."
                    showPulse={true}
                    isActive={false}
                    showInput={false}
                    tags={<AgentSuggestionChips chips={suggestionChips} />}
                  />

                  {/* Overall Progress Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Your Setup Progress</h2>
                      <span className="text-sm font-medium">{overallProgress}% Complete</span>
                    </div>
                    <ProgressBar 
                      currentStep={completedSteps} 
                      totalSteps={totalSteps} 
                    />
                    <p className="text-sm text-muted-foreground">
                      Complete your onboarding to unlock payroll certification
                    </p>
                  </div>

                  {/* Main Content Cards */}
                  <div className="grid gap-6">
                    {/* Onboarding & Compliance Card */}
                    <Collapsible open={onboardingOpen} onOpenChange={setOnboardingOpen}>
                      <Card className="overflow-hidden border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 cursor-pointer hover:from-primary/[0.04] hover:to-secondary/[0.04] transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <FileCheck className="h-5 w-5 text-primary" />
                                  Step 1: Onboarding & Compliance
                                  <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                    onboardingOpen && "rotate-180"
                                  )} />
                                </CardTitle>
                                <CardDescription>
                                  Complete these requirements to proceed to payroll certification
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-border/40">
                                {verifiedCount} / {checklistRequirements.length}
                              </Badge>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                          {showCompletion ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center py-8"
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-green-fill/20 mb-4">
                                <CheckCircle2 className="h-8 w-8 text-accent-green-text" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">
                                All onboarding requirements verified! 🎉
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                You've completed all necessary compliance checks.
                              </p>
                            </motion.div>
                          ) : (
                            <div className="space-y-3">
                              {checklistRequirements.map((req, index) => (
                                <ChecklistItemCard key={req.id || index} requirement={req} index={index} />
                              ))}
                            </div>
                          )}
                        </AnimatePresence>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>

                    {/* Payroll Certification Card */}
                    <Collapsible open={payrollOpen} onOpenChange={setPayrollOpen}>
                      <Card className="overflow-hidden border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="bg-gradient-to-r from-secondary/[0.02] to-accent/[0.02] border-b border-border/40 cursor-pointer hover:from-secondary/[0.04] hover:to-accent/[0.04] transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <Loader2 className="h-5 w-5 text-secondary" />
                                  Step 2: Payroll Certification
                                  <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                    payrollOpen && "rotate-180"
                                  )} />
                                </CardTitle>
                                <CardDescription>
                                  System verification and payroll setup (auto-updates as you progress)
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-background">
                                {payrollCompleted} / {payrollTotal}
                              </Badge>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="p-6">
                        <div className="space-y-3">
                          {contractor?.checklist.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "border rounded-lg p-4 space-y-2 transition-all",
                                getStatusColor(item.status)
                              )}
                            >
                              <div className="flex items-start gap-3">
                                {getStatusIcon(item.status)}
                                <div className="flex-1 space-y-1">
                                  <p className={cn(
                                    "text-sm font-medium",
                                    item.status === "complete" && "line-through text-muted-foreground"
                                  )}>
                                    {item.label}
                                  </p>
                                  {item.kurtMessage && (
                                    <p className="text-xs text-muted-foreground">{item.kurtMessage}</p>
                                  )}
                                  {item.timestamp && (
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  </div>
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CandidateDashboard;
