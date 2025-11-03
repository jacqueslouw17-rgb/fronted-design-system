import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface MiniRule {
  id: string;
  name: string;
  value: string;
  editable?: boolean;
}

interface RuleBadgeProps {
  rule: MiniRule;
  onSave?: (id: string, newValue: string) => void;
  className?: string;
}

export const RuleBadge = ({ rule, onSave, className }: RuleBadgeProps) => {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(rule.value);

  const handleSave = () => {
    onSave?.(rule.id, editValue);
    setOpen(false);
  };

  const handleRevert = () => {
    setEditValue(rule.value);
    setOpen(false);
  };

  if (!rule.editable) {
    return (
      <Badge variant="outline" className={cn("cursor-default", className)}>
        {rule.name}: {rule.value}
      </Badge>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={cn("cursor-pointer hover:bg-primary/5", className)}
        >
          {rule.name}: {rule.value}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`rule-${rule.id}`}>{rule.name}</Label>
            <Input
              id={`rule-${rule.id}`}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter value"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleRevert}>
              Revert
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
