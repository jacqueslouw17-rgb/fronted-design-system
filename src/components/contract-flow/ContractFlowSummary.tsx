import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PackageOpen, FileCheck, Home } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { CertificateCard } from "./CertificateCard";
import { useToast } from "@/hooks/use-toast";

interface ContractFlowSummaryProps {
  candidates: Candidate[];
  onSendWelcomePacks: () => void;
  onSyncLogs: () => void;
  onOpenDashboard: () => void;
}

export const ContractFlowSummary: React.FC<ContractFlowSummaryProps> = ({
  candidates,
  onSendWelcomePacks,
  onSyncLogs,
  onOpenDashboard,
}) => {
  const { toast } = useToast();
  const [selectedCertificate, setSelectedCertificate] = useState<Candidate | null>(null);
  const [welcomePacksSent, setWelcomePacksSent] = useState(false);
  const [logsSynced, setLogsSynced] = useState(false);
  
  const message = "✨ Contracts complete. Payroll flow unlocked. All signatures received. Certificates ready — stored under Contracts > Certificates of Contract.";
  const words = message.split(' ');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 150); // 150ms per word
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, words.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Kurt's message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-6"
      >
        <p className="text-base">
          {words.map((word, index) => (
            <span
              key={index}
              className={`transition-colors duration-150 ${
                index < currentWordIndex
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {word}{index < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </motion.div>

      {/* Onboarding Checklist Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="rounded-lg border border-primary/20 bg-primary/5 p-4"
      >
        <p className="text-sm text-foreground mb-3">
          💼 Shall I start their onboarding checklist now?
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="default">Yes, Start Onboarding</Button>
          <Button size="sm" variant="outline">Later</Button>
        </div>
      </motion.div>

      {/* Certificate cards with hover actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Certificates of Contract</h3>
        <div className="grid grid-cols-3 gap-4">
          {candidates.map((candidate, index) => (
            <CertificateCard
              key={candidate.id}
              candidate={candidate}
              index={index}
              onView={() => setSelectedCertificate(candidate)}
              onGeneratePayslip={() => 
                toast({ 
                  title: "Payslip Generated", 
                  description: `Payslip for ${candidate.name} is ready` 
                })
              }
              onAttachPolicy={() => 
                toast({ 
                  title: "Policy Attached", 
                  description: `Benefit policy attached to ${candidate.name}'s contract` 
                })
              }
            />
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="flex gap-3"
      >
        <Button
          onClick={() => {
            setWelcomePacksSent(true);
            onSendWelcomePacks();
          }}
          variant="outline"
          className="flex-1"
          disabled={welcomePacksSent}
        >
          <PackageOpen className="h-4 w-4 mr-2" />
          {welcomePacksSent ? "Welcome Packs Sent" : "Send Welcome Packs"}
        </Button>
        <Button
          onClick={() => {
            setLogsSynced(true);
            onSyncLogs();
          }}
          variant="outline"
          className="flex-1"
          disabled={logsSynced}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          {logsSynced ? "Logs Synced" : "Sync Logs"}
        </Button>
        <Button
          onClick={onOpenDashboard}
          className="flex-1 bg-gradient-to-r from-primary to-secondary"
        >
          <Home className="h-4 w-4 mr-2" />
          Open Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
};
