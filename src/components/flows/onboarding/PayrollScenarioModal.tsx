import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export interface PayrollScenario {
  id: string;
  name: string;
  country: string;
  frequency: string;
  payoutDay: string;
  includeBonusCycle: boolean;
  applyFxAdjustment: boolean;
  useDualApproval: boolean;
}

interface PayrollScenarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (scenario: PayrollScenario) => void;
  editingScenario?: PayrollScenario | null;
}

const PayrollScenarioModal = ({ open, onOpenChange, onSave, editingScenario }: PayrollScenarioModalProps) => {
  const [formData, setFormData] = useState<Omit<PayrollScenario, 'id'>>({
    name: "",
    country: "",
    frequency: "monthly",
    payoutDay: "25",
    includeBonusCycle: false,
    applyFxAdjustment: true,
    useDualApproval: true
  });

  useEffect(() => {
    if (editingScenario) {
      setFormData({
        name: editingScenario.name,
        country: editingScenario.country,
        frequency: editingScenario.frequency,
        payoutDay: editingScenario.payoutDay,
        includeBonusCycle: editingScenario.includeBonusCycle,
        applyFxAdjustment: editingScenario.applyFxAdjustment,
        useDualApproval: editingScenario.useDualApproval
      });
    } else {
      setFormData({
        name: "",
        country: "",
        frequency: "monthly",
        payoutDay: "25",
        includeBonusCycle: false,
        applyFxAdjustment: true,
        useDualApproval: true
      });
    }
  }, [editingScenario, open]);

  const handleSave = () => {
    if (!formData.name || !formData.country) return;
    
    const scenario: PayrollScenario = {
      id: editingScenario?.id || `ps_${Date.now()}`,
      ...formData
    };
    
    onSave(scenario);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {editingScenario ? "Edit Payroll Configuration" : "Add Payroll Configuration"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 mb-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            You can configure different payroll setups per country or team. I'll make sure FX and approval rules apply automatically.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Configuration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Bi-Weekly Philippines"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm">Country or Team</Label>
            <Select value={formData.country} onValueChange={(val) => setFormData(prev => ({ ...prev, country: val }))}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
                <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
                <SelectItem value="global">🌍 Global Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm">Frequency</Label>
            <Select value={formData.frequency} onValueChange={(val) => setFormData(prev => ({ ...prev, frequency: val }))}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutDay" className="text-sm">Payout Day(s)</Label>
            <Input
              id="payoutDay"
              placeholder="e.g., 15 or 15,30"
              value={formData.payoutDay}
              onChange={(e) => setFormData(prev => ({ ...prev, payoutDay: e.target.value }))}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">Use commas for multiple days</p>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bonusCycle" className="text-sm">Include Bonus Cycle</Label>
                <p className="text-xs text-muted-foreground">Add 13th month or bonuses</p>
              </div>
              <Switch
                id="bonusCycle"
                checked={formData.includeBonusCycle}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeBonusCycle: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fxAdjustment" className="text-sm">Apply FX Adjustment Rules</Label>
                <p className="text-xs text-muted-foreground">Auto-adjust for currency changes</p>
              </div>
              <Switch
                id="fxAdjustment"
                checked={formData.applyFxAdjustment}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, applyFxAdjustment: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dualApproval" className="text-sm">Use Dual Approval</Label>
                <p className="text-xs text-muted-foreground">Require two approvers</p>
              </div>
              <Switch
                id="dualApproval"
                checked={formData.useDualApproval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useDualApproval: checked }))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.country} className="flex-1">
            {editingScenario ? "Update" : "Add"} Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollScenarioModal;
