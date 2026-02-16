import { useState, useCallback } from "react";
import type { ContractEditEvent, ContractEditEventType } from "@/components/contract-flow/ContractAuditLog";

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
    workerName: string,
    eventType?: ContractEditEventType,
    documentName?: string,
    changeSummary?: string
  ) => {
    const newEvent: ContractEditEvent = {
      id: generateId(),
      editorName,
      workerName,
      timestamp: new Date().toISOString(), // UTC timestamp
      documentName,
      changeSummary,
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
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          documentName: "Agreement",
          changeSummary: "Updated compensation clause",
        },
        {
          id: "edit-demo-2",
          editorName: "David Park",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          documentName: "NDA",
          changeSummary: "Revised confidentiality scope",
        },
        {
          id: "edit-demo-3",
          editorName: "Emily Rodriguez",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
          documentName: "IP Addendum",
          changeSummary: "Added IP carve-out for side project",
        },
        {
          id: "edit-demo-4",
          editorName: "Michael Chen",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
          documentName: "Agreement",
          changeSummary: "Adjusted notice period",
        },
        {
          id: "edit-demo-5",
          editorName: "Sarah Johnson",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          documentName: "Privacy",
          changeSummary: "Updated data retention terms",
        },
        {
          id: "edit-demo-6",
          editorName: "Lisa Wong",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          documentName: "Agreement",
          changeSummary: "Changed probation period",
        },
        {
          id: "edit-demo-7",
          editorName: "David Park",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          documentName: "Covenants",
          changeSummary: "Narrowed non-compete region",
        },
        {
          id: "edit-demo-8",
          editorName: "James Miller",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          documentName: "Agreement",
        },
        {
          id: "edit-demo-9",
          editorName: "Emily Rodriguez",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          documentName: "NDA",
          changeSummary: "Initial draft review",
        },
        {
          id: "edit-demo-10",
          editorName: "Michael Chen",
          workerName: "Marcus Chen",
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          eventType: "reset" as ContractEditEventType,
          documentName: "Agreement",
        },
      ],
    };
  }
};

// Helper to generate demo events for any contract
const generateDemoEventsForContract = (workerName: string): ContractEditEvent[] => {
  const editors = ["Sarah Johnson", "David Park", "Emily Rodriguez", "Michael Chen", "Lisa Wong", "James Miller"];
  const docs = ["Agreement", "NDA", "Privacy", "IP Addendum", "Covenants"];
  const changes = ["Updated compensation clause", "Revised confidentiality scope", "Adjusted notice period", "Updated data retention terms", "Narrowed non-compete region", "Changed probation period", "Initial draft review"];
  return [
    { id: `edit-demo-1-${Date.now()}`, editorName: editors[0], workerName, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), documentName: docs[0], changeSummary: changes[0] },
    { id: `edit-demo-2-${Date.now()}`, editorName: editors[1], workerName, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), documentName: docs[1], changeSummary: changes[1] },
    { id: `edit-demo-3-${Date.now()}`, editorName: editors[2], workerName, timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), documentName: docs[3], changeSummary: changes[4] },
    { id: `edit-demo-4-${Date.now()}`, editorName: editors[3], workerName, timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), documentName: docs[0], changeSummary: changes[2] },
    { id: `edit-demo-5-${Date.now()}`, editorName: editors[0], workerName, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), documentName: docs[2], changeSummary: changes[3] },
    { id: `edit-demo-6-${Date.now()}`, editorName: editors[4], workerName, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), documentName: docs[0], changeSummary: changes[5] },
    { id: `edit-demo-7-${Date.now()}`, editorName: editors[1], workerName, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), documentName: docs[4], changeSummary: changes[4] },
    { id: `edit-demo-8-${Date.now()}`, editorName: editors[5], workerName, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), documentName: docs[0] },
    { id: `edit-demo-9-${Date.now()}`, editorName: editors[2], workerName, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), documentName: docs[1], changeSummary: changes[6] },
    { id: `edit-demo-10-${Date.now()}`, editorName: editors[3], workerName, timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), eventType: "reset" as ContractEditEventType, documentName: docs[0] },
  ];
};

export const useGlobalContractAuditLog = () => {
  initializeDemoData();
  
  const [, forceUpdate] = useState({});

  const recordEdit = useCallback((
    contractId: string,
    editorName: string,
    workerName: string,
    eventType: ContractEditEventType = 'edit',
    documentName?: string,
    changeSummary?: string
  ) => {
    const newEvent: ContractEditEvent = {
      id: generateId(),
      editorName,
      workerName,
      timestamp: new Date().toISOString(),
      eventType,
      documentName,
      changeSummary,
    };

    const existingEvents = globalAuditState[contractId] || [];
    globalAuditState[contractId] = [newEvent, ...existingEvents];
    
    forceUpdate({}); // Trigger re-render
    console.log(`Contract ${eventType} recorded:`, newEvent);
    return newEvent;
  }, []);

  const getEditEvents = useCallback((contractId: string, workerName?: string): ContractEditEvent[] => {
    // If no events exist for this contract yet, generate demo data
    if (!globalAuditState[contractId] && workerName) {
      globalAuditState[contractId] = generateDemoEventsForContract(workerName);
    }
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
