import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineEditContext } from "@/components/InlineEditContext";
import { ClauseTooltip } from "@/components/ClauseTooltip";
import { FileText, CheckCircle2 } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface ContractDraftWorkspaceProps {
  candidate: Candidate;
  index: number;
  total: number;
  onNext: () => void;
}

const getContractContent = (candidate: Candidate) => {
  return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into between Fronted AS ("Company") and ${candidate.name} ("Employee").

1. POSITION AND DUTIES
Employee will serve as ${candidate.role}, reporting to the Head of Engineering. Employee agrees to perform duties as assigned by the Company.

2. COMPENSATION
Employee will receive a salary of ${candidate.salary}, payable in ${candidate.currency} on a monthly basis.

3. START DATE
Employment will commence on ${candidate.startDate}.

4. NOTICE PERIOD
Either party may terminate this Agreement with ${candidate.noticePeriod} written notice.

5. PAID TIME OFF
Employee is entitled to ${candidate.pto} of paid time off annually.

6. GOVERNING LAW
This Agreement shall be governed by the laws of ${candidate.country}.`;
};

export const ContractDraftWorkspace: React.FC<ContractDraftWorkspaceProps> = ({
  candidate,
  index,
  total,
  onNext,
}) => {
  const [isTyping, setIsTyping] = useState(true);
  const [content, setContent] = useState("");
  const fullContent = getContractContent(candidate);

  useEffect(() => {
    setIsTyping(true);
    setContent("");
    
    // Simulate typing effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullContent.length) {
        setContent(fullContent.slice(0, currentIndex + 1));
        currentIndex += Math.floor(Math.random() * 3) + 1; // Variable speed
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [candidate.id, fullContent]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex gap-4"
    >
      {/* Left: Candidate card */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-80 flex-shrink-0"
      >
        <Card className="p-6 h-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{candidate.flag}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">{candidate.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground">Template</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                Localized – {candidate.countryCode} {candidate.flag}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium text-foreground">{candidate.salary}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium text-foreground">{candidate.startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Notice Period</span>
                <span className="font-medium text-foreground">{candidate.noticePeriod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PTO</span>
                <span className="font-medium text-foreground">{candidate.pto}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Key Clauses</p>
              <div className="space-y-2">
                <ClauseTooltip
                  clauseNumber="2"
                  title="Compensation Structure"
                  explanation={`Salary is set in ${candidate.currency} to comply with local banking regulations.`}
                />
                <ClauseTooltip
                  clauseNumber="4"
                  title="Termination Notice"
                  explanation={`${candidate.noticePeriod} notice period aligns with ${candidate.country} labor law.`}
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                {isTyping ? (
                  <>
                    <span className="animate-pulse">Generating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Draft ready
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Right: Contract editor */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Contract Draft</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {index + 1} of {total}
          </span>
        </div>

        <div className="flex-1 mb-4">
          <InlineEditContext
            content={content}
            className="h-full overflow-y-auto"
          />
        </div>

        <Button
          onClick={onNext}
          disabled={isTyping}
          className="w-full"
        >
          {index === total - 1 ? "Review All Drafts" : "Next Draft"}
        </Button>
      </motion.div>
    </motion.div>
  );
};
