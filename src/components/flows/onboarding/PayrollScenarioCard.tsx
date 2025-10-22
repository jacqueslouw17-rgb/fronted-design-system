import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Globe, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { PayrollScenario } from "./PayrollScenarioModal";

interface PayrollScenarioCardProps {
  scenario: PayrollScenario;
  onEdit: (scenario: PayrollScenario) => void;
  onDelete: (id: string) => void;
  index: number;
}

const countryFlags: Record<string, string> = {
  NO: "🇳🇴",
  PH: "🇵🇭",
  IN: "🇮🇳",
  XK: "🇽🇰",
  global: "🌍"
};

const PayrollScenarioCard = ({ scenario, onEdit, onDelete, index }: PayrollScenarioCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="p-3 bg-card/60 border-border/50 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{countryFlags[scenario.country]}</span>
            <div>
              <h4 className="text-sm font-medium">{scenario.name}</h4>
              <p className="text-xs text-muted-foreground capitalize">{scenario.frequency}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onEdit(scenario)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(scenario.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Day {scenario.payoutDay}</span>
          </div>
          {scenario.includeBonusCycle && (
            <Badge variant="secondary" className="text-xs h-5 px-2">
              Bonus Cycle
            </Badge>
          )}
          {scenario.applyFxAdjustment && (
            <Badge variant="secondary" className="text-xs h-5 px-2">
              <Globe className="h-3 w-3 mr-1" />
              FX Auto
            </Badge>
          )}
          {scenario.useDualApproval && (
            <Badge variant="secondary" className="text-xs h-5 px-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Dual Approval
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PayrollScenarioCard;
