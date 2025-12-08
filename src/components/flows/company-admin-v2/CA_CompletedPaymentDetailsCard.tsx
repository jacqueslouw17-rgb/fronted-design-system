import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, CheckCircle2, Clock, AlertCircle, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface Worker {
  id: string;
  name: string;
  country: string;
  currency: string;
  employmentType: "employee" | "contractor";
  baseSalary: number;
  netPay: number;
}

interface PaymentReceipt {
  payeeId: string;
  providerRef: string;
  rail?: string;
  eta?: string;
  [key: string]: unknown;
}

interface CA_CompletedPaymentDetailsCardProps {
  employees: Worker[];
  contractors: Worker[];
  workerTypeFilter: "all" | "employee" | "contractor";
  onWorkerTypeFilterChange: (filter: string) => void;
  onOpenPaymentDetail: (worker: Worker) => void;
  getPaymentStatus: (id: string) => string;
  getPaymentDue: (worker: Worker) => number;
  paymentReceipts: PaymentReceipt[];
  onViewReceipt: (receipt: PaymentReceipt) => void;
}

export const CA_CompletedPaymentDetailsCard: React.FC<CA_CompletedPaymentDetailsCardProps> = ({
  employees,
  contractors,
  workerTypeFilter,
  onWorkerTypeFilterChange,
  onOpenPaymentDetail,
  getPaymentStatus,
  getPaymentDue,
  paymentReceipts,
  onViewReceipt,
}) => {
  const handleRowClick = (worker: Worker) => {
    onOpenPaymentDetail(worker);
  };

  const handleKeyDown = (e: React.KeyboardEvent, worker: Worker) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick(worker);
    }
  };

  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <Tabs value={workerTypeFilter} onValueChange={onWorkerTypeFilterChange}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Payment Details</h3>
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="employee">Employees</TabsTrigger>
              <TabsTrigger value="contractor">Contractors</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="overflow-x-auto">
            {/* Employees Table */}
            {(workerTypeFilter === "all" || workerTypeFilter === "employee") && employees.length > 0 && (
              <div className="mb-6">
                {workerTypeFilter === "all" && (
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-600">Employees ({employees.length})</h4>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-medium">Name & meta</TableHead>
                      <TableHead className="text-xs font-medium text-right">Payout amount</TableHead>
                      <TableHead className="text-xs font-medium text-center">Payment status</TableHead>
                      <TableHead className="text-xs font-medium">Provider ref</TableHead>
                      <TableHead className="text-xs font-medium text-center">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(employee => (
                      <TableRow 
                        key={employee.id} 
                        tabIndex={0}
                        role="button"
                        aria-label={`View payment details for ${employee.name}`}
                        onClick={() => handleRowClick(employee)}
                        onKeyDown={(e) => handleKeyDown(e, employee)}
                        className="cursor-pointer transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground">{employee.name}</span>
                            <span className="text-xs text-muted-foreground">{employee.country} · {employee.currency}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm text-foreground">
                          {employee.currency} {employee.netPay.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Posted
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground font-mono">
                            PR–{employee.id.substring(0, 4).toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">—</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Contractors Table */}
            {(workerTypeFilter === "all" || workerTypeFilter === "contractor") && contractors.length > 0 && (
              <div>
                {workerTypeFilter === "all" && (
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-primary">Contractors ({contractors.length})</h4>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-medium">Name & meta</TableHead>
                      <TableHead className="text-xs font-medium text-right">Payout amount</TableHead>
                      <TableHead className="text-xs font-medium text-center">Payment status</TableHead>
                      <TableHead className="text-xs font-medium">Provider ref</TableHead>
                      <TableHead className="text-xs font-medium text-center">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractors.map(contractor => {
                      const status = getPaymentStatus(contractor.id);
                      const receipt = paymentReceipts.find(r => r.payeeId === contractor.id);
                      const netPay = getPaymentDue(contractor);
                      
                      return (
                        <TableRow 
                          key={contractor.id}
                          tabIndex={0}
                          role="button"
                          aria-label={`View payment details for ${contractor.name}`}
                          onClick={() => handleRowClick(contractor)}
                          onKeyDown={(e) => handleKeyDown(e, contractor)}
                          className="cursor-pointer transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-foreground">{contractor.name}</span>
                              <span className="text-xs text-muted-foreground">{contractor.country} · {contractor.currency}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm text-foreground">
                            {contractor.currency} {Math.round(netPay).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={status === "Paid" ? "default" : "outline"} 
                              className={cn(
                                "text-[10px]", 
                                status === "Paid" && "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30", 
                                status === "InTransit" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", 
                                status === "Failed" && "bg-red-500/10 text-red-600 border-red-500/30"
                              )}
                            >
                              {status === "Paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {status === "InTransit" && <Clock className="h-3 w-3 mr-1" />}
                              {status === "Failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground font-mono">
                              {receipt ? receipt.providerRef : `TXN–${contractor.id.substring(0, 4).toUpperCase()}`}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {receipt ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs hover:bg-primary/10" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewReceipt(receipt);
                                }}
                              >
                                View
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Tabs>

        {/* Read-only Note */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            For historical records only — data is read-only and cannot be modified.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CA_CompletedPaymentDetailsCard;
