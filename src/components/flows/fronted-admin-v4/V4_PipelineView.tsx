/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * V4 Pipeline View with "Collect Payroll Details" Column
 * 
 * Detached clone of PipelineView with additional column after "Certified"
 * Only used by Flow 1 v4 Tracker tab
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Send, Settings, FileEdit, FileSignature, Loader2, Plus, Trash2, Award, Sparkles, CreditCard, Mail, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { V4_PayrollDetailsConfigDrawer } from "./V4_PayrollDetailsConfigDrawer";
import { V4_ConfigureCandidateDetailsDrawer, OnboardingConfig } from "./V4_ConfigureCandidateDetailsDrawer";
import { V4_SendCandidateDetailsFormDrawer } from "./V4_SendCandidateDetailsFormDrawer";

// V4-specific contractor type with payroll details status
interface V4_Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: V4_ContractorStatus;
  formSent?: boolean;
  dataReceived?: boolean;
  employmentType?: "contractor" | "employee";
  email?: string;
  hasATSData?: boolean;
  checklistProgress?: number;
  payrollDetailsStatus?: "not-sent" | "sent" | "in-progress" | "completed";
  payrollFormConfig?: any;
  onboardingConfig?: OnboardingConfig;
  onboardingFormSent?: boolean;
}

type V4_ContractorStatus = 
  | "offer-accepted" 
  | "data-pending" 
  | "drafting" 
  | "awaiting-signature" 
  | "trigger-onboarding" 
  | "onboarding-pending" 
  | "CERTIFIED"
  | "collect-payroll-details";

interface V4_PipelineViewProps {
  contractors: V4_Contractor[];
  className?: string;
  onContractorUpdate?: (contractors: V4_Contractor[]) => void;
  onDraftContract?: (contractorIds: string[]) => void;
  onSignatureComplete?: () => void;
  onAddCandidate?: () => void;
  onRemoveContractor?: (contractorId: string) => void;
}

const V4_STATUS_CONFIG = {
  "offer-accepted": {
    label: "Offer Accepted",
    color: "bg-muted/50 border-border",
    tooltip: "Candidate has accepted the offer"
  },
  "data-pending": {
    label: "Collect Details",
    color: "bg-accent-yellow-fill/30 border-accent-yellow-outline/20",
    tooltip: "Send form to collect info"
  },
  "drafting": {
    label: "Prepare Contract",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    tooltip: "Review and confirm terms"
  },
  "awaiting-signature": {
    label: "Waiting for Signature",
    color: "bg-accent-purple-fill/30 border-accent-purple-outline/20",
    tooltip: "Contract sent — awaiting review"
  },
  "trigger-onboarding": {
    label: "Onboard Candidate",
    color: "bg-primary/10 border-primary/20",
    tooltip: "Start onboarding process"
  },
  "onboarding-pending": {
    label: "Track Progress",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    tooltip: "Monitor completion status"
  },
  "CERTIFIED": {
    label: "Certified",
    color: "bg-accent-green-fill/30 border-accent-green-outline/20",
    tooltip: "Contracts & compliance completed ✅"
  },
  "collect-payroll-details": {
    label: "Collect Payroll Details",
    color: "bg-violet-100/50 dark:bg-violet-950/50 border-violet-500/20",
    tooltip: "Get bank and payout details"
  },
};

const V4_COLUMNS: readonly V4_ContractorStatus[] = [
  "offer-accepted", "data-pending", "drafting", "awaiting-signature",
  "trigger-onboarding", "onboarding-pending", "CERTIFIED", "collect-payroll-details",
];

const PAYROLL_STATUS_CONFIG = {
  "not-sent": { label: "Not sent", color: "bg-muted text-muted-foreground" },
  "sent": { label: "Sent", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "in-progress": { label: "In progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  "completed": { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

export const V4_PipelineView: React.FC<V4_PipelineViewProps> = ({
  contractors: initialContractors,
  className,
  onContractorUpdate,
  onAddCandidate,
  onRemoveContractor
}) => {
  const [contractors, setContractors] = useState<V4_Contractor[]>(initialContractors);
  const [sendingFormIds, setSendingFormIds] = useState<Set<string>>(new Set());
  const [payrollConfigDrawerOpen, setPayrollConfigDrawerOpen] = useState(false);
  const [selectedForPayrollConfig, setSelectedForPayrollConfig] = useState<V4_Contractor | null>(null);
  // V4 Candidate Details Drawers
  const [candidateConfigDrawerOpen, setCandidateConfigDrawerOpen] = useState(false);
  const [candidateSendFormDrawerOpen, setCandidateSendFormDrawerOpen] = useState(false);
  const [selectedForCandidateConfig, setSelectedForCandidateConfig] = useState<V4_Contractor | null>(null);
  const notifiedCertifiedIds = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    setContractors(initialContractors.map(c => ({
      ...c,
      payrollDetailsStatus: c.payrollDetailsStatus || "not-sent"
    })));
  }, [initialContractors]);

  // Auto-transition onboarding-pending to certified
  useEffect(() => {
    const onboardingContractors = contractors.filter(
      c => c.status === "onboarding-pending" && !notifiedCertifiedIds.current.has(c.id)
    );
    if (onboardingContractors.length === 0) return;
    
    const timers = onboardingContractors.map(contractor => {
      return setTimeout(() => {
        setContractors(prev => {
          const updated = prev.map(c => 
            c.id === contractor.id ? { ...c, status: "CERTIFIED" as const } : c
          );
          onContractorUpdate?.(updated);
          return updated;
        });
        notifiedCertifiedIds.current.add(contractor.id);
        toast.success(`${contractor.name} is certified`);
      }, 5000);
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [contractors, onContractorUpdate]);

  const getContractorsByStatus = (status: V4_ContractorStatus) => 
    contractors.filter(c => c.status === status);

  // Candidate Details Config handlers
  const handleConfigureCandidateForm = (contractor: V4_Contractor) => {
    setSelectedForCandidateConfig(contractor);
    setCandidateConfigDrawerOpen(true);
  };

  const handleOpenSendCandidateForm = (contractor: V4_Contractor) => {
    setSelectedForCandidateConfig(contractor);
    setCandidateSendFormDrawerOpen(true);
  };

  const handleSaveCandidateConfig = (candidateId: string, config: OnboardingConfig) => {
    setContractors(prev => {
      const updated = prev.map(c => c.id === candidateId ? { ...c, onboardingConfig: config } : c);
      onContractorUpdate?.(updated);
      return updated;
    });
  };

  const handleSendCandidateForm = (candidateId: string) => {
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === candidateId ? { ...c, status: "data-pending" as const, formSent: true, onboardingFormSent: true } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
  };

  const handleSendForm = (contractor: V4_Contractor) => {
    setSendingFormIds(prev => new Set([...prev, contractor.id]));
    setTimeout(() => {
      setContractors(prev => {
        const updated = prev.map(c => 
          c.id === contractor.id ? { ...c, status: "data-pending" as const, formSent: true } : c
        );
        onContractorUpdate?.(updated);
        return updated;
      });
      setSendingFormIds(new Set());
      toast.success(`Form sent to ${contractor.name}`);
    }, 1000);
  };

  const handleMarkReceived = (contractor: V4_Contractor) => {
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === contractor.id ? { ...c, status: "drafting" as const, dataReceived: true } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
    toast.success(`Data received from ${contractor.name}`);
  };

  const handleDraftContract = (contractor: V4_Contractor) => {
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === contractor.id ? { ...c, status: "awaiting-signature" as const } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
    toast.success(`Contract sent for signature`);
  };

  const handleSignatureComplete = (contractor: V4_Contractor) => {
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === contractor.id ? { ...c, status: "trigger-onboarding" as const } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
    toast.success(`${contractor.name} signed the contract`);
  };

  const handleStartOnboarding = (contractor: V4_Contractor) => {
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === contractor.id ? { ...c, status: "onboarding-pending" as const, checklistProgress: 0 } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
    toast.success(`Onboarding started for ${contractor.name}`);
  };

  const handleMoveToPayrollDetails = (contractor: V4_Contractor) => {
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === contractor.id ? { ...c, status: "collect-payroll-details" as const, payrollDetailsStatus: "not-sent" as const } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
    toast.success(`${contractor.name} moved to Collect Payroll Details`);
  };

  const handleConfigurePayrollForm = (contractor: V4_Contractor) => {
    setSelectedForPayrollConfig(contractor);
    setPayrollConfigDrawerOpen(true);
  };

  const handleSendPayrollForm = (contractor: V4_Contractor) => {
    const isResend = contractor.payrollDetailsStatus === "sent" || contractor.payrollDetailsStatus === "in-progress";
    setContractors(prev => {
      const updated = prev.map(c => 
        c.id === contractor.id ? { ...c, payrollDetailsStatus: "sent" as const } : c
      );
      onContractorUpdate?.(updated);
      return updated;
    });
    toast.success(isResend ? `Payroll form resent to ${contractor.name}` : `Payroll form sent to ${contractor.name}`);
  };

  const handleSavePayrollConfig = (candidateId: string, config: any) => {
    setContractors(prev => {
      const updated = prev.map(c => c.id === candidateId ? { ...c, payrollFormConfig: config } : c);
      onContractorUpdate?.(updated);
      return updated;
    });
  };

  const handleRemoveContractor = (contractorId: string) => {
    setContractors(prev => prev.filter(c => c.id !== contractorId));
    onRemoveContractor?.(contractorId);
  };

  const renderCard = (contractor: V4_Contractor) => {
    const config = V4_STATUS_CONFIG[contractor.status];
    return (
      <motion.div key={contractor.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
        <Card className={cn("border transition-all duration-200 hover:shadow-md", config.color)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {contractor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{contractor.name}</p>
                  <p className="text-xs text-muted-foreground">{contractor.role}</p>
                </div>
              </div>
              <span className="text-xl">{contractor.countryFlag}</span>
            </div>
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="font-medium">{contractor.country}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span><span className="font-medium">{contractor.salary}</span></div>
              {contractor.employmentType && <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline" className="text-xs capitalize">{contractor.employmentType}</Badge></div>}
            </div>
            {contractor.status === "collect-payroll-details" && (
              <div className="mb-4"><Badge className={cn("text-xs", PAYROLL_STATUS_CONFIG[contractor.payrollDetailsStatus || "not-sent"].color)}>{PAYROLL_STATUS_CONFIG[contractor.payrollDetailsStatus || "not-sent"].label}</Badge></div>
            )}
            {contractor.status === "onboarding-pending" && contractor.checklistProgress !== undefined && (
              <div className="mb-4"><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="font-medium">{contractor.checklistProgress}%</span></div><Progress value={contractor.checklistProgress} className="h-1.5" /></div>
            )}
            <div className="flex gap-2">
              {contractor.status === "offer-accepted" && (<><Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleConfigureCandidateForm(contractor)}><Settings className="h-3 w-3 mr-1" />Configure</Button><Button size="sm" className="flex-1 text-xs" onClick={() => handleOpenSendCandidateForm(contractor)} disabled={sendingFormIds.has(contractor.id)}>{sendingFormIds.has(contractor.id) ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}Send Form</Button></>)}
              {contractor.status === "data-pending" && (
                <div className="w-full space-y-2">
                  <p className="text-xs text-muted-foreground text-center">Awaiting candidate details</p>
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-primary hover:bg-primary/90" 
                    onClick={() => {
                      setSendingFormIds(prev => new Set([...prev, contractor.id]));
                      setTimeout(() => {
                        setSendingFormIds(prev => {
                          const next = new Set(prev);
                          next.delete(contractor.id);
                          return next;
                        });
                        toast.success(`Form resent to ${contractor.name}`);
                      }, 1500);
                    }}
                    disabled={sendingFormIds.has(contractor.id)}
                  >
                    <RotateCcw className={cn("h-3.5 w-3.5 mr-1.5", sendingFormIds.has(contractor.id) && "animate-spin")} />
                    Resend
                  </Button>
                </div>
              )}
              {contractor.status === "drafting" && (<Button size="sm" className="w-full text-xs" onClick={() => handleDraftContract(contractor)}><FileEdit className="h-3 w-3 mr-1" />Send for Signature</Button>)}
              {contractor.status === "awaiting-signature" && (<Button size="sm" className="w-full text-xs" onClick={() => handleSignatureComplete(contractor)}><FileSignature className="h-3 w-3 mr-1" />Mark Signed</Button>)}
              {contractor.status === "trigger-onboarding" && (<Button size="sm" className="w-full text-xs" onClick={() => handleStartOnboarding(contractor)}><Sparkles className="h-3 w-3 mr-1" />Start Onboarding</Button>)}
              {contractor.status === "onboarding-pending" && (<Button size="sm" variant="outline" className="w-full text-xs"><Eye className="h-3 w-3 mr-1" />View Progress</Button>)}
              {contractor.status === "CERTIFIED" && (<><Button size="sm" variant="outline" className="flex-1 text-xs"><Award className="h-3 w-3 mr-1" />Certificate</Button><Button size="sm" className="flex-1 text-xs" onClick={() => handleMoveToPayrollDetails(contractor)}><CreditCard className="h-3 w-3 mr-1" />Payroll Setup</Button></>)}
              {contractor.status === "collect-payroll-details" && (<><Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleConfigurePayrollForm(contractor)}><Settings className="h-3 w-3 mr-1" />Configure</Button><Button size="sm" className="flex-1 text-xs" onClick={() => handleSendPayrollForm(contractor)}>{contractor.payrollDetailsStatus === "sent" || contractor.payrollDetailsStatus === "in-progress" ? <><RotateCcw className="h-3 w-3 mr-1" />Resend</> : <><Mail className="h-3 w-3 mr-1" />Send Form</>}</Button></>)}
            </div>
            {contractor.status === "offer-accepted" && (<Button size="sm" variant="ghost" className="w-full mt-2 text-xs text-muted-foreground hover:text-destructive" onClick={() => handleRemoveContractor(contractor.id)}><Trash2 className="h-3 w-3 mr-1" />Remove</Button>)}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
          {V4_COLUMNS.map(status => {
            const config = V4_STATUS_CONFIG[status];
            const statusContractors = getContractorsByStatus(status);
            return (
              <div key={status} className="flex-shrink-0 w-[280px]">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tooltip><TooltipTrigger><h3 className="text-sm font-semibold">{config.label}</h3></TooltipTrigger><TooltipContent>{config.tooltip}</TooltipContent></Tooltip>
                      <Badge variant="secondary" className="text-xs">{statusContractors.length}</Badge>
                    </div>
                    {status === "offer-accepted" && onAddCandidate && (<Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onAddCandidate}><Plus className="h-4 w-4" /></Button>)}
                  </div>
                  {status === "collect-payroll-details" && (<p className="text-xs text-muted-foreground mt-1">Get bank and payout details</p>)}
                </div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">{statusContractors.map(c => renderCard(c))}</AnimatePresence>
                  {statusContractors.length === 0 && (<div className="text-center py-8 text-muted-foreground text-sm">No candidates</div>)}
                </div>
              </div>
            );
          })}
        </div>
        <V4_PayrollDetailsConfigDrawer open={payrollConfigDrawerOpen} onOpenChange={setPayrollConfigDrawerOpen} candidate={selectedForPayrollConfig} onSave={handleSavePayrollConfig} />
        <V4_ConfigureCandidateDetailsDrawer open={candidateConfigDrawerOpen} onOpenChange={setCandidateConfigDrawerOpen} candidate={selectedForCandidateConfig} onSave={handleSaveCandidateConfig} initialConfig={selectedForCandidateConfig?.onboardingConfig} />
        <V4_SendCandidateDetailsFormDrawer open={candidateSendFormDrawerOpen} onOpenChange={setCandidateSendFormDrawerOpen} candidate={selectedForCandidateConfig} config={selectedForCandidateConfig?.onboardingConfig} onSend={handleSendCandidateForm} />
      </div>
    </TooltipProvider>
  );
};

export default V4_PipelineView;
