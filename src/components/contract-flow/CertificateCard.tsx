import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Briefcase } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface CertificateCardProps {
  candidate: Candidate;
  index: number;
  onView: () => void;
  onGeneratePayslip?: () => void;
  onAttachPolicy?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  candidate,
  index,
  onView,
  onGeneratePayslip,
  onAttachPolicy,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.5 + index * 0.15,
        duration: 0.6,
        type: "spring",
        bounce: 0.4,
      }}
    >
      <Card className="p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{candidate.flag}</span>
                  <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
            <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
              Certified
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Certificate of Contract • {candidate.country}</span>
          </div>

          {/* Hover mini-actions */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-3 border-t border-border space-y-2"
          >
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={onView}
            >
              <Eye className="h-3 w-3 mr-2" />
              View Contract
            </Button>
            {onGeneratePayslip && (
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={onGeneratePayslip}
              >
                <FileText className="h-3 w-3 mr-2" />
                Generate Payslip
              </Button>
            )}
            {onAttachPolicy && (
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={onAttachPolicy}
              >
                <Briefcase className="h-3 w-3 mr-2" />
                Attach Benefit Policy
              </Button>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
