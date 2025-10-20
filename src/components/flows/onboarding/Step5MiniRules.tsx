import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step5Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
}

interface Rule {
  id: string;
  type: "approval" | "compliance" | "policy";
  description: string;
}

const STARTER_RULES: Rule[] = [
  {
    id: "r1",
    type: "approval",
    description: "Tag Finance when payroll batch > 100k"
  },
  {
    id: "r2",
    type: "compliance",
    description: "Remind contractor 7 days before doc expiry"
  },
  {
    id: "r3",
    type: "policy",
    description: "Default paid leave: 5d (PH), 0d (NO), 0d (IN/XK) unless override"
  }
];

const Step5MiniRules = ({ formData, onComplete }: Step5Props) => {
  const [rules, setRules] = useState<Rule[]>(
    formData.miniRules || STARTER_RULES
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (rule: Rule) => {
    setEditingId(rule.id);
    setEditValue(rule.description);
  };

  const handleSaveEdit = (id: string) => {
    setRules(prev =>
      prev.map(r =>
        r.id === id ? { ...r, description: editValue } : r
      )
    );
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRule = () => {
    const newRule: Rule = {
      id: `r${Date.now()}`,
      type: "policy",
      description: "New rule (click to edit)"
    };
    setRules(prev => [...prev, newRule]);
    handleEdit(newRule);
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
      description: `${rules.length} rules configured`
    });

    onComplete("mini_rules_setup", {
      miniRules: rules
    });
  };

  const getTypeColor = (type: Rule["type"]) => {
    const colors = {
      approval: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      compliance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      policy: "bg-green-500/10 text-green-600 border-green-500/20"
    };
    return colors[type];
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mini-Rules Setup
          </h3>
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Your Rules</Label>
          <Button size="sm" variant="outline" onClick={handleAddRule}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-3 rounded-lg border border-border/50 bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className={cn("mt-1 text-xs", getTypeColor(rule.type))}>
                {rule.type}
              </Badge>
              <div className="flex-1 min-w-0">
                {editingId === rule.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(rule.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(rule.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{rule.description}</p>
                )}
              </div>
              {editingId !== rule.id && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEdit(rule)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} size="lg" className="w-full">
        Save Rules & Continue
      </Button>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Step5MiniRules;
