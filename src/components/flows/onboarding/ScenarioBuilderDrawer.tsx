import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export interface Scenario {
  id: string;
  name: string;
  trigger: string;
  action: string;
  country: string;
  impact: string;
  impactValue: string;
}

interface LogicCondition {
  id: string;
  type: "if" | "then";
  value: string;
}

interface ScenarioBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (scenario: Scenario) => void;
  editingScenario?: Scenario | null;
}

const ScenarioBuilderDrawer = ({ open, onOpenChange, onSave, editingScenario }: ScenarioBuilderDrawerProps) => {
  const [name, setName] = useState(editingScenario?.name || "");
  const [trigger, setTrigger] = useState(editingScenario?.trigger || "");
  const [action, setAction] = useState(editingScenario?.action || "");
  const [country, setCountry] = useState(editingScenario?.country || "");
  const [conditions, setConditions] = useState<LogicCondition[]>([
    { id: "1", type: "if", value: "" }
  ]);

  const handleAddCondition = (type: "if" | "then") => {
    setConditions([...conditions, { id: Date.now().toString(), type, value: "" }]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const handleConditionChange = (id: string, value: string) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, value } : c));
  };

  const handleSave = () => {
    const scenario: Scenario = {
      id: editingScenario?.id || Date.now().toString(),
      name,
      trigger,
      action,
      country,
      impact: "4.8% improvement in payout timing",
      impactValue: "4.8% Faster"
    };
    onSave(scenario);
    handleReset();
  };

  const handleReset = () => {
    setName("");
    setTrigger("");
    setAction("");
    setCountry("");
    setConditions([{ id: "1", type: "if", value: "" }]);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[50vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Scenario Rule</SheetTitle>
          <SheetDescription className="flex items-start gap-2 text-sm pt-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              This is where you can model real-world conditions. Let's make Fronted adapt automatically to your scenarios.
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          {/* Scenario Name */}
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Scenario Name</Label>
            <Input
              id="scenario-name"
              placeholder="e.g. Bi-Weekly Payroll PH"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Trigger Event */}
          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger Event</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger id="trigger">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fx_variance">FX variance &gt; 3%</SelectItem>
                <SelectItem value="contract_signed">Contract signed</SelectItem>
                <SelectItem value="holiday_detected">Holiday detected</SelectItem>
                <SelectItem value="batch_size">Payroll batch &gt; 100k</SelectItem>
                <SelectItem value="doc_expiry">Document expiring soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notify_cfo">Notify CFO</SelectItem>
                <SelectItem value="delay_batch">Delay batch</SelectItem>
                <SelectItem value="switch_provider">Switch FX provider</SelectItem>
                <SelectItem value="adjust_rate">Adjust rate</SelectItem>
                <SelectItem value="send_reminder">Send reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logic Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Condition Logic</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddCondition("if")}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  IF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddCondition("then")}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  THEN
                </Button>
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-card/30">
              <AnimatePresence mode="popLayout">
                {conditions.map((condition, index) => (
                  <motion.div
                    key={condition.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Badge variant="secondary" className="uppercase text-xs">
                      {condition.type}
                    </Badge>
                    <Input
                      placeholder={`Enter ${condition.type} condition`}
                      value={condition.value}
                      onChange={(e) => handleConditionChange(condition.id, e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    {conditions.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCondition(condition.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Apply To */}
          <div className="space-y-2">
            <Label htmlFor="country">Apply To</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country or workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
                <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
                <SelectItem value="all">All Countries</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={!name || !trigger || !action || !country}>
              {editingScenario ? "Update Scenario" : "Save Scenario"}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScenarioBuilderDrawer;
