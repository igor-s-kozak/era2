import type { GenerationTask, TaskStatus } from "@/entities/generation-task";
import { persistTasks } from "../lib/manageLocaleStorageTasks";


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


export type QueueAction =
  | { type: "INIT_START" }
  | { type: "INIT_SUCCESS"; payload: GenerationTask[] }
  | { type: "INIT_ERROR" }
  | {
      type: "TICK_PROGRESS";
      payload: { id: string; progress: number; etaSeconds: number };
    }
  | {
      type: "SET_STATUS";
      payload: {
        id: string;
        status: TaskStatus;
        errorMessage?: string;
        startedAt?: number;
        finishedAt?: number;
      };
    }
  | { type: "CANCEL_TASK"; payload: { id: string } }
  | { type: "RETRY_TASK"; payload: { id: string } }
  | { type: "DELETE_TASK"; payload: { id: string } }
  | { type: "DELETE_TASKS"; payload: { ids: string[] } }
  | { type: "CLEAR_DONE" }
  | {
      type: "RESTORE_TASK_FROM_STORAGE";
      payload: { id: string; progress: number; etaSeconds: number };
    } // после восстановления из localstorage
  | { type: "SET_FILTER"; payload: TaskStatus | "all" }
  | { type: "SET_SORT"; payload: "newest" | "oldest" }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_LOADING_STATE"; payload: LoadingState };


export function queueReducer(
  state: QueueState,
  action: QueueAction,
): QueueState {
  
  switch (action.type) {
    case "INIT_START":
      return { ...state, loadingState: "loading" };

    case "INIT_SUCCESS":
      return { ...state, loadingState: "ready", tasks: action.payload };

    case "INIT_ERROR":
      return { ...state, loadingState: "error" };

    case "TICK_PROGRESS": {
      const { id, progress, etaSeconds } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== id || t.status !== "running") return t;
          return { ...t, progress, etaSeconds };
        }),
      };
    }

    case "SET_STATUS": {
      const { id, status, errorMessage, startedAt, finishedAt } =
        action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          const updates: Partial<GenerationTask> = { status, errorMessage };
          if (startedAt !== undefined) updates.startedAt = startedAt;
          if (finishedAt !== undefined) updates.finishedAt = finishedAt;
          if (status === "done") updates.progress = 100;
          updates.etaSeconds = 0;
          if (status === "running") updates.progress = t.progress || 0;
          return { ...t, ...updates };
        }),
      };
    }

    case "CANCEL_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id &&
          (t.status === "running" || t.status === "queued")
            ? {
                ...t,
                status: "cancelled",
                errorMessage: "Отменено пользователем",
              }
            : t,
        ),
      };

    case "RETRY_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id &&
          (t.status === "failed" || t.status === "cancelled")
            ? {
                ...t,
                status: "queued",
                progress: 0,
                errorMessage: undefined,
                startedAt: undefined,
                finishedAt: undefined,
                createdAt: Date.now(),
              }
            : t,
        ),
      };

    case "DELETE_TASK": {
      const tasks = state.tasks.filter((t) => t.id !== action.payload.id);
      persistTasks(tasks);
      return {
        ...state,
        tasks
      };
    }
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

    case "RESTORE_TASK_FROM_STORAGE": {
      const { id, progress, etaSeconds } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((t, idx) => {
          if (t.id !== id) return t;
          return { ...t, progress, etaSeconds };
        }),
      };
    }

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_SORT":
      return { ...state, sort: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_LOADING_STATE":
      return { ...state, loadingState: action.payload };

    default:
      return state;
  }
}
