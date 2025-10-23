import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Eye, Send, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePipelineAnimation } from "@/hooks/usePipelineAnimation";
import { toast } from "sonner";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: "offer-accepted" | "data-pending" | "drafting" | "awaiting-signature" | "certified";
}

interface PipelineViewProps {
  contractors: Contractor[];
  className?: string;
  autoAnimate?: boolean;
  animationInterval?: number;
}

const statusConfig = {
  "offer-accepted": {
    label: "Offer Accepted",
    color: "bg-muted/50 border-border",
    badgeColor: "bg-muted text-muted-foreground",
  },
  "data-pending": {
    label: "Data Collection Pending",
    color: "bg-accent-yellow-fill/30 border-accent-yellow-outline/20",
    badgeColor: "bg-accent-yellow-fill text-accent-yellow-text border-accent-yellow-outline/30",
  },
  "drafting": {
    label: "Contract Drafting",
    color: "bg-accent-blue-fill/30 border-accent-blue-outline/20",
    badgeColor: "bg-accent-blue-fill text-accent-blue-text border-accent-blue-outline/30",
  },
  "awaiting-signature": {
    label: "Awaiting Signature",
    color: "bg-accent-purple-fill/30 border-accent-purple-outline/20",
    badgeColor: "bg-accent-purple-fill text-accent-purple-text border-accent-purple-outline/30",
  },
  "certified": {
    label: "Certified ✅",
    color: "bg-accent-green-fill/30 border-accent-green-outline/20",
    badgeColor: "bg-accent-green-fill text-accent-green-text border-accent-green-outline/30",
  },
};

const columns = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "certified",
] as const;

export const PipelineView: React.FC<PipelineViewProps> = ({ 
  contractors: initialContractors, 
  className,
  autoAnimate = false,
  animationInterval = 3000,
}) => {
  const contractors = usePipelineAnimation(initialContractors, autoAnimate, animationInterval);
  
  const getContractorsByStatus = (status: typeof columns[number]) => {
    return contractors.filter((c) => c.status === status);
  };

  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <div className="flex gap-4 min-w-max">
        {columns.map((status) => {
          const config = statusConfig[status];
          const items = getContractorsByStatus(status);

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 w-[280px]"
            >
              {/* Column Header */}
              <div className={cn(
                "p-3 rounded-t-lg border-t border-x",
                config.color
              )}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-foreground">
                    {config.label}
                  </h3>
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {items.length}
                  </Badge>
                </div>
              </div>

              {/* Column Body */}
              <div className={cn(
                "min-h-[400px] p-3 space-y-3 border-x border-b rounded-b-lg",
                config.color
              )}>
                <AnimatePresence mode="popLayout">
                  {items.map((contractor, index) => (
                    <motion.div
                      key={contractor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        layout: { duration: 0.5, type: "spring" },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 }
                      }}
                    >
                      <Card className="hover:shadow-card transition-shadow cursor-pointer">
                        <CardContent className="p-3 space-y-2">
                          {/* Contractor Header */}
                          <div className="flex items-start gap-2">
                            <Avatar className="h-8 w-8 bg-primary/10">
                              <AvatarFallback className="text-xs">
                                {contractor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm text-foreground truncate">
                                  {contractor.name}
                                </span>
                                <span className="text-base">{contractor.countryFlag}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {contractor.role}
                              </p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Salary</span>
                              <span className="font-medium text-foreground">{contractor.salary}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Country</span>
                              <span className="font-medium text-foreground">{contractor.country}</span>
                            </div>
                          </div>

                          {/* Action Buttons based on status */}
                          {status === "offer-accepted" && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(`Configuring form for ${contractor.name}`);
                                }}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Configure
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`Sending form to ${contractor.name}`);
                                }}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send Form
                              </Button>
                            </div>
                          )}

                          {status === "data-pending" && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info(`Viewing form for ${contractor.name}`);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Form
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`Resending form to ${contractor.name}`);
                                }}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Resend
                              </Button>
                            </div>
                          )}

                          {/* Status Badge for certified */}
                          {status === "certified" && (
                            <Badge 
                              variant="outline" 
                              className={cn("w-full justify-center text-xs", config.badgeColor)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
