// Flow 6 v2 - Company Admin Dashboard - Resolve Items Drawer (Local to this flow only)

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Eye, Clock, CheckCircle2, Paperclip, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_Adjustment, CA_LeaveChange } from "./CA_PayrollTypes";
import { toast } from "sonner";

interface CA_ResolveItemsDrawerProps {
  open: boolean;
  onClose: () => void;
  adjustments: CA_Adjustment[];
  leaveChanges: CA_LeaveChange[];
  onApproveAdjustment: (id: string) => void;
  onRejectAdjustment: (id: string) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onViewWorker: (workerId: string) => void;
  autoApproveThreshold: number; // Amount threshold for auto-approve
}

export const CA_ResolveItemsDrawer: React.FC<CA_ResolveItemsDrawerProps> = ({
  open,
  onClose,
  adjustments,
  leaveChanges,
  onApproveAdjustment,
  onRejectAdjustment,
  onApproveLeave,
  onRejectLeave,
  onViewWorker,
  autoApproveThreshold
}) => {
  const [activeTab, setActiveTab] = useState<"adjustments" | "leave">("adjustments");

  const pendingAdjustments = adjustments.filter(a => a.status === "pending");
  const pendingLeave = leaveChanges.filter(l => l.status === "pending");
  const autoApprovableAdjustments = pendingAdjustments.filter(a => Math.abs(a.amount) <= autoApproveThreshold);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const formatCurrency = (amount: number, currency: string) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${currency} ${Math.abs(amount).toLocaleString()}`;
  };

  const getTypeLabel = (type: CA_Adjustment["type"]) => {
    switch (type) {
      case "overtime": return "Overtime";
      case "expense": return "Expense";
      case "bonus": return "Bonus";
      case "correction": return "Correction";
      case "commission": return "Commission";
      case "additional_hours": return "Additional Hours";
      default: return type;
    }
  };

  const getLeaveTypeLabel = (type: CA_LeaveChange["leaveType"]) => {
    switch (type) {
      case "annual": return "Annual Leave";
      case "sick": return "Sick Leave";
      case "unpaid": return "Unpaid Leave";
      case "parental": return "Parental Leave";
      default: return "Other Leave";
    }
  };

  const handleApproveAll = () => {
    autoApprovableAdjustments.forEach(adj => {
      onApproveAdjustment(adj.id);
    });
    toast.success(`Auto-approved ${autoApprovableAdjustments.length} items within policy threshold`);
  };

  const allClear = pendingAdjustments.length === 0 && pendingLeave.length === 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/30">
          <SheetTitle className="text-lg font-semibold">Resolve items</SheetTitle>
          
          {/* Top bar actions */}
          {autoApprovableAdjustments.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
              onClick={handleApproveAll}
            >
              <Sparkles className="h-4 w-4" />
              Approve All ≤ {autoApproveThreshold} ({autoApprovableAdjustments.length})
            </Button>
          )}
        </SheetHeader>

        {allClear ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="rounded-full bg-accent-green-fill/20 p-4 mb-4">
              <CheckCircle2 className="h-10 w-10 text-accent-green-text" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground text-center">
              You can create the payment batch.
            </p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2">
                <TabsTrigger value="adjustments" className="gap-2">
                  Adjustments
                  {pendingAdjustments.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 min-w-5 px-1">
                      {pendingAdjustments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="leave" className="gap-2">
                  Leave
                  {pendingLeave.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 min-w-5 px-1">
                      {pendingLeave.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                {/* Adjustments Tab */}
                <TabsContent value="adjustments" className="px-6 py-4 space-y-3 m-0">
                  {pendingAdjustments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No pending adjustments
                    </div>
                  ) : (
                    pendingAdjustments.map(adj => (
                      <Card key={adj.id} className="border-border/30 bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(adj.workerName)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium truncate">{adj.workerName}</span>
                                <span className="text-xs text-muted-foreground">{adj.workerCountryFlag}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {adj.workerType === "employee" ? "Employee" : "Contractor"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-[10px]">
                                  {getTypeLabel(adj.type)}
                                </Badge>
                                <span className={cn(
                                  "text-sm font-semibold",
                                  adj.amount >= 0 ? "text-accent-green-text" : "text-destructive"
                                )}>
                                  {formatCurrency(adj.amount, adj.currency)}
                                </span>
                                {adj.hasReceipt && (
                                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {adj.description}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => onViewWorker(adj.workerId)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                              onClick={() => onRejectAdjustment(adj.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => onApproveAdjustment(adj.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Leave Tab */}
                <TabsContent value="leave" className="px-6 py-4 space-y-3 m-0">
                  {pendingLeave.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No pending leave requests
                    </div>
                  ) : (
                    pendingLeave.map(leave => (
                      <Card key={leave.id} className="border-border/30 bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(leave.workerName)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium truncate">{leave.workerName}</span>
                                <span className="text-xs text-muted-foreground">{leave.workerCountryFlag}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {leave.workerType === "employee" ? "Employee" : "Contractor"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-[10px]">
                                  {getLeaveTypeLabel(leave.leaveType)}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {leave.days} day{leave.days !== 1 ? "s" : ""}
                                </span>
                                {leave.impactAmount !== 0 && (
                                  <span className={cn(
                                    "text-xs",
                                    leave.impactAmount < 0 ? "text-destructive" : "text-accent-green-text"
                                  )}>
                                    ({formatCurrency(leave.impactAmount, leave.currency)})
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground">
                                {leave.startDate === leave.endDate 
                                  ? leave.startDate 
                                  : `${leave.startDate} – ${leave.endDate}`}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {leave.description}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => onViewWorker(leave.workerId)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                              onClick={() => onRejectLeave(leave.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => onApproveLeave(leave.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <SheetFooter className="px-6 py-4 border-t border-border/30">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
