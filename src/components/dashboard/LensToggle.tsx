import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoleLens, UserRole } from "@/contexts/RoleLensContext";
import { Eye, Shield, DollarSign, Users, User } from "lucide-react";

const LensToggle = () => {
  const { currentLens, setRole } = useRoleLens();

  const roles: { value: UserRole; label: string; icon: typeof Shield; description: string }[] = [
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Global overview & controls' },
    { value: 'hr', label: 'HR Lead', icon: Users, description: 'Onboarding & contracts' },
    { value: 'cfo', label: 'CFO', icon: DollarSign, description: 'Finance & approvals' },
    { value: 'contractor', label: 'Contractor', icon: User, description: 'Self-service portal' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Switch Lens
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>View as Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = currentLens.role === role.value;
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => setRole(role.value)}
              className={isActive ? "bg-primary/5 border border-primary/40" : "hover:bg-primary/5 hover:border hover:border-primary/40"}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LensToggle;
