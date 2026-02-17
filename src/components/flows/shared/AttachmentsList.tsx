import React from "react";
import { Paperclip, ExternalLink, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface AttachmentsListProps {
  attachments: AttachmentItem[];
  compact?: boolean;
  className?: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.includes("pdf")) return FileText;
  return File;
};

const formatFileSize = (size?: string) => size || "";

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  compact = false,
  className,
}) => {
  if (attachments.length === 0) {
    return (
      <div className={cn("py-3 text-center", className)}>
        <p className="text-xs text-muted-foreground/60">No attachments provided</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {attachments.map((att) => {
        const Icon = getFileIcon(att.fileType);
        return (
          <div
            key={att.id}
            className={cn(
              "flex items-center gap-2.5 rounded-md border border-border/30 bg-muted/20 group transition-colors hover:bg-muted/40",
              compact ? "px-2.5 py-1.5" : "px-3 py-2"
            )}
          >
            <div className="flex items-center justify-center h-7 w-7 rounded bg-primary/[0.06] border border-primary/20 shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{att.fileName}</p>
              <p className="text-[10px] text-muted-foreground/70">
                {formatFileSize(att.fileSize)}
                {att.fileSize && att.uploadedAt ? " · " : ""}
                {att.uploadedAt}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                window.open(att.url, "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

/** Inline indicator for list rows: 📎 2 */
export const AttachmentIndicator: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
      <Paperclip className="h-2.5 w-2.5" />
      {count}
    </span>
  );
};
