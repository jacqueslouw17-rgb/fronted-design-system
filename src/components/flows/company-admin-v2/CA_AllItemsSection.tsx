// Flow 6 v2 - Company Admin Dashboard - All Items Section (Local to this flow only)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Search, Eye, Paperclip, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_BatchWorker } from "./CA_BatchTypes";

interface CA_AllItemsSectionProps {
  workers: CA_BatchWorker[];
  allCountries: string[];
  onViewDetails: (workerId: string) => void;
}

export const CA_AllItemsSection: React.FC<CA_AllItemsSectionProps> = ({
  workers,
  allCountries,
  onViewDetails
}) => {
  const [filter, setFilter] = useState<"all" | "employees" | "contractors">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredWorkers = workers.filter(worker => {
    if (filter === "employees" && worker.type !== "employee") return false;
    if (filter === "contractors" && worker.type !== "contractor") return false;
    if (countryFilter !== "all" && worker.country !== countryFilter) return false;
    if (searchQuery && !worker.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const employees = filteredWorkers.filter(w => w.type === "employee");
  const contractors = filteredWorkers.filter(w => w.type === "contractor");

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getAdjustmentChips = (worker: CA_BatchWorker) => {
    return worker.adjustments.map(adj => (
      <Badge 
        key={adj.id} 
        variant="outline" 
        className={cn(
          "text-[10px] mr-1",
          adj.amount >= 0 ? "bg-accent-green-fill/20 text-accent-green-text" : "bg-red-500/10 text-red-600"
        )}
      >
        {adj.label} {worker.currency} {Math.abs(adj.amount).toLocaleString()}
        {adj.hasReceipt && <Paperclip className="h-2.5 w-2.5 ml-1 inline" />}
      </Badge>
    ));
  };

  const renderWorkerRow = (worker: CA_BatchWorker) => {
    const isExpanded = expandedRows.has(worker.id);
    
    return (
      <React.Fragment key={worker.id}>
        <TableRow 
          className="hover:bg-muted/20 cursor-pointer transition-colors"
          onClick={() => toggleRow(worker.id)}
        >
          <TableCell className="w-8">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <span className="text-lg">{worker.countryFlag}</span>
              <div>
                <p className="font-medium text-foreground text-sm">{worker.name}</p>
                <Badge variant="outline" className={cn(
                  "text-[10px] mt-0.5",
                  worker.type === "employee" 
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                    : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                )}>
                  {worker.type === "employee" ? "Employee" : "Contractor"}
                </Badge>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">{worker.country}</TableCell>
          <TableCell className="text-right font-medium text-foreground">
            {worker.currency} {worker.base.toLocaleString()}
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {getAdjustmentChips(worker)}
              {worker.adjustments.length === 0 && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right text-muted-foreground">
            {worker.deductions > 0 ? `-${worker.currency} ${worker.deductions.toLocaleString()}` : "—"}
          </TableCell>
          <TableCell className="text-right font-semibold text-foreground">
            {worker.currency} {worker.netPay.toLocaleString()}
          </TableCell>
          <TableCell>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(worker.id);
              }}
              className="h-7 text-xs gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
          </TableCell>
        </TableRow>
        
        {/* Expanded Row - Line Items */}
        {isExpanded && (
          <TableRow className="bg-muted/10">
            <TableCell colSpan={8} className="p-4">
              <div className="space-y-2 ml-8">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {worker.type === "employee" ? "Payroll Breakdown" : "Invoice Line Items"}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Earnings */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">Earnings</p>
                    {worker.lineItems?.filter(li => li.type === "earning").map(li => (
                      <div key={li.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{li.name}</span>
                        <span className="font-medium text-foreground">
                          {worker.currency} {li.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Deductions (for employees) */}
                  {worker.type === "employee" && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Deductions</p>
                      {worker.lineItems?.filter(li => li.type === "deduction").map(li => (
                        <div key={li.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{li.name}</span>
                          <span className="font-medium text-red-600">
                            {worker.currency} {li.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {worker.lineItems?.filter(li => li.type === "contribution").map(li => (
                        <div key={li.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{li.name} (Employer)</span>
                          <span className="font-medium text-muted-foreground">
                            {worker.currency} {li.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-foreground">All items</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-7">All ({workers.length})</TabsTrigger>
              <TabsTrigger value="employees" className="text-xs px-3 h-7">
                <Users className="h-3.5 w-3.5 mr-1" />
                Employees ({workers.filter(w => w.type === "employee").length})
              </TabsTrigger>
              <TabsTrigger value="contractors" className="text-xs px-3 h-7">
                <Briefcase className="h-3.5 w-3.5 mr-1" />
                Contractors ({workers.filter(w => w.type === "contractor").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {allCountries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-8"></TableHead>
              <TableHead className="text-xs font-medium">Worker</TableHead>
              <TableHead className="text-xs font-medium">Country</TableHead>
              <TableHead className="text-xs font-medium text-right">Base</TableHead>
              <TableHead className="text-xs font-medium">Adjustments</TableHead>
              <TableHead className="text-xs font-medium text-right">Deductions</TableHead>
              <TableHead className="text-xs font-medium text-right">Net to Pay</TableHead>
              <TableHead className="text-xs font-medium"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.map(worker => renderWorkerRow(worker))}
          </TableBody>
        </Table>

        {/* Note about finals */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          All numbers reflect finals after your approvals.
        </p>
      </CardContent>
    </Card>
  );
};
