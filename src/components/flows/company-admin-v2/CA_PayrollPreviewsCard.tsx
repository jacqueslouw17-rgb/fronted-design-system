// Flow 6 v2 - Company Admin Dashboard - Payroll Previews Card (Local to this flow only)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, Edit, Copy, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_WorkerPreviewRow } from "./CA_PayrollTypes";

interface CA_PayrollPreviewsCardProps {
  employeeData: CA_WorkerPreviewRow[];
  contractorData: CA_WorkerPreviewRow[];
  onViewWorker: (workerId: string) => void;
  onEditWorker: (workerId: string) => void;
  onApplyToAll: (workerId: string, scope: "country" | "currency") => void;
}

export const CA_PayrollPreviewsCard: React.FC<CA_PayrollPreviewsCardProps> = ({
  employeeData,
  contractorData,
  onViewWorker,
  onEditWorker,
  onApplyToAll
}) => {
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [contractorsOpen, setContractorsOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const toggleRowExpand = (id: string) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(r => r !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const renderWorkerTable = (data: CA_WorkerPreviewRow[], type: "employee" | "contractor") => (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-medium w-8"></TableHead>
            <TableHead className="text-xs font-medium">Worker</TableHead>
            <TableHead className="text-xs font-medium">Country</TableHead>
            <TableHead className="text-xs font-medium text-right">Base</TableHead>
            <TableHead className="text-xs font-medium">Adjustments</TableHead>
            {type === "employee" && (
              <TableHead className="text-xs font-medium text-right">Deductions</TableHead>
            )}
            <TableHead className="text-xs font-medium text-right">Net</TableHead>
            <TableHead className="text-xs font-medium text-right w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => {
            const isExpanded = expandedRows.includes(row.id);
            
            return (
              <React.Fragment key={row.id}>
                <TableRow className={cn(idx % 2 === 0 && "bg-muted/10", "hover:bg-muted/20")}>
                  <TableCell className="w-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRowExpand(row.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{row.name}</TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1.5">
                      <span>{row.countryFlag}</span>
                      <span className="text-muted-foreground">{row.country}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.base, row.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap">
                      {row.adjustments.length > 0 ? (
                        row.adjustments.map((adj, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              adj.amount > 0 ? "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30" : "bg-destructive/10 text-destructive border-destructive/30"
                            )}
                          >
                            {adj.label} {row.currency}{Math.abs(adj.amount).toLocaleString()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  {type === "employee" && (
                    <TableCell className="text-right text-sm text-amber-600">
                      {row.deductions > 0 ? `-${formatCurrency(row.deductions, row.currency)}` : "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(row.netPay, row.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onViewWorker(row.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {row.isClientEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onEditWorker(row.id)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Expanded Row */}
                {isExpanded && (
                  <TableRow className="bg-muted/5">
                    <TableCell colSpan={type === "employee" ? 8 : 7} className="p-4">
                      <div className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          <strong>Line items breakdown (read-only)</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Base salary</span>
                              <span>{formatCurrency(row.base, row.currency)}</span>
                            </div>
                            {row.adjustments.map((adj, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="text-muted-foreground">{adj.label}</span>
                                <span className={adj.amount > 0 ? "text-accent-green-text" : "text-destructive"}>
                                  {adj.amount > 0 ? "+" : ""}{formatCurrency(adj.amount, row.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {type === "employee" && row.deductions > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Employee deductions</span>
                                <span className="text-amber-600">-{formatCurrency(row.deductions, row.currency)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {row.isClientEditable && (
                          <div className="pt-2 border-t border-border/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1.5"
                              onClick={() => onApplyToAll(row.id, "country")}
                            >
                              <Copy className="h-3 w-3" />
                              Apply to all in {row.country}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-foreground">Previews</h3>
        <p className="text-xs text-muted-foreground">
          Review worker payroll and invoice previews before creating the batch.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Employees Accordion */}
        <Collapsible open={employeesOpen} onOpenChange={setEmployeesOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Employees – Payroll Preview</span>
                <Badge variant="secondary" className="text-[10px]">
                  {employeeData.length}
                </Badge>
              </div>
              {employeesOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            {renderWorkerTable(employeeData, "employee")}
          </CollapsibleContent>
        </Collapsible>

        {/* Contractors Accordion */}
        <Collapsible open={contractorsOpen} onOpenChange={setContractorsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Contractors – Invoice Preview</span>
                <Badge variant="secondary" className="text-[10px]">
                  {contractorData.length}
                </Badge>
              </div>
              {contractorsOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            {renderWorkerTable(contractorData, "contractor")}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
