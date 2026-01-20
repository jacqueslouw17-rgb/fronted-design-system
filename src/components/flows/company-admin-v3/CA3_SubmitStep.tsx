import React from "react";
import { Send, Users, Briefcase, CheckCircle2, Lock, ArrowRight, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CA3_SubmitStepProps {
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount?: number;
  warningCount?: number;
  onSubmit: () => void;
}

export const CA3_SubmitStep: React.FC<CA3_SubmitStepProps> = ({
  totalCost,
  employeeCount,
  contractorCount,
  currencyCount = 3,
  warningCount = 0,
  onSubmit,
}) => {
  const totalWorkers = employeeCount + contractorCount;

  return (
    <div className="space-y-8">
      {/* Hero section - Ready to submit */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-8">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Status + Total */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green-fill/10 border border-accent-green-fill/20">
              <Sparkles className="h-3.5 w-3.5 text-accent-green-text" />
              <span className="text-xs font-medium text-accent-green-text">Ready to submit</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total payout</p>
              <p className="text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">{totalCost}</p>
            </div>
            
            {/* Quick stats */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground leading-none">{employeeCount}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground leading-none">{contractorCount}</p>
                  <p className="text-xs text-muted-foreground">Contractors</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground leading-none">{currencyCount}</p>
                  <p className="text-xs text-muted-foreground">Currencies</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: CTA */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            <Button 
              onClick={onSubmit} 
              size="lg" 
              className="h-14 px-8 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 group"
            >
              <Send className="h-5 w-5 mr-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Submit to Fronted
              <ArrowRight className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Payments processed within 2-3 business days
            </p>
          </div>
        </div>
      </div>

      {/* What happens next - Minimal timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative p-5 rounded-xl bg-muted/5 border border-border/10 hover:bg-muted/10 transition-colors">
          <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
            1
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-green-fill/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Processing starts</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fronted handles all payments and compliance automatically
          </p>
        </div>
        
        <div className="group relative p-5 rounded-xl bg-muted/5 border border-border/10 hover:bg-muted/10 transition-colors">
          <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-muted/30 text-muted-foreground text-xs font-medium flex items-center justify-center">
            2
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center mb-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Rates locked</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            FX rates frozen at submission — no surprises
          </p>
        </div>
        
        <div className="group relative p-5 rounded-xl bg-muted/5 border border-border/10 hover:bg-muted/10 transition-colors">
          <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-muted/30 text-muted-foreground text-xs font-medium flex items-center justify-center">
            3
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center mb-3">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Track progress</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Real-time status updates on the next screen
          </p>
        </div>
      </div>
    </div>
  );
};

export default CA3_SubmitStep;
