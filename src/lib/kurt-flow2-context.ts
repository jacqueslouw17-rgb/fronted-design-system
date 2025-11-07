import { Contractor } from "@/hooks/useContractorStore";

/**
 * Generate context-aware messages for Flow 2 based on contractor data
 */
export function generateAnyUpdatesMessage(contractors: Contractor[]): string {
  if (contractors.length === 0) {
    return "No candidates in your pipeline yet. Start by sending your first offer to a contractor.";
  }

  const messages: string[] = [];

  // Check for new offer acceptances
  const offerAccepted = contractors.filter((c) => c.status === "offer-accepted");
  if (offerAccepted.length > 0) {
    offerAccepted.forEach((c) => {
      messages.push(`🎉 ${c.name} accepted your offer — ${c.role}, ${c.country}`);
    });
  }

  // Check for completed forms
  const dataReceived = contractors.filter((c) => c.status === "data-pending" && c.dataReceived);
  if (dataReceived.length > 0) {
    const names = dataReceived.map((c) => c.name).join(" and ");
    messages.push(`✅ ${names} completed form${dataReceived.length > 1 ? "s" : ""} — ready to draft contracts.`);
  }

  // Check for auto-verified contracts
  const drafting = contractors.filter((c) => c.status === "drafting");
  if (drafting.length > 0) {
    drafting.forEach((c) => {
      messages.push(`📄 ${c.name}'s contract auto-verified — waiting for signature stage.`);
    });
  }

  // Check for payroll certification
  const certified = contractors.filter((c) => c.status === "CERTIFIED");
  if (certified.length > 0) {
    messages.push(`💼 Payroll certification available for ${certified.length} candidate${certified.length > 1 ? "s" : ""}.`);
  }

  // Check for awaiting signatures
  const awaitingSignature = contractors.filter((c) => c.status === "awaiting-signature");
  if (awaitingSignature.length > 0) {
    awaitingSignature.forEach((c) => {
      messages.push(`✍️ ${c.name}'s contract sent for signature — awaiting completion.`);
    });
  }

  // Check for onboarding pending
  const onboardingPending = contractors.filter((c) => c.status === "onboarding-pending");
  if (onboardingPending.length > 0) {
    messages.push(`⏳ ${onboardingPending.length} contractor${onboardingPending.length > 1 ? "s" : ""} in onboarding process.`);
  }

  if (messages.length === 0) {
    return "📊 All contractors are progressing smoothly. No urgent updates at the moment.";
  }

  return messages.join("\n\n");
}

export function generateAskKurtMessage(): string {
  return `I'm here to help you manage your contractor pipeline! 

You can ask me about:

💬 Progress tracking
📝 Draft status updates
⚠️ Pending actions
✅ Contract readiness
💰 Payroll certification

**Try asking:**
• "Who's ready for contract drafting?"
• "Any pending forms?"
• "Show me certified contractors"
• "What needs my attention?"`;
}

export function generateProgressSummary(contractors: Contractor[]): string {
  const offerAccepted = contractors.filter((c) => c.status === "offer-accepted").length;
  const dataPending = contractors.filter((c) => c.status === "data-pending").length;
  const drafting = contractors.filter((c) => c.status === "drafting").length;
  const awaitingSignature = contractors.filter((c) => c.status === "awaiting-signature").length;
  const onboarding = contractors.filter((c) => c.status === "onboarding-pending").length;
  const certified = contractors.filter((c) => c.status === "CERTIFIED").length;

  return `📊 **Pipeline Summary**

🤝 Offer Accepted: ${offerAccepted}
📝 Collecting Data: ${dataPending}
✏️ Drafting Contracts: ${drafting}
✍️ Awaiting Signatures: ${awaitingSignature}
🔄 Onboarding: ${onboarding}
✅ Certified: ${certified}

**Total contractors:** ${contractors.length}`;
}
