/**
 * Flow 1 — Fronted Admin Dashboard v7 (Experimental) (Clone of v6)
 *
 * ISOLATED: This is an independent copy. Changes here do NOT affect v6 or any other flow.
 *
 * Created: 2026-03-05
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, FileCheck } from "lucide-react";
import "@/styles/v7-glass-theme.css";
import "@/styles/v7-glass-portals.css";
import frontedLogo from "@/assets/fronted-logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useContractFlow } from "@/hooks/useContractFlow";
import { ContractFlowNotification } from "@/components/contract-flow/ContractFlowNotification";
import { CandidateConfirmationScreen } from "@/components/contract-flow/CandidateConfirmationScreen";
import { DocumentBundleCarousel } from "@/components/contract-flow/DocumentBundleCarousel";
import { F1v5_ContractDraftWorkspace } from "@/components/flows/fronted-admin-v7-clone/F1v7_ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";
import { ContractSignaturePhase } from "@/components/contract-flow/ContractSignaturePhase";
import { ContractFlowSummary } from "@/components/contract-flow/ContractFlowSummary";
import { ComplianceTransitionNote } from "@/components/contract-flow/ComplianceTransitionNote";
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import { DocumentBundleSignature } from "@/components/contract-flow/DocumentBundleSignature";
import { F1v4_PipelineView } from "@/components/flows/fronted-admin-v7-clone/F1v7_PipelineView";
import { ContractSignedMessage } from "@/components/contract-flow/ContractSignedMessage";
import { AgentChatBox } from "@/components/contract-flow/AgentChatBox";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import DashboardDrawer from "@/components/dashboard/DashboardDrawer";
import { useDashboardDrawer } from "@/hooks/useDashboardDrawer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { useAgentState } from "@/hooks/useAgentState";
import { KurtIntroTooltip } from "@/components/contract-flow/KurtIntroTooltip";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { usePayrollBatch } from "@/hooks/usePayrollBatch";
import { KurtChatSidebar } from "@/components/kurt/KurtChatSidebar";
import { generateAnyUpdatesMessage, generateAskKurtMessage } from "@/lib/kurt-flow2-context";
import { useContractorStore } from "@/hooks/useContractorStore";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import F1v4_EmbeddedAdminOnboarding from "@/components/flows/fronted-admin-v7-clone/F1v7_EmbeddedAdminOnboarding";
import { F1v4_AddCandidateDrawer } from "@/components/flows/fronted-admin-v7-clone/F1v7_AddCandidateDrawer";
import { F1v4_PayrollTab } from "@/components/flows/fronted-admin-v7-clone/F1v7_PayrollTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Company type with full details for edit functionality
interface CompanyData {
  id: string;
  name: string;
  adminName?: string;
  adminEmail?: string;
  hqCountry?: string;
  defaultCurrency?: string;
  payrollCurrency?: string[];
  payoutDay?: string;
}

const MOCK_COMPANIES: CompanyData[] = [
  {
    id: "company-default",
    name: "Acme Corp",
    adminName: "Joe User",
    adminEmail: "joe@example.com",
    hqCountry: "SE",
    defaultCurrency: "USD",
    payrollCurrency: ["USD"],
    payoutDay: "25",
  }
];

const DEFAULT_DRAFTING_CANDIDATES = [
  {
    id: "offer-1",
    name: "Anika Lindqvist",
    country: "Norway",
    countryFlag: "🇳🇴",
    role: "Frontend Engineer",
    salary: "NOK 65,000/mo",
    status: "offer-accepted",
    employmentType: "employee",
    email: "anika.lindqvist@example.com",
  },
  {
    id: "default-1",
    name: "Marcus Chen",
    country: "Singapore",
    countryFlag: "🇸🇬",
    role: "Senior Backend Engineer",
    salary: "SGD 12,000/mo",
    status: "drafting",
    employmentType: "contractor",
    email: "marcus.chen@example.com",
    nationality: "Singaporean",
    dataReceived: true,
  },
  {
    id: "default-2",
    name: "Sofia Rodriguez",
    country: "Spain",
    countryFlag: "🇪🇸",
    role: "Product Designer",
    salary: "EUR 6,500/mo",
    status: "drafting",
    employmentType: "contractor",
    email: "sofia.rodriguez@example.com",
    dataReceived: true,
  },
  {
    id: "sig-1",
    name: "Liam O'Connor",
    country: "Ireland",
    countryFlag: "🇮🇪",
    role: "DevOps Engineer",
    salary: "EUR 7,200/mo",
    status: "awaiting-signature",
    employmentType: "contractor",
    email: "liam.oconnor@example.com",
    dataReceived: true,
  },
  {
    id: "onboard-1",
    name: "Priya Sharma",
    country: "India",
    countryFlag: "🇮🇳",
    role: "Data Analyst",
    salary: "INR 1,20,000/mo",
    status: "trigger-onboarding",
    employmentType: "employee",
    email: "priya.sharma@example.com",
    dataReceived: true,
  },
  {
    id: "done-1",
    name: "Maria Santos",
    country: "Philippines",
    countryFlag: "🇵🇭",
    role: "Full-Stack Developer",
    salary: "PHP 95,000/mo",
    status: "CERTIFIED",
    employmentType: "employee",
    email: "maria.santos@example.com",
    dataReceived: true,
  },
  {
    id: "done-2",
    name: "Liam O'Brien",
    country: "Ireland",
    countryFlag: "🇮🇪",
    role: "DevOps Engineer",
    salary: "EUR 7,200/mo",
    status: "CERTIFIED",
    employmentType: "contractor",
    email: "liam.obrien@example.com",
    dataReceived: true,
  },
];

// Keep all navigation inside this flow (Flow 1 v7 clone)
const FLOW_BASE_PATH = "/flows/fronted-admin-dashboard-v7-clone";

const AdminContractingMultiCompany = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const contractFlow = useContractFlow(version === "v3" || version === "v5" ? version : "v3");
  const [cameFromReview, setCameFromReview] = React.useState(false);
  const { isOpen: isDrawerOpen, toggle: toggleDrawer } = useDashboardDrawer();
  const { setOpen, addMessage, setLoading, isSpeaking: isAgentSpeaking } = useAgentState();
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [promptText, setPromptText] = React.useState("");
  const [isTypingPrompt, setIsTypingPrompt] = React.useState(false);
  const [hasSpokenPhase, setHasSpokenPhase] = React.useState<Record<string, boolean>>({});
  const [showContractSignedMessage, setShowContractSignedMessage] = useState(false);
  const [contractMessageMode, setContractMessageMode] = useState<"sent" | "signed">("signed");
  const [isKurtMuted, setIsKurtMuted] = React.useState(false);
  const [searchParams] = useSearchParams();
  const { contractors, setContractors, updateContractor } = useContractorStore();

  const didApplyDraftingUrlRef = useRef(false);
  
  const companyFromUrl = searchParams.get('company');
  const [selectedCompany, setSelectedCompany] = useState<string>(() => {
    if (companyFromUrl) return companyFromUrl;
    const saved = localStorage.getItem('adminflow-v7-selected-company');
    return saved || "company-default";
  });
  const [isAddingNewCompany, setIsAddingNewCompany] = useState<boolean>(false);
  const [isEditingCompany, setIsEditingCompany] = useState<boolean>(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const isInContractFlow = contractFlow.phase !== "idle" && contractFlow.phase !== "offer-accepted" && contractFlow.phase !== "data-collection";
  useEffect(() => {
    if (!isAddingNewCompany && !isEditingCompany && !isInContractFlow) {
      setHeaderScrolled(false);
      return;
    }
    const onScroll = () => setHeaderScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAddingNewCompany, isEditingCompany, isInContractFlow]);
  const [companies, setCompanies] = useState<CompanyData[]>(() => {
    const saved = localStorage.getItem('adminflow-v7-companies');
    return saved ? JSON.parse(saved) : MOCK_COMPANIES;
  });
  const [companyContractors, setCompanyContractors] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('adminflow-v7-company-contractors');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Object.fromEntries(
          Object.entries(parsed).map(([companyId, contractors]) => [
            companyId,
            Array.isArray(contractors)
              ? (contractors as any[]).map((c: any) => {
                  const isDemoDraftCandidate =
                    c?.id === "default-1" ||
                    c?.id === "default-2" ||
                    c?.name === "Marcus Chen" ||
                    c?.name === "Sofia Rodriguez";

                  return isDemoDraftCandidate ? { ...c, status: "drafting" } : c;
                })
              : [],
          ])
        ) as Record<string, any[]>;
      } catch {
        localStorage.removeItem('adminflow-v7-company-contractors');
      }
    }

    return { "company-default": [...DEFAULT_DRAFTING_CANDIDATES] };
  });
  
  useEffect(() => {
    localStorage.setItem('adminflow-v7-companies', JSON.stringify(companies));
  }, [companies]);
  
  useEffect(() => {
    localStorage.setItem('adminflow-v7-selected-company', selectedCompany);
  }, [selectedCompany]);
  
  useEffect(() => {
    localStorage.setItem('adminflow-v7-company-contractors', JSON.stringify(companyContractors));
  }, [companyContractors]);
  
  const hasNoCompanies = companies.length === 0;
  const [isAddCandidateDrawerOpen, setIsAddCandidateDrawerOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"tracker" | "payroll">("tracker");
  
  useEffect(() => {
    const newCompanyName = searchParams.get('newCompany');
    if (newCompanyName) {
      const newCompanyId = `company-${Date.now()}`;
      const newCompany = { id: newCompanyId, name: decodeURIComponent(newCompanyName) };
      
      setCompanies(prev => [...prev, newCompany]);
      setCompanyContractors(prev => ({ ...prev, [newCompanyId]: [...DEFAULT_DRAFTING_CANDIDATES.map(c => ({ ...c, id: `${c.id}-${Date.now()}` }))] }));
      setSelectedCompany(newCompanyId);
      
      toast({
        title: "Company Added",
        description: `${newCompany.name} has been added successfully!`,
      });
      
      navigate(FLOW_BASE_PATH, { replace: true });
    }
  }, [searchParams, navigate, toast]);
  
  useEffect(() => {
    if (searchParams.get("moved") === "true" && contractors.length > 0) {
      setCompanyContractors(prev => ({
        ...prev,
        [selectedCompany]: [
          ...(prev[selectedCompany] || []),
          ...contractors.filter(c =>
            !(prev[selectedCompany] || []).some(existing => existing.id === c.id)
          )
        ]
      }));
      
      setContractors([]);
      navigate(`${FLOW_BASE_PATH}?phase=data-collection`, { replace: true });
    }
  }, [searchParams, contractors, selectedCompany, setContractors, navigate]);

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const handleCompanyChange = (companyId: string) => {
    if (companyId === "add-new") {
      setIsAddingNewCompany(true);
      return;
    }
    
    setSelectedCompany(companyId);
    const company = companies.find(c => c.id === companyId);
    
    toast({
      title: "Company Switched",
      description: `Now viewing contracts for ${company?.name}`,
    });
  };

  const handleNewCompanyComplete = (companyName: string, companyData?: Record<string, any>) => {
    const newCompanyId = `company-${Date.now()}`;
    const newCompany: CompanyData = { 
      id: newCompanyId, 
      name: companyName,
      adminName: companyData?.adminName,
      adminEmail: companyData?.adminEmail,
      hqCountry: companyData?.hqCountry,
      defaultCurrency: companyData?.defaultCurrency,
      payrollCurrency: companyData?.payrollCurrency,
      payoutDay: companyData?.payoutDay,
    };
    
    setCompanies(prev => [...prev, newCompany]);
    setCompanyContractors(prev => ({ ...prev, [newCompanyId]: [...DEFAULT_DRAFTING_CANDIDATES.map(c => ({ ...c, id: `${c.id}-${Date.now()}` }))] }));
    setSelectedCompany(newCompanyId);
    
    toast({
      title: "Company Added",
      description: `${companyName} has been added successfully!`,
    });
    
    setIsAddingNewCompany(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleEditCompany = (companyId: string) => {
    setEditingCompanyId(companyId);
    setIsEditingCompany(true);
  };

  const handleEditCompanyComplete = (companyName: string, companyData?: Record<string, any>) => {
    if (!editingCompanyId) return;
    
    setCompanies(prev => prev.map(company => 
      company.id === editingCompanyId
        ? {
            ...company,
            name: companyData?.companyName || company.name,
            adminName: companyData?.adminName ?? company.adminName,
            hqCountry: companyData?.hqCountry ?? company.hqCountry,
            defaultCurrency: companyData?.defaultCurrency ?? company.defaultCurrency,
            payrollCurrency: companyData?.payrollCurrency ?? company.payrollCurrency,
            payoutDay: companyData?.payoutDay ?? company.payoutDay,
          }
        : company
    ));
    
    toast({
      title: "Company Updated",
      description: `${companyData?.companyName || companyName} has been updated successfully!`,
    });
    
    setIsEditingCompany(false);
    setEditingCompanyId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCancelEditCompany = () => {
    setIsEditingCompany(false);
    setEditingCompanyId(null);
  };

  const handleCancelAddCompany = () => {
    setIsAddingNewCompany(false);
  };

  const handleBackToFlows = () => {
    localStorage.removeItem('adminflow-v7-companies');
    localStorage.removeItem('adminflow-v7-selected-company');
    localStorage.removeItem('adminflow-v7-company-contractors');
  };

  const handleAddCandidate = () => {
    setIsAddCandidateDrawerOpen(true);
  };

  const handleSaveCandidate = (candidate: any) => {
    setCompanyContractors(prev => ({
      ...prev,
      [selectedCompany]: [...(prev[selectedCompany] || []), candidate]
    }));
  };

  const handleKurtAction = async (action: string) => {
    if (!action.startsWith('send-reminder-')) {
      addMessage({
        role: 'user',
        text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      });
    }

    setOpen(true);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    let response = '';

    switch(action) {
      case 'any-updates':
        response = generateAnyUpdatesMessage(contractors.length > 0 ? contractors : [
          {
            id: "display-1",
            name: "Liam Chen",
            country: "Singapore",
            countryFlag: "🇸🇬",
            role: "Frontend Developer",
            salary: "SGD 7,500/mo",
            status: "offer-accepted" as const,
            formSent: false,
            dataReceived: false,
            employmentType: "contractor" as const,
          },
          {
            id: "display-2",
            name: "Sofia Rodriguez",
            country: "Mexico",
            countryFlag: "🇲🇽",
            role: "Marketing Manager",
            salary: "MXN 45,000/mo",
            status: "data-pending" as const,
            formSent: true,
            dataReceived: false,
            employmentType: "employee" as const,
          },
        ]);
        break;
      case 'ask-kurt':
        response = generateAskKurtMessage();
        break;
      case 'quick-summary':
        response = `✅ Contract Summary Complete\n\nI checked all required fields — looks good!\n\nKey Terms:\n• Salary: [to be filled]\n• Start Date: [to be filled]\n• Notice Period: [to be filled]\n• PTO: [to be filled]\n\nWant me to auto-fill missing data from the candidate record?`;
        break;
      case 'check-fields':
        response = `✅ Field Review Complete\n\nI checked all mandatory contract fields. Everything's complete except:\n• Start Date (required)\n• Salary Currency (required)\n\nWant me to set Salary Currency automatically based on the candidate's country?`;
        break;
      case 'fix-clauses':
        response = `🔧 Clause Analysis Complete\n\nI reviewed all contract clauses:\n\n✓ Termination clause - compliant with local labor law\n✓ IP rights clause - standard language looks good\n✓ Non-compete clause - aligned with local regulations\n\nAll clauses are watertight. Ready to generate the bundle?`;
        break;
      case 'explain-term':
        response = `📚 Term Explanation\n\n"Probation Period"\n\nThis is the initial employment period (typically 3-6 months) where:\n• Performance is closely evaluated\n• Either party can terminate with shorter notice\n• Full benefits may be prorated\n\nThe standard probation period is aligned with local labor regulations. Want me to adjust it?`;
        break;
      case 'pull-data':
        response = `📊 Candidate Data Retrieved\n\nI pulled the latest info from your ATS:\n\n✓ Contact information verified\n✓ Role and experience confirmed\n✓ Qualifications validated\n\nAll data is pre-filled into the contract template. Should I generate the bundle now?`;
        break;
      case 'compare-drafts':
        response = `🔄 Draft Comparison Complete\n\nComparing current draft with standard template:\n\nChanges detected:\n• Salary structure customized for local market\n• PTO adjusted to local standards\n• Added remote work provisions\n• Modified notice period per regional requirements\n\nAll changes are within approved parameters. Ready to proceed?`;
        break;
      case 'track-progress':
        response = `📈 Onboarding Progress\n\n👤 Maria Santos - 75% Complete\n✅ Personal details submitted\n✅ Tax forms completed\n✅ Bank information verified\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 2 days\n\n👤 John Smith - 40% Complete\n✅ Personal details submitted\n⏳ Tax forms pending\n⏳ Bank information needed\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 5 days\n\n👤 Sarah Chen - 90% Complete\n✅ Personal details submitted\n✅ Tax forms completed\n✅ Bank information verified\n✅ Compliance documents approved\n⏳ Emergency contact needed\nEstimated completion: 1 day\n\n👤 Ahmed Hassan - 25% Complete\n✅ Personal details submitted\n⏳ Tax forms pending\n⏳ Bank information needed\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 7 days`;
        
        addMessage({
          role: 'kurt',
          text: response,
          actionButtons: [
            { label: 'Send Reminder to Maria', action: 'send-reminder-maria', variant: 'default' },
            { label: 'Send Reminder to John', action: 'send-reminder-john', variant: 'outline' },
            { label: 'Send Reminder to Sarah', action: 'send-reminder-sarah', variant: 'outline' },
            { label: 'Send Reminder to Ahmed', action: 'send-reminder-ahmed', variant: 'outline' },
          ]
        });
        
        setLoading(false);
        return;
      case 'resend-link':
        setLoading(true);
        setOpen(true);
        
        setTimeout(() => {
          setLoading(false);
          addMessage({
            role: 'kurt',
            text: "Got it — who should I resend this to?\n\n📧 Pre-filled candidates ready for resend:\n• Maria Santos\n• John Smith\n• Sarah Chen\n• Ahmed Hassan",
            actionButtons: [
              { label: 'Resend to All', action: 'resend-all', variant: 'default' },
              { label: 'Select Individual', action: 'resend-individual', variant: 'outline' },
            ]
          });
        }, 1500);
        return;
        
      case 'resend-all':
        addMessage({
          role: 'user',
          text: 'Resend to all candidates'
        });
        setLoading(true);
        
        setTimeout(() => {
          setLoading(false);
          addMessage({
            role: 'kurt',
            text: "All set! ✅\n\nOnboarding links resent to all 4 candidates. They'll receive the email shortly.",
          });
          
          toast({
            title: "Links Sent",
            description: "4 onboarding links have been resent successfully.",
          });
        }, 1200);
        return;
      case 'mark-complete':
        setLoading(true);
        setOpen(true);
        
        setTimeout(() => {
          setLoading(false);
          
          const duration = 2 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
          }, 250);
          
          addMessage({
            role: 'kurt',
            text: "Done ✅ Everything's up to date.\n\nMaria's onboarding is now marked as complete. All systems synced successfully!",
          });
        }, 1800);
        return;
        
      case 'create-payroll-batch': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const response = executePayrollGenieAction('create_payroll_batch', navigate);
        addMessage({ role: 'kurt', text: response });
        setLoading(false);
        return;
      }
      
      case 'simulate-fx': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const response = executePayrollGenieAction('simulate_fx', navigate);
        addMessage({ role: 'kurt', text: response });
        setLoading(false);
        return;
      }
      
      case 'send-approval': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const response = executePayrollGenieAction('send_for_approval', navigate);
        addMessage({ role: 'kurt', text: response });
        setLoading(false);
        return;
      }
      
      case 'execute-payroll': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const response = executePayrollGenieAction('execute_batch', navigate);
        addMessage({ role: 'kurt', text: response });
        setLoading(false);
        return;
      }
      
      case 'reconcile': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const response = executePayrollGenieAction('reconcile', navigate);
        addMessage({ role: 'kurt', text: response });
        setLoading(false);
        return;
      }
      
      case 'add-documents':
        response = `📄 Add Documents\n\nI can help you add additional documents to the contract bundle:\n\n• Company Handbook\n• Benefits Overview\n• Remote Work Policy\n• Equipment Agreement\n• Custom Addendums\n\nWhich documents would you like to add?`;
        break;
        
      case 'review-bundle':
        response = `✅ Bundle Review Complete\n\nI've reviewed all documents in the bundle:\n\n✓ All required documents included\n✓ Country-specific compliance documents present\n✓ Signature fields properly placed\n✓ No conflicts between documents\n\nThe bundle is ready to send for signing!`;
        break;
        
      case 'check-compliance':
        response = `🔍 Compliance Check Complete\n\nI've verified compliance for all documents:\n\n✓ Employment Agreement - compliant with local labor law\n✓ Country Compliance Attachments - all mandatory clauses included\n✓ NDA/Policy Docs - standard language verified\n\nAll documents meet regulatory requirements. Ready to proceed with signing?`;
        break;
        
      default:
        response = `I'll help you with "${action}". Let me process that for you.`;
    }

    if (action.startsWith('send-reminder-')) {
      const name = action.replace('send-reminder-', '').replace('-', ' ');
      const capitalizedName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      addMessage({
        role: 'kurt',
        text: `📧 Reminder Sent\n\nOnboarding reminder has been emailed to ${capitalizedName}.\n\n✓ Link to continue onboarding included\n✓ List of pending items attached\n✓ Support contact information provided\n\nThey should receive it within a few minutes.`,
      });
      setLoading(false);
      return;
    }

    addMessage({
      role: 'kurt',
      text: response,
    });

    setLoading(false);
  };

  const idleMessage = version === "v5" 
    ? "I've prepared contract drafts for all three candidates based on your requirements."
    : "Hey Joe, looks like three shortlisted candidates are ready for contract drafting. Would you like me to prepare their drafts?";
  const idleWords = idleMessage.split(' ');

  const mockPrompt = "Generate contracts for Maria Santos, Oskar Nilsen, and Arta Krasniqi";
  
  useEffect(() => {
    (window as any).handleKurtAction = handleKurtAction;
    return () => {
      delete (window as any).handleKurtAction;
    };
  }, []);
  
  useEffect(() => {
    if (contractFlow.phase === "prompt") {
      setIsTypingPrompt(false);
      setPromptText("");
      setCurrentWordIndex(0);
      
      const startDelay = setTimeout(() => {
        setIsTypingPrompt(true);
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex < mockPrompt.length) {
            setPromptText(mockPrompt.substring(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 50);
      }, 300);
      
      return () => clearTimeout(startDelay);
    }
  }, [contractFlow.phase]);
  
  useEffect(() => {
    const phaseKey = contractFlow.phase;
    const movedParam = searchParams.get("moved") === "true";
    const allSignedParam = searchParams.get("allSigned") === "true";
    
    let uniquePhaseKey: string = phaseKey;
    if (phaseKey === "data-collection" || phaseKey === "offer-accepted") {
      if (allSignedParam) {
        uniquePhaseKey = `${phaseKey}-all-signed`;
      } else if (movedParam) {
        uniquePhaseKey = `${phaseKey}-moved`;
      }
    }
    
    if (!hasSpokenPhase[uniquePhaseKey]) {
      setHasSpokenPhase(prev => ({ ...prev, [uniquePhaseKey]: true }));
    }
  }, [contractFlow.phase, hasSpokenPhase, contractFlow.currentDraftIndex, contractFlow.selectedCandidates, searchParams]);
  
  useEffect(() => {
    if (currentWordIndex < idleWords.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, idleWords.length]);
  
  useEffect(() => {
    const phaseParam = searchParams.get("phase");
    const signedParam = searchParams.get("signed");
    const companyParam = searchParams.get("company");
    const idsParam = searchParams.get("ids");

    if (companyParam && companyParam !== selectedCompany && companies.some(c => c.id === companyParam)) {
      setSelectedCompany(companyParam);
    }

    if (phaseParam === "bundle-creation") {
      contractFlow.proceedToDrafting();
      navigate(FLOW_BASE_PATH, { replace: true });
    }

    if (phaseParam === "drafting" && idsParam) {
      const ids = idsParam.split(",").map(s => s.trim()).filter(Boolean);
      const companyId = companyParam || selectedCompany;
      const contractors = companyContractors[companyId] || [];

      const candidatesForDrafting = contractors
        .filter((c: any) => ids.includes(c.id))
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.role,
          country: c.country,
          countryCode: c.countryCode || ({ Singapore: "SG", Spain: "ES", Norway: "NO", Philippines: "PH", Ireland: "IE", India: "IN" }[c.country] || "US"),
          flag: c.countryFlag || c.flag || "",
          salary: c.salary || "",
          startDate: c.startDate || "",
          noticePeriod: c.noticePeriod || "30 days",
          pto: c.pto || "15 days/year",
          currency: c.currency || "USD",
          signingPortal: c.signingPortal || "DocuSign",
          status: "Hired" as const,
          email: c.email,
          employmentType: c.employmentType,
          nationality: c.nationality,
          city: c.city,
          address: c.address,
          idNumber: c.idNumber,
        }));

      if (candidatesForDrafting.length > 0) {
        contractFlow.setCandidatesForDrafting(candidatesForDrafting);
      } else {
        contractFlow.proceedToDrafting();
      }

      navigate(`${FLOW_BASE_PATH}?phase=drafting`, { replace: true });
    } else if (phaseParam === "drafting" && !idsParam) {
      if (!didApplyDraftingUrlRef.current) {
        didApplyDraftingUrlRef.current = true;
        if (contractFlow.phase !== "drafting") {
          console.log("[Flow 1.1] Applying ?phase=drafting from URL", { from: contractFlow.phase });
          contractFlow.proceedToDrafting();
        }
      }
    }

    if (signedParam === "true") {
      setShowContractSignedMessage(true);
    }
  }, [
    searchParams,
    navigate,
    companies,
    selectedCompany,
    companyContractors,
    contractFlow.phase,
    contractFlow.proceedToDrafting,
    contractFlow.setCandidatesForDrafting,
  ]);

  return (
    <RoleLensProvider initialRole="admin">
      <div className="v7-glass-bg flex flex-col w-full">
        <div className="v7-orb-center" />
      {!isAddingNewCompany && !isEditingCompany && (
        contractFlow.phase === "idle" ||
        contractFlow.phase === "offer-accepted" ||
        contractFlow.phase === "data-collection"
      ) && (
        <Topbar 
          userName={`${userData.firstName} ${userData.lastName}`}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={toggleDrawer}
          profileSettingsUrl="/flow-1-v7/profile-settings"
          profileMenuLabel="Profile Settings"
          onBackClick={handleBackToFlows}
          companySwitcher={hasNoCompanies ? undefined : {
            companies,
            selectedCompany,
            onCompanyChange: handleCompanyChange,
            onEditCompany: handleEditCompany
          }}
        />
      )}

      {isAddingNewCompany && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${headerScrolled ? 'v7-glass-header' : ''}`}>
          <img 
            src={frontedLogo}
            alt="Fronted"
            className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCancelAddCompany}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelAddCompany}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      {isEditingCompany && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${headerScrolled ? 'v7-glass-header' : ''}`}>
          <img 
            src={frontedLogo}
            alt="Fronted"
            className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCancelEditCompany}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelEditCompany}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      {!isAddingNewCompany && !isEditingCompany &&
        contractFlow.phase !== "idle" &&
        contractFlow.phase !== "offer-accepted" &&
        contractFlow.phase !== "data-collection" && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${headerScrolled ? 'v7-glass-header' : ''}`}>
          <img src={frontedLogo} alt="Fronted" className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { contractFlow.resetFlow(); navigate(FLOW_BASE_PATH); }} />
          <Button variant="ghost" size="icon" onClick={() => { contractFlow.resetFlow(); navigate(FLOW_BASE_PATH); }} className="h-8 w-8 sm:h-10 sm:w-10">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden relative">
        
        <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          <AgentLayout context="Contract Flow">
            <div className="flex-1 overflow-auto relative">
              <div className="relative z-10">
              {isAddingNewCompany ? (
                <F1v4_EmbeddedAdminOnboarding
                  onComplete={handleNewCompanyComplete}
                  onCancel={handleCancelAddCompany}
                />
              ) : isEditingCompany && editingCompanyId ? (
                (() => {
                  const editingCompany = companies.find(c => c.id === editingCompanyId);
                  const candidatesForCompany = companyContractors[editingCompanyId] || [];
                  const hasCandidates = candidatesForCompany.length > 0;
                  const hasSignedContract = candidatesForCompany.some(c => c.status === "signed");
                  
                  return (
                    <F1v4_EmbeddedAdminOnboarding
                      onComplete={handleEditCompanyComplete}
                      onCancel={handleCancelEditCompany}
                      isEditMode={true}
                      editModeTitle={`Change ${editingCompany?.name || 'Company'} details`}
                      companyId={editingCompanyId}
                      companyName={editingCompany?.name}
                      initialData={{
                        companyName: editingCompany?.name || "",
                        adminName: editingCompany?.adminName || "",
                        adminEmail: editingCompany?.adminEmail || "",
                        hqCountry: editingCompany?.hqCountry || "",
                        defaultCurrency: editingCompany?.defaultCurrency || "",
                        payrollCurrency: editingCompany?.payrollCurrency || [],
                        payoutDay: editingCompany?.payoutDay || "",
                      }}
                      hasSignedContract={hasSignedContract}
                      hasCandidates={hasCandidates}
                    />
                  );
                })()
              ) : (
              <AnimatePresence mode="wait">
                {contractFlow.phase === "prompt" ? (
                  <motion.div key="prompt" className="flex flex-col items-center justify-center min-h-full p-8">
                    <div className="w-full max-w-2xl space-y-6">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Contract Flow Assistant</h2>
                        <p className="text-muted-foreground">What would you like me to help you with?</p>
                      </div>
                      <div className="relative">
                        <div className="border border-border rounded-lg bg-background p-4 shadow-lg">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={promptText}
                              readOnly
                              placeholder="Type your request..."
                              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                            />
                            {promptText.length === mockPrompt.length && (
                              <Button 
                                onClick={() => contractFlow.startPromptFlow()}
                                className="whitespace-nowrap"
                              >
                                Generate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : contractFlow.phase === "generating" ? (
                  <motion.div key="generating" className="flex flex-col items-center justify-center min-h-full p-8">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <AudioWaveVisualizer isActive={true} />
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <span className="animate-pulse">Preparing contracts</span>
                        <span className="flex gap-1">
                          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : hasNoCompanies ? (
                  <motion.div 
                    key="empty-state" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col items-center justify-center p-8"
                    style={{ minHeight: 'calc(100vh - 80px)' }}
                  >
                    <div className="flex flex-col items-center text-center space-y-6">
                      <AgentHeader
                        title="Start by adding a company"
                        subtitle="Once a company is set up, you'll be able to manage candidates, contracts, and payroll from here."
                        showPulse={true}
                        isActive={false}
                        showInput={false}
                      />
                      <Button 
                        onClick={() => setIsAddingNewCompany(true)}
                        size="lg"
                      >
                        Add company
                      </Button>
                    </div>
                  </motion.div>
                ) : (contractFlow.phase === "offer-accepted" || contractFlow.phase === "data-collection") ? (
                  <motion.div 
                    key="data-collection" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex-1 overflow-y-auto"
                  >
                    <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-2">
                      {showContractSignedMessage ? (
                        <ContractSignedMessage 
                          mode="signed"
                          onReadingComplete={() => {
                            setTimeout(() => {
                              setShowContractSignedMessage(false);
                            }, 2000);
                          }}
                        />
                      ) : (
                        <AgentHeader
                          title={activeMainTab === "payroll" 
                            ? "Fronted Admin · Payroll" 
                            : `Welcome Joe, get to work at ${companies.find(c => c.id === selectedCompany)?.name || "your company"}!`
                          }
                          subtitle={activeMainTab === "payroll"
                            ? "Review all company payrolls, resolve exceptions, and approve numbers."
                            : searchParams.get("allSigned") === "true"
                              ? "Both candidates have signed! Let's trigger their onboarding checklists."
                              : searchParams.get("moved") === "true" 
                                ? "Great, contracts sent to candidates via their preferred signing portals."
                                : "Monitor candidate signatures and complete certification to finalize contracts."
                          }
                          showPulse={true}
                          hasChanges={activeMainTab === "tracker" && (searchParams.get("moved") === "true" || searchParams.get("allSigned") === "true")}
                          isActive={isAgentSpeaking || (
                            activeMainTab === "tracker" && (
                              searchParams.get("allSigned") === "true"
                                ? !hasSpokenPhase["data-collection-all-signed"]
                                : searchParams.get("moved") === "true" 
                                  ? !hasSpokenPhase["data-collection-moved"]
                                  : !hasSpokenPhase["offer-accepted"]
                            )
                          )}
                          showInput={false}
                        />
                      )}
                      
                      <div className="flex items-center justify-center py-2">
                        <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as "tracker" | "payroll")}>
                          <TabsList className="grid w-[280px] grid-cols-2 v7-glass-tabs">
                            <TabsTrigger value="tracker" className="data-[state=active]:v7-glass-tab-active">Tracker</TabsTrigger>
                            <TabsTrigger value="payroll" className="data-[state=active]:v7-glass-tab-active">Payroll</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="pt-6">
                        {activeMainTab === "payroll" ? (
                          <F1v4_PayrollTab />
                        ) : (
                          <div className="space-y-4">
                            <div className="mt-3">
                              <F1v4_PipelineView 
                                key={selectedCompany}
                                contractors={companyContractors[selectedCompany] || []}
                                onAddCandidate={handleAddCandidate}
                                onRemoveContractor={(contractorId) => {
                                  setCompanyContractors(prev => ({
                                    ...prev,
                                    [selectedCompany]: (prev[selectedCompany] || []).filter(c => c.id !== contractorId)
                                  }));
                                  sonnerToast.success("Candidate removed");
                                }}
                                onDraftContract={(ids) => {
                                  const params = new URLSearchParams({ 
                                    ids: ids.join(','),
                                    returnTo: 'f1v7',
                                    company: selectedCompany
                                  }).toString();
                                  navigate(`/flows/contract-creation?${params}`);
                                }}
                                onSignatureComplete={() => {
                                  navigate(`${FLOW_BASE_PATH}?phase=data-collection&allSigned=true`);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
              ) : contractFlow.phase === "contract-creation" ? (
                <motion.div key={`contract-creation-${contractFlow.currentDraftIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ContractCreationScreen
                    candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]}
                    currentIndex={contractFlow.currentDraftIndex}
                    totalCandidates={contractFlow.selectedCandidates.length}
                    onNext={() => contractFlow.proceedToBundle()}
                  />
                </motion.div>
              ) : contractFlow.phase === "bundle-creation" ? (
                <motion.div key="bundle-creation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full pt-16">
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-4xl space-y-8">
                      <div className="mb-8">
                        <AgentHeader
                          title="Contract Bundle"
                          subtitle="Review the contract bundle each candidate will receive before sending for signature."
                          showPulse={true}
                          isActive={isAgentSpeaking || !hasSpokenPhase["bundle-creation"]}
                          showInput={false}
                        />
                      </div>
                    {contractFlow.selectedCandidates.map((candidate) => (
                      <div key={candidate.id} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{candidate.flag}</span>
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">{candidate.name}</h2>
                            <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.country}</p>
                          </div>
                        </div>
                        <DocumentBundleCarousel
                          candidate={candidate}
                          onGenerateBundle={(docs) => {}}
                          hideButton={true}
                          onClose={() => navigate(FLOW_BASE_PATH)}
                        />
                      </div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4"
                    >
                      <Button 
                        onClick={() => { 
                          toast({ title: "Signing packs generated for all candidates" }); 
                          contractFlow.proceedFromBundle(); 
                        }}
                        size="lg"
                        className="w-full"
                      >
                        <FileCheck className="mr-2 h-5 w-5" />
                        Generate Signing Packs
                      </Button>
                    </motion.div>
                  </div>
                </div>
                </motion.div>
              ) : contractFlow.phase === "drafting" ? (
                <motion.div key="drafting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full pt-16">
                  <div className="flex-1 flex flex-col items-center px-2 sm:px-4 md:px-8 py-4 sm:py-8">
                    <div className="w-full max-w-7xl space-y-3 sm:space-y-8">
                      <F1v5_ContractDraftWorkspace
                        candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]} 
                        index={contractFlow.currentDraftIndex} 
                        total={contractFlow.selectedCandidates.length}
                        allDocsPreConfirmed={cameFromReview}
                        onNext={() => { 
                          const isLast =
                            contractFlow.currentDraftIndex >=
                            contractFlow.selectedCandidates.length - 1;

                          contractFlow.nextDraft();
                          setCameFromReview(false);

                          if (isLast) {
                            navigate(`${FLOW_BASE_PATH}?phase=reviewing`, { replace: true });
                          }
                        }}
                        onPrevious={() => {
                          if (contractFlow.currentDraftIndex === 0) {
                            const candidateIds = contractFlow.selectedCandidates.map(c => c.id).join(',');
                            const company = selectedCompany;
                            const params = new URLSearchParams({
                              ids: candidateIds,
                              returnTo: 'f1v7',
                              ...(company && { company }),
                            }).toString();
                            navigate(`/flows/contract-creation?${params}`);
                          } else {
                            contractFlow.previousDraft();
                          }
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : contractFlow.phase === "reviewing" ? (
                <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-screen pt-16">
                  <div className="flex-1 px-4 py-6 sm:p-8">
                    <ContractReviewBoard 
                      candidates={(() => {
                        const candidateIds = contractFlow.selectedCandidates.map(c => c.id);
                        const contractors = companyContractors[selectedCompany] || [];
                        const countryCodeMap: Record<string, string> = { Singapore: "SG", Spain: "ES", Norway: "NO", Philippines: "PH", Ireland: "IE", India: "IN" };
                        const currencyMap: Record<string, string> = { Singapore: "SGD", Spain: "EUR", Norway: "NOK", Philippines: "PHP", Ireland: "EUR", India: "INR" };
                        return contractors
                          .filter((c: any) => candidateIds.includes(c.id))
                          .map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            role: c.role,
                            country: c.country,
                            countryCode: c.countryCode || countryCodeMap[c.country] || "US",
                            flag: c.countryFlag || c.flag || "",
                            salary: c.salary || "",
                            startDate: c.startDate || "",
                            noticePeriod: c.noticePeriod || "30 days",
                            pto: c.pto || "15 days/year",
                            currency: c.currency || currencyMap[c.country] || "USD",
                            signingPortal: c.signingPortal || "DocuSign",
                            status: "Hired" as const,
                            email: c.email,
                            employmentType: c.employmentType,
                            nationality: c.nationality,
                          }));
                      })()}
                      onBack={() => {
                        setCameFromReview(true);
                        contractFlow.backToDrafting();
                      }}
                      onStartSigning={() => { 
                        const candidateIds = contractFlow.selectedCandidates.map(c => c.id);
                        setCompanyContractors(prev => ({
                          ...prev,
                          [selectedCompany]: (prev[selectedCompany] || []).map(c =>
                            candidateIds.includes(c.id) 
                              ? { ...c, status: "awaiting-signature" }
                              : c
                          )
                        }));
                        contractFlow.proceedToDataCollection();
                        toast({ title: "Contracts sent for signature", description: `${contractFlow.selectedCandidates.length} candidate(s) moved to Waiting for Signature` });
                        navigate(`${FLOW_BASE_PATH}?phase=data-collection&moved=true`);
                      }}
                    />
                  </div>
                </motion.div>
              ) : contractFlow.phase === "document-bundle-signature" ? (
                <motion.div key="document-bundle-signature" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DocumentBundleSignature 
                    candidates={contractFlow.selectedCandidates} 
                    onSendBundle={() => { 
                      contractFlow.startSigning(); 
                    }}
                    onClose={() => { contractFlow.proceedToDataCollection(); navigate(`${FLOW_BASE_PATH}?phase=data-collection`); }}
                  />
                </motion.div>
              ) : contractFlow.phase === "signing" ? (
                <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <ContractSignaturePhase 
                    candidates={contractFlow.selectedCandidates} 
                    onComplete={() => { 
                      contractFlow.completeFlow(); 
                    }}
                  />
                </motion.div>
              ) : contractFlow.phase === "complete" ? (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-3xl space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <ContractFlowSummary 
                         candidates={contractFlow.selectedCandidates} 
                       />
                     </motion.div>
                   </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            )}
            </div>
          </div>
        </AgentLayout>
      </main>
      
      <F1v4_AddCandidateDrawer
        open={isAddCandidateDrawerOpen}
        onOpenChange={setIsAddCandidateDrawerOpen}
        onSave={handleSaveCandidate}
      />
    </div>
  </RoleLensProvider>
  );
};

export default AdminContractingMultiCompany;
