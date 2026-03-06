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
import { ArrowLeft, X, FileCheck, ChevronDown, Check } from "lucide-react";
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

interface CompanyData {
  id: string;
  name: string;
}

const MOCK_COMPANIES: CompanyData[] = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Beta Industries" },
  { id: "3", name: "Gamma Solutions" },
  { id: "4", name: "Delta Enterprises" },
  { id: "5", name: "Epsilon Technologies" },
];

const candidate1 = {
  id: "candidate-1",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice.smith@example.com",
  companyId: "1",
  status: "pending",
  hourlyRate: 60,
  country: "USA",
  jobTitle: "Software Engineer",
  department: "Engineering",
  manager: "Bob Johnson",
  startDate: "2024-07-01",
};

const candidate2 = {
  id: "candidate-2",
  firstName: "Bob",
  lastName: "Johnson",
  email: "bob.johnson@example.com",
  companyId: "2",
  status: "active",
  hourlyRate: 75,
  country: "Canada",
  jobTitle: "Project Manager",
  department: "Management",
  manager: "Charlie Brown",
  startDate: "2024-06-15",
};

const candidate3 = {
  id: "candidate-3",
  firstName: "Charlie",
  lastName: "Brown",
  email: "charlie.brown@example.com",
  companyId: "1",
  status: "offer",
  hourlyRate: 55,
  country: "UK",
  jobTitle: "Data Analyst",
  department: "Analytics",
  manager: "Alice Smith",
  startDate: "2024-08-01",
};

const candidate4 = {
  id: "candidate-4",
  firstName: "Diana",
  lastName: "Miller",
  email: "diana.miller@example.com",
  companyId: "3",
  status: "rejected",
  hourlyRate: 80,
  country: "Australia",
  jobTitle: "UX Designer",
  department: "Design",
  manager: "Eve White",
  startDate: "2024-07-15",
};

const candidate5 = {
  id: "candidate-5",
  firstName: "Eve",
  lastName: "White",
  email: "eve.white@example.com",
  companyId: "2",
  status: "pending",
  hourlyRate: 70,
  country: "Germany",
  jobTitle: "Product Manager",
  department: "Product",
  manager: "Bob Johnson",
  startDate: "2024-09-01",
};

const candidate6 = {
  id: "candidate-6",
  firstName: "Frank",
  lastName: "Green",
  email: "frank.green@example.com",
  companyId: "4",
  status: "active",
  hourlyRate: 65,
  country: "France",
  jobTitle: "Marketing Specialist",
  department: "Marketing",
  manager: "Grace Black",
  startDate: "2024-08-15",
};

const candidate7 = {
  id: "candidate-7",
  firstName: "Grace",
  lastName: "Black",
  email: "grace.black@example.com",
  companyId: "3",
  status: "offer",
  hourlyRate: 50,
  country: "Spain",
  jobTitle: "Sales Representative",
  department: "Sales",
  manager: "Diana Miller",
  startDate: "2024-10-01",
};

const candidate8 = {
  id: "candidate-8",
  firstName: "Harry",
  lastName: "Taylor",
  email: "harry.taylor@example.com",
  companyId: "5",
  status: "rejected",
  hourlyRate: 90,
  country: "Italy",
  jobTitle: "Financial Analyst",
  department: "Finance",
  manager: "Ivy Brown",
  startDate: "2024-09-15",
};

const candidate9 = {
  id: "candidate-9",
  firstName: "Ivy",
  lastName: "Brown",
  email: "ivy.brown@example.com",
  companyId: "4",
  status: "pending",
  hourlyRate: 58,
  country: "Japan",
  jobTitle: "HR Manager",
  department: "Human Resources",
  manager: "Frank Green",
  startDate: "2024-11-01",
};

const candidate10 = {
  id: "candidate-10",
  firstName: "Jack",
  lastName: "White",
  email: "jack.white@example.com",
  companyId: "5",
  status: "active",
  hourlyRate: 72,
  country: "China",
  jobTitle: "Operations Manager",
  department: "Operations",
  manager: "Harry Taylor",
  startDate: "2024-10-15",
};

const MOCK_CANDIDATES = [
  candidate1,
  candidate2,
  candidate3,
  candidate4,
  candidate5,
  candidate6,
  candidate7,
  candidate8,
  candidate9,
  candidate10,
];

const FLOW_BASE_PATH = "/flows/f1/v7";

const F1v7_FrontedAdminDashboard = () => {
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAddCandidateDrawerOpen, setIsAddCandidateDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [isKurtChatOpen, setIsKurtChatOpen] = useState(false);
  const [kurtMessage, setKurtMessage] = useState(generateAskKurtMessage());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAgentHeaderActive, setIsAgentHeaderActive] = useState(false);
  const [isAgentHeaderHovered, setIsAgentHeaderHovered] = useState(false);
  const [isAgentLayoutActive, setIsAgentLayoutActive] = useState(false);
  const [isAgentLayoutHovered, setIsAgentLayoutHovered] = useState(false);
  const [isTopbarActive, setIsTopbarActive] = useState(false);
  const [isTopbarHovered, setIsTopbarHovered] = useState(false);
  const [isDashboardDrawerActive, setIsDashboardDrawerActive] = useState(false);
  const [isDashboardDrawerHovered, setIsDashboardDrawerHovered] = useState(false);
  const [isContractFlowNotificationActive, setIsContractFlowNotificationActive] = useState(false);
  const [isContractFlowNotificationHovered, setIsContractFlowNotificationHovered] = useState(false);
  const [isCandidateConfirmationScreenActive, setIsCandidateConfirmationScreenActive] = useState(false);
  const [isCandidateConfirmationScreenHovered, setIsCandidateConfirmationScreenHovered] = useState(false);
  const [isDocumentBundleCarouselActive, setIsDocumentBundleCarouselActive] = useState(false);
  const [isDocumentBundleCarouselHovered, setIsDocumentBundleCarouselHovered] = useState(false);
  const [isContractDraftWorkspaceActive, setIsContractDraftWorkspaceActive] = useState(false);
  const [isContractDraftWorkspaceHovered, setIsContractDraftWorkspaceHovered] = useState(false);
  const [isContractReviewBoardActive, setIsContractReviewBoardActive] = useState(false);
  const [isContractReviewBoardHovered, setIsContractReviewBoardHovered] = useState(false);
  const [isContractSignaturePhaseActive, setIsContractSignaturePhaseActive] = useState(false);
  const [isContractSignaturePhaseHovered, setIsContractSignaturePhaseHovered] = useState(false);
  const [isContractFlowSummaryActive, setIsContractFlowSummaryActive] = useState(false);
  const [isContractFlowSummaryHovered, setIsContractFlowSummaryHovered] = useState(false);
  const [isComplianceTransitionNoteActive, setIsComplianceTransitionNoteActive] = useState(false);
  const [isComplianceTransitionNoteHovered, setIsComplianceTransitionNoteHovered] = useState(false);
  const [isContractCreationScreenActive, setIsContractCreationScreenActive] = useState(false);
  const [isContractCreationScreenHovered, setIsContractCreationScreenHovered] = useState(false);
  const [isDocumentBundleSignatureActive, setIsDocumentBundleSignatureActive] = useState(false);
  const [isDocumentBundleSignatureHovered, setIsDocumentBundleSignatureHovered] = useState(false);
  const [isContractSignedMessageActive, setIsContractSignedMessageActive] = useState(false);
  const [isContractSignedMessageHovered, setIsContractSignedMessageHovered] = useState(false);
  const [isAgentChatBoxActive, setIsAgentChatBoxActive] = useState(false);
  const [isAgentChatBoxHovered, setIsAgentChatBoxHovered] = useState(false);
  const [isKurtIntroTooltipActive, setIsKurtIntroTooltipActive] = useState(false);
  const [isKurtIntroTooltipHovered, setIsKurtIntroTooltipHovered] = useState(false);
  const [isAgentSuggestionChipsActive, setIsAgentSuggestionChipsActive] = useState(false);
  const [isAgentSuggestionChipsHovered, setIsAgentSuggestionChipsHovered] = useState(false);
  const [isKurtContextualTagsActive, setIsKurtContextualTagsActive] = useState(false);
  const [isKurtContextualTagsHovered, setIsKurtContextualTagsHovered] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { drawerOpen, toggleDrawer } = useDashboardDrawer();
  const { agentState, setAgentState } = useAgentState();
  const { selectedContractor, setSelectedContractor } = useContractorStore();
  const { batchState, setBatchState } = usePayrollBatch();
  const contractFlow = useContractFlow();

  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const onboardingParam = searchParams.get("onboarding");
    if (onboardingParam === "true") {
      setShowOnboarding(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (contractFlow.currentPhase === "signed") {
      setIsConfettiActive(true);
      const myConfetti = confetti.create(confettiRef.current as HTMLCanvasElement, {
        resize: true,
        useWorker: true,
      });
      myConfetti({
        particleCount: 200,
        spread: 200,
        origin: { y: 0.4 },
      });
      setTimeout(() => {
        setIsConfettiActive(false);
      }, 3000);
    }
  }, [contractFlow.currentPhase]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleAskKurt = () => {
    setKurtMessage(generateAskKurtMessage());
    setIsKurtChatOpen(true);
  };

  const handleAnyUpdates = () => {
    setKurtMessage(generateAnyUpdatesMessage());
    setIsKurtChatOpen(true);
  };

  return (
    <RoleLensProvider>
      <div className="relative h-full w-full overflow-hidden">
        {/* Confetti Canvas */}
        <canvas
          ref={confettiRef}
          className={cn("pointer-events-none fixed inset-0 z-[100] w-full h-full", !isConfettiActive && "hidden")}
        />

        {/* Onboarding Screen */}
        <AnimatePresence>{showOnboarding && <F1v4_EmbeddedAdminOnboarding onClose={() => setShowOnboarding(false)} />}</AnimatePresence>

        {/* Add Candidate Drawer */}
        <F1v4_AddCandidateDrawer open={isAddCandidateDrawerOpen} onClose={() => setIsAddCandidateDrawerOpen(false)} />

        {/* Dashboard Layout */}
        <div className="flex h-screen w-full antialiased text-foreground">
          {/* Sidebar */}
          <DashboardDrawer />

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Topbar */}
            <Topbar onMenuClick={toggleDrawer} />

            {/* Contract Flow Rendering */}
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="flex w-full flex-col">
                <ContractFlowNotification />

                <div className="flex flex-1 flex-col">
                  {contractFlow.currentPhase === "candidate-confirmation" && <CandidateConfirmationScreen />}
                  {contractFlow.currentPhase === "drafting" && <F1v5_ContractDraftWorkspace />}
                  {contractFlow.currentPhase === "review" && <ContractReviewBoard />}
                  {contractFlow.currentPhase === "signature" && <ContractSignaturePhase />}
                  {contractFlow.currentPhase === "summary" && <ContractFlowSummary />}
                  {contractFlow.currentPhase === "compliance-transition" && <ComplianceTransitionNote />}
                  {contractFlow.currentPhase === "creation" && <ContractCreationScreen />}
                  {contractFlow.currentPhase === "document-bundle-signature" && <DocumentBundleSignature />}
                  {contractFlow.currentPhase === "signed" && <ContractSignedMessage />}

                  {/* Tabs */}
                  <div className="mt-4">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                      <TabsList>
                        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "pipeline" && <F1v4_PipelineView onAddCandidateClick={() => setIsAddCandidateDrawerOpen(true)} />}
                  {activeTab === "payroll" && <F1v4_PayrollTab />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleLensProvider>
  );
};

export default F1v7_FrontedAdminDashboard;
