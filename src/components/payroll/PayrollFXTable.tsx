import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface PayrollRow {
  id: string;
  contractor: string;
  country: string;
  currency: string;
  grossPay: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: "draft" | "processing" | "complete";
  progress: number;
}

interface PayrollFXTableProps {
  data: PayrollRow[];
  fxRates: Record<string, number>;
  phase: string;
}

export const PayrollFXTable: React.FC<PayrollFXTableProps> = ({ data, fxRates, phase }) => {
  const calculateUSD = (amount: number, currency: string) => {
    const rate = fxRates[currency] || 1;
    return (amount / rate).toFixed(2);
  };

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Payroll Draft</CardTitle>
          <Badge variant="secondary" className="text-xs sm:text-sm">Batch #2025-11</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs sm:text-sm text-muted-foreground">
                  <th className="text-left p-2 sm:p-3 font-medium">Contractor</th>
                  <th className="text-left p-2 sm:p-3 font-medium hidden sm:table-cell">Country</th>
                  <th className="text-right p-2 sm:p-3 font-medium">Gross</th>
                  <th className="text-right p-2 sm:p-3 font-medium hidden md:table-cell">Bonus</th>
                  <th className="text-right p-2 sm:p-3 font-medium hidden md:table-cell">Deduct.</th>
                  <th className="text-right p-2 sm:p-3 font-medium">Net Pay</th>
                  <th className="text-right p-2 sm:p-3 font-medium hidden sm:table-cell">FX Rate</th>
                  <th className="text-right p-2 sm:p-3 font-medium hidden lg:table-cell">USD</th>
                  <th className="text-center p-2 sm:p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-2 sm:p-3">
                      <div className="font-medium text-xs sm:text-sm">{row.contractor}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{row.country}</div>
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm hidden sm:table-cell">{row.country}</td>
                    <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                      {row.currency} {row.grossPay.toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 text-right text-xs sm:text-sm hidden md:table-cell">
                      {row.currency} {row.bonus.toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 text-right text-xs sm:text-sm hidden md:table-cell">
                      {row.currency} {row.deductions.toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 text-right font-medium text-xs sm:text-sm">
                      {row.currency} {row.netPay.toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 text-right text-xs sm:text-sm hidden sm:table-cell">
                      {fxRates[row.currency]?.toFixed(2) || "-"}
                    </td>
                    <td className="p-2 sm:p-3 text-right text-xs sm:text-sm hidden lg:table-cell">
                      ${calculateUSD(row.netPay, row.currency)}
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="flex justify-center">
                        {row.status === "complete" ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        ) : row.status === "processing" ? (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1 animate-pulse" />
                            {row.progress}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Draft</Badge>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
