import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface AuditEntry {
  user: string;
  action: string;
  before: any;
  after: any;
  timestamp: string;
}

export const useAuditTrail = () => {
  const addAuditEntry = useCallback((entry: Omit<AuditEntry, "timestamp">) => {
    const fullEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Mock implementation - in real app, this would persist to backend
    const currentAudit = JSON.parse(localStorage.getItem("audit") || "[]");
    currentAudit.push(fullEntry);
    localStorage.setItem("audit", JSON.stringify(currentAudit));

    console.log("Audit entry added:", fullEntry);
  }, []);

  const viewAudit = useCallback(() => {
    toast({
      title: "Audit Trail",
      description: "Navigate to /audit to view filtered entries",
    });
  }, []);

  return { addAuditEntry, viewAudit };
};
