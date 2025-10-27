import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { StatusChip } from "./StatusChip";

interface ContractFlowNotificationProps {
  candidates: Candidate[];
  onPrepareDrafts: () => void;
}

export const ContractFlowNotification: React.FC<ContractFlowNotificationProps> = ({
  candidates,
  onPrepareDrafts,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Candidate list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Offers Accepted</h3>
            </div>
            <Badge variant="secondary">{candidates.length}</Badge>
          </div>

          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02, borderColor: "hsl(var(--primary) / 0.3)" }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent"
              >
                <span className="text-2xl">{candidate.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{candidate.name}</p>
                    <StatusChip 
                      type="ready" 
                      label={`${candidate.countryCode} Offer Ready`} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {candidate.role}, {candidate.country}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            className="mt-4"
          >
            <Button
              onClick={onPrepareDrafts}
              data-testid="prepare-drafts"
              className="w-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow"
            >
              Prepare Drafts
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
