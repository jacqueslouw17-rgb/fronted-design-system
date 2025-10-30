import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, ArrowLeft } from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { PayrollChecklistItemComponent } from "@/components/payroll/PayrollChecklistItem";
import { usePayrollSync } from "@/hooks/usePayrollSync";
import ProgressBar from "@/components/ProgressBar";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";

const CandidatePayrollDashboard = () => {
  const navigate = useNavigate();
  const { contractors, getContractorStatus } = usePayrollSync();
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Demo: using first contractor (in production this would be from session)
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

  // Check for completion
  useEffect(() => {
    if (contractor && contractor.progress === 100 && !showCompletion) {
      setShowCompletion(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("🎉 Congratulations! You're fully onboarded and payroll ready.");
    }
  }, [contractor, showCompletion]);

  // Listen for admin updates (simulate real-time)
  useEffect(() => {
    // In production, this would be a WebSocket or Supabase real-time subscription
    const handleAdminUpdate = (event: CustomEvent) => {
      const { contractorId: updatedId, itemId, status, kurtMessage } = event.detail;
      if (updatedId === contractorId) {
        const { updateChecklistItem } = usePayrollSync.getState();
        updateChecklistItem(contractorId, itemId, status, kurtMessage);
        
        // Show toast notification
        if (kurtMessage) {
          toast.info(kurtMessage);
        }
      }
    };

    window.addEventListener('admin-payroll-update' as any, handleAdminUpdate);
    return () => window.removeEventListener('admin-payroll-update' as any, handleAdminUpdate);
  }, [contractorId]);

  if (!contractor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      label: "Ask About Payroll",
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
          <Topbar userName={contractor.name} />

          <div className="flex-1">
            <AgentLayout context="Candidate Payroll Dashboard">
              <main className="flex-1 bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
                <div className="max-w-4xl mx-auto p-8 pb-32 space-y-8">
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  {/* Agent Header */}
                  <AgentHeader
                    title={`Hi ${contractor.name.split(' ')[0]}, welcome to your payroll setup! 👋`}
                    subtitle="Complete the steps below to get payroll ready."
                    showPulse={true}
                    isActive={false}
                    isMuted={isKurtMuted}
                    onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                    tags={<AgentSuggestionChips chips={suggestionChips} />}
                    tagsLabel="Quick actions:"
                  />

                  {/* Progress Section */}
                  {!showCompletion && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Payroll Certification Progress</h2>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {contractor.progress}% Complete
                        </Badge>
                      </div>
                      <ProgressBar 
                        currentStep={contractor.checklist.filter(i => i.status === 'complete').length} 
                        totalSteps={contractor.checklist.length} 
                      />
                    </div>
                  )}

                  {/* Checklist or Completion Message */}
                  <AnimatePresence mode="wait">
                    {showCompletion ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="p-8 text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-block mb-4"
                          >
                            <div className="p-4 rounded-full bg-green-500/20">
                              <FileCheck className="h-12 w-12 text-green-600" />
                            </div>
                          </motion.div>
                          <h3 className="text-2xl font-bold mb-2">
                            🎉 Congratulations, {contractor.name.split(' ')[0]}!
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            You're fully onboarded and payroll ready. Next pay: Nov 15.
                          </p>
                          <Button onClick={() => navigate('/flows/candidate-dashboard')}>
                            Go to Dashboard
                          </Button>
                        </Card>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {contractor.checklist.map((item, index) => (
                          <PayrollChecklistItemComponent
                            key={item.id}
                            item={item}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CandidatePayrollDashboard;
