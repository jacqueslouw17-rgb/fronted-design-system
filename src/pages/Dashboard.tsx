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
import { CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KurtAvatar from "@/components/KurtAvatar";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";

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
  const [version, setVersion] = useState<"v1" | "v2" | "v3" | "v4">("v3");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // V4 Payroll Demo State
  type Phase = "idle" | "processing" | "results" | "audit";
  const [v4Phase, setV4Phase] = useState<Phase>("idle");
  const [v4Message, setV4Message] = useState("Welcome! I'm ready to help you run October payroll.");
  const [v4IsProcessing, setV4IsProcessing] = useState(false);
  const [v4PayrollData, setV4PayrollData] = useState<any[]>([]);
  const [v4ShowSkeleton, setV4ShowSkeleton] = useState(false);
  const [v4ComplianceScore, setV4ComplianceScore] = useState(0);
  const [v4ShowAuditDrawer, setV4ShowAuditDrawer] = useState(false);
  const { speak, currentWordIndex } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();
  
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
    
    setTimeout(() => {
      setV4Phase("processing");
      setV4ShowSkeleton(true);
    }, 1200);

    setTimeout(() => {
      setV4PayrollData([
        { country: "PH", flag: "🇵🇭", currency: "PHP", total: "₱5.3 M", fxRate: "62.1", fee: "€42", eta: "2 d", status: "processing" },
      ]);
    }, 2000);

    setTimeout(() => {
      setV4PayrollData(prev => [...prev,
        { country: "NO", flag: "🇳🇴", currency: "NOK", total: "190 K", fxRate: "11.4", fee: "€30", eta: "1 d", status: "processing" },
      ]);
    }, 2600);

    setTimeout(() => {
      setV4PayrollData(prev => [...prev,
        { country: "PL", flag: "🇵🇱", currency: "PLN", total: "420 K", fxRate: "4.3", fee: "€28", eta: "1 d", status: "processing" },
      ]);
    }, 3200);

    setTimeout(() => {
      setV4ShowSkeleton(false);
      setV4Phase("results");
      setV4PayrollData(prev => prev.map(row => ({ ...row, status: "complete" })));
      setV4ComplianceScore(96);
      
      const msg2 = "Payroll batch completed. Would you like to send for CFO approval?";
      setV4Message(msg2);
      speak(msg2);
      setV4IsProcessing(false);

      toast({
        title: "✅ Processing Complete",
        description: "3 currency batches processed successfully",
      });
    }, 4500);
  };

  const sendV4ForApproval = () => {
    const msg = "Sent to Howard. You can track status in Audit Panel.";
    setV4Message(msg);
    speak(msg);
    
    toast({
      title: "📤 Sent for Approval",
      description: "Howard (CFO) will review the batch",
    });

    setTimeout(() => {
      setV4Phase("audit");
      setV4ShowAuditDrawer(true);
    }, 1000);
  };

  const completeV4Flow = () => {
    setV4ShowAuditDrawer(false);
    
    setTimeout(() => {
      setV4Phase("idle");
      const msg = "Payroll run completed. CFO approved. Compliance 96%. All reports archived under /finance/oct-2025.";
      setV4Message(msg);
      speak(msg);

      toast({
        title: "✅ All Complete",
        description: "Payroll archived and documented",
      });
      
      // Reset state
      setV4PayrollData([]);
      setV4ComplianceScore(0);
    }, 300);
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
                    exit={{ width: "60%" }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="h-full flex flex-col items-center justify-center relative overflow-hidden"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
                      style={{ background: 'var(--gradient-primary)' }}
                    />
                    
                    <div className="relative z-10">
                      <KurtAvatar 
                        isListening={false}
                        message={v4Message}
                        name="Gelo"
                        currentWordIndex={currentWordIndex}
                      />
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
                    {/* Dashboard Panel - 40% left */}
                    <motion.div
                      key="dashboard-left"
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="w-[40%] h-full overflow-y-auto p-8 space-y-6 border-r border-border"
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
                              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
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
                                  className="grid grid-cols-7 gap-2 text-sm py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{row.flag}</span>
                                    <span className="font-medium">{row.country}</span>
                                  </div>
                                  <div>{row.currency}</div>
                                  <div className="font-medium">{row.total}</div>
                                  <div>{row.fxRate}</div>
                                  <div>{row.fee}</div>
                                  <div>{row.eta}</div>
                                  <div>
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

                      {/* Audit Drawer */}
                      <AnimatePresence>
                        {v4ShowAuditDrawer && (
                          <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-96 bg-card border-r shadow-2xl z-50 overflow-y-auto"
                          >
                            <div className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Audit Timeline</h3>
                              <div className="space-y-4">
                                {[
                                  { artifact: "PayoutBatch#2025-10", desc: "Sent to Wise PLN/PHP", time: "09:41" },
                                  { artifact: "FXSnapshot", desc: "Mid-market + 0.8% margin", time: "09:42" },
                                  { artifact: "ComplianceReceipt", desc: "PH Module v1.2.3 ok", time: "09:44" },
                                ].map((item, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.08 * idx, duration: 0.2 }}
                                    className="p-4 rounded-lg bg-muted/50 border"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <p className="font-medium text-sm">{item.artifact}</p>
                                      <span className="text-xs text-muted-foreground">{item.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                  </motion.div>
                                ))}
                              </div>

                              <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <p className="text-sm">
                                  All receipts stored. Would you like to generate the CFO report?
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Gelo Panel - 60% right */}
                    <motion.div
                      key="gelo-right"
                      initial={{ width: "100%" }}
                      animate={{ width: "60%" }}
                      exit={{ width: "100%" }}
                      transition={{ duration: 0.24, ease: "easeIn" }}
                      className="h-full flex flex-col items-center justify-center relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.15, 0.1],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
                        style={{ background: 'var(--gradient-primary)' }}
                      />

                      <div className="relative z-10 px-8">
                        <KurtAvatar 
                          isListening={false}
                          message={v4Message}
                          name="Gelo"
                          currentWordIndex={currentWordIndex}
                          isProcessing={v4IsProcessing}
                        />

                        {v4Phase === "results" && (
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 space-y-3"
                          >
                            <Button 
                              onClick={sendV4ForApproval}
                              className="w-full bg-gradient-to-r from-primary to-secondary"
                            >
                              Send for CFO Approval
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setV4Phase("idle")}
                              className="w-full"
                            >
                              Cancel
                            </Button>
                          </motion.div>
                        )}

                        {v4Phase === "audit" && (
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8"
                          >
                            <Button 
                              onClick={completeV4Flow}
                              className="w-full bg-gradient-to-r from-primary to-secondary"
                            >
                              Complete & Archive
                            </Button>
                          </motion.div>
                        )}
                      </div>
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
