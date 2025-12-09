/**
 * V4-specific Pipeline Wrapper
 * 
 * This component wraps the original PipelineView and adds custom payroll stages:
 * - Custom Certified column with Configure & Send payroll form actions
 * - Collect Payroll Details column (waiting state with Resend only)
 * - Done column (payroll completed with summary)
 * 
 * Only used in Flow 1 - Fronted Admin Dashboard v4.
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import "./v4-pipeline-styles.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Settings, Send, Wallet, CheckCircle2, Clock, RefreshCw, Sparkles, Building2, Calendar, Eye, Award, Plus, Trash2, FileEdit, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { V4_PayrollDetailsConfigDrawer, CustomPayrollField, PayrollFieldConfig, PayrollConfig } from "./V4_PayrollDetailsConfigDrawer";
import { V4_ViewPayrollDetailsDrawer } from "./V4_ViewPayrollDetailsDrawer";
import { V4_ConfigureCandidateDetailsDrawer, OnboardingConfig } from "./V4_ConfigureCandidateDetailsDrawer";
import { V4_SendCandidateDetailsFormDrawer } from "./V4_SendCandidateDetailsFormDrawer";
interface V4_Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: string;
  formSent?: boolean;
  dataReceived?: boolean;
  employmentType?: "contractor" | "employee";
  email?: string;
  hasATSData?: boolean;
  // V4-specific candidate details tracking
  candidateFormLastSentAt?: string;
  onboardingConfig?: OnboardingConfig;
  onboardingFormSent?: boolean;
  // V4-specific payroll tracking
  payrollFormStatus?: "not-configured" | "configured" | "sent" | "completed";
  payrollFormLastSentAt?: string;
  payrollFormResendCount?: number;
  payrollFormConfigured?: boolean;
  // V4-specific custom payroll fields
  payrollCustomFields?: CustomPayrollField[];
  payrollFieldConfig?: PayrollFieldConfig[];
  payrollDetails?: {
    bankCountry?: string;
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    swiftBic?: string;
    routingCode?: string;
    payFrequency?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    submittedAt?: string;
    customFieldResponses?: Record<string, any>;
  };
}
interface V4_PipelineWithPayrollDetailsProps {
  contractors: V4_Contractor[];
  className?: string;
  onContractorUpdate?: (contractors: V4_Contractor[]) => void;
  onDraftContract?: (contractorIds: string[]) => void;
  onSignatureComplete?: () => void;
  onAddCandidate?: () => void;
  onRemoveContractor?: (contractorId: string) => void;
}
export const V4_PipelineWithPayrollDetails: React.FC<V4_PipelineWithPayrollDetailsProps> = ({
  contractors: initialContractors,
  className,
  onContractorUpdate,
  onDraftContract,
  onSignatureComplete,
  onAddCandidate,
  onRemoveContractor
}) => {
  const navigate = useNavigate();
  // V4-specific state management
  const [v4Contractors, setV4Contractors] = useState<V4_Contractor[]>(initialContractors.map(c => ({
    ...c,
    payrollFormStatus: c.payrollFormStatus || "not-configured"
  })));
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [viewDetailsDrawerOpen, setViewDetailsDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<V4_Contractor | null>(null);
  const [sendingFormIds, setSendingFormIds] = useState<Set<string>>(new Set());
  
  // V4-specific multi-select state for Offer Accepted column
  const [selectedOfferAcceptedIds, setSelectedOfferAcceptedIds] = useState<Set<string>>(new Set());
  
  // V4-specific multi-select state for Prepare Contract column
  const [selectedDraftingIds, setSelectedDraftingIds] = useState<Set<string>>(new Set());
  
  // V4 Candidate Details Drawer state
  const [candidateConfigDrawerOpen, setCandidateConfigDrawerOpen] = useState(false);
  const [candidateSendFormDrawerOpen, setCandidateSendFormDrawerOpen] = useState(false);
  const [selectedCandidateForConfig, setSelectedCandidateForConfig] = useState<V4_Contractor | null>(null);

  // Filter contractors by their payroll stage
  // Offer Accepted: status is offer-accepted
  const offerAcceptedContractors = v4Contractors.filter(c => c.status === "offer-accepted");

  // Certified: status is CERTIFIED and payroll form not yet sent
  const certifiedContractors = v4Contractors.filter(c => (c.status === "certified" || c.status === "CERTIFIED") && c.payrollFormStatus !== "sent" && c.payrollFormStatus !== "completed");

  // Collect Candidate Details: status is data-pending (form sent, awaiting data)
  const collectCandidateDetailsContractors = v4Contractors.filter(c => c.status === "data-pending");

  // Collecting: payroll form sent but not completed
  const collectingPayrollContractors = v4Contractors.filter(c => c.payrollFormStatus === "sent");

  // Done: payroll form completed
  const doneContractors = v4Contractors.filter(c => c.payrollFormStatus === "completed");

  // V4-specific: Prepare Contract (drafting) - rendered by v4 with v4 navigation
  const prepareContractContractors = v4Contractors.filter(c => c.status === "drafting");

  // V4-specific: Waiting for Signature - rendered by v4 with v4 navigation  
  const waitingSignatureContractors = v4Contractors.filter(c => c.status === "awaiting-signature");

  // Contractors for main pipeline (exclude statuses we render ourselves: offer-accepted, data-pending, drafting, awaiting-signature, certified, and payroll stages)
  const pipelineContractors = v4Contractors.filter(c => 
    c.status !== "offer-accepted" && 
    c.status !== "certified" && 
    c.status !== "CERTIFIED" && 
    c.status !== "data-pending" && 
    c.status !== "drafting" &&
    c.status !== "awaiting-signature" &&
    c.payrollFormStatus !== "sent" && 
    c.payrollFormStatus !== "completed"
  );

  // Update parent when v4 contractors change
  React.useEffect(() => {
    onContractorUpdate?.(v4Contractors as any);
  }, [v4Contractors, onContractorUpdate]);

  // Handlers
  const handleOpenConfig = useCallback((contractor: V4_Contractor) => {
    setSelectedContractor(contractor);
    setConfigDrawerOpen(true);
  }, []);
  const handleSaveConfig = useCallback((contractorId: string, config: PayrollConfig) => {
    setV4Contractors(prev => prev.map(c => c.id === contractorId ? {
      ...c,
      payrollFormStatus: "configured" as const,
      payrollFormConfigured: true,
      payrollFieldConfig: config.baseFields,
      payrollCustomFields: config.customFields
    } : c));
    toast.success("Payroll form configured");
    setConfigDrawerOpen(false);
  }, []);
  const handleSendPayrollForm = useCallback((contractorId: string) => {
    setSendingFormIds(prev => new Set([...prev, contractorId]));
    setTimeout(() => {
      setV4Contractors(prev => prev.map(c => c.id === contractorId ? {
        ...c,
        payrollFormStatus: "sent" as const,
        payrollFormLastSentAt: new Date().toLocaleString(),
        payrollFormResendCount: 0
      } : c));
      setSendingFormIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });
      toast.success("Payroll form sent", {
        description: "The worker will receive an email with the form link."
      });
    }, 800);
  }, []);
  const handleResendPayrollForm = useCallback((contractorId: string) => {
    setSendingFormIds(prev => new Set([...prev, contractorId]));
    setTimeout(() => {
      setV4Contractors(prev => prev.map(c => c.id === contractorId ? {
        ...c,
        payrollFormLastSentAt: new Date().toLocaleString(),
        payrollFormResendCount: (c.payrollFormResendCount || 0) + 1
      } : c));
      setSendingFormIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });
      toast.success("Payroll form resent");
    }, 600);
  }, []);
  const handleResendCandidateDetailsForm = useCallback((contractorId: string) => {
    setSendingFormIds(prev => new Set([...prev, contractorId]));
    setTimeout(() => {
      setV4Contractors(prev => prev.map(c => c.id === contractorId ? {
        ...c,
        candidateFormLastSentAt: new Date().toLocaleString()
      } : c));
      setSendingFormIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });
      toast.success("Candidate details form resent");
    }, 600);
  }, []);
  const handleViewDetails = useCallback((contractor: V4_Contractor) => {
    setSelectedContractor(contractor);
    setViewDetailsDrawerOpen(true);
  }, []);

  // V4 Candidate Details Handlers
  const handleOpenCandidateConfig = useCallback((contractor: V4_Contractor) => {
    setSelectedCandidateForConfig(contractor);
    setCandidateConfigDrawerOpen(true);
  }, []);

  const handleOpenSendCandidateForm = useCallback((contractor: V4_Contractor) => {
    setSelectedCandidateForConfig(contractor);
    setCandidateSendFormDrawerOpen(true);
  }, []);

  const handleSaveCandidateConfig = useCallback((candidateId: string, config: OnboardingConfig) => {
    setV4Contractors(prev => prev.map(c => c.id === candidateId ? {
      ...c,
      onboardingConfig: config
    } : c));
  }, []);

  const handleSendCandidateForm = useCallback((candidateId: string) => {
    setV4Contractors(prev => prev.map(c => c.id === candidateId ? {
      ...c,
      status: "data-pending",
      formSent: true,
      onboardingFormSent: true,
      candidateFormLastSentAt: new Date().toLocaleString()
    } : c));
  }, []);

  const handleRemoveContractor = useCallback((contractorId: string) => {
    setV4Contractors(prev => prev.filter(c => c.id !== contractorId));
    onRemoveContractor?.(contractorId);
    toast.success("Candidate removed");
  }, [onRemoveContractor]);

  // V4-specific: Multi-select handlers for Offer Accepted column
  const handleSelectOfferAcceptedContractor = useCallback((id: string, checked: boolean) => {
    setSelectedOfferAcceptedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const areAllOfferAcceptedSelected = useCallback(() => {
    if (offerAcceptedContractors.length === 0) return false;
    return offerAcceptedContractors.every(c => selectedOfferAcceptedIds.has(c.id));
  }, [offerAcceptedContractors, selectedOfferAcceptedIds]);

  const handleSelectAllOfferAccepted = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedOfferAcceptedIds(new Set(offerAcceptedContractors.map(c => c.id)));
    } else {
      setSelectedOfferAcceptedIds(new Set());
    }
  }, [offerAcceptedContractors]);

  const getOfferAcceptedSelectedCount = useCallback(() => {
    return offerAcceptedContractors.filter(c => selectedOfferAcceptedIds.has(c.id)).length;
  }, [offerAcceptedContractors, selectedOfferAcceptedIds]);

  const handleBulkSendCandidateForms = useCallback(() => {
    const selectedIds = Array.from(selectedOfferAcceptedIds).filter(id => 
      offerAcceptedContractors.find(c => c.id === id)
    );
    if (selectedIds.length > 0) {
      setV4Contractors(prev => prev.map(c => 
        selectedIds.includes(c.id) ? {
          ...c,
          status: "data-pending",
          formSent: true,
          onboardingFormSent: true,
          candidateFormLastSentAt: new Date().toLocaleString()
        } : c
      ));
      setSelectedOfferAcceptedIds(new Set());
      toast.success(`Forms sent to ${selectedIds.length} candidates`);
    }
  }, [selectedOfferAcceptedIds, offerAcceptedContractors]);

  // V4-specific: Multi-select handlers for Prepare Contract column
  const handleSelectDraftingContractor = useCallback((id: string, checked: boolean) => {
    setSelectedDraftingIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const areAllDraftingSelected = useCallback(() => {
    if (prepareContractContractors.length === 0) return false;
    return prepareContractContractors.every(c => selectedDraftingIds.has(c.id));
  }, [prepareContractContractors, selectedDraftingIds]);

  const handleSelectAllDrafting = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedDraftingIds(new Set(prepareContractContractors.map(c => c.id)));
    } else {
      setSelectedDraftingIds(new Set());
    }
  }, [prepareContractContractors]);

  const getDraftingSelectedCount = useCallback(() => {
    return prepareContractContractors.filter(c => selectedDraftingIds.has(c.id)).length;
  }, [prepareContractContractors, selectedDraftingIds]);

  const handleBulkDraftContracts = useCallback(() => {
    const selectedIds = Array.from(selectedDraftingIds).filter(id => 
      prepareContractContractors.find(c => c.id === id)
    );
    if (selectedIds.length > 0) {
      const params = new URLSearchParams({ ids: selectedIds.join(',') }).toString();
      navigate(`/flows/fronted-admin-dashboard-v4/contract-flow?${params}`);
      setSelectedDraftingIds(new Set());
    }
  }, [selectedDraftingIds, prepareContractContractors, navigate]);


  // Simulate worker completing payroll form (for demo purposes)
  const handleSimulateCompletion = useCallback((contractorId: string) => {
    setV4Contractors(prev => prev.map(c => c.id === contractorId ? {
      ...c,
      payrollFormStatus: "completed" as const,
      payrollDetails: {
        bankCountry: c.country,
        bankName: "Worker's Bank",
        accountHolderName: c.name,
        accountNumber: "****" + Math.random().toString().slice(2, 6),
        swiftBic: "WRKRBKXX",
        payFrequency: "Monthly",
        submittedAt: new Date().toLocaleDateString()
      }
    } : c));
    toast.success("Payroll details received!", {
      description: "Worker has completed their payroll form."
    });
  }, []);

  // Render Offer Accepted Column (custom V4 version with candidate details config)
  const renderOfferAcceptedColumn = () => {
    const selectedCount = getOfferAcceptedSelectedCount();
    
    return (
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }} className="flex-shrink-0 w-[280px]">
        {/* Column Header */}
        <div className="p-3 rounded-t-lg border-t border-x bg-muted/50 border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {/* Select All Checkbox */}
              {offerAcceptedContractors.length > 0 && (
                <Checkbox
                  checked={areAllOfferAcceptedSelected()}
                  onCheckedChange={(checked) => handleSelectAllOfferAccepted(checked as boolean)}
                  className="h-4 w-4"
                />
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-sm text-foreground">
                        Offer Accepted
                      </h3>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">
                      Candidate has accepted the offer. Configure and send the onboarding form.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
              )}
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {offerAcceptedContractors.length}
              </Badge>
              {onAddCandidate && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddCandidate}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Bulk Action Button */}
          {selectedCount > 0 && (
            <div className="mt-2">
              <Button 
                size="sm" 
                className="w-full text-xs h-7"
                onClick={handleBulkSendCandidateForms}
              >
                <Send className="h-3 w-3 mr-1" />
                Send Forms ({selectedCount})
              </Button>
            </div>
          )}
        </div>

        {/* Column Body */}
        <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-muted/20 border-border/50">
          {offerAcceptedContractors.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                No new offers
              </h3>
              <p className="text-xs text-muted-foreground">
                Candidates who accept offers will appear here
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {offerAcceptedContractors.map(contractor => {
                const isSending = sendingFormIds.has(contractor.id);
                return (
                  <motion.div key={contractor.id} layout initial={{
                    opacity: 0,
                    scale: 0.8
                  }} animate={{
                    opacity: 1,
                    scale: 1
                  }} exit={{
                    opacity: 0,
                    scale: 0.8,
                    x: 100
                  }} transition={{
                    layout: { duration: 0.5, type: "spring" },
                    opacity: { duration: 0.2 }
                  }}>
                    <Card className="hover:shadow-card transition-shadow border border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-3 space-y-2">
                        {/* Worker Header with Checkbox */}
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedOfferAcceptedIds.has(contractor.id)}
                            onCheckedChange={(checked) => handleSelectOfferAcceptedContractor(contractor.id, checked as boolean)}
                            className="h-4 w-4 mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Avatar className="h-8 w-8 bg-primary/10">
                            <AvatarFallback className="text-xs">
                              {contractor.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm text-foreground truncate">
                                {contractor.name}
                              </span>
                              <span className="text-base">{contractor.countryFlag}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {contractor.role}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveContractor(contractor.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col gap-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                            <span className="font-medium text-foreground">{contractor.salary}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Country</span>
                            <span className="font-medium text-foreground">{contractor.country}</span>
                          </div>
                          {contractor.employmentType && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Type</span>
                              <Badge variant="outline" className="text-[10px] h-4 capitalize">
                                {contractor.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          <Button variant="outline" size="sm" className="flex-1 text-xs h-7 gap-1 bg-card hover:bg-muted/80 hover:text-foreground" onClick={() => handleOpenCandidateConfig(contractor)}>
                            <Settings className="h-3 w-3" />
                            Configure
                          </Button>
                          <Button size="sm" className="flex-1 text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90" disabled={isSending} onClick={() => handleOpenSendCandidateForm(contractor)}>
                            <Send className="h-3 w-3" />
                            {isSending ? "Sending..." : "Send Form"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    );
  };


  // Render Collect Candidate Details Column (custom V4 version)
  const renderCollectCandidateDetailsColumn = () => <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }} className="flex-shrink-0 w-[280px]">
      {/* Column Header - darker */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-yellow-fill/50 border-accent-yellow-outline/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm text-foreground">
                      Collect Contract Details
                    </h3>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    Awaiting candidate to submit their details form.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {collectCandidateDetailsContractors.length}
          </Badge>
        </div>
      </div>

      {/* Column Body - lighter */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-yellow-fill/15 border-accent-yellow-outline/20">
        {collectCandidateDetailsContractors.length === 0 ? <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-yellow-fill/20 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-accent-yellow-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No pending forms
            </h3>
            <p className="text-xs text-muted-foreground">
              Candidates awaiting details submission will appear here
            </p>
          </motion.div> : <AnimatePresence mode="popLayout">
            {collectCandidateDetailsContractors.map(contractor => {
          const isSending = sendingFormIds.has(contractor.id);
          return <motion.div key={contractor.id} layout initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.8,
            x: 100
          }} transition={{
            layout: {
              duration: 0.5,
              type: "spring"
            },
            opacity: {
              duration: 0.2
            }
          }}>
                  <Card className="hover:shadow-card transition-shadow border border-accent-yellow-outline/30 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 space-y-2">
                      {/* Worker Header */}
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-xs">
                            {contractor.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-foreground truncate">
                              {contractor.name}
                            </span>
                            <span className="text-base">{contractor.countryFlag}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {contractor.role}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                          <span className="font-medium text-foreground">{contractor.salary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium text-foreground">{contractor.country}</span>
                        </div>
                      </div>

                      {/* Status Context */}
                      <div className="pt-1 pb-1 text-center">
                        <p className="text-xs text-muted-foreground">
                          Awaiting candidate details
                        </p>
                        {contractor.candidateFormLastSentAt && <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Last sent: {contractor.candidateFormLastSentAt}
                          </p>}
                      </div>

                      {/* Action Button */}
                      <div className="pt-1">
                        <Button size="sm" className="w-full text-xs h-8 gap-1.5 bg-gradient-primary hover:opacity-90" disabled={isSending} onClick={() => handleResendCandidateDetailsForm(contractor.id)}>
                          <RefreshCw className={cn("h-3.5 w-3.5", isSending && "animate-spin")} />
                          {isSending ? "Sending..." : "Resend"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>;
        })}
          </AnimatePresence>}
      </div>
    </motion.div>;

  // V4-specific: Render Prepare Contract Column with v4 navigation and multi-select
  const renderPrepareContractColumn = () => {
    const selectedCount = getDraftingSelectedCount();
    
    return (
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }} className="flex-shrink-0 w-[280px]">
        {/* Column Header */}
        <div className="p-3 rounded-t-lg border-t border-x bg-accent-blue-fill/50 border-accent-blue-outline/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {/* Select All Checkbox */}
              {prepareContractContractors.length > 0 && (
                <Checkbox
                  checked={areAllDraftingSelected()}
                  onCheckedChange={(checked) => handleSelectAllDrafting(checked as boolean)}
                  className="h-4 w-4"
                />
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-sm text-foreground">
                        Prepare Contract
                      </h3>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">
                      Review candidate details and confirm terms before generating contract.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
              )}
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent-blue-fill/50 text-accent-blue-text">
                {prepareContractContractors.length}
              </Badge>
            </div>
          </div>
          
          {/* Bulk Action Button */}
          {selectedCount > 0 && (
            <div className="mt-2">
              <Button 
                size="sm" 
                className="w-full text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90"
                onClick={handleBulkDraftContracts}
              >
                <FileEdit className="h-3 w-3" />
                Draft Contracts ({selectedCount})
              </Button>
            </div>
          )}
        </div>

        {/* Column Body */}
        <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-blue-fill/15 border-accent-blue-outline/20">
          {prepareContractContractors.length === 0 ? (
            <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-accent-blue-fill/20 flex items-center justify-center mb-3">
                <FileEdit className="h-6 w-6 text-accent-blue-text" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                No contracts to prepare
              </h3>
              <p className="text-xs text-muted-foreground">
                Candidates ready for contracts will appear here
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {prepareContractContractors.map(contractor => (
                <motion.div key={contractor.id} layout initial={{
                  opacity: 0,
                  scale: 0.8
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  scale: 0.8,
                  x: 100
                }} transition={{
                  layout: { duration: 0.5, type: "spring" },
                  opacity: { duration: 0.2 }
                }}>
                  <Card className="hover:shadow-card transition-shadow border border-accent-blue-outline/30 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 space-y-2">
                      {/* Worker Header with Checkbox */}
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={selectedDraftingIds.has(contractor.id)}
                          onCheckedChange={(checked) => handleSelectDraftingContractor(contractor.id, checked as boolean)}
                          className="h-4 w-4 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar className="h-8 w-8 bg-accent-blue-fill/20 border border-accent-blue-outline/30">
                          <AvatarFallback className="text-xs">
                            {contractor.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-foreground truncate">
                              {contractor.name}
                            </span>
                            <span className="text-base">{contractor.countryFlag}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {contractor.role}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                          <span className="font-medium text-foreground">{contractor.salary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium text-foreground">{contractor.country}</span>
                        </div>
                      </div>

                      {/* Action Button - V4 specific navigation */}
                      <div className="pt-1">
                        <Button 
                          size="sm" 
                          className="w-full text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90"
                          onClick={() => {
                            // V4-specific: Navigate to v4 contract flow route
                            const params = new URLSearchParams({ ids: contractor.id }).toString();
                            navigate(`/flows/fronted-admin-dashboard-v4/contract-flow?${params}`);
                          }}
                        >
                          <FileEdit className="h-3 w-3" />
                          Draft Contract
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    );
  };

  // V4-specific: Render Waiting for Signature Column with v4 navigation
  const renderWaitingSignatureColumn = () => <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }} className="flex-shrink-0 w-[280px]">
      {/* Column Header */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-purple-fill/50 border-accent-purple-outline/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm text-foreground">
                      Waiting for Signature
                    </h3>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    Contract sent — awaiting candidate review and signature.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent-purple-fill/50 text-accent-purple-text">
            {waitingSignatureContractors.length}
          </Badge>
        </div>
      </div>

      {/* Column Body */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-purple-fill/15 border-accent-purple-outline/20">
        {waitingSignatureContractors.length === 0 ? <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-purple-fill/20 flex items-center justify-center mb-3">
              <FileSignature className="h-6 w-6 text-accent-purple-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No pending signatures
            </h3>
            <p className="text-xs text-muted-foreground">
              Contracts awaiting signature will appear here
            </p>
          </motion.div> : <AnimatePresence mode="popLayout">
            {waitingSignatureContractors.map(contractor => (
              <motion.div key={contractor.id} layout initial={{
                opacity: 0,
                scale: 0.8
              }} animate={{
                opacity: 1,
                scale: 1
              }} exit={{
                opacity: 0,
                scale: 0.8,
                x: 100
              }} transition={{
                layout: { duration: 0.5, type: "spring" },
                opacity: { duration: 0.2 }
              }}>
                <Card className="hover:shadow-card transition-shadow border border-accent-purple-outline/30 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3 space-y-2">
                    {/* Worker Header */}
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8 bg-accent-purple-fill/20 border border-accent-purple-outline/30">
                        <AvatarFallback className="text-xs">
                          {contractor.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm text-foreground truncate">
                            {contractor.name}
                          </span>
                          <span className="text-base">{contractor.countryFlag}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {contractor.role}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                        <span className="font-medium text-foreground">{contractor.salary}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium text-foreground">{contractor.country}</span>
                      </div>
                    </div>

                    {/* Action Button - V4 specific (Track Progress stays in v4) */}
                    <div className="pt-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full text-xs h-7 gap-1 bg-card hover:bg-card/80 hover:text-foreground"
                        onClick={() => {
                          // TODO: Open v4-specific signature progress drawer
                          toast.success("Tracking signature progress", {
                            description: `${contractor.name}'s contract is awaiting signature.`
                          });
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        Track Progress
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>}
      </div>
    </motion.div>;

  // Render Certified Column (custom V4 version with Configure & Send buttons)
  const renderCertifiedColumn = () => <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }} className="flex-shrink-0 w-[280px]">
      {/* Column Header - darker */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-green-fill/50 border-accent-green-outline/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm text-foreground">
                      Certified
                    </h3>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    Contracts & compliance completed. Configure and send payroll details form.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent-green-fill/50 text-accent-green-text">
            {certifiedContractors.length}
          </Badge>
        </div>
      </div>

      {/* Column Body - lighter */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-green-fill/15 border-accent-green-outline/20">
        {certifiedContractors.length === 0 ? <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-green-fill/20 flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-accent-green-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No certified workers
            </h3>
            <p className="text-xs text-muted-foreground">
              Workers completing onboarding will appear here
            </p>
          </motion.div> : <AnimatePresence mode="popLayout">
            {certifiedContractors.map(contractor => {
          const isSending = sendingFormIds.has(contractor.id);
          const isConfigured = contractor.payrollFormConfigured || contractor.payrollFormStatus === "configured";
          return <motion.div key={contractor.id} layout initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.8,
            x: 100
          }} transition={{
            layout: {
              duration: 0.5,
              type: "spring"
            },
            opacity: {
              duration: 0.2
            }
          }}>
                  <Card className="hover:shadow-card transition-shadow border border-accent-green-outline/30 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 space-y-2">
                      {/* Worker Header */}
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 bg-accent-green-fill/20 border border-accent-green-outline/30">
                          <AvatarFallback className="text-xs">
                            {contractor.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-foreground truncate">
                              {contractor.name}
                            </span>
                            <span className="text-base">{contractor.countryFlag}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {contractor.role}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                          <span className="font-medium text-foreground">{contractor.salary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium text-foreground">{contractor.country}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Same style as Offer Accepted */}
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-7 gap-1 bg-card hover:bg-muted/80 hover:text-foreground" onClick={() => handleOpenConfig(contractor)}>
                          <Settings className="h-3 w-3" />
                          Configure
                        </Button>
                        <Button size="sm" className="flex-1 text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90" disabled={isSending} onClick={() => handleSendPayrollForm(contractor.id)}>
                          <Send className="h-3 w-3" />
                          {isSending ? "Sending..." : "Send form"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>;
        })}
          </AnimatePresence>}
      </div>
    </motion.div>;

  // Render Collect Payroll Details Column
  const renderCollectPayrollColumn = () => <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3,
    delay: 0.1
  }} className="flex-shrink-0 w-[280px]">
      {/* Column Header - darker */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-yellow-fill/50 border-accent-yellow-outline/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm text-foreground">
                      Collect Payroll Details
                    </h3>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    Waiting for workers to submit their bank and payout details.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {collectingPayrollContractors.length}
          </Badge>
        </div>
      </div>

      {/* Column Body - lighter */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-yellow-fill/15 border-accent-yellow-outline/20">
        {collectingPayrollContractors.length === 0 ? <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-yellow-fill/20 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-accent-yellow-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No pending payroll forms
            </h3>
            <p className="text-xs text-muted-foreground">
              Workers awaiting payroll form completion will appear here
            </p>
          </motion.div> : <AnimatePresence mode="popLayout">
            {collectingPayrollContractors.map(contractor => {
          const isSending = sendingFormIds.has(contractor.id);
          return <motion.div key={contractor.id} layout initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.8,
            x: 100
          }} transition={{
            layout: {
              duration: 0.5,
              type: "spring"
            },
            opacity: {
              duration: 0.2
            }
          }}>
                  <Card className="hover:shadow-card transition-shadow border border-accent-yellow-outline/30 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 space-y-2">
                      {/* Worker Header */}
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-xs">
                            {contractor.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-foreground truncate">
                              {contractor.name}
                            </span>
                            <span className="text-base">{contractor.countryFlag}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {contractor.role}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                          <span className="font-medium text-foreground">{contractor.salary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium text-foreground">{contractor.country}</span>
                        </div>
                      </div>

                      {/* Status Context */}
                      <div className="pt-1 pb-1 text-center">
                        <p className="text-xs text-muted-foreground">
                          Awaiting payroll details from worker
                        </p>
                        {contractor.payrollFormLastSentAt && <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Last sent: {contractor.payrollFormLastSentAt}
                          </p>}
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="flex-1 text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90" disabled={isSending} onClick={() => handleResendPayrollForm(contractor.id)}>
                          <RefreshCw className={cn("h-3 w-3", isSending && "animate-spin")} />
                          {isSending ? "Sending..." : "Resend"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>;
        })}
          </AnimatePresence>}
      </div>
    </motion.div>;

  // Render Done Column
  const renderDoneColumn = () => <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3,
    delay: 0.2
  }} className="flex-shrink-0 w-[280px]">
      {/* Column Header - darker */}
      <div className="p-3 rounded-t-lg border-t border-x bg-primary/25 border-primary/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm text-foreground">
                      Done
                    </h3>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    Payroll details completed and ready for payroll.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary/20 text-primary">
            {doneContractors.length}
          </Badge>
        </div>
      </div>

      {/* Column Body - lighter */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-primary/8 border-primary/15">
        {doneContractors.length === 0 ? <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No completed workers yet
            </h3>
            <p className="text-xs text-muted-foreground">
              Workers with completed payroll details will appear here
            </p>
          </motion.div> : <AnimatePresence mode="popLayout">
            {doneContractors.map(contractor => <motion.div key={contractor.id} layout initial={{
          opacity: 0,
          scale: 0.8,
          x: -50
        }} animate={{
          opacity: 1,
          scale: 1,
          x: 0
        }} exit={{
          opacity: 0,
          scale: 0.8
        }} transition={{
          layout: {
            duration: 0.5,
            type: "spring"
          },
          opacity: {
            duration: 0.3
          }
        }}>
                <Card className="hover:shadow-card transition-all cursor-pointer border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-sm group" onClick={() => handleViewDetails(contractor)}>
                  <CardContent className="p-3 space-y-2">
                    {/* Worker Header */}
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                        <AvatarFallback className="text-xs text-primary">
                          {contractor.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm text-foreground truncate">
                            {contractor.name}
                          </span>
                          <span className="text-base">{contractor.countryFlag}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {contractor.role}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{contractor.employmentType === "contractor" ? "Consultancy fee" : "Salary"}</span>
                        <span className="font-medium text-foreground">{contractor.salary}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium text-foreground">{contractor.country}</span>
                      </div>
                    </div>

                    {/* Payroll Ready Badge */}
                    <div className="flex justify-center pt-1">
                      <Badge className="bg-accent-green-fill/20 text-accent-green-text border border-accent-green-outline/30 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Payroll ready
                      </Badge>
                    </div>

                    {/* Payroll Summary */}
                    <div className="pt-1 space-y-1 border-t border-border/30 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Pay frequency: {contractor.payrollDetails?.payFrequency || "Monthly"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>Bank: {contractor.payrollDetails?.bankName || "Verified"}, {contractor.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        <span>Aligned with company payroll</span>
                      </div>
                    </div>

                    {/* View Details hint */}
                    <div className="flex justify-center pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-primary flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        View details
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
          </AnimatePresence>}
      </div>
    </motion.div>;
  return <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-4 min-w-max items-start">
        {/* Column 1: Offer Accepted (custom V4 version with candidate details config) */}
        {renderOfferAcceptedColumn()}

        {/* Column 2: Collect Candidate Details */}
        {renderCollectCandidateDetailsColumn()}

        {/* Column 3: Prepare Contract (V4-specific with v4 navigation) */}
        {renderPrepareContractColumn()}

        {/* Column 4: Waiting for Signature (V4-specific with v4 navigation) */}
        {renderWaitingSignatureColumn()}

        {/* Columns 5-6: Pipeline remaining columns (Onboard Candidate, etc.) - exclude drafting & awaiting-signature */}
        <div className="v4-pipeline-middle flex-shrink-0 [&>div]:!overflow-visible [&>div]:!pb-0 [&>div>div>div:nth-child(1)]:!hidden [&>div>div>div:nth-child(2)]:!hidden [&>div>div>div:nth-child(3)]:!hidden [&>div>div>div:nth-child(4)]:!hidden [&>div>div>div:nth-child(7)]:!hidden">
          <PipelineView contractors={pipelineContractors as any} onContractorUpdate={updated => {
          setV4Contractors(prev => {
            const updatedIds = new Set(updated.map((c: any) => c.id));
            const customStageContractors = prev.filter(c => 
              c.status === "offer-accepted" || 
              c.payrollFormStatus === "sent" || 
              c.payrollFormStatus === "completed" || 
              c.status === "data-pending" || 
              ((c.status === "certified" || c.status === "CERTIFIED") && !updatedIds.has(c.id))
            );
            return [...customStageContractors, ...updated.map((c: any) => ({
              ...c,
              payrollFormStatus: prev.find(p => p.id === c.id)?.payrollFormStatus || "not-configured",
              payrollFormConfigured: prev.find(p => p.id === c.id)?.payrollFormConfigured,
              candidateFormLastSentAt: prev.find(p => p.id === c.id)?.candidateFormLastSentAt,
              onboardingConfig: prev.find(p => p.id === c.id)?.onboardingConfig
            }))];
          });
        }} onDraftContract={(ids) => {
          // V4-specific: Navigate to v4 contract flow route instead of v3
          const params = new URLSearchParams({ ids: ids.join(',') }).toString();
          navigate(`/flows/fronted-admin-dashboard-v4/contract-flow?${params}`);
        }} onSignatureComplete={onSignatureComplete} onAddCandidate={onAddCandidate} onRemoveContractor={onRemoveContractor} />
        </div>

        {/* Column 7: Certified */}
        {renderCertifiedColumn()}

        {/* Column 8: Collect Payroll Details */}
        {renderCollectPayrollColumn()}

        {/* Column 9: Done */}
        {renderDoneColumn()}
      </div>

      {/* Payroll Config Drawer */}
      <V4_PayrollDetailsConfigDrawer 
        open={configDrawerOpen} 
        onOpenChange={setConfigDrawerOpen} 
        candidate={selectedContractor ? {
          id: selectedContractor.id,
          name: selectedContractor.name,
          role: selectedContractor.role,
          country: selectedContractor.country,
          countryFlag: selectedContractor.countryFlag,
          salary: selectedContractor.salary,
          startDate: "TBD",
          employmentType: selectedContractor.employmentType || "contractor",
          hasATSData: selectedContractor.hasATSData
        } : null} 
        onSave={handleSaveConfig} 
        initialConfig={selectedContractor ? {
          baseFields: selectedContractor.payrollFieldConfig || [],
          customFields: selectedContractor.payrollCustomFields || []
        } : undefined} 
      />

      {/* View Payroll Details Drawer */}
      <V4_ViewPayrollDetailsDrawer open={viewDetailsDrawerOpen} onOpenChange={setViewDetailsDrawerOpen} contractor={selectedContractor} />

      {/* Candidate Details Config Drawer */}
      <V4_ConfigureCandidateDetailsDrawer 
        open={candidateConfigDrawerOpen} 
        onOpenChange={setCandidateConfigDrawerOpen} 
        candidate={selectedCandidateForConfig ? {
          id: selectedCandidateForConfig.id,
          name: selectedCandidateForConfig.name,
          role: selectedCandidateForConfig.role,
          country: selectedCandidateForConfig.country,
          countryFlag: selectedCandidateForConfig.countryFlag,
          salary: selectedCandidateForConfig.salary,
          email: selectedCandidateForConfig.email,
          employmentType: selectedCandidateForConfig.employmentType || "contractor"
        } : null} 
        onSave={handleSaveCandidateConfig} 
        initialConfig={selectedCandidateForConfig?.onboardingConfig} 
      />

      {/* Send Candidate Details Form Drawer */}
      <V4_SendCandidateDetailsFormDrawer 
        open={candidateSendFormDrawerOpen} 
        onOpenChange={setCandidateSendFormDrawerOpen} 
        candidate={selectedCandidateForConfig ? {
          id: selectedCandidateForConfig.id,
          name: selectedCandidateForConfig.name,
          role: selectedCandidateForConfig.role,
          country: selectedCandidateForConfig.country,
          countryFlag: selectedCandidateForConfig.countryFlag,
          salary: selectedCandidateForConfig.salary,
          email: selectedCandidateForConfig.email,
          employmentType: selectedCandidateForConfig.employmentType || "contractor"
        } : null} 
        config={selectedCandidateForConfig?.onboardingConfig} 
        onSend={handleSendCandidateForm} 
      />
    </div>;
};
export default V4_PipelineWithPayrollDetails;