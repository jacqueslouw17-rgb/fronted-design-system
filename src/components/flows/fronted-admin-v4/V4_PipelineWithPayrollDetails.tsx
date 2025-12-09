/**
 * V4-specific Pipeline Wrapper
 * 
 * This component wraps the original PipelineView and adds
 * a "Collect Payroll Details" column after the Certified column.
 * Only used in Flow 1 - Fronted Admin Dashboard v4.
 * 
 * Updated: Forces cache refresh
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PipelineView } from "@/components/contract-flow/PipelineView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Settings, Send, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { V4_PayrollDetailsConfigDrawer } from "./V4_PayrollDetailsConfigDrawer";

interface Contractor {
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
  // Payroll details status
  payrollFormStatus?: "not-sent" | "sent" | "in-progress" | "completed";
}

interface V4_PipelineWithPayrollDetailsProps {
  contractors: Contractor[];
  className?: string;
  onContractorUpdate?: (contractors: Contractor[]) => void;
  onDraftContract?: (contractorIds: string[]) => void;
  onSignatureComplete?: () => void;
  onAddCandidate?: () => void;
  onRemoveContractor?: (contractorId: string) => void;
}

export const V4_PipelineWithPayrollDetails: React.FC<V4_PipelineWithPayrollDetailsProps> = ({
  contractors,
  className,
  onContractorUpdate,
  onDraftContract,
  onSignatureComplete,
  onAddCandidate,
  onRemoveContractor,
}) => {
  // State for payroll details column
  const [payrollDetailsContractors, setPayrollDetailsContractors] = useState<Contractor[]>([]);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [selectedForConfig, setSelectedForConfig] = useState<Contractor | null>(null);
  const [sendingFormIds, setSendingFormIds] = useState<Set<string>>(new Set());

  // Filter contractors for the payroll details column (status = "collect-payroll-details")
  const payrollDetailsItems = contractors.filter(
    (c) => c.payrollFormStatus && c.payrollFormStatus !== "completed"
  );

  // Mock: Candidates that are certified but need payroll details
  // In real implementation, this would come from the contractors prop with a specific status
  const certifiedNeedingPayroll = contractors.filter(
    (c) => c.status === "certified" || c.status === "CERTIFIED"
  );

  const handleOpenConfig = (contractor: Contractor) => {
    setSelectedForConfig(contractor);
    setConfigDrawerOpen(true);
  };

  const handleSendPayrollForm = (contractorId: string) => {
    setSendingFormIds((prev) => new Set([...prev, contractorId]));
    
    setTimeout(() => {
      // Update contractor's payroll form status
      toast.success("Payroll details form sent", {
        description: "The candidate will receive an email with the form link.",
      });
      setSendingFormIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });
    }, 800);
  };

  const handleResendPayrollForm = (contractorId: string) => {
    toast.info("Payroll form resent");
  };


  // Render the payroll details column as JSX to inject into pipeline
  const renderPayrollColumn = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex-shrink-0 w-[280px]"
    >
      {/* Column Header - matches PipelineView column header styling */}
      <div className="p-3 rounded-t-lg border-t border-x bg-accent-purple-fill/30 border-accent-purple-outline/20">
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
                    Get bank and payout details so we can run payroll.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {certifiedNeedingPayroll.length}
          </Badge>
        </div>
      </div>

      {/* Column Body - matches PipelineView column body styling */}
      <div className="min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg bg-accent-purple-fill/30 border-accent-purple-outline/20">
        {certifiedNeedingPayroll.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-accent-purple-fill/20 flex items-center justify-center mb-3">
              <Wallet className="h-6 w-6 text-accent-purple-text" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              No payroll details pending
            </h3>
            <p className="text-xs text-muted-foreground">
              Certified candidates needing payroll setup will appear here
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {certifiedNeedingPayroll.map((contractor) => {
              const isSending = sendingFormIds.has(contractor.id);

              return (
                <motion.div
                  key={contractor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    layout: { duration: 0.5, type: "spring" },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                  }}
                >
                  <Card className="hover:shadow-card transition-shadow border border-border/40 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3 space-y-2">
                      {/* Contractor Header */}
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-xs">
                            {contractor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
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

                      {/* Contractor Details */}
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Salary</span>
                          <span className="font-medium text-foreground">
                            {contractor.salary}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium text-foreground">
                            {contractor.country}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7 gap-1 bg-card hover:bg-card/80 hover:text-foreground"
                          onClick={() => handleOpenConfig(contractor)}
                        >
                          <Settings className="h-3 w-3" />
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-7 gap-1 bg-gradient-primary hover:opacity-90"
                          disabled={isSending}
                          onClick={() => {
                            if (contractor.payrollFormStatus === "sent") {
                              handleResendPayrollForm(contractor.id);
                            } else {
                              handleSendPayrollForm(contractor.id);
                            }
                          }}
                        >
                          <Send className="h-3 w-3" />
                          {isSending
                            ? "Sending..."
                            : contractor.payrollFormStatus === "sent"
                            ? "Resend"
                            : "Send Form"}
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

  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-4 min-w-max items-start">
        {/* 
          Original Pipeline - renders with its own overflow-x-auto.
          We render it inline and let it take as much width as needed.
          Since PipelineView uses min-w-max internally, it will expand.
        */}
        <div className="flex-shrink-0 [&>div]:!overflow-visible [&>div]:!pb-0">
          <PipelineView
            contractors={contractors as any}
            onContractorUpdate={onContractorUpdate as any}
            onDraftContract={onDraftContract}
            onSignatureComplete={onSignatureComplete}
            onAddCandidate={onAddCandidate}
            onRemoveContractor={onRemoveContractor}
          />
        </div>

        {/* Collect Payroll Details Column */}
        {renderPayrollColumn()}
      </div>

      {/* Payroll Details Config Drawer */}
      <V4_PayrollDetailsConfigDrawer
        open={configDrawerOpen}
        onOpenChange={setConfigDrawerOpen}
        candidate={
          selectedForConfig
            ? {
                id: selectedForConfig.id,
                name: selectedForConfig.name,
                role: selectedForConfig.role,
                country: selectedForConfig.country,
                countryFlag: selectedForConfig.countryFlag,
                salary: selectedForConfig.salary,
                startDate: "TBD",
                employmentType: selectedForConfig.employmentType || "contractor",
              }
            : null
        }
        onSave={() => {
          toast.success("Payroll form configuration saved");
          setConfigDrawerOpen(false);
        }}
      />
    </div>
  );
};

export default V4_PipelineWithPayrollDetails;
