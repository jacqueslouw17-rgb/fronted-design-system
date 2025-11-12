import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClauseTooltip } from "@/components/ClauseTooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Briefcase, Shield, FileText, Handshake, ScrollText } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";
import { ContractCarousel } from "./ContractCarousel";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import { useAgentState } from "@/hooks/useAgentState";
type DocumentType = "employment-agreement" | "contractor-agreement" | "nda" | "nda-policy" | "data-privacy" | "country-compliance";
interface ContractDraftWorkspaceProps {
  candidate: Candidate;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
}
const getContractContent = (candidate: Candidate, documentType: DocumentType) => {
  switch (documentType) {
    case "employment-agreement":
      return [{
        heading: "Employment Agreement",
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
    case "contractor-agreement":
      return [{
        heading: "INDEPENDENT CONTRACTOR AGREEMENT",
        text: ""
      }, {
        heading: "",
        text: `This Independent Contractor Agreement ("Agreement") is entered into between Fronted AS ("Company") and ${candidate.name} ("Contractor").`
      }, {
        heading: "1. SCOPE OF SERVICES",
        text: `Contractor will provide services as ${candidate.role}. Contractor acknowledges they are an independent contractor and not an employee.`
      }, {
        heading: "2. COMPENSATION",
        text: `Contractor will receive ${candidate.salary}, payable in ${candidate.currency} on a monthly basis for services rendered.`
      }, {
        heading: "3. TERM",
        text: `This Agreement commences on ${candidate.startDate} and continues until terminated by either party with ${candidate.noticePeriod} written notice.`
      }, {
        heading: "4. INDEPENDENT CONTRACTOR STATUS",
        text: "Contractor is responsible for all taxes, insurance, and benefits. Company will not withhold taxes or provide employee benefits."
      }, {
        heading: "5. INTELLECTUAL PROPERTY",
        text: "All work product created under this Agreement shall be considered work-made-for-hire and property of the Company."
      }];
    case "country-compliance":
      return [{
        heading: `COUNTRY COMPLIANCE ATTACHMENTS (${candidate.countryCode})`,
        text: ""
      }, {
        heading: "",
        text: `This attachment supplements the Employment Agreement and includes mandatory clauses for ${candidate.country}.`
      }, {
        heading: "1. LOCAL LABOR LAW COMPLIANCE",
        text: `This employment relationship is governed by ${candidate.country} labor laws including regulations on working hours, overtime, holidays, and termination procedures.`
      }, {
        heading: "2. STATUTORY BENEFITS",
        text: `Employee is entitled to all statutory benefits required under ${candidate.country} law, including but not limited to: government-mandated insurance, pension contributions, and statutory leave entitlements.`
      }, {
        heading: "3. MANDATORY CLAUSES",
        text: `In accordance with ${candidate.country} employment regulations, this Agreement includes all mandatory clauses required by local law regarding: workplace safety, anti-discrimination, harassment prevention, and dispute resolution.`
      }, {
        heading: "4. LOCAL LANGUAGE REQUIREMENTS",
        text: `This Agreement has been prepared in English. In accordance with local requirements, a certified translation in the official language of ${candidate.country} shall be provided if required by law.`
      }];
    case "nda":
      return [{
        heading: "NON-DISCLOSURE AGREEMENT",
        text: ""
      }, {
        heading: "",
        text: `This Non-Disclosure Agreement ("Agreement") is made between Fronted AS ("Company") and ${candidate.name} ("Recipient").`
      }, {
        heading: "1. CONFIDENTIAL INFORMATION",
        text: "Recipient acknowledges that during the relationship, they may have access to confidential and proprietary information including but not limited to: trade secrets, business strategies, client lists, technical data, and product designs."
      }, {
        heading: "2. OBLIGATIONS",
        text: "Recipient agrees to: (a) maintain confidentiality of all proprietary information, (b) not disclose such information to third parties, (c) use information solely for authorized purposes, (d) return all materials upon termination."
      }, {
        heading: "3. EXCLUSIONS",
        text: "This Agreement does not apply to information that: (a) is publicly available, (b) was known prior to disclosure, (c) is independently developed, or (d) is required to be disclosed by law."
      }, {
        heading: "4. TERM",
        text: "The obligations under this Agreement shall remain in effect during the relationship and for 3 years following termination."
      }];
    case "nda-policy":
      return [{
        heading: "NDA & COMPANY POLICY ACKNOWLEDGMENT",
        text: ""
      }, {
        heading: "",
        text: `This document serves as acknowledgment by ${candidate.name} of receipt and understanding of Company policies and confidentiality obligations.`
      }, {
        heading: "1. CONFIDENTIALITY AGREEMENT",
        text: "Employee/Contractor agrees to maintain confidentiality of all Company proprietary information, trade secrets, client data, and business strategies. This obligation extends beyond termination of the relationship."
      }, {
        heading: "2. COMPANY POLICIES",
        text: "I acknowledge receipt of and agree to comply with all Company policies including: Code of Conduct, Information Security Policy, Anti-Harassment Policy, and Data Protection Guidelines."
      }, {
        heading: "3. INTELLECTUAL PROPERTY",
        text: "I understand that all work product, inventions, and intellectual property created during my engagement with the Company belongs exclusively to the Company."
      }, {
        heading: "4. POLICY ACKNOWLEDGMENT",
        text: "I confirm that I have read, understood, and agree to abide by all Company policies. I understand that violation of these policies may result in disciplinary action up to and including termination."
      }];
    case "data-privacy":
      return [{
        heading: `DATA PRIVACY ADDENDUM (${candidate.countryCode})`,
        text: ""
      }, {
        heading: "",
        text: `This Data Privacy Addendum supplements the Agreement between Fronted AS ("Company") and ${candidate.name}.`
      }, {
        heading: "1. DATA COLLECTION",
        text: `Company collects and processes personal data in accordance with ${candidate.country} data protection laws, including: contact information, identification documents, banking details, and work records.`
      }, {
        heading: "2. PURPOSE OF PROCESSING",
        text: "Personal data is processed for: administration, payroll processing, compliance with legal obligations, benefits administration, and performance management."
      }, {
        heading: "3. DATA RIGHTS",
        text: "You have the right to: access personal data, request corrections, request deletion (subject to legal requirements), object to processing, and lodge complaints with supervisory authorities."
      }, {
        heading: "4. DATA SECURITY",
        text: "Company implements appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction."
      }, {
        heading: "5. DATA RETENTION",
        text: "Personal data will be retained for the duration of the relationship and as required by law, typically 7 years after termination for tax and employment law purposes."
      }];
  }
};
export const ContractDraftWorkspace: React.FC<ContractDraftWorkspaceProps> = ({
  candidate,
  index,
  total,
  onNext,
  onPrevious
}) => {
  // Determine employment type (default to contractor if not specified)
  const employmentType = candidate.employmentType || "contractor";

  // Define available documents based on employment type
  const getAvailableDocuments = () => {
    if (employmentType === "employee") {
      return [{
        id: "employment-agreement" as DocumentType,
        label: "Employment Agreement",
        icon: FileText,
        shortLabel: "Employment"
      }, {
        id: "country-compliance" as DocumentType,
        label: `Country Compliance (${candidate.countryCode})`,
        icon: Shield,
        shortLabel: "Compliance"
      }, {
        id: "nda-policy" as DocumentType,
        label: "NDA / Policy Docs",
        icon: Handshake,
        shortLabel: "NDA/Policy"
      }];
    } else {
      return [{
        id: "contractor-agreement" as DocumentType,
        label: "Contractor Agreement",
        icon: FileText,
        shortLabel: "Contract"
      }, {
        id: "nda" as DocumentType,
        label: "Non-Disclosure Agreement",
        icon: Handshake,
        shortLabel: "NDA"
      }, {
        id: "data-privacy" as DocumentType,
        label: `Data Privacy (${candidate.countryCode})`,
        icon: ScrollText,
        shortLabel: "Privacy"
      }];
    }
  };
  const documents = getAvailableDocuments();
  const [activeDocument, setActiveDocument] = useState<DocumentType>(documents[0].id);
  const fullContent = getContractContent(candidate, activeDocument);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Reset to first tab when candidate changes
  useEffect(() => {
    setActiveDocument(documents[0].id);
    // Scroll to top when candidate changes
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [candidate.id]);
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
      <AgentHeader title={`Reviewing ${candidate.name.split(' ')[0]}'s Contract for ${candidate.country}`} subtitle="Preview how this contract will appear to the candidate before sending for signature." showPulse={true} isActive={isAgentSpeaking} showInput={false}
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
        {/* Document Bundle Toggle */}
        <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.25,
          duration: 0.3
        }} className="mb-4 flex-shrink-0">
          <div className="flex gap-2 p-1.5 bg-muted/30 rounded-lg border border-border/40">
            {documents.map(doc => {
              const Icon = doc.icon;
              const isActive = activeDocument === doc.id;
              return <button key={doc.id} onClick={() => setActiveDocument(doc.id)} className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md
                    text-sm font-medium transition-all duration-200
                    ${isActive ? 'bg-background text-foreground shadow-sm border border-border/60' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
                  `}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{doc.label}</span>
                  <span className="sm:hidden">{doc.shortLabel}</span>
                </button>;
            })}
          </div>
        </motion.div>

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
          <p className="text-sm text-foreground">We use a verified Fronted template and cannot be edited at this stage. Review details carefully before proceeding.</p>
        </motion.div>

        <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-auto">
          <div className="pr-4 pb-4">
            {/* Static contract display with animation */}
            <AnimatePresence mode="wait">
              <motion.div key={activeDocument} initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20
              }} transition={{
                duration: 0.2
              }}>
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
              </motion.div>
            </AnimatePresence>

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

            <div className={index === 0 ? "" : "flex gap-3"}>
              {index > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                    onPrevious();
                  }} 
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              <Button onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
                onNext();
              }} className={index === 0 ? "w-full" : "flex-1"}>
                {index === total - 1 ? "Review All Drafts" : "Next Draft"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
    </div>;
};