import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ListTodo,
  FileText,
  DollarSign,
  Shield,
  Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Types
export type QueueStatus = "pending" | "approved" | "rejected" | "expired";
export type QueueModule = "contract" | "payroll" | "compliance" | "support" | "policy";

export interface ConfirmationItem {
  id: string;
  title: string;
  context: string;
  module: QueueModule;
  status: QueueStatus;
  timestamp: Date;
  description?: string;
  metadata?: Record<string, any>;
}

// Module configuration
const moduleConfig: Record<QueueModule, { icon: any; color: string; label: string }> = {
  contract: { icon: FileText, color: "text-blue-600", label: "Contract" },
  payroll: { icon: DollarSign, color: "text-green-600", label: "Payroll" },
  compliance: { icon: Shield, color: "text-purple-600", label: "Compliance" },
  support: { icon: Users, color: "text-orange-600", label: "Support" },
  policy: { icon: FileText, color: "text-indigo-600", label: "Policy" },
};

// Status configuration
const statusConfig: Record<QueueStatus, { badge: string; color: string }> = {
  pending: { badge: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  approved: { badge: "Approved", color: "bg-green-100 text-green-800 border-green-300" },
  rejected: { badge: "Rejected", color: "bg-red-100 text-red-800 border-red-300" },
  expired: { badge: "Expired", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

// Hook for queue state management
export function useConfirmationQueue() {
  const [items, setItems] = useState<ConfirmationItem[]>(() => {
    const stored = localStorage.getItem("genie-confirmation-queue");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("genie-confirmation-queue", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<ConfirmationItem, "id" | "timestamp" | "status">) => {
    const newItem: ConfirmationItem = {
      ...item,
      id: `confirmation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: "pending",
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateStatus = (id: string, status: QueueStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const pendingCount = items.filter((item) => item.status === "pending").length;
  const pendingItems = items.filter((item) => item.status === "pending");
  const completedItems = items.filter((item) => item.status !== "pending");

  return {
    items,
    pendingItems,
    completedItems,
    pendingCount,
    addItem,
    updateStatus,
    removeItem,
  };
}

// Queue Badge Component
interface QueueBadgeProps {
  count: number;
  onClick?: () => void;
}

export function QueueBadge({ count, onClick }: QueueBadgeProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
    >
      <ListTodo className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{count} Pending</span>
      <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800 border-yellow-300">
        {count}
      </Badge>
    </button>
  );
}

// Confirmation Card Component
interface ConfirmationCardProps {
  item: ConfirmationItem;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onOpenContext?: (id: string) => void;
}

export function ConfirmationCard({ item, onApprove, onReject, onOpenContext }: ConfirmationCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isPulsing, setIsPulsing] = useState(false);

  const ModuleIcon = moduleConfig[item.module].icon;
  const statusInfo = statusConfig[item.status];
  const moduleInfo = moduleConfig[item.module];

  const handleApprove = () => {
    setIsPulsing(true);
    setTimeout(() => {
      onApprove(item.id);
      setIsPulsing(false);
    }, 300);
  };

  const handleRejectConfirm = () => {
    onReject(item.id, rejectReason);
    setIsRejecting(false);
    setRejectReason("");
  };

  const isPending = item.status === "pending";

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-300",
        isPulsing && "animate-pulse",
        !isPending && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn("p-2 rounded-lg bg-muted", moduleInfo.color)}>
            <ModuleIcon className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{item.title}</h4>
              <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
                {statusInfo.badge}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{item.context}</p>

            {item.description && (
              <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(item.timestamp).toLocaleString()}</span>
              <Badge variant="secondary" className="text-xs">
                {moduleInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              className="gap-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRejecting(!isRejecting)}
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            {onOpenContext && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenContext(item.id)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isRejecting && isPending && (
        <div className="mt-4 space-y-2 animate-in slide-in-from-top-2">
          <Textarea
            placeholder="Reason for rejection (optional)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsRejecting(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRejectConfirm}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Main Queue Component
interface ConfirmationQueueProps {
  items?: ConfirmationItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onOpenContext?: (id: string) => void;
}

export function ConfirmationQueue({
  items: externalItems,
  onApprove: externalApprove,
  onReject: externalReject,
  onOpenContext,
}: ConfirmationQueueProps) {
  const {
    pendingItems,
    completedItems,
    updateStatus,
  } = useConfirmationQueue();

  const itemsToDisplay = externalItems || pendingItems;
  const completedToDisplay = externalItems ? [] : completedItems;

  const handleApprove = (id: string) => {
    if (externalApprove) {
      externalApprove(id);
    } else {
      updateStatus(id, "approved");
      toast({
        title: "Action Approved",
        description: "The confirmation has been approved successfully.",
      });
    }
  };

  const handleReject = (id: string, reason?: string) => {
    if (externalReject) {
      externalReject(id, reason);
    } else {
      updateStatus(id, "rejected");
      toast({
        title: "Action Rejected",
        description: reason || "The confirmation has been rejected.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pending Actions</h3>
          <Badge variant="secondary">{itemsToDisplay.length}</Badge>
        </div>

        {itemsToDisplay.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No pending confirmations</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {itemsToDisplay.map((item) => (
              <ConfirmationCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onOpenContext={onOpenContext}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      {completedToDisplay.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-2">
              {completedToDisplay.slice(0, 5).map((item) => (
                <ConfirmationCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onOpenContext={onOpenContext}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Queue Drawer Component
interface QueueDrawerProps {
  trigger?: React.ReactNode;
}

export function QueueDrawer({ trigger }: QueueDrawerProps) {
  const { pendingCount, pendingItems, completedItems, updateStatus } = useConfirmationQueue();

  const handleApprove = (id: string) => {
    updateStatus(id, "approved");
    toast({
      title: "Action Approved",
      description: "The confirmation has been approved successfully.",
    });
  };

  const handleReject = (id: string, reason?: string) => {
    updateStatus(id, "rejected");
    toast({
      title: "Action Rejected",
      description: reason || "The confirmation has been rejected.",
      variant: "destructive",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <QueueBadge count={pendingCount} />}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Confirmation Queue
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="pr-4">
            <ConfirmationQueue
              items={[...pendingItems, ...completedItems]}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
