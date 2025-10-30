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
import { cn } from "@/lib/utils";

interface OwnChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const CandidateDashboard = () => {
  const candidateProfile = {
    name: "Maria Santos",
    country: "PH",
    type: "Contractor" as const,
  };

  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const [checklistRequirements, setChecklistRequirements] = useState<any[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [ownChecklist, setOwnChecklist] = useState<OwnChecklistItem[]>([
    { id: "profile_photo", label: "Upload profile photo", completed: false },
    { id: "emergency_contact", label: "Add emergency contact", completed: true },
    { id: "work_preferences", label: "Set work preferences", completed: true },
    { id: "notification_settings", label: "Configure notifications", completed: false },
  ]);

  // Collapsible states
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [payrollOpen, setPayrollOpen] = useState(true);
  const [ownChecklistOpen, setOwnChecklistOpen] = useState(false);

  // Payroll sync state
  const { contractors, getContractorStatus } = usePayrollSync();
  const contractorId = "maria_santos_ph";
  const contractor = getContractorStatus(contractorId);

  // Initialize demo contractor if not exists
  useEffect(() => {
    if (!contractor) {
      const { addContractor } = usePayrollSync.getState();
      addContractor({
        id: contractorId,
        name: "Maria Santos",
        country: "Philippines",
        flag: "🇵🇭",
        checklist: [
          { id: "contract_signed", label: "Signed Contract", status: "complete", kurtMessage: "Contract verified by Fronted." },
          { id: "compliance_docs", label: "Compliance Documents", status: "waiting", kurtMessage: "Please upload your tax form here." },
          { id: "payroll_setup", label: "Payroll Setup", status: "pending" },
          { id: "first_payment", label: "First Payment", status: "pending" },
          { id: "certification", label: "Certification Complete", status: "pending" },
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

  const ownChecklistCompleted = ownChecklist.filter((item) => item.completed).length;
  const ownChecklistProgress = ownChecklist.length > 0
    ? Math.round((ownChecklistCompleted / ownChecklist.length) * 100)
    : 0;

  const payrollProgress = contractor?.progress || 0;

  // Overall progress (average of all three sections)
  const overallProgress = Math.round(
    (progressPercentage + ownChecklistProgress + payrollProgress) / 3
  );

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

  const toggleOwnChecklistItem = (id: string) => {
    setOwnChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

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
      label: "View Contract",
      action: () => toast.info("Opening contract viewer..."),
    },
    {
      label: "Upload Document",
      action: () => toast.info("Opening document uploader..."),
    },
    {
      label: "Ask About Progress",
      action: () => toast.info("Opening Kurt chat..."),
    },
    {
      label: "View History",
      action: () => toast.info("Opening timeline..."),
    },
  ];

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName={candidateProfile.name} />

          <div className="flex-1">
            <AgentLayout context="Candidate Dashboard">
              <main className="flex-1 bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
                <div className="max-w-5xl mx-auto p-8 pb-32 space-y-8">
                  {/* Agent Header */}
                  <AgentHeader
                    title={`Hi ${candidateProfile.name.split(" ")[0]}, I'm here if you need help! 👋`}
                    subtitle="Track your onboarding progress and access important information."
                    showPulse={true}
                    isActive={false}
                    isMuted={isKurtMuted}
                    onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                    tags={<AgentSuggestionChips chips={suggestionChips} />}
                  />

                  {/* Overall Progress Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Your Setup Progress</h2>
                      <span className="text-sm font-medium">{overallProgress}% Complete</span>
                    </div>
                    <ProgressBar 
                      currentStep={verifiedCount + ownChecklistCompleted + (contractor?.checklist.filter(i => i.status === 'complete').length || 0)} 
                      totalSteps={checklistRequirements.length + ownChecklist.length + (contractor?.checklist.length || 0)} 
                    />
                  </div>

                  {/* Main Content Cards */}
                  <div className="grid gap-6">
                    {/* Onboarding & Compliance Card */}
                    <Collapsible open={onboardingOpen} onOpenChange={setOnboardingOpen}>
                      <Card className="overflow-hidden border-2">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b cursor-pointer hover:bg-primary/10 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <FileCheck className="h-5 w-5 text-primary" />
                                  Onboarding & Compliance
                                  <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                    onboardingOpen && "rotate-180"
                                  )} />
                                </CardTitle>
                                <CardDescription>
                                  Required documents and verification from your onboarding
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-background">
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
                      <Card className="overflow-hidden border-2">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5 border-b cursor-pointer hover:bg-secondary/10 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <Loader2 className="h-5 w-5 text-secondary" />
                                  Payroll Certification
                                  <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                    payrollOpen && "rotate-180"
                                  )} />
                                </CardTitle>
                                <CardDescription>
                                  Complete these steps to get payroll ready
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-background">
                                {contractor?.checklist.filter(i => i.status === 'complete').length || 0} / {contractor?.checklist.length || 0}
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

                    {/* Own Checklist Card */}
                    <Collapsible open={ownChecklistOpen} onOpenChange={setOwnChecklistOpen}>
                      <Card className="overflow-hidden border-2">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 border-b cursor-pointer hover:bg-accent/10 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <Users className="h-5 w-5 text-accent" />
                                  Own Checklist
                                  <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                    ownChecklistOpen && "rotate-180"
                                  )} />
                                </CardTitle>
                                <CardDescription>
                                  Personal tasks to complete your profile setup
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="bg-background">
                                {ownChecklistCompleted} / {ownChecklist.length}
                              </Badge>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="p-6">
                        <div className="space-y-3">
                          {ownChecklist.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border transition-all",
                                item.completed 
                                  ? "bg-accent-green-fill/10 border-accent-green-outline/30" 
                                  : "bg-muted/30 border-border hover:bg-muted/50"
                              )}
                            >
                              <Checkbox
                                id={item.id}
                                checked={item.completed}
                                onCheckedChange={() => toggleOwnChecklistItem(item.id)}
                                className="h-5 w-5"
                              />
                              <label
                                htmlFor={item.id}
                                className={cn(
                                  "flex-1 text-sm font-medium cursor-pointer",
                                  item.completed && "line-through text-muted-foreground"
                                )}
                              >
                                {item.label}
                              </label>
                              {item.completed && (
                                <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                              )}
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
