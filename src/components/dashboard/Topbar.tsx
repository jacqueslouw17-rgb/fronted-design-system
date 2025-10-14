import { Search, ArrowLeft, PanelLeftOpen, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import ToneChip from "./ToneChip";
import LensToggle from "./LensToggle";

interface TopbarProps {
  userName: string;
  version?: "v1" | "v2";
  onVersionChange?: (version: "v1" | "v2") => void;
  isAgentOpen?: boolean;
  onAgentToggle?: () => void;
}

const Topbar = ({ userName, version, onVersionChange, isAgentOpen, onAgentToggle }: TopbarProps) => {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  const showVersionSelector = version && onVersionChange;

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (window.location.href = "/")}
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
        
        {/* When agent is open, collapse actions into menu */}
        {isAgentOpen ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Tone</span>
                  <ToneChip />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Lens</span>
                  <LensToggle />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            {/* Normal state - show actions directly */}
            <ToneChip />
            <LensToggle />
          </>
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
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
