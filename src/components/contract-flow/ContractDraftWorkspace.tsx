import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClauseTooltip } from "@/components/ClauseTooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Briefcase, Shield, FileText } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";
import { ContractCarousel } from "./ContractCarousel";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import { useAgentState } from "@/hooks/useAgentState";
interface ContractDraftWorkspaceProps {
  candidate: Candidate;
  index: number;
  total: number;
  onNext: () => void;
}
const getContractContent = (candidate: Candidate) => {
  return [{
    heading: "EMPLOYMENT AGREEMENT",
    text: ""
  }, {
    heading: "",
    text: `This Employment Agreement ("Agreement") is entered into between Fronted AS ("Company") and ${candidate.name} ("Employee").`
  }, {
    heading: "1. POSITION AND DUTIES",
    text: `Employee will serve as ${candidate.role}, reporting to the Head of Engineering. Employee agrees to perform duties as assigned by the Company.`
  }, {
    heading: "2. COMPENSATION",
    text: `Employee will receive a salary of ${candidate.salary}, payable in ${candidate.currency} on a monthly basis.`
  }, {
    heading: "3. START DATE",
    text: `Employment will commence on ${candidate.startDate}.`
  }, {
    heading: "4. NOTICE PERIOD",
    text: `Either party may terminate this Agreement with ${candidate.noticePeriod} written notice.`
  }, {
    heading: "5. PAID TIME OFF",
    text: `Employee is entitled to ${candidate.pto} of paid time off annually.`
  }, {
    heading: "6. GOVERNING LAW",
    text: `This Agreement shall be governed by the laws of ${candidate.country}.`
  }];
};
export const ContractDraftWorkspace: React.FC<ContractDraftWorkspaceProps> = ({
  candidate,
  index,
  total,
  onNext
}) => {
  const fullContent = getContractContent(candidate);
  const {
    setOpen,
    addMessage,
    isSpeaking: isAgentSpeaking
  } = useAgentState();
  const handleKurtAction = async (action: string) => {
    setOpen(true);
    switch (action) {
      case "quick-summary":
        addMessage({
          role: "kurt",
          text: `📋 **Contract Summary for ${candidate.name}**\n\n**Position:** ${candidate.role}\n**Salary:** ${candidate.salary}\n**Start Date:** ${candidate.startDate}\n**Notice Period:** ${candidate.noticePeriod}\n**PTO:** ${candidate.pto}\n\n**Key Points:**\n• Contract localized for ${candidate.country}\n• All required fields completed\n• Compliance clauses included\n• Ready for review and signature`,
          actionButtons: [{
            label: "Check Fields",
            action: "check-fields",
            variant: "outline"
          }, {
            label: "Export PDF",
            action: "export-pdf",
            variant: "secondary"
          }]
        });
        break;
      case "check-fields":
        addMessage({
          role: "kurt",
          text: `✅ **Field Verification Complete**\n\nAll required fields have been verified:\n• Personal Information ✓\n• Compensation Details ✓\n• Employment Terms ✓\n• Legal Clauses ✓\n\nNo missing or invalid data found. Contract is ready to proceed.`,
          actionButtons: [{
            label: "Fix Clauses",
            action: "fix-clauses",
            variant: "outline"
          }, {
            label: "Generate Summary",
            action: "quick-summary",
            variant: "secondary"
          }]
        });
        break;
      case "fix-clauses":
        addMessage({
          role: "kurt",
          text: `🔧 **Clause Analysis**\n\nI've reviewed the contract clauses for ${candidate.country}:\n\n**Overtime Pay (Clause 6):** Adjusted for local labor laws\n**IP Assignment:** Standard company policy applied\n**Notice Period:** Compliant with ${candidate.country} regulations\n\nAll clauses are optimized and compliant. Would you like me to make any specific adjustments?`,
          actionButtons: [{
            label: "Apply Changes",
            action: "apply-clause-changes",
            variant: "default"
          }, {
            label: "Review Terms",
            action: "explain-term",
            variant: "outline"
          }]
        });
        break;
      case "explain-term":
        addMessage({
          role: "kurt",
          text: `❓ **Legal Term Explanations**\n\nWhich term would you like me to explain? I can help clarify:\n• IP Assignment clauses\n• Notice period requirements\n• Compensation structures\n• PTO policies\n• Termination conditions\n\nJust ask about any specific term in the contract.`,
          actionButtons: [{
            label: "Explain IP Rights",
            action: "explain-ip",
            variant: "outline"
          }, {
            label: "Explain Notice Period",
            action: "explain-notice",
            variant: "outline"
          }]
        });
        break;
      case "apply-clause-changes":
        toast.success("Clause improvements applied to contract");
        addMessage({
          role: "kurt",
          text: `✅ **Changes Applied**\n\nI've updated the contract clauses. All improvements have been saved.`,
          actionButtons: [{
            label: "View Changes",
            action: "show-diff",
            variant: "default"
          }]
        });
        break;
      case "export-pdf":
        toast.success("Exporting contract as PDF...");
        addMessage({
          role: "kurt",
          text: `📄 **PDF Export**\n\nGenerating PDF for ${candidate.name}'s contract...`
        });
        break;
      case "explain-ip":
        addMessage({
          role: "kurt",
          text: `📚 **IP Assignment Clause**\n\nIntellectual Property (IP) assignment means that any work, inventions, or creative output produced during employment automatically belongs to the company.\n\n**Key Points:**\n• Work-related creations are company property\n• Includes code, designs, documentation, and inventions\n• Standard practice in employment contracts\n• Protects company's business interests`,
          actionButtons: [{
            label: "Explain Another Term",
            action: "explain-term",
            variant: "outline"
          }]
        });
        break;
      case "explain-notice":
        addMessage({
          role: "kurt",
          text: `📚 **Notice Period**\n\nThe notice period (${candidate.noticePeriod}) is the advance warning required before employment ends.\n\n**Key Points:**\n• Must be given by either party\n• Allows for transition and handover\n• Compliant with ${candidate.country} labor laws\n• Standard for ${candidate.role} positions`,
          actionButtons: [{
            label: "Explain Another Term",
            action: "explain-term",
            variant: "outline"
          }]
        });
        break;
      case "compare-drafts":
        addMessage({
          role: "kurt",
          text: `📝 **Draft Comparison**\n\nComparing V2 and V3 of ${candidate.name.split(' ')[0]}'s contract:\n\n**Changes Found:**\n• Clause 8 (Overtime): Updated rate from 1.25x to 1.5x\n• Clause 12 (Benefits): Added health insurance coverage\n• Section 4 (Notice Period): Changed from 2 weeks to 30 days\n\nAll other clauses remain unchanged.`,
          actionButtons: [{
            label: "View Full Diff",
            action: "show-diff",
            variant: "outline"
          }]
        });
        break;
      case "show-diff":
        toast.info("Showing full diff view...");
        addMessage({
          role: "kurt",
          text: "Opening detailed diff viewer with side-by-side comparison..."
        });
        break;
      case "ask-kurt":
        addMessage({
          role: "kurt",
          text: `👋 **How can I help?**\n\nI can assist you with:\n• Quick contract summaries\n• Field verification\n• Clause explanations\n• Compliance checks\n• Term clarifications\n\nWhat would you like to know about ${candidate.name.split(' ')[0]}'s contract?`,
          actionButtons: [{
            label: "Quick Summary",
            action: "quick-summary",
            variant: "default"
          }, {
            label: "Check Fields",
            action: "check-fields",
            variant: "outline"
          }]
        });
        break;
      default:
        addMessage({
          role: "kurt",
          text: `Processing: ${action}`
        });
    }
  };

  // Expose handleKurtAction globally so action buttons can call it
  useEffect(() => {
    (window as any).handleKurtAction = handleKurtAction;
    return () => {
      delete (window as any).handleKurtAction;
    };
  }, [candidate, handleKurtAction]);

  // Carousel pages
  const carouselPages = [{
    id: "summary",
    title: "Page 1: Summary & Compensation",
    content: <div className="space-y-4">
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
  }, {
    id: "legal",
    title: "Page 2: Legal & Compliance Clauses",
    content: <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">Overtime Pay</p>
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
  }, {
    id: "signoff",
    title: "Page 3: Sign-off & Signatures",
    content: <div className="space-y-4">
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
            <p className="text-xs text-muted-foreground">Contract ready for signature</p>
          </div>
        </div>
  }];
  return <div className="space-y-6">
      <AgentHeader title={`Reviewing ${candidate.name.split(' ')[0]}'s Contract for ${candidate.country}`} subtitle="Kurt can help with quick summaries or explaining terms." showPulse={true} isActive={isAgentSpeaking} showInput={false}
    // tags={
    //   <KurtContextualTags 
    //     flowContext="contract-workspace" 
    //     onTagClick={action => {
    //       if (action === "ask-kurt") {
    //         setOpen(true);
    //       } else {
    //         handleKurtAction(action);
    //       }
    //     }} 
    //     disabled={false} 
    //   />
    // }
    />
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.3
    }} className="h-full flex gap-4 items-start">
      {/* Left: Candidate card - Fixed height */}
      <motion.div initial={{
        x: -20,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        delay: 0.1,
        duration: 0.3
      }} className="w-80 flex-shrink-0">
        <Card className="p-6 overflow-auto border border-border/40 bg-card/50 backdrop-blur-sm" style={{
          maxHeight: '600px'
        }}>
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

          </div>
        </Card>
      </motion.div>

      {/* Right: Contract editor */}
      <motion.div initial={{
        x: 20,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        delay: 0.2,
        duration: 0.3
      }} className="flex-1 flex flex-col max-h-[600px]">
        {/* Info message */}
        <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3,
          duration: 0.3
        }} className="rounded-lg border border-border bg-muted/30 p-4 mb-4 flex-shrink-0 text-center">
          <p className="text-sm text-foreground">
            This contract uses a verified Fronted template and cannot be edited at this stage. Review details carefully before proceeding.
          </p>
        </motion.div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="pr-4 pb-4">
            {/* Static contract display */}
            <Card className="p-6 mb-4 bg-background border-border">
              <div className="space-y-4 select-none">
                {fullContent.map((section, idx) => <div key={idx}>
                    {section.heading && <h3 className={`${idx === 0 ? 'text-lg font-medium mb-4 text-center' : 'text-sm font-medium mb-2'} text-foreground`}>
                        {section.heading}
                      </h3>}
                    {section.text && <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {section.text}
                      </p>}
                  </div>)}
              </div>
            </Card>

            {/* Carousel navigation */}
            <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }} className="mb-4">
              <ContractCarousel pages={carouselPages} />
            </motion.div>

            <Button onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              onNext();
            }} className="w-full">
              {index === total - 1 ? "Review All Drafts" : "Next Draft"}
            </Button>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
    </div>;
};