import type { GenerationTask } from "@/entities/generation-task";
import { SEED_TASKS } from "@/entities/generation-task";
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
import { randomizeSeed } from "../lib/randomize";
import { QueueEngine } from "./queueEngine";
import {
  initialState,
  queueReducer,
  type QueueAction,
  type QueueState,
} from "./queueReducer";
import {
  loadTasks,
  persistTasks,
  throttledPersistTasks,
} from "../lib/manageLocaleStorageTasks";

// ─── Context ────────────────────────────────────────────────────────────────

export interface QueueContextValue {
  state: QueueState;
  dispatch: React.Dispatch<QueueAction>;
  cancelTask: (id: string) => void;
  /** Снимок для отмены при удалении */
  undoSnapshot: GenerationTask[] | null;
  commitUndo: () => void;
  clearUndo: () => void;
}

export const QueueContext = createContext<QueueContextValue | null>(null);

export function useQueueContext() {
  const ctx = useContext(QueueContext);
  if (!ctx)
    throw new Error("useQueueContext must be used within QueueProvider");
  return ctx;
}



export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  

  const engineRef = useRef<QueueEngine | null>(null);

  // Для отмены при удалении
  const [undoSnapshot, setUndoSnapshot] = useState<GenerationTask[] | null>(
    null,
  );

  const cancelTask = useCallback((id: string) => {
    engineRef.current?.cancelTask(id);
  }, []);

  const commitUndo = useCallback(() => {
    if (undoSnapshot) {
      dispatch({ type: "INIT_SUCCESS", payload: undoSnapshot });
      setUndoSnapshot(null);
    }
  }, [undoSnapshot]);

  const clearUndo = useCallback(() => {
    setUndoSnapshot((prev) => {
      if (prev) {
        persistTasks(prev.filter((t) => t.status !== "done"));
      }
      return null;
    });
  }, []);

  // сохранить слепок данных при удалении для последующего восстановления
  const wrappedDispatch: React.Dispatch<QueueAction> = useCallback((action) => {
    if (action.type === "CLEAR_DONE" || action.type === "DELETE_TASKS") {
      setUndoSnapshot(stateRef.current.tasks);
    }
    dispatch(action);
  }, []);

  useEffect(() => {
    dispatch({ type: "INIT_START" });
    const timer = setTimeout(() => {
      // ~5% chance of init error (for demo)
      if (Math.random() < 0.05) {
        dispatch({ type: "INIT_ERROR" });
        return;
      }
      const saved = loadTasks();
      const randomizedTasks = randomizeSeed(SEED_TASKS);
      const tasks = saved ?? randomizedTasks;
      dispatch({ type: "INIT_SUCCESS", payload: tasks });
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Запуск/остановка движка
  useEffect(() => {
    if (state.loadingState !== "ready") return;

    const engine = new QueueEngine(dispatch, () => stateRef.current);
    engineRef.current = engine;
    engine.start();

    return () => engine.stop();
  }, [state.loadingState]);

  // Persist on every tasks change
  useEffect(() => {
    /*
      тротлинг при сохранении в localStorage, 
      ибо сохранении на каждый тик - это слишком
    */
    if (state.loadingState === "ready") {
      throttledPersistTasks(state.tasks);
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
    [state, wrappedDispatch, cancelTask, undoSnapshot, commitUndo, clearUndo],
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}
