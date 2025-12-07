/**
 * Flow 4.2 — Contractor Dashboard v3
 * 
 * Contractor-specific dashboard with T-5 invoice confirmation and adjustments.
 * Includes Upcoming Invoice card with adjustment drawer.
 */

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { F42v3_UpcomingInvoiceCard } from "@/components/flows/contractor-dashboard-v3";

const F42v3_ContractorDashboardPage = () => {
  const candidateProfile = {
    name: "Maria Santos",
    firstName: "Maria",
    role: "Senior Backend Engineer",
    salary: "$85,000",
    currency: "USD",
    startDate: "March 15, 2024",
    noticePeriod: "30 days",
    pto: "25 days",
    country: "Philippines"
  };

  // One-time success animation on load
  useEffect(() => {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.6
        }
      });
    }, 300);
  }, []);

  // Document handlers
  const handleDownloadContract = () => {
    window.open("#", "_blank");
    toast.info("Downloading contract bundle...");
  };

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName={candidateProfile.name} profileSettingsUrl="/candidate/profile-settings-v2" dashboardUrl="/candidate-dashboard-contractor-v3" />

          <div className="flex-1">
            <AgentLayout context="Contractor Dashboard v3">
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
                  <AgentHeader title={`Welcome back, ${candidateProfile.firstName}!`} subtitle="Candidate Dashboard — Contractor" showPulse={true} isActive={false} showInput={false} />

                  {/* Main Content */}
                  <div className="space-y-6">
                    {/* Documents & Certificate Section */}
                    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
                        <CardTitle className="text-lg">Your documents</CardTitle>
                        <CardDescription>Your signed documents are ready to download or view.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {/* Signed Contract Bundle */}
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="h-5 w-5 text-accent-green-text flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Signed Contract Bundle</p>
                                <p className="text-xs text-muted-foreground">Your final HR-approved contract bundle.</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleDownloadContract} className="flex-shrink-0 ml-4">
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Invoice Card - T-5 Confirmation */}
                    <F42v3_UpcomingInvoiceCard />
                  </div>
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F42v3_ContractorDashboardPage;