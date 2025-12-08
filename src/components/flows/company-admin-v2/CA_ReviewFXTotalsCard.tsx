// Flow 6 v2 - Company Admin Dashboard - Review FX & Totals Card (Local to this flow only)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_FXTotalsRow } from "./CA_PayrollTypes";

interface CA_ReviewFXTotalsCardProps {
  data: CA_FXTotalsRow[];
  hasPendingItems: boolean;
  onResolveClick: (currency?: string) => void;
  employmentFilter: "all" | "employees" | "contractors";
  onEmploymentFilterChange: (filter: "all" | "employees" | "contractors") => void;
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  allCountries: string[];
  onNetToPayClick?: (currency: string) => void;
}

export const CA_ReviewFXTotalsCard: React.FC<CA_ReviewFXTotalsCardProps> = ({
  data,
  hasPendingItems,
  onResolveClick,
  employmentFilter,
  onEmploymentFilterChange,
  selectedCountries,
  onCountriesChange,
  allCountries,
  onNetToPayClick
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Filter data based on selected countries
  const filteredData = selectedCountries.length > 0
    ? data.filter(row => row.countries.some(c => selectedCountries.includes(c)))
    : data;

  // Calculate totals
  const totalEmployees = filteredData.reduce((sum, row) => {
    if (employmentFilter === "contractors") return sum;
    return sum + row.employeeCount;
  }, 0);

  const totalContractors = filteredData.reduce((sum, row) => {
    if (employmentFilter === "employees") return sum;
    return sum + row.contractorCount;
  }, 0);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter(c => c !== country));
    } else {
      onCountriesChange([...selectedCountries, country]);
    }
  };

  return (
    <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Review FX & Totals</h3>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Employment Type Filter */}
            <Tabs value={employmentFilter} onValueChange={(v) => onEmploymentFilterChange(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-3 h-6">All</TabsTrigger>
                <TabsTrigger value="employees" className="text-xs px-3 h-6">Employees</TabsTrigger>
                <TabsTrigger value="contractors" className="text-xs px-3 h-6">Contractors</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Countries Multi-select */}
            <div className="flex items-center gap-1 flex-wrap">
              {allCountries.map(country => (
                <Badge
                  key={country}
                  variant={selectedCountries.includes(country) ? "default" : "outline"}
                  className={cn(
                    "text-[10px] cursor-pointer transition-colors",
                    selectedCountries.includes(country) 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleCountry(country)}
                >
                  {country}
                </Badge>
              ))}
              {selectedCountries.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 px-2 text-[10px] text-muted-foreground"
                  onClick={() => onCountriesChange([])}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium">Currency</TableHead>
                <TableHead className="text-xs font-medium">Countries</TableHead>
                <TableHead className="text-xs font-medium text-center">Employees</TableHead>
                <TableHead className="text-xs font-medium text-center">Contractors</TableHead>
                <TableHead className="text-xs font-medium text-right">Adjustments</TableHead>
                <TableHead className="text-xs font-medium text-right">Employer Cost</TableHead>
                <TableHead className="text-xs font-medium text-right">Net to Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, idx) => {
                const showEmployees = employmentFilter !== "contractors";
                const showContractors = employmentFilter !== "employees";
                
                const handleRowClick = () => {
                  onResolveClick(row.currency);
                };

                const handleKeyDown = (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick();
                  }
                };
                
                return (
                  <TableRow 
                    key={row.currency} 
                    tabIndex={0}
                    role="button"
                    aria-label={`View adjustments for ${row.currency}`}
                    onClick={handleRowClick}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "cursor-pointer transition-colors",
                      "hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
                      idx % 2 === 0 && "bg-muted/10"
                    )}
                  >
                    <TableCell className="font-medium text-sm">{row.currency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.countries.join(", ")}
                    </TableCell>
                    <TableCell className="text-center">
                      {showEmployees ? (
                        <span className="text-sm font-medium">{row.employeeCount}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {showContractors ? (
                        <span className="text-sm font-medium">{row.contractorCount}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.adjustmentsTotal !== 0 ? (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            row.adjustmentsTotal > 0 ? "text-accent-green-text" : "text-destructive"
                          )}
                        >
                          {formatCurrency(row.adjustmentsTotal, row.currency)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium">
                        {showEmployees && row.employerCost > 0 ? formatCurrency(row.employerCost, row.currency) : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNetToPayClick?.(row.currency);
                        }}
                        className="text-sm font-semibold text-foreground hover:underline cursor-pointer"
                      >
                        {formatCurrency(row.netToPay, row.currency)}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Footer */}
        <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {filteredData.length} currencies • {totalEmployees} employees, {totalContractors} contractors
            </span>
            <span className="text-xs text-muted-foreground">
              All amounts shown in local currency
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
