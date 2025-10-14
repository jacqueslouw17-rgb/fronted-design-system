import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle, Edit, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export type ActionConfirmationStatus = "pending" | "approved" | "cancelled" | "editing";

export interface ActionSummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface AgentActionConfirmationProps {
  title: string;
  description?: string;
  summaryItems: ActionSummaryItem[];
  status?: ActionConfirmationStatus;
  actionType: string; // e.g., "payroll", "contract", "compliance"
  onApprove: () => void;
  onEdit?: () => void;
  onCancel: () => void;
  editContent?: React.ReactNode;
  className?: string;
}

export const AgentActionConfirmation = ({
  title,
  description,
  summaryItems,
  status: initialStatus = "pending",
  actionType,
  onApprove,
  onEdit,
  onCancel,
  editContent,
  className = "",
}: AgentActionConfirmationProps) => {
  const [status, setStatus] = useState<ActionConfirmationStatus>(initialStatus);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { toast } = useToast();

  const handleApprove = () => {
    setStatus("approved");
    
    // Log to audit trail (mock)
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: `${actionType} approved`,
      user: "Current User",
      method: "HITL via Agent",
    };
    console.log("Audit Log:", auditEntry);
    
    // Show success toast
    toast({
      title: "Action Approved",
      description: `${title} has been confirmed and executed.`,
    });
    
    // Call parent handler
    onApprove();
  };

  const handleEdit = () => {
    if (onEdit) {
      setIsEditDrawerOpen(true);
      onEdit();
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
    
    toast({
      title: "Action Cancelled",
      description: `${title} has been cancelled.`,
      variant: "destructive",
    });
    
    onCancel();
  };

  const statusConfig = {
    pending: { label: "Pending Approval", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
    approved: { label: "Approved", color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
    editing: { label: "Editing", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={className}
      >
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              <Badge variant="outline" className={statusConfig[status].color}>
                {statusConfig[status].label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Summary Items */}
            <div className="space-y-2">
              {summaryItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between py-2 border-b last:border-0 ${
                    item.highlight ? "bg-muted/50 -mx-3 px-3 rounded" : ""
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-medium ${item.highlight ? "text-primary" : ""}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {status === "pending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 pt-2"
              >
                <Button
                  onClick={handleApprove}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                
                {onEdit && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </motion.div>
            )}

            {/* Success State */}
            {status === "approved" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-green-600 dark:text-green-400 py-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Confirmed and executed</span>
              </motion.div>
            )}

            {/* Cancelled State */}
            {status === "cancelled" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 py-2"
              >
                <X className="h-5 w-5" />
                <span className="text-sm font-medium">Action cancelled</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Drawer */}
      {onEdit && (
        <Sheet open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Edit {title}</SheetTitle>
              <SheetDescription>
                Review and modify details before confirming
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {editContent || (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Edit functionality would appear here
                  </p>
                  <Button onClick={() => setIsEditDrawerOpen(false)} className="w-full">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};