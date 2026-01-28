/**
 * Flow 4.2 — Contractor Dashboard v6
 * 
 * Clean invoice dashboard with hero tiles and invoices list.
 * INDEPENDENT from v5 - changes here do not affect other flows.
 */

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { F42v6_InvoiceHeroCard, F42v6_InvoicesSection, F42v6_InvoiceBreakdownDrawer } from "@/components/flows/contractor-dashboard-v6";
import { useF42v6_DashboardStore } from "@/stores/F42v6_DashboardStore";

import type { F42v5_LineItem } from "@/stores/F42v5_DashboardStore";

interface InvoiceData {
  id: string;
  period: string;
  paidDate: string;
  lineItems: F42v5_LineItem[];
  invoiceTotal: number;
}

const invoicesData: InvoiceData[] = [
  {
    id: "dec",
    period: "Dec 2025",
    paidDate: "Dec 15, 2025",
    lineItems: [
      { type: 'Earnings', label: 'Consulting Services', meta: '40 hrs @ $125/hr', amount: 5000 },
      { type: 'Earnings', label: 'Project Milestone Bonus', meta: 'Q4 completion', amount: 250 },
    ],
    invoiceTotal: 5250,
  },
  {
    id: "1",
    period: "Nov 2025",
    paidDate: "Dec 5, 2025",
    lineItems: [
      { type: 'Earnings', label: 'Consulting Services', meta: '40 hrs @ $125/hr', amount: 5000 },
      { type: 'Earnings', label: 'Bug Fix Sprint', meta: 'Additional work', amount: 250 },
    ],
    invoiceTotal: 5250,
  },
  {
    id: "2",
    period: "Oct 2025",
    paidDate: "Nov 5, 2025",
    lineItems: [
      { type: 'Earnings', label: 'Consulting Services', meta: '38 hrs @ $125/hr', amount: 4750 },
      { type: 'Earnings', label: 'Documentation', meta: 'API docs', amount: 350 },
    ],
    invoiceTotal: 5100,
  },
  {
    id: "3",
    period: "Sep 2025",
    paidDate: "Oct 5, 2025",
    lineItems: [
      { type: 'Earnings', label: 'Consulting Services', meta: '40 hrs @ $125/hr', amount: 5000 },
      { type: 'Earnings', label: 'Project Kickoff Bonus', meta: 'Q3 project', amount: 250 },
    ],
    invoiceTotal: 5250,
  },
];

const F42v6_ContractorDashboardPage = () => {
  const { currency } = useF42v6_DashboardStore();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData>(invoicesData[0]);
  
  const candidateProfile = {
    name: "Maria Santos",
    firstName: "Maria",
    role: "Senior Backend Engineer",
    country: "Philippines"
  };

  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 300);
  }, []);

  const handleViewDetails = (invoiceId?: string) => {
    const invoice = invoicesData.find(i => i.id === invoiceId) || invoicesData[0];
    setSelectedInvoice(invoice);
    setBreakdownOpen(true);
  };

  const handleDownload = (invoiceId: string) => {
    console.log("Download invoice:", invoiceId);
  };

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar 
            userName={candidateProfile.name} 
            profileSettingsUrl="/flows/contractor-profile-settings-v6?returnUrl=/candidate-dashboard-contractor-v6" 
            dashboardUrl="/candidate-dashboard-contractor-v6" 
          />

          <div className="flex-1">
            <AgentLayout context="Contractor Dashboard v6">
              <main className="flex-1 min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
                {/* Static background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                  <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10" style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))'
                  }} />
                  <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8" style={{
                    background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))'
                  }} />
                </div>

                <div className="max-w-5xl mx-auto p-8 pb-32 space-y-6 relative z-10">
                  {/* Agent Header */}
                  <AgentHeader 
                    title={`Welcome back, ${candidateProfile.firstName}!`} 
                    subtitle="Candidate Dashboard — Contractor" 
                    showPulse={true} 
                    isActive={false} 
                    showInput={false} 
                  />

                  {/* Hero Card with Last/Next Invoice */}
                  <F42v6_InvoiceHeroCard 
                    onViewDetails={handleViewDetails}
                    currency={currency}
                  />

                  {/* Invoices List */}
                  <F42v6_InvoicesSection 
                    currency={currency}
                    onDownload={handleDownload}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              </main>
            </AgentLayout>
          </div>

          {/* Breakdown Drawer */}
          <F42v6_InvoiceBreakdownDrawer
            open={breakdownOpen}
            onOpenChange={setBreakdownOpen}
            currency={currency}
            lineItems={selectedInvoice.lineItems}
            invoiceTotal={selectedInvoice.invoiceTotal}
            periodLabel={selectedInvoice.period}
          />
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F42v6_ContractorDashboardPage;
