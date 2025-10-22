import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Scenario } from "./ScenarioBuilderDrawer";

interface ScenarioPreviewCardProps {
  scenario: Scenario;
  onEdit: (scenario: Scenario) => void;
  onDelete: (id: string) => void;
  index: number;
}

const getCountryFlag = (country: string) => {
  const flags: Record<string, string> = {
    PH: "🇵🇭",
    NO: "🇳🇴",
    IN: "🇮🇳",
    XK: "🇽🇰",
    all: "🌍"
  };
  return flags[country] || "🌍";
};

const getTriggerLabel = (trigger: string) => {
  const labels: Record<string, string> = {
    fx_variance: "FX variance > 3%",
    contract_signed: "Contract signed",
    holiday_detected: "Holiday detected",
    batch_size: "Payroll batch > 100k",
    doc_expiry: "Document expiring soon"
  };
  return labels[trigger] || trigger;
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    notify_cfo: "Notify CFO",
    delay_batch: "Delay batch",
    switch_provider: "Switch FX provider",
    adjust_rate: "Adjust rate",
    send_reminder: "Send reminder"
  };
  return labels[action] || action;
};

const ScenarioPreviewCard = ({ scenario, onEdit, onDelete, index }: ScenarioPreviewCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.15 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">
                Scenario: {scenario.name} {getCountryFlag(scenario.country)}
              </h4>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[60px]">Trigger:</span>
                <span>{getTriggerLabel(scenario.trigger)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[60px]">Action:</span>
                <span>{getActionLabel(scenario.action)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[60px]">Impact:</span>
                <span>{scenario.impact}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                {scenario.impactValue}
              </Badge>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(scenario)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(scenario.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ScenarioPreviewCard;
