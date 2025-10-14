import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info, ChevronDown, Upload, FileText, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComplianceStatus = "pending" | "processing" | "passed" | "breach" | "na" | "override";

interface VerificationEvent {
  date: string;
  action: string;
  verifiedBy: string;
}

interface ComplianceChecklistBlockProps {
  label: string;
  status: ComplianceStatus;
  tooltipText?: string;
  genieHint?: string;
  verificationHistory?: VerificationEvent[];
  tags?: string[];
  onUpload?: () => void;
  onReVerify?: () => void;
  onViewDocs?: () => void;
  className?: string;
}

const ComplianceChecklistBlock = ({
  label,
  status,
  tooltipText,
  genieHint,
  verificationHistory = [],
  tags,
  onUpload,
  onReVerify,
  onViewDocs,
  className,
}: ComplianceChecklistBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case "passed":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Passed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>;
      case "breach":
        return <Badge variant="destructive">Breach</Badge>;
      case "na":
        return <Badge variant="outline" className="text-muted-foreground">N/A</Badge>;
      case "override":
        return <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          Override
        </Badge>;
      default:
        return null;
    }
  };

  const isChecked = status === "passed" || status === "override";
  const isDisabled = status === "na" || status === "processing";

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={cn(
        "transition-all",
        status === "breach" && "border-destructive/50",
        status === "na" && "opacity-60",
        className
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={isChecked}
                disabled={isDisabled}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  {tooltipText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {genieHint && (
                  <p className="text-sm text-muted-foreground italic">
                    🧞 {genieHint}
                  </p>
                )}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {onViewDocs && (
                <Button variant="outline" size="sm" onClick={onViewDocs}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Docs
                </Button>
              )}
              {onUpload && status !== "passed" && (
                <Button variant="outline" size="sm" onClick={onUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}
              {onReVerify && (
                <Button variant="outline" size="sm" onClick={onReVerify}>
                  Re-Verify
                </Button>
              )}
            </div>

            {/* Verification History */}
            {verificationHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Verification History</h4>
                <div className="space-y-2">
                  {verificationHistory.map((event, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-muted-foreground">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.verifiedBy} • {event.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ComplianceChecklistBlock;
