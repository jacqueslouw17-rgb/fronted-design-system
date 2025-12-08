// Flow 6 v2 - Company Admin Dashboard - Review FX & Totals Table (matching reference design)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_CurrencyTotal } from "./CA_InPlaceTypes";

interface CA_FXTotalsTableProps {
  currencyTotals: CA_CurrencyTotal[];
  hasPendingItems: boolean;
  onResolve: () => void;
}

export const CA_FXTotalsTable: React.FC<CA_FXTotalsTableProps> = ({
  currencyTotals,
  hasPendingItems,
  onResolve
}) => {
  const [employmentFilter, setEmploymentFilter] = useState<"all" | "employees" | "contractors">("all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const allCountries = Array.from(new Set(currencyTotals.flatMap(ct => ct.countries)));

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <Card className="border border-border/40 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Review FX & Totals</h3>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-full p-1">
              <Button
                variant={employmentFilter === "all" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 rounded-full text-xs"
                onClick={() => setEmploymentFilter("all")}
              >
                All
              </Button>
              <Button
                variant={employmentFilter === "employees" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 rounded-full text-xs"
                onClick={() => setEmploymentFilter("employees")}
              >
                Employees
              </Button>
              <Button
                variant={employmentFilter === "contractors" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 rounded-full text-xs"
                onClick={() => setEmploymentFilter("contractors")}
              >
                Contractors
              </Button>
            </div>

            {/* Country chips */}
            <div className="flex items-center gap-1.5 ml-2">
              {allCountries.map(country => (
                <Button
                  key={country}
                  variant={selectedCountries.includes(country) ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-3 rounded-full text-xs"
                  onClick={() => toggleCountry(country)}
                >
                  {country}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Pending items banner */}
        {hasPendingItems && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-amber-500/10 border-y border-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">Pending items will change totals</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-primary font-medium"
              onClick={onResolve}
            >
              Resolve
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/30">
              <TableHead className="text-xs font-medium text-muted-foreground">Currency</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Countries</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Employees</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Contractors</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Adjustments</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Employer Cost</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Net to Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencyTotals.map((row) => (
              <TableRow key={row.currency} className="hover:bg-muted/30 border-b border-border/20">
                <TableCell>
                  <span className="text-sm font-semibold text-foreground">{row.currency}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{row.countries.join(", ")}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-foreground">{row.employees}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-foreground">{row.contractors}</span>
                </TableCell>
                <TableCell className="text-center">
                  {row.adjustmentsTotal !== 0 ? (
                    <Button 
                      variant="link" 
                      className={cn(
                        "h-auto p-0 text-sm font-medium",
                        row.adjustmentsTotal > 0 ? "text-primary" : "text-amber-600"
                      )}
                      onClick={onResolve}
                    >
                      {formatCurrency(row.adjustmentsTotal, row.currency)}
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-foreground">{formatCurrency(row.employerCost, row.currency)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(row.netToPay, row.currency)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
