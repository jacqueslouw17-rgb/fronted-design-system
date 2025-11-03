import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceLinkProps {
  authority: string;
  reference: string;
  url?: string;
  className?: string;
}

export const SourceLink = ({ authority, reference, url, className }: SourceLinkProps) => {
  const content = (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
      <span>{authority}</span>
      <span className="text-foreground/50">·</span>
      <span>{reference}</span>
      <ExternalLink className="h-3 w-3" />
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("inline-block", className)}
      >
        {content}
      </a>
    );
  }

  return <span className={className}>{content}</span>;
};
