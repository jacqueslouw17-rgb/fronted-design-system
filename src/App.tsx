import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedbackBubble } from "@/components/FeedbackBubble";
import DesignSystem from "./pages/DesignSystem";
import Onboarding from "./pages/Onboarding";
import DashboardAdmin from "./pages/flows/DashboardAdmin";
import Auth from "./pages/Auth";
import ProfileSettings from "./pages/ProfileSettings";
import { RoleLensProvider } from "@/contexts/RoleLensContext";

// Flows
import Flows from "./pages/Flows";
import AdminOnboarding from "./pages/flows/AdminOnboarding";
import ContractFlowDemo from "./pages/ContractFlowDemo";
import ContractCreation from "./pages/ContractCreation";
import CandidateOnboarding from "./pages/CandidateOnboarding";
import CandidateOnboardingFlow from "./pages/CandidateOnboardingFlow";
import WorkerOnboarding from "./pages/flows/WorkerOnboarding";
import CandidateDashboard from "./pages/flows/CandidateDashboard";
import EmployeePayroll from "./pages/flows/EmployeePayroll";
import ContractorPayroll from "./pages/flows/ContractorPayroll";
import CandidateProfileSettings from "./pages/CandidateProfileSettings";
import AdminProfileSettings from "./pages/AdminProfileSettings";
import StepCardPattern from "./pages/StepCardPattern";
import ContextualDrawerPattern from "./pages/ContextualDrawerPattern";
import HoverToolbarPattern from "./pages/HoverToolbarPattern";
import SmartTagsPattern from "./pages/SmartTagsPattern";
import PolicyTagChipsPattern from "./pages/PolicyTagChipsPattern";
import NarratedInsightPattern from "./pages/NarratedInsightPattern";
import AuditTrailPattern from "./pages/AuditTrailPattern";
import ConfirmationModalPattern from "./pages/ConfirmationModalPattern";
import DualModePattern from "./pages/DualModePattern";
import QuickLinksHoverBar from "./pages/QuickLinksHoverBar";
import DataSummaryCards from "./pages/DataSummaryCards";
import ComplianceChecklistPattern from "./pages/ComplianceChecklistPattern";
import VoiceTypeTogglePattern from "./pages/VoiceTypeTogglePattern";
import NotificationCenterPattern from "./pages/NotificationCenterPattern";
import AdaptiveWidgetGridPattern from "./pages/AdaptiveWidgetGrid";
import ContractPreviewPattern from "./pages/ContractPreviewPattern";
import FXBreakdownPopoverPattern from "./pages/FXBreakdownPopoverPattern";
import EmptyStatePlaceholderPattern from "./pages/EmptyStatePlaceholderPattern";
import AgentConfirmationCardPattern from "./pages/AgentConfirmationCardPattern";
import SmartSuggestionChipsPattern from "./pages/SmartSuggestionChipsPattern";
import AgentMemoryThreadPattern from "./pages/AgentMemoryThreadPattern";
import AgentConfirmationQueuePattern from "./pages/AgentConfirmationQueuePattern";
import AgentContextualTimelinePattern from "./pages/AgentContextualTimelinePattern";
import SmartProgressPattern from "./pages/SmartProgressPattern";
import AgentContextPivotPattern from "./pages/AgentContextPivotPattern";
import AgentSmartRecapPattern from "./pages/AgentSmartRecapPattern";
import AgentReactionCardsPattern from "./pages/AgentReactionCardsPattern";
import TrustIndexGaugePattern from "./pages/TrustIndexGaugePattern";
import DynamicRoleLensPattern from "./pages/DynamicRoleLensPattern";
import AgentActionConfirmationsPattern from "./pages/AgentActionConfirmationsPattern";
import AgentContextTrackerPattern from "./pages/AgentContextTrackerPattern";
import AgentTaskTimelinePattern from "./pages/AgentTaskTimelinePattern";
import AgentInsightCarouselPattern from "./pages/AgentInsightCarouselPattern";
import AgentTrustGaugePattern from "./pages/AgentTrustGaugePattern";
import AgentSmartConfirmationPattern from "./pages/AgentSmartConfirmationPattern";
import AgentDualPathSuggestionPattern from "./pages/AgentDualPathSuggestionPattern";
import AgentPredictiveHintBarPattern from "./pages/AgentPredictiveHintBarPattern";
import AgentMultiStepRecallThreadPattern from "./pages/AgentMultiStepRecallThreadPattern";
import ComplianceSyncDrawerPattern from "./pages/ComplianceSyncDrawerPattern";
import CostTaxVisualizerPattern from "./pages/CostTaxVisualizerPattern";
import ContextualInlineActionsPattern from "./pages/ContextualInlineActionsPattern";
import OnboardingFlowPattern from "./pages/OnboardingFlowPattern";
import PayrollUseCaseDemo from "./pages/PayrollUseCaseDemo";
import PayrollBatch from "./pages/PayrollBatch";
import PayrollBatchCurrent from "./pages/PayrollBatchCurrent";
import CandidateDataCollection from "./pages/CandidateDataCollection";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleLensProvider initialRole="admin">
          <FeedbackBubble />
          <Routes>
        <Route path="/" element={<DesignSystem />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
        {/* Flows Routes */}
        <Route path="/flows" element={<Flows />} />
        <Route path="/flows/admin/onboarding" element={<AdminOnboarding />} />
        <Route path="/flows/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/flows/contract-flow" element={<ContractFlowDemo />} />
        <Route path="/flows/contract-creation" element={<ContractCreation />} />
        <Route path="/flows/candidate-onboarding" element={<CandidateOnboarding />} />
        <Route path="/candidate-onboarding/:candidateId?" element={<CandidateOnboardingFlow />} />
        <Route path="/flows/worker-onboarding" element={<WorkerOnboarding />} />
        <Route path="/flows/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/flows/employee-payroll" element={<EmployeePayroll />} />
        <Route path="/flows/contractor-payroll" element={<ContractorPayroll />} />
        <Route path="/candidate/profile-settings" element={<CandidateProfileSettings />} />
        <Route path="/admin/profile-settings" element={<AdminProfileSettings />} />
          <Route path="/step-card-pattern" element={<StepCardPattern />} />
          <Route path="/contextual-drawer" element={<ContextualDrawerPattern />} />
          <Route path="/hover-toolbar" element={<HoverToolbarPattern />} />
          <Route path="/smart-tags" element={<SmartTagsPattern />} />
          <Route path="/policy-tags" element={<PolicyTagChipsPattern />} />
          <Route path="/narrated-insight" element={<NarratedInsightPattern />} />
          <Route path="/audit-trail" element={<AuditTrailPattern />} />
        <Route path="/confirmation-modal" element={<ConfirmationModalPattern />} />
        <Route path="/dual-mode" element={<DualModePattern />} />
        <Route path="/quick-links" element={<QuickLinksHoverBar />} />
        <Route path="/data-summary" element={<DataSummaryCards />} />
        <Route path="/compliance-checklist" element={<ComplianceChecklistPattern />} />
        <Route path="/voice-type-toggle" element={<VoiceTypeTogglePattern />} />
        <Route path="/notification-center" element={<NotificationCenterPattern />} />
        <Route path="/adaptive-widget-grid" element={<AdaptiveWidgetGridPattern />} />
        <Route path="/contract-preview" element={<ContractPreviewPattern />} />
        <Route path="/fx-breakdown" element={<FXBreakdownPopoverPattern />} />
        <Route path="/empty-state" element={<EmptyStatePlaceholderPattern />} />
        <Route path="/agent-confirmation" element={<AgentConfirmationCardPattern />} />
        <Route path="/smart-suggestion-chips" element={<SmartSuggestionChipsPattern />} />
        <Route path="/agent-memory-thread" element={<AgentMemoryThreadPattern />} />
        <Route path="/agent-confirmation-queue" element={<AgentConfirmationQueuePattern />} />
        <Route path="/agent-contextual-timeline" element={<AgentContextualTimelinePattern />} />
        <Route path="/smart-progress" element={<SmartProgressPattern />} />
        <Route path="/agent-context-pivot" element={<AgentContextPivotPattern />} />
        <Route path="/agent-smart-recap" element={<AgentSmartRecapPattern />} />
        <Route path="/agent-reaction-cards" element={<AgentReactionCardsPattern />} />
        <Route path="/trust-index-gauge" element={<TrustIndexGaugePattern />} />
        <Route path="/dynamic-role-lens" element={<DynamicRoleLensPattern />} />
        <Route path="/agent-action-confirmations" element={<AgentActionConfirmationsPattern />} />
        <Route path="/agent-context-tracker" element={<AgentContextTrackerPattern />} />
        <Route path="/agent-task-timeline" element={<AgentTaskTimelinePattern />} />
        <Route path="/agent-insight-carousel" element={<AgentInsightCarouselPattern />} />
        <Route path="/agent-trust-gauge" element={<AgentTrustGaugePattern />} />
        <Route path="/agent-smart-confirmation" element={<AgentSmartConfirmationPattern />} />
        <Route path="/agent-dual-path-suggestion" element={<AgentDualPathSuggestionPattern />} />
        <Route path="/agent-predictive-hint-bar" element={<AgentPredictiveHintBarPattern />} />
        <Route path="/agent-multi-step-recall" element={<AgentMultiStepRecallThreadPattern />} />
        <Route path="/compliance-sync-drawer" element={<ComplianceSyncDrawerPattern />} />
        <Route path="/patterns/cost-tax-visualizer" element={<CostTaxVisualizerPattern />} />
        <Route path="/patterns/contextual-inline-actions" element={<ContextualInlineActionsPattern />} />
        <Route path="/patterns/onboarding-flow" element={<OnboardingFlowPattern />} />
        <Route path="/payroll-demo" element={<PayrollUseCaseDemo />} />
        <Route path="/payroll/batch" element={<PayrollBatch />} />
        <Route path="/payroll-batch" element={<PayrollBatch />} />
        <Route path="/payroll/batch/current" element={<PayrollBatchCurrent />} />
        <Route path="/candidate-data-collection" element={<CandidateDataCollection />} />
        <Route path="/flows/candidate-data-collection" element={<CandidateDataCollection />} />
        
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </RoleLensProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
