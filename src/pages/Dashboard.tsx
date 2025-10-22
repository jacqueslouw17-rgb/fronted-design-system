import { useState, useEffect } from "react";
import Topbar from "@/components/dashboard/Topbar";
import NavSidebar from "@/components/dashboard/NavSidebar";
import AgentDrawer from "@/components/dashboard/AgentDrawer";
import WidgetGrid from "@/components/dashboard/WidgetGrid";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import AgentMain from "@/components/dashboard/AgentMain";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, TrendingUp, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { Timeline } from "@/components/AgentContextualTimeline";
import type { TimelineEvent } from "@/components/AgentContextualTimeline";
import confetti from "canvas-confetti";
import { useContractFlow } from "@/hooks/useContractFlow";
import { ContractFlowNotification } from "@/components/contract-flow/ContractFlowNotification";
import { ContractDraftWorkspace } from "@/components/contract-flow/ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";
import { ContractSignaturePhase } from "@/components/contract-flow/ContractSignaturePhase";
import { ContractFlowSummary } from "@/components/contract-flow/ContractFlowSummary";
import { ActiveContractorsWidget } from "@/components/contract-flow/ActiveContractorsWidget";

interface DashboardProps {
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    role: string;
  };
  onboardingHistory?: Array<{ role: string; content: string }>;
}

const Dashboard = ({ 
  userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  },
  onboardingHistory = []
}: DashboardProps) => {
  const [version, setVersion] = useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // V3 Contract Flow State
  const contractFlow = useContractFlow();
  const [v3KurtMessage, setV3KurtMessage] = useState("");
  const [v3ShowContractors, setV3ShowContractors] = useState(false);
  
  // V4 Payroll Demo State
  type Phase = "idle" | "processing" | "results" | "audit";
  const [v4Phase, setV4Phase] = useState<Phase>("idle");
  const [v4Message, setV4Message] = useState("Welcome! I'm ready to help you run October payroll.");
  const [v4IsProcessing, setV4IsProcessing] = useState(false);
  const [v4PayrollData, setV4PayrollData] = useState<any[]>([]);
  const [v4ShowSkeleton, setV4ShowSkeleton] = useState(false);
  const [v4ComplianceScore, setV4ComplianceScore] = useState(0);
  const [v4GeloCompact, setV4GeloCompact] = useState(false);
  const [v4AuditExpanded, setV4AuditExpanded] = useState(true);
  const { speak, currentWordIndex } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();
  
  // Confetti celebration on mount
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);
  
  // When switching to v2, auto-open the agent
  useEffect(() => {
    if (version === "v2") {
      setIsAgentOpen(true);
    } else if (version === "v4") {
      // Initialize v4 payroll demo
      const msg = "Welcome! I'm ready to help you run October payroll.";
      setV4Message(msg);
      speak(msg);
      setV4Phase("idle");
    } else if (version === "v3") {
      // Initialize v3 contract flow
      const timer = setTimeout(() => {
        contractFlow.startFlow();
        setV3KurtMessage("Hey Joe, looks like three shortlisted candidates are ready for contract drafting.");
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Reset to closed when switching back to v1
      setIsAgentOpen(false);
    }
  }, [version]);

  const startV4Payroll = async () => {
    const msg1 = "On it. Loading payroll batch #2025-10.";
    setV4Message(msg1);
    speak(msg1);
    setV4IsProcessing(true);
    
    // Wait for Gelo to finish speaking (~2s) before showing dashboard
    setTimeout(() => {
      setV4Phase("processing");
      setV4ShowSkeleton(true);
    }, 2400);

    setTimeout(() => {
      setV4PayrollData([
        { country: "PH", flag: "🇵🇭", currency: "PHP", total: "₱5.3 M", fxRate: "62.1", fee: "€42", eta: "2 d", status: "processing" },
      ]);
    }, 3200);

    setTimeout(() => {
      setV4PayrollData(prev => [...prev,
        { country: "NO", flag: "🇳🇴", currency: "NOK", total: "190 K", fxRate: "11.4", fee: "€30", eta: "1 d", status: "processing" },
      ]);
    }, 3800);

    setTimeout(() => {
      setV4PayrollData(prev => [...prev,
        { country: "PL", flag: "🇵🇱", currency: "PLN", total: "420 K", fxRate: "4.3", fee: "€28", eta: "1 d", status: "processing" },
      ]);
    }, 4400);

    setTimeout(() => {
      setV4ShowSkeleton(false);
      setV4PayrollData(prev => prev.map(row => ({ ...row, status: "complete" })));
      setV4ComplianceScore(96);
      setV4IsProcessing(false);
      
      // Wait a moment before speaking completion message
      setTimeout(() => {
        const msg2 = "Payroll batch completed. Would you like to send for CFO approval?";
        setV4Message(msg2);
        speak(msg2);
        
        // Wait for Gelo to finish speaking before showing results phase
        setTimeout(() => {
          setV4Phase("results");
          
          toast({
            title: "✅ Processing Complete",
            description: "3 currency batches processed successfully",
          });
        }, 3500);
      }, 800);
    }, 5500);
  };

  const sendV4ForApproval = () => {
    const msg = "Sent to Howard. You can track status here in the audit timeline.";
    setV4Message(msg);
    speak(msg);
    
    toast({
      title: "📤 Sent for Approval",
      description: "Howard (CFO) will review the batch",
    });

    setTimeout(() => {
      setV4Phase("audit");
      setV4GeloCompact(true);
      setV4AuditExpanded(true);
    }, 600);
  };

  const completeV4Flow = () => {
    const msg = "Payroll run completed. CFO approved. Compliance 96%. All reports archived under /finance/oct-2025.";
    setV4Message(msg);
    speak(msg);

    toast({
      title: "✅ All Complete",
      description: "Payroll archived and documented",
    });
    
    setTimeout(() => {
      setV4Phase("idle");
      setV4GeloCompact(false);
      setV4AuditExpanded(true);
      
      // Reset state
      setV4PayrollData([]);
      setV4ComplianceScore(0);
    }, 3000);
  };

  // Handle transition loading state for v3
  useEffect(() => {
    if (version === "v3") {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  // V2 mode: Agent is always open on the right initially, but can be closed
  const isV2AgentOpen = version === "v2" ? isAgentOpen : false;
  const isV1AgentOpen = version === "v1" ? isAgentOpen : false;

  return (
    <RoleLensProvider initialRole={(userData.role as any) || 'admin'}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Left Sidebar - always visible */}
        <NavSidebar 
          onGenieToggle={() => {
            if (version === "v1") {
              setIsAgentOpen(!isAgentOpen);
            }
          }} 
          isGenieOpen={version === "v1" && isV1AgentOpen}
          disabled={version === "v2" || version === "v3"}
        />

        {/* V1: Agent Panel from LEFT (40% width, pushes dashboard) */}
        {version === "v1" && isV1AgentOpen && (
          <div className="w-[40%] border-r border-border flex-shrink-0">
            <AgentDrawer
              isOpen={isV1AgentOpen}
              onClose={() => setIsAgentOpen(false)}
              userData={userData}
              chatHistory={onboardingHistory}
            />
          </div>
        )}

        {/* Main Content - adapts to agent panel width */}
        {version === "v4" ? (
          // V4 Layout: Payroll Demo - Dashboard left, Gelo right
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar 
              userName={`${userData.firstName} ${userData.lastName}`}
              version={version}
              onVersionChange={(v) => setVersion(v)}
            />
            
            <main className="flex-1 flex overflow-hidden">
              <AnimatePresence mode="wait">
                {v4Phase === "idle" ? (
                  // Full Gelo view
                  <motion.div
                    key="gelo-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "100%" }}
                    exit={{ width: "50%" }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]"
                  >
                    {/* Subtle wave header */}
                    <div className="relative z-10 flex flex-col items-center space-y-4">
                      <AudioWaveVisualizer isActive={false} />
                      <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-foreground">Hi {userData.firstName}, what would you like to know?</h2>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          {v4Message.split(' ').map((word, index) => (
                            <span
                              key={index}
                              className={`transition-colors duration-150 ${
                                index === currentWordIndex - 1
                                  ? 'text-foreground font-semibold'
                                  : index < currentWordIndex - 1
                                  ? 'text-foreground/70 font-medium'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {word}{index < v4Message.split(' ').length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 z-10"
                    >
                      <Button 
                        size="lg"
                        onClick={startV4Payroll}
                        className="px-8 bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      >
                        Run October Payroll
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    {/* Dashboard Panel - 50% left */}
                    <motion.div
                      key="dashboard-left"
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="w-[50%] h-full overflow-y-auto p-8 space-y-6 border-r border-border"
                    >
                      {/* Payroll Widget */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.08, duration: 0.4 }}
                      >
                        <Card className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Payroll Summary</h3>
                            <Badge variant="secondary">Batch #2025-10</Badge>
                          </div>

                          {v4ShowSkeleton ? (
                            <div className="space-y-3">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-3 text-xs font-medium text-muted-foreground pb-2 border-b">
                                <div>Country</div>
                                <div>Currency</div>
                                <div>Total</div>
                                <div>FX Rate</div>
                                <div>Fee</div>
                                <div>ETA</div>
                                <div>Status</div>
                              </div>
                              {v4PayrollData.map((row, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 + idx * 0.08, duration: 0.15, ease: "easeOut" }}
                                  className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_auto] gap-3 text-sm py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors items-center"
                                >
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span>{row.flag}</span>
                                    <span className="font-medium">{row.country}</span>
                                  </div>
                                  <div>{row.currency}</div>
                                  <div className="font-medium">{row.total}</div>
                                  <div>{row.fxRate}</div>
                                  <div>{row.fee}</div>
                                  <div>{row.eta}</div>
                                  <div className="whitespace-nowrap">
                                    {row.status === "complete" ? (
                                      <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Complete
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                          className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full mr-1"
                                        />
                                        Processing
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </motion.div>

                      {/* Compliance Widget */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.16, duration: 0.4 }}
                      >
                        <Card className="p-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Compliance Status</h3>
                            {v4Phase !== "processing" && v4ComplianceScore > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, duration: 0.2, type: "spring" }}
                              >
                                <Badge className="text-lg px-4 py-1">
                                  {v4ComplianceScore}% Compliant
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          {v4ShowSkeleton && <Skeleton className="h-20 w-full mt-4" />}
                        </Card>
                      </motion.div>

                      {/* FX Insight Card */}
                      {v4Phase === "results" && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          <Card className="p-6 border-primary/30 bg-primary/5">
                            <div className="flex items-start gap-3">
                              <TrendingUp className="h-5 w-5 text-primary mt-1" />
                              <div>
                                <h4 className="font-medium mb-1">FX Variance Detected</h4>
                                <p className="text-sm text-muted-foreground">
                                  +1.2% cost variance compared to last month. Consider locking rates for next batch.
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )}

                    </motion.div>

                    {/* Gelo Panel - 50% right */}
                    <motion.div
                      key="gelo-right"
                      initial={{ width: "100%" }}
                      animate={{ width: "50%" }}
                      exit={{ width: "100%" }}
                      transition={{ 
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="h-full flex flex-col items-start relative overflow-hidden"
                    >
                      {v4GeloCompact ? (
                        // Compact Header State with Contextual Content
                        <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
                          {/* Compact Header */}
                            <div className="flex-shrink-0 mb-6 flex justify-center">
                              <div className="scale-75">
                                <AudioWaveVisualizer isActive={false} />
                              </div>
                            </div>

                          {/* Chat Bubble */}
                          <div className="flex-shrink-0 mb-6 bg-card border border-border rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {v4Message}
                            </p>
                          </div>

                          {/* Contextual Content Area */}
                          <div className="flex-1 space-y-4 min-h-0">
                            {/* Audit Timeline - Collapsible */}
                            {v4Phase === "audit" && (
                              <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ 
                                  delay: 0.5,
                                  duration: 0.6,
                                  ease: [0.4, 0, 0.2, 1]
                                }}
                              >
                                <Collapsible 
                                  open={v4AuditExpanded} 
                                  onOpenChange={setV4AuditExpanded}
                                >
                                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                                    <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-sm">Audit Timeline</h3>
                                      </div>
                                      <ChevronDown className={`w-4 h-4 transition-transform ${v4AuditExpanded ? 'rotate-180' : ''}`} />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="p-4 pt-0">
                                        <Timeline 
                                          events={[
                                            {
                                              id: "1",
                                              type: "payroll",
                                              status: "success",
                                              title: "Payroll Initiated",
                                              description: "3 countries, €42,150 total",
                                              timestamp: new Date(Date.now() - 300000),
                                              actor: "genie",
                                              actorName: "Gelo"
                                            },
                                            {
                                              id: "2",
                                              type: "compliance",
                                              status: "success",
                                              title: "Compliance Checks",
                                              description: "All regions verified",
                                              timestamp: new Date(Date.now() - 240000),
                                              actor: "system",
                                              actorName: "System"
                                            },
                                            {
                                              id: "3",
                                              type: "approval",
                                              status: "pending",
                                              title: "CFO Approval Pending",
                                              description: "Sent to Howard for review",
                                              timestamp: new Date(),
                                              actor: "genie",
                                              actorName: "Gelo"
                                            }
                                          ]}
                                          showFilters={false}
                                          maxHeight="400px"
                                        />
                                      </div>
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              </motion.div>
                            )}

                            {/* Action Buttons */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="flex gap-3 flex-wrap"
                            >
                              {v4Phase === "results" && (
                                <>
                                  <Button 
                                    onClick={sendV4ForApproval}
                                    size="lg"
                                    className="min-w-[200px] bg-gradient-to-r from-primary to-secondary"
                                  >
                                    Send for CFO Approval
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                      setV4Phase("idle");
                                      setV4Message("Ready for the next payroll run!");
                                      setV4GeloCompact(false);
                                      speak("Ready for the next payroll run!");
                                    }}
                                    className="min-w-[200px]"
                                  >
                                    Start Over
                                  </Button>
                                </>
                              )}

                              {v4Phase === "audit" && (
                                <Button 
                                  onClick={completeV4Flow} 
                                  size="lg"
                                  className="min-w-[200px]"
                                >
                                  Complete & Archive
                                </Button>
                              )}
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        // Full Centered State
                        <>
                          <div className="w-full h-full flex items-center justify-center relative z-10 px-8">
                            <div className="text-center space-y-4">
                              <AudioWaveVisualizer isActive={false} />
                              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                {v4Message.split(' ').map((word, index) => (
                                  <span
                                    key={index}
                                    className={`transition-colors duration-150 ${
                                      index === currentWordIndex - 1
                                        ? 'text-foreground font-semibold'
                                        : index < currentWordIndex - 1
                                        ? 'text-foreground/70 font-medium'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {word}{index < v4Message.split(' ').length - 1 ? ' ' : ''}
                                  </span>
                                ))}
                              </p>
                            </div>
                          </div>

                          {v4Phase === "results" && (
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="mt-8 flex gap-3 flex-wrap justify-center"
                            >
                              <Button 
                                onClick={sendV4ForApproval}
                                className="min-w-[200px] bg-gradient-to-r from-primary to-secondary"
                              >
                                Send for CFO Approval
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setV4Phase("idle");
                                  setV4Message("Ready for the next payroll run!");
                                  setV4GeloCompact(false);
                                  speak("Ready for the next payroll run!");
                                }}
                                className="min-w-[200px]"
                              >
                                Start Over
                              </Button>
                            </motion.div>
                          )}
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </main>
          </div>
        ) : version === "v3" ? (
          // V3 Layout: Agent-first with toggleable dashboard drawer
          <>
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar 
                userName={`${userData.firstName} ${userData.lastName}`}
                version={version}
                onVersionChange={(v) => setVersion(v)}
                isDrawerOpen={isDrawerOpen}
                onDrawerToggle={toggleDrawer}
              />
              
              <main className="flex-1 flex overflow-hidden">
                {/* Dashboard Drawer */}
                <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />
                
                {/* Agent Main Area */}
                <AnimatePresence mode="wait">
                  {isTransitioning ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-center p-8"
                    >
                      <div className="max-w-2xl w-full space-y-8">
                        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </motion.div>
                  ) : (
                    <AgentMain 
                      key="agent"
                      userData={userData} 
                      isDrawerOpen={isDrawerOpen} 
                    />
                  )}
                </AnimatePresence>
              </main>
            </div>
          </>
        ) : (
          // V1 & V2 Layout (existing)
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar 
              userName={`${userData.firstName} ${userData.lastName}`}
              version={version}
              onVersionChange={(v) => setVersion(v)}
              isAgentOpen={isAgentOpen}
              onAgentToggle={() => setIsAgentOpen(!isAgentOpen)}
            />

            <main className="flex-1 p-6 overflow-y-auto">
              <WidgetGrid userData={userData} />
            </main>
          </div>
        )}

        {/* V2: Agent Panel on RIGHT (50% width, pushes dashboard) */}
        {version === "v2" && isV2AgentOpen && (
          <div className="w-[50%] border-l border-border flex-shrink-0">
            <AgentDrawer
              isOpen={isV2AgentOpen}
              onClose={() => setIsAgentOpen(false)}
              userData={userData}
              chatHistory={onboardingHistory}
            />
          </div>
        )}
      </div>
    </RoleLensProvider>
  );
};

export default Dashboard;
