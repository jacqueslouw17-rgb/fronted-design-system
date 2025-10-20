import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

type StepStatus = "pending" | "active" | "completed";

interface StepCardProps {
  title: string;
  status: StepStatus;
  stepNumber: number;
  isExpanded?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const StepCard = ({
  title,
  status,
  stepNumber,
  isExpanded = false,
  onClick,
  children,
}: StepCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-normal">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        );
      case "active":
        return (
          <Badge variant="secondary" className="bg-foreground/5 text-foreground/60 border-0 font-normal">
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isExpanded) {
    return (
      <Card className="p-5 border-border/50 hover:border-border shadow-card transition-all duration-300 animate-fade-in">
        <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={onClick}>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-foreground/8 text-foreground/50 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {stepNumber}
            </div>
            <h3 className={`font-semibold text-base ${status === "completed" ? "text-foreground/60" : "text-foreground"}`}>{title}</h3>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-4 space-y-4 animate-fade-in overflow-hidden">
          {children}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-4 transition-all duration-300 ease-in-out cursor-pointer group border-border/50 ${
        status === "completed"
          ? "bg-background hover:bg-primary/5"
          : status === "active"
          ? "bg-background hover:bg-primary/5"
          : "hover:bg-primary/5"
      } ${status === "pending" ? "opacity-40 cursor-default" : ""}`}
      onClick={status !== "pending" ? onClick : undefined}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 flex-shrink-0 ${
              status === "completed"
                ? "bg-primary/15 text-primary"
                : status === "active"
                ? "bg-foreground/12 text-foreground/70 group-hover:bg-foreground/16"
                : "bg-foreground/5 text-foreground/30"
            }`}
          >
            {status === "completed" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              stepNumber
            )}
          </div>
          <p className={`font-medium text-sm ${
            status === "completed" 
              ? "text-foreground/60" 
              : status === "active"
              ? "text-foreground"
              : "text-foreground"
          }`}>{title}</p>
        </div>
        {getStatusBadge()}
      </div>
    </Card>
  );
};

export default StepCard;
