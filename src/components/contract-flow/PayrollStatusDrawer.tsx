import React from "react";
import { CheckCircle2, Clock, Circle, AlertCircle, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PayrollChecklistItem {
  id: string;
  label: string;
  status: "verified" | "pending" | "todo" | "issue";
  verifiedBy?: string;
  verifiedAt?: string;
  details?: string;
}

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  employmentType?: "contractor" | "employee";
  payrollChecklist?: PayrollChecklistItem[];
  payrollProgress?: number;
}

interface PayrollStatusDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor | null;
}

const getStatusIcon = (status: PayrollChecklistItem["status"]) => {
  switch (status) {
    case "verified":
      return <CheckCircle2 className="h-4 w-4 text-accent-green-text" />;
    case "pending":
      return <Clock className="h-4 w-4 text-accent-yellow-text" />;
    case "issue":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: PayrollChecklistItem["status"]) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">Verified</Badge>;
    case "pending":
      return <Badge className="bg-accent-yellow-fill text-accent-yellow-text border-accent-yellow-outline/30">Pending</Badge>;
    case "issue":
      return <Badge variant="destructive">Issue</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">Todo</Badge>;
  }
};

export const PayrollStatusDrawer: React.FC<PayrollStatusDrawerProps> = ({
  open,
  onOpenChange,
  contractor,
}) => {
  if (!contractor) return null;

  const progress = contractor.payrollProgress || 0;
  const completedItems = contractor.payrollChecklist?.filter(item => item.status === "verified").length || 0;
  const totalItems = contractor.payrollChecklist?.length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="space-y-1">
            <SheetTitle className="text-2xl">Payroll Certification</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-2xl">{contractor.countryFlag}</span>
              <span>{contractor.name}</span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {progress}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedItems} of {totalItems} completed</span>
              <span>{contractor.salary}</span>
            </div>
          </div>
        </SheetHeader>

        {/* Checklist Items */}
        <div className="mt-6 space-y-3">
          {contractor.payrollChecklist?.map((item) => (
            <div
              key={item.id}
              className={cn(
                "border rounded-lg p-4 space-y-2 transition-colors",
                item.status === "verified" && "bg-accent-green-fill/10 border-accent-green-outline/30",
                item.status === "pending" && "bg-accent-yellow-fill/10 border-accent-yellow-outline/30",
                item.status === "issue" && "bg-destructive/10 border-destructive/30",
                item.status === "todo" && "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm font-medium",
                      item.status === "verified" && "line-through text-muted-foreground"
                    )}>
                      {item.label}
                    </p>
                    {item.details && (
                      <p className="text-xs text-muted-foreground">{item.details}</p>
                    )}
                    {item.status === "verified" && item.verifiedBy && (
                      <div className="flex items-center gap-1 text-xs text-accent-green-text">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified by {item.verifiedBy}</span>
                        {item.verifiedAt && (
                          <span className="text-muted-foreground">• {item.verifiedAt}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-6 border-t space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              window.location.href = '/flows/candidate-payroll-dashboard';
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Candidate Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
