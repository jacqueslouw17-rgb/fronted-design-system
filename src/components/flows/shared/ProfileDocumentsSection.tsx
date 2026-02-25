/**
 * ProfileDocumentsSection — Documents view for worker Profile Settings
 * 
 * Shows contract documents (supports multiple) and identity document.
 * Used by both Flow 4.1 (Employee) and Flow 4.2 (Contractor).
 */

import { Button } from "@/components/ui/button";
import { FileText, Download, FileCheck, Shield } from "lucide-react";
import { toast } from "sonner";

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

  const handleDownload = (docTitle: string) => {
    toast.info(`Downloading ${docTitle}...`);
  };

  return (
    <div className="space-y-4">
      {/* Contract Documents */}
      <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Contract</p>
          </div>
        </div>
        <div className="p-2 space-y-1">
          {contractDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.date} · {doc.fileType}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc.title)}
                className="h-7 text-xs gap-1.5 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Identity Document */}
      {identityFileName && (
        <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Identity Document</p>
            </div>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{identityFileName}</p>
                  <p className="text-xs text-muted-foreground">Uploaded during onboarding · PDF</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(identityFileName)}
                className="h-7 text-xs gap-1.5 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="flex items-center gap-2 mt-4">
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
