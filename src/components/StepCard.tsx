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
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Done
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="text-muted-foreground border-border">
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isExpanded) {
    return (
      <Card className="p-5 border-border hover:border-primary/30 shadow-card hover:shadow-elevated transition-all duration-300 card-expand">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-medium">
              {stepNumber}
            </div>
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-4 space-y-4 animate-fade-in">
          {children}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-4 transition-all duration-300 cursor-pointer group ${
        status === "completed"
          ? "bg-success/5 hover:bg-success/10 border-success/20 hover:shadow-md hover:-translate-y-0.5"
          : "hover:shadow-elevated hover:-translate-y-1 hover:border-primary/20"
      } ${status === "pending" ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
              status === "completed"
                ? "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground"
                : status === "active"
                ? "bg-muted text-muted-foreground group-hover:bg-gradient-primary group-hover:text-primary-foreground"
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            {status === "completed" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              stepNumber
            )}
          </div>
          <p className="font-medium text-foreground group-hover:text-foreground transition-colors">{title}</p>
        </div>
        {getStatusBadge()}
      </div>
    </Card>
  );
};

export default StepCard;
