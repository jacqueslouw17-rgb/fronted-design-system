import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineEditContext } from "@/components/InlineEditContext";
import { ClauseTooltip } from "@/components/ClauseTooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle2, DollarSign, Calendar, Briefcase, Shield } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { ContractCarousel } from "./ContractCarousel";
import { ContextualBadge } from "./ContextualBadge";

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
  const [showCarousel, setShowCarousel] = useState(false);
  const fullContent = getContractContent(candidate);

  useEffect(() => {
    setIsTyping(true);
    setContent("");
    setShowCarousel(false);
    
    // Simulate typing effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullContent.length) {
        setContent(fullContent.slice(0, currentIndex + 1));
        currentIndex += Math.floor(Math.random() * 3) + 1; // Variable speed
      } else {
        setIsTyping(false);
        setShowCarousel(true);
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [candidate.id, fullContent]);

  // Carousel pages
  const carouselPages = [
    {
      id: "summary",
      title: "Page 1: Summary & Compensation",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-sm font-medium text-foreground">{candidate.role}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="text-sm font-medium text-foreground">{candidate.salary}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium text-foreground">{candidate.startDate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">PTO</p>
              <p className="text-sm font-medium text-foreground">{candidate.pto}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Benefits Package</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Briefcase className="h-3 w-3 text-primary" />
                <span className="text-foreground">Standard health coverage</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-foreground">Professional development budget</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "legal",
      title: "Page 2: Legal & Compliance Clauses",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-foreground">Clause 6: Overtime Pay</p>
                <ContextualBadge
                  text="AI Context"
                  explanation={`Overtime pay adjusted for ${candidate.country}. Want to sync this across NO/XK for parity?`}
                  onApplyGlobally={() => console.log("Apply globally")}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Overtime compensation follows {candidate.country} labor law standards.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">IP Assignment</p>
              <p className="text-xs text-muted-foreground">
                All intellectual property created during employment belongs to the company.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">Notice Period</p>
              <p className="text-xs text-muted-foreground">
                {candidate.noticePeriod} notice required as per local regulations.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "signoff",
      title: "Page 3: Sign-off & Signatures",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-foreground mb-2">Employer Signature</p>
            <div className="h-16 border-b-2 border-dashed border-border mb-2 flex items-end pb-2">
              <span className="text-sm italic text-muted-foreground">Company Representative</span>
            </div>
            <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-foreground mb-2">Employee Signature</p>
            <div className="h-16 border-b-2 border-dashed border-border mb-2 flex items-end pb-2">
              <span className="text-sm italic text-muted-foreground">{candidate.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">To be signed via: {candidate.signingPortal}</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
            <FileText className="h-4 w-4 text-success" />
            <p className="text-xs text-muted-foreground">
              Contract ready for review and signature
            </p>
          </div>
        </div>
      ),
    },
  ];

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

        {/* Genie message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4 mb-4"
        >
          <p className="text-sm text-foreground">
            Pulling {candidate.countryCode} standard contract and adapting for NO and XK using mini-rule inheritance. You can edit inline or review per page.
          </p>
        </motion.div>

        <ScrollArea className="flex-1 mb-4 max-h-[600px]">
          <div className="pr-4">
            <InlineEditContext
              content={content}
              className="min-h-[400px] mb-4"
            />

            {/* Carousel navigation appears after typing */}
            {showCarousel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ContractCarousel pages={carouselPages} />
              </motion.div>
            )}
          </div>
        </ScrollArea>

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
