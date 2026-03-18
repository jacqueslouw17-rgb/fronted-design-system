// CA5_ Components - Company Admin Dashboard V5 (Future)
// Isolated clone of v4 - no shared logic with other versions

// Re-export with CA5 aliases from the copied v5 files
export { CA4_PayrollSection as CA5_PayrollSection } from "./CA5_PayrollSection";
export { CA4_LeavesTab as CA5_LeavesTab } from "./CA5_LeavesTab";
export { CA4_ReadinessIndicator as CA5_ReadinessIndicator } from "./CA5_ReadinessIndicator";
export { CA4_PayrollStepper as CA5_PayrollStepper, type CA4_PayrollStep as CA5_PayrollStep } from "./CA5_PayrollStepper";
export { CA4_PeriodDropdown as CA5_PeriodDropdown, type PayrollPeriod } from "./CA5_PeriodDropdown";
export { CollapsibleSection } from "./CA5_CollapsibleSection";

// Agent components
export { CA4_AgentProvider as CA5_AgentProvider, useCA4Agent as useCA5Agent } from "./CA5_AgentContext";
export { CA4_AgentChatPanel as CA5_AgentChatPanel } from "./CA5_AgentChatPanel";
export { CA4_KurtVisualizer as CA5_KurtVisualizer } from "./CA5_KurtVisualizer";
export * from "./CA5_AgentTypes";

// Support panel
export { CA4_SupportPanel as CA5_SupportPanel } from "./CA5_SupportPanel";
export { CA4_SupportBubble as CA5_SupportBubble } from "./CA5_SupportBubble";
