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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
