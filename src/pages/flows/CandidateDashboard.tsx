import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, Download, Eye, FileCheck, ChevronDown, Clock, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import ProgressBar from "@/components/ProgressBar";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { useAgentState } from "@/hooks/useAgentState";
import { cn } from "@/lib/utils";
import ContractPreviewDrawer from "@/components/contract-flow/ContractPreviewDrawer";

type ContractStepStatus = "complete" | "active" | "pending";
type DocuSignStatus = "not_sent" | "sent" | "opened" | "signer_completed" | "completed";

interface ContractStep {
  id: string;
  label: string;
  description: string;
  status: ContractStepStatus;
  docusignStatus?: DocuSignStatus;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const CandidateDashboard = () => {
  const location = useLocation();
  const candidateProfile = {
    name: "Maria Santos",
    firstName: "Maria",
    role: "Senior Backend Engineer",
    salary: "$85,000",
    currency: "USD",
    startDate: "March 15, 2024",
    noticePeriod: "30 days",
    pto: "25 days",
    country: "Philippines",
  };

  const [showCompletion, setShowCompletion] = useState(false);
  const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
  const { setOpen, simulateResponse } = useAgentState();
  const [demoMode, setDemoMode] = useState(true); // Enable demo mode

  // Trigger confetti on arrival from onboarding
  useEffect(() => {
    const fromOnboarding = location.state?.fromOnboarding;
    if (fromOnboarding) {
      // Clear the state to prevent confetti on refresh
      window.history.replaceState({}, document.title);
      
      // Trigger confetti
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 300);
    }
  }, [location.state]);

  // Collapsible states
  const [step1Open, setStep1Open] = useState(true);
  const [step2Open, setStep2Open] = useState(true);

  // DocuSign status tracking (in real implementation, this would come from backend/webhooks)
  const [docusignStatus, setDocusignStatus] = useState<DocuSignStatus>("sent");

  // Helper function to get DocuSign description
  const getDocuSignDescription = (status: DocuSignStatus): string => {
    switch (status) {
      case "not_sent":
        return "Waiting for DocuSign invitation to be sent.";
      case "sent":
        return "Your contract is ready for signature — check your email to sign.";
      case "opened":
        return "Signing in progress… we'll update once complete.";
      case "signer_completed":
        return "You've signed your contract. Waiting for HR to counter-sign.";
      case "completed":
        return "All signatures are complete. Your contract is now certified.";
    }
  };

  // Contract steps state
  const [contractSteps, setContractSteps] = useState<ContractStep[]>([
    {
      id: "contract_generated",
      label: "Contract Generated",
      description: "Your draft contract has been created by HR.",
      status: "complete",
    },
    {
      id: "review_contract",
      label: "Review Contract",
      description: "Check the contract details before signing.",
      status: "active",
      action: {
        label: "View Contract",
        onClick: () => setContractDrawerOpen(true),
      },
    },
    {
      id: "sign_contract",
      label: "Sign Contract",
      description: getDocuSignDescription(docusignStatus),
      status: docusignStatus === "not_sent" ? "pending" : "active",
      docusignStatus: docusignStatus,
      action: {
        label: docusignStatus === "sent" ? "Sign Now" : undefined,
        onClick: () => {
          toast.info("Opening DocuSign...");
          
          if (demoMode) {
            // Demo mode: Auto-complete the signing flow
            setTimeout(() => {
              // Step 1: Update to opened
              setDocusignStatus("opened");
              
              setTimeout(() => {
                // Step 2: Mark as signed by candidate
                setDocusignStatus("signer_completed");
                
                setTimeout(() => {
                  // Step 3: Update contract steps - mark sign_contract as complete
                  setContractSteps(prev => prev.map(step => {
                    if (step.id === "sign_contract") {
                      return { ...step, status: "complete" as ContractStepStatus };
                    }
                    if (step.id === "counter_signature") {
                      return { ...step, status: "active" as ContractStepStatus };
                    }
                    return step;
                  }));
                  
                  setTimeout(() => {
                    // Step 4: Complete counter-signature
                    setContractSteps(prev => prev.map(step => {
                      if (step.id === "counter_signature") {
                        return { ...step, status: "complete" as ContractStepStatus };
                      }
                      if (step.id === "contract_certified") {
                        return { ...step, status: "active" as ContractStepStatus };
                      }
                      return step;
                    }));
                    
                    setTimeout(() => {
                      // Step 5: Complete certification
                      setDocusignStatus("completed");
                      setContractSteps(prev => prev.map(step => {
                        if (step.id === "contract_certified") {
                          return { ...step, status: "complete" as ContractStepStatus };
                        }
                        return step;
                      }));
                      
                      // Step 6: Activate and complete documents
                      setDocumentSteps(prev => prev.map(step => ({
                        ...step,
                        status: "complete" as ContractStepStatus
                      })));
                      
                      // Show success toast
                      toast.success("Your contract has been signed and certified.");
                      
                      // Trigger confetti
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                    }, 1000);
                  }, 1000);
                }, 1000);
              }, 1000);
            }, 2000);
          } else {
            // Real mode: Just open DocuSign
            setTimeout(() => setDocusignStatus("opened"), 1000);
          }
        },
      },
    },
    {
      id: "counter_signature",
      label: "Await Admin Counter-Signature",
      description: "Once signed, HR will counter-sign to finalize.",
      status: "pending",
    },
    {
      id: "contract_certified",
      label: "Contract Certified",
      description: "Your contract is fully signed and verified.",
      status: "pending",
      action: {
        label: "View Certificate",
        onClick: () => toast.success("Opening certificate..."),
      },
    },
  ]);

  const [documentSteps, setDocumentSteps] = useState<ContractStep[]>([
    {
      id: "signed_bundle",
      label: "Signed Contract Bundle",
      description: "View or download your final signed contract.",
      status: "pending",
      action: {
        label: "Download Contract PDF",
        onClick: () => toast.info("Downloading contract..."),
      },
    },
    {
      id: "certificate",
      label: "Certificate of Contract",
      description: "View and verify your certified contract record.",
      status: "pending",
      action: {
        label: "View Certificate",
        onClick: () => toast.success("Opening certificate..."),
      },
    },
  ]);

  // Calculate progress
  const totalSteps = contractSteps.length;
  const completedSteps = contractSteps.filter(step => step.status === "complete").length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Check if certified
  const isCertified = contractSteps.find(s => s.id === "contract_certified")?.status === "complete";

  // Auto-progress when candidate completes signing
  useEffect(() => {
    if (docusignStatus === "signer_completed") {
      // Auto-transition to counter-signature step
      setTimeout(() => {
        const updatedSteps = contractSteps.map(step => {
          if (step.id === "sign_contract") {
            return { ...step, status: "complete" as ContractStepStatus };
          }
          if (step.id === "counter_signature") {
            return { ...step, status: "active" as ContractStepStatus };
          }
          return step;
        });
        setContractSteps(updatedSteps);
        toast.success(`Thanks, ${candidateProfile.firstName}! We've received your signature — HR will counter-sign next.`);
      }, 500);
    }
  }, [docusignStatus, candidateProfile.firstName]);

  useEffect(() => {
    if (isCertified && !showCompletion) {
      setShowCompletion(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success("🎉 You're certified! Your contract has been fully signed and verified.");
    }
  }, [isCertified, showCompletion]);

  // Helper function to get DocuSign status badge
  const getDocuSignBadge = (status: DocuSignStatus) => {
    switch (status) {
      case "sent":
        return <Badge variant="outline" className="text-xs border-accent-yellow-outline/50 text-accent-yellow-text bg-accent-yellow-fill/10">🟠 Action Needed</Badge>;
      case "opened":
        return <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400 bg-purple-500/10">🟣 In Progress</Badge>;
      case "signer_completed":
        return <Badge variant="outline" className="text-xs border-accent-green-outline/50 text-accent-green-text bg-accent-green-fill/10">🟢 Signed by You</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-xs border-accent-green-outline/50 text-accent-green-text bg-accent-green-fill/10">✅ Fully Signed</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: ContractStepStatus, docusignStatus?: DocuSignStatus) => {
    // Special handling for sign_contract step with docusign status
    if (docusignStatus) {
      switch (docusignStatus) {
        case "not_sent":
          return <Circle className="h-4 w-4 text-muted-foreground" />;
        case "sent":
          return <Clock className="h-4 w-4 text-accent-yellow-text animate-pulse" />;
        case "opened":
          return <Clock className="h-4 w-4 text-purple-400 animate-pulse" />;
        case "signer_completed":
          return <CheckCircle2 className="h-4 w-4 text-accent-green-text" />;
        case "completed":
          return <CheckCircle2 className="h-4 w-4 text-accent-green-text" />;
      }
    }
    
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-accent-green-text" />;
      case "active":
        return <Clock className="h-4 w-4 text-accent-yellow-text" />;
      case "pending":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepColor = (status: ContractStepStatus, docusignStatus?: DocuSignStatus) => {
    // Special handling for sign_contract step with docusign status
    if (docusignStatus) {
      switch (docusignStatus) {
        case "sent":
          return "border-accent-yellow-outline/30 bg-accent-yellow-fill/10";
        case "opened":
          return "border-purple-500/30 bg-purple-500/10";
        case "signer_completed":
          return "border-accent-green-outline/30 bg-accent-green-fill/10";
        case "completed":
          return "border-accent-green-outline/30 bg-accent-green-fill/10";
        default:
          return "border-border bg-muted/30";
      }
    }
    
    switch (status) {
      case "complete":
        return "border-accent-green-outline/30 bg-accent-green-fill/10";
      case "active":
        return "border-accent-yellow-outline/30 bg-accent-yellow-fill/10";
      case "pending":
        return "border-border bg-muted/30";
    }
  };

  const suggestionChips = [
    {
      label: "Any Updates?",
      onAction: async () => {
        setOpen(true);
        await simulateResponse("Your contract has been generated and sent for signing. You'll be notified once HR counter-signs.");
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
                    title={`Hi ${candidateProfile.firstName}, I'm here if you need help! 👋`}
                    subtitle="Track your contract progress and certification status."
                    showPulse={true}
                    isActive={false}
                    showInput={false}
                  />

                  {/* Overall Progress Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Contract Progress</h2>
                      <span className="text-sm font-medium">{completedSteps} / {totalSteps} steps complete</span>
                    </div>
                    <ProgressBar 
                      currentStep={completedSteps} 
                      totalSteps={totalSteps} 
                    />
                    <p className="text-sm text-muted-foreground">
                      Complete your contract steps to unlock certification.
                    </p>
                  </div>

                  {/* Main Content Cards */}
                  <div className="grid gap-6">
                    <AnimatePresence mode="wait">
                      {showCompletion ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-12"
                        >
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-green-fill/20 mb-6">
                            <CheckCircle2 className="h-10 w-10 text-accent-green-text" />
                          </div>
                          <h2 className="text-2xl font-bold mb-3">
                            You're certified! 🎉
                          </h2>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Your contract has been fully signed and verified. You'll be notified when payroll setup begins.
                          </p>
                          <Button 
                            size="lg" 
                            onClick={() => toast.info("Dashboard coming soon...")}
                          >
                            Go to My Dashboard
                          </Button>
                        </motion.div>
                      ) : (
                        <>
                          {/* Step 1: Contract Review & Signing */}
                          <Collapsible open={step1Open} onOpenChange={setStep1Open}>
                            <Card className="overflow-hidden border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                              <CollapsibleTrigger asChild>
                                <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 cursor-pointer hover:from-primary/[0.04] hover:to-secondary/[0.04] transition-all duration-200">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                      <CardTitle className="text-xl flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Step 1: Contract Review & Signing
                                        <ChevronDown className={cn(
                                          "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                          step1Open && "rotate-180"
                                        )} />
                                      </CardTitle>
                                      <CardDescription>
                                        Review, sign, and return your contract for verification.
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="p-6">
                                  <div className="space-y-3">
                                    {contractSteps.map((step, index) => (
                                       <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                          "border rounded-lg p-4 transition-all",
                                          getStepColor(step.status, step.docusignStatus)
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          {getStatusIcon(step.status, step.docusignStatus)}
                                          <div className="flex-1 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                              <p className={cn(
                                                "text-sm font-medium",
                                                step.status === "complete" && "line-through text-muted-foreground"
                                              )}>
                                                {step.label}
                                              </p>
                                              {step.docusignStatus && getDocuSignBadge(step.docusignStatus)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                          </div>
                                          {step.action && step.action.label && step.status !== "pending" && (
                                            <Button
                                              size="sm"
                                              variant={step.docusignStatus === "sent" ? "default" : "ghost"}
                                              onClick={step.action.onClick}
                                              className="shrink-0"
                                              disabled={step.docusignStatus === "opened"}
                                            >
                                              {step.action.label}
                                            </Button>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>

                          {/* Step 2: Documents & Certificate */}
                          <Collapsible open={step2Open} onOpenChange={setStep2Open}>
                            <Card className="overflow-hidden border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                              <CollapsibleTrigger asChild>
                                <CardHeader className="bg-gradient-to-r from-secondary/[0.02] to-accent/[0.02] border-b border-border/40 cursor-pointer hover:from-secondary/[0.04] hover:to-accent/[0.04] transition-all duration-200">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                      <CardTitle className="text-xl flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-secondary" />
                                        Step 2: Documents & Certificate
                                        <ChevronDown className={cn(
                                          "h-5 w-5 text-muted-foreground transition-transform ml-2",
                                          step2Open && "rotate-180"
                                        )} />
                                      </CardTitle>
                                      <CardDescription>
                                        Access your signed contract bundle and official certification.
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="p-6">
                                  <div className="space-y-3">
                                    {documentSteps.map((step, index) => (
                                      <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                          "border rounded-lg p-4 transition-all",
                                          getStepColor(step.status)
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          {getStatusIcon(step.status)}
                                          <div className="flex-1 space-y-0.5">
                                            <p className={cn(
                                              "text-sm font-medium",
                                              step.status === "complete" && "text-muted-foreground"
                                            )}>
                                              {step.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                          </div>
                                          {step.action && step.status === "complete" && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={step.action.onClick}
                                              className="shrink-0"
                                            >
                                              {step.action.label}
                                            </Button>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </main>

              {/* Demo Mode Indicator */}
              {demoMode && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                  <Badge variant="outline" className="bg-card/95 backdrop-blur-sm border-muted-foreground/30 text-muted-foreground px-4 py-2 shadow-lg">
                    🎭 Demo mode active – no documents were actually signed.
                  </Badge>
                </div>
              )}
            </AgentLayout>
          </div>
        </div>

        {/* Contract Preview Drawer */}
        <ContractPreviewDrawer
          open={contractDrawerOpen}
          onOpenChange={setContractDrawerOpen}
          candidateName={candidateProfile.name}
          candidateRole={candidateProfile.role}
          salary={candidateProfile.salary}
          currency={candidateProfile.currency}
          startDate={candidateProfile.startDate}
          noticePeriod={candidateProfile.noticePeriod}
          pto={candidateProfile.pto}
          country={candidateProfile.country}
        />
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CandidateDashboard;
