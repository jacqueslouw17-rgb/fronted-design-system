import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, User, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ApprovalWorkflowProps {
  status: "pending" | "approved" | "rejected";
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ 
  status, 
  onApprove, 
  onReject 
}) => {
  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Initiator */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarFallback className="text-xs sm:text-sm">IA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-xs sm:text-sm">Ioana (Admin)</div>
            <div className="text-xs text-muted-foreground">Initiated payroll</div>
          </div>
          <Badge variant="default" className="bg-green-500/10 text-green-600 text-xs shrink-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Done
          </Badge>
        </div>

        {/* Approver */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarFallback className="text-xs sm:text-sm">HC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-xs sm:text-sm">Howard (CFO)</div>
            <div className="text-xs text-muted-foreground">Approval required</div>
          </div>
          {status === "pending" ? (
            <Badge variant="secondary" className="text-xs shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          ) : status === "approved" ? (
            <Badge variant="default" className="bg-green-500/10 text-green-600 text-xs shrink-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs shrink-0">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          )}
        </div>

        {/* Demo: Simulate CFO approval */}
        {status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-2"
          >
            <div className="text-xs text-muted-foreground p-2 rounded bg-muted/20">
              <Bell className="h-3 w-3 inline mr-1" />
              Howard will receive Slack + email notification
            </div>
            <div className="text-xs font-medium mb-2">Demo: Simulate CFO Action</div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onApprove} size="sm" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button onClick={onReject} size="sm" variant="outline" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          </motion.div>
        )}

        {status === "approved" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <div className="text-xs text-green-600 font-medium">
              ✅ CFO approved · Payroll executing
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
