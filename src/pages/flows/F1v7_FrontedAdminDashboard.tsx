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
import { ArrowLeft, X, FileCheck, ChevronDown, Check, Plus, Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
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
import { F1v7_PrioritiesTab } from "@/components/flows/fronted-admin-v7-clone/priorities/F1v7_PrioritiesTab";
import { F1v7_KurtPanel } from "@/components/flows/fronted-admin-v7-clone/priorities/F1v7_KurtPanel";
import type { ActionDetail } from "@/components/flows/fronted-admin-v7-clone/priorities/F1v7_PriorityData";
import { MoreHorizontal as MoreHorizontalIcon } from "lucide-react";

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
  policies?: Record<string, any>;
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
  },
  {
    id: "company-globex",
    name: "Globex Inc",
    adminName: "Sarah Park",
    adminEmail: "sarah@globex.com",
    hqCountry: "US",
    defaultCurrency: "USD",
    payrollCurrency: ["USD", "EUR"],
    payoutDay: "28",
  },
  {
    id: "company-initech",
    name: "Initech Ltd",
    adminName: "Bill Lumbergh",
    adminEmail: "bill@initech.io",
    hqCountry: "GB",
    defaultCurrency: "GBP",
    payrollCurrency: ["GBP", "EUR"],
    payoutDay: "1",
  },
  {
    id: "company-waystar",
    name: "Waystar Royco",
    adminName: "Kendall Roy",
    adminEmail: "kendall@waystar.com",
    hqCountry: "US",
    defaultCurrency: "USD",
    payrollCurrency: ["USD", "GBP", "EUR"],
    payoutDay: "15",
  },
];

const GLOBEX_CANDIDATES = [
  {
    id: "globex-1",
    name: "Tomoko Hayashi",
    country: "Japan",
    countryFlag: "🇯🇵",
    role: "Lead UX Researcher",
    salary: "JPY 820,000/mo",
    status: "drafting",
    employmentType: "employee" as const,
    email: "tomoko.hayashi@example.com",
    dataReceived: true,
  },
  {
    id: "globex-2",
    name: "Erik Johansson",
    country: "Sweden",
    countryFlag: "🇸🇪",
    role: "Platform Engineer",
    salary: "SEK 58,000/mo",
    status: "offer-accepted",
    employmentType: "contractor" as const,
    email: "erik.johansson@example.com",
  },
  {
    id: "globex-3",
    name: "Amara Osei",
    country: "Ghana",
    countryFlag: "🇬🇭",
    role: "Growth Marketing Lead",
    salary: "USD 5,500/mo",
    status: "awaiting-signature",
    employmentType: "contractor" as const,
    email: "amara.osei@example.com",
    dataReceived: true,
  },
  {
    id: "globex-4",
    name: "Lucas Müller",
    country: "Germany",
    countryFlag: "🇩🇪",
    role: "Staff Engineer",
    salary: "EUR 9,200/mo",
    status: "CERTIFIED",
    employmentType: "employee" as const,
    email: "lucas.muller@example.com",
    dataReceived: true,
  },
];

const INITECH_CANDIDATES = [
  {
    id: "initech-1",
    name: "Fatima Al-Rashid",
    country: "UAE",
    countryFlag: "🇦🇪",
    role: "Finance Controller",
    salary: "AED 32,000/mo",
    status: "offer-accepted",
    employmentType: "employee" as const,
    email: "fatima@initech.io",
  },
  {
    id: "initech-2",
    name: "Jakub Novák",
    country: "Czech Republic",
    countryFlag: "🇨🇿",
    role: "Security Engineer",
    salary: "CZK 95,000/mo",
    status: "drafting",
    employmentType: "contractor" as const,
    email: "jakub.novak@initech.io",
    dataReceived: true,
  },
  {
    id: "initech-3",
    name: "Chiara Bianchi",
    country: "Italy",
    countryFlag: "🇮🇹",
    role: "Head of Compliance",
    salary: "EUR 7,800/mo",
    status: "CERTIFIED",
    employmentType: "employee" as const,
    email: "chiara@initech.io",
    dataReceived: true,
  },
  {
    id: "initech-4",
    name: "Kwame Asante",
    country: "Nigeria",
    countryFlag: "🇳🇬",
    role: "Mobile Developer",
    salary: "USD 4,200/mo",
    status: "awaiting-signature",
    employmentType: "contractor" as const,
    email: "kwame@initech.io",
    dataReceived: true,
  },
  {
    id: "initech-5",
    name: "Yuki Tanaka",
    country: "Japan",
    countryFlag: "🇯🇵",
    role: "QA Lead",
    salary: "JPY 680,000/mo",
    status: "trigger-onboarding",
    employmentType: "employee" as const,
    email: "yuki@initech.io",
    dataReceived: true,
  },
];

const WAYSTAR_CANDIDATES = [
  {
    id: "waystar-1",
    name: "Olivia Chen",
    country: "Canada",
    countryFlag: "🇨🇦",
    role: "VP of Engineering",
    salary: "CAD 18,500/mo",
    status: "drafting",
    employmentType: "employee" as const,
    email: "olivia@waystar.com",
    dataReceived: true,
  },
  {
    id: "waystar-2",
    name: "Raj Patel",
    country: "India",
    countryFlag: "🇮🇳",
    role: "ML Engineer",
    salary: "INR 2,40,000/mo",
    status: "offer-accepted",
    employmentType: "contractor" as const,
    email: "raj@waystar.com",
  },
  {
    id: "waystar-3",
    name: "Isabella Rossi",
    country: "Brazil",
    countryFlag: "🇧🇷",
    role: "Product Manager",
    salary: "BRL 22,000/mo",
    status: "drafting",
    employmentType: "employee" as const,
    email: "isabella@waystar.com",
  },
  {
    id: "waystar-4",
    name: "Sven Eriksen",
    country: "Denmark",
    countryFlag: "🇩🇰",
    role: "Solutions Architect",
    salary: "DKK 72,000/mo",
    status: "CERTIFIED",
    employmentType: "contractor" as const,
    email: "sven@waystar.com",
    dataReceived: true,
  },
  {
    id: "waystar-5",
    name: "Aisha Mohammed",
    country: "Kenya",
    countryFlag: "🇰🇪",
    role: "Data Scientist",
    salary: "USD 6,800/mo",
    status: "awaiting-signature",
    employmentType: "employee" as const,
    email: "aisha@waystar.com",
    dataReceived: true,
  },
  {
    id: "waystar-6",
    name: "Tomáš Horák",
    country: "Slovakia",
    countryFlag: "🇸🇰",
    role: "DevRel Lead",
    salary: "EUR 5,500/mo",
    status: "trigger-onboarding",
    employmentType: "contractor" as const,
    email: "tomas@waystar.com",
    dataReceived: true,
  },
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
  
  const ALL_CLIENTS_ID = "__all_clients__";
  const companyFromUrl = searchParams.get('company');
  const [selectedCompany, setSelectedCompany] = useState<string>(() => {
    if (companyFromUrl) return companyFromUrl;
    const saved = localStorage.getItem('adminflow-v7-selected-company');
    return saved || ALL_CLIENTS_ID;
  });
  const [isAddingNewCompany, setIsAddingNewCompany] = useState<boolean>(false);
  const [isEditingCompany, setIsEditingCompany] = useState<boolean>(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const isInContractFlow = contractFlow.phase !== "idle" && contractFlow.phase !== "offer-accepted" && contractFlow.phase !== "data-collection";

  // Set body class so portal-level CSS overrides can target v7 glass theme
  useEffect(() => {
    document.body.classList.add('v7-glass-active');
    return () => document.body.classList.remove('v7-glass-active');
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 16;
      setHeaderScrolled(scrolled);
      document.body.classList.toggle("v7-topbar-scrolled", scrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // check initial state
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("v7-topbar-scrolled");
    };
  }, []);

  const [companies, setCompanies] = useState<CompanyData[]>(() => {
    const saved = localStorage.getItem('adminflow-v7-companies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CompanyData[];
        const savedIds = new Set(parsed.map((c: CompanyData) => c.id));
        const missing = MOCK_COMPANIES.filter(c => !savedIds.has(c.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('adminflow-v7-companies', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return MOCK_COMPANIES;
      }
    }
    return MOCK_COMPANIES;
  });

  const [companyContractors, setCompanyContractors] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('adminflow-v7-company-contractors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const result = Object.fromEntries(
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
        // Merge missing company contractor lists
        const defaults: Record<string, any[]> = {
          "company-default": [...DEFAULT_DRAFTING_CANDIDATES],
          "company-globex": [...GLOBEX_CANDIDATES],
          "company-initech": [...INITECH_CANDIDATES],
          "company-waystar": [...WAYSTAR_CANDIDATES],
        };
        let updated = false;
        for (const [key, val] of Object.entries(defaults)) {
          if (!(key in result)) {
            result[key] = val;
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem('adminflow-v7-company-contractors', JSON.stringify(result));
        }
        return result;
      } catch {
        localStorage.removeItem('adminflow-v7-company-contractors');
      }
    }
    return {
      "company-default": [...DEFAULT_DRAFTING_CANDIDATES],
      "company-globex": [...GLOBEX_CANDIDATES],
      "company-initech": [...INITECH_CANDIDATES],
      "company-waystar": [...WAYSTAR_CANDIDATES],
    };
  });

  const isAllClientsMode = selectedCompany === ALL_CLIENTS_ID;
  const allClientsContractors = React.useMemo(() => {
    if (!isAllClientsMode) return [];
    return Object.entries(companyContractors).flatMap(([companyId, ctrs]) => {
      const company = companies.find(c => c.id === companyId);
      return (ctrs || []).map(c => ({ ...c, companyId, companyName: company?.name || companyId }));
    });
  }, [isAllClientsMode, companyContractors, companies]);

  // Compute employee/contractor counts for the active view
  const activeContractorsList = isAllClientsMode
    ? allClientsContractors
    : (companyContractors[selectedCompany] || []);
  const employeesList = activeContractorsList.filter(c => c.employmentType === "employee");
  const contractorsList = activeContractorsList.filter(c => c.employmentType !== "employee");
  const employeeCount = employeesList.length;
  const contractorCount = contractorsList.length;

  // Dot color logic moved below activeMainTab declaration
  const terminalStatuses = ["PAID", "CERTIFIED"];

  // Persist companies to localStorage
  useEffect(() => {
    localStorage.setItem('adminflow-v7-companies', JSON.stringify(companies));
  }, [companies]);
  
  // Persist selected company to localStorage
  useEffect(() => {
    localStorage.setItem('adminflow-v7-selected-company', selectedCompany);
  }, [selectedCompany]);
  
  // Persist company contractors to localStorage
  useEffect(() => {
    localStorage.setItem('adminflow-v7-company-contractors', JSON.stringify(companyContractors));
  }, [companyContractors]);
  
  const hasNoCompanies = companies.length === 0;
  const [isAddCandidateDrawerOpen, setIsAddCandidateDrawerOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<"priorities" | "tracker" | "payroll">("priorities");
  
  // Kurt panel state
  const [isKurtPanelOpen, setIsKurtPanelOpen] = useState(false);
  const [kurtMessages, setKurtMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const [kurtLoading, setKurtLoading] = useState(false);
  const [kurtHighlightedWorker, setKurtHighlightedWorker] = useState<string | null>(null);
  const [kurtAutoApproveWorkerId, setKurtAutoApproveWorkerId] = useState<string | null>(null);
  const [kurtOrchestrationWorkers, setKurtOrchestrationWorkers] = useState<Array<{ id: string; name: string; flag: string; detail: string; status: "pending" | "processing" | "done" }>>([]);
  const [kurtScrollTrackerToEnd, setKurtScrollTrackerToEnd] = useState(false);

  // Toggle body class for drawer offset when Kurt is open
  React.useEffect(() => {
    if (isKurtPanelOpen) {
      document.body.classList.add("kurt-panel-open");
    } else {
      document.body.classList.remove("kurt-panel-open");
    }
    return () => document.body.classList.remove("kurt-panel-open");
  }, [isKurtPanelOpen]);

  const handleKurtAddMessage = React.useCallback((msg: { id: string; role: "user" | "assistant"; content: string }) => {
    setKurtMessages(prev => {
      const existing = prev.findIndex(m => m.id === msg.id);
      if (existing >= 0) {
        return prev.map(m => m.id === msg.id ? msg : m);
      }
      return [...prev, msg];
    });
  }, []);

  // Track completed priority approval for count updates
  const [completedPriorityActions, setCompletedPriorityActions] = useState<Set<string>>(new Set());
  const [kurtActiveAction, setKurtActiveAction] = useState<string | null>(null);

  const openKurtForAction = React.useCallback((actionId: string, tab: "priorities" | "tracker" | "payroll") => {
    setIsKurtPanelOpen(true);
    setKurtMessages([]);
    setKurtLoading(true);
    setKurtOrchestrationWorkers([]);
    setKurtActiveAction(actionId);
    setActiveMainTab(tab);
  }, []);

  const handlePriorityActionClick = React.useCallback((action: ActionDetail) => {
    if (action.id === "a1") {
      openKurtForAction("a1", "payroll");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `🔍 **Reviewing January payroll batch for Acme Corp...**\n\nI've analyzed the batch — here's what I found:\n\n---\n\n### ✅ Auto-Approvable (5 of 7 workers)\n\n- **Maria Santos** 🇵🇭 — ₱15,200 expenses + ₱6,500 bonus *(within policy)*\n- **Emma Wilson** 🇳🇴 — kr2,800 equipment *(receipts verified)*\n- **Alex Hansen** 🇳🇴 — kr4,500 overtime + kr750 parking *(within limits)*\n- Plus 4 workers with no pending items already ready\n\n### ⚠️ Needs Manual Review (2 items)\n\n- **Alex Hansen** — 2 days unpaid leave *(requires HR sign-off)*\n- **Marcus Chen** — Termination flag *(include/exclude decision needed)*\n\n---\n\n💡 I can auto-approve the compliant items now. This saves ~15 minutes of manual review.\n\n**Would you like me to proceed?**`,
        }]);
      }, 4500);
    } else if (action.id === "a2") {
      openKurtForAction("a2", "tracker");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `📋 **Reviewing contract bundle for Globex Inc...**\n\n👤 **Sarah Park** — Senior Developer\n\n📄 **Bundle contents:**\n- Employment Agreement (updated compensation clause)\n- Non-Compete Addendum (12 months, EU scope)\n- IP Assignment Agreement (standard template)\n- Data Processing Agreement (GDPR-compliant)\n\n⏰ Current contract expires Friday.\n\n---\n\n🔍 Cross-reference against templates:\n- ✅ Employment Agreement — matches template\n- ✅ IP Assignment — standard, no deviations\n- ⚠️ Non-Compete — 12-month duration exceeds your 6-month default\n- ✅ DPA — GDPR-compliant\n\n💡 The non-compete duration should be reviewed. I can open the contract panel for you.\n\n**Would you like me to proceed?**`,
        }]);
      }, 3500);
    } else if (action.id === "a7") {
      openKurtForAction("a7", "tracker");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `📂 **Scanning onboarding documents for Acme Corp...**\n\n**4 workers** with documents pending verification:\n\n1. **Lena Müller** 🇩🇪 — ID scan + work permit uploaded\n2. **Carlos Gutierrez** 🇲🇽 — Passport + visa uploaded\n3. **Yuki Tanaka** 🇯🇵 — ID + bank details uploaded\n4. **Aisha Okafor** 🇳🇬 — All docs uploaded\n\n---\n\n💡 I can open each worker's profile, verify their documents, and move them into the verified column one by one.\n\n**Would you like me to proceed?**`,
        }]);
      }, 4000);
    } else if (action.id === "a9") {
      openKurtForAction("a9", "payroll");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `💰 **Reviewing pending expense adjustments for Globex Inc...**\n\n### ✅ Auto-Approvable (4 workers)\n\n- **Sarah Park** 🇺🇸 — $320 client dinner *(receipts verified)*\n- **Tom Bradley** 🇬🇧 — £450 conference travel *(pre-approved)*\n- **Nina Petrović** 🇷🇸 — €180 office supplies *(within budget)*\n- **Raj Patel** 🇮🇳 — ₹12,500 equipment *(PO attached)*\n\n### ⚠️ Needs Manual Review (2)\n\n- **James O'Brien** 🇮🇪 — €2,800 relocation *(exceeds limit)*\n- **Li Wei** 🇨🇳 — ¥8,500 software *(no receipt)*\n\n---\n\n💡 I can auto-approve the 4 compliant claims now.\n\n**Would you like me to proceed?**`,
        }]);
      }, 4000);
    } else if (action.id === "a4") {
      openKurtForAction("a4", "tracker");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `🛡️ **Checking compliance documents for Acme Corp...**\n\n### Missing Documents\n\n1. **Lena Müller** 🇩🇪 — Work permit expired 2 weeks ago\n2. **Pierre Dubois** 🇫🇷 — Residence card copy missing\n3. **Anna Kowalski** 🇩🇪 — New hire, work permit not uploaded\n\n### Risk Assessment\n- 🔴 **Lena** — High risk. Cannot legally work.\n- 🟡 **Pierre** — Medium risk. Likely has it.\n- 🟡 **Anna** — Medium risk. Start date in 2 weeks.\n\n---\n\n💡 I can draft personalized follow-up emails to each worker with appropriate urgency and deadlines.\n\n**Would you like me to proceed?**`,
        }]);
      }, 3800);
    } else if (action.id === "a6") {
      openKurtForAction("a6", "tracker");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `🔍 **Investigating visa expiration for Waystar Royco...**\n\n👤 **Kenji Watanabe** 🇯🇵 → Working in 🇩🇪 Germany\n\n- Type: EU Blue Card\n- Expiry: **February 8, 2026** (28 days)\n- Renewal status: ❌ Not started\n- Processing time: 4–6 weeks\n\n### ⚠️ This is urgent.\n\nThe application should have been filed already.\n\n1. Notify Kenji and his manager\n2. File renewal this week\n3. Request Fiktionsbescheinigung (interim authorization)\n4. Alert payroll about potential pause\n\n---\n\n💡 I can draft a notification to Kenji with renewal instructions and set a 5-day follow-up reminder.\n\n**Would you like me to proceed?**`,
        }]);
      }, 3500);
    } else if (action.id === "a5") {
      openKurtForAction("a5", "tracker");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `✍️ **Checking pending signatures for Globex Inc...**\n\n👤 **Tom Bradley** 🇬🇧 — Senior Consultant\n\n📄 Consulting Agreement (12-month renewal)\n- Sent: 4 days ago\n- Reminder sent: 2 days ago\n- No response yet\n\nTom is active on Slack (last seen today). Previous contracts signed within 24h — this delay is unusual.\n\n---\n\n💡 I can send a friendly nudge with a direct signing link. If no response in 24h, I'll escalate to his manager.\n\n**Would you like me to proceed?**`,
        }]);
      }, 3000);
    } else if (action.id === "a10") {
      openKurtForAction("a10", "tracker");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `📝 **Checking amendment for Acme Corp...**\n\n👤 **David Martinez** 🇵🇹 — Senior Engineer\n\nSalary adjustment: €4,200 → €4,800/month (+14.3%)\n- Sent 5 days ago — **overdue**\n- David was on PTO Dec 23–Jan 3\n\n### Impact\n- January payroll uses the **old rate** until signed\n- €600 retroactive adjustment will be needed\n\n---\n\n💡 I can send an escalation email with the signing link, cc'd to his manager.\n\n**Would you like me to proceed?**`,
        }]);
      }, 3200);
    } else if (action.id === "a3") {
      openKurtForAction("a3", "payroll");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `🚫 **Investigating tax ID mismatches for Waystar Royco...**\n\n**1. Kenji Watanabe** 🇯🇵 — ID format invalid (10 chars, needs 11)\n**2. Rachel Kim** 🇰🇷 — Name mismatch (Korean vs romanized)\n\n### Payroll Impact\n- €8,400 blocked from disbursement\n- If unresolved by Friday: payroll runs without them\n\n---\n\n💡 I can draft notifications requesting correct info and prepare Rachel's correction form.\n\n**Would you like me to proceed?**`,
        }]);
      }, 4200);
    } else if (action.id === "a8") {
      openKurtForAction("a8", "payroll");
      setTimeout(() => {
        setKurtLoading(false);
        setKurtMessages([{ id: `kurt-${Date.now()}`, role: "assistant",
          content: `💱 **Analyzing FX exposure for Globex Inc...**\n\n### GBP/EUR Rate Lock\n- Locked: 1.2700 | Current: 1.2410 (−2.3%)\n- Expires: 2 days | Auto-renew: Off\n\n### Exposure\n- 3 GBP workers, £12,400/month combined\n- Locked: €15,748 vs Current: €15,388\n- **Save €360/month** by letting lock expire\n\nGBP has weakened 1.8% this month. Forecast: further 0.5–1% weakening.\n\n---\n\n💡 Let the lock expire and pay at spot rate. I can set up a rate alert if GBP moves above 1.26.\n\n**Would you like me to proceed?**`,
        }]);
      }, 3500);
    }
  }, [openKurtForAction]);

  // Kurt orchestration engine
  const kurtApprovalQueueRef = React.useRef<Array<{ id: string; name: string; flag: string; detail: string; pendingCount: number }>>([]);
  const kurtApprovalIndexRef = React.useRef(0);

  const getNarrations = React.useCallback((actionId: string): string[][] => {
    if (actionId === "a1") return [
      ["📂 Opening **Maria Santos** 🇵🇭 — checking 4 pending items...","🔎 Reviewing flight expense ₱15,200...","✅ Flight booking verified. Approving.","🔎 Reviewing meal expenses ₱3,800...","✅ Receipts match. Approving.","🔎 Reviewing bonus ₱6,500...","✅ Matches Q4 schedule. Approving.","🔎 Reviewing taxi receipt ₱1,200...","✅ Receipt verified. Approving.","✨ **Maria Santos** — all 4 items approved."],
      ["📂 Opening **Emma Wilson** 🇳🇴 — checking 2 pending items...","🔎 Reviewing equipment kr2,800...","✅ Purchase order matches. Approving.","🔎 Reviewing timesheet...","✅ Hours align. Approving.","✨ **Emma Wilson** — all items approved."],
      ["📂 Opening **Alex Hansen** 🇳🇴 — checking 2 pending items...","🔎 Reviewing overtime kr4,500...","✅ Within cap. Approving.","🔎 Reviewing parking kr750...","✅ Receipt verified. Approving.","✨ **Alex Hansen** — compliant items approved. Unpaid leave flagged for HR."],
    ];
    if (actionId === "a7") return [
      ["📂 Opening **Lena Müller** 🇩🇪...","🔎 Verifying government ID...","✅ Personalausweis valid until 2029.","🔎 Checking work authorization...","✅ EU citizen — no permit required.","✨ **Lena Müller** — verified. Moving to done column."],
      ["📂 Opening **Carlos Gutierrez** 🇲🇽...","🔎 Verifying passport...","✅ Passport valid until 2028.","🔎 Checking work visa...","✅ EU Blue Card valid until 2027.","🔎 Verifying bank details...","✅ IBAN verified.","✨ **Carlos Gutierrez** — verified. Moving to done column."],
      ["📂 Opening **Yuki Tanaka** 🇯🇵...","🔎 Verifying ID...","✅ Passport valid until 2030.","🔎 Checking bank details...","✅ SWIFT code valid.","✨ **Yuki Tanaka** — verified. Moving to done column."],
      ["📂 Opening **Aisha Okafor** 🇳🇬...","🔎 Verifying ID...","✅ Passport valid until 2029.","🔎 Checking work permit...","✅ DE permit valid until June 2026.","🔎 Verifying agreement...","✅ Signed. Terms match.","✨ **Aisha Okafor** — verified. Moving to done column."],
    ];
    if (actionId === "a9") return [
      ["📂 Opening **Sarah Park** 🇺🇸...","🔎 Reviewing client dinner $320...","✅ Receipt attached. Approving.","✨ **Sarah Park** — expense approved."],
      ["📂 Opening **Tom Bradley** 🇬🇧...","🔎 Reviewing conference travel £450...","✅ Pre-approved. Receipts match. Approving.","✨ **Tom Bradley** — expense approved."],
      ["📂 Opening **Nina Petrović** 🇷🇸...","🔎 Reviewing office supplies €180...","✅ Within budget. Approving.","✨ **Nina Petrović** — expense approved."],
      ["📂 Opening **Raj Patel** 🇮🇳...","🔎 Reviewing equipment ₹12,500...","✅ PO matches. Approving.","✨ **Raj Patel** — expense approved."],
    ];
    if (actionId === "a4") return [
      ["📧 Drafting for **Lena Müller** 🇩🇪...","🔴 Urgent: work permit expired. Including renewal instructions.","✅ Email sent with 48-hour deadline."],
      ["📧 Drafting for **Pierre Dubois** 🇫🇷...","🟡 Residence card needed. Including upload link.","✅ Email sent with 5-day deadline."],
      ["📧 Drafting for **Anna Kowalski** 🇩🇪...","🟡 Work permit needed before start date.","✅ Email sent with pre-start deadline."],
    ];
    // Single-shot actions — one narration sequence (no worker cards, just step-by-step narration)
    if (actionId === "a2") return [
      ["📂 Opening contract panel for **Sarah Park** — Globex Inc...","🔎 Loading employment agreement...","🔎 Cross-referencing non-compete clause against your 6-month default...","⚠️ **Flagged:** Non-compete is 12 months — exceeds your policy.","📌 Highlighting clause for your review.","✅ Contract panel ready. Non-compete clause flagged in yellow."],
    ];
    if (actionId === "a5") return [
      ["📧 Composing nudge for **Tom Bradley** 🇬🇧...","🔗 Generating direct signing link...","📧 Adding friendly reminder + 24h deadline...","✅ Nudge sent via email.","⏰ Auto-escalation set for 24h if no response."],
    ];
    if (actionId === "a6") return [
      ["📧 Composing notification for **Kenji Watanabe** 🇯🇵...","📋 Attaching renewal instructions for EU Blue Card...","📧 Including Fiktionsbescheinigung request form...","✅ Notification sent to Kenji.","📧 Alerting payroll team about potential pause...","✅ Payroll alert sent.","⏰ Follow-up reminder set for 5 days."],
    ];
    if (actionId === "a10") return [
      ["📧 Composing escalation for **David Martinez** 🇵🇹...","📋 Including signing link + retroactive impact (€600)...","📧 CC'ing manager on escalation...","✅ Escalation email sent.","⏰ Tracking — will notify when signed."],
    ];
    if (actionId === "a3") return [
      ["📧 Drafting for **Kenji Watanabe** 🇯🇵 — Tax ID format invalid...","📋 Requesting corrected 11-digit ID...","✅ Email sent with 24h deadline.","📧 Drafting for **Rachel Kim** 🇰🇷 — Name mismatch...","📋 Attaching correction form for romanized name...","✅ Email sent — estimated 2–3 days.","⏰ Tracking responses for both."],
    ];
    if (actionId === "a8") return [
      ["💱 Setting rate lock to expire in 2 days...","📊 Configuring spot rate for next GBP payouts...","🔔 Setting rate alert at GBP/EUR 1.2600...","✅ FX lock will expire. Spot rate active from next cycle."],
    ];
    return [];
  }, []);

  const getActionWorkers = React.useCallback((actionId: string) => {
    if (actionId === "a1") return { queue: [
      { id: "3", name: "Maria Santos", flag: "🇵🇭", detail: "₱15,200 expenses + ₱6,500 bonus", pendingCount: 4 },
      { id: "6", name: "Emma Wilson", flag: "🇳🇴", detail: "kr2,800 equipment + timesheet", pendingCount: 2 },
      { id: "4", name: "Alex Hansen", flag: "🇳🇴", detail: "kr4,500 overtime + kr750 parking", pendingCount: 2 },
    ], ready: [
      { id: "1", name: "Marcus Chen", flag: "🇸🇬", detail: "No pending items" },
      { id: "2", name: "Sofia Rodriguez", flag: "🇪🇸", detail: "No pending items" },
      { id: "5", name: "David Martinez", flag: "🇵🇹", detail: "No pending items" },
      { id: "7", name: "Jonas Schmidt", flag: "🇩🇪", detail: "No pending items" },
    ]};
    if (actionId === "a7") return { queue: [
      { id: "onb-1", name: "Lena Müller", flag: "🇩🇪", detail: "ID + work permit", pendingCount: 2 },
      { id: "onb-2", name: "Carlos Gutierrez", flag: "🇲🇽", detail: "Passport + visa + bank", pendingCount: 3 },
      { id: "onb-3", name: "Yuki Tanaka", flag: "🇯🇵", detail: "ID + bank details", pendingCount: 2 },
      { id: "onb-4", name: "Aisha Okafor", flag: "🇳🇬", detail: "ID + permit + agreement", pendingCount: 3 },
    ], ready: [] };
    if (actionId === "a9") return { queue: [
      { id: "exp-1", name: "Sarah Park", flag: "🇺🇸", detail: "$320 client dinner", pendingCount: 1 },
      { id: "exp-2", name: "Tom Bradley", flag: "🇬🇧", detail: "£450 conference travel", pendingCount: 1 },
      { id: "exp-3", name: "Nina Petrović", flag: "🇷🇸", detail: "€180 office supplies", pendingCount: 1 },
      { id: "exp-4", name: "Raj Patel", flag: "🇮🇳", detail: "₹12,500 equipment", pendingCount: 1 },
    ], ready: [] };
    if (actionId === "a4") return { queue: [
      { id: "comp-1", name: "Lena Müller", flag: "🇩🇪", detail: "Work permit expired", pendingCount: 1 },
      { id: "comp-2", name: "Pierre Dubois", flag: "🇫🇷", detail: "Residence card missing", pendingCount: 1 },
      { id: "comp-3", name: "Anna Kowalski", flag: "🇩🇪", detail: "Work permit not uploaded", pendingCount: 1 },
    ], ready: [] };
    return { queue: [], ready: [] };
  }, []);

  const getCompletionMessage = React.useCallback((actionId: string): string => {
    const msgs: Record<string, string> = {
      a1: "🎉 **All compliant workers approved!**\n\n- ✅ **5 workers** auto-approved\n- ⚠️ **2 items** still need attention: Alex Hansen's unpaid leave + Marcus Chen's termination flag\n\n💡 Would you like me to walk you through the remaining items?",
      a7: "🎉 **All onboarding documents verified!**\n\n- ✅ **4 workers** verified and moved to done\n- Lena Müller, Carlos Gutierrez, Yuki Tanaka, Aisha Okafor\n\n💡 Start dates can now be confirmed. Day 1 instructions will be sent automatically.",
      a9: "🎉 **All compliant expenses approved!**\n\n- ✅ **4 claims** approved ($320 + £450 + €180 + ₹12,500)\n- ⚠️ **2 claims** need manual review: James O'Brien + Li Wei\n\n💡 Would you like me to walk you through the remaining items?",
      a4: "✅ **All follow-up emails sent!**\n\n- 📧 Lena Müller — 48-hour deadline\n- 📧 Pierre Dubois — 5-day deadline\n- 📧 Anna Kowalski — pre-start deadline\n\n💡 Automatic reminders set. I'll notify you if anyone misses their deadline.",
      a2: "✅ **Contract bundle opened.** The non-compete clause has been flagged. You can review and approve from the contract panel.",
      a6: "✅ **Visa alert sent.** Notification sent to Kenji with renewal instructions. Follow-up reminder set for 5 days. Payroll team alerted.",
      a5: "✅ **Nudge sent to Tom Bradley.** If no response in 24h, I'll escalate to his manager.",
      a10: "✅ **Escalation sent to David Martinez.** Email cc'd to manager noting the €600 retroactive impact. I'll notify you when it's signed.",
      a3: "✅ **Tax ID resolution initiated.** Emails sent to Kenji (24h) and Rachel (2–3 days). I'll track responses.",
      a8: "✅ **FX lock set to expire.** GBP payouts will use spot rate, saving ~€360. Rate alert set for 1.2600.",
    };
    return msgs[actionId] || "✅ Action completed.";
  }, []);

  const startNextKurtWorker = React.useCallback(() => {
    const queue = kurtApprovalQueueRef.current;
    const idx = kurtApprovalIndexRef.current;
    if (idx >= queue.length) return;
    const worker = queue[idx];
    const narrations = (getNarrations(kurtActiveAction || "")[idx]) || [];

    setKurtHighlightedWorker(worker.id);
    setKurtAutoApproveWorkerId(worker.id);
    setKurtOrchestrationWorkers(prev => prev.map(w => w.id === worker.id ? { ...w, status: "processing" } : w));

    const NARRATION_GAP = 1200;
    narrations.forEach((narration: string, i: number) => {
      setTimeout(() => {
        handleKurtAddMessage({ id: `kurt-narr-${worker.id}-${i}-${Date.now()}`, role: "assistant", content: narration });
      }, 500 + i * NARRATION_GAP);
    });

    // For non-payroll actions, auto-complete after narration finishes
    const isPayrollAction = kurtActiveAction === "a1" || kurtActiveAction === "a9";
    if (!isPayrollAction) {
      setTimeout(() => { handleKurtApprovalComplete(worker.id); }, 500 + narrations.length * NARRATION_GAP + 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKurtAddMessage, getNarrations, kurtActiveAction]);

  const handleKurtActionResponse = React.useCallback((action: "yes" | "no" | "other", message?: string) => {
    if (action !== "yes") return;
    const activeAction = kurtActiveAction;
    if (!activeAction) return;
    const { queue, ready } = getActionWorkers(activeAction);

    if (queue.length > 0) {
      const allWorkers = [
        ...queue.map(w => ({ ...w, status: "pending" as const })),
        ...ready.map(w => ({ ...w, status: "done" as const })),
      ];
      kurtApprovalQueueRef.current = queue;
      kurtApprovalIndexRef.current = 0;
      setKurtLoading(true);
      setKurtOrchestrationWorkers(allWorkers);
      // Scroll tracker to end for document verification actions
      if (activeAction === "a7") {
        setKurtScrollTrackerToEnd(true);
      }

      const labels: Record<string, string> = { a1: "Starting auto-approval sequence", a9: "Starting expense approval", a7: "Starting document verification", a4: "Drafting follow-up emails" };
      setTimeout(() => {
        setKurtLoading(false);
        handleKurtAddMessage({ id: `kurt-orch-${Date.now()}`, role: "assistant",
          content: `⚡ **${labels[activeAction] || "Processing"}...**\n\nI'll process each item one by one. Watch the progress below.`,
        });
        setTimeout(() => { startNextKurtWorker(); }, 1500);
      }, 1500);
    } else {
      // Single-shot actions — show step-by-step narration without worker cards
      const singleNarrations = getNarrations(activeAction);
      if (singleNarrations.length > 0 && singleNarrations[0].length > 0) {
        const steps = singleNarrations[0];
        const STEP_GAP = 1200;
        setKurtLoading(true);
        setTimeout(() => {
          setKurtLoading(false);
          handleKurtAddMessage({ id: `kurt-orch-${Date.now()}`, role: "assistant",
            content: `⚡ **On it.** Watch the progress below.`,
          });
          steps.forEach((step, i) => {
            setTimeout(() => {
              handleKurtAddMessage({ id: `kurt-step-${activeAction}-${i}-${Date.now()}`, role: "assistant", content: step });
            }, 800 + i * STEP_GAP);
          });
          // Show completion message after all steps
          setTimeout(() => {
            handleKurtAddMessage({ id: `kurt-complete-${Date.now()}`, role: "assistant", content: getCompletionMessage(activeAction) });
            setCompletedPriorityActions(prev => new Set(prev).add(activeAction));
          }, 800 + steps.length * STEP_GAP + 800);
        }, 1500);
      } else {
        setKurtLoading(true);
        setTimeout(() => {
          setKurtLoading(false);
          handleKurtAddMessage({ id: `kurt-complete-${Date.now()}`, role: "assistant", content: getCompletionMessage(activeAction) });
          setCompletedPriorityActions(prev => new Set(prev).add(activeAction));
        }, 2500);
      }
    }
  }, [kurtActiveAction, handleKurtAddMessage, startNextKurtWorker, getActionWorkers, getCompletionMessage]);

  const handleKurtApprovalComplete = React.useCallback((workerId: string) => {
    setKurtOrchestrationWorkers(prev => prev.map(w => w.id === workerId ? { ...w, status: "done" as const } : w));
    kurtApprovalIndexRef.current += 1;
    const queue = kurtApprovalQueueRef.current;
    const nextIdx = kurtApprovalIndexRef.current;

    if (nextIdx < queue.length) {
      setTimeout(() => { startNextKurtWorker(); }, 2000);
    } else {
      setTimeout(() => {
        setKurtHighlightedWorker(null);
        setKurtAutoApproveWorkerId(null);
        handleKurtAddMessage({ id: `kurt-done-${Date.now()}`, role: "assistant", content: getCompletionMessage(kurtActiveAction || "a1") });
        setCompletedPriorityActions(prev => new Set(prev).add(kurtActiveAction || "a1"));
      }, 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKurtAddMessage, startNextKurtWorker, kurtActiveAction, getCompletionMessage]);

  // Dot color: orange if any worker of that type has pending work, green if all resolved
  // When on payroll tab, workers in payroll are already active/onboarded, so show green
  const employeesAllResolved = activeMainTab === "payroll" || activeMainTab === "priorities" || (employeesList.length > 0 && employeesList.every(c => terminalStatuses.includes(c.status)));
  const contractorsAllResolved = activeMainTab === "payroll" || activeMainTab === "priorities" || (contractorsList.length > 0 && contractorsList.every(c => terminalStatuses.includes(c.status)));

  // Check for new company from onboarding
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
  
  // Merge contractors from store into the current company when moved=true
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
    
    if (companyId === ALL_CLIENTS_ID) {
      toast({ title: "All Clients", description: "Showing workers across all companies" });
    } else {
      const company = companies.find(c => c.id === companyId);
      toast({
        title: "Company Switched",
        description: `Now viewing contracts for ${company?.name}`,
      });
    }
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
      policies: companyData?.policies,
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
            policies: companyData?.policies ?? company.policies,
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
        response = `📈 Onboarding Progress\n\n👤 Maria Santos - 75% Complete\n✅ Personal details submitted\n✅ Tax forms completed\n✅ Bank information verified\n⏳ Compliance documents pending\n⏳ Emergency contact needed\nEstimated completion: 2 days`;
        
        addMessage({
          role: 'kurt',
          text: response,
          actionButtons: [
            { label: 'Send Reminder to Maria', action: 'send-reminder-maria', variant: 'default' },
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
            text: "Got it — who should I resend this to?",
            actionButtons: [
              { label: 'Resend to All', action: 'resend-all', variant: 'default' },
              { label: 'Select Individual', action: 'resend-individual', variant: 'outline' },
            ]
          });
        }, 1500);
        return;
        
      case 'resend-all':
        addMessage({ role: 'user', text: 'Resend to all candidates' });
        setLoading(true);
        
        setTimeout(() => {
          setLoading(false);
          addMessage({
            role: 'kurt',
            text: "All set! ✅\n\nOnboarding links resent to all candidates.",
          });
          toast({ title: "Links Sent", description: "Onboarding links have been resent successfully." });
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
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 250);
          
          addMessage({
            role: 'kurt',
            text: "Done ✅ Everything's up to date.\n\nOnboarding is now marked as complete. All systems synced successfully!",
          });
        }, 1800);
        return;
        
      case 'create-payroll-batch': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const r = executePayrollGenieAction('create_payroll_batch', navigate);
        addMessage({ role: 'kurt', text: r });
        setLoading(false);
        return;
      }
      case 'simulate-fx': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const r = executePayrollGenieAction('simulate_fx', navigate);
        addMessage({ role: 'kurt', text: r });
        setLoading(false);
        return;
      }
      case 'send-approval': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const r = executePayrollGenieAction('send_for_approval', navigate);
        addMessage({ role: 'kurt', text: r });
        setLoading(false);
        return;
      }
      case 'execute-payroll': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const r = executePayrollGenieAction('execute_batch', navigate);
        addMessage({ role: 'kurt', text: r });
        setLoading(false);
        return;
      }
      case 'reconcile': {
        const { executePayrollGenieAction } = await import('@/lib/payroll-genie-actions');
        const r = executePayrollGenieAction('reconcile', navigate);
        addMessage({ role: 'kurt', text: r });
        setLoading(false);
        return;
      }
      case 'add-documents':
        response = `📄 Add Documents\n\nI can help you add additional documents to the contract bundle.`;
        break;
      case 'review-bundle':
        response = `✅ Bundle Review Complete\n\nI've reviewed all documents in the bundle:\n\n✓ All required documents included\n✓ Signature fields properly placed\n\nThe bundle is ready to send for signing!`;
        break;
      case 'check-compliance':
        response = `🔍 Compliance Check Complete\n\nI've verified compliance for all documents:\n\n✓ Employment Agreement - compliant\n✓ Country Compliance Attachments - all mandatory clauses included\n✓ NDA/Policy Docs - verified\n\nAll documents meet regulatory requirements.`;
        break;
      default:
        response = `I'll help you with "${action}". Let me process that for you.`;
    }

    if (action.startsWith('send-reminder-')) {
      const name = action.replace('send-reminder-', '').replace('-', ' ');
      const capitalizedName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      addMessage({
        role: 'kurt',
        text: `📧 Reminder Sent\n\nOnboarding reminder has been emailed to ${capitalizedName}.`,
      });
      setLoading(false);
      return;
    }

    addMessage({ role: 'kurt', text: response });
    setLoading(false);
  };

  const idleMessage = version === "v5" 
    ? "I've prepared contract drafts for all three candidates based on your requirements."
    : "Hey Joe, looks like three shortlisted candidates are ready for contract drafting. Would you like me to prepare their drafts?";
  const idleWords = idleMessage.split(' ');

  const mockPrompt = "Generate contracts for Maria Santos, Oskar Nilsen, and Arta Krasniqi";
  
  useEffect(() => {
    (window as any).handleKurtAction = handleKurtAction;
    return () => { delete (window as any).handleKurtAction; };
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
      if (allSignedParam) uniquePhaseKey = `${phaseKey}-all-signed`;
      else if (movedParam) uniquePhaseKey = `${phaseKey}-moved`;
    }
    
    if (!hasSpokenPhase[uniquePhaseKey]) {
      setHasSpokenPhase(prev => ({ ...prev, [uniquePhaseKey]: true }));
    }
  }, [contractFlow.phase, hasSpokenPhase, contractFlow.currentDraftIndex, contractFlow.selectedCandidates, searchParams]);

  useEffect(() => {
    if (currentWordIndex < idleWords.length) {
      const timer = setTimeout(() => setCurrentWordIndex(prev => prev + 1), 150);
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
      const ctrs = companyContractors[companyId] || [];

      const candidatesForDrafting = ctrs
        .filter((c: any) => ids.includes(c.id))
        .map((c: any) => ({
          id: c.id, name: c.name, role: c.role, country: c.country,
          countryCode: c.countryCode || ({ Singapore: "SG", Spain: "ES", Norway: "NO", Philippines: "PH", Ireland: "IE", India: "IN" }[c.country] || "US"),
          flag: c.countryFlag || c.flag || "", salary: c.salary || "", startDate: c.startDate || "",
          noticePeriod: c.noticePeriod || "30 days", pto: c.pto || "15 days/year",
          currency: c.currency || "USD", signingPortal: c.signingPortal || "DocuSign",
          status: "Hired" as const, email: c.email, employmentType: c.employmentType,
          nationality: c.nationality, city: c.city, address: c.address, idNumber: c.idNumber,
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
          contractFlow.proceedToDrafting();
        }
      }
    }

    if (signedParam === "true") {
      setShowContractSignedMessage(true);
    }
  }, [
    searchParams, navigate, companies, selectedCompany, companyContractors,
    contractFlow.phase, contractFlow.proceedToDrafting, contractFlow.setCandidatesForDrafting,
  ]);

  // Determine the effective company for pipeline (use first company when in All Clients mode for contract actions)
  const effectiveCompanyForActions = isAllClientsMode ? companies[0]?.id || "company-default" : selectedCompany;

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex flex-col w-full v7-glass-bg">
      {/* Floating orb */}
      <div className="v7-orb-center" />

      {/* Topbar — always visible; CSS makes bg transparent at rest, frosted on scroll */}
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
          forceFixed
          isKurtPanelOpen={isKurtPanelOpen}
          onKurtPanelClose={() => setIsKurtPanelOpen(false)}
        />
      )}

      {/* Logo and Close Button for Add New Company */}
      {isAddingNewCompany && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${headerScrolled ? 'bg-background/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_hsl(var(--border)/0.15)]' : ''}`}>
          <img src={frontedLogo} alt="Fronted" className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCancelAddCompany} />
          <Button variant="ghost" size="icon" onClick={handleCancelAddCompany} className="h-8 w-8 sm:h-10 sm:w-10">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      {/* Logo and Close Button for Edit Company */}
      {isEditingCompany && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${headerScrolled ? 'bg-background/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_hsl(var(--border)/0.15)]' : ''}`}>
          <img src={frontedLogo} alt="Fronted" className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={handleCancelEditCompany} />
          <Button variant="ghost" size="icon" onClick={handleCancelEditCompany} className="h-8 w-8 sm:h-10 sm:w-10">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      {/* Logo and Close Button for contract steps */}
      {!isAddingNewCompany && !isEditingCompany &&
        contractFlow.phase !== "idle" &&
        contractFlow.phase !== "offer-accepted" &&
        contractFlow.phase !== "data-collection" && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${headerScrolled ? 'bg-background/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_hsl(var(--border)/0.15)]' : ''}`}>
          <img src={frontedLogo} alt="Fronted" className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { contractFlow.resetFlow(); navigate(FLOW_BASE_PATH); }} />
          <Button variant="ghost" size="icon" onClick={() => { contractFlow.resetFlow(); navigate(FLOW_BASE_PATH); }} className="h-8 w-8 sm:h-10 sm:w-10">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex min-w-0 relative pt-0">
        {/* Dashboard Drawer */}
        <DashboardDrawer isOpen={isDrawerOpen} userData={userData} />

          {/* Contract Flow Main Area with Agent Layout */}
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
                      initialPolicyData={editingCompany?.policies}
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
                            <input type="text" value={promptText} readOnly placeholder="Type your request..." className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground" />
                            {promptText.length === mockPrompt.length && (
                              <Button onClick={() => contractFlow.startPromptFlow()} className="whitespace-nowrap">Generate</Button>
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
                  <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
                    <div className="flex flex-col items-center text-center space-y-6">
                      <AgentHeader title="Start by adding a company" subtitle="Once a company is set up, you'll be able to manage candidates, contracts, and payroll from here." showPulse={true} isActive={false} showInput={false} />
                      <Button onClick={() => setIsAddingNewCompany(true)} size="lg">Add company</Button>
                    </div>
                  </motion.div>
                ) : (contractFlow.phase === "offer-accepted" || contractFlow.phase === "data-collection") ? (
                  <motion.div key="data-collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32 space-y-2">
                      {/* Agent Header */}
                      {showContractSignedMessage ? (
                        <ContractSignedMessage 
                          mode="signed"
                          onReadingComplete={() => {
                            setTimeout(() => setShowContractSignedMessage(false), 2000);
                          }}
                        />
                      ) : (
                        /* ═══════════════════════════════════════════════════════
                         *  VISIONARY HEADER — Company selector + stat pills
                         * ═══════════════════════════════════════════════════════ */
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          transition={{ duration: 0.6 }}
                          className="flex flex-col items-center px-4 pt-2 pb-2"
                        >
                          {/* Audio visualizer with floating glow */}
                          <motion.div 
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="relative flex justify-center mb-5"
                          >
                            <div className="absolute inset-0 -m-6 rounded-full v7-header-glow pointer-events-none" />
                            <div className="relative scale-75 sm:scale-100">
                              <AudioWaveVisualizer isActive={isAgentSpeaking || (
                                searchParams.get("allSigned") === "true"
                                  ? !hasSpokenPhase["data-collection-all-signed"]
                                  : searchParams.get("moved") === "true" 
                                    ? !hasSpokenPhase["data-collection-moved"]
                                    : !hasSpokenPhase["offer-accepted"]
                              )} isListening={false} />
                            </div>
                          </motion.div>

                          {/* Premium heading with interactive company selector */}
                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center"
                          >
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="group/selector inline-flex items-center gap-2 text-2xl sm:text-3xl font-bold cursor-pointer transition-all duration-300 hover:gap-3">
                                    <span className="v7-heading-gradient">
                                      {isAllClientsMode ? "All Clients" : companies.find(c => c.id === selectedCompany)?.name || "Company"}
                                    </span>
                                    <motion.span 
                                      className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 group-hover/selector:bg-primary/20 transition-colors duration-300"
                                      whileHover={{ rotate: 180 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <ChevronDown className="h-4 w-4 text-primary" />
                                    </motion.span>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[260px] p-0 v7-glass-card border-primary/10" align="center" style={{ boxShadow: '0 16px 48px -12px hsl(172 50% 40% / 0.15)' }}>
                                  <Command>
                                    <CommandInput placeholder="Search clients..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        <div className="flex flex-col items-center gap-3 py-4 px-3">
                                          <div className="text-center space-y-0.5">
                                            <p className="text-sm font-medium text-foreground">No matching client</p>
                                            <p className="text-[11px] text-muted-foreground">Can't find who you're looking for?</p>
                                          </div>
                                          <button
                                            onClick={() => handleCompanyChange("add-new")}
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                                          >
                                            <Plus className="h-3 w-3" />
                                            Add new client
                                          </button>
                                        </div>
                                      </CommandEmpty>
                                      <CommandGroup>
                                        <CommandItem
                                          value="All clients"
                                          onSelect={() => handleCompanyChange(ALL_CLIENTS_ID)}
                                          className="cursor-pointer"
                                        >
                                          <Check className={cn("mr-2 h-4 w-4", isAllClientsMode ? "opacity-100" : "opacity-0")} />
                                          All clients
                                        </CommandItem>
                                      </CommandGroup>
                                      <CommandSeparator />
                                      <CommandGroup>
                                        {companies.map((company) => (
                                          <CommandItem
                                            key={company.id}
                                            value={company.name}
                                            onSelect={() => handleCompanyChange(company.id)}
                                            className="cursor-pointer group/company"
                                          >
                                            <Check className={cn("mr-2 h-4 w-4", selectedCompany === company.id ? "opacity-100" : "opacity-0")} />
                                            <span className="flex-1">{company.name}</span>
                                            <button
                                              className="opacity-0 group-hover/company:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCompany(company.id);
                                              }}
                                            >
                                              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                            </button>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                      <CommandSeparator />
                                      <CommandGroup>
                                        <CommandItem
                                          value="add-new-client"
                                          onSelect={() => handleCompanyChange("add-new")}
                                          className="cursor-pointer text-primary"
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add new client
                                        </CommandItem>
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>

                              {/* Inline stat pills */}
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={isAllClientsMode ? "all" : selectedCompany}
                                  initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                                  transition={{ duration: 0.3 }}
                                  className="flex items-center gap-2"
                                >
                                  {isAllClientsMode && (
                                    <span className="v7-stat-pill">
                                      {companies.length} clients
                                    </span>
                                  )}
                                    {employeeCount > 0 && (
                                      <span className="v7-stat-pill">
                                        {employeeCount} {employeeCount === 1 ? "employee" : "employees"}
                                      </span>
                                    )}
                                    {contractorCount > 0 && (
                                      <span className="v7-stat-pill">
                                        {contractorCount} {contractorCount === 1 ? "contractor" : "contractors"}
                                      </span>
                                    )}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Priorities | Tracker | Payroll Navigation */}
                      <div className="flex items-center justify-center py-2">
                        <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as "priorities" | "tracker" | "payroll")}>
                          <TabsList className="v7-glass-tabs inline-flex items-center gap-1 p-1">
                            <TabsTrigger 
                              value="priorities" 
                              className={cn(
                                "data-[state=active]:v7-glass-tab-active px-5 font-semibold",
                                activeMainTab === "priorities" && "shadow-sm"
                              )}
                            >
                              Priorities
                            </TabsTrigger>
                            <span className="h-4 w-px bg-border/30 mx-0.5" />
                            <TabsTrigger 
                              value="tracker" 
                              className={cn(
                                "data-[state=active]:v7-glass-tab-active text-muted-foreground/70 text-[13px]",
                                activeMainTab !== "tracker" && "hover:text-muted-foreground"
                              )}
                            >
                              Tracker
                            </TabsTrigger>
                            <TabsTrigger 
                              value="payroll" 
                              className={cn(
                                "data-[state=active]:v7-glass-tab-active text-muted-foreground/70 text-[13px]",
                                activeMainTab !== "payroll" && "hover:text-muted-foreground"
                              )}
                            >
                              Payroll
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Conditional Content */}
                      <div className="pt-2 relative">
                        
                        <AnimatePresence mode="wait">
                          {activeMainTab === "priorities" ? (
                            <motion.div key="priorities" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                              <F1v7_PrioritiesTab onActionClick={handlePriorityActionClick} completedActionIds={completedPriorityActions} />
                            </motion.div>
                          ) : activeMainTab === "payroll" ? (
                            <motion.div key="payroll" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                              <F1v4_PayrollTab isAllClients={isAllClientsMode} selectedCompanyId={selectedCompany} highlightedWorkerId={kurtHighlightedWorker} kurtAutoApproveWorkerId={kurtAutoApproveWorkerId} onKurtApprovalComplete={handleKurtApprovalComplete} />
                            </motion.div>
                          ) : (
                            <motion.div key="tracker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                              <div className="space-y-2">
                                <div className="mt-1">
                                  <F1v4_PipelineView 
                                    key={isAllClientsMode ? "all-clients" : selectedCompany}
                                    contractors={isAllClientsMode ? allClientsContractors : (companyContractors[selectedCompany] || [])}
                                    onAddCandidate={handleAddCandidate}
                                    onRemoveContractor={(contractorId) => {
                                      if (isAllClientsMode) {
                                        for (const [companyId, ctrs] of Object.entries(companyContractors)) {
                                          if ((ctrs || []).some(c => c.id === contractorId)) {
                                            setCompanyContractors(prev => ({
                                              ...prev,
                                              [companyId]: (prev[companyId] || []).filter(c => c.id !== contractorId)
                                            }));
                                            break;
                                          }
                                        }
                                      } else {
                                        setCompanyContractors(prev => ({
                                          ...prev,
                                          [selectedCompany]: (prev[selectedCompany] || []).filter(c => c.id !== contractorId)
                                        }));
                                      }
                                      sonnerToast.success("Candidate removed");
                                    }}
                                    onDraftContract={(ids) => {
                                      const params = new URLSearchParams({ 
                                        ids: ids.join(','),
                                        returnTo: 'f1v7',
                                        company: effectiveCompanyForActions
                                      }).toString();
                                      navigate(`/flows/contract-creation?${params}`);
                                    }}
                                    onSignatureComplete={() => {
                                      navigate(`${FLOW_BASE_PATH}?phase=data-collection&allSigned=true`);
                                    }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                        <AgentHeader title="Contract Bundle" subtitle="Review the contract bundle each candidate will receive before sending for signature." showPulse={true} isActive={isAgentSpeaking || !hasSpokenPhase["bundle-creation"]} showInput={false} />
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
                        <DocumentBundleCarousel candidate={candidate} onGenerateBundle={() => {}} hideButton={true} onClose={() => navigate(FLOW_BASE_PATH)} />
                      </div>
                    ))}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4">
                      <Button onClick={() => { toast({ title: "Signing packs generated for all candidates" }); contractFlow.proceedFromBundle(); }} size="lg" className="w-full">
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
                          const isLast = contractFlow.currentDraftIndex >= contractFlow.selectedCandidates.length - 1;
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
                            const params = new URLSearchParams({ ids: candidateIds, returnTo: 'f1v7', ...(company && { company }) }).toString();
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
                        const ctrs = companyContractors[effectiveCompanyForActions] || [];
                        const countryCodeMap: Record<string, string> = { Singapore: "SG", Spain: "ES", Norway: "NO", Philippines: "PH", Ireland: "IE", India: "IN" };
                        const currencyMap: Record<string, string> = { Singapore: "SGD", Spain: "EUR", Norway: "NOK", Philippines: "PHP", Ireland: "EUR", India: "INR" };
                        return ctrs
                          .filter((c: any) => candidateIds.includes(c.id))
                          .map((c: any) => ({
                            id: c.id, name: c.name, role: c.role, country: c.country,
                            countryCode: c.countryCode || countryCodeMap[c.country] || "US",
                            flag: c.countryFlag || c.flag || "", salary: c.salary || "", startDate: c.startDate || "",
                            noticePeriod: c.noticePeriod || "30 days", pto: c.pto || "15 days/year",
                            currency: c.currency || currencyMap[c.country] || "USD", signingPortal: c.signingPortal || "DocuSign",
                            status: "Hired" as const, email: c.email, employmentType: c.employmentType, nationality: c.nationality,
                          }));
                      })()}
                      onBack={() => { setCameFromReview(true); contractFlow.backToDrafting(); }}
                      onStartSigning={() => { 
                        const candidateIds = contractFlow.selectedCandidates.map(c => c.id);
                        setCompanyContractors(prev => ({
                          ...prev,
                          [effectiveCompanyForActions]: (prev[effectiveCompanyForActions] || []).map(c =>
                            candidateIds.includes(c.id) ? { ...c, status: "awaiting-signature" } : c
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
                    onSendBundle={() => contractFlow.startSigning()}
                    onClose={() => { contractFlow.proceedToDataCollection(); navigate(`${FLOW_BASE_PATH}?phase=data-collection`); }}
                  />
                </motion.div>
              ) : contractFlow.phase === "signing" ? (
                <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <ContractSignaturePhase candidates={contractFlow.selectedCandidates} onComplete={() => contractFlow.completeFlow()} />
                </motion.div>
              ) : contractFlow.phase === "complete" ? (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-full p-8">
                  <div className="w-full max-w-3xl space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                      <ContractFlowSummary candidates={contractFlow.selectedCandidates} />
                    </motion.div>
                  </div>
                </motion.div>
              ) : null}
              </AnimatePresence>
              )}
              </div>
            </div>
          </AgentLayout>
          
          {/* Kurt AI Panel — slides in from right */}
          <F1v7_KurtPanel
            isOpen={isKurtPanelOpen}
            onClose={() => setIsKurtPanelOpen(false)}
            messages={kurtMessages}
            onAddMessage={handleKurtAddMessage}
            isLoading={kurtLoading}
            onActionResponse={handleKurtActionResponse}
            orchestrationWorkers={kurtOrchestrationWorkers}
            activeActionId={kurtActiveAction}
          />
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
