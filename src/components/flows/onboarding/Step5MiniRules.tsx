import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreVertical, Trash2, Shield, Loader2, Sparkles, Tag, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step5Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

type RuleTag = "approval" | "compliance" | "policy" | "payroll" | "fx";
type TriggerType = "date" | "threshold" | "country_change" | "role_type";

interface Rule {
  id: string;
  tag: RuleTag;
  triggerType: TriggerType;
  description: string;
  linkedAction?: string;
}

const STARTER_RULES: Rule[] = [
  {
    id: "r1",
    tag: "approval",
    triggerType: "threshold",
    description: "Tag Finance when payroll batch > 100k",
    linkedAction: "Notify approver"
  },
  {
    id: "r2",
    tag: "compliance",
    triggerType: "date",
    description: "Remind contractor 7 days before doc expiry",
    linkedAction: "Trigger compliance check"
  },
  {
    id: "r3",
    tag: "policy",
    triggerType: "country_change",
    description: "Default paid leave: 5d (PH), 0d (NO), 0d (IN/XK) unless override",
    linkedAction: "Auto-adjust"
  }
];

const Step5MiniRules = ({ formData, onComplete, isProcessing: externalProcessing, isLoadingFields = false }: Step5Props) => {
  const [rules, setRules] = useState<Rule[]>(
    formData.miniRules || STARTER_RULES
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Rule | null>(null);
  const [isNewRule, setIsNewRule] = useState(false);

  const handleOpenEditModal = (rule: Rule, isNew = false) => {
    setEditFormData({ ...rule });
    setIsNewRule(isNew);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditFormData(null);
    setIsNewRule(false);
  };

  const handleSaveEdit = () => {
    if (!editFormData || !editFormData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a rule description",
        variant: "destructive"
      });
      return;
    }
    
    if (isNewRule) {
      // Add new rule
      setRules(prev => [...prev, editFormData]);
      toast({
        title: "Rule added",
        description: "New rule has been created"
      });
    } else {
      // Update existing rule
      setRules(prev =>
        prev.map(r =>
          r.id === editFormData.id ? editFormData : r
        )
      );
      toast({
        title: "Rule updated",
        description: "Your changes have been saved"
      });
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Rule deleted",
      description: "The rule has been removed"
    });
  };

  const handleAddRule = () => {
    const newRule: Rule = {
      id: `r${Date.now()}`,
      tag: "policy", // Auto-assigned internally
      triggerType: "threshold",
      description: "",
      linkedAction: "Auto-adjust"
    };
    handleOpenEditModal(newRule, true);
  };

  const handleSave = () => {
    if (rules.length === 0) {
      toast({
        title: "No rules defined",
        description: "Please add at least one rule",
        variant: "destructive"
      });
      return;
    }

    // No generic save notification - let the step transition speak for itself
    onComplete("mini_rules_setup", {
      miniRules: rules
    });
  };

  const getTriggerTypeLabel = (type: TriggerType) => {
    const labels = {
      date: "Date",
      threshold: "Threshold",
      country_change: "Country Change",
      role_type: "Role Type"
    };
    return labels[type];
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mini-Rules Setup
          </h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Create smart automation rules that help Kurt handle routine tasks without your input. These rules trigger specific actions based on conditions you define.
          </p>
        </div>
        
        {/* Example Rules Card */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Example Rules:</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 ml-4">
            <li>• <span className="font-medium">Auto-approve</span> expense claims under $50 from trusted contractors</li>
            <li>• <span className="font-medium">Flag</span> invoices over $5,000 for dual approval</li>
            <li>• <span className="font-medium">Send reminder</span> 3 days before contract renewal dates</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            You can customize the starter rules below or create your own from scratch.
          </p>
        </motion.div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Your Rules</Label>
          {!isLoadingFields && (
            <Button size="sm" variant="outline" onClick={handleAddRule}>
              <Plus className="h-3 w-3 mr-1" />
              Add Rule
            </Button>
          )}
        </div>
        {isLoadingFields ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          rules.map((rule, index) => (
            <div key={rule.id}>
              {index > 0 && <div className="my-2 border-t border-border/20" />}
              <div className="p-3 rounded-lg border border-border/30 bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-2">{rule.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {getTriggerTypeLabel(rule.triggerType)}
                      </span>
                      {rule.linkedAction && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {rule.linkedAction}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-card z-50">
                      <DropdownMenuItem onClick={() => handleOpenEditModal(rule, false)} className="text-sm">
                        Edit Rule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(rule.id)}
                        className="text-sm text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoadingFields ? (
        <Skeleton className="h-11 w-full" />
      ) : (
        <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing}>
          {externalProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue Setup"
          )}
        </Button>
      )}

      {/* Edit Rule Modal */}
      <Dialog open={editModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{isNewRule ? "Add New Rule" : "Edit Rule"}</DialogTitle>
          </DialogHeader>
          
          {editFormData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Rule Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Notify finance when payment exceeds $10,000"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggerType" className="text-sm">Trigger Type</Label>
                <Select
                  value={editFormData.triggerType}
                  onValueChange={(val: TriggerType) => setEditFormData(prev => prev ? { ...prev, triggerType: val } : null)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="threshold">Threshold</SelectItem>
                    <SelectItem value="country_change">Country Change</SelectItem>
                    <SelectItem value="role_type">Role Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  {isNewRule ? "Add Rule" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Step5MiniRules;
