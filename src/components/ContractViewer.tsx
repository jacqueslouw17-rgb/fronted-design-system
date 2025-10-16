import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Clock, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractSummary {
  salary: string;
  startDate: string;
  noticePeriod: string;
  pto: string;
}

interface ContractViewerProps {
  summary: ContractSummary;
  contractUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({
  summary,
  contractUrl,
  className,
  children,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-foreground">Contract Summary</h3>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="text-sm font-semibold text-foreground">{summary.salary}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-semibold text-foreground">{summary.startDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Notice Period</p>
              <p className="text-sm font-semibold text-foreground">{summary.noticePeriod}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">PTO</p>
              <p className="text-sm font-semibold text-foreground">{summary.pto}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Document Viewer */}
      <Card className="min-h-[600px]">
        <CardContent className="p-6">
          {contractUrl ? (
            <iframe
              src={contractUrl}
              className="w-full h-[600px] rounded-lg border border-border"
              title="Contract Document"
            />
          ) : (
            <div className="prose prose-sm max-w-none text-foreground">
              {children || (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                  <p>Contract preview will appear here</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
