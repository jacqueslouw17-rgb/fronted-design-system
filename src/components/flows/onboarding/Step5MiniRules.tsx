import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mini-Rules Setup</h2>
        <p className="text-muted-foreground">
          Create starter rules for approvals, compliance, and policies. You can edit these anytime.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Rules
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className={cn("mt-1", getTypeColor(rule.type))}>
                  {rule.type}
                </Badge>
                <div className="flex-1">
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
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(rule)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-2">💡 Genie Tip</p>
          <p className="text-sm text-muted-foreground">
            These rules will appear as badges throughout the app and can be edited inline. They help
            enforce consistency across your contractor operations.
          </p>
        </CardContent>
      </Card>

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
