import { useEffect, useState } from "react";

export type TrustMetrics = {
  sentiment: number; // 0-100
  slaCompliance: number; // 0-100
  fxAccuracy: number; // 0-100
  legalIntegrity: number; // 0-100
  systemUptime: number; // 0-100
};

export type TrustStatus = "stable" | "caution" | "alert";

export type TrustRecord = {
  id: string;
  score: number;
  status: TrustStatus;
  metrics: TrustMetrics;
  timestamp: number;
  delta?: number; // change from previous
};

const STORAGE_KEY = "trust-index-data";

// Weights for composite score
const WEIGHTS = {
  sentiment: 0.4,
  slaCompliance: 0.25,
  fxAccuracy: 0.15,
  legalIntegrity: 0.1,
  systemUptime: 0.1,
};

function calculateScore(metrics: TrustMetrics): number {
  const score =
    metrics.sentiment * WEIGHTS.sentiment +
    metrics.slaCompliance * WEIGHTS.slaCompliance +
    metrics.fxAccuracy * WEIGHTS.fxAccuracy +
    metrics.legalIntegrity * WEIGHTS.legalIntegrity +
    metrics.systemUptime * WEIGHTS.systemUptime;
  return Math.round(score);
}

function getStatus(score: number): TrustStatus {
  if (score >= 85) return "stable";
  if (score >= 60) return "caution";
  return "alert";
}

function readHistory(): TrustRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrustRecord[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(records: TrustRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function logTrustUpdate(metrics: TrustMetrics): TrustRecord {
  const history = readHistory();
  const score = calculateScore(metrics);
  const previousScore = history[0]?.score;
  const delta = previousScore !== undefined ? score - previousScore : 0;

  const record: TrustRecord = {
    id: `trust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    score,
    status: getStatus(score),
    metrics,
    timestamp: Date.now(),
    delta,
  };

  history.unshift(record);
  writeHistory(history.slice(0, 100)); // keep last 100
  return record;
}

export function getTrustHistory(limit?: number): TrustRecord[] {
  const all = readHistory();
  return typeof limit === "number" ? all.slice(0, limit) : all;
}

export function getCurrentTrust(): TrustRecord | null {
  const history = readHistory();
  return history[0] || null;
}

export function clearTrustHistory() {
  writeHistory([]);
}

export function useTrustIndex() {
  const [current, setCurrent] = useState<TrustRecord | null>(() => getCurrentTrust());
  const [history, setHistory] = useState<TrustRecord[]>(() => getTrustHistory(10));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCurrent(getCurrentTrust());
        setHistory(getTrustHistory(10));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateTrust = (metrics: TrustMetrics) => {
    const record = logTrustUpdate(metrics);
    setCurrent(record);
    setHistory(getTrustHistory(10));
    return record;
  };

  return {
    current,
    history,
    updateTrust,
    clearHistory: () => {
      clearTrustHistory();
      setCurrent(null);
      setHistory([]);
    },
  };
}
