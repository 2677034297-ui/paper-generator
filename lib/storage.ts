import type { HistoryEntry, GradeResult } from "./types";

const HISTORY_KEY = "cet_essay_history";
const MAX_HISTORY = 50;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(
  essay: string,
  topic: string,
  result: GradeResult
): string {
  if (typeof window === "undefined") return "";
  const id = generateId();
  const entry: HistoryEntry = {
    id,
    topic,
    essay,
    result,
    createdAt: new Date().toISOString(),
  };

  const history = getHistory();
  history.unshift(entry);

  // 保留最近 50 条
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage 满了，清除旧数据后重试
    history.length = Math.floor(MAX_HISTORY / 2);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  return id;
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  const history = getHistory();
  return history.find((e) => e.id === id) || null;
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function updateHistoryUpgrade(
  id: string,
  band: "11" | "14",
  improvedVersion: string
): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  const entry = history.find((e) => e.id === id);
  if (entry) {
    if (band === "11") {
      entry.result.improved_version_11 = improvedVersion;
    } else {
      entry.result.improved_version_14 = improvedVersion;
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}
