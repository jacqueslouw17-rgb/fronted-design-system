import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRoleLens } from "@/contexts/RoleLensContext";
import { motion } from "framer-motion";

const ToneChip = () => {
  const { currentLens } = useRoleLens();

  const roleLabels = {
    admin: "Admin Lens",
    hr: "HR Lens",
    cfo: "Financial Lens",
    contractor: "Contractor Lens",
  };

  const roleColors = {
    admin: "bg-primary/10 text-primary border-primary/20",
    hr: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    cfo: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    contractor: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          key={currentLens.role}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Badge variant="outline" className={`${roleColors[currentLens.role]} border`}>
            {roleLabels[currentLens.role]}
          </Badge>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">{currentLens.tone}</p>
          <p className="text-xs text-muted-foreground">{currentLens.uiFocus}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ToneChip;
