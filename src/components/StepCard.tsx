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
      <div className="transition-all duration-500 ease-in-out overflow-hidden">
        <Card className="p-5 border-white/40 bg-white/30 backdrop-blur-md hover:border-white/50 hover:bg-white/35">
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={onClick}>
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-white/25 text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                {stepNumber}
              </div>
              <h3 className={`font-semibold text-base ${status === "completed" ? "text-foreground/70" : "text-foreground"}`}>{title}</h3>
            </div>
            {getStatusBadge()}
          </div>

          <div className="space-y-4 animate-fade-in">
            {children}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="transition-all duration-500 ease-in-out">
      <Card
        className={`p-4 transition-all duration-500 ease-in-out cursor-pointer group border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 ${
          status === "pending" ? "opacity-40 cursor-default" : ""}`}
        onClick={status !== "pending" ? onClick : undefined}
      >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 flex-shrink-0 ${
              status === "completed"
                ? "bg-primary/20 text-primary"
                : status === "active"
                ? "bg-white/15 text-foreground group-hover:bg-white/20"
                : "bg-white/8 text-foreground/50"
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
              ? "text-foreground/70" 
              : status === "active"
              ? "text-foreground"
              : "text-foreground"
          }`}>{title}</p>
        </div>
        {getStatusBadge()}
      </div>
    </Card>
    </div>
  );
};

export default StepCard;
