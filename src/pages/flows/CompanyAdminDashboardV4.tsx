/**
 * Flow 6 — Company Admin Dashboard v4 (Agent)
 * 
 * Isolated clone of v3. Changes here do NOT affect v3 or any other versions.
 * Uses CA4_ prefixed components for complete isolation.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, ChevronDown, Settings, LogOut, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CA4_PayrollSection, CA4_LeavesTab } from "@/components/flows/company-admin-v4";

const companies = [
  { id: "acme-uk", name: "Acme Corp UK", country: "GB", employeeCount: 45 },
  { id: "acme-de", name: "Acme GmbH", country: "DE", employeeCount: 23 },
  { id: "acme-us", name: "Acme Inc", country: "US", employeeCount: 78 },
];

const CompanyAdminDashboardV4 = () => {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [activeTab, setActiveTab] = useState<"payroll" | "leaves">("payroll");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/flows">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Company Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-9">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedCompany.name}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedCompany.employeeCount}
                  </Badge>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{company.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {company.employeeCount}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Agent Badge */}
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <Bot className="h-3 w-3" />
              Agent
            </Badge>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-sm">Admin</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative min-h-full">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Content */}
          {activeTab === "payroll" ? (
            <CA4_PayrollSection payPeriod="January 2025" />
          ) : (
            <CA4_LeavesTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboardV4;
