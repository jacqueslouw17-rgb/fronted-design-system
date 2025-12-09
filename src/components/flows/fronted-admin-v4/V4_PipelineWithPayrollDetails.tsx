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
import { motion, AnimatePresence } from "framer-motion";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Info, 
  Settings, 
  Send, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Sparkles,
  Building2,
  Calendar,
  Eye,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { V4_PayrollDetailsConfigDrawer } from "./V4_PayrollDetailsConfigDrawer";
import { V4_ViewPayrollDetailsDrawer } from "./V4_ViewPayrollDetailsDrawer";

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
  // V4-specific payroll tracking
  payrollFormStatus?: "not-configured" | "configured" | "sent" | "completed";
  payrollFormLastSentAt?: string;
  payrollFormResendCount?: number;
  payrollFormConfigured?: boolean;
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
  onRemoveContractor,
}) => {
  // V4-specific state management
  const [v4Contractors, setV4Contractors] = useState<V4_Contractor[]>(
    initialContractors.map(c => ({
      ...c,
      payrollFormStatus: c.payrollFormStatus || "not-configured",
    }))
  );
  
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [viewDetailsDrawerOpen, setViewDetailsDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<V4_Contractor | null>(null);
  const [sendingFormIds, setSendingFormIds] = useState<Set<string>>(new Set());

  // Filter contractors by their payroll stage
  // Certified: status is CERTIFIED and payroll form not yet sent
  const certifiedContractors = v4Contractors.filter(
    c => (c.status === "certified" || c.status === "CERTIFIED") && 
         c.payrollFormStatus !== "sent" && 
         c.payrollFormStatus !== "completed"
  );

  // Collecting: payroll form sent but not completed
  const collectingPayrollContractors = v4Contractors.filter(
    c => c.payrollFormStatus === "sent"
  );

  // Done: payroll form completed
  const doneContractors = v4Contractors.filter(
    c => c.payrollFormStatus === "completed"
  );

  // Contractors for main pipeline (exclude CERTIFIED status - we render those ourselves)
  const pipelineContractors = v4Contractors.filter(
    c => c.status !== "certified" && 
         c.status !== "CERTIFIED" && 
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

  const handleSaveConfig = useCallback((contractorId: string) => {
    setV4Contractors(prev => prev.map(c => 
      c.id === contractorId 
        ? { ...c, payrollFormStatus: "configured" as const, payrollFormConfigured: true }
        : c
    ));
    toast.success("Payroll form configured");
    setConfigDrawerOpen(false);
  }, []);

  const handleSendPayrollForm = useCallback((contractorId: string) => {
    setSendingFormIds(prev => new Set([...prev, contractorId]));
    
    setTimeout(() => {
      setV4Contractors(prev => prev.map(c => 
        c.id === contractorId 
          ? { 
              ...c, 
              payrollFormStatus: "sent" as const,
              payrollFormLastSentAt: new Date().toLocaleString(),
              payrollFormResendCount: 0,
            }
          : c
      ));
      
      setSendingFormIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });

      toast.success("Payroll form sent", {
        description: "The worker will receive an email with the form link.",
      });
    }, 800);
  }, []);

  const handleResendPayrollForm = useCallback((contractorId: string) => {
    setSendingFormIds(prev => new Set([...prev, contractorId]));
    
    setTimeout(() => {
      setV4Contractors(prev => prev.map(c => 
        c.id === contractorId 
          ? { 
              ...c, 
              payrollFormLastSentAt: new Date().toLocaleString(),
              payrollFormResendCount: (c.payrollFormResendCount || 0) + 1,
            }
          : c
      ));
      
      setSendingFormIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });

      toast.success("Payroll form resent");
    }, 600);
  }, []);

  const handleViewDetails = useCallback((contractor: V4_Contractor) => {
    setSelectedContractor(contractor);
    setViewDetailsDrawerOpen(true);
  }, []);

  // Simulate worker completing payroll form (for demo purposes)
  const handleSimulateCompletion = useCallback((contractorId: string) => {
    setV4Contractors(prev => prev.map(c => 
      c.id === contractorId 
        ? { 
            ...c, 
            payrollFormStatus: "completed" as const,
            payrollDetails: {
              bankCountry: c.country,
              bankName: "Worker's Bank",
              accountHolderName: c.name,
              accountNumber: "****" + Math.random().toString().slice(2, 6),
              swiftBic: "WRKRBKXX",
              payFrequency: "Monthly",
              submittedAt: new Date().toLocaleDateString(),
            },
          }
        : c
    ));
    
    toast.success("Payroll details received!", {
      description: "Worker has completed their payroll form.",
    });
  }, []);

  // Render Certified Column (custom V4 version with Configure & Send buttons)
  const renderCertifiedColumn = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 w-[280px]"
    >
      {/* Column Header */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-green-fill/30 border-accent-green-outline/20">
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

      {/* Column Body */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-green-fill/10 border-accent-green-outline/20">
        {certifiedContractors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-accent-green-fill/20 flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-accent-green-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No certified workers
            </h3>
            <p className="text-xs text-muted-foreground">
              Workers completing onboarding will appear here
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {certifiedContractors.map((contractor) => {
              const isSending = sendingFormIds.has(contractor.id);
              const isConfigured = contractor.payrollFormConfigured || contractor.payrollFormStatus === "configured";

              return (
                <motion.div
                  key={contractor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: 100 }}
                  transition={{
                    layout: { duration: 0.5, type: "spring" },
                    opacity: { duration: 0.2 },
                  }}
                >
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
                          <span className="text-muted-foreground">Salary</span>
                          <span className="font-medium text-foreground">{contractor.salary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium text-foreground">{contractor.country}</span>
                        </div>
                      </div>

                      {/* Certified Status */}
                      <div className="flex justify-center py-1">
                        <Badge className="bg-accent-green-fill/20 text-accent-green-text border border-accent-green-outline/30 gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Certified
                        </Badge>
                      </div>

                      {/* Action Buttons - Same style as Offer Accepted */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7 gap-1 bg-card hover:bg-card/80"
                          onClick={() => handleOpenConfig(contractor)}
                        >
                          <Settings className="h-3 w-3" />
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90"
                          disabled={isSending}
                          onClick={() => handleSendPayrollForm(contractor.id)}
                        >
                          <Send className="h-3 w-3" />
                          {isSending ? "Sending..." : "Send form"}
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

  // Render Collect Payroll Details Column
  const renderCollectPayrollColumn = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex-shrink-0 w-[280px]"
    >
      {/* Column Header */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-yellow-fill/30 border-accent-yellow-outline/20">
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

      {/* Column Body */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-yellow-fill/10 border-accent-yellow-outline/20">
        {collectingPayrollContractors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-accent-yellow-fill/20 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-accent-yellow-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No pending payroll forms
            </h3>
            <p className="text-xs text-muted-foreground">
              Workers awaiting payroll form completion will appear here
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {collectingPayrollContractors.map((contractor) => {
              const isSending = sendingFormIds.has(contractor.id);

              return (
                <motion.div
                  key={contractor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: 100 }}
                  transition={{
                    layout: { duration: 0.5, type: "spring" },
                    opacity: { duration: 0.2 },
                  }}
                >
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
                          <span className="text-muted-foreground">Salary</span>
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
                        {contractor.payrollFormLastSentAt && (
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Last sent: {contractor.payrollFormLastSentAt}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7 gap-1"
                          disabled={isSending}
                          onClick={() => handleResendPayrollForm(contractor.id)}
                        >
                          <RefreshCw className={cn("h-3 w-3", isSending && "animate-spin")} />
                          {isSending ? "Sending..." : "Resend form"}
                        </Button>
                        {/* Demo: Simulate completion */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                onClick={() => handleSimulateCompletion(contractor.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Simulate form completion (demo)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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

  // Render Done Column
  const renderDoneColumn = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex-shrink-0 w-[280px]"
    >
      {/* Column Header */}
      <div className="p-3 rounded-t-lg border-t border-x bg-primary/10 border-primary/20">
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

      {/* Column Body */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-primary/5 border-primary/20">
        {doneContractors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No completed workers yet
            </h3>
            <p className="text-xs text-muted-foreground">
              Workers with completed payroll details will appear here
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {doneContractors.map((contractor) => (
              <motion.div
                key={contractor.id}
                layout
                initial={{ opacity: 0, scale: 0.8, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  layout: { duration: 0.5, type: "spring" },
                  opacity: { duration: 0.3 },
                }}
              >
                <Card 
                  className="hover:shadow-card transition-all cursor-pointer border border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-sm group"
                  onClick={() => handleViewDetails(contractor)}
                >
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
                        <span className="text-muted-foreground">Salary</span>
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
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-4 min-w-max items-start">
        {/* Original Pipeline - hide its Certified column (7th column) since we render our own */}
        <div className="flex-shrink-0 [&>div]:!overflow-visible [&>div]:!pb-0 [&>div>div>div:nth-child(7)]:!hidden">
          <PipelineView
            contractors={pipelineContractors as any}
            onContractorUpdate={(updated) => {
              // Merge updated contractors back, preserving payroll stages
              setV4Contractors(prev => {
                const updatedIds = new Set(updated.map((c: any) => c.id));
                // Keep contractors that were not in the update (payroll stages)
                const payrollStageContractors = prev.filter(
                  c => c.payrollFormStatus === "sent" || 
                       c.payrollFormStatus === "completed" ||
                       ((c.status === "certified" || c.status === "CERTIFIED") && !updatedIds.has(c.id))
                );
                // Merge with updated pipeline contractors
                return [...payrollStageContractors, ...updated.map((c: any) => ({
                  ...c,
                  payrollFormStatus: prev.find(p => p.id === c.id)?.payrollFormStatus || "not-configured",
                  payrollFormConfigured: prev.find(p => p.id === c.id)?.payrollFormConfigured,
                }))];
              });
            }}
            onDraftContract={onDraftContract}
            onSignatureComplete={onSignatureComplete}
            onAddCandidate={onAddCandidate}
            onRemoveContractor={onRemoveContractor}
          />
        </div>

        {/* Custom Certified Column */}
        {renderCertifiedColumn()}

        {/* Collect Payroll Details Column */}
        {renderCollectPayrollColumn()}

        {/* Done Column */}
        {renderDoneColumn()}
      </div>

      {/* Config Drawer */}
      <V4_PayrollDetailsConfigDrawer
        open={configDrawerOpen}
        onOpenChange={setConfigDrawerOpen}
        candidate={
          selectedContractor
            ? {
                id: selectedContractor.id,
                name: selectedContractor.name,
                role: selectedContractor.role,
                country: selectedContractor.country,
                countryFlag: selectedContractor.countryFlag,
                salary: selectedContractor.salary,
                startDate: "TBD",
                employmentType: selectedContractor.employmentType || "contractor",
              }
            : null
        }
        onSave={(candidateId) => handleSaveConfig(candidateId)}
      />

      {/* View Details Drawer */}
      <V4_ViewPayrollDetailsDrawer
        open={viewDetailsDrawerOpen}
        onOpenChange={setViewDetailsDrawerOpen}
        contractor={selectedContractor}
      />
    </div>
  );
};

export default V4_PipelineWithPayrollDetails;
