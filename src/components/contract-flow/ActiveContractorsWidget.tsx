import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ExternalLink } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface ActiveContractorsWidgetProps {
  contractors: Candidate[];
}

export const ActiveContractorsWidget: React.FC<ActiveContractorsWidgetProps> = ({
  contractors,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 hover:shadow-elevated transition-shadow border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Active Contractors</h3>
          </div>
          <Badge variant="secondary">{contractors.length}</Badge>
        </div>

        <div className="space-y-3">
          {contractors.map((contractor, index) => (
            <motion.div
              key={contractor.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{contractor.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{contractor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contractor.role} • {contractor.country}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  ID: {contractor.id.toUpperCase()}-2025
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
