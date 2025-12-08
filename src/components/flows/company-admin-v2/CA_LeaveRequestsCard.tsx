import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  workerId: string;
  workerName: string;
  country: string;
  countryFlag: string;
  leaveType: "Annual" | "Sick" | "Unpaid" | "Parental";
  days: number;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
}

interface CA_LeaveRequestsCardProps {
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewAll: () => void;
}

export const CA_LeaveRequestsCard: React.FC<CA_LeaveRequestsCardProps> = ({
  requests,
  onApprove,
  onReject,
  onViewDetails,
  onViewAll,
}) => {
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const displayRequests = requests.slice(0, 5);

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase();

  const getLeaveTypeColor = (type: LeaveRequest["leaveType"]) => {
    switch (type) {
      case "Annual": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "Sick": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "Unpaid": return "bg-muted text-muted-foreground";
      case "Parental": return "bg-purple-500/10 text-purple-600 border-purple-500/30";
    }
  };

  if (pendingCount === 0) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Leave requests</p>
              <p className="text-xs text-muted-foreground">All clear - no pending requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="py-3 px-5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Leave requests</span>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              {pendingCount} pending
            </Badge>
          </div>
          <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={onViewAll}>
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {displayRequests.map((request) => (
            <div 
              key={request.id} 
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onViewDetails(request.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(request.workerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{request.workerName}</span>
                    <span className="text-xs text-muted-foreground">{request.countryFlag}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getLeaveTypeColor(request.leaveType))}>
                      {request.leaveType}
                    </Badge>
                    <span>{request.days} day{request.days !== 1 ? "s" : ""}</span>
                    <span>•</span>
                    <span>{request.startDate}</span>
                  </div>
                </div>
              </div>
              
              {request.status === "pending" && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-green-600 hover:bg-green-500/10"
                    onClick={() => onApprove(request.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-500/10"
                    onClick={() => onReject(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {request.status !== "pending" && (
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  request.status === "approved" && "bg-green-500/10 text-green-600 border-green-500/30",
                  request.status === "rejected" && "bg-red-500/10 text-red-600 border-red-500/30"
                )}>
                  {request.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
