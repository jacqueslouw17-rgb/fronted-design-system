import { Badge } from "@/components/ui/badge";
import { ContextType } from "@/hooks/useContextTracker";

interface ContextChipProps {
  contextName: string;
  contextType: ContextType;
  contextId: string;
  onClick?: () => void;
}

const contextTypeColors = {
  payroll: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  contract: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  compliance: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  support: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  dashboard: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const ContextChip = ({ contextName, contextType, contextId, onClick }: ContextChipProps) => {
  return (
    <Badge
      variant="outline"
      className={`text-xs cursor-pointer hover:bg-muted/50 transition-colors ${contextTypeColors[contextType]}`}
      onClick={onClick}
    >
      {contextName}
    </Badge>
  );
};

export default ContextChip;
