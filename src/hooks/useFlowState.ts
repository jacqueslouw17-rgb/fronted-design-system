import { useState, useCallback } from "react";

export interface FlowEvent {
  id: string;
  flow: string;
  step: string;
  actor: "user" | "genie" | "system";
  action: "view" | "input" | "confirm" | "save" | "error" | "complete";
  payload: Record<string, any>;
  ts: string;
}

export interface FlowState {
  currentStep: string;
  completedSteps: string[];
  formData: Record<string, any>;
  events: FlowEvent[];
}

export const useFlowState = (flowNamespace: string, initialStep: string) => {
  const [state, setState] = useState<FlowState>({
    currentStep: initialStep,
    completedSteps: [],
    formData: {},
    events: []
  });

  const logEvent = useCallback((
    step: string,
    actor: FlowEvent["actor"],
    action: FlowEvent["action"],
    payload: Record<string, any> = {}
  ) => {
    const event: FlowEvent = {
      id: `evt_${new Date().toISOString()}_${Date.now()}`,
      flow: flowNamespace,
      step,
      actor,
      action,
      payload,
      ts: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));

    console.log("[Flow Event]", event);
  }, [flowNamespace]);

  const updateFormData = useCallback((data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }));
    logEvent(stepId, "user", "complete");
  }, [logEvent]);

  const goToStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      currentStep: stepId
    }));
    logEvent(stepId, "user", "view");
  }, [logEvent]);

  return {
    state,
    logEvent,
    updateFormData,
    completeStep,
    goToStep
  };
};
