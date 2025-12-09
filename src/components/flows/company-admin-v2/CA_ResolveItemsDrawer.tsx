// Flow 6 v2 - Company Admin Dashboard - Resolve Items Drawer (Local to this flow only)

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Eye, EyeOff, CheckCircle2, Paperclip, Sparkles, Calendar, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_Adjustment, CA_LeaveChange } from "./CA_PayrollTypes";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  autoApproveThreshold: number;
  preSelectedCurrency?: string;
  onCreateBatch?: () => void;
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
  autoApproveThreshold,
  preSelectedCurrency,
  onCreateBatch
}) => {
  const [activeTab, setActiveTab] = useState<"adjustments" | "leave">("adjustments");
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [expandedAdjustmentIds, setExpandedAdjustmentIds] = useState<Set<string>>(new Set());
  const [expandedLeaveIds, setExpandedLeaveIds] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    type: "pdf" | "image";
  } | null>(null);

  // Set pre-selected currency when drawer opens
  useEffect(() => {
    if (open && preSelectedCurrency) {
      setSelectedCurrency(preSelectedCurrency);
    } else if (!open) {
      setSelectedCurrency(null);
      setExpandedAdjustmentIds(new Set());
      setExpandedLeaveIds(new Set());
    }
  }, [open, preSelectedCurrency]);
  const pendingAdjustments = adjustments.filter(a => a.status === "pending");
  const pendingLeave = leaveChanges.filter(l => l.status === "pending");

  // Get unique currencies
  const allCurrencies = Array.from(new Set([...pendingAdjustments.map(a => a.currency), ...pendingLeave.map(l => l.currency)]));

  // Filter by selected currency
  const filteredAdjustments = selectedCurrency ? pendingAdjustments.filter(a => a.currency === selectedCurrency) : pendingAdjustments;
  const filteredLeave = selectedCurrency ? pendingLeave.filter(l => l.currency === selectedCurrency) : pendingLeave;
  const autoApprovableAdjustments = filteredAdjustments.filter(a => Math.abs(a.amount) <= autoApproveThreshold);
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();
  const formatCurrency = (amount: number, currency: string) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${currency} ${Math.abs(amount).toLocaleString()}`;
  };
  const getTypeLabel = (type: CA_Adjustment["type"]) => {
    switch (type) {
      case "overtime":
        return "Overtime";
      case "expense":
        return "Expense";
      case "bonus":
        return "Bonus";
      case "correction":
        return "Correction";
      case "commission":
        return "Commission";
      case "additional_hours":
        return "Additional Hours";
      default:
        return type;
    }
  };
  const getLeaveTypeLabel = (type: CA_LeaveChange["leaveType"]) => {
    switch (type) {
      case "annual":
        return "Annual Leave";
      case "sick":
        return "Sick Leave";
      case "unpaid":
        return "Unpaid Leave";
      case "parental":
        return "Parental Leave";
      default:
        return "Other Leave";
    }
  };
  const handleApproveAll = () => {
    autoApprovableAdjustments.forEach(adj => {
      onApproveAdjustment(adj.id);
    });
    toast.success(`Auto-approved ${autoApprovableAdjustments.length} items within policy threshold`);
  };
  const toggleAdjustmentExpanded = (id: string) => {
    setExpandedAdjustmentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  const toggleLeaveExpanded = (id: string) => {
    setExpandedLeaveIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  const handleAttachmentClick = (fileName: string) => {
    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(fileName);
    setPreviewFile({
      name: fileName,
      type: isImage ? "image" : "pdf"
    });
  };

  // Mock data for expanded details
  const getMockAdjustmentDetails = (adj: CA_Adjustment) => ({
    requestedBy: adj.workerName,
    requestedAt: adj.submittedAt,
    source: "T-5 confirmation window · Worker portal",
    projectInfo: adj.type === "overtime" ? "Project: Frontend redesign" : null,
    currentMonthlyPay: 85000,
    estimatedMonthlyPay: 85000 + adj.amount,
    attachments: adj.hasReceipt ? [adj.type === "expense" ? "receipt.pdf" : null, adj.type === "overtime" ? "timesheet.png" : null].filter(Boolean) as string[] : []
  });
  const getMockLeaveDetails = (leave: CA_LeaveChange) => ({
    workingDays: leave.days,
    balanceAfter: leave.leaveType === "annual" ? 10 : leave.leaveType === "sick" ? 5 : null,
    isPaidLeave: leave.leaveType !== "unpaid"
  });
  const allClear = filteredAdjustments.length === 0 && filteredLeave.length === 0;
  return <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/30">
            <SheetTitle className="text-lg font-semibold">Resolve items</SheetTitle>
            <p className="text-xs text-muted-foreground mt-1">
              The company admin approves leave and pay changes for this period.
            </p>
            
            {/* Currency Filter Pills */}
            {allCurrencies.length > 1 && <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant={selectedCurrency === null ? "default" : "outline"} className="text-xs cursor-pointer" onClick={() => setSelectedCurrency(null)}>
                  All
                </Badge>
                {allCurrencies.map(currency => <Badge key={currency} variant={selectedCurrency === currency ? "default" : "outline"} className="text-xs cursor-pointer" onClick={() => setSelectedCurrency(currency)}>
                    {currency}
                  </Badge>)}
              </div>}

            {/* Auto-approve button */}
            {autoApprovableAdjustments.length > 0 && <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={handleApproveAll}>
                <Sparkles className="h-4 w-4" />
                Approve All ≤ {autoApproveThreshold} ({autoApprovableAdjustments.length})
              </Button>}
          </SheetHeader>

          {allClear ? <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="rounded-full bg-accent-green-fill/20 p-4 mb-4">
                <CheckCircle2 className="h-10 w-10 text-accent-green-text" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                You've completed admin approvals for this payroll period.
              </p>
              <div className="flex flex-col items-center gap-3">
                {onCreateBatch && <Button onClick={() => {
              onCreateBatch();
              onClose();
            }} className="bg-gradient-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    Create payment batch
                  </Button>}
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
                  Close
                </Button>
              </div>
            </div> : <>
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2 flex-shrink-0">
                  <TabsTrigger value="adjustments" className="gap-2">
                    Adjustments
                    {filteredAdjustments.length > 0 && <Badge variant="destructive" className="text-[10px] h-5 min-w-5 px-1">
                        {filteredAdjustments.length}
                      </Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="leave" className="gap-2">
                    Leave
                    {filteredLeave.length > 0 && <Badge variant="destructive" className="text-[10px] h-5 min-w-5 px-1">
                        {filteredLeave.length}
                      </Badge>}
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 min-h-0">
                  {/* Adjustments Tab */}
                  <TabsContent value="adjustments" className="px-6 py-4 space-y-3 m-0">
                    {filteredAdjustments.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">
                        No pending adjustments
                      </div> : filteredAdjustments.map(adj => {
                  const isExpanded = expandedAdjustmentIds.has(adj.id);
                  const details = getMockAdjustmentDetails(adj);
                  return <Card key={adj.id} className="border-border/30 bg-card/50 overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9 flex-shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(adj.workerName)}
                                  </AvatarFallback>
                                </Avatar>

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
                                    <span className={cn("text-sm font-semibold", adj.amount >= 0 ? "text-accent-green-text" : "text-destructive")}>
                                      {formatCurrency(adj.amount, adj.currency)}
                                    </span>
                                    {adj.hasReceipt && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}
                                  </div>

                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {adj.description}
                                  </p>
                                </div>
                              </div>

                              {/* Expanded Details for Adjustments */}
                              {isExpanded && <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                                  {/* Request Details Section */}
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Request details</h4>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Requested by</span>
                                        <span className="text-foreground">{details.requestedBy} · {details.requestedAt}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Source</span>
                                        <span className="text-foreground">{details.source}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Type</span>
                                        <span className="text-foreground">
                                          {getTypeLabel(adj.type)}
                                          {details.projectInfo && ` · ${details.projectInfo}`}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md mt-2">
                                      {adj.description}
                                    </p>
                                  </div>

                                  {/* Payroll Impact Section */}
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Payroll impact</h4>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Adjustment</span>
                                        <span className={cn("font-medium", adj.amount >= 0 ? "text-accent-green-text" : "text-destructive")}>
                                          {formatCurrency(adj.amount, adj.currency)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Estimated monthly pay</span>
                                        <span className="text-foreground">
                                          {adj.currency} {details.currentMonthlyPay.toLocaleString()} → {adj.currency} {details.estimatedMonthlyPay.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Attachments Section */}
                                  {details.attachments.length > 0 && <div className="space-y-2">
                                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Attachments</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {details.attachments.map((file, idx) => <button key={idx} onClick={() => handleAttachmentClick(file)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-xs text-foreground transition-colors">
                                            {/\.(png|jpg|jpeg|gif|webp)$/i.test(file) ? <ImageIcon className="h-3 w-3 text-muted-foreground" /> : <FileText className="h-3 w-3 text-muted-foreground" />}
                                            {file}
                                          </button>)}
                                      </div>
                                    </div>}

                                </div>}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/30">
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => toggleAdjustmentExpanded(adj.id)}>
                                  {isExpanded ? <>
                                      <EyeOff className="h-3.5 w-3.5" />
                                      Hide
                                    </> : <>
                                      <Eye className="h-3.5 w-3.5" />
                                      View
                                    </>}
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onRejectAdjustment(adj.id)}>
                                  <X className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                                <Button size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => onApproveAdjustment(adj.id)}>
                                  <Check className="h-3.5 w-3.5" />
                                  Approve
                                </Button>
                              </div>
                            </CardContent>
                          </Card>;
                })}
                  </TabsContent>

                  {/* Leave Tab */}
                  <TabsContent value="leave" className="px-6 py-4 space-y-3 m-0">
                    {filteredLeave.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">
                        No pending leave requests
                      </div> : filteredLeave.map(leave => {
                  const isExpanded = expandedLeaveIds.has(leave.id);
                  const details = getMockLeaveDetails(leave);
                  return <Card key={leave.id} className="border-border/30 bg-card/50 overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9 flex-shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(leave.workerName)}
                                  </AvatarFallback>
                                </Avatar>

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
                                    {leave.impactAmount !== 0 && <span className={cn("text-xs", leave.impactAmount < 0 ? "text-destructive" : "text-accent-green-text")}>
                                        ({formatCurrency(leave.impactAmount, leave.currency)})
                                      </span>}
                                  </div>

                                  <p className="text-xs text-muted-foreground">
                                    {leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} – ${leave.endDate}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                    {leave.description}
                                  </p>
                                </div>
                              </div>

                              {/* Expanded Details for Leave */}
                              {isExpanded && <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                                  {/* Dates & Duration Section */}
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Dates & duration</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-foreground">
                                        {leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} – ${leave.endDate}`}
                                        {" · "}
                                        <span className="font-medium">{details.workingDays} working day{details.workingDays !== 1 ? "s" : ""}</span>
                                      </span>
                                    </div>
                                    
                                    {/* Mini Calendar Strip */}
                                    <div className="flex gap-1 mt-2">
                                      {Array.from({
                              length: 7
                            }).map((_, idx) => {
                              const dayNum = 15 + idx;
                              const isHighlighted = idx >= 3 && idx < 3 + leave.days;
                              return <div key={idx} className={cn("w-8 h-8 rounded-md flex flex-col items-center justify-center text-[10px]", isHighlighted ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground")}>
                                            <span className="font-medium">{dayNum}</span>
                                          </div>;
                            })}
                                    </div>
                                  </div>

                                  {/* Leave Details Section */}
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Leave details</h4>
                                    <div className="space-y-1.5">
                                      <Badge variant="secondary" className="text-xs">
                                        {getLeaveTypeLabel(leave.leaveType)}
                                      </Badge>
                                      {details.balanceAfter !== null && <p className="text-xs text-muted-foreground">
                                          Balance after approval: <span className="text-foreground font-medium">{details.balanceAfter} days remaining</span>
                                        </p>}
                                    </div>
                                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md mt-2">
                                      {leave.description}
                                    </p>
                                  </div>

                                  {/* Estimated Impact Section */}
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Estimated impact</h4>
                                    <p className="text-sm">
                                      {details.isPaidLeave ? leave.impactAmount !== 0 ? <span className={cn("font-medium", leave.impactAmount < 0 ? "text-destructive" : "text-accent-green-text")}>
                                            Estimated impact: {formatCurrency(leave.impactAmount, leave.currency)}
                                          </span> : <span className="text-muted-foreground">Paid leave · no change to net pay</span> : <span className="text-destructive font-medium">
                                          Unpaid leave · Estimated deduction: {formatCurrency(leave.impactAmount, leave.currency)}
                                        </span>}
                                    </p>
                                  </div>

                                </div>}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/30">
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => toggleLeaveExpanded(leave.id)}>
                                  {isExpanded ? <>
                                      <EyeOff className="h-3.5 w-3.5" />
                                      Hide
                                    </> : <>
                                      <Eye className="h-3.5 w-3.5" />
                                      View
                                    </>}
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onRejectLeave(leave.id)}>
                                  <X className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                                <Button size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => onApproveLeave(leave.id)}>
                                  <Check className="h-3.5 w-3.5" />
                                  Approve
                                </Button>
                              </div>
                            </CardContent>
                          </Card>;
                })}
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <SheetFooter className="px-6 py-4 border-t border-border/30">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
              </SheetFooter>
            </>}
        </SheetContent>
      </Sheet>

      {/* Attachment Preview Modal */}
      <Dialog open={previewFile !== null} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile?.type === "image" ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[200px] bg-muted/30 rounded-lg">
            {previewFile?.type === "image" ? <div className="text-center p-8">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Image preview placeholder</p>
                <p className="text-xs text-muted-foreground mt-1">{previewFile.name}</p>
              </div> : <div className="text-center p-8">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">PDF preview placeholder</p>
                <p className="text-xs text-muted-foreground mt-1">{previewFile?.name}</p>
              </div>}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setPreviewFile(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>;
};