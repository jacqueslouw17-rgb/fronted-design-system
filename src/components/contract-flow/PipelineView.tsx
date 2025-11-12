import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Eye, Send, Settings, FileEdit, FileText, FileSignature, AlertCircle, Loader2, Info, Clock, DollarSign, Plus, History, Download, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormDrawer } from "./OnboardingFormDrawer";
import { DocumentBundleDrawer } from "./DocumentBundleDrawer";
import { SignatureWorkflowDrawer } from "./SignatureWorkflowDrawer";
import { StartOnboardingConfirmation } from "./StartOnboardingConfirmation";
import { PayrollStatusDrawer } from "./PayrollStatusDrawer";
import { PayrollPreviewDrawer } from "@/components/payroll/PayrollPreviewDrawer";
import { CertifiedActionDrawer } from "./CertifiedActionDrawer";
import { ResolvePayrollIssueDrawer } from "./ResolvePayrollIssueDrawer";
import type { Candidate } from "@/hooks/useContractFlow";
import { usePayrollBatch } from "@/hooks/usePayrollBatch";
import { useNavigate } from "react-router-dom";
import type { PayrollPayee } from "@/types/payroll";
import { getChecklistForProfile, type ChecklistRequirement } from "@/data/candidateChecklistData";
import { usePayrollState } from "@/hooks/usePayrollState";
import { useContractorStore } from "@/hooks/useContractorStore";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "trigger-onboarding" | "onboarding-pending" | "CERTIFIED" | "PAYROLL_PENDING" | "IN_BATCH" | "EXECUTING" | "PAID" | "ON_HOLD";
  formSent?: boolean;
  dataReceived?: boolean;
  employmentType?: "contractor" | "employee";
  checklist?: ChecklistRequirement[];
  checklistProgress?: number;
  isTransitioning?: boolean;
  payrollChecklist?: PayrollChecklistItem[];
  payrollProgress?: number;
  payrollMonth?: "last" | "current" | "next";
}

interface PayrollChecklistItem {
  id: string;
  label: string;
  status: "verified" | "pending" | "todo" | "issue";
  verifiedBy?: string;
  verifiedAt?: string;
  details?: string;
}

interface PipelineViewProps {
  contractors: Contractor[];
  className?: string;
  onContractorUpdate?: (contractors: Contractor[]) => void;
  onDraftContract?: (contractorIds: string[]) => void;
  onSignatureComplete?: () => void;
  filterNonCertified?: boolean;
  mode?: "certified" | "payroll-ready";
}

const statusConfig = {
  "offer-accepted": {
    label: "Offer Accepted",
    color: "bg-muted/50 border-border",
    badgeColor: "bg-muted text-muted-foreground",
    tooltip: "Candidate has accepted the offer and is ready for next steps",
  },
  "data-pending": {
    label: "Collect Candidate Details",
    color: "bg-accent-yellow-fill/30 border-accent-yellow-outline/20",
    badgeColor: "bg-accent-yellow-fill text-accent-yellow-text border-accent-yellow-outline/30",
    tooltip: "Send form to collect tax, payment, and compliance info",
  },
  "drafting": {
    label: "Prepare Contract",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
    tooltip: "Review candidate details and confirm terms before generating",
  },
  "awaiting-signature": {
    label: "Waiting for Signature",
    color: "bg-accent-purple-fill/30 border-accent-purple-outline/20",
    badgeColor: "bg-accent-purple-fill text-accent-purple-text border-accent-purple-outline/30",
    tooltip: "Contract sent — awaiting candidate review",
  },
  "trigger-onboarding": {
    label: "Onboard Candidate",
    color: "bg-primary/10 border-primary/20",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
    tooltip: "Start the candidate onboarding process with checklist and tracking",
  },
  "onboarding-pending": {
    label: "Track Candidate Progress",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
    tooltip: "Monitor completion status and send reminders",
  },
  "CERTIFIED": {
    label: "Certified",
    color: "bg-accent-green-fill/30 border-accent-green-outline/20",
    badgeColor: "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
    tooltip: "Contracts & compliance completed ✅",
  },
  "PAYROLL_PENDING": {
    label: "Payroll Pending",
    color: "bg-muted/50 border-border",
    badgeColor: "bg-muted text-muted-foreground",
    tooltip: "Ready to be added to payroll batch",
  },
  "IN_BATCH": {
    label: "In Batch",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
    tooltip: "Added to payroll batch for processing",
  },
  "EXECUTING": {
    label: "Executing",
    color: "bg-accent-purple-fill/30 border-accent-purple-outline/20",
    badgeColor: "bg-accent-purple-fill text-accent-purple-text border-accent-purple-outline/30",
    tooltip: "Payment in progress",
  },
  "PAID": {
    label: "Paid",
    color: "bg-emerald-100/50 dark:bg-emerald-950/50 border-emerald-500/20",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/30",
    tooltip: "Payment completed ✅",
  },
  "ON_HOLD": {
    label: "On Hold",
    color: "bg-red-100/50 dark:bg-red-950/50 border-red-500/20",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-500/30",
    tooltip: "Blocked - requires attention",
  },
  "payroll-ready": {
    label: "Payroll Ready",
    color: "bg-accent-green-fill/30 border-accent-green-outline/20",
    badgeColor: "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
    tooltip: "Contracts & compliance completed ✅",
  },
};

type ColumnKey =
  | "offer-accepted"
  | "data-pending"
  | "drafting"
  | "awaiting-signature"
  | "trigger-onboarding"
  | "onboarding-pending"
  | "payroll-ready"
  | "CERTIFIED";

const COLUMNS_MERGED: ReadonlyArray<ColumnKey> = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "trigger-onboarding",
  "onboarding-pending",
  "payroll-ready",
];

const COLUMNS_CERTIFIED: ReadonlyArray<ColumnKey> = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "trigger-onboarding",
  "onboarding-pending",
  "CERTIFIED",
];

// Payroll statuses that show within the payroll-ready column
const payrollStatuses = ["CERTIFIED", "PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID", "ON_HOLD"] as const;

export const PipelineView: React.FC<PipelineViewProps> = ({ 
  contractors: initialContractors, 
  className,
  onContractorUpdate,
  onDraftContract,
  onSignatureComplete,
  filterNonCertified = false,
  mode = "certified",
}) => {
  const columns = mode === "payroll-ready" ? COLUMNS_MERGED : COLUMNS_CERTIFIED;
  const navigate = useNavigate();
  const { createBatch, batches } = usePayrollBatch();
  const { updateMetrics } = usePayrollState();
  const { setContractors: updateContractorStore } = useContractorStore();
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
  const [resentFormIds, setResentFormIds] = useState<Set<string>>(new Set());
  const [startOnboardingConfirmOpen, setStartOnboardingConfirmOpen] = useState(false);
  const [selectedForOnboarding, setSelectedForOnboarding] = useState<Contractor | null>(null);
  const [payrollDrawerOpen, setPayrollDrawerOpen] = useState(false);
  const [selectedForPayroll, setSelectedForPayroll] = useState<Contractor | null>(null);
  const [payrollPreviewDrawerOpen, setPayrollPreviewDrawerOpen] = useState(false);
  const [selectedPayrollPayee, setSelectedPayrollPayee] = useState<PayrollPayee | null>(null);
  const [selectedPayrollCycle, setSelectedPayrollCycle] = useState<"last" | "current" | "next">("current");
  const [certifiedDrawerOpen, setCertifiedDrawerOpen] = useState(false);
  const [selectedForCertified, setSelectedForCertified] = useState<Contractor | null>(null);
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<string>>(new Set());
  const [resolveIssueDrawerOpen, setResolveIssueDrawerOpen] = useState(false);
  const [selectedForResolveIssue, setSelectedForResolveIssue] = useState<Contractor | null>(null);
  
  // Track which contractors have been notified to prevent duplicate toasts
  const notifiedPayrollReadyIds = React.useRef<Set<string>>(new Set());
  
  // Sync payroll metrics with global state whenever contractors change
  React.useEffect(() => {
    const payrollContractors = contractors.filter(c => 
      (c.status === "CERTIFIED" || c.status === "PAYROLL_PENDING" || c.status === "IN_BATCH" || c.status === "EXECUTING" || c.status === "PAID") && 
      (c.payrollMonth === selectedPayrollCycle || !c.payrollMonth)
    );
    
    const totalGross = payrollContractors.reduce((sum, c) => {
      const salaryStr = c.salary.replace(/[^0-9.,]/g, '').replace(',', '');
      return sum + (parseFloat(salaryStr) || 0);
    }, 0);
    
    const readyCount = payrollContractors.filter(c => c.status === "PAYROLL_PENDING").length;
    const executingCount = payrollContractors.filter(c => c.status === "EXECUTING").length;
    const paidCount = payrollContractors.filter(c => c.status === "PAID").length;
    
    updateMetrics({
      batchCount: batches.length,
      totalGross,
      readyCount,
      executingCount,
      paidCount,
    });
    
    // Sync to contractor store for dashboard
    updateContractorStore(contractors);
  }, [contractors, selectedPayrollCycle, batches.length, updateMetrics, updateContractorStore]);
  
  // Helper to ensure a contractor has payroll details
  const ensurePayrollDetails = React.useCallback((c: Contractor): Contractor => {
    if (!["CERTIFIED", "PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID"].includes(c.status)) return c;
    if (c.payrollChecklist && typeof c.payrollProgress === "number") return c;
    return {
      ...c,
      payrollProgress: c.payrollProgress ?? 40,
      payrollChecklist: c.payrollChecklist ?? [
        {
          id: "signed-contract",
          label: "Signed Contract",
          status: "verified" as const,
          verifiedBy: "Fronted",
          verifiedAt: "30/10/2025, 17:34:05",
        },
        {
          id: "compliance-docs",
          label: "Compliance Documents",
          status: "pending" as const,
          details: "Tax forms and work permits pending review",
        },
        {
          id: "payroll-setup",
          label: "Payroll Setup",
          status: "verified" as const,
          verifiedBy: "Fronted",
          verifiedAt: "30/10/2025, 17:34:05",
        },
        {
          id: "first-payment",
          label: "First Payment",
          status: "todo" as const,
        },
        {
          id: "certification",
          label: "Certification Complete",
          status: "todo" as const,
        },
      ],
    };
  }, []);
  
  // Initialize payroll checklist for payroll contractors
  React.useEffect(() => {
    setContractors(current => 
      current.map(c => (["CERTIFIED", "PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID"].includes(c.status) ? ensurePayrollDetails(c) : c))
    );
  }, [ensurePayrollDetails, contractors.filter(c => ["CERTIFIED", "PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID"].includes(c.status)).length]);
  
  // Handle smooth transitions between statuses without regressions
  React.useEffect(() => {
    const newContractors = initialContractors.filter(c => !contractors.find(existing => existing.id === c.id));

    const statusIndex = (s: Contractor['status']) => {
      // Map payroll statuses to payroll-ready column
      if (payrollStatuses.includes(s as any)) {
        return columns.indexOf("payroll-ready");
      }
      return columns.indexOf(s as any);
    };

    const mergeWithoutRegression = () => {
      const merged = contractors.map(local => {
        const incoming = initialContractors.find(i => i.id === local.id);
        if (!incoming) return local;
        // If this card is currently animating a transition, keep local state
        if (transitioningIds.has(local.id) || signingTransitionIds.has(local.id)) return local;
        const localIdx = statusIndex(local.status);
        const incomingIdx = statusIndex(incoming.status);
        // Never regress; only move forward
        if (incomingIdx > localIdx) {
          return { ...local, ...incoming, status: incoming.status };
        }
        return local;
      });
      return [...merged, ...newContractors];
    };

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
      // After brief delay, complete transition by merging (no regression)
      setTimeout(() => {
        setTimeout(() => {
          setContractors(mergeWithoutRegression());
          setTransitioningIds(new Set());
        }, 1200);
      }, 800);
    } else if (signingTransitions.length > 0) {
      // Mark contractors as transitioning from signing
      const idsToTransition = new Set(signingTransitions.map(c => c.id));
      setSigningTransitionIds(idsToTransition);
      // After brief delay, complete transition by merging (no regression)
      setTimeout(() => {
        setTimeout(() => {
          setContractors(mergeWithoutRegression());
          setSigningTransitionIds(new Set());
        }, 1200);
      }, 800);
    } else {
      // No explicit transitions detected – still merge to sync new items without regressions
      setContractors(mergeWithoutRegression());
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
      c => c.status === "onboarding-pending" && 
           c.checklistProgress === 100 &&
           !notifiedPayrollReadyIds.current.has(c.id)
    );

    if (completedContractors.length > 0) {
      // Move to certified after brief delay
      const timer = setTimeout(() => {
        const updated = contractors.map(c => 
          completedContractors.some(cc => cc.id === c.id)
            ? { ...c, status: "CERTIFIED" as const }
            : c
        );
        
        // Mark these contractors as notified
        completedContractors.forEach(c => notifiedPayrollReadyIds.current.add(c.id));
        
        setContractors(updated);
        onContractorUpdate?.(updated);

        // Show celebration message after moving to certified
        setTimeout(() => {
          completedContractors.forEach((contractor) => {
            toast.success(`All done ✅ ${contractor.name.split(' ')[0]} is certified!`, {
              duration: 5000,
            });
          });
        }, 500);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [contractors, onContractorUpdate]);
  
  const getContractorsByStatus = (status: typeof columns[number]) => {
    // Handle payroll-ready column - include all payroll statuses
    if (status === "payroll-ready") {
      let filtered = contractors.filter((c) => 
        payrollStatuses.includes(c.status as any) &&
        (c.payrollMonth === selectedPayrollCycle || !c.payrollMonth)
      );
      // Apply non-certified filter if enabled
      if (filterNonCertified) {
        filtered = filtered.filter(c => c.status !== "CERTIFIED");
      }
      return filtered;
    }
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
    // Filter payroll statuses by selected cycle
    if (["PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID", "ON_HOLD"].includes(status)) {
      return contractors.filter((c) => 
        c.status === status && 
        (c.payrollMonth === selectedPayrollCycle || !c.payrollMonth)
      );
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

  const handleSendForSignatures = () => {
    // Keep the contractor in awaiting-signature status but mark as "resent"
    if (selectedForSignature) {
      const contractorId = selectedForSignature.id;
      
      // Add visual feedback that signatures have been sent
      toast.success("Signature request sent", {
        description: "All parties will be notified to sign the documents.",
      });
      
      // Close the drawer
      setSignatureDrawerOpen(false);
      
      // Note: Contractor stays in "awaiting-signature" until all parties sign
      // The handleSignatureComplete callback will move them to "trigger-onboarding"
    }
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

  const handleStartOnboardingClick = (contractor: Contractor) => {
    setSelectedForOnboarding(contractor);
    setStartOnboardingConfirmOpen(true);
  };

  const handlePreviewPayroll = (contractor: Contractor) => {
    // Convert contractor to payroll payee format
    const salaryAmount = parseFloat(contractor.salary.replace(/[^0-9.]/g, ''));
    const currency = contractor.salary.includes('PHP') ? 'PHP' : contractor.salary.includes('NOK') ? 'NOK' : 'USD';
    
    const payee: PayrollPayee = {
      workerId: contractor.id,
      name: contractor.name,
      countryCode: contractor.country === "Philippines" ? "PH" : "NO",
      currency: currency,
      gross: salaryAmount,
      employerCosts: salaryAmount * 0.15,
      adjustments: [],
      status: contractor.status as any,
    };
    
    setSelectedPayrollPayee(payee);
    setPayrollPreviewDrawerOpen(true);
  };

  const handleAddToBatch = () => {
    if (!selectedPayrollPayee) return;
    
    const period = new Date().toISOString().slice(0, 7);
    let batchId: string;
    
    if (batches.length > 0 && batches[batches.length - 1].status === "Draft") {
      batchId = batches[batches.length - 1].id;
    } else {
      batchId = createBatch(period, [selectedPayrollPayee], "admin-001");
    }
    
    toast.success(`${selectedPayrollPayee.name} added to payroll batch`);
    setPayrollPreviewDrawerOpen(false);
    
    setTimeout(() => {
      navigate(`/payroll/batch?id=${batchId}`);
    }, 500);
  };

  const handleSimulateFX = () => {
    toast.success("FX rates simulated - navigate to batch view to lock rates");
    setPayrollPreviewDrawerOpen(false);
  };

  const handleSendToCFO = () => {
    toast.success("Batch sent to CFO for approval");
    setPayrollPreviewDrawerOpen(false);
  };

  const handleViewBatch = () => {
    const latestBatch = batches.length > 0 ? batches[batches.length - 1] : null;
    if (latestBatch) {
      navigate(`/payroll/batch?id=${latestBatch.id}`);
    } else {
      toast("No active batch found");
    }
  };

  const handleConfirmStartOnboarding = () => {
    if (!selectedForOnboarding) return;
    
    setStartOnboardingConfirmOpen(false);
    
    const contractor = selectedForOnboarding;
    
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
    toast.success("All done ✅ Onboarding started", {
      description: `Magic-link email sent to ${contractor.name.split(' ')[0]}`
    });

    // Simulate Genie message (this would integrate with your Genie system)
    setTimeout(() => {
      toast.info(`Hang on — I'm pulling ${contractor.name.split(' ')[0]}'s onboarding checklist. Please wait a moment.`, {
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

    // Compute all updates in a single state change to avoid stale overwrites
    const selectedSet = new Set(selectedForOnboarding.map(c => c.id));

    const updated = contractors.map(c => {
      if (!selectedSet.has(c.id)) return c;

      const countryCode = c.country === "Philippines" ? "PH" : c.country === "Norway" ? "NO" : "XK";
      const employmentType = c.employmentType || "contractor";
      const checklistProfile = getChecklistForProfile(
        countryCode,
        employmentType === "contractor" ? "Contractor" : "Employee"
      );

      if (!checklistProfile) return c;

      const completed = checklistProfile.requirements.filter(r => r.status === 'verified').length;
      const total = checklistProfile.requirements.filter(r => r.required).length;
      const progress = Math.round((completed / total) * 100);

      return {
        ...c,
        status: "onboarding-pending" as const,
        checklist: checklistProfile.requirements,
        checklistProgress: progress
      };
    });
    
    setContractors(updated);
    onContractorUpdate?.(updated);
    setSelectedIds(new Set());
    
    // Show bulk success toast
    toast.success(`✅ Started onboarding for ${selectedForOnboarding.length} candidates`, {
      duration: 4000,
    });
  };

  const handleBulkTriggerOnboarding = () => {
    const selectedForTriggering = contractors.filter(
      c => selectedIds.has(c.id) && c.status === "awaiting-signature"
    );
    
    if (selectedForTriggering.length === 0) return;

    // Move all selected contractors to trigger-onboarding
    const updated = contractors.map(c => 
      selectedIds.has(c.id) && c.status === "awaiting-signature"
        ? { ...c, status: "trigger-onboarding" as const }
        : c
    );
    
    setContractors(updated);
    onContractorUpdate?.(updated);
    setSelectedIds(new Set());
    
    toast.success(`✅ ${selectedForTriggering.length} contractor${selectedForTriggering.length > 1 ? 's' : ''} ready for onboarding`);
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
  
  const getBatchSelectedCount = () => {
    return contractors.filter(c => 
      c.status === "PAYROLL_PENDING" && batchSelectedIds.has(c.id)
    ).length;
  };
  
  const handleBatchSelectContractor = (contractorId: string, checked: boolean) => {
    setBatchSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(contractorId);
      } else {
        newSet.delete(contractorId);
      }
      return newSet;
    });
  };
  
  const handleAddToBatchFromCertified = (contractor: Contractor) => {
    // Update contractor status to PAYROLL_PENDING
    const updated = contractors.map(c =>
      c.id === contractor.id
        ? { ...c, status: "PAYROLL_PENDING" as const }
        : c
    );
    setContractors(updated);
    onContractorUpdate?.(updated);
    
    // Add to batch selection
    setBatchSelectedIds(prev => new Set(prev).add(contractor.id));
    
    toast.success(`Added ${contractor.name} to batch`, {
      description: "Ready to process in next payroll cycle"
    });
  };
  
  const handleOpenBatchReview = () => {
    const selectedContractors = contractors.filter(c => 
      c.status === "PAYROLL_PENDING" && batchSelectedIds.has(c.id)
    );
    
    if (selectedContractors.length === 0) {
      toast.error("No contractors selected for batch");
      return;
    }
    
    // Create payees from selected contractors
    const payees: PayrollPayee[] = selectedContractors.map(contractor => {
      const salaryAmount = parseFloat(contractor.salary.replace(/[^0-9.]/g, ''));
      const currency = contractor.salary.match(/[A-Z]{3}/)?.[0] || 'USD';
      
      return {
        workerId: contractor.id,
        name: contractor.name,
        countryCode: contractor.country.slice(0, 2).toUpperCase(),
        currency: currency,
        gross: salaryAmount,
        employerCosts: salaryAmount * 0.15,
        adjustments: [],
        status: "IN_BATCH" as const,
      };
    });
    
    // Create or get existing batch
    const period = new Date().toISOString().slice(0, 7);
    let batchId: string;
    
    if (batches.length > 0 && batches[batches.length - 1].status === "Draft") {
      batchId = batches[batches.length - 1].id;
    } else {
      batchId = createBatch(period, payees, "admin-001");
    }
    
    // Update contractor statuses to IN_BATCH
    const updatedContractors = contractors.map(c =>
      batchSelectedIds.has(c.id) && c.status === "PAYROLL_PENDING"
        ? { ...c, status: "IN_BATCH" as const }
        : c
    );
    setContractors(updatedContractors);
    onContractorUpdate?.(updatedContractors);
    
    // Navigate to batch review page
    navigate(`/payroll/batch/current?batchId=${batchId}`);
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
                    {/* Select All for all columns except data-pending, awaiting-signature, payroll-ready, and payroll statuses */}
                    {items.length > 0 && !["data-pending", "awaiting-signature", "payroll-ready", "CERTIFIED", "PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID", "ON_HOLD"].includes(status) && (
                      <Checkbox
                        checked={areAllSelected(status)}
                        onCheckedChange={(checked) => handleSelectAll(status, checked as boolean)}
                        className="h-4 w-4"
                      />
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-medium text-sm text-foreground">
                              {config.label}
                            </h3>
                            {config.tooltip && (
                              <Info className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </TooltipTrigger>
                        {config.tooltip && (
                          <TooltipContent>
                            <p className="text-xs">{config.tooltip}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    {status !== "payroll-ready" && getSelectedCount(status) > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {getSelectedCount(status)} selected
                      </span>
                    ) : null}
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
                  <div className="mt-2 space-y-2">
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
                
                {/* Open Batch Button - Only for payroll-ready column */}
                {status === "payroll-ready" && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      className="w-full text-xs h-9 bg-accent-green-fill hover:bg-accent-green-fill/80 text-accent-green-text border border-accent-green-outline/30 font-medium"
                      disabled={getBatchSelectedCount() === 0}
                      onClick={handleOpenBatchReview}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Open Batch {getBatchSelectedCount() > 0 && `(${getBatchSelectedCount()})`}
                    </Button>
                  </div>
                )}
              </div>

              {/* Column Body */}
              <div className={cn(
                "min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg",
                config.color
              )}>
                {/* Payroll Summary Card - Removed for certified column */}
                
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
                    <Card className="hover:shadow-card transition-shadow cursor-pointer border border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-3 space-y-2">
                         {/* Contractor Header - No checkbox for certain columns */}
                        <div className="flex items-start gap-2">
                          {!["data-pending", "awaiting-signature", "payroll-ready", "CERTIFIED"].includes(status) && 
                           !(status === "payroll-ready" && contractor.status !== "PAYROLL_PENDING") && (
                            <Checkbox
                              checked={
                                status === "payroll-ready" && contractor.status === "PAYROLL_PENDING"
                                  ? batchSelectedIds.has(contractor.id)
                                  : selectedIds.has(contractor.id)
                              }
                              onCheckedChange={(checked) => {
                                if (status === "payroll-ready" && contractor.status === "PAYROLL_PENDING") {
                                  handleBatchSelectContractor(contractor.id, checked as boolean);
                                } else {
                                  handleSelectContractor(contractor.id, checked as boolean);
                                }
                              }}
                              className={cn(
                                "h-4 w-4 mt-1",
                                status === "payroll-ready" && "data-[state=checked]:bg-accent-green-fill data-[state=checked]:border-accent-green-outline data-[state=checked]:text-accent-green-text"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
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
                            {status === "payroll-ready" && contractor.status === "PAYROLL_PENDING" && batchSelectedIds.has(contractor.id) && (
                              <p className="text-[10px] text-primary font-medium mt-0.5">
                                Include in this month's batch
                              </p>
                            )}
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
                                disabled={resentFormIds.has(contractor.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResentFormIds(prev => new Set([...prev, contractor.id]));
                                  toast.info(`Resending form to ${contractor.name}`);
                                }}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                {resentFormIds.has(contractor.id) ? 'Sent' : 'Resend'}
                              </Button>
                            </div>
                          )}

                          {status === "drafting" && (
                            <div className="pt-2 space-y-2">
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
                              <Button 
                                size="sm" 
                                className="w-full text-xs h-8 bg-gradient-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartOnboardingClick(contractor);
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Yes, Start
                              </Button>
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

                              {/* Badge: Checklist in Progress */}
                              <Badge
                                variant="outline" 
                                className="w-full justify-center text-xs bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30"
                              >
                                📋 Checklist in Progress
                              </Badge>
                            </div>
                          )}

                          {/* Payroll Ready Column - Different UI based on payroll status */}
                          {status === "payroll-ready" && (
                            <div className="pt-2 space-y-2">
                              {contractor.status === "CERTIFIED" && (
                                <>
                                  <Badge 
                                    variant="outline" 
                                    className="w-full justify-center text-xs bg-accent-green-fill text-accent-green-text border-accent-green-outline/30"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Payroll Ready
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToBatchFromCertified(contractor);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add to Batch
                                  </Button>
                                </>
                              )}
                              
                              {contractor.status === "PAYROLL_PENDING" && (
                                <Badge 
                                  variant="outline" 
                                  className="w-full justify-center text-xs bg-primary/10 text-primary border-primary/30"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  In Current Batch
                                </Badge>
                              )}
                              
                              {contractor.status === "IN_BATCH" && (
                                <Badge 
                                  variant="outline" 
                                  className="w-full justify-center text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-500/30"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Batch Created
                                </Badge>
                              )}
                              
                              {contractor.status === "EXECUTING" && (
                                <Badge 
                                  variant="outline" 
                                  className="w-full justify-center text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                >
                                  <Activity className="h-3 w-3 mr-1" />
                                  Processing
                                </Badge>
                              )}
                              
                              {contractor.status === "PAID" && (
                                <Badge 
                                  variant="outline" 
                                  className="w-full justify-center text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-500/30"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              )}
                              
                              {contractor.status === "ON_HOLD" && (
                                <Badge 
                                  variant="outline" 
                                  className="w-full justify-center text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-500/30"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  On Hold
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Certified Column - Show certified badge and download button */}
                          {status === "CERTIFIED" && (
                            <div className="pt-2 space-y-2">
                              <Badge 
                                variant="outline" 
                                className="w-full justify-center text-xs bg-accent-green-fill text-accent-green-text border-accent-green-outline/30"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Certified
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`Certificate downloaded for ${contractor.name}`);
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download Certificate
                              </Button>
                            </div>
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
            if (selectedContractor.status === "data-pending") {
              // Already in data-pending, just mark as resent
              setResentFormIds(prev => new Set([...prev, selectedContractor.id]));
              toast.info(`Form resent to ${selectedContractor.name}`);
            } else {
              // Move from offer-accepted to data-pending
              handleSendForm(selectedContractor.id);
            }
          }
        }}
        isResend={selectedContractor?.status === "data-pending"}
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
        onSendForSignatures={handleSendForSignatures}
      />

      {/* Start Onboarding Confirmation */}
      <StartOnboardingConfirmation
        open={startOnboardingConfirmOpen}
        onOpenChange={setStartOnboardingConfirmOpen}
        contractor={selectedForOnboarding}
        onConfirm={handleConfirmStartOnboarding}
      />

      {/* Payroll Status Drawer */}
      <PayrollStatusDrawer
        open={payrollDrawerOpen}
        onOpenChange={setPayrollDrawerOpen}
        contractor={selectedForPayroll}
      />
      
      {/* Payroll Preview Drawer */}
      <PayrollPreviewDrawer
        open={payrollPreviewDrawerOpen}
        onOpenChange={setPayrollPreviewDrawerOpen}
        payee={selectedPayrollPayee}
        role={selectedForPayroll?.role}
        onApproveExecute={handleAddToBatch}
        onReschedule={handleSimulateFX}
        onNotifyContractor={handleSendToCFO}
      />

      {/* Certified Action Drawer */}
      <CertifiedActionDrawer
        open={certifiedDrawerOpen}
        onOpenChange={setCertifiedDrawerOpen}
        contractor={selectedForCertified}
        onConfirm={() => {
          if (selectedForCertified) {
            const updated = contractors.map(c =>
              c.id === selectedForCertified.id
                ? { ...c, status: "PAYROLL_PENDING" as const }
                : c
            );
            setContractors(updated);
            onContractorUpdate?.(updated);
            toast.success(`${selectedForCertified.name} is now ready for payroll`);
          }
        }}
      />

      {/* Resolve Payroll Issue Drawer */}
      <ResolvePayrollIssueDrawer
        open={resolveIssueDrawerOpen}
        onClose={() => setResolveIssueDrawerOpen(false)}
        contractorName={selectedForResolveIssue?.name || ""}
        contractorCountry={selectedForResolveIssue?.country || ""}
      />
    </div>
  );
};
