import { useState, useEffect } from "react";
import { MiniRule } from "@/components/compliance/RuleBadge";

// Mock hook for mini-rules - in real app would fetch from company/country config
export const useMiniRules = (companyId: string, country: string) => {
  const [rules, setRules] = useState<MiniRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchRules = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock rules based on country
      const mockRules: Record<string, MiniRule[]> = {
        NO: [
          { id: "pto", name: "PTO", value: "24 days", editable: true },
          { id: "notice", name: "Notice", value: "30d", editable: true },
          { id: "ip", name: "IP Assignment", value: "ON", editable: false }
        ],
        PH: [
          { id: "13th-pay", name: "13th Month", value: "Required", editable: false },
          { id: "pto", name: "PTO", value: "15 days", editable: true }
        ],
        default: [
          { id: "pto", name: "PTO", value: "20 days", editable: true }
        ]
      };

      setRules(mockRules[country] || mockRules.default);
      setLoading(false);
    };

    fetchRules();
  }, [companyId, country]);

  return { rules, loading };
};
