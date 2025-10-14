import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
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
import GenieConfirmationCardPattern from "./pages/GenieConfirmationCardPattern";
import SmartSuggestionChipsPattern from "./pages/SmartSuggestionChipsPattern";
import GenieMemoryThreadPattern from "./pages/GenieMemoryThreadPattern";
import GenieConfirmationQueuePattern from "./pages/GenieConfirmationQueuePattern";
import GenieContextualTimelinePattern from "./pages/GenieContextualTimelinePattern";
import SmartProgressPattern from "./pages/SmartProgressPattern";
import GenieContextPivotPattern from "./pages/GenieContextPivotPattern";
import GenieSmartRecapPattern from "./pages/GenieSmartRecapPattern";
import GenieReactionCardsPattern from "./pages/GenieReactionCardsPattern";
import TrustIndexGaugePattern from "./pages/TrustIndexGaugePattern";
import DynamicRoleLensPattern from "./pages/DynamicRoleLensPattern";
import GenieActionConfirmationsPattern from "./pages/GenieActionConfirmationsPattern";
import GenieContextTrackerPattern from "./pages/GenieContextTrackerPattern";
import GenieTaskTimelinePattern from "./pages/GenieTaskTimelinePattern";
import GenieInsightCarouselPattern from "./pages/GenieInsightCarouselPattern";
import GenieTrustGaugePattern from "./pages/GenieTrustGaugePattern";
import GenieSmartConfirmationPattern from "./pages/GenieSmartConfirmationPattern";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
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
        <Route path="/genie-confirmation" element={<GenieConfirmationCardPattern />} />
        <Route path="/smart-suggestion-chips" element={<SmartSuggestionChipsPattern />} />
        <Route path="/genie-memory-thread" element={<GenieMemoryThreadPattern />} />
        <Route path="/genie-confirmation-queue" element={<GenieConfirmationQueuePattern />} />
        <Route path="/genie-contextual-timeline" element={<GenieContextualTimelinePattern />} />
        <Route path="/smart-progress" element={<SmartProgressPattern />} />
        <Route path="/genie-context-pivot" element={<GenieContextPivotPattern />} />
        <Route path="/genie-smart-recap" element={<GenieSmartRecapPattern />} />
        <Route path="/genie-reaction-cards" element={<GenieReactionCardsPattern />} />
        <Route path="/trust-index-gauge" element={<TrustIndexGaugePattern />} />
        <Route path="/dynamic-role-lens" element={<DynamicRoleLensPattern />} />
        <Route path="/genie-action-confirmations" element={<GenieActionConfirmationsPattern />} />
        <Route path="/genie-context-tracker" element={<GenieContextTrackerPattern />} />
        <Route path="/genie-task-timeline" element={<GenieTaskTimelinePattern />} />
        <Route path="/genie-insight-carousel" element={<GenieInsightCarouselPattern />} />
        <Route path="/genie-trust-gauge" element={<GenieTrustGaugePattern />} />
        <Route path="/genie-smart-confirmation" element={<GenieSmartConfirmationPattern />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
