import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import type { QueueState } from "./queueReducer";

// ─── Counts ───────────────────────────────────────────────────────────────────

export interface QueueCounts {
  queued: number;
  running: number;
  done: number;
  failed: number;
  cancelled: number;
  total: number;
  active: number; // running + queued
}

export function selectCounts(tasks: GenerationTask[]): QueueCounts {
  const counts = { queued: 0, running: 0, done: 0, failed: 0, cancelled: 0 };
  for (const t of tasks) {
    if (t.status in counts) counts[t.status as keyof typeof counts]++;
  }
  return {
    ...counts,
    total: tasks.length,
    active: counts.running + counts.queued,
  };
}

// ─── Filtered + sorted + searched ───────────────────────────────────────────

export function selectVisibleTasks(state: QueueState): GenerationTask[] {
  let tasks = state.tasks;

  // Filter
  if (state.filter !== "all") {
    tasks = tasks.filter((t) => t.status === state.filter);
  }

  // Search
  const q = state.search.trim().toLowerCase();
  if (q) {
    tasks = tasks.filter(
      (t) =>
        t.prompt.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q)
    );
  }

  // Sort
  tasks = [...tasks].sort((a, b) =>
    state.sort === "newest"
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt
  );

  return tasks;
}

// ─── Active tasks for status bar ─────────────────────────────────────────────

export function selectActiveTasks(tasks: GenerationTask[]): GenerationTask[] {
  return tasks
    .filter((t) => t.status === "running" || t.status === "queued")
    .sort((a, b) => {
      // running first
      if (a.status === "running" && b.status !== "running") return -1;
      if (b.status === "running" && a.status !== "running") return 1;
      return a.createdAt - b.createdAt;
    });
}

// ─── Avg progress of active tasks ────────────────────────────────────────────

export function selectAvgProgress(tasks: GenerationTask[]): number {
  const running = tasks.filter((t) => t.status === "running");
  if (!running.length) return 0;
  return Math.round(running.reduce((s, t) => s + t.progress, 0) / running.length);
}

// ─── Queue positions ─────────────────────────────────────────────────────────

export function selectWithQueuePositions(tasks: GenerationTask[]): GenerationTask[] {
  const queuedSorted = tasks
    .filter((t) => t.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);

  const positionMap = new Map(queuedSorted.map((t, i) => [t.id, i + 1]));

  return tasks.map((t) =>
    t.status === "queued" ? { ...t, position: positionMap.get(t.id) } : t
  );
}
