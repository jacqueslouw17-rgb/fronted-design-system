import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Eye, Send, Settings, FileEdit, FileText, FileSignature, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OnboardingFormDrawer } from "./OnboardingFormDrawer";
import { DocumentBundleDrawer } from "./DocumentBundleDrawer";
import { SignatureWorkflowDrawer } from "./SignatureWorkflowDrawer";
import type { Candidate } from "@/hooks/useContractFlow";
import { getChecklistForProfile, type ChecklistRequirement } from "@/data/candidateChecklistData";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "trigger-onboarding" | "onboarding-pending" | "certified";
  formSent?: boolean;
  dataReceived?: boolean;
  employmentType?: "contractor" | "employee";
  checklist?: ChecklistRequirement[];
  checklistProgress?: number;
  isTransitioning?: boolean;
}

interface PipelineViewProps {
  contractors: Contractor[];
  className?: string;
  onContractorUpdate?: (contractors: Contractor[]) => void;
  onDraftContract?: (contractorIds: string[]) => void;
  onSignatureComplete?: () => void;
}

const statusConfig = {
  "offer-accepted": {
    label: "Offer Accepted",
    color: "bg-muted/50 border-border",
    badgeColor: "bg-muted text-muted-foreground",
  },
  "data-pending": {
    label: "Data Collection Pending",
    color: "bg-accent-yellow-fill/30 border-accent-yellow-outline/20",
    badgeColor: "bg-accent-yellow-fill text-accent-yellow-text border-accent-yellow-outline/30",
  },
  "drafting": {
    label: "Contract Drafting",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
  },
  "awaiting-signature": {
    label: "Awaiting Signature",
    color: "bg-accent-purple-fill/30 border-accent-purple-outline/20",
    badgeColor: "bg-accent-purple-fill text-accent-purple-text border-accent-purple-outline/30",
  },
  "trigger-onboarding": {
    label: "Trigger Onboarding",
    color: "bg-primary/10 border-primary/20",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
  },
  "onboarding-pending": {
    label: "In Onboarding",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
    tooltip: "Candidate is completing onboarding requirements",
  },
  "certified": {
    label: "Certified ✅",
    color: "bg-accent-green-fill/30 border-accent-green-outline/20",
    badgeColor: "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
  },
};

const columns = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "trigger-onboarding",
  "onboarding-pending",
  "certified",
] as const;

export const PipelineView: React.FC<PipelineViewProps> = ({ 
  contractors: initialContractors, 
  className,
  onContractorUpdate,
  onDraftContract,
  onSignatureComplete,
}) => {
  const [contractors, setContractors] = useState<Contractor[]>(initialContractors);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [configureDrawerOpen, setConfigureDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
  const [selectedForDocuments, setSelectedForDocuments] = useState<Candidate | null>(null);
  const [signatureDrawerOpen, setSignatureDrawerOpen] = useState(false);
  const [selectedForSignature, setSelectedForSignature] = useState<Candidate | null>(null);
  const [transitioningIds, setTransitioningIds] = useState<Set<string>>(new Set());
  const [sendingFormIds, setSendingFormIds] = useState<Set<string>>(new Set());
  const [signingTransitionIds, setSigningTransitionIds] = useState<Set<string>>(new Set());
  
  // Handle smooth transitions between statuses
  React.useEffect(() => {
    const newContractors = initialContractors.filter(c => !contractors.find(existing => existing.id === c.id));
    
    // Check for drafting -> awaiting-signature transitions
    const draftingTransitions = initialContractors.filter(initial => {
      const existing = contractors.find(c => c.id === initial.id);
      return existing && existing.status === "drafting" && initial.status === "awaiting-signature";
    });

    // Check for awaiting-signature -> trigger-onboarding transitions
    const signingTransitions = initialContractors.filter(initial => {
      const existing = contractors.find(c => c.id === initial.id);
      return existing && existing.status === "awaiting-signature" && initial.status === "trigger-onboarding";
    });

    if (draftingTransitions.length > 0) {
      // Mark contractors as transitioning and keep them in drafting status temporarily
      const idsToTransition = new Set(draftingTransitions.map(c => c.id));
      setTransitioningIds(idsToTransition);
      
      // After brief delay, show loading state
      setTimeout(() => {
        // After another delay, complete the transition
        setTimeout(() => {
          setContractors(initialContractors);
          setTransitioningIds(new Set());
        }, 1200);
      }, 800);
    } else if (signingTransitions.length > 0) {
      // Mark contractors as transitioning from signing
      const idsToTransition = new Set(signingTransitions.map(c => c.id));
      setSigningTransitionIds(idsToTransition);
      
      // After brief delay, show loading state
      setTimeout(() => {
        // After another delay, complete the transition
        setTimeout(() => {
          setContractors(initialContractors);
          setSigningTransitionIds(new Set());
        }, 1200);
      }, 800);
    } else {
      setContractors(initialContractors);
    }
  }, [initialContractors]);
  
  // Auto-progression animation for onboarding checklists
  React.useEffect(() => {
    const contractorsToProgress = contractors.filter(
      c => c.status === "onboarding-pending" && 
           c.checklist && 
           c.checklist.some(item => item.status !== "verified")
    );

    if (contractorsToProgress.length === 0) return;

    // Process one contractor's next item every 2.5 seconds
    const timer = setTimeout(() => {
      setContractors(current => {
        return current.map(contractor => {
          if (contractor.status !== "onboarding-pending" || !contractor.checklist) {
            return contractor;
          }

          // Find next item to process (skip already verified ones)
          const nextItemIndex = contractor.checklist.findIndex(
            item => item.status !== "verified"
          );

          if (nextItemIndex === -1) return contractor;

          const nextItem = contractor.checklist[nextItemIndex];

          // If item is in 'todo' or not yet processing, set to 'pending_review' (spinner)
          // If item is already 'pending_review', complete it to 'verified'
          const updatedChecklist = contractor.checklist.map((item, idx) => {
            if (idx !== nextItemIndex) return item;
            
            if (item.status === "todo") {
              return { ...item, status: "pending_review" as const };
            } else if (item.status === "pending_review") {
              return { ...item, status: "verified" as const };
            }
            return item;
          });

          // Calculate new progress
          const completed = updatedChecklist.filter(r => r.status === 'verified').length;
          const total = updatedChecklist.filter(r => r.required).length;
          const progress = Math.round((completed / total) * 100);

          return {
            ...contractor,
            checklist: updatedChecklist,
            checklistProgress: progress
          };
        });
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [contractors]);

  // Monitor onboarding progress and auto-complete when 100%
  React.useEffect(() => {
    const completedContractors = contractors.filter(
      c => c.status === "onboarding-pending" && c.checklistProgress === 100
    );

    if (completedContractors.length > 0) {
      // Then move to certified after brief delay
      setTimeout(() => {
        const updated = contractors.map(c => 
          completedContractors.some(cc => cc.id === c.id)
            ? { ...c, status: "certified" as const }
            : c
        );
        
        setContractors(updated);
        onContractorUpdate?.(updated);

        // Show Genie celebration message after moving to certified
        setTimeout(() => {
          completedContractors.forEach((contractor) => {
            toast.success(`🎉 ${contractor.name.split(' ')[0]} is fully certified and payroll-ready!`, {
              duration: 5000,
            });
          });
        }, 500);
      }, 1500);
    }
  }, [contractors, onContractorUpdate]);
  
  const getContractorsByStatus = (status: typeof columns[number]) => {
    // Include transitioning contractors in drafting column
    if (status === "drafting") {
      return contractors.filter((c) => c.status === status || transitioningIds.has(c.id));
    }
    // Handle awaiting-signature with both transition types
    if (status === "awaiting-signature") {
      return contractors.filter((c) => 
        (c.status === status || signingTransitionIds.has(c.id)) && 
        !transitioningIds.has(c.id)
      );
    }
    // Exclude signing-transitioning contractors from trigger-onboarding until transition completes
    if (status === "trigger-onboarding") {
      return contractors.filter((c) => c.status === status && !signingTransitionIds.has(c.id));
    }
    return contractors.filter((c) => c.status === status);
  };

  const handleOpenConfigure = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setConfigureDrawerOpen(true);
  };

  const handleOpenDocumentBundle = (contractor: Contractor) => {
    // Convert Contractor to Candidate format
    const candidate: Candidate = {
      id: contractor.id,
      name: contractor.name,
      role: contractor.role,
      country: contractor.country,
      countryCode: contractor.country === "Philippines" ? "PH" : "NO",
      flag: contractor.countryFlag,
      salary: contractor.salary,
      currency: contractor.salary.includes("PHP") ? "PHP" : "NOK",
      startDate: "TBD",
      noticePeriod: "30 days",
      pto: "15 days",
      employmentType: "contractor",
      signingPortal: "",
      status: "Hired",
    };
    setSelectedForDocuments(candidate);
    setDocumentDrawerOpen(true);
  };

  const handleOpenSignatureWorkflow = (contractor: Contractor) => {
    // Convert Contractor to Candidate format
    const candidate: Candidate = {
      id: contractor.id,
      name: contractor.name,
      role: contractor.role,
      country: contractor.country,
      countryCode: contractor.country === "Philippines" ? "PH" : "NO",
      flag: contractor.countryFlag,
      salary: contractor.salary,
      currency: contractor.salary.includes("PHP") ? "PHP" : "NOK",
      startDate: "TBD",
      noticePeriod: "30 days",
      pto: "15 days",
      employmentType: "contractor",
      signingPortal: "",
      status: "Hired",
    };
    setSelectedForSignature(candidate);
    setSignatureDrawerOpen(true);
  };

  const handleSignatureComplete = () => {
    // Move the contractor who was signing to trigger-onboarding
    // The useEffect will handle the smooth transition animation
    if (selectedForSignature) {
      const updated = contractors.map(c => 
        c.id === selectedForSignature.id 
          ? { ...c, status: "trigger-onboarding" as const }
          : c
      );
      setContractors(updated);
      onContractorUpdate?.(updated);
    }
    
    onSignatureComplete?.();
    setSignatureDrawerOpen(false);
  };

  const handleStartOnboarding = (contractor: Contractor) => {
    // Get country code for checklist
    const countryCode = contractor.country === "Philippines" ? "PH" : 
                       contractor.country === "Norway" ? "NO" : "XK";
    
    // Get employment type (default to contractor if not set)
    const employmentType = contractor.employmentType || "contractor";
    
    // Get checklist for this profile
    const checklistProfile = getChecklistForProfile(countryCode, employmentType === "contractor" ? "Contractor" : "Employee");
    
    if (!checklistProfile) {
      toast.error("Could not load checklist for this profile");
      return;
    }

    // Calculate initial progress
    const completed = checklistProfile.requirements.filter(r => r.status === 'verified').length;
    const total = checklistProfile.requirements.filter(r => r.required).length;
    const progress = Math.round((completed / total) * 100);

    // Move to onboarding-pending with checklist
    const updated = contractors.map(c => 
      c.id === contractor.id 
        ? { 
            ...c, 
            status: "onboarding-pending" as const,
            checklist: checklistProfile.requirements,
            checklistProgress: progress
          }
        : c
    );
    
    setContractors(updated);
    onContractorUpdate?.(updated);

    // Show success toast
    toast.success("✅ Onboarding checklist started", {
      description: `Magic-link email sent to ${contractor.name.split(' ')[0]}`
    });

    // Simulate Genie message (this would integrate with your Genie system)
    setTimeout(() => {
      toast.info(`Great! I'm preparing ${contractor.name.split(' ')[0]}'s onboarding checklist. I'll notify you when it's completed.`, {
        duration: 5000,
      });
    }, 1000);
  };

  const getChecklistStatusBadge = (status: ChecklistRequirement['status']) => {
    switch (status) {
      case 'verified':
        return { color: 'bg-accent-green-fill text-accent-green-text border-accent-green-outline/30', icon: CheckCircle2 };
      case 'pending_review':
        return { color: 'bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30', icon: Loader2 };
      case 'todo':
        return { color: 'bg-accent-yellow-fill text-accent-yellow-text border-accent-yellow-outline/30', icon: AlertCircle };
      default:
        return { color: 'bg-muted text-muted-foreground', icon: AlertCircle };
    }
  };

  const handleSelectAll = (status: typeof columns[number], checked: boolean) => {
    const statusContractors = getContractorsByStatus(status);
    const newSelected = new Set(selectedIds);
    
    if (checked) {
      statusContractors.forEach(c => newSelected.add(c.id));
    } else {
      statusContractors.forEach(c => newSelected.delete(c.id));
    }
    
    setSelectedIds(newSelected);
  };

  const handleSelectContractor = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSendForm = (contractorId: string) => {
    setSendingFormIds(prev => new Set([...prev, contractorId]));
    
    setTimeout(() => {
      const updated = contractors.map(c => 
        c.id === contractorId 
          ? { ...c, status: "data-pending" as const, formSent: true }
          : c
      );
      setContractors(updated);
      onContractorUpdate?.(updated);
      setSendingFormIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contractorId);
        return newSet;
      });
      
      const contractor = contractors.find(c => c.id === contractorId);
      toast.success(`Form sent to ${contractor?.name}`);
    }, 800);
  };

  const handleBulkSendForms = () => {
    const selectedInOfferAccepted = contractors.filter(
      c => selectedIds.has(c.id) && c.status === "offer-accepted"
    );
    
    const updated = contractors.map(c => 
      selectedIds.has(c.id) && c.status === "offer-accepted"
        ? { ...c, status: "data-pending" as const, formSent: true }
        : c
    );
    
    setContractors(updated);
    onContractorUpdate?.(updated);
    setSelectedIds(new Set());
    
    toast.success(`Forms sent to ${selectedInOfferAccepted.length} candidates`);
  };

  const handleMarkDataReceived = (contractorId: string) => {
    const updated = contractors.map(c => 
      c.id === contractorId 
        ? { ...c, status: "drafting" as const, dataReceived: true }
        : c
    );
    setContractors(updated);
    onContractorUpdate?.(updated);
    
    const contractor = contractors.find(c => c.id === contractorId);
    toast.success(`${contractor?.name} is ready for contract drafting`);
  };

  const handleFormSubmitted = (contractorId: string) => {
    // Simulate candidate submitting the form - auto-move to drafting
    handleMarkDataReceived(contractorId);
  };

  const handleDraftContract = (contractorIds: string[]) => {
    onDraftContract?.(contractorIds);
  };

  const handleBulkDraft = () => {
    const selectedInDrafting = Array.from(selectedIds).filter(id => 
      contractors.find(c => c.id === id && c.status === "drafting")
    );
    
    if (selectedInDrafting.length > 0) {
      handleDraftContract(selectedInDrafting);
      setSelectedIds(new Set());
    }
  };

  const handleBulkStartOnboarding = () => {
    const selectedForOnboarding = contractors.filter(
      c => selectedIds.has(c.id) && c.status === "trigger-onboarding"
    );
    
    if (selectedForOnboarding.length === 0) return;

    // Start onboarding for each selected contractor
    selectedForOnboarding.forEach((contractor) => {
      handleStartOnboarding(contractor);
    });
    
    // Clear selection
    setSelectedIds(new Set());
    
    // Show bulk success toast
    toast.success(`✅ Started onboarding for ${selectedForOnboarding.length} candidates`, {
      duration: 4000,
    });
  };

  // Check if all contractors in a status are selected
  const areAllSelected = (status: typeof columns[number]) => {
    const statusContractors = getContractorsByStatus(status);
    return statusContractors.length > 0 && statusContractors.every(c => selectedIds.has(c.id));
  };

  // Get count of selected in a status
  const getSelectedCount = (status: typeof columns[number]) => {
    return getContractorsByStatus(status).filter(c => selectedIds.has(c.id)).length;
  };

  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-4 min-w-max">
        {columns.map((status) => {
          const config = statusConfig[status];
          const items = getContractorsByStatus(status);

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 w-[280px]"
            >
              {/* Column Header */}
              <div className={cn(
                "p-3 rounded-t-lg border-t border-x",
                config.color
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {/* Select All for all columns */}
                    {items.length > 0 && (
                      <Checkbox
                        checked={areAllSelected(status)}
                        onCheckedChange={(checked) => handleSelectAll(status, checked as boolean)}
                        className="h-4 w-4"
                      />
                    )}
                    <h3 className="font-medium text-sm text-foreground">
                      {config.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSelectedCount(status) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {getSelectedCount(status)} selected
                      </span>
                    )}
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {items.length}
                    </Badge>
                  </div>
                </div>
                
                {/* Bulk Actions */}
                {status === "offer-accepted" && getSelectedCount(status) > 0 && (
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-7"
                      onClick={handleBulkSendForms}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send Forms ({getSelectedCount(status)})
                    </Button>
                  </div>
                )}
                
                {status === "drafting" && getSelectedCount(status) > 0 && (
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-7"
                      onClick={handleBulkDraft}
                    >
                      <FileEdit className="h-3 w-3 mr-1" />
                      Draft Contracts ({getSelectedCount(status)})
                    </Button>
                  </div>
                )}
                
                {status === "trigger-onboarding" && getSelectedCount(status) > 0 && (
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-7 bg-gradient-primary"
                      onClick={handleBulkStartOnboarding}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Start All ({getSelectedCount(status)})
                    </Button>
                  </div>
                )}
              </div>

              {/* Column Body */}
              <div className={cn(
                "min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg",
                config.color
              )}>
                <AnimatePresence mode="popLayout">
                  {items.map((contractor, index) => (
                    <motion.div
                      key={contractor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        layout: { duration: 0.5, type: "spring" },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 }
                      }}
                    >
                    <Card className="hover:shadow-card transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        {/* Contractor Header with Checkbox */}
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedIds.has(contractor.id)}
                            onCheckedChange={(checked) => handleSelectContractor(contractor.id, checked as boolean)}
                            className="h-4 w-4 mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Avatar className="h-8 w-8 bg-primary/10">
                            <AvatarFallback className="text-xs">
                              {contractor.name.split(' ').map(n => n[0]).join('')}
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

                          {/* Details */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Salary</span>
                              <span className="font-medium text-foreground">{contractor.salary}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Country</span>
                              <span className="font-medium text-foreground">{contractor.country}</span>
                            </div>
                          </div>

                          {/* Action Buttons based on status */}
                          {status === "offer-accepted" && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenConfigure(contractor);
                                }}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Configure
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                disabled={sendingFormIds.has(contractor.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendForm(contractor.id);
                                }}
                              >
                                {sendingFormIds.has(contractor.id) ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3 w-3 mr-1" />
                                    Send Form
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {status === "data-pending" && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenConfigure(contractor);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Form
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(`Resending form to ${contractor.name}`);
                                }}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Resend
                              </Button>
                            </div>
                          )}

                          {status === "drafting" && (
                            <div className="pt-2">
                              <Button 
                                size="sm" 
                                className="w-full text-xs h-8"
                                disabled={transitioningIds.has(contractor.id)}
                                data-testid={`draft-contract-${contractor.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDraftContract([contractor.id]);
                                }}
                              >
                                {transitioningIds.has(contractor.id) ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <FileEdit className="h-3 w-3 mr-1" />
                                    Draft Contract
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {status === "awaiting-signature" && (
                            <div className="pt-2">
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="w-full text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenSignatureWorkflow(contractor);
                                }}
                              >
                                <FileSignature className="h-3 w-3 mr-1" />
                                View Signatures
                              </Button>
                            </div>
                          )}

                          {/* Onboarding Trigger - Special Card */}
                          {status === "trigger-onboarding" && (
                            <div className="pt-2 space-y-2">
                              <div className="text-xs text-foreground/80 bg-primary/5 p-2 rounded border border-primary/10">
                                Would you like me to start their onboarding checklist?
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 text-xs h-8 bg-gradient-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartOnboarding(contractor);
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Yes, Start
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm" 
                                  className="flex-1 text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("You can start onboarding anytime");
                                  }}
                                >
                                  Later
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Onboarding Progress Display */}
                          {status === "onboarding-pending" && contractor.checklist && (
                            <div className="pt-2 space-y-2">
                              {/* Progress Bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-semibold text-foreground">{contractor.checklistProgress || 0}%</span>
                                </div>
                                <Progress value={contractor.checklistProgress || 0} className="h-1.5" />
                              </div>

                              {/* Top 3 Checklist Items */}
                              <div className="space-y-1.5">
                                {contractor.checklist.slice(0, 3).map((item) => {
                                  const badge = getChecklistStatusBadge(item.status);
                                  const Icon = badge.icon;
                                  const isProcessing = item.status === 'pending_review';
                                  return (
                                    <motion.div 
                                      key={item.id} 
                                      className="flex items-start gap-1.5 text-xs"
                                      animate={isProcessing ? { scale: [1, 1.02, 1] } : {}}
                                      transition={{ duration: 0.5, repeat: Infinity }}
                                    >
                                      <Icon className={cn("h-3 w-3 flex-shrink-0 mt-0.5", 
                                        item.status === 'verified' && "text-accent-green-text",
                                        item.status === 'pending_review' && "text-accent-blue-text animate-spin",
                                        item.status === 'todo' && "text-accent-yellow-text"
                                      )} />
                                      <span className={cn(
                                        "truncate leading-tight",
                                        item.status === 'verified' && "text-foreground/80",
                                        item.status === 'pending_review' && "text-foreground font-medium",
                                        item.status === 'todo' && "text-foreground/60"
                                      )}>{item.label}</span>
                                    </motion.div>
                                  );
                                })}
                                {contractor.checklist.length > 3 && (
                                  <div className="text-xs text-muted-foreground italic">
                                    +{contractor.checklist.length - 3} more items...
                                  </div>
                                )}
                              </div>

                              {/* Badge: Checklist in Progress */}
                              <Badge 
                                variant="outline" 
                                className="w-full justify-center text-xs bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30"
                              >
                                📋 Checklist in Progress
                              </Badge>
                            </div>
                          )}

                          {/* Status Badge for certified */}
                          {status === "certified" && (
                            <Badge 
                              variant="outline" 
                              className={cn("w-full justify-center text-xs", config.badgeColor)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configuration Drawer */}
      <OnboardingFormDrawer
        open={configureDrawerOpen}
        onOpenChange={setConfigureDrawerOpen}
        candidate={selectedContractor ? {
          id: selectedContractor.id,
          name: selectedContractor.name,
          role: selectedContractor.role,
          country: selectedContractor.country,
          countryCode: selectedContractor.country === "Philippines" ? "PH" : selectedContractor.country === "Norway" ? "NO" : "XK",
          flag: selectedContractor.countryFlag,
          salary: selectedContractor.salary,
          email: "",
          employmentType: "contractor",
          startDate: "",
          employmentTypeSource: "suggested",
        } : {} as any}
        onComplete={() => {
          // Simulate candidate completing form - auto-move to drafting
          if (selectedContractor) {
            handleFormSubmitted(selectedContractor.id);
          }
          setConfigureDrawerOpen(false);
        }}
        onSent={() => {
          if (selectedContractor) {
            handleSendForm(selectedContractor.id);
          }
        }}
      />

      {/* Document Bundle Drawer */}
      <DocumentBundleDrawer
        open={documentDrawerOpen}
        onOpenChange={setDocumentDrawerOpen}
        candidate={selectedForDocuments}
      />

      {/* Signature Workflow Drawer */}
      <SignatureWorkflowDrawer
        open={signatureDrawerOpen}
        onOpenChange={setSignatureDrawerOpen}
        candidate={selectedForSignature}
        onComplete={handleSignatureComplete}
      />
    </div>
  );
};
