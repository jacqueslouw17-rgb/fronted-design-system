import { useEffect, useState } from "react";

export type Sentiment = "positive" | "neutral" | "negative";

export type ReactionRecord = {
  id: string;
  flowId: string;
  userRole: string;
  sentiment: Sentiment;
  reasonText?: string;
  messageId?: string;
  timestamp: number; // epoch ms
};

const STORAGE_KEY = "genie-reactions";

function readAll(): ReactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReactionRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: ReactionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function logReaction(data: Omit<ReactionRecord, "id" | "timestamp">): ReactionRecord {
  const record: ReactionRecord = {
    ...data,
    id: `rx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  const all = readAll();
  all.unshift(record);
  writeAll(all.slice(0, 500)); // keep last 500
  return record;
}

export function getReactions(limit?: number): ReactionRecord[] {
  const all = readAll();
  return typeof limit === "number" ? all.slice(0, limit) : all;
}

export function clearReactions() {
  writeAll([]);
}

export function useReactionAnalytics() {
  const [count, setCount] = useState<number>(readAll().length);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCount(readAll().length);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const log = (data: Omit<ReactionRecord, "id" | "timestamp">) => {
    const r = logReaction(data);
    setCount((c) => c + 1);
    return r;
  };

  return { count, log, getReactions, clearReactions };
}
