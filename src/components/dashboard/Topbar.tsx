import { Search, ArrowLeft, PanelLeftOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawerToggle from "./DrawerToggle";

interface TopbarProps {
  userName: string;
  version?: "v1" | "v2" | "v3" | "v4" | "v5";
  onVersionChange?: (version: "v1" | "v2" | "v3" | "v4" | "v5") => void;
  isAgentOpen?: boolean;
  onAgentToggle?: () => void;
  isDrawerOpen?: boolean;
  onDrawerToggle?: () => void;
}

const Topbar = ({ userName, version, onVersionChange, isAgentOpen, onAgentToggle, isDrawerOpen, onDrawerToggle }: TopbarProps) => {
  const navigate = useNavigate();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  const showVersionSelector = version && onVersionChange;
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Version Selector (only on Dashboard pattern) */}
        {showVersionSelector && (
          <Select value={version} onValueChange={onVersionChange}>
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v1">v1</SelectItem>
              <SelectItem value="v2">v2</SelectItem>
              <SelectItem value="v3">v3</SelectItem>
              <SelectItem value="v4">v4 (Payroll Demo)</SelectItem>
              <SelectItem value="v5">v5 (Pitch Demo)</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <h1 className="text-xl font-bold text-primary">Fronted</h1>
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Agent Toggle - only shown in v2, left of notifications */}
        {version === "v2" && onAgentToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAgentToggle}
            className="relative"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        )}
        
        {/* Drawer Toggle - only shown in v3 and v5 */}
        {(version === "v3" || version === "v5") && onDrawerToggle && (
          <DrawerToggle isOpen={isDrawerOpen || false} onClick={onDrawerToggle} />
        )}
        
        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile-settings")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
