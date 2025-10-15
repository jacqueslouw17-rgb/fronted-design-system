import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  oldText: string;
  newText: string;
  onOpenModule?: () => void;
  className?: string;
}

export const DiffViewer = ({ oldText, newText, onOpenModule, className }: DiffViewerProps) => {
  const handleCopy = () => {
    const diffText = `Previous:\n${oldText}\n\nNew:\n${newText}`;
    navigator.clipboard.writeText(diffText);
    toast({
      title: "Copied to clipboard",
      description: "Diff text has been copied",
    });
  };

  return (
    <div className={cn("space-y-3 text-sm", className)}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Previous</div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-foreground/70 line-through">{oldText}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">New</div>
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
            <p className="text-foreground">{newText}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        {onOpenModule && (
          <Button variant="outline" size="sm" onClick={onOpenModule}>
            <ExternalLink className="h-3 w-3" />
            Open in module
          </Button>
        )}
      </div>
    </div>
  );
};
