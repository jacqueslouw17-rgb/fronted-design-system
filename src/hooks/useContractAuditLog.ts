import { useState, useCallback } from "react";
import type { ContractEditEvent } from "@/components/contract-flow/ContractAuditLog";

// Generate a unique ID for each edit event
const generateId = () => `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export interface ContractAuditState {
  [contractId: string]: ContractEditEvent[];
}

export const useContractAuditLog = () => {
  const [auditState, setAuditState] = useState<ContractAuditState>({});

  // Record a new edit event for a contract
  const recordEdit = useCallback((
    contractId: string,
    editorName: string,
    workerName: string
  ) => {
    const newEvent: ContractEditEvent = {
      id: generateId(),
      editorName,
      workerName,
      timestamp: new Date().toISOString(), // UTC timestamp
    };

    setAuditState(prev => {
      const existingEvents = prev[contractId] || [];
      // Add new event at the beginning (most recent first)
      return {
        ...prev,
        [contractId]: [newEvent, ...existingEvents],
      };
    });

    console.log("Contract edit recorded:", newEvent);
    return newEvent;
  }, []);

  // Get edit events for a specific contract
  const getEditEvents = useCallback((contractId: string): ContractEditEvent[] => {
    return auditState[contractId] || [];
  }, [auditState]);

  // Get the total edit count for a contract
  const getEditCount = useCallback((contractId: string): number => {
    return (auditState[contractId] || []).length;
  }, [auditState]);

  // Get the most recent edit for a contract
  const getMostRecentEdit = useCallback((contractId: string): ContractEditEvent | null => {
    const events = auditState[contractId] || [];
    return events[0] || null;
  }, [auditState]);

  return {
    recordEdit,
    getEditEvents,
    getEditCount,
    getMostRecentEdit,
    auditState,
  };
};

// Create a global store for contract audit logs (persisted during session)
let globalAuditState: ContractAuditState = {};

// Initialize with some demo data
const initializeDemoData = () => {
  if (Object.keys(globalAuditState).length === 0) {
    // Add 10 mock historical edits for demo purposes
    globalAuditState = {
      "marcus-chen-sg": [
        {
          id: "edit-demo-1",
          editorName: "Sarah Johnson",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (Today)
        },
        {
          id: "edit-demo-2",
          editorName: "David Park",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago (Today)
        },
        {
          id: "edit-demo-3",
          editorName: "Emily Rodriguez",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Yesterday
        },
        {
          id: "edit-demo-4",
          editorName: "Michael Chen",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // Yesterday
        },
        {
          id: "edit-demo-5",
          editorName: "Sarah Johnson",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (This week)
        },
        {
          id: "edit-demo-6",
          editorName: "Lisa Wong",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago (This week)
        },
        {
          id: "edit-demo-7",
          editorName: "David Park",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (This week)
        },
        {
          id: "edit-demo-8",
          editorName: "James Miller",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (Older)
        },
        {
          id: "edit-demo-9",
          editorName: "Emily Rodriguez",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago (Older)
        },
        {
          id: "edit-demo-10",
          editorName: "Michael Chen",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago (Older)
        },
      ],
    };
  }
};

export const useGlobalContractAuditLog = () => {
  initializeDemoData();
  
  const [, forceUpdate] = useState({});

  const recordEdit = useCallback((
    contractId: string,
    editorName: string,
    workerName: string
  ) => {
    const newEvent: ContractEditEvent = {
      id: generateId(),
      editorName,
      workerName,
      timestamp: new Date().toISOString(),
    };

    const existingEvents = globalAuditState[contractId] || [];
    globalAuditState[contractId] = [newEvent, ...existingEvents];
    
    forceUpdate({}); // Trigger re-render
    console.log("Contract edit recorded:", newEvent);
    return newEvent;
  }, []);

  const getEditEvents = useCallback((contractId: string): ContractEditEvent[] => {
    return globalAuditState[contractId] || [];
  }, []);

  const getEditCount = useCallback((contractId: string): number => {
    return (globalAuditState[contractId] || []).length;
  }, []);

  const getMostRecentEdit = useCallback((contractId: string): ContractEditEvent | null => {
    const events = globalAuditState[contractId] || [];
    return events[0] || null;
  }, []);

  return {
    recordEdit,
    getEditEvents,
    getEditCount,
    getMostRecentEdit,
  };
};
