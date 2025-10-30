import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Eye, Bell } from "lucide-react";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { PayrollMetricsPanel } from "@/components/payroll/PayrollMetricsPanel";
import { PayrollIssueCard } from "@/components/payroll/PayrollIssueCard";
import { PayrollChecklistItemComponent } from "@/components/payroll/PayrollChecklistItem";
import { usePayrollSync } from "@/hooks/usePayrollSync";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useNavigate } from "react-router-dom";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import ProgressBar from "@/components/ProgressBar";

const AdminPayrollDashboard = () => {
  const navigate = useNavigate();
  const { contractors, issues, addIssue, resolveIssue, updateChecklistItem, getContractorStatus } = usePayrollSync();
  const [isKurtMuted, setIsKurtMuted] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);

  // Demo contractor ID
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
          { id: "contract_signed", label: "Signed Contract", status: "complete" },
          { id: "compliance_docs", label: "Compliance Documents", status: "waiting" },
          { id: "payroll_setup", label: "Payroll Setup", status: "pending" },
          { id: "first_payment", label: "First Payment", status: "pending" },
          { id: "certification", label: "Certification Complete", status: "pending" },
        ],
        progress: 20,
        issues: [],
      });
    }
  }, [contractor, contractorId]);

  // Demo: Simulate issues
  const simulateIssue = () => {
    const issueTypes = [
      {
        type: 'fx_failure' as const,
        severity: 'red' as const,
        description: "Maria's payout didn't clear. Retry or check today's rate?",
      },
      {
        type: 'missing_doc' as const,
        severity: 'yellow' as const,
        description: "Maria's tax form is missing. Send reminder?",
      },
      {
        type: 'policy_violation' as const,
        severity: 'blue' as const,
        description: "FX adjustment > 2.5%. Adjust automatically?",
      },
    ];

    const randomIssue = issueTypes[Math.floor(Math.random() * issueTypes.length)];
    addIssue({
      contractorId,
      contractorName: "Maria Santos",
      resolved: false,
      ...randomIssue,
    });

    toast.info("New payroll issue detected", {
      description: randomIssue.description,
    });
  };

  // Demo: Progress checklist item
  const progressChecklistItem = () => {
    if (!contractor) return;

    const nextPendingItem = contractor.checklist.find(item => item.status === 'pending');
    if (nextPendingItem) {
      updateChecklistItem(contractorId, nextPendingItem.id, 'complete', "✅ Verified by Fronted");
      
      // Emit event for candidate dashboard
      window.dispatchEvent(new CustomEvent('admin-payroll-update', {
        detail: {
          contractorId,
          itemId: nextPendingItem.id,
          status: 'complete',
          kurtMessage: "✅ Verified by Fronted",
        },
      }));

      toast.success("Checklist item updated", {
        description: `${nextPendingItem.label} marked as complete`,
      });
    }
  };

  const activeIssues = issues.filter(i => !i.resolved);
  const payrollIssuesCount = activeIssues.filter(i => i.type === 'fx_failure').length;
  const complianceGapsCount = activeIssues.filter(i => i.type === 'missing_doc').length;

  const suggestionChips = [
    {
      label: "Track Progress",
      action: () => toast.info("Opening progress tracker..."),
    },
    {
      label: "Resend Link",
      action: () => toast.success("Magic link resent to candidate"),
    },
    {
      label: "Resolve Issue",
      action: () => {
        if (activeIssues.length > 0) {
          resolveIssue(activeIssues[0].id);
        }
      },
    },
    {
      label: "View History",
      action: () => toast.info("Opening timeline..."),
    },
  ];

  return (
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName="Admin" />

          <div className="flex-1">
            <AgentLayout context="Admin Payroll Dashboard">
              <main className="flex-1 bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
                <div className="max-w-7xl mx-auto p-8 pb-32 space-y-8">
                  {/* Back Button */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Pipeline
                    </Button>

                    {/* Demo Controls */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={simulateIssue}
                        className="gap-2"
                      >
                        <Bell className="h-4 w-4" />
                        Simulate Issue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={progressChecklistItem}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Progress Item
                      </Button>
                    </div>
                  </div>

                  {/* Agent Header */}
                  <AgentHeader
                    title="Certified & Payroll Ready"
                    subtitle="Monitor payroll certification and resolve any issues."
                    showPulse={true}
                    isActive={activeIssues.length > 0}
                    isMuted={isKurtMuted}
                    onMuteToggle={() => setIsKurtMuted(!isKurtMuted)}
                    tags={<AgentSuggestionChips chips={suggestionChips} />}
                  />

                  {/* Metrics Panel */}
                  <PayrollMetricsPanel
                    payrollIssues={payrollIssuesCount}
                    complianceGaps={complianceGapsCount}
                    avgResolutionTime="3m 42s"
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Issues Column */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Active Issues</h3>
                      {activeIssues.length === 0 ? (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <p className="text-sm text-muted-foreground">No active issues</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {activeIssues.map((issue) => (
                            <PayrollIssueCard
                              key={issue.id}
                              issue={issue}
                              onResolve={resolveIssue}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contractor Status Column */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contractor Progress</h3>
                      {contractor ? (
                        <Card>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{contractor.flag}</span>
                                <div>
                                  <h4 className="font-semibold">{contractor.name}</h4>
                                  <p className="text-sm text-muted-foreground">{contractor.country}</p>
                                </div>
                              </div>
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                {contractor.progress}%
                              </Badge>
                            </div>

                            <ProgressBar
                              currentStep={contractor.checklist.filter(i => i.status === 'complete').length}
                              totalSteps={contractor.checklist.length}
                            />

                            <div className="space-y-2">
                              {contractor.checklist.map((item, index) => (
                                <PayrollChecklistItemComponent
                                  key={item.id}
                                  item={item}
                                  index={index}
                                />
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/flows/candidate-payroll-dashboard')}
                              className="w-full gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Candidate Dashboard
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <p className="text-sm text-muted-foreground">No contractors in this stage</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
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

export default AdminPayrollDashboard;
