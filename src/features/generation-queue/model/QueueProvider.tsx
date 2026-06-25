import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GenerationTask } from "@/entities/generation-task";
import { SEED_TASKS } from "@/entities/generation-task";
import {
  initialState,
  queueReducer,
  type QueueAction,
  type QueueState,
} from "./queueReducer";
import { QueueEngine } from "./queueEngine";

const LS_KEY = "era2_queue_v1";

function persistTasks(tasks: GenerationTask[]) {
  try {
    // Running tasks are persisted as queued (they'll restart)
    const toSave = tasks.map((t) =>
      t.status === "running" ? { ...t, status: "queued" as const, progress: 0 } : t
    );
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

function loadTasks(): GenerationTask[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GenerationTask[];
  } catch {
    return null;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

export interface QueueContextValue {
  state: QueueState;
  dispatch: React.Dispatch<QueueAction>;
  cancelTask: (id: string) => void;
  /** Snapshot for undo */
  undoSnapshot: GenerationTask[] | null;
  commitUndo: () => void;
  clearUndo: () => void;
}

export const QueueContext = createContext<QueueContextValue | null>(null);

export function useQueueContext() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueueContext must be used within QueueProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const engineRef = useRef<QueueEngine | null>(null);

  // Undo support
  const [undoSnapshot, setUndoSnapshot] = useState<GenerationTask[] | null>(null);

  const cancelTask = useCallback((id: string) => {
    engineRef.current?.cancelTask(id);
  }, []);

  const commitUndo = useCallback(() => {
    if (undoSnapshot) {
      dispatch({ type: "INIT_SUCCESS", payload: undoSnapshot });
      setUndoSnapshot(null);
    }
  }, [undoSnapshot]);

  const clearUndo = useCallback(() => setUndoSnapshot(null), []);

  // Expose snapshot setter via dispatch wrapper
  const wrappedDispatch: React.Dispatch<QueueAction> = useCallback((action) => {
    if (action.type === "CLEAR_DONE" || action.type === "DELETE_TASKS") {
      setUndoSnapshot(stateRef.current.tasks);
    }
    dispatch(action);
  }, []);

  // Initialise
  useEffect(() => {
    dispatch({ type: "INIT_START" });

    const timer = setTimeout(() => {
      // ~5% chance of init error (for demo)
      if (Math.random() < 0.05) {
        dispatch({ type: "INIT_ERROR" });
        return;
      }
      const saved = loadTasks();
      const tasks = saved ?? SEED_TASKS;
      dispatch({ type: "INIT_SUCCESS", payload: tasks });
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Start/stop engine when ready
  useEffect(() => {
    if (state.loadingState !== "ready") return;

    const engine = new QueueEngine(dispatch, () => stateRef.current);
    engineRef.current = engine;
    engine.start();

    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loadingState]);

  // Persist on every tasks change
  useEffect(() => {
    if (state.loadingState === "ready") {
      persistTasks(state.tasks);
    }
  }, [state.tasks, state.loadingState]);

  const value = useMemo<QueueContextValue>(
    () => ({
      state,
      dispatch: wrappedDispatch,
      cancelTask,
      undoSnapshot,
      commitUndo,
      clearUndo,
    }),
    [state, wrappedDispatch, cancelTask, undoSnapshot, commitUndo, clearUndo]
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}
