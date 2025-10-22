import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PackageOpen, FileCheck, Home } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

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
  const message = "All three contracts are finalized, Joe. Your new hires are officially onboarded and ready. Shall I send welcome packs or sync compliance logs next?";
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

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contracts Finalized</h3>
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
              >
                <span className="text-2xl">{candidate.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {candidate.role} • Starts {candidate.startDate}
                  </p>
                </div>
                <FileCheck className="h-5 w-5 text-success" />
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="flex gap-3"
      >
        <Button
          onClick={onSendWelcomePacks}
          variant="outline"
          className="flex-1"
        >
          <PackageOpen className="h-4 w-4 mr-2" />
          Send Welcome Packs
        </Button>
        <Button
          onClick={onSyncLogs}
          variant="outline"
          className="flex-1"
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Sync Logs
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
