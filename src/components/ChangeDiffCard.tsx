import React, { useState } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface ChangeDiffCardProps {
  before: string;
  after: string;
  changeType?: "addition" | "modification" | "deletion";
  showDiff?: boolean;
  className?: string;
}

export const ChangeDiffCard: React.FC<ChangeDiffCardProps> = ({
  before,
  after,
  changeType = "modification",
  showDiff: initialShowDiff = false,
  className,
}) => {
  const [showDiff, setShowDiff] = useState(initialShowDiff);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              changeType === "addition" && "bg-green-500",
              changeType === "modification" && "bg-yellow-500",
              changeType === "deletion" && "bg-red-500"
            )}
          />
          <span className="text-xs font-medium capitalize text-muted-foreground">
            {changeType}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-2 text-xs"
          onClick={() => setShowDiff(!showDiff)}
        >
          <Eye className="h-3.5 w-3.5" />
          {showDiff ? "Clean" : "Diff"}
        </Button>
      </div>
      
      {showDiff ? (
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">Before</p>
            <p className="text-sm text-foreground/70 line-through decoration-red-500/50">
              {before}
            </p>
          </div>
          <div className="space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">After</p>
            <p className="text-sm font-medium text-foreground">{after}</p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm text-foreground">{after}</p>
        </div>
      )}
    </Card>
  );
};
