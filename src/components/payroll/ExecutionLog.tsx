import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, ChevronDown, ChevronRight, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export interface ExecutionLogWorker {
  id: string;
  name: string;
  employmentType: "employee" | "contractor";
  country: string;
  status: "success" | "failed";
  errorMessage?: string;
}

export interface ExecutionLogData {
  timestamp: Date;
  cohort: "all" | "employees" | "contractors";
  employeeCount: number;
  contractorCount: number;
  workers: ExecutionLogWorker[];
}

interface ExecutionLogProps {
  logData: ExecutionLogData | null;
  onViewException: (workerId: string) => void;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logData, onViewException }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!logData) return null;

  const successCount = logData.workers.filter(w => w.status === "success").length;
  const failureCount = logData.workers.filter(w => w.status === "failed").length;

  const getCohortLabel = () => {
    if (logData.cohort === "all") {
      return `Employees: ${logData.employeeCount}, Contractors: ${logData.contractorCount}`;
    } else if (logData.cohort === "employees") {
      return `Employees: ${logData.employeeCount}`;
    } else {
      return `Contractors: ${logData.contractorCount}`;
    }
  };

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h3 className="text-base font-semibold text-foreground">Latest Execution Log</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(logData.timestamp, "MMM dd, yyyy 'at' HH:mm")}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-foreground">{successCount} Success</span>
                </div>
                {failureCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-foreground">{failureCount} Failed</span>
                  </div>
                )}
              </div>
            </button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Batch Scope */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Batch Scope</p>
                    <p className="text-sm font-medium text-foreground">{getCohortLabel()}</p>
                  </div>
                  <Badge variant={failureCount === 0 ? "default" : "destructive"}>
                    {logData.workers.length} workers processed
                  </Badge>
                </div>
              </div>

              {/* Workers Table */}
              <div className="border border-border/20 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Worker</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Country</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Details</TableHead>
                      <TableHead className="text-xs w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logData.workers.map((worker) => (
                      <TableRow key={worker.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-sm">{worker.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {worker.employmentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{worker.country}</TableCell>
                        <TableCell>
                          {worker.status === "success" ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Success</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600 font-medium">Failed</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {worker.status === "failed" && worker.errorMessage && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-amber-600 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground line-clamp-1" title={worker.errorMessage}>
                                {worker.errorMessage}
                              </span>
                            </div>
                          )}
                          {worker.status === "success" && (
                            <span className="text-xs text-muted-foreground">
                              {worker.employmentType === "employee" ? "Posted to payroll system" : "Payment initiated"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {worker.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewException(worker.id)}
                              className="h-7 text-xs gap-1 hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View in Exceptions
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Note */}
              {failureCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">Action Required</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {failureCount} worker{failureCount > 1 ? 's' : ''} failed. Review error details and resolve exceptions before retrying.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
