import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

// ─── State ──────────────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "error" | "ready";

export interface QueueState {
  tasks: GenerationTask[];
  loadingState: LoadingState;
  filter: TaskStatus | "all";
  sort: "newest" | "oldest";
  search: string;
}

export const initialState: QueueState = {
  tasks: [],
  loadingState: "idle",
  filter: "all",
  sort: "newest",
  search: "",
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type QueueAction =
  | { type: "INIT_START" }
  | { type: "INIT_SUCCESS"; payload: GenerationTask[] }
  | { type: "INIT_ERROR" }
  | { type: "TICK_PROGRESS"; payload: { id: string; delta: number } }
  | { type: "SET_STATUS"; payload: { id: string; status: TaskStatus; errorMessage?: string; startedAt?: number; finishedAt?: number } }
  | { type: "CANCEL_TASK"; payload: { id: string } }
  | { type: "RETRY_TASK"; payload: { id: string } }
  | { type: "DELETE_TASK"; payload: { id: string } }
  | { type: "DELETE_TASKS"; payload: { ids: string[] } }
  | { type: "CLEAR_DONE" }
  | { type: "RESTORE_TASKS"; payload: { ids: string[] } } // undo support
  | { type: "SET_FILTER"; payload: TaskStatus | "all" }
  | { type: "SET_SORT"; payload: "newest" | "oldest" }
  | { type: "SET_SEARCH"; payload: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "INIT_START":
      return { ...state, loadingState: "loading" };

    case "INIT_SUCCESS":
      return { ...state, loadingState: "ready", tasks: action.payload };

    case "INIT_ERROR":
      return { ...state, loadingState: "error" };

    case "TICK_PROGRESS": {
      const { id, delta } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== id || t.status !== "running") return t;
          const newProgress = Math.min(100, t.progress + delta);
          return { ...t, progress: newProgress };
        }),
      };
    }

    case "SET_STATUS": {
      const { id, status, errorMessage, startedAt, finishedAt } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          const updates: Partial<GenerationTask> = { status, errorMessage };
          if (startedAt !== undefined) updates.startedAt = startedAt;
          if (finishedAt !== undefined) updates.finishedAt = finishedAt;
          if (status === "done") updates.progress = 100;
          if (status === "running") updates.progress = t.progress || 0;
          return { ...t, ...updates };
        }),
      };
    }

    case "CANCEL_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id && (t.status === "running" || t.status === "queued")
            ? { ...t, status: "cancelled", errorMessage: "Отменено пользователем" }
            : t
        ),
      };

    case "RETRY_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id && (t.status === "failed" || t.status === "cancelled")
            ? { ...t, status: "queued", progress: 0, errorMessage: undefined, startedAt: undefined, finishedAt: undefined, createdAt: Date.now() }
            : t
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
      };

    case "DELETE_TASKS":
      return {
        ...state,
        tasks: state.tasks.filter((t) => !action.payload.ids.includes(t.id)),
      };

    case "CLEAR_DONE":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.status !== "done"),
      };

    case "RESTORE_TASKS": {
      // no-op: handled externally via optimistic undo (snapshot restore)
      return state;
    }

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_SORT":
      return { ...state, sort: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    default:
      return state;
  }
}
