import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, FileText, Shield, Clock, CheckCircle2, Mail, AlertCircle, X } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import type { Candidate } from "@/hooks/useContractFlow";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt";
import { KurtIntroTooltip } from "./KurtIntroTooltip";
import { useAgentState } from "@/hooks/useAgentState";
import { toast } from "sonner";

interface DocumentBundleSignatureProps {
  candidates: Candidate[];
  onSendBundle: () => void;
  onClose?: () => void;
}

type DocumentType = {
  name: string;
  type: string;
  status: "drafted" | "not-sent" | "missing" | "ready";
  action: string;
};

type BundleStatus = "preparing" | "ready" | "sending" | "sent";

export const DocumentBundleSignature: React.FC<DocumentBundleSignatureProps> = ({
  candidates,
  onSendBundle,
  onClose,
}) => {
  const [bundleStatus, setBundleStatus] = useState<BundleStatus>("preparing");
  const [showKurtMessage, setShowKurtMessage] = useState(false);
  const [showIncludeModal, setShowIncludeModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [animateContracts, setAnimateContracts] = useState(false);
  const [signingStatus, setSigningStatus] = useState<Record<string, "pending" | "signed" | "error">>(
    {}
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasWelcomeSpoken, setHasWelcomeSpoken] = useState(false);
  const [isSendingBundle, setIsSendingBundle] = useState(false);
  const { speak, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { setOpen, addMessage, setLoading } = useAgentState();
  
  const subtextMessage = "Review document bundles for each candidate and prepare for signature collection";
  const subtextWords = subtextMessage.split(" ");

  // Handle Kurt action tags
  const handleKurtAction = async (action: string) => {
    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    });

    setOpen(true);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    switch(action) {
      case 'auto-attach':
        const missingDocs = candidates.flatMap(c => 
          getDocumentsForCandidate(c).filter(d => d.status === 'missing')
        );
        
        if (missingDocs.length === 0) {
          addMessage({
            role: 'kurt',
            text: "✅ All Required Documents Attached\n\nAll mandatory documents are already included in the bundles:\n\n✓ Main Contracts\n✓ NDAs & Company Policies\n✓ Compliance Documents\n✓ Country-specific forms\n\nEverything is ready for signature collection!",
          });
        } else {
          addMessage({
            role: 'kurt',
            text: `📎 Auto-Attaching Missing Documents\n\nI found ${missingDocs.length} missing document${missingDocs.length > 1 ? 's' : ''}. Attaching them now:\n\n${missingDocs.map(d => `✓ ${d.name}`).join('\n')}\n\nAll bundles are now complete and ready!`,
            actionButtons: [
              { label: 'Review All Bundles', action: 'check-docs', variant: 'default' },
              { label: 'Send for Signature', action: 'send-bundle', variant: 'outline' },
            ]
          });
          toast.success("Missing documents auto-attached");
        }
        break;
        
      case 'check-docs':
        const totalDocs = candidates.reduce((acc, c) => acc + getDocumentsForCandidate(c).length, 0);
        const readyDocs = candidates.flatMap(c => getDocumentsForCandidate(c)).filter(d => d.status === 'drafted' || d.status === 'ready').length;
        
        addMessage({
          role: 'kurt',
          text: `📋 Bundle Review Complete\n\nI've reviewed all document bundles:\n\n✓ Total Documents: ${totalDocs}\n✓ Ready: ${readyDocs}\n✓ Pending: ${totalDocs - readyDocs}\n\n**Per Candidate:**\n${candidates.map(c => `• ${c.name} (${c.country}): ${getDocumentsForCandidate(c).length} documents`).join('\n')}\n\nAll bundles meet compliance requirements. Ready to send for signatures!`,
          actionButtons: [
            { label: 'Check Compliance', action: 'compliance-review', variant: 'default' },
            { label: 'Send Bundles', action: 'send-bundle', variant: 'outline' },
          ]
        });
        break;
        
      case 'compliance-review':
        const phCandidates = candidates.filter(c => c.countryCode === 'PH');
        
        addMessage({
          role: 'kurt',
          text: `🛡️ Compliance Review Complete\n\nI've verified compliance for all candidates:\n\n✅ **General Compliance:**\n• NDAs & Company Policies included\n• Data Privacy Forms attached\n• Contract templates up-to-date\n\n${phCandidates.length > 0 ? `✅ **Philippines-Specific:**\n• DOLE compliance verified\n• Mandatory government forms included\n• Tax documentation complete\n\n` : ''}All bundles meet regulatory requirements. No compliance issues detected!`,
          actionButtons: [
            { label: 'Send for Signature', action: 'send-bundle', variant: 'default' },
            { label: 'Review Bundles', action: 'check-docs', variant: 'outline' },
          ]
        });
        break;
        
      case 'send-bundle':
        addMessage({
          role: 'kurt',
          text: "📨 Sending Document Bundles\n\nPreparing to send bundles to all candidates for signature...",
        });
        
        setTimeout(() => {
          handleIncludeAll();
          setOpen(false);
        }, 1000);
        break;
        
      default:
        addMessage({
          role: 'kurt',
          text: `I'll help you with "${action}". Let me process that for you.`,
        });
    }

    setLoading(false);
  };

  // Generate document bundles for each candidate
  const getDocumentsForCandidate = (candidate: Candidate): DocumentType[] => {
    const isPhilippines = candidate.countryCode === "PH";
    const isContractor = candidate.employmentType === "contractor";

    if (isContractor) {
      return [
        {
          name: "Main Contract",
          type: `${candidate.countryCode} ${isContractor ? "Contractor" : "Employment"}`,
          status: "drafted",
          action: "Review Document",
        },
        {
          name: "NDA",
          type: "Company Policy",
          status: "not-sent",
          action: "Include",
        },
        {
          name: "Data Privacy Form",
          type: isPhilippines ? "Gov-required" : "Optional",
          status: isPhilippines ? "missing" : "ready",
          action: isPhilippines ? "Add" : "Preview",
        },
        {
          name: "Compliance Docs",
          type: "Auto-generated",
          status: "ready",
          action: "Preview",
        },
      ];
    } else {
      return [
        {
          name: "Main Contract",
          type: `${candidate.countryCode} Employment`,
          status: "drafted",
          action: "Review Document",
        },
        {
          name: "Country Compliance",
          type: "Gov-required",
          status: "ready",
          action: "Preview",
        },
        {
          name: "NDA / Policy",
          type: "Company Policy",
          status: "not-sent",
          action: "Include",
        },
      ];
    }
  };

  // Auto-speak welcome message on mount (match Flow 1 pattern)
  useEffect(() => {
    if (!hasWelcomeSpoken) {
      const timer = setTimeout(() => {
        setHasWelcomeSpoken(true);
        setIsSpeaking(true);
        speak(subtextMessage, () => {
          setIsSpeaking(false);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasWelcomeSpoken, speak, subtextMessage]);

  // Auto-animate contracts on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateContracts(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Show Kurt's message after contracts are visible
  useEffect(() => {
    if (animateContracts) {
      const timer = setTimeout(() => {
        setBundleStatus("ready");
        setShowKurtMessage(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [animateContracts]);

  const handleIncludeAll = () => {
    setBundleStatus("sending");
    
    // Simulate sending bundle
    setTimeout(() => {
      setBundleStatus("sent");
      
      // Initialize signing status for all candidates
      const initialStatus: Record<string, "pending" | "signed" | "error"> = {};
      candidates.forEach(candidate => {
        initialStatus[candidate.id] = "pending";
      });
      setSigningStatus(initialStatus);
      
      // Show signature sent notification
      setTimeout(() => {
        onSendBundle();
      }, 2000);
    }, 1500);
  };

  const getStatusBadge = (status: DocumentType["status"]) => {
    switch (status) {
      case "drafted":
        return (
          <Badge variant="default" className="bg-success/10 text-success">
            ✅ Drafted
          </Badge>
        );
      case "not-sent":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            ⏳ Not Sent
          </Badge>
        );
      case "missing":
        return (
          <Badge variant="destructive" className="bg-destructive/10 text-destructive">
            ⚠️ Missing
          </Badge>
        );
      case "ready":
        return (
          <Badge variant="default" className="bg-success/10 text-success">
            ✅ Ready
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-8">
      {/* Agent Header with Tags */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AgentHeader
          title="Document Bundle & Signature"
          subtitle="Kurt can help with: attaching required docs, checking compliance, or reviewing bundles."
          placeholder="Try: 'Auto-attach' or 'Check documents'..."
          showPulse={true}
          isActive={!hasWelcomeSpoken}
          isMuted={false}
          tags={
            <div className="relative">
              <KurtContextualTags
                flowContext="document-bundle"
                onTagClick={handleKurtAction}
                disabled={false}
              />
              <KurtIntroTooltip context="document-bundle" />
            </div>
          }
        />
      </motion.div>

      {/* Kurt's Initial Message */}
      {animateContracts && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="mt-0.5">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground/80">
              Based on your company policies and compliance requirements, <strong>I've prepared document bundles</strong> for each candidate. 
              {candidates.some(c => c.countryCode === "PH") && " Philippines workers require additional compliance documentation."}
            </p>
          </div>
        </motion.div>
      )}

      {/* Contracts Table */}
      <AnimatePresence>
        {animateContracts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {candidates.map((candidate, candidateIndex) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: candidateIndex * 0.2, duration: 0.4 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-6 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{candidate.flag}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.role} • {candidate.country} • {candidate.employmentType === "contractor" ? "Contractor" : "Employee"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getDocumentsForCandidate(candidate).length} documents
                      </Badge>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDocumentsForCandidate(candidate).map((doc, docIndex) => (
                        <motion.tr
                          key={docIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: candidateIndex * 0.2 + docIndex * 0.1, duration: 0.3 }}
                          className="border-b"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {doc.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (doc.action === "Add" || doc.action === "Include") {
                                  setSelectedCandidate(candidate);
                                  setShowIncludeModal(true);
                                }
                              }}
                            >
                              {doc.action}
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kurt's Confirmation Message */}
      <AnimatePresence>
        {showKurtMessage && bundleStatus === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-foreground/90">
                      Great work! Based on your company policies and{" "}
                      {candidates.map(c => c.country).join(", ")} compliance, <strong>there are mandatory documents to include</strong> with each contract.
                    </p>
                    <p className="text-sm text-foreground/90 font-medium">
                      <strong>Would you like me to attach them all now?</strong>
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={handleIncludeAll}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Yes, include all
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowIncludeModal(true)}
                      >
                        Review docs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sending Status */}
      <AnimatePresence>
        {bundleStatus === "sending" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <AudioWaveVisualizer isActive={true} />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Preparing document bundles...</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-checking compliance and attaching required documents
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {candidates.map((candidate, idx) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>{candidate.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bundle Sent Confirmation */}
      <AnimatePresence>
        {bundleStatus === "sent" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-6 bg-success/5 border-success/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-success mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">All docs bundled ✅</h3>
                    <p className="text-sm text-foreground/80">
                      Ready to send everything for signature?
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => {
                      setIsSendingBundle(true);
                      setTimeout(() => {
                        handleIncludeAll();
                      }, 1500);
                    }}
                    disabled={isSendingBundle}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    {isSendingBundle ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending bundle...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Bundle
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Include Modal */}
      <Dialog open={showIncludeModal} onOpenChange={setShowIncludeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Missing Documents</DialogTitle>
            <DialogDescription>
              Select additional documents to include for {selectedCandidate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedCandidate && getDocumentsForCandidate(selectedCandidate).map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox defaultChecked={doc.status === "ready" || doc.status === "drafted"} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            ))}
            {selectedCandidate?.countryCode === "PH" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Bot className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs text-foreground/80">
                  PH workers require PhilHealth disclosure — I'll add this automatically.
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowIncludeModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => {
              setShowIncludeModal(false);
              handleIncludeAll();
            }} className="flex-1">
              Include Selected
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
