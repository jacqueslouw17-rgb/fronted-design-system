import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

type StepStatus = "inactive" | "pending" | "active" | "completed";

interface StepCardProps {
  title: string;
  status: StepStatus;
  stepNumber: number;
  isExpanded?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  headerId?: string;
  isLocked?: boolean;
}

const StepCard = ({
  title,
  status,
  stepNumber,
  isExpanded = false,
  onClick,
  children,
  headerId,
  isLocked = false,
}: StepCardProps) => {
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 font-normal">
          Locked
        </Badge>
      );
    }
    
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
      case "inactive":
      case "pending":
        return null;
      default:
        return null;
    }
  };

  if (isExpanded) {
    const borderClass = 'border-white/40';
      
    return (
      <div className="transition-all duration-500 ease-in-out overflow-hidden relative z-10">
        <Card className={`p-4 sm:p-5 ${borderClass} bg-white/30 backdrop-blur-md hover:bg-white/35 transition-colors duration-200 shadow-[0_8px_16px_rgba(255,255,255,0.1)] relative isolate focus:outline-none focus-visible:outline-none`}>
          <div 
            className="flex justify-between items-center mb-3 sm:mb-4 cursor-pointer" 
            onClick={onClick}
            data-step-header
            id={headerId}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                status === "completed" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-white/25 text-foreground"
              }`}>
                {status === "completed" ? (
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                ) : (
                  stepNumber
                )}
              </div>
              <h3 className={`font-semibold text-sm sm:text-base truncate ${status === "completed" ? "text-foreground/70" : "text-foreground"}`}>{title}</h3>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getStatusBadge()}
            </div>
          </div>

          <div className="space-y-4 animate-fade-in">
            {children}
          </div>
        </Card>
      </div>
    );
  }

  const isDisabled = isLocked || status === "inactive" || status === "pending";
  
  return (
    <div className="transition-all duration-500 ease-in-out relative z-10">
      <Card
        className={`p-3 sm:p-4 transition-all duration-500 ease-in-out group border-white/10 bg-white/5 backdrop-blur-md relative isolate touch-manipulation focus:outline-none focus-visible:outline-none ${
          isDisabled 
            ? "opacity-40 cursor-not-allowed" 
            : "cursor-pointer hover:bg-white/10"
        }`}
        onClick={!isDisabled ? onClick : undefined}
        title={isLocked ? "Complete current step first" : undefined}
      >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div
            className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 flex-shrink-0 ${
              status === "completed"
                ? "bg-primary/20 text-primary"
                : status === "active"
                ? "bg-white/15 text-foreground group-hover:bg-white/20"
                : "bg-white/8 text-foreground/50"
            }`}
          >
            {status === "completed" ? (
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            ) : (
              stepNumber
            )}
          </div>
          <p className={`font-medium text-xs sm:text-sm truncate ${
            status === "completed" 
              ? "text-foreground/70" 
              : status === "active"
              ? "text-foreground"
              : "text-foreground"
          }`}>{title}</p>
        </div>
        <div className="flex-shrink-0">
          {getStatusBadge()}
        </div>
      </div>
    </Card>
    </div>
  );
};

export default StepCard;
