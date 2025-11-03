import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface FeeToggleSwitchProps {
  feeModel: "GROSS" | "TOTAL_COST";
  onChange: (model: "GROSS" | "TOTAL_COST") => void;
}

export const FeeToggleSwitch = ({ feeModel, onChange }: FeeToggleSwitchProps) => {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
      <Label htmlFor="fee-model" className="text-sm font-medium">
        Fee Model:
      </Label>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${feeModel === "GROSS" ? "font-medium text-foreground" : "text-muted-foreground"}`}>
          GROSS
        </span>
        <Switch
          id="fee-model"
          checked={feeModel === "TOTAL_COST"}
          onCheckedChange={(checked) => onChange(checked ? "TOTAL_COST" : "GROSS")}
        />
        <span className={`text-xs ${feeModel === "TOTAL_COST" ? "font-medium text-foreground" : "text-muted-foreground"}`}>
          TOTAL COST
        </span>
      </div>
    </div>
  );
};
