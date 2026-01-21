/**
 * F1v4_ExceptionFixDrawer - Contextual drawer for resolving exceptions
 * 
 * Shows exception-specific actions with minimal, focused UI
 */

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Clock,
  Wrench,
  Send,
  Plus,
  Eye,
  RotateCcw,
  BellRing,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export type ExceptionCategory = "bank" | "submission" | "compliance" | "data";
export type ExceptionStatus = "active" | "pending" | "requested" | "snoozed" | "acknowledged" | "resolved";

export interface Exception {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  type: "blocking" | "warning";
  title: string;
  description: string;
  suggestedFix: string;
  category: ExceptionCategory;
  status: ExceptionStatus;
}

interface F1v4_ExceptionFixDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exception: Exception | null;
  onStatusChange: (exceptionId: string, newStatus: ExceptionStatus) => void;
}

const categoryIcons: Record<ExceptionCategory, React.ElementType> = {
  bank: CreditCard,
  submission: FileText,
  compliance: Clock,
  data: Wrench,
};

const countryFlags: Record<string, string> = {
  Norway: "🇳🇴",
  Philippines: "🇵🇭",
  Singapore: "🇸🇬",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Germany: "🇩🇪",
  France: "🇫🇷",
};

const getBlockingReason = (category: ExceptionCategory): string => {
  switch (category) {
    case "bank":
      return "Payment cannot be processed without verified bank account details.";
    case "submission":
      return "Contractor payment requires approved timesheet for this period.";
    case "compliance":
      return ""; // Not blocking
    case "data":
      return ""; // Not blocking
    default:
      return "";
  }
};

export const F1v4_ExceptionFixDrawer: React.FC<F1v4_ExceptionFixDrawerProps> = ({
  open,
  onOpenChange,
  exception,
  onStatusChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!exception) return null;

  const CategoryIcon = categoryIcons[exception.category];
  const isBlocking = exception.type === "blocking";
  const blockingReason = getBlockingReason(exception.category);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleAction = async (
    action: string,
    newStatus: ExceptionStatus,
    toastMessage: string
  ) => {
    setIsLoading(true);
    setLoadingAction(action);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    onStatusChange(exception.id, newStatus);

    toast({
      description: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
          <span>{toastMessage}</span>
        </div>
      ),
    });

    setIsLoading(false);
    setLoadingAction(null);
    onOpenChange(false);
  };

  // Render action buttons based on exception category
  const renderActions = () => {
    switch (exception.category) {
      case "bank":
        return (
          <div className="space-y-3">
            <Button
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "request",
                  "pending",
                  `Bank details requested from ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "request" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Request bank details
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "manual",
                  "resolved",
                  `Bank details added for ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "manual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add bank details manually
            </Button>
          </div>
        );

      case "submission":
        return (
          <div className="space-y-3">
            <Button
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "remind",
                  "pending",
                  `Reminder sent to ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "remind" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
              Send reminder
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "manual",
                  "resolved",
                  `Timesheet added manually for ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "manual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add manually
            </Button>
          </div>
        );

      case "compliance":
        return (
          <div className="space-y-3">
            <Button
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "request",
                  "requested",
                  `Document request sent to ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "request" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Request updated document
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "snooze",
                  "snoozed",
                  `Snoozed for ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "snooze" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Snooze
            </Button>
          </div>
        );

      case "data":
        return (
          <div className="space-y-3">
            <Button
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "review",
                  "acknowledged",
                  `Override confirmed for ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "review" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Confirm override
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={() =>
                handleAction(
                  "revert",
                  "resolved",
                  `Override reverted for ${exception.workerName}`
                )
              }
              disabled={isLoading}
            >
              {loadingAction === "revert" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Revert override
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base font-semibold">
            Resolve Exception
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Worker Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(exception.workerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">
                {exception.workerName}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{countryFlags[exception.workerCountry] || ""}</span>
                {exception.workerCountry}
              </p>
            </div>
          </div>

          <Separator />

          {/* Exception Details */}
          <div className="space-y-4">
            {/* What's wrong */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon
                  className={cn(
                    "h-4 w-4",
                    isBlocking ? "text-destructive" : "text-amber-600"
                  )}
                />
                <p className="text-sm font-medium text-foreground">
                  {exception.title}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 h-4 font-medium",
                    isBlocking
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}
                >
                  {isBlocking ? "Blocking" : "Warning"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {exception.description}
              </p>
            </div>

            {/* Why it blocks */}
            {isBlocking && blockingReason && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground/80">{blockingReason}</p>
              </div>
            )}

            {/* Suggested fix */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Suggested Fix
              </p>
              <p className="text-sm text-foreground">{exception.suggestedFix}</p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Actions
            </p>
            {renderActions()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default F1v4_ExceptionFixDrawer;
