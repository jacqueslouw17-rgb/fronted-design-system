import { LucideIcon, Box, CreditCard, CheckSquare, MessageSquare, Clock, Smile, Shield, Eye, UserCheck, History, Timer, Presentation, Gauge, CheckCircle, GitBranch, Lightbulb, RotateCcw, Sparkles, Brain, ListTodo, ShieldCheck, Activity, RefreshCw, Bell, LayoutGrid, FileText, DollarSign, Inbox, ClipboardCheck, Mic, BarChart3, Link2, ToggleLeft, ScrollText, Tags, MousePointerClick, PanelRightOpen, ListChecks, LayoutDashboard, UserPlus, ArrowRight, Menu, ChevronRight, Play, Pause, X, ChevronDown, TrendingUp, AlertCircle } from "lucide-react";

export interface ComponentReference {
  id: string;
  name: string;
  description: string;
  category: "UI" | "Pattern" | "Genie" | "Dashboard";
  states: Array<{
    name: string;
    description: string;
  }>;
  props?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  usedInPatterns: string[];
  usedInModules: string[];
  icon: LucideIcon;
  filePath: string;
}

export const componentsRegistry: ComponentReference[] = [
  {
    id: "step-card",
    name: "StepCard",
    description: "Expandable card for multi-step workflows with progress tracking",
    category: "Pattern",
    states: [
      { name: "collapsed", description: "Minimized state showing only title and status" },
      { name: "expanded", description: "Full view with content and actions" },
      { name: "completed", description: "Checked state with success indicator" },
      { name: "active", description: "Current step being worked on" }
    ],
    props: [
      { name: "title", type: "string", description: "Step title" },
      { name: "status", type: "'pending' | 'active' | 'completed'", description: "Step status" },
      { name: "children", type: "ReactNode", description: "Step content" }
    ],
    usedInPatterns: ["onboarding", "step-card-pattern", "compliance-checklist"],
    usedInModules: ["Onboarding", "Compliance"],
    icon: ListChecks,
    filePath: "src/components/StepCard.tsx"
  },
  {
    id: "genie-confirmation-card",
    name: "GenieConfirmationCard",
    description: "Structured confirmation moment with visual checkpoints",
    category: "Genie",
    states: [
      { name: "default", description: "Initial review state" },
      { name: "confirming", description: "User reviewing details" },
      { name: "confirmed", description: "Action confirmed with success state" }
    ],
    usedInPatterns: ["genie-confirmation"],
    usedInModules: ["Contracts", "Payroll"],
    icon: ShieldCheck,
    filePath: "src/components/GenieConfirmationCard.tsx"
  },
  {
    id: "genie-dual-path-prompt",
    name: "GenieDualPathPrompt",
    description: "Choice between AI automation and manual control",
    category: "Genie",
    states: [
      { name: "initial", description: "Presenting both options" },
      { name: "ai-selected", description: "AI path chosen" },
      { name: "manual-selected", description: "Manual path chosen" }
    ],
    usedInPatterns: ["genie-dual-path-suggestion"],
    usedInModules: ["Onboarding", "Payroll", "Contracts"],
    icon: GitBranch,
    filePath: "src/components/GenieDualPathPrompt.tsx"
  },
  {
    id: "genie-predictive-hint-bar",
    name: "GeniePredictiveHintBar",
    description: "Contextual next-action suggestions based on system state",
    category: "Genie",
    states: [
      { name: "visible", description: "Showing suggested actions" },
      { name: "dismissed", description: "Hidden by user" },
      { name: "urgent", description: "With priority badge for time-sensitive actions" }
    ],
    usedInPatterns: ["genie-predictive-hint-bar"],
    usedInModules: ["Dashboard", "Payroll", "Compliance"],
    icon: Lightbulb,
    filePath: "src/components/GeniePredictiveHintBar.tsx"
  },
  {
    id: "genie-recall-thread",
    name: "GenieRecallThread",
    description: "Resume paused workflows with full context restoration",
    category: "Genie",
    states: [
      { name: "paused", description: "Workflow temporarily stopped" },
      { name: "resuming", description: "Restoring context and state" },
      { name: "active", description: "Workflow actively running" },
      { name: "completed", description: "Workflow finished" }
    ],
    usedInPatterns: ["genie-multi-step-recall"],
    usedInModules: ["Onboarding", "Contracts", "Payroll"],
    icon: RotateCcw,
    filePath: "src/components/GenieRecallThread.tsx"
  },
  {
    id: "genie-memory-thread",
    name: "GenieMemoryThread",
    description: "Context persistence across sessions with recall capability",
    category: "Genie",
    states: [
      { name: "recording", description: "Actively tracking context" },
      { name: "recalling", description: "Retrieving past context" },
      { name: "idle", description: "Passive state" }
    ],
    usedInPatterns: ["genie-memory-thread"],
    usedInModules: ["Dashboard", "All Modules"],
    icon: Brain,
    filePath: "src/components/GenieMemoryThread.tsx"
  },
  {
    id: "genie-smart-confirmation",
    name: "GenieSmartConfirmation",
    description: "Review modal before significant actions with clear summaries",
    category: "Genie",
    states: [
      { name: "reviewing", description: "User examining details" },
      { name: "confirmed", description: "Action approved" },
      { name: "cancelled", description: "Action rejected" }
    ],
    usedInPatterns: ["genie-smart-confirmation"],
    usedInModules: ["Payroll", "Contracts"],
    icon: CheckCircle,
    filePath: "src/components/GenieSmartConfirmation.tsx"
  },
  {
    id: "genie-task-timeline",
    name: "GenieTaskTimeline",
    description: "Real-time view of background actions with step-by-step confidence",
    category: "Genie",
    states: [
      { name: "pending", description: "Task queued" },
      { name: "in-progress", description: "Actively executing" },
      { name: "completed", description: "Task finished successfully" },
      { name: "error", description: "Task failed with error state" }
    ],
    usedInPatterns: ["genie-task-timeline"],
    usedInModules: ["Dashboard", "All Modules"],
    icon: Timer,
    filePath: "src/components/GenieTaskTimeline.tsx"
  },
  {
    id: "genie-insight-carousel",
    name: "GenieInsightCarousel",
    description: "Swipeable horizontal carousel for multiple related insights",
    category: "Genie",
    states: [
      { name: "default", description: "Showing current insight" },
      { name: "swiping", description: "User navigating between insights" },
      { name: "expanded", description: "Full detail view of single insight" }
    ],
    usedInPatterns: ["genie-insight-carousel"],
    usedInModules: ["Dashboard", "Analytics"],
    icon: Presentation,
    filePath: "src/components/GenieInsightCarousel.tsx"
  },
  {
    id: "genie-suggestion-chips",
    name: "GenieSuggestionChips",
    description: "One-tap contextual actions for faster workflow completion",
    category: "Genie",
    states: [
      { name: "default", description: "Available suggestion" },
      { name: "hover", description: "Interactive highlight" },
      { name: "selected", description: "Chosen action" },
      { name: "disabled", description: "Unavailable suggestion" }
    ],
    usedInPatterns: ["smart-suggestion-chips"],
    usedInModules: ["All Modules"],
    icon: Sparkles,
    filePath: "src/components/GenieSuggestionChips.tsx"
  },
  {
    id: "genie-smart-recap",
    name: "GenieSmartRecap",
    description: "Session summaries with contextual next steps",
    category: "Genie",
    states: [
      { name: "generating", description: "Creating summary" },
      { name: "complete", description: "Recap ready to view" },
      { name: "expanded", description: "Full detail view with actions" }
    ],
    usedInPatterns: ["genie-smart-recap"],
    usedInModules: ["Dashboard", "All Modules"],
    icon: Sparkles,
    filePath: "src/components/GenieSmartRecap.tsx"
  },
  {
    id: "genie-context-pivot",
    name: "GenieContextPivot",
    description: "Seamless entity context switching with separate memory threads",
    category: "Genie",
    states: [
      { name: "idle", description: "No active context" },
      { name: "switching", description: "Transitioning between contexts" },
      { name: "active", description: "Context loaded and active" }
    ],
    usedInPatterns: ["genie-context-pivot"],
    usedInModules: ["Dashboard", "Multi-entity views"],
    icon: RefreshCw,
    filePath: "src/components/GenieContextPivot.tsx"
  },
  {
    id: "genie-confirmation-queue",
    name: "GenieConfirmationQueue",
    description: "Pending actions manager for Genie-initiated tasks",
    category: "Genie",
    states: [
      { name: "empty", description: "No pending confirmations" },
      { name: "pending", description: "Actions awaiting review" },
      { name: "processing", description: "Confirming selected actions" }
    ],
    usedInPatterns: ["genie-confirmation-queue"],
    usedInModules: ["Dashboard", "All Modules"],
    icon: ListTodo,
    filePath: "src/components/GenieConfirmationQueue.tsx"
  },
  {
    id: "trust-index-gauge",
    name: "TrustIndexGauge",
    description: "Visual confidence signal with composite trust scoring",
    category: "Pattern",
    states: [
      { name: "low", description: "Below 40% trust score" },
      { name: "medium", description: "40-70% trust score" },
      { name: "high", description: "Above 70% trust score" }
    ],
    usedInPatterns: ["trust-index-gauge", "genie-trust-gauge"],
    usedInModules: ["Dashboard", "Compliance"],
    icon: Gauge,
    filePath: "src/components/TrustIndexGauge.tsx"
  },
  {
    id: "smart-progress",
    name: "SmartProgress",
    description: "Multi-step tracker with countdown timers and pulse animations",
    category: "Pattern",
    states: [
      { name: "pending", description: "Not started" },
      { name: "in-progress", description: "Active with pulse animation" },
      { name: "completed", description: "Successfully finished" },
      { name: "warning", description: "Approaching deadline" }
    ],
    usedInPatterns: ["smart-progress"],
    usedInModules: ["Payroll", "Compliance"],
    icon: Activity,
    filePath: "src/components/SmartProgress.tsx"
  },
  {
    id: "reaction-card",
    name: "ReactionCard",
    description: "Sentiment feedback loop with emoji-based reactions",
    category: "Pattern",
    states: [
      { name: "default", description: "No reaction selected" },
      { name: "selected", description: "Reaction chosen" },
      { name: "submitted", description: "Feedback recorded" }
    ],
    usedInPatterns: ["genie-reaction-cards"],
    usedInModules: ["All Modules"],
    icon: Smile,
    filePath: "src/components/ReactionCard.tsx"
  },
  {
    id: "compliance-checklist-block",
    name: "ComplianceChecklistBlock",
    description: "Country-specific verification with Genie validation",
    category: "Pattern",
    states: [
      { name: "unchecked", description: "Not verified" },
      { name: "checking", description: "Validation in progress" },
      { name: "verified", description: "Successfully validated" },
      { name: "error", description: "Validation failed" }
    ],
    usedInPatterns: ["compliance-checklist"],
    usedInModules: ["Compliance"],
    icon: ClipboardCheck,
    filePath: "src/components/ComplianceChecklistBlock.tsx"
  },
  {
    id: "data-summary-card",
    name: "DataSummaryCard",
    description: "Compact, expandable metric cards with key insights",
    category: "Pattern",
    states: [
      { name: "collapsed", description: "Summary view only" },
      { name: "expanded", description: "Full details visible" },
      { name: "loading", description: "Fetching data" }
    ],
    usedInPatterns: ["data-summary"],
    usedInModules: ["Dashboard", "Analytics"],
    icon: BarChart3,
    filePath: "src/components/DataSummaryCard.tsx"
  },
  {
    id: "fx-breakdown-popover",
    name: "FXBreakdownPopover",
    description: "Transparent currency conversion with AI insights",
    category: "Pattern",
    states: [
      { name: "closed", description: "Popover hidden" },
      { name: "open", description: "Showing breakdown details" },
      { name: "loading", description: "Fetching live rates" }
    ],
    usedInPatterns: ["fx-breakdown"],
    usedInModules: ["Payroll"],
    icon: DollarSign,
    filePath: "src/components/FXBreakdownPopover.tsx"
  },
  {
    id: "empty-state-card",
    name: "EmptyStateCard",
    description: "Helpful placeholder guiding users toward next action",
    category: "Pattern",
    states: [
      { name: "default", description: "Standard empty state" },
      { name: "with-action", description: "Includes CTA button" }
    ],
    usedInPatterns: ["empty-state"],
    usedInModules: ["All Modules"],
    icon: Inbox,
    filePath: "src/components/EmptyStateCard.tsx"
  },
  {
    id: "genie-drawer",
    name: "GenieDrawer",
    description: "Right-side panel for Genie conversations and context",
    category: "Dashboard",
    states: [
      { name: "closed", description: "Drawer hidden" },
      { name: "open", description: "Drawer visible with content" },
      { name: "minimized", description: "Collapsed to icon" }
    ],
    usedInPatterns: ["contextual-drawer"],
    usedInModules: ["Dashboard", "All Modules"],
    icon: PanelRightOpen,
    filePath: "src/components/dashboard/GenieDrawer.tsx"
  },
  {
    id: "notification-center",
    name: "NotificationCenter",
    description: "Centralized alerts with SLA timers",
    category: "Dashboard",
    states: [
      { name: "closed", description: "Panel hidden" },
      { name: "open", description: "Showing notifications" },
      { name: "urgent", description: "Has high-priority alerts" }
    ],
    usedInPatterns: ["notification-center"],
    usedInModules: ["Dashboard"],
    icon: Bell,
    filePath: "src/components/dashboard/NotificationCenter.tsx"
  },
  {
    id: "adaptive-widget",
    name: "AdaptiveWidget",
    description: "Personalized, draggable dashboard widgets",
    category: "Dashboard",
    states: [
      { name: "default", description: "Standard widget state" },
      { name: "dragging", description: "Being repositioned" },
      { name: "resizing", description: "Size being adjusted" }
    ],
    usedInPatterns: ["adaptive-widget-grid"],
    usedInModules: ["Dashboard"],
    icon: LayoutGrid,
    filePath: "src/components/dashboard/AdaptiveWidget.tsx"
  },
  {
    id: "nav-sidebar",
    name: "NavSidebar",
    description: "Collapsible navigation with role-based menu items",
    category: "Dashboard",
    states: [
      { name: "expanded", description: "Full width with labels" },
      { name: "collapsed", description: "Icon-only mini mode" }
    ],
    usedInPatterns: ["dashboard"],
    usedInModules: ["Dashboard"],
    icon: Menu,
    filePath: "src/components/dashboard/NavSidebar.tsx"
  },
  {
    id: "topbar",
    name: "Topbar",
    description: "Global header with search and user actions",
    category: "Dashboard",
    states: [
      { name: "default", description: "Standard state" },
      { name: "searching", description: "Search input active" }
    ],
    usedInPatterns: ["dashboard"],
    usedInModules: ["Dashboard"],
    icon: Menu,
    filePath: "src/components/dashboard/Topbar.tsx"
  },
  {
    id: "button",
    name: "Button",
    description: "Primary interactive element with multiple variants",
    category: "UI",
    states: [
      { name: "default", description: "Idle state" },
      { name: "hover", description: "Mouse over interaction" },
      { name: "active", description: "Pressed state" },
      { name: "disabled", description: "Non-interactive state" },
      { name: "loading", description: "Processing action" }
    ],
    usedInPatterns: ["onboarding", "dashboard", "step-card-pattern", "contextual-drawer", "confirmation-modal", "dual-mode", "compliance-checklist", "voice-type-toggle", "genie-confirmation", "genie-dual-path-suggestion", "genie-predictive-hint-bar", "genie-multi-step-recall"],
    usedInModules: ["All Modules"],
    icon: Box,
    filePath: "src/components/ui/button.tsx"
  },
  {
    id: "card",
    name: "Card",
    description: "Container component with header, content, and footer sections",
    category: "UI",
    states: [
      { name: "default", description: "Standard card" },
      { name: "hover", description: "Elevated on hover" },
      { name: "clickable", description: "Interactive card variant" }
    ],
    usedInPatterns: ["onboarding", "dashboard", "data-summary", "empty-state", "genie-confirmation", "genie-reaction-cards", "trust-index-gauge", "genie-smart-recap", "genie-insight-carousel"],
    usedInModules: ["All Modules"],
    icon: CreditCard,
    filePath: "src/components/ui/card.tsx"
  },
  {
    id: "badge",
    name: "Badge",
    description: "Small status indicator with variant styles",
    category: "UI",
    states: [
      { name: "default", description: "Neutral badge" },
      { name: "success", description: "Positive indicator" },
      { name: "warning", description: "Caution indicator" },
      { name: "error", description: "Error or danger indicator" }
    ],
    usedInPatterns: ["onboarding", "policy-tags", "smart-tags", "notification-center", "compliance-checklist", "genie-predictive-hint-bar", "genie-context-pivot", "genie-confirmation-queue"],
    usedInModules: ["All Modules"],
    icon: CheckSquare,
    filePath: "src/components/ui/badge.tsx"
  },
  {
    id: "toast",
    name: "Toast",
    description: "Temporary notification message",
    category: "UI",
    states: [
      { name: "entering", description: "Sliding in" },
      { name: "visible", description: "Fully displayed" },
      { name: "exiting", description: "Fading out" }
    ],
    usedInPatterns: ["All patterns"],
    usedInModules: ["All Modules"],
    icon: MessageSquare,
    filePath: "src/components/ui/toast.tsx"
  },
  {
    id: "progress",
    name: "Progress",
    description: "Visual progress indicator bar",
    category: "UI",
    states: [
      { name: "indeterminate", description: "Unknown progress" },
      { name: "determinate", description: "Known percentage" },
      { name: "complete", description: "100% finished" }
    ],
    usedInPatterns: ["onboarding", "smart-progress", "step-card-pattern", "genie-task-timeline", "genie-multi-step-recall"],
    usedInModules: ["Onboarding", "Payroll"],
    icon: Activity,
    filePath: "src/components/ui/progress.tsx"
  },
  {
    id: "dialog",
    name: "Dialog",
    description: "Modal overlay for critical interactions",
    category: "UI",
    states: [
      { name: "closed", description: "Hidden" },
      { name: "opening", description: "Animating in" },
      { name: "open", description: "Fully visible" },
      { name: "closing", description: "Animating out" }
    ],
    usedInPatterns: ["confirmation-modal", "contract-preview"],
    usedInModules: ["All Modules"],
    icon: Box,
    filePath: "src/components/ui/dialog.tsx"
  },
  {
    id: "tooltip",
    name: "Tooltip",
    description: "Contextual help text on hover",
    category: "UI",
    states: [
      { name: "hidden", description: "Not visible" },
      { name: "visible", description: "Showing on hover" }
    ],
    usedInPatterns: ["onboarding", "narrated-insight", "hover-toolbar", "fx-breakdown", "genie-predictive-hint-bar", "genie-dual-path-suggestion"],
    usedInModules: ["All Modules"],
    icon: MessageSquare,
    filePath: "src/components/ui/tooltip.tsx"
  },
  {
    id: "input",
    name: "Input",
    description: "Text input field with validation states",
    category: "UI",
    states: [
      { name: "default", description: "Ready for input" },
      { name: "focus", description: "Active input state" },
      { name: "error", description: "Validation error" },
      { name: "disabled", description: "Non-editable" }
    ],
    usedInPatterns: ["onboarding", "dual-mode", "voice-type-toggle", "compliance-checklist"],
    usedInModules: ["All Modules"],
    icon: Box,
    filePath: "src/components/ui/input.tsx"
  },
  {
    id: "avatar",
    name: "Avatar",
    description: "User profile image with fallback",
    category: "UI",
    states: [
      { name: "default", description: "With image" },
      { name: "fallback", description: "Showing initials" }
    ],
    usedInPatterns: ["onboarding", "dashboard", "genie-memory-thread", "genie-context-tracker"],
    usedInModules: ["All Modules"],
    icon: UserPlus,
    filePath: "src/components/ui/avatar.tsx"
  },
  {
    id: "kurt-avatar",
    name: "KurtAvatar",
    description: "Genie AI assistant avatar component",
    category: "Genie",
    states: [
      { name: "default", description: "Standard size" },
      { name: "small", description: "Compact variant" }
    ],
    usedInPatterns: ["onboarding", "dashboard", "genie-memory-thread", "genie-smart-recap", "genie-dual-path-suggestion", "genie-multi-step-recall"],
    usedInModules: ["All Modules"],
    icon: Brain,
    filePath: "src/components/KurtAvatar.tsx"
  }
];

export const getComponentsByPattern = (patternPath: string): ComponentReference[] => {
  return componentsRegistry.filter(comp => 
    comp.usedInPatterns.some(p => patternPath.includes(p))
  );
};

export const getPatternsByComponent = (componentId: string): string[] => {
  const component = componentsRegistry.find(c => c.id === componentId);
  return component?.usedInPatterns || [];
};
