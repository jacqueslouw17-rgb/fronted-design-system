import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Scenario } from "./ScenarioBuilderDrawer";

interface ScenarioCompareViewProps {
  scenarios: Scenario[];
}

const getCountryName = (code: string) => {
  const names: Record<string, string> = {
    PH: "Philippines",
    NO: "Norway",
    IN: "India",
    XK: "Kosovo",
    all: "All Countries"
  };
  return names[code] || code;
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

const ScenarioCompareView = ({ scenarios }: ScenarioCompareViewProps) => {
  if (scenarios.length < 2) return null;

  const [scenarioA, scenarioB] = scenarios.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Here's how each scenario behaves side by side.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Column Headers */}
          <div className="p-4 bg-muted/30">
            <h4 className="font-semibold text-sm">Comparison</h4>
          </div>
          <div className="p-4 bg-muted/30">
            <h4 className="font-semibold text-sm">{scenarioA.name}</h4>
          </div>
          <div className="p-4 bg-muted/30">
            <h4 className="font-semibold text-sm">{scenarioB.name}</h4>
          </div>

          {/* Trigger Row */}
          <div className="p-4">
            <span className="text-sm font-medium text-muted-foreground">Trigger</span>
          </div>
          <div className="p-4">
            <span className="text-sm">{getTriggerLabel(scenarioA.trigger)}</span>
          </div>
          <div className="p-4">
            <span className="text-sm">{getTriggerLabel(scenarioB.trigger)}</span>
          </div>

          {/* Action Row */}
          <div className="p-4">
            <span className="text-sm font-medium text-muted-foreground">Action</span>
          </div>
          <div className="p-4">
            <span className="text-sm">{getActionLabel(scenarioA.action)}</span>
          </div>
          <div className="p-4">
            <span className="text-sm">{getActionLabel(scenarioB.action)}</span>
          </div>

          {/* Country Row */}
          <div className="p-4">
            <span className="text-sm font-medium text-muted-foreground">Country</span>
          </div>
          <div className="p-4">
            <span className="text-sm">{getCountryName(scenarioA.country)}</span>
          </div>
          <div className="p-4">
            <span className="text-sm">{getCountryName(scenarioB.country)}</span>
          </div>

          {/* Expected Impact Row */}
          <div className="p-4">
            <span className="text-sm font-medium text-muted-foreground">Expected Impact</span>
          </div>
          <div className="p-4">
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              {scenarioA.impactValue}
            </Badge>
          </div>
          <div className="p-4">
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              {scenarioB.impactValue}
            </Badge>
          </div>

          {/* Key Difference Row */}
          <div className="p-4 bg-muted/10">
            <span className="text-sm font-medium text-muted-foreground">Key Difference</span>
          </div>
          <div className="p-4 bg-muted/10 col-span-2">
            <div className="flex items-center gap-2 text-sm">
              <span>Scenario B saves more on FX but adds a 1-day delay</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-start gap-2 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
        <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Looks like Scenario B saves more on FX but adds a 1-day delay.
        </p>
      </div>
    </motion.div>
  );
};

export default ScenarioCompareView;
