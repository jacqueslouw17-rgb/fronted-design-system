import { LayoutDashboard, DollarSign, FileCheck, Headphones, Settings, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavSidebarProps {
  onGenieToggle: () => void;
  isGenieOpen: boolean;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: DollarSign, label: "Payroll", active: false },
  { icon: FileCheck, label: "Compliance", active: false },
  { icon: Headphones, label: "Support", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const NavSidebar = ({ onGenieToggle, isGenieOpen }: NavSidebarProps) => {
  return (
    <aside className="w-16 border-r bg-card flex flex-col items-center py-4 gap-2 flex-shrink-0">
      {/* Genie Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isGenieOpen ? "default" : "ghost"}
            size="icon"
            onClick={onGenieToggle}
            className="mb-4"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{isGenieOpen ? "Close" : "Open"} Genie</p>
        </TooltipContent>
      </Tooltip>

      {/* Navigation Items */}
      {navItems.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <Button
              variant={item.active ? "default" : "ghost"}
              size="icon"
              className={item.active ? "" : "hover:bg-muted"}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </aside>
  );
};

export default NavSidebar;
