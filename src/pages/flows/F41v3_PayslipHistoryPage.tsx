/**
 * Flow 4.1 — Employee Dashboard v3
 * Previous Payslips History Page
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import Topbar from '@/components/dashboard/Topbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RoleLensProvider } from '@/contexts/RoleLensContext';
import { AgentHeader } from '@/components/agent/AgentHeader';
import { AgentLayout } from '@/components/agent/AgentLayout';

const F41v3_PayslipHistoryPage = () => {
  const navigate = useNavigate();

  const candidateProfile = {
    name: 'Maria Santos',
    firstName: 'Maria',
  };

  // Mock payslips data - empty for now to show empty state
  const payslips: Array<{
    id: string;
    period: string;
    payDate: string;
    netPay: number;
    currency: string;
  }> = [];

  const handleBack = () => {
    navigate('/candidate-dashboard-employee-v3');
  };

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar
            userName={candidateProfile.name}
            profileSettingsUrl="/candidate/profile-settings-v2"
            dashboardUrl="/candidate-dashboard-employee-v3"
          />

          <div className="flex-1">
            <AgentLayout context="Employee Payslip History">
              <main className="flex-1 min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
                {/* Static background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                  <div
                    className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                    style={{
                      background:
                        'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))',
                    }}
                  />
                  <div
                    className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                    style={{
                      background:
                        'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))',
                    }}
                  />
                </div>

                <div className="max-w-5xl mx-auto p-8 pb-32 space-y-6 relative z-10">
                  {/* Back button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>

                  {/* Agent Header */}
                  <AgentHeader
                    title="Previous payslips"
                    subtitle="View and download your past payslips"
                    showPulse={false}
                    isActive={false}
                    showInput={false}
                  />

                  {/* Main Content */}
                  <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
                      <CardTitle className="text-lg">Payslip history</CardTitle>
                      <CardDescription>
                        All your payslips from previous pay periods.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {payslips.length === 0 ? (
                        /* Empty state */
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            No payslips yet
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            You don't have any payslips yet. Once your first payroll is processed,
                            you'll see them here.
                          </p>
                        </div>
                      ) : (
                        /* Payslips list - for future use */
                        <div className="space-y-3">
                          {payslips.map((payslip) => (
                            <div
                              key={payslip.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {payslip.period}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Paid on {payslip.payDate}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-foreground">
                                  {new Intl.NumberFormat('en-PH', {
                                    style: 'currency',
                                    currency: payslip.currency,
                                  }).format(payslip.netPay)}
                                </p>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                  Download PDF
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </main>
            </AgentLayout>
          </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default F41v3_PayslipHistoryPage;
