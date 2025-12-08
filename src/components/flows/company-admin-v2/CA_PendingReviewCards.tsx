// Flow 6 v2 - Company Admin Dashboard - Pending Review Cards (Leave + Adjustments)

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, DollarSign, Check, X, Eye, ChevronRight, Receipt, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_LeaveRequest, CA_PayAdjustment } from "./CA_InPlaceTypes";

interface CA_LeaveReviewCardProps {
  requests: CA_LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
  onViewAll: () => void;
}

export const CA_LeaveReviewCard: React.FC<CA_LeaveReviewCardProps> = ({
  requests,
  onApprove,
  onReject,
  onView,
  onViewAll
}) => {
  const pendingRequests = requests.filter(r => r.status === "pending");
  const displayRequests = requests.slice(0, 5);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "annual": return "Annual Leave";
      case "sick": return "Sick Leave";
      case "unpaid": return "Unpaid Leave";
      case "parental": return "Parental Leave";
      default: return type;
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <Card className="border border-border/40 shadow-sm bg-accent-green-fill/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
            <div>
              <p className="text-sm font-medium text-foreground">Leave requests</p>
              <p className="text-xs text-muted-foreground">All clear – no pending requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Leave requests</h4>
            <Badge variant="secondary" className="text-xs">
              {pendingRequests.length} pending
            </Badge>
          </div>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onViewAll}>
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {displayRequests.map((request) => (
          <div 
            key={request.id} 
            className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/30 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(request.workerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{request.workerName}</p>
                  <span className="text-xs text-muted-foreground">{request.workerCountryFlag}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getLeaveTypeLabel(request.leaveType)} · {request.days} days · {request.startDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {request.status === "pending" ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-green-600 hover:bg-green-500/10"
                    onClick={() => onApprove(request.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-red-600 hover:bg-red-500/10"
                    onClick={() => onReject(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    request.status === "approved" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
                    request.status === "rejected" && "bg-red-500/10 text-red-600 border-red-500/30"
                  )}
                >
                  {request.status}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => onView(request.id)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

interface CA_AdjustmentReviewCardProps {
  adjustments: CA_PayAdjustment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
  onViewAll: () => void;
}

export const CA_AdjustmentReviewCard: React.FC<CA_AdjustmentReviewCardProps> = ({
  adjustments,
  onApprove,
  onReject,
  onView,
  onViewAll
}) => {
  const pendingAdjustments = adjustments.filter(a => a.status === "pending");
  const displayAdjustments = adjustments.slice(0, 5);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "overtime": return "Overtime";
      case "expense": return "Expense";
      case "bonus": return "Bonus";
      case "correction": return "Correction";
      default: return type;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const prefix = amount >= 0 ? "+" : "";
    return `${prefix}${currency} ${Math.abs(amount).toLocaleString()}`;
  };

  if (pendingAdjustments.length === 0) {
    return (
      <Card className="border border-border/40 shadow-sm bg-accent-green-fill/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
            <div>
              <p className="text-sm font-medium text-foreground">Pay adjustments</p>
              <p className="text-xs text-muted-foreground">All clear – no pending adjustments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Pay adjustments</h4>
            <Badge variant="secondary" className="text-xs">
              {pendingAdjustments.length} pending
            </Badge>
          </div>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onViewAll}>
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {displayAdjustments.map((adjustment) => (
          <div 
            key={adjustment.id} 
            className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/30 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(adjustment.workerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{adjustment.workerName}</p>
                  <span className="text-xs text-muted-foreground">{adjustment.workerCountryFlag}</span>
                  {adjustment.hasReceipt && (
                    <Receipt className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTypeLabel(adjustment.type)} · {adjustment.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-sm font-semibold",
                adjustment.amount >= 0 ? "text-green-600" : "text-amber-600"
              )}>
                {formatAmount(adjustment.amount, adjustment.currency)}
              </span>
              <div className="flex items-center gap-1">
                {adjustment.status === "pending" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-green-600 hover:bg-green-500/10"
                      onClick={() => onApprove(adjustment.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-red-600 hover:bg-red-500/10"
                      onClick={() => onReject(adjustment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      adjustment.status === "approved" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
                      adjustment.status === "rejected" && "bg-red-500/10 text-red-600 border-red-500/30"
                    )}
                  >
                    {adjustment.status}
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => onView(adjustment.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
