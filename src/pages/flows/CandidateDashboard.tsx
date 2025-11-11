import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, Download, Eye, FileCheck, ChevronDown, Clock, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
type SigningSubStatus = "ready_to_sign" | "opening_docusign" | "signed_pending_admin" | "fully_signed";

interface ContractStep {
  id: string;
  label: string;
  description: string;
  status: ContractStepStatus;
  signingSubStatus?: SigningSubStatus;
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

  const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
  const [contractReviewed, setContractReviewed] = useState(false);
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
  const [step2Open, setStep2Open] = useState(false);

  // Signing sub-status tracking
  const [signingSubStatus, setSigningSubStatus] = useState<SigningSubStatus>("ready_to_sign");

  // Helper function to get signing sub-status label
  const getSigningLabel = (status: SigningSubStatus): string => {
    switch (status) {
      case "ready_to_sign":
        return "Sign Contract";
      case "opening_docusign":
        return "Signing in Progress";
      case "signed_pending_admin":
        return "Awaiting HR Counter-Signature";
      case "fully_signed":
        return "Contract Certified";
    }
  };

  // Helper function to get signing sub-status description
  const getSigningDescription = (status: SigningSubStatus): string => {
    switch (status) {
      case "ready_to_sign":
        return "Your contract is ready for signature — check your email to sign.";
      case "opening_docusign":
        return "You're being redirected to DocuSign to sign your contract.";
      case "signed_pending_admin":
        return "Your signature has been received. HR will counter-sign to finalize.";
      case "fully_signed":
        return "Your contract has been fully signed and certified.";
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
      label: getSigningLabel(signingSubStatus),
      description: getSigningDescription(signingSubStatus),
      status: signingSubStatus === "fully_signed" ? "complete" : "active",
      signingSubStatus: signingSubStatus,
      action: signingSubStatus === "ready_to_sign" ? {
        label: "Sign Now",
        onClick: () => {
          // Step 1: Move to opening_docusign
          setSigningSubStatus("opening_docusign");
          setContractSteps(prev => prev.map(step => {
            if (step.id === "sign_contract") {
              return {
                ...step,
                label: getSigningLabel("opening_docusign"),
                description: getSigningDescription("opening_docusign"),
                signingSubStatus: "opening_docusign",
                action: undefined
              };
            }
            return step;
          }));
          toast.info("Opening DocuSign...");
          
          if (demoMode) {
            // Demo mode: Auto-progress through states
            // Step 2: After 1s, move to signed_pending_admin
            setTimeout(() => {
              setSigningSubStatus("signed_pending_admin");
              setContractSteps(prev => prev.map(step => {
                if (step.id === "sign_contract") {
                  return {
                    ...step,
                    label: getSigningLabel("signed_pending_admin"),
                    description: getSigningDescription("signed_pending_admin"),
                    signingSubStatus: "signed_pending_admin"
                  };
                }
                return step;
              }));
              toast.success("Contract signed. Awaiting HR counter-signature...");
              
              // Step 3: After 2s more, move to fully_signed
              setTimeout(() => {
                setSigningSubStatus("fully_signed");
                
                // Complete all contract steps
                setContractSteps(prev => prev.map(step => {
                  if (step.id === "sign_contract") {
                    return {
                      ...step,
                      label: getSigningLabel("fully_signed"),
                      description: getSigningDescription("fully_signed"),
                      status: "complete" as ContractStepStatus,
                      signingSubStatus: "fully_signed",
                      action: undefined
                    };
                  }
                  if (step.id === "counter_signature") {
                    return { ...step, status: "complete" as ContractStepStatus };
                  }
                  if (step.id === "certification_complete") {
                    return { 
                      ...step, 
                      status: "complete" as ContractStepStatus,
                      action: {
                        label: "View Documents →",
                        onClick: () => {
                          setStep2Open(true);
                          setTimeout(() => {
                            const step2Element = document.querySelector('[data-step="step2"]');
                            if (step2Element) {
                              step2Element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                          }, 100);
                        }
                      }
                    };
                  }
                  return step;
                }));
                
                // Activate and complete documents
                setDocumentSteps(prev => prev.map(step => ({
                  ...step,
                  status: "complete" as ContractStepStatus
                })));
                
                toast.success("All steps complete — your contract is certified and documents are ready.");
                
                // Trigger confetti
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }, 2000);
            }, 1000);
          } else {
            // Real mode: Wait for webhook after opening
            setTimeout(() => {
              setSigningSubStatus("signed_pending_admin");
              setContractSteps(prev => prev.map(step => {
                if (step.id === "sign_contract") {
                  return {
                    ...step,
                    label: getSigningLabel("signed_pending_admin"),
                    description: getSigningDescription("signed_pending_admin"),
                    signingSubStatus: "signed_pending_admin"
                  };
                }
                return step;
              }));
            }, 2000);
          }
        },
      } : signingSubStatus === "opening_docusign" ? {
        label: "Opening...",
        onClick: () => {}
      } : undefined,
    },
    {
      id: "counter_signature",
      label: "Admin Counter-Signature",
      description: "HR has counter-signed your contract.",
      status: "pending",
    },
    {
      id: "certification_complete",
      label: "Certification Complete",
      description: "Your contract is now fully signed and verified.",
      status: "pending",
      action: {
        label: "View Documents →",
        onClick: () => {
          setStep2Open(true);
          // Smooth scroll to Step 2
          setTimeout(() => {
            const step2Element = document.querySelector('[data-step="step2"]');
            if (step2Element) {
              step2Element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
        }
      }
    },
  ]);

  const [documentSteps, setDocumentSteps] = useState<ContractStep[]>([
    {
      id: "signed_bundle",
      label: "Signed Contract Bundle",
      description: "Your final HR-approved contract bundle.",
      status: "pending",
      action: {
        label: "Download PDF",
        onClick: () => {
          // Stub URL for demo - in production would be real signed PDF URL
          window.open("#", "_blank");
          toast.info("Downloading contract...");
        },
      },
    },
    {
      id: "certificate",
      label: "Certificate of Contract",
      description: "Official certification record verifying signatures.",
      status: "pending",
      action: {
        label: "View Certificate",
        onClick: () => {
          // Stub URL for demo - in production would be real certificate URL
          window.open("#", "_blank");
          toast.success("Opening certificate...");
        },
      },
    },
  ]);

  // Calculate progress
  const totalSteps = contractSteps.length;
  const completedSteps = contractSteps.filter(step => step.status === "complete").length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Check if certified
  const isCertified = contractSteps.find(s => s.id === "certification_complete")?.status === "complete";


  // Helper function to get signing sub-status badge
  const getSigningBadge = (status: SigningSubStatus) => {
    switch (status) {
      case "ready_to_sign":
        return <Badge variant="outline" className="text-xs border-accent-yellow-outline/50 text-accent-yellow-text bg-accent-yellow-fill/10">🟠 Action Needed</Badge>;
      case "opening_docusign":
        return <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400 bg-blue-500/10">🔵 Opening DocuSign...</Badge>;
      case "signed_pending_admin":
        return <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400 bg-yellow-500/10">🟡 Pending HR</Badge>;
      case "fully_signed":
        return <Badge variant="outline" className="text-xs border-accent-green-outline/50 text-accent-green-text bg-accent-green-fill/10">🟢 Completed</Badge>;
    }
  };

  const getStatusIcon = (status: ContractStepStatus, signingSubStatus?: SigningSubStatus) => {
    // Special handling for sign_contract step with signing sub-status
    if (signingSubStatus) {
      switch (signingSubStatus) {
        case "ready_to_sign":
          return <Clock className="h-4 w-4 text-accent-yellow-text animate-pulse" />;
        case "opening_docusign":
          return <Clock className="h-4 w-4 text-blue-400 animate-pulse" />;
        case "signed_pending_admin":
          return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
        case "fully_signed":
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

  const getStepColor = (status: ContractStepStatus, signingSubStatus?: SigningSubStatus) => {
    // Special handling for sign_contract step with signing sub-status
    if (signingSubStatus) {
      switch (signingSubStatus) {
        case "ready_to_sign":
          return "border-accent-yellow-outline/30 bg-accent-yellow-fill/10";
        case "opening_docusign":
          return "border-blue-500/30 bg-blue-500/10";
        case "signed_pending_admin":
          return "border-yellow-500/30 bg-yellow-500/10";
        case "fully_signed":
          return "border-accent-green-outline/30 bg-accent-green-fill/10";
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
                                       <div
                                        key={step.id}
                                        className={cn(
                                          "border rounded-lg p-4 transition-all",
                                          getStepColor(step.status, step.signingSubStatus)
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          {getStatusIcon(step.status, step.signingSubStatus)}
                                           <div className="flex-1 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                              <p className={cn(
                                                "text-sm font-medium",
                                                step.status === "complete" && "line-through text-muted-foreground"
                                              )}>
                                                {step.label}
                                              </p>
                                              {step.signingSubStatus && getSigningBadge(step.signingSubStatus)}
                                              {step.id === "certification_complete" && step.status === "complete" && (
                                                <Badge variant="outline" className="text-xs border-accent-green-outline/50 text-accent-green-text bg-accent-green-fill/10">
                                                  Certified
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                          </div>
                                          {step.action && step.action.label && step.status !== "pending" && (
                                            <Button
                                              size="sm"
                                              variant={
                                                step.signingSubStatus === "ready_to_sign" 
                                                  ? "default" 
                                                  : step.id === "certification_complete" && step.status === "complete"
                                                  ? "default"
                                                  : "ghost"
                                              }
                                              onClick={step.action.onClick}
                                              className="shrink-0"
                                              disabled={step.signingSubStatus === "opening_docusign"}
                                            >
                                              {step.action.label}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>

                          {/* Step 2: Documents & Certificate */}
                          <Collapsible open={step2Open} onOpenChange={setStep2Open}>
                            <Card data-step="step2" className="overflow-hidden border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
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
                                        Your signed documents are ready to download or view.
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="p-6">
                                  <div className="space-y-3">
                                     {documentSteps.map((step, index) => (
                                      <div
                                        key={step.id}
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
                                              className="shrink-0 min-w-[140px]"
                                            >
                                              {step.action.label}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
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
          onMarkReviewed={() => {
            setContractReviewed(true);
            // Update the review step to complete
            setContractSteps(prev => prev.map(step => {
              if (step.id === "review_contract") {
                return { ...step, status: "complete" as ContractStepStatus, action: undefined };
              }
              return step;
            }));
            toast.success("Contract marked as reviewed");
          }}
        />
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CandidateDashboard;
