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
  subtitle?: string;
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
  subtitle,
}: StepCardProps) => {
  const getStatusBadge = () => {
    if (isLocked) {
      return null;
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
        <Card className={`pt-2 pb-4 px-4 sm:pt-2 sm:pb-5 sm:px-5 ${borderClass} ${activeClass} backdrop-blur-md hover:bg-[rgba(240,245,255,0.3)] transition-all duration-200 ease-out shadow-[0_8px_16px_rgba(255,255,255,0.1)] relative isolate focus:outline-none focus-visible:outline-none animate-fade-in origin-top`}>
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
          {status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden />
          ) : (
            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
              {stepNumber}
            </div>
          )}
          <div className="truncate">
            <h3 className="text-sm font-medium text-foreground/90 truncate">{title}</h3>
            {subtitle && !isExpanded && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
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
