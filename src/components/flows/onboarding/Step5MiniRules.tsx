import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
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

  const handleOpenEditModal = (rule: Rule) => {
    setEditFormData({ ...rule });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    
    setRules(prev =>
      prev.map(r =>
        r.id === editFormData.id ? editFormData : r
      )
    );
    setEditModalOpen(false);
    setEditFormData(null);
    toast({
      title: "Rule updated",
      description: "Your changes have been saved"
    });
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
      tag: "policy",
      triggerType: "threshold",
      description: "New rule (click ⋮ to edit)",
      linkedAction: "Auto-adjust"
    };
    setRules(prev => [...prev, newRule]);
    handleOpenEditModal(newRule);
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

    toast({
      title: "Mini-Rules saved",
      description: `${rules.length} rules configured successfully`
    });

    onComplete("mini_rules_setup", {
      miniRules: rules
    });
  };

  const getTagColor = (tag: RuleTag) => {
    const colors = {
      approval: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      compliance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      policy: "bg-green-500/10 text-green-600 border-green-500/20",
      payroll: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      fx: "bg-orange-500/10 text-orange-600 border-orange-500/20"
    };
    return colors[tag];
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

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
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
          rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 rounded-lg border border-border/50 bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className={cn("mt-1 text-xs", getTagColor(rule.tag))}>
                  {rule.tag}
                </Badge>
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
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenEditModal(rule)} className="text-sm">
                      <Tag className="h-3 w-3 mr-2" />
                      Edit Tags
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEditModal(rule)} className="text-sm">
                      <Zap className="h-3 w-3 mr-2" />
                      Change Trigger Type
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEditModal(rule)} className="text-sm">
                      Update Description
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(rule.id)}
                      className="text-sm text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete Rule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            "Save Rules & Continue"
          )}
        </Button>
      )}

      {/* Edit Rule Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Rule</DialogTitle>
          </DialogHeader>
          
          {editFormData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag" className="text-sm">Rule Tag</Label>
                <Select
                  value={editFormData.tag}
                  onValueChange={(val: RuleTag) => setEditFormData(prev => prev ? { ...prev, tag: val } : null)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="fx">FX</SelectItem>
                  </SelectContent>
                </Select>
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
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="threshold">Threshold</SelectItem>
                    <SelectItem value="country_change">Country Change</SelectItem>
                    <SelectItem value="role_type">Role Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedAction" className="text-sm">Linked Action</Label>
                <Select
                  value={editFormData.linkedAction || "none"}
                  onValueChange={(val) => setEditFormData(prev => prev ? { ...prev, linkedAction: val === "none" ? undefined : val } : null)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Trigger compliance check">Trigger compliance check</SelectItem>
                    <SelectItem value="Notify approver">Notify approver</SelectItem>
                    <SelectItem value="Auto-adjust">Auto-adjust</SelectItem>
                    <SelectItem value="Send alert">Send alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Input
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step5MiniRules;
