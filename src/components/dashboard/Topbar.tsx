import { ArrowLeft, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import frontedLogo from "@/assets/fronted-logo.png";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  profileSettingsUrl?: string; // Custom profile settings URL
  profileMenuLabel?: string; // Custom label for profile menu item (default: "Profile Settings")
  dashboardUrl?: string; // Custom dashboard URL for logo click
  companySwitcher?: {
    companies: Array<{ id: string; name: string }>;
    selectedCompany: string;
    onCompanyChange: (companyId: string) => void;
  };
}

const Topbar = ({ userName, version, onVersionChange, isAgentOpen, onAgentToggle, isDrawerOpen, onDrawerToggle, profileSettingsUrl = "/admin/profile-settings", profileMenuLabel, dashboardUrl, companySwitcher }: TopbarProps) => {
  const navigate = useNavigate();
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchValue, setCompanySearchValue] = useState("");
  
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  const showVersionSelector = version && onVersionChange;
  
  const highlightMatch = (text: string, search: string) => {
    if (!search) return <span>{text}</span>;
    
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return <span>{text}</span>;
    
    return (
      <span>
        <span>{text.slice(0, index)}</span>
        <span className="text-muted-foreground/40">{text.slice(index, index + search.length)}</span>
        <span>{text.slice(index + search.length)}</span>
      </span>
    );
  };
  
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
    <header className="sticky top-0 z-50 h-14 sm:h-16 border-b bg-card flex items-center justify-between px-3 sm:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/?tab=flows")}
          className="hover:bg-transparent flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        {/* Version Selector (only on Dashboard pattern) - hidden on mobile */}
        {showVersionSelector && (
          <Select value={version} onValueChange={onVersionChange}>
            <SelectTrigger className="w-16 sm:w-20 h-8 sm:h-9 text-xs sm:text-sm hidden sm:flex">
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
        
        <img 
          src={frontedLogo}
          alt="Fronted"
          className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          onClick={() => navigate(dashboardUrl || '/candidate-dashboard')}
        />
        
        {/* Company Switcher */}
        {companySwitcher && (
          <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={companySearchOpen}
                className="w-[280px] h-8 sm:h-9 text-xs sm:text-sm bg-background justify-between"
              >
                <span className="truncate">
                  {companySwitcher.selectedCompany === "add-new" 
                    ? "Select company..."
                    : companySwitcher.companies.find((c) => c.id === companySwitcher.selectedCompany)?.name || "Select company..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-background z-50" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search companies..." 
                  value={companySearchValue}
                  onValueChange={setCompanySearchValue}
                />
                <div className="border-b">
                  <CommandItem
                    value="add-new"
                    onSelect={() => {
                      companySwitcher.onCompanyChange("add-new");
                      setCompanySearchOpen(false);
                      setCompanySearchValue("");
                    }}
                    className="text-primary font-medium"
                  >
                    <span className="text-lg mr-2">+</span>
                    Add New Company
                  </CommandItem>
                </div>
                <CommandList className="max-h-[240px]">
                  <CommandEmpty>No company found.</CommandEmpty>
                  <CommandGroup>
                    {[...companySwitcher.companies].sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                      <CommandItem
                        key={company.id}
                        value={company.name}
                        onSelect={() => {
                          companySwitcher.onCompanyChange(company.id);
                          setCompanySearchOpen(false);
                          setCompanySearchValue("");
                        }}
                        className="truncate"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            companySwitcher.selectedCompany === company.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">
                          {highlightMatch(company.name, companySearchValue)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        {/* Agent Toggle - only shown in v2, left of notifications */}
        {version === "v2" && onAgentToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAgentToggle}
            className="relative h-8 w-8 sm:h-10 sm:w-10"
          >
            <PanelLeftOpen className="h-4 w-4 sm:h-5 sm:w-5" />
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
            <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(profileSettingsUrl)}>
              {profileMenuLabel || "Profile Settings"}
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
