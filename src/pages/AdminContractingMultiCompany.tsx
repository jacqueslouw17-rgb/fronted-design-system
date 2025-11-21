/**
 * Flow 2.1 — Admin Contracting (Multi-Company Version)
 * 
 * This flow is editable and adds company switching capabilities
 * to the base contracting flow.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, FileCheck } from "lucide-react";
import frontedLogo from "@/assets/fronted-logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useContractFlow } from "@/hooks/useContractFlow";
import { ContractFlowNotification } from "@/components/contract-flow/ContractFlowNotification";
import { CandidateConfirmationScreen } from "@/components/contract-flow/CandidateConfirmationScreen";
import { DocumentBundleCarousel } from "@/components/contract-flow/DocumentBundleCarousel";
import { ContractDraftWorkspace } from "@/components/contract-flow/ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";
import { ContractSignaturePhase } from "@/components/contract-flow/ContractSignaturePhase";
import { ContractFlowSummary } from "@/components/contract-flow/ContractFlowSummary";
import { ComplianceTransitionNote } from "@/components/contract-flow/ComplianceTransitionNote";
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import { DocumentBundleSignature } from "@/components/contract-flow/DocumentBundleSignature";
import { PipelineView } from "@/components/contract-flow/PipelineView";
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
import EmbeddedAdminOnboarding from "@/components/flows/onboarding/EmbeddedAdminOnboarding";
import { AddCandidateDrawer } from "@/components/contract-flow/AddCandidateDrawer";

// Mock companies data
const MOCK_COMPANIES = [
  { id: "1", name: "TechCorp Global" },
  { id: "2", name: "InnovateLabs Inc." },
  { id: "3", name: "Startup Ventures" },
  { id: "4", name: "Digital Dynamics Ltd." },
  { id: "5", name: "CloudScale Solutions" },
  { id: "6", name: "NextGen Enterprises" },
  { id: "7", name: "Quantum Systems Co." },
  { id: "8", name: "FutureWorks International" },
  { id: "9", name: "Apex Technologies" },
  { id: "10", name: "Horizon Group" },
  { id: "11", name: "Catalyst Innovations" },
  { id: "12", name: "Vanguard Partners" },
];

const AdminContractingMultiCompany = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2" | "v3" | "v4" | "v5">("v3");
  const contractFlow = useContractFlow(version === "v3" || version === "v5" ? version : "v3");
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
  const { contractors } = useContractorStore();
  
  // Company switcher state
  const [selectedCompany, setSelectedCompany] = useState<string>(MOCK_COMPANIES[0].id);
  const [isAddingNewCompany, setIsAddingNewCompany] = useState<boolean>(false);
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [companyContractors, setCompanyContractors] = useState<Record<string, any[]>>({
    "1": [ // TechCorp Global
      {
        id: "contractor-1",
        name: "Maria Santos",
        country: "Philippines",
        countryFlag: "🇵🇭",
        role: "Senior Developer",
        salary: "PHP 120,000/mo",
        status: "offer-accepted" as const,
        formSent: false,
        dataReceived: false,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-2",
        name: "Liam Chen",
        country: "Singapore",
        countryFlag: "🇸🇬",
        role: "Frontend Developer",
        salary: "SGD 7,500/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-1b",
        name: "Ahmed Hassan",
        country: "Egypt",
        countryFlag: "🇪🇬",
        role: "Backend Developer",
        salary: "EGP 45,000/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
    ],
    "2": [ // InnovateLabs Inc.
      {
        id: "contractor-3",
        name: "Sofia Rodriguez",
        country: "Mexico",
        countryFlag: "🇲🇽",
        role: "Marketing Manager",
        salary: "MXN 45,000/mo",
        status: "awaiting-signature" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "employee" as const,
      },
      {
        id: "contractor-3b",
        name: "Lucas Silva",
        country: "Portugal",
        countryFlag: "🇵🇹",
        role: "Content Strategist",
        salary: "EUR 3,200/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-3c",
        name: "Priya Sharma",
        country: "India",
        countryFlag: "🇮🇳",
        role: "Digital Marketing Specialist",
        salary: "INR 95,000/mo",
        status: "onboarding-pending" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
    ],
    "3": [ // Startup Ventures - Empty
    ],
    "5": [ // CloudScale Solutions
      {
        id: "contractor-5",
        name: "James Anderson",
        country: "United Kingdom",
        countryFlag: "🇬🇧",
        role: "DevOps Engineer",
        salary: "GBP 5,500/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-6",
        name: "Emma Wilson",
        country: "Australia",
        countryFlag: "🇦🇺",
        role: "Product Manager",
        salary: "AUD 9,000/mo",
        status: "awaiting-signature" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "employee" as const,
      },
      {
        id: "contractor-5b",
        name: "Oliver Schmidt",
        country: "Germany",
        countryFlag: "🇩🇪",
        role: "Cloud Architect",
        salary: "EUR 7,200/mo",
        status: "data-pending" as const,
        formSent: true,
        dataReceived: false,
        employmentType: "contractor" as const,
      },
    ],
    "7": [ // Quantum Systems Co.
      {
        id: "contractor-7",
        name: "Carlos Mendez",
        country: "Brazil",
        countryFlag: "🇧🇷",
        role: "Data Scientist",
        salary: "BRL 18,000/mo",
        status: "trigger-onboarding" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-7b",
        name: "Anna Kowalski",
        country: "Poland",
        countryFlag: "🇵🇱",
        role: "ML Engineer",
        salary: "PLN 15,000/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
    ],
    "9": [ // Apex Technologies
      {
        id: "contractor-8",
        name: "Yuki Tanaka",
        country: "Japan",
        countryFlag: "🇯🇵",
        role: "UX Designer",
        salary: "JPY 800,000/mo",
        status: "offer-accepted" as const,
        formSent: false,
        dataReceived: false,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-9",
        name: "Nina Petrov",
        country: "Poland",
        countryFlag: "🇵🇱",
        role: "QA Engineer",
        salary: "PLN 12,000/mo",
        status: "data-pending" as const,
        formSent: true,
        dataReceived: false,
        employmentType: "employee" as const,
      },
      {
        id: "contractor-10",
        name: "Mohammed Ali",
        country: "UAE",
        countryFlag: "🇦🇪",
        role: "Solutions Architect",
        salary: "AED 22,000/mo",
        status: "CERTIFIED" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
    ],
    "11": [ // Catalyst Innovations
      {
        id: "contractor-11",
        name: "Isabella Rossi",
        country: "Italy",
        countryFlag: "🇮🇹",
        role: "Tech Lead",
        salary: "EUR 6,500/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-11b",
        name: "Thomas Dubois",
        country: "France",
        countryFlag: "🇫🇷",
        role: "Senior Engineer",
        salary: "EUR 6,000/mo",
        status: "drafting" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "contractor" as const,
      },
      {
        id: "contractor-11c",
        name: "Sarah O'Brien",
        country: "Ireland",
        countryFlag: "🇮🇪",
        role: "Software Engineer",
        salary: "EUR 5,800/mo",
        status: "trigger-onboarding" as const,
        formSent: true,
        dataReceived: true,
        employmentType: "employee" as const,
      },
    ],
  });
  const [isAddCandidateDrawerOpen, setIsAddCandidateDrawerOpen] = useState(false);
  
  // Check for new company from onboarding
  useEffect(() => {
    const newCompanyName = searchParams.get('newCompany');
    if (newCompanyName) {
      const newCompanyId = `company-${Date.now()}`;
      const newCompany = { id: newCompanyId, name: decodeURIComponent(newCompanyName) };
      
      setCompanies(prev => [...prev, newCompany]);
      setCompanyContractors(prev => ({ ...prev, [newCompanyId]: [] }));
      setSelectedCompany(newCompanyId);
      
      toast({
        title: "Company Added",
        description: `${newCompany.name} has been added successfully!`,
      });
      
      // Clean URL
      navigate('/flows/contract-flow-multi-company', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  const userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  };

  const handleCompanyChange = (companyId: string) => {
    if (companyId === "add-new") {
      // Show embedded admin onboarding flow
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

  const handleNewCompanyComplete = (companyName: string) => {
    // Add the new company directly instead of relying on URL params
    const newCompanyId = `company-${Date.now()}`;
    const newCompany = { id: newCompanyId, name: companyName };
    
    setCompanies(prev => [...prev, newCompany]);
    setCompanyContractors(prev => ({ ...prev, [newCompanyId]: [] }));
    setSelectedCompany(newCompanyId);
    
    toast({
      title: "Company Added",
      description: `${companyName} has been added successfully!`,
    });
    
    setIsAddingNewCompany(false);
  };

  const handleCancelAddCompany = () => {
    setIsAddingNewCompany(false);
  };

  const handleAddCandidate = () => {
    setIsAddCandidateDrawerOpen(true);
  };

  const handleSaveCandidate = (candidate: any) => {
    // Add candidate to current company's contractors
    setCompanyContractors(prev => ({
      ...prev,
      [selectedCompany]: [...(prev[selectedCompany] || []), candidate]
    }));
  };

  // Copy all handleKurtAction code from ContractFlowDemo
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
    
    if (phaseParam === "bundle-creation") {
      contractFlow.goToBundleCreation();
      navigate("/flows/contract-flow-multi-company", { replace: true });
    }
    
    if (signedParam === "true") {
      setShowContractSignedMessage(true);
    }
  }, [searchParams, contractFlow, navigate]);

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Topbar - hidden when adding new company */}
      {!isAddingNewCompany && (
        <Topbar 
          userName={`${userData.firstName} ${userData.lastName}`}
          isDrawerOpen={isDrawerOpen}
          onDrawerToggle={toggleDrawer}
          profileSettingsUrl="/change-password"
          profileMenuLabel="Change Password"
          companySwitcher={{
            companies,
            selectedCompany,
            onCompanyChange: handleCompanyChange
          }}
        />
      )}

      {/* Logo and Close Button for Add New Company - No container */}
      {isAddingNewCompany && (
        <>
          <img 
            src={frontedLogo}
            alt="Fronted"
            className="fixed top-6 left-8 z-50 h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCancelAddCompany}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelAddCompany}
            className="fixed top-6 right-6 z-50 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Static background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]" />
          <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
               style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
          <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
               style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
        </div>
        
        {/* Dashboard Drawer */}
        <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Contract Flow Main Area with Agent Layout */}
          <AgentLayout context="Contract Flow">
            <div className="flex-1 overflow-auto relative">
              <div className="relative z-10">
              {isAddingNewCompany ? (
                <EmbeddedAdminOnboarding
                  onComplete={handleNewCompanyComplete}
                  onCancel={handleCancelAddCompany}
                />
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
                ) : (contractFlow.phase === "offer-accepted" || contractFlow.phase === "data-collection") ? (
                  <motion.div 
                    key="data-collection" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex-1 overflow-y-auto"
                  >
                    <div className="max-w-7xl mx-auto p-8 pb-32 space-y-8">
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
                          title={`Welcome Joe, get to work at ${companies.find(c => c.id === selectedCompany)?.name || "your company"}!`}
                          subtitle={
                            searchParams.get("allSigned") === "true"
                              ? "Both candidates have signed! Let's trigger their onboarding checklists."
                              : searchParams.get("moved") === "true" 
                                ? "Great, contracts sent to candidates via their preferred signing portals."
                                : "Monitor candidate signatures and complete certification to finalize contracts."
                          }
                          showPulse={true}
                          hasChanges={searchParams.get("moved") === "true" || searchParams.get("allSigned") === "true"}
                          isActive={isAgentSpeaking || (
                            searchParams.get("allSigned") === "true"
                              ? !hasSpokenPhase["data-collection-all-signed"]
                              : searchParams.get("moved") === "true" 
                                ? !hasSpokenPhase["data-collection-moved"]
                                : !hasSpokenPhase["offer-accepted"]
                          )}
                          showInput={false}
                        />
                      )}

                    {/* Pipeline Tracking */}
                    <div className="space-y-4">
                    <div className="mt-3">
                          <PipelineView 
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
                              const params = new URLSearchParams({ ids: ids.join(',') }).toString();
                              navigate(`/flows/contract-creation?${params}`);
                            }}
                            onSignatureComplete={() => {
                              navigate("/flows/contract-flow-multi-company?phase=data-collection&allSigned=true");
                            }}
                          />
                      </div>
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
                <motion.div key="bundle-creation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full">
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        const ids = contractFlow.selectedCandidates.map(c => c.id).join(',');
                        navigate(`/flows/contract-creation?ids=${ids}`);
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow-multi-company?phase=data-collection"); }}
                      aria-label="Close and return to pipeline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

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
                          onClose={() => navigate("/flows/contract-flow-multi-company")}
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
                <motion.div key="drafting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full">
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        navigate("/flows/contract-flow-multi-company?phase=bundle-creation");
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow-multi-company?phase=data-collection"); }}
                      aria-label="Close and return to pipeline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col items-center p-8">
                    <div className="w-full max-w-7xl space-y-8">
                      <ContractDraftWorkspace
                        candidate={contractFlow.selectedCandidates[contractFlow.currentDraftIndex]} 
                        index={contractFlow.currentDraftIndex} 
                        total={contractFlow.selectedCandidates.length} 
                        onNext={() => { 
                          contractFlow.nextDraft(); 
                        }}
                        onPrevious={() => {
                          contractFlow.previousDraft();
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : contractFlow.phase === "reviewing" ? (
                <motion.div key="reviewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-full">
                  <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => contractFlow.backToDrafting()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow-multi-company?phase=data-collection"); }}
                      aria-label="Close and return to pipeline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 p-8">
                    <ContractReviewBoard 
                      candidates={contractFlow.selectedCandidates} 
                      onStartSigning={() => { 
                        contractFlow.proceedToDataCollection();
                        toast({ title: "Contracts sent for signature", description: "Candidates moved to awaiting signature column" });
                        navigate("/flows/contract-flow-multi-company?phase=data-collection&moved=true");
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
                    onClose={() => { contractFlow.proceedToDataCollection(); navigate("/flows/contract-flow-multi-company?phase=data-collection"); }}
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
      
      {/* Add Candidate Drawer */}
      <AddCandidateDrawer
        open={isAddCandidateDrawerOpen}
        onOpenChange={setIsAddCandidateDrawerOpen}
        onSave={handleSaveCandidate}
      />
    </div>
  </RoleLensProvider>
  );
};

export default AdminContractingMultiCompany;
