import { useState, useEffect } from "react";
import { complianceService, ComplianceData } from "@/services/complianceService";
import { SyncStatus } from "@/components/compliance/SyncStatusDot";

export const useComplianceChanges = (country: string) => {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChanges = async () => {
      setStatus("syncing");
      setError(null);

      try {
        const result = await complianceService.getChanges(country);
        setData(result);
        setStatus(result.changes.length > 0 ? "changed" : "idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to sync");
        setStatus("error");
      }
    };

    fetchChanges();
  }, [country]);

  return { data, status, error };
};
