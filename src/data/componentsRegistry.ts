import { LucideIcon, Box, CreditCard, CheckSquare, MessageSquare, Clock, Smile, Shield, Eye, UserCheck, History, Timer, Presentation, Gauge, CheckCircle, GitBranch, Lightbulb, RotateCcw, Sparkles, Brain, ListTodo, ShieldCheck, Activity, RefreshCw, Bell, LayoutGrid, FileText, DollarSign, Inbox, ClipboardCheck, Mic, BarChart3, Link2, ToggleLeft, ScrollText, Tags, MousePointerClick, PanelRightOpen, ListChecks, LayoutDashboard, UserPlus, ArrowRight, Menu, ChevronRight, Play, Pause, X, ChevronDown, TrendingUp, AlertCircle, Calculator, HelpCircle, FileSignature, User, CheckCircle2, Calendar, Globe } from "lucide-react";

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
  },
  {
    id: "compliance-icon",
    name: "ComplianceIcon",
    description: "Status indicator for compliance sync with badge states",
    category: "Genie",
    states: [
      { name: "idle", description: "Compliance up to date" },
      { name: "syncing", description: "Sync in progress with pulse animation" },
      { name: "changed", description: "Updates available with count badge" },
      { name: "error", description: "Sync failed with error indicator" }
    ],
    props: [
      { name: "status", type: "'idle' | 'syncing' | 'changed' | 'error'", description: "Current sync status" },
      { name: "count", type: "number", description: "Number of changes (optional)" },
      { name: "onClick", type: "() => void", description: "Click handler to open drawer" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Genie", "Compliance"],
    icon: Shield,
    filePath: "src/components/compliance/ComplianceIcon.tsx"
  },
  {
    id: "compliance-drawer",
    name: "ComplianceDrawer",
    description: "Right-side drawer showing real-time country rule status and quick actions",
    category: "Genie",
    states: [
      { name: "open", description: "Drawer visible" },
      { name: "closed", description: "Drawer hidden" }
    ],
    props: [
      { name: "open", type: "boolean", description: "Controls drawer visibility" },
      { name: "country", type: "string", description: "Selected country code" },
      { name: "status", type: "SyncStatus", description: "Current sync status" },
      { name: "changes", type: "RuleChange[]", description: "List of rule changes" },
      { name: "activePolicies", type: "MiniRule[]", description: "Active policy rules" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Genie", "Compliance"],
    icon: Shield,
    filePath: "src/components/compliance/ComplianceDrawer.tsx"
  },
  {
    id: "rule-change-chip",
    name: "RuleChangeChip",
    description: "Expandable chip showing rule change summary with diff viewer",
    category: "Pattern",
    states: [
      { name: "collapsed", description: "Summary view only" },
      { name: "expanded", description: "Full diff visible" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Compliance"],
    icon: FileText,
    filePath: "src/components/compliance/RuleChangeChip.tsx"
  },
  {
    id: "rule-badge",
    name: "RuleBadge",
    description: "Editable policy chip with popover editor",
    category: "UI",
    states: [
      { name: "default", description: "Read-only display" },
      { name: "editing", description: "Popover editor open" }
    ],
    usedInPatterns: ["compliance-sync-drawer", "policy-tags"],
    usedInModules: ["Compliance"],
    icon: Tags,
    filePath: "src/components/compliance/RuleBadge.tsx"
  },
  {
    id: "diff-viewer",
    name: "DiffViewer",
    description: "Side-by-side text comparison for rule changes",
    category: "Pattern",
    states: [
      { name: "default", description: "Showing diff" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Compliance"],
    icon: FileText,
    filePath: "src/components/compliance/DiffViewer.tsx"
  },
  {
    id: "sync-status-dot",
    name: "SyncStatusDot",
    description: "Visual status indicator for sync states",
    category: "UI",
    states: [
      { name: "idle", description: "Neutral/up to date" },
      { name: "syncing", description: "Pulse animation" },
      { name: "changed", description: "Updates available" },
      { name: "error", description: "Sync failed" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Compliance"],
    icon: Activity,
    filePath: "src/components/compliance/SyncStatusDot.tsx"
  },
  {
    id: "source-link",
    name: "SourceLink",
    description: "External link to authority references",
    category: "UI",
    states: [
      { name: "default", description: "Standard link" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Compliance"],
    icon: Link2,
    filePath: "src/components/compliance/SourceLink.tsx"
  },
  {
    id: "acknowledge-button",
    name: "AcknowledgeButton",
    description: "Confirm review action that logs to audit timeline",
    category: "Pattern",
    states: [
      { name: "default", description: "Ready to acknowledge" },
      { name: "disabled", description: "No changes to acknowledge" }
    ],
    usedInPatterns: ["compliance-sync-drawer"],
    usedInModules: ["Compliance", "Audit"],
    icon: CheckCircle,
    filePath: "src/components/compliance/AcknowledgeButton.tsx"
  },
  {
    id: "pattern-42",
    name: "Cost & Tax Logic Visualizer",
    description: "Transparent breakdown of Gross → Employer Tax → Fee → Total with toggleable fee models",
    category: "Pattern",
    states: [
      { name: "default", description: "Standard calculation view" },
      { name: "comparing", description: "Showing competitor comparison" },
      { name: "editing", description: "User adjusting parameters" }
    ],
    props: [
      { name: "jurisdiction", type: "string", description: "Selected country" },
      { name: "currency", type: "string", description: "Currency code" },
      { name: "gross", type: "number", description: "Gross salary amount" },
      { name: "employerRate", type: "number", description: "Employer tax rate" },
      { name: "feeRate", type: "number", description: "Fee percentage" },
      { name: "feeModel", type: "'GROSS' | 'TOTAL_COST'", description: "Fee calculation model" }
    ],
    usedInPatterns: ["cost-tax-visualizer"],
    usedInModules: ["Finance", "Payroll", "Country Blocks"],
    icon: Calculator,
    filePath: "src/pages/CostTaxVisualizerPattern.tsx"
  },
  {
    id: "cost-breakdown-card",
    name: "CostBreakdownCard",
    description: "Main cost calculator with jurisdiction, rates, and fee model controls",
    category: "Pattern",
    states: [
      { name: "default", description: "Showing cost breakdown" },
      { name: "comparing", description: "Comparison modal open" }
    ],
    usedInPatterns: ["cost-tax-visualizer"],
    usedInModules: ["Finance", "Payroll"],
    icon: Calculator,
    filePath: "src/components/cost/CostBreakdownCard.tsx"
  },
  {
    id: "fx-badge",
    name: "FXBadge",
    description: "Display FX spot rate, spread, and effective rate",
    category: "UI",
    states: [
      { name: "default", description: "Showing FX info" }
    ],
    usedInPatterns: ["cost-tax-visualizer", "fx-breakdown"],
    usedInModules: ["Finance", "Payroll"],
    icon: TrendingUp,
    filePath: "src/components/cost/FXBadge.tsx"
  },
  {
    id: "fee-toggle-switch",
    name: "FeeToggleSwitch",
    description: "Toggle between GROSS and TOTAL_COST fee calculation models",
    category: "UI",
    states: [
      { name: "gross", description: "Fee based on gross only" },
      { name: "total-cost", description: "Fee based on gross + tax" }
    ],
    usedInPatterns: ["cost-tax-visualizer"],
    usedInModules: ["Finance"],
    icon: ToggleLeft,
    filePath: "src/components/cost/FeeToggleSwitch.tsx"
  },
  {
    id: "tooltip-explain",
    name: "TooltipExplain",
    description: "Formula and source explanations in tooltips",
    category: "UI",
    states: [
      { name: "closed", description: "Tooltip hidden" },
      { name: "open", description: "Showing formula and source" }
    ],
    usedInPatterns: ["cost-tax-visualizer"],
    usedInModules: ["Finance", "Compliance"],
    icon: AlertCircle,
    filePath: "src/components/cost/TooltipExplain.tsx"
  },
  {
    id: "comparison-chart",
    name: "ComparisonChart",
    description: "Educational cost comparison modal",
    category: "Pattern",
    states: [
      { name: "open", description: "Modal visible" },
      { name: "closed", description: "Modal hidden" }
    ],
    usedInPatterns: ["cost-tax-visualizer"],
    usedInModules: ["Finance"],
    icon: BarChart3,
    filePath: "src/components/cost/ComparisonChart.tsx"
  },
  {
    id: "contract-viewer",
    name: "ContractViewer",
    description: "Contract document preview with summary banner for key details",
    category: "Pattern",
    states: [
      { name: "default", description: "Standard preview" },
      { name: "loading", description: "Loading contract document" }
    ],
    props: [
      { name: "summary", type: "ContractSummary", description: "Key contract details (salary, dates, PTO)" },
      { name: "contractUrl", type: "string", description: "PDF document URL (optional)" },
      { name: "children", type: "ReactNode", description: "Custom contract content" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Contracts", "Onboarding"],
    icon: FileText,
    filePath: "src/components/ContractViewer.tsx"
  },
  {
    id: "clause-tooltip",
    name: "ClauseTooltip",
    description: "Interactive tooltip explaining contract clauses with plain-English definitions",
    category: "UI",
    states: [
      { name: "closed", description: "Tooltip hidden" },
      { name: "open", description: "Showing clause explanation" }
    ],
    props: [
      { name: "clauseNumber", type: "string", description: "Clause reference number" },
      { name: "title", type: "string", description: "Clause title" },
      { name: "explanation", type: "string", description: "Plain-English explanation" },
      { name: "whyThisClause", type: "string", description: "Context for why this clause exists (optional)" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Contracts", "Legal"],
    icon: HelpCircle,
    filePath: "src/components/ClauseTooltip.tsx"
  },
  {
    id: "signature-flow",
    name: "SignatureFlow",
    description: "E-signature dialog with ready → signing → signed states",
    category: "Pattern",
    states: [
      { name: "ready", description: "Ready to sign" },
      { name: "signing", description: "Processing signature" },
      { name: "signed", description: "Successfully signed with timestamp" }
    ],
    props: [
      { name: "open", type: "boolean", description: "Dialog visibility" },
      { name: "candidateName", type: "string", description: "Signer's name" },
      { name: "documentTitle", type: "string", description: "Document being signed" },
      { name: "onSign", type: "() => Promise<void>", description: "Signature handler" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Contracts", "Legal"],
    icon: FileSignature,
    filePath: "src/components/SignatureFlow.tsx"
  },
  {
    id: "worker-profile-shell",
    name: "WorkerProfileShell",
    description: "Candidate profile card showing basic info and onboarding status",
    category: "Pattern",
    states: [
      { name: "awaiting_contract", description: "Contract not yet sent" },
      { name: "contract_signed", description: "Contract completed" },
      { name: "onboarding", description: "In onboarding process" },
      { name: "active", description: "Fully onboarded worker" }
    ],
    props: [
      { name: "name", type: "string", description: "Worker's full name" },
      { name: "email", type: "string", description: "Contact email" },
      { name: "role", type: "string", description: "Job title" },
      { name: "location", type: "string", description: "Work location" },
      { name: "status", type: "Status", description: "Current workflow status" },
      { name: "startDate", type: "string", description: "Contract start date (optional)" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Onboarding", "HR"],
    icon: User,
    filePath: "src/components/WorkerProfileShell.tsx"
  },
  {
    id: "compliance-badge",
    name: "ComplianceBadge",
    description: "Country compliance status indicator with tooltip messages",
    category: "UI",
    states: [
      { name: "compliant", description: "Fully compliant" },
      { name: "pending_review", description: "Under review" },
      { name: "requires_action", description: "Action needed" },
      { name: "non_compliant", description: "Not compliant" }
    ],
    props: [
      { name: "country", type: "string", description: "Country name" },
      { name: "status", type: "ComplianceStatus", description: "Compliance state" },
      { name: "message", type: "string", description: "Additional context (optional)" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Compliance", "Legal"],
    icon: ShieldCheck,
    filePath: "src/components/ComplianceBadge.tsx"
  },
  {
    id: "cost-summary-popover",
    name: "CostSummaryPopover",
    description: "Employment cost breakdown with taxes, benefits, and totals",
    category: "Pattern",
    states: [
      { name: "closed", description: "Popover hidden" },
      { name: "open", description: "Showing cost breakdown" }
    ],
    props: [
      { name: "baseSalary", type: "number", description: "Base salary amount" },
      { name: "employerTax", type: "number", description: "Employer tax amount" },
      { name: "benefits", type: "number", description: "Benefits cost" },
      { name: "currency", type: "string", description: "Currency code" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Finance", "Payroll"],
    icon: DollarSign,
    filePath: "src/components/CostSummaryPopover.tsx"
  },
  {
    id: "onboarding-step-progress",
    name: "OnboardingStepProgress",
    description: "Visual progress tracker for multi-step onboarding flows",
    category: "Pattern",
    states: [
      { name: "completed", description: "Step completed" },
      { name: "current", description: "Active step with animation" },
      { name: "pending", description: "Not yet started" }
    ],
    props: [
      { name: "steps", type: "OnboardingStep[]", description: "Array of steps with status" }
    ],
    usedInPatterns: ["candidate-experience-flow"],
    usedInModules: ["Onboarding", "HR"],
    icon: CheckCircle2,
    filePath: "src/components/OnboardingStepProgress.tsx"
  },
  {
    id: "standard-input",
    name: "StandardInput",
    description: "Standardized text input with label, error, help text, and lock states",
    category: "UI",
    states: [
      { name: "default", description: "Editable field" },
      { name: "locked", description: "Read-only with lock icon" },
      { name: "completed", description: "Validated with checkmark" },
      { name: "error", description: "Validation error state" }
    ],
    props: [
      { name: "label", type: "string", description: "Field label" },
      { name: "required", type: "boolean", description: "Required field indicator" },
      { name: "error", type: "string", description: "Error message" },
      { name: "helpText", type: "string", description: "Helper text below field" },
      { name: "locked", type: "boolean", description: "Lock field from editing" }
    ],
    usedInPatterns: ["onboarding", "admin-onboarding", "candidate-onboarding", "worker-onboarding"],
    usedInModules: ["All Modules"],
    icon: FileText,
    filePath: "src/components/shared/StandardInput.tsx"
  },
  {
    id: "phone-input",
    name: "PhoneInput",
    description: "International phone input with country code selector and auto-formatting",
    category: "UI",
    states: [
      { name: "default", description: "Editable with country selector" },
      { name: "disabled", description: "Read-only state" },
      { name: "error", description: "Validation error" }
    ],
    props: [
      { name: "value", type: "string", description: "Phone number" },
      { name: "countryCode", type: "string", description: "Selected country code" },
      { name: "onChange", type: "function", description: "Value change handler" }
    ],
    usedInPatterns: ["onboarding", "admin-onboarding", "candidate-onboarding", "worker-onboarding"],
    usedInModules: ["Onboarding", "HR", "Contracts"],
    icon: User,
    filePath: "src/components/shared/PhoneInput.tsx"
  },
  {
    id: "currency-input",
    name: "CurrencyInput",
    description: "Currency input with auto-formatting and currency selector",
    category: "UI",
    states: [
      { name: "default", description: "Editable with currency selector" },
      { name: "locked-currency", description: "Currency fixed, amount editable" },
      { name: "disabled", description: "Read-only" }
    ],
    props: [
      { name: "value", type: "string | number", description: "Amount value" },
      { name: "currency", type: "string", description: "Currency code" },
      { name: "showCurrencySelect", type: "boolean", description: "Show currency dropdown" }
    ],
    usedInPatterns: ["onboarding", "payroll", "contracts", "cost-tax-visualizer"],
    usedInModules: ["Payroll", "Contracts", "Finance"],
    icon: DollarSign,
    filePath: "src/components/shared/CurrencyInput.tsx"
  },
  {
    id: "monthly-pay-schedule-input",
    name: "MonthlyPayScheduleInput",
    description: "Day-of-month input with validation for payroll schedules",
    category: "UI",
    states: [
      { name: "valid", description: "Valid day selected" },
      { name: "warning", description: "Day 29-31 with month-end warning" },
      { name: "error", description: "Invalid day number" }
    ],
    props: [
      { name: "value", type: "string | number", description: "Day of month" },
      { name: "onChange", type: "function", description: "Value change handler" }
    ],
    usedInPatterns: ["onboarding", "admin-onboarding", "payroll"],
    usedInModules: ["Payroll", "Admin"],
    icon: Calendar,
    filePath: "src/components/shared/MonthlyPayScheduleInput.tsx"
  },
  {
    id: "date-of-birth-picker",
    name: "DateOfBirthPicker",
    description: "Date picker with restrictions for date of birth selection",
    category: "UI",
    states: [
      { name: "closed", description: "Calendar hidden" },
      { name: "open", description: "Calendar visible" },
      { name: "selected", description: "Date chosen" }
    ],
    props: [
      { name: "value", type: "Date", description: "Selected date" },
      { name: "onChange", type: "function", description: "Date change handler" }
    ],
    usedInPatterns: ["onboarding", "candidate-onboarding", "worker-onboarding"],
    usedInModules: ["Onboarding", "HR"],
    icon: Calendar,
    filePath: "src/components/shared/DateOfBirthPicker.tsx"
  },
  {
    id: "nationality-select",
    name: "NationalitySelect",
    description: "Dropdown with country flags for nationality selection",
    category: "UI",
    states: [
      { name: "closed", description: "Dropdown hidden" },
      { name: "open", description: "Dropdown visible" },
      { name: "selected", description: "Nationality chosen" }
    ],
    props: [
      { name: "value", type: "string", description: "Country code" },
      { name: "onValueChange", type: "function", description: "Selection handler" }
    ],
    usedInPatterns: ["onboarding", "candidate-onboarding", "worker-onboarding"],
    usedInModules: ["Onboarding", "HR", "Compliance"],
    icon: Globe,
    filePath: "src/components/shared/NationalitySelect.tsx"
  },
  {
    id: "person-mini-card",
    name: "PersonMiniCard",
    description: "Compact person card with avatar, flag badge, and selection",
    category: "Pattern",
    states: [
      { name: "default", description: "Standard display" },
      { name: "selected", description: "Checkbox checked" },
      { name: "hover", description: "Elevated shadow on hover" }
    ],
    props: [
      { name: "name", type: "string", description: "Person's name" },
      { name: "role", type: "string", description: "Job title or role" },
      { name: "countryFlag", type: "string", description: "Emoji flag" },
      { name: "showCheckbox", type: "boolean", description: "Enable selection" },
      { name: "isSelected", type: "boolean", description: "Selection state" }
    ],
    usedInPatterns: ["contract-pipeline", "dashboard", "candidate-onboarding"],
    usedInModules: ["Dashboard", "Contracts", "HR"],
    icon: User,
    filePath: "src/components/shared/PersonMiniCard.tsx"
  },
  {
    id: "standard-checklist-item",
    name: "StandardChecklistItem",
    description: "Standardized checklist item with status badge and description",
    category: "Pattern",
    states: [
      { name: "pending", description: "Not started" },
      { name: "in-progress", description: "Currently working" },
      { name: "completed", description: "Checked off" },
      { name: "overdue", description: "Past deadline" }
    ],
    props: [
      { name: "title", type: "string", description: "Item title" },
      { name: "description", type: "string", description: "Item details" },
      { name: "checked", type: "boolean", description: "Completion state" },
      { name: "status", type: "string", description: "Item status" }
    ],
    usedInPatterns: ["compliance-checklist", "candidate-onboarding", "worker-onboarding"],
    usedInModules: ["Compliance", "Onboarding", "HR"],
    icon: CheckSquare,
    filePath: "src/components/shared/StandardChecklistItem.tsx"
  },
  {
    id: "standard-progress",
    name: "StandardProgress",
    description: "Standardized progress bar with step counter and variants",
    category: "UI",
    states: [
      { name: "default", description: "Primary gradient" },
      { name: "secondary", description: "Secondary colors" },
      { name: "accent", description: "Accent colors" }
    ],
    props: [
      { name: "currentStep", type: "number", description: "Current step number" },
      { name: "totalSteps", type: "number", description: "Total steps" },
      { name: "variant", type: "string", description: "Color variant" },
      { name: "showLabel", type: "boolean", description: "Show step counter" }
    ],
    usedInPatterns: ["onboarding", "admin-onboarding", "candidate-onboarding", "worker-onboarding", "smart-progress"],
    usedInModules: ["All Modules"],
    icon: Activity,
    filePath: "src/components/shared/StandardProgress.tsx"
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
