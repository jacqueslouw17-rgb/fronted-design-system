import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface DrawerToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

const DrawerToggle = ({ isOpen, onClick }: DrawerToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className="relative"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <PanelLeftOpen className={`h-5 w-5 ${isOpen ? "text-accent" : ""}`} />
          </motion.div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isOpen ? "Close Dashboard" : "Open Dashboard"} (⌘D)</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DrawerToggle;
