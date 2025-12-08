/**
 * Flow 6 v2 - Workers Tab
 * 
 * Contains the certified workers list view from the original v1 dashboard.
 * This is the "Workers" tab content in the Workers | Payroll toggle.
 */

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Search, Download, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface CertifiedWorker {
  id: string;
  name: string;
  role: string;
  country: string;
  countryFlag: string;
  employmentType: "Contractor" | "Employee";
  salary?: string;
  status: string;
}

interface F6v2_WorkersTabProps {
  workers: CertifiedWorker[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const F6v2_WorkersTab = ({ workers, searchQuery, onSearchChange }: F6v2_WorkersTabProps) => {
  // Filter workers based on search query
  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return workers;
    const query = searchQuery.toLowerCase();
    return workers.filter(worker => 
      worker.name.toLowerCase().includes(query) || 
      worker.role.toLowerCase().includes(query)
    );
  }, [searchQuery, workers]);

  const handleViewCertificate = (workerName: string) => {
    toast.success(`Opening certificate for ${workerName}...`);
  };

  const handleDownloadContract = (workerName: string) => {
    toast.info(`Downloading contract bundle for ${workerName}...`);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
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
              onChange={e => onSearchChange(e.target.value)} 
              className="pl-9 bg-background/60" 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {workers.length === 0 ? (
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
            {filteredWorkers.map(worker => (
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
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                        {worker.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{worker.role}</span>
                      <span className="flex items-center gap-1">
                        <span>{worker.countryFlag}</span>
                        <span>{worker.country}</span>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {worker.employmentType}
                      </Badge>
                      {worker.salary && <span className="font-medium">{worker.salary}</span>}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleViewCertificate(worker.name)} 
                        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                      >
                        <Award className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View certificate</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDownloadContract(worker.name)} 
                        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download contract bundle</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default F6v2_WorkersTab;
