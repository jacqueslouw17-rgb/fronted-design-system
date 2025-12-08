// Flow 6 v2 - Company Admin Dashboard - Item Detail Drawer (Local to this flow only)

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, X, Paperclip, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_BatchAdjustment, CA_BatchWorker } from "./CA_BatchTypes";

interface CA_ItemDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CA_BatchAdjustment;
  worker?: CA_BatchWorker;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const CA_ItemDetailDrawer: React.FC<CA_ItemDetailDrawerProps> = ({
  open,
  onOpenChange,
  item,
  worker,
  onApprove,
  onReject
}) => {
  if (!item && !worker) return null;

  const displayItem = item;
  const displayWorker = worker;

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "bonus": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "overtime": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "expense": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "correction": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "additional_hours": return "bg-cyan-500/20 text-cyan-600 border-cyan-500/30";
      default: return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const isClientReview = displayItem?.status === "client_review";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">
            {displayItem ? "Adjustment Details" : "Worker Details"}
          </SheetTitle>
        </SheetHeader>

        {displayItem && (
          <div className="space-y-6">
            {/* Worker Header */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-2xl">{displayItem.workerCountryFlag}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{displayItem.workerName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    displayItem.workerType === "employee" 
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                      : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                  )}>
                    {displayItem.workerType === "employee" ? "Employee" : "Contractor"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{displayItem.workerCountry}</span>
                </div>
              </div>
            </div>

            {/* Adjustment Info */}
            <Card className="border-border/20 bg-card/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline" className={cn("capitalize", getTypeBadgeColor(displayItem.type))}>
                    {displayItem.type.replace("_", " ")}
                  </Badge>
                </div>
                <Separator className="bg-border/30" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className={cn(
                    "text-lg font-bold",
                    displayItem.amount >= 0 ? "text-accent-green-text" : "text-destructive"
                  )}>
                    {displayItem.amount >= 0 ? "+" : ""}{displayItem.amount.toLocaleString()}
                  </span>
                </div>
                <Separator className="bg-border/30" />
                <div>
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="text-sm text-foreground mt-1">{displayItem.description || "No description provided"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Receipt (if expense) */}
            {displayItem.hasReceipt && (
              <Card className="border-border/20 bg-card/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Receipt attached</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                      <FileText className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                  {/* Receipt preview placeholder */}
                  <div className="mt-3 p-8 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">receipt_2025_11.pdf</p>
                      <Button variant="link" size="sm" className="h-7 text-xs mt-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons (only for client review items) */}
            {isClientReview && onApprove && onReject && (
              <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onReject(displayItem.id)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="flex-1 h-10 gap-2 bg-accent-green-fill hover:bg-accent-green-fill/90 text-accent-green-text"
                  onClick={() => onApprove(displayItem.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}

            {/* Already approved/rejected message */}
            {!isClientReview && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  displayItem.status === "approved" 
                    ? "bg-accent-green-fill/20 text-accent-green-text" 
                    : "bg-red-500/10 text-red-600"
                )}>
                  {displayItem.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  This item has already been reviewed.
                </p>
              </div>
            )}
          </div>
        )}

        {displayWorker && !displayItem && (
          <div className="space-y-6">
            {/* Worker Header */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-2xl">{displayWorker.countryFlag}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{displayWorker.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    displayWorker.type === "employee" 
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                      : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                  )}>
                    {displayWorker.type === "employee" ? "Employee" : "Contractor"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{displayWorker.country}</span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <Card className="border-border/20 bg-card/30">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {displayWorker.type === "employee" ? "Payroll Breakdown" : "Invoice Breakdown"}
                </h4>
                
                {/* Earnings */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Earnings</p>
                  {displayWorker.lineItems?.filter(li => li.type === "earning").map(li => (
                    <div key={li.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{li.name}</span>
                      <span className="font-medium text-foreground">
                        {displayWorker.currency} {li.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Deductions (employees only) */}
                {displayWorker.type === "employee" && (
                  <>
                    <Separator className="bg-border/30" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deductions</p>
                      {displayWorker.lineItems?.filter(li => li.type === "deduction").map(li => (
                        <div key={li.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{li.name}</span>
                          <span className="font-medium text-red-600">
                            {displayWorker.currency} {li.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Employer Contributions (employees only) */}
                {displayWorker.type === "employee" && displayWorker.lineItems?.some(li => li.type === "contribution") && (
                  <>
                    <Separator className="bg-border/30" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Employer Contributions</p>
                      {displayWorker.lineItems?.filter(li => li.type === "contribution").map(li => (
                        <div key={li.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{li.name}</span>
                          <span className="font-medium text-muted-foreground">
                            {displayWorker.currency} {li.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator className="bg-border/30" />

                {/* Net Pay */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-foreground">Net to Pay</span>
                  <span className="text-lg font-bold text-primary">
                    {displayWorker.currency} {displayWorker.netPay.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
