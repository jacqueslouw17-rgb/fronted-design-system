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
        return null;
      case "active":
        return (
          <Badge variant="secondary" className="bg-[rgba(100,150,255,0.12)] text-[#2a4fa5] border-0 font-medium rounded-md px-2.5 py-1 transition-all duration-250 ease-out animate-fade-in motion-reduce:transition-none">
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
    const activeClass = status === 'active' && !isLocked
      ? 'bg-[rgba(240,245,255,0.6)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]'
      : 'bg-white/30';
    const borderClass = 'border-white/40';
      
    return (
      <div className="transition-all duration-300 ease-out overflow-hidden relative z-10 motion-reduce:transition-none">
        <Card className={`p-4 sm:p-5 ${borderClass} ${activeClass} backdrop-blur-md hover:bg-[rgba(240,245,255,0.3)] transition-all duration-200 ease-out shadow-[0_8px_16px_rgba(255,255,255,0.1)] relative isolate focus:outline-none focus-visible:outline-none animate-fade-in origin-top`}>
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

          <div className="space-y-4 animate-fade-in motion-reduce:animate-none">
            {children}
          </div>
        </Card>
      </div>
    );
  }

  const isDisabled = isLocked || status === "inactive" || status === "pending";
  
  return (
    <div className="transition-all duration-300 ease-out relative z-10 motion-reduce:transition-none animate-fade-in">
      <Card
        className={`p-3 sm:p-4 transition-all duration-200 ease-out group border-white/10 bg-white/5 backdrop-blur-md relative isolate touch-manipulation focus:outline-none focus-visible:outline-none origin-top motion-reduce:transition-none ${
          isDisabled 
            ? "opacity-40 cursor-not-allowed" 
            : "cursor-pointer hover:bg-[rgba(240,245,255,0.3)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
        }`}
        onClick={!isDisabled ? onClick : undefined}
        title={isLocked ? "Complete current step first" : undefined}
      >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div
            className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-250 flex-shrink-0 motion-reduce:transition-none ${
              status === "completed"
                ? "bg-primary/20 text-primary"
                : status === "active"
                ? "bg-white/15 text-foreground group-hover:bg-white/20"
                : "bg-white/8 text-foreground/50"
            }`}
          >
            {status === "completed" ? (
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-250 motion-reduce:transition-none" />
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
