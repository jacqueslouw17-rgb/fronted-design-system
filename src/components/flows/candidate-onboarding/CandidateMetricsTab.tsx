import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileCheck, Shield, CheckSquare, Sparkles, Info, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricTileProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  status?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

const MetricTile = ({ icon, title, value, status, actions }: MetricTileProps) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
          <TooltipProvider>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Explain</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Ask Genie</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">See details</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {status && (
            <p className="text-xs text-muted-foreground">{status}</p>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CandidateMetricsTab = () => {
  const handleAction = (action: string) => {
    console.log("Action:", action);
    // In real app, this would trigger appropriate actions
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricTile
        icon={<Calendar className="h-5 w-5 text-primary" />}
        title="Next Pay ETA"
        value="Jan 25, 2025"
        status="Payroll setup in progress"
      />
      
      <MetricTile
        icon={<FileCheck className="h-5 w-5 text-primary" />}
        title="Contract Status"
        value="Signed"
        status="Contract active since Jan 15"
        actions={[
          { label: "View Contract", onClick: () => handleAction("view-contract") }
        ]}
      />
      
      <MetricTile
        icon={<Shield className="h-5 w-5 text-primary" />}
        title="Compliance %"
        value="60%"
        status="3 of 5 items complete"
        actions={[
          { label: "Complete Now", onClick: () => handleAction("complete-compliance") }
        ]}
      />
      
      <MetricTile
        icon={<CheckSquare className="h-5 w-5 text-primary" />}
        title="Open Tasks"
        value="2"
        status="Policy & NDA pending"
        actions={[
          { label: "View Tasks", onClick: () => handleAction("view-tasks") }
        ]}
      />
    </div>
  );
};

export default CandidateMetricsTab;
