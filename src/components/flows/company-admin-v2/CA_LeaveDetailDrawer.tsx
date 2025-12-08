// Flow 6 v2 - Company Admin Dashboard - Leave Detail Drawer

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_LeaveRequest } from "./CA_InPlaceTypes";

interface CA_LeaveDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CA_LeaveRequest | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const CA_LeaveDetailDrawer: React.FC<CA_LeaveDetailDrawerProps> = ({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject
}) => {
  if (!request) return null;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-xs bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">Leave Request Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Worker Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(request.workerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{request.workerName}</p>
              <p className="text-sm text-muted-foreground">
                {request.workerCountryFlag} {request.workerCountry}
              </p>
            </div>
            <div className="ml-auto">
              {getStatusBadge(request.status)}
            </div>
          </div>

          <Separator />

          {/* Leave Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Leave Type</p>
                <p className="text-base font-medium text-foreground">{getLeaveTypeLabel(request.leaveType)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="text-base font-medium text-foreground">
                  {request.startDate} – {request.endDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-base font-medium text-foreground">{request.days} day{request.days !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {request.notes && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground">{request.notes}</p>
              </div>
            )}
          </div>
        </div>

        {request.status === "pending" && (
          <SheetFooter className="mt-6 gap-2">
            <Button 
              variant="outline" 
              className="flex-1 text-red-600 border-red-500/30 hover:bg-red-500/10"
              onClick={() => onReject(request.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              className="flex-1"
              onClick={() => onApprove(request.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
