import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecallThreadStep = {
  id: string;
  label: string;
  completed: boolean;
};

export type RecallThread = {
  id: string;
  flowName: string;
  flowType: "onboarding" | "contract" | "payroll" | "compliance" | "support";
  currentStep: number;
  totalSteps: number;
  steps: RecallThreadStep[];
  lastAction: string;
  lastMessage?: string;
  metadata?: Record<string, any>;
  timestamp: number;
  status: "active" | "paused" | "completed";
};

type RecallThreadStore = {
  threads: RecallThread[];
  createThread: (thread: Omit<RecallThread, "id" | "timestamp" | "status">) => RecallThread;
  updateThread: (id: string, updates: Partial<RecallThread>) => void;
  pauseThread: (id: string) => void;
  resumeThread: (id: string) => void;
  completeThread: (id: string) => void;
  deleteThread: (id: string) => void;
  getActiveThreads: () => RecallThread[];
  getPausedThreads: () => RecallThread[];
  getThreadById: (id: string) => RecallThread | undefined;
};

export const useRecallThread = create<RecallThreadStore>()(
  persist(
    (set, get) => ({
      threads: [],

      createThread: (threadData) => {
        const newThread: RecallThread = {
          ...threadData,
          id: `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          status: "active",
        };

        set((state) => ({
          threads: [...state.threads, newThread],
        }));

        return newThread;
      },

      updateThread: (id, updates) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === id
              ? { ...thread, ...updates, timestamp: Date.now() }
              : thread
          ),
        }));
      },

      pauseThread: (id) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === id
              ? { ...thread, status: "paused" as const, timestamp: Date.now() }
              : thread
          ),
        }));
      },

      resumeThread: (id) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === id
              ? { ...thread, status: "active" as const, timestamp: Date.now() }
              : thread
          ),
        }));
      },

      completeThread: (id) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === id
              ? { ...thread, status: "completed" as const, timestamp: Date.now() }
              : thread
          ),
        }));
      },

      deleteThread: (id) => {
        set((state) => ({
          threads: state.threads.filter((thread) => thread.id !== id),
        }));
      },

      getActiveThreads: () => {
        return get().threads.filter((t) => t.status === "active");
      },

      getPausedThreads: () => {
        return get().threads.filter((t) => t.status === "paused");
      },

      getThreadById: (id) => {
        return get().threads.find((t) => t.id === id);
      },
    }),
    {
      name: "genie-recall-threads",
    }
  )
);
