import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import KurtAvatar from "@/components/KurtAvatar";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type Phase = "focus" | "split" | "context" | "drawer" | "return";

interface PayrollRow {
  country: string;
  flag: string;
  currency: string;
  total: string;
  fxRate: string;
  fee: string;
  eta: string;
  status?: "processing" | "complete";
}

const PayrollUseCaseDemo = () => {
  const [phase, setPhase] = useState<Phase>("focus");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollRow[]>([]);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [complianceScore, setComplianceScore] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [inlineEditRow, setInlineEditRow] = useState<number | null>(null);
  
  const { speak, currentWordIndex } = useTextToSpeech({ lang: 'en-US', voiceName: 'norwegian', pitch: 1.1 });
  const { toast } = useToast();

  // Phase 1: Initial message
  useEffect(() => {
    const msg = "Welcome! I'm ready to help you run October payroll.";
    setMessage(msg);
    speak(msg);
  }, []);

  const startPayroll = async () => {
    // Phase 1 → Phase 2 transition
    const msg1 = "On it. Loading payroll batch #2025-10.";
    setMessage(msg1);
    speak(msg1);
    setIsProcessing(true);
    
    // Start split transition after 1200ms
    setTimeout(() => {
      setPhase("split");
      setShowSkeleton(true);
    }, 1200);

    // Load payroll data with staggered timing (longer delays)
    setTimeout(() => {
      setPayrollData([
        { country: "PH", flag: "🇵🇭", currency: "PHP", total: "₱5.3 M", fxRate: "62.1", fee: "€42", eta: "2 d", status: "processing" },
      ]);
    }, 2000);

    setTimeout(() => {
      setPayrollData(prev => [...prev,
        { country: "NO", flag: "🇳🇴", currency: "NOK", total: "190 K", fxRate: "11.4", fee: "€30", eta: "1 d", status: "processing" },
      ]);
    }, 2600);

    setTimeout(() => {
      setPayrollData(prev => [...prev,
        { country: "PL", flag: "🇵🇱", currency: "PLN", total: "420 K", fxRate: "4.3", fee: "€28", eta: "1 d", status: "processing" },
      ]);
    }, 3200);

    // Phase 3: Results visible (extended to 4500ms)
    setTimeout(() => {
      setShowSkeleton(false);
      setPhase("context");
      setPayrollData(prev => prev.map(row => ({ ...row, status: "complete" as const })));
      setComplianceScore(96);
      
      const msg2 = "Payroll batch completed. Would you like to send for CFO approval?";
      setMessage(msg2);
      speak(msg2);
      setIsProcessing(false);

      toast({
        title: "✅ Processing Complete",
        description: "3 currency batches processed successfully",
      });
    }, 4500);
  };

  const sendForApproval = () => {
    const msg = "Sent to Howard. You can track status in Audit Panel.";
    setMessage(msg);
    speak(msg);
    
    toast({
      title: "📤 Sent for Approval",
      description: "Howard (CFO) will review the batch",
    });

    // Phase 4: Open drawer after 1 second
    setTimeout(() => {
      setPhase("drawer");
      setShowDrawer(true);
    }, 1000);
  };

  const completeFlow = () => {
    setShowDrawer(false);
    
    setTimeout(() => {
      setPhase("return");
      const msg = "Payroll run completed. CFO approved. Compliance 96%. All reports archived under /finance/oct-2025.";
      setMessage(msg);
      speak(msg);

      toast({
        title: "✅ All Complete",
        description: "Payroll archived and documented",
      });
    }, 300);
  };

  const handleInlineEdit = (index: number, action: "accept" | "decline" | "recalc") => {
    if (action === "accept") {
      toast({
        title: "✅ Update Logged",
        description: "Changes saved to AuditLedger",
      });
    }
    setInlineEditRow(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Link */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex min-h-screen w-full relative overflow-hidden">
        {/* Phase 1 & 6: Full-width Genie (Focus & Return) */}
        <AnimatePresence>
          {(phase === "focus" || phase === "return") && (
            <motion.div
              initial={{ width: "40%" }}
              animate={{ width: "100%" }}
              exit={{ width: "40%" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="h-screen flex flex-col items-center justify-center relative"
            >
              {/* Gradient background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
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
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.08, 0.12, 0.08],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl"
                  style={{ background: 'var(--gradient-secondary)' }}
                />
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
                <KurtAvatar 
                  isListening={false}
                  message={message}
                  name="Gelo"
                  currentWordIndex={currentWordIndex}
                  isProcessing={phase === "focus" && isProcessing}
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 z-10"
              >
                {phase === "focus" && !isProcessing && (
                  <Button 
                    size="lg"
                    onClick={startPayroll}
                    className="px-8 bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    Run October Payroll
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phases 2-5: Split View (Agent + Dashboard) */}
        <AnimatePresence>
          {(phase === "split" || phase === "context" || phase === "drawer") && (
            <>
              {/* Agent Panel - 40% */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "40%" }}
                exit={{ width: "100%" }}
                transition={{ duration: 0.24, ease: "easeIn" }}
                className="h-screen flex flex-col items-center justify-center relative border-r border-border"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
                </div>

                <div className="relative z-10 px-8">
                  <KurtAvatar 
                    isListening={false}
                    message={message}
                    name="Gelo"
                    currentWordIndex={currentWordIndex}
                    isProcessing={isProcessing}
                  />

                  {phase === "context" && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 space-y-3"
                    >
                      <Button 
                        onClick={sendForApproval}
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                      >
                        Send for CFO Approval
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setPhase("focus")}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  )}

                  {phase === "drawer" && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8"
                    >
                      <Button 
                        onClick={completeFlow}
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                      >
                        Complete & Archive
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Dashboard Panel - 60% */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="flex-1 h-screen overflow-y-auto p-8 space-y-6"
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

                    {showSkeleton ? (
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
                        {payrollData.map((row, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + idx * 0.08, duration: 0.15, ease: "easeOut" }}
                            className={`grid grid-cols-7 gap-2 text-sm py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors ${
                              inlineEditRow === idx ? "bg-primary/10 ring-2 ring-primary/30" : ""
                            }`}
                            onClick={() => phase === "drawer" && setInlineEditRow(idx)}
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

                        {/* Inline Edit Popup */}
                        <AnimatePresence>
                          {inlineEditRow !== null && (
                            <motion.div
                              initial={{ y: -10, opacity: 0, scale: 0.95 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              exit={{ y: -10, opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="flex gap-2 mt-2 p-3 bg-card border rounded-lg shadow-lg"
                            >
                              <Button size="sm" variant="default" onClick={() => handleInlineEdit(inlineEditRow, "accept")}>
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleInlineEdit(inlineEditRow, "decline")}>
                                Decline
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleInlineEdit(inlineEditRow, "recalc")}>
                                Request Recalc
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                      {phase !== "split" && complianceScore > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, duration: 0.2, type: "spring" }}
                        >
                          <Badge className="text-lg px-4 py-1">
                            <motion.span
                              animate={{ 
                                textShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 8px rgba(59,130,246,0.6)", "0 0 0px rgba(59,130,246,0)"]
                              }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                            >
                              {complianceScore}% Compliant
                            </motion.span>
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    {showSkeleton && <Skeleton className="h-20 w-full mt-4" />}
                  </Card>
                </motion.div>

                {/* FX Insight Card */}
                {phase === "context" && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
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

                {/* Audit Drawer Overlay */}
                <AnimatePresence>
                  {showDrawer && (
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ duration: 0.28, ease: "easeInOut", delay: 0.1 }}
                      className="fixed right-0 top-0 h-full w-96 bg-card border-l shadow-2xl z-50 overflow-y-auto"
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
                              initial={{ x: 20, opacity: 0 }}
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
            </>
          )}
        </AnimatePresence>

        {/* Drawer Backdrop */}
        <AnimatePresence>
          {showDrawer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PayrollUseCaseDemo;
