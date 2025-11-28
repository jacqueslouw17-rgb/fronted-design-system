/**
 * Flow 6 – Company Admin Dashboard v1
 * 
 * Single-tenant dashboard for company admins to view their certified workers
 * and access their contracts and certificates.
 */

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Search, Download, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { toast } from "sonner";

// Mock data for certified workers
const mockCertifiedWorkers = [
  {
    id: "1",
    name: "Maria Santos",
    role: "Senior Backend Engineer",
    country: "Philippines",
    countryFlag: "🇵🇭",
    employmentType: "Contractor" as const,
    salary: "PHP 85,000/mo",
    status: "Certified",
  },
  {
    id: "2",
    name: "John Chen",
    role: "Product Designer",
    country: "Singapore",
    countryFlag: "🇸🇬",
    employmentType: "Employee" as const,
    salary: "SGD 6,500/mo",
    status: "Certified",
  },
  {
    id: "3",
    name: "Sarah Williams",
    role: "Frontend Developer",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
    employmentType: "Contractor" as const,
    salary: "GBP 4,800/mo",
    status: "Certified",
  },
];

const CompanyAdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock company data - in production, this would come from auth context
  const companyName = "Acme Corp";

  // Filter workers based on search query
  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return mockCertifiedWorkers;
    
    const query = searchQuery.toLowerCase();
    return mockCertifiedWorkers.filter(
      (worker) =>
        worker.name.toLowerCase().includes(query) ||
        worker.role.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleViewCertificate = (workerName: string) => {
    toast.success(`Opening certificate for ${workerName}...`);
    // In production, this would open the actual certificate
  };

  const handleDownloadContract = (workerName: string) => {
    toast.info(`Downloading contract bundle for ${workerName}...`);
    // In production, this would trigger the actual download
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
          {/* Top Header - No company dropdown for single-tenant */}
          <Topbar 
            userName="Admin User" 
            profileSettingsUrl="/admin/profile-settings" 
            dashboardUrl="/flows/company-admin-dashboard"
          />

          {/* Main Content Area with Agent Layout */}
          <AgentLayout context="Company Admin Dashboard">
            <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative">
              {/* Static background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
                <div
                  className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))",
                  }}
                />
                <div
                  className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                  style={{
                    background:
                      "linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))",
                  }}
                />
              </div>

              <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-20 sm:pb-32 space-y-6 sm:space-y-8 relative z-10">
                {/* Agent Header */}
                <AgentHeader
                  title={`Welcome back, ${companyName}!`}
                  subtitle="View your certified workers and access their contracts and certificates."
                  showPulse={true}
                  showInput={false}
                  simplified={false}
                />

                {/* Certified Workers Section */}
                <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Certified workers</CardTitle>
                        <CardDescription>
                          {filteredWorkers.length === 0 && searchQuery
                            ? "No workers match your search"
                            : `${filteredWorkers.length} certified worker${filteredWorkers.length !== 1 ? "s" : ""}`}
                        </CardDescription>
                      </div>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search workers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 bg-background/60"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {mockCertifiedWorkers.length === 0 ? (
                      // Empty state - no certified workers yet
                      <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="rounded-full bg-primary/5 p-5 mb-5">
                          <Users className="h-10 w-10 text-primary/40" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                          No certified workers yet
                        </h3>
                        <p className="text-sm text-muted-foreground/80 text-center max-w-sm leading-relaxed">
                          Once Fronted completes contracting and certification for your hires,
                          they'll appear here automatically.
                        </p>
                      </div>
                    ) : filteredWorkers.length === 0 ? (
                      // No search results
                      <div className="flex flex-col items-center justify-center py-12 px-6">
                        <Search className="h-10 w-10 text-muted-foreground/40 mb-4" />
                        <p className="text-sm text-muted-foreground text-center">
                          No workers found matching "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      // Worker list
                      <div className="space-y-3">
                        {filteredWorkers.map((worker) => (
                          <div
                            key={worker.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Avatar */}
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                  {getInitials(worker.name)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Worker info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {worker.name}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-primary/5 text-primary border-primary/20"
                                  >
                                    {worker.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{worker.role}</span>
                                  <span className="flex items-center gap-1">
                                    <span>{worker.countryFlag}</span>
                                    <span>{worker.country}</span>
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {worker.employmentType}
                                  </Badge>
                                  {worker.salary && (
                                    <span className="font-medium">{worker.salary}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCertificate(worker.name)}
                              >
                                <Award className="h-4 w-4 mr-1.5" />
                                View Certificate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadContract(worker.name)}
                              >
                                <Download className="h-4 w-4 mr-1.5" />
                                Download Contract Bundle
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </AgentLayout>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CompanyAdminDashboard;
