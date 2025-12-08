import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Lock } from "lucide-react";

interface CA_UpcomingPayrollCardProps {
  periodLabel: string;
  opensOn: string;
  nextPayrollRun: string;
}

export const CA_UpcomingPayrollCard: React.FC<CA_UpcomingPayrollCardProps> = ({
  periodLabel,
  opensOn,
  nextPayrollRun,
}) => {
  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
      <CardContent className="py-12 px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-blue-500/10">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Upcoming Payroll: {periodLabel}
            </h3>
            <p className="text-sm text-muted-foreground">
              This payroll period is not yet open for review
            </p>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Opens on</p>
                <p className="text-sm font-medium text-foreground">{opensOn}</p>
              </div>
            </div>
            
            <div className="w-px h-10 bg-border" />
            
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Payout date</p>
                <p className="text-sm font-medium text-foreground">{nextPayrollRun}</p>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="mt-4 bg-blue-500/10 text-blue-600 border-blue-500/30">
            Opens T-7
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
