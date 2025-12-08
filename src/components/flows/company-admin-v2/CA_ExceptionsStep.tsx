// Flow 6 v2 - Company Admin Dashboard - Exceptions Step (Step 2)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, AlertCircle, Check, RefreshCw, ChevronLeft, ChevronRight, Eye, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_InPlaceException } from "./CA_InPlaceTypes";

interface CA_ExceptionsStepProps {
  exceptions: CA_InPlaceException[];
  onRecheck: () => void;
  onResolve: (exceptionId: string) => void;
  onViewWorker: (workerId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const CA_ExceptionsStep: React.FC<CA_ExceptionsStepProps> = ({
  exceptions,
  onRecheck,
  onResolve,
  onViewWorker,
  onContinue,
  onBack
}) => {
  const [isRechecking, setIsRechecking] = useState(false);

  const blockingExceptions = exceptions.filter(e => e.isBlocking && !e.resolved);
  const fyiExceptions = exceptions.filter(e => !e.isBlocking && !e.resolved);
  const resolvedExceptions = exceptions.filter(e => e.resolved);

  const hasBlockers = blockingExceptions.length > 0;

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "missing_bank": return "Missing Bank Details";
      case "missing_tax_id": return "Missing Tax ID";
      case "expired_rtw": return "Expired RTW";
      case "negative_net": return "Negative Net Pay";
      case "bonus_threshold": return "Bonus > Threshold";
      case "overtime_cap": return "Overtime > Cap";
      case "manual_mode": return "Manual Mode";
      default: return type;
    }
  };

  const handleRecheck = async () => {
    setIsRechecking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onRecheck();
    setIsRechecking(false);
  };

  const ExceptionCard = ({ exception, isBlocking }: { exception: CA_InPlaceException; isBlocking: boolean }) => (
    <div className={cn(
      "flex items-start justify-between p-4 rounded-lg border transition-colors",
      isBlocking 
        ? "border-red-500/30 bg-red-500/5" 
        : "border-amber-500/30 bg-amber-500/5"
    )}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 mt-0.5">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {getInitials(exception.workerName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{exception.workerName}</p>
            <span className="text-xs text-muted-foreground">{exception.workerCountry}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{getTypeLabel(exception.type)}</p>
          <p className="text-sm text-foreground/80 mt-1">{exception.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {exception.canResolve ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => onResolve(exception.id)}
          >
            <Check className="h-3 w-3 mr-1" />
            Mark Resolved
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => onViewWorker(exception.workerId)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open Profile
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => onViewWorker(exception.workerId)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      {hasBlockers && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {blockingExceptions.length} blocking exception{blockingExceptions.length !== 1 ? "s" : ""} must be resolved before execution
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Resolve these issues or override them with justification to proceed.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRecheck} disabled={isRechecking}>
            <RefreshCw className={cn("h-4 w-4 mr-1", isRechecking && "animate-spin")} />
            Re-check
          </Button>
        </div>
      )}

      {/* Blocking Exceptions */}
      {blockingExceptions.length > 0 && (
        <Card className="border border-red-500/20 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-semibold text-foreground">Blocking Exceptions</h4>
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                {blockingExceptions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockingExceptions.map((exception) => (
              <ExceptionCard key={exception.id} exception={exception} isBlocking={true} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* FYI Exceptions */}
      {fyiExceptions.length > 0 && (
        <Card className="border border-amber-500/20 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-foreground">FYI Exceptions</h4>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                {fyiExceptions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fyiExceptions.map((exception) => (
              <ExceptionCard key={exception.id} exception={exception} isBlocking={false} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Clear State */}
      {blockingExceptions.length === 0 && fyiExceptions.length === 0 && (
        <Card className="border border-accent-green-outline/30 bg-accent-green-fill/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent-green-fill">
                <CheckCircle2 className="h-6 w-6 text-accent-green-text" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">All clear!</p>
                <p className="text-sm text-muted-foreground">No exceptions found. You can proceed to execute the batch.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved Exceptions (collapsed) */}
      {resolvedExceptions.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 inline mr-1 text-accent-green-text" />
          {resolvedExceptions.length} exception{resolvedExceptions.length !== 1 ? "s" : ""} resolved
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous: Review
        </Button>
        <Button onClick={onContinue} disabled={hasBlockers}>
          Continue to Execute
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
