import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, CheckCircle2, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PayrollRow {
  id: string;
  contractor: string;
  country: string;
  status: "draft" | "processing" | "complete";
  progress: number;
}

interface LiveTrackingPanelProps {
  data: PayrollRow[];
  fxVariance: number;
  slaScore: number;
}

export const LiveTrackingPanel: React.FC<LiveTrackingPanelProps> = ({ 
  data, 
  fxVariance, 
  slaScore 
}) => {
  const totalCount = data.length;
  const completedCount = data.filter(d => d.status === "complete").length;
  const processingCount = data.filter(d => d.status === "processing").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs">Progress</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs">FX Variance</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              +{fxVariance}%
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs">SLA Score</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {slaScore}%
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs">Status</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {processingCount > 0 ? "Active" : "Done"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Status Table */}
      <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Transfer Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((row, idx) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{row.country.split(' ')[0]}</span>
                    <span className="font-medium text-sm">{row.contractor}</span>
                  </div>
                  {row.status === "complete" ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : row.status === "processing" ? (
                    <Badge variant="secondary" className="text-xs">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse mr-1" />
                      Processing
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Pending</Badge>
                  )}
                </div>
                {row.status === "processing" && (
                  <Progress value={row.progress} className="h-1" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
