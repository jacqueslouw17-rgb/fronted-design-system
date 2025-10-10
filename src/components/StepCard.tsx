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
          <Badge className="bg-primary text-primary-foreground">
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isExpanded) {
    return (
      <Card className="p-5 border-primary shadow-lg card-expand">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
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
      className={`p-4 transition-all duration-200 cursor-pointer ${
        status === "completed"
          ? "bg-success/5 hover:bg-success/10 border-success/20"
          : "hover:bg-muted/50 hover:shadow-md"
      } ${status === "pending" ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-semibold ${
              status === "completed"
                ? "bg-success text-success-foreground"
                : status === "active"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {status === "completed" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              stepNumber
            )}
          </div>
          <p className="font-medium text-foreground">{title}</p>
        </div>
        {getStatusBadge()}
      </div>
    </Card>
  );
};

export default StepCard;
