import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useNavigate } from "react-router-dom";
import FloatingKurtButton from "@/components/FloatingKurtButton";

const PayrollFXEngine = () => {
  const navigate = useNavigate();

  return (
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Topbar userName="Admin" profileSettingsUrl="/admin/profile-settings" dashboardUrl="/flows/admin-dashboard" />

          <main className="flex-1 bg-gradient-to-br from-background via-background/95 to-primary/5 text-foreground relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]" />
              <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                   style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
              <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                   style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-20 sm:pb-32 space-y-6 sm:space-y-8 relative z-10">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/flows/admin-dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>

              {/* Empty State - Payroll starts from Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto mt-20"
              >
                <Card className="border-dashed border-border/40 bg-card/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="rounded-full bg-primary/10 p-6 mb-6">
                      <DollarSign className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Payroll Engine Ready</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
                      The payroll & FX execution engine is ready to use. Start a payroll cycle from your dashboard to manage contractor payments, lock FX rates, and track transfers.
                    </p>
                    <Button onClick={() => navigate('/flows/admin-dashboard')} size="lg">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>

          {/* Floating Kurt Button for mobile */}
          <FloatingKurtButton />
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default PayrollFXEngine;
