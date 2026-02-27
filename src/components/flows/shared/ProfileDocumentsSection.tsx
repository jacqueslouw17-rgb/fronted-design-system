/**
 * ProfileDocumentsSection — Documents view for worker Profile Settings
 * 
 * Flat list of all documents (contracts + identity). Workers can replace documents.
 * Used by both Flow 4.1 (Employee) and Flow 4.2 (Contractor).
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContractDocument {
  id: string;
  title: string;
  date: string;
  fileType: string;
}

interface ProfileDocumentsSectionProps {
  contractDocuments: ContractDocument[];
  identityFileName?: string;
  onBack: () => void;
}

const ProfileDocumentsSection = ({
  contractDocuments,
  identityFileName,
  onBack,
}: ProfileDocumentsSectionProps) => {
  const [documents, setDocuments] = useState(() => {
    const docs = contractDocuments.map(doc => ({
      ...doc,
      replaceable: false,
    }));
    if (identityFileName) {
      docs.push({
        id: "identity",
        title: identityFileName,
        date: "Uploaded during onboarding",
        fileType: "PDF",
        replaceable: true,
      });
    }
    return docs;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  const handleOpen = (docTitle: string) => {
    toast.info(`Opening ${docTitle} in new tab...`);
    // In production this would open a signed URL in a new tab
  };

  const handleReplace = (docId: string) => {
    setReplacingId(docId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or PDF file.");
      setReplacingId(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10 MB.");
      setReplacingId(null);
      return;
    }

    setDocuments(prev =>
      prev.map(doc =>
        doc.id === replacingId
          ? { ...doc, title: file.name, date: "Just now", fileType: file.type.includes("pdf") ? "PDF" : "Image" }
          : doc
      )
    );
    toast.success("Document replaced successfully");
    setReplacingId(null);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileChange}
      />

      <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden">
        <div className="divide-y divide-border/20">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-card/40 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.date} · {doc.fileType}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {doc.replaceable && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReplace(doc.id)}
                          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Replace</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Upload a new file to replace the existing document</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpen(doc.title)}
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back */}
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="text-xs"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default ProfileDocumentsSection;
