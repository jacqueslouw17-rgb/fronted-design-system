// Flow 6 v2 - Company Admin Dashboard - Client Review Section (Local to this flow only)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, X, Eye, Paperclip, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_BatchAdjustment } from "./CA_BatchTypes";

interface CA_ClientReviewSectionProps {
  items: CA_BatchAdjustment[];
  allCountries: string[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
  onApproveAll: () => void;
}

export const CA_ClientReviewSection: React.FC<CA_ClientReviewSectionProps> = ({
  items,
  allCountries,
  onApprove,
  onReject,
  onView,
  onApproveAll
}) => {
  const [filter, setFilter] = useState<"all" | "employees" | "contractors">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingItems = items.filter(item => item.status === "client_review");
  
  const filteredItems = pendingItems.filter(item => {
    if (filter === "employees" && item.workerType !== "employee") return false;
    if (filter === "contractors" && item.workerType !== "contractor") return false;
    if (countryFilter !== "all" && item.workerCountry !== countryFilter) return false;
    if (searchQuery && !item.workerName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "bonus": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "overtime": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "expense": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "correction": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "additional_hours": return "bg-cyan-500/20 text-cyan-600 border-cyan-500/30";
      default: return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  if (pendingItems.length === 0) {
    return (
      <Card className="border-accent-green-outline/30 bg-accent-green-fill/10">
        <CardContent className="py-8 flex items-center justify-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
          <span className="text-accent-green-text font-medium">
            ✅ All adjustments reviewed. You can approve the batch.
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Adjustments requiring your approval ({pendingItems.length})
          </h3>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onApproveAll}
            className="h-8 gap-2 bg-accent-green-fill hover:bg-accent-green-fill/90 text-accent-green-text"
          >
            <Check className="h-4 w-4" />
            Approve All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-7">All</TabsTrigger>
              <TabsTrigger value="employees" className="text-xs px-3 h-7">Employees</TabsTrigger>
              <TabsTrigger value="contractors" className="text-xs px-3 h-7">Contractors</TabsTrigger>
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
              placeholder="Search worker..." 
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
              <TableHead className="text-xs font-medium">Worker</TableHead>
              <TableHead className="text-xs font-medium">Type</TableHead>
              <TableHead className="text-xs font-medium">Country</TableHead>
              <TableHead className="text-xs font-medium text-right">Amount</TableHead>
              <TableHead className="text-xs font-medium">Notes/Receipt</TableHead>
              <TableHead className="text-xs font-medium text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
              <TableRow key={item.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.workerCountryFlag}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.workerName}</p>
                      <Badge variant="outline" className={cn(
                        "text-[10px] mt-0.5",
                        item.workerType === "employee" 
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30" 
                          : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                      )}>
                        {item.workerType === "employee" ? "Employee" : "Contractor"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs capitalize", getTypeBadgeColor(item.type))}>
                    {item.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.workerCountry}</TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {item.amount >= 0 ? "+" : ""}{item.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {item.description}
                    </span>
                    {item.hasReceipt && (
                      <Paperclip className="h-3.5 w-3.5 text-primary cursor-pointer hover:text-primary/80" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onApprove(item.id)}
                      className="h-7 w-7 p-0 text-accent-green-text hover:bg-accent-green-fill/20"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onReject(item.id)}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(item.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
