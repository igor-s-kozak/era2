import { useCallback } from "react";
import { useQueueContext } from "./QueueProvider";
import {
  selectCounts,
  selectVisibleTasks,
  selectActiveTasks,
  selectAvgProgress,
  selectWithQueuePositions,
} from "./selectors";
import type { TaskStatus } from "@/entities/generation-task";

export function useQueue() {
  const { state, dispatch, cancelTask, undoSnapshot, commitUndo, clearUndo } =
    useQueueContext();

  const counts = selectCounts(state.tasks);
  const withPositions = selectWithQueuePositions(state.tasks);
  const stateWithPositions = { ...state, tasks: withPositions };
  const visibleTasks = selectVisibleTasks(stateWithPositions);
  const activeTasks = selectActiveTasks(state.tasks);
  const avgProgress = selectAvgProgress(state.tasks);

  const setFilter = useCallback(
    (f: TaskStatus | "all") => dispatch({ type: "SET_FILTER", payload: f }),
    [dispatch]
  );

  const setSort = useCallback(
    (s: "newest" | "oldest") => dispatch({ type: "SET_SORT", payload: s }),
    [dispatch]
  );

  const setSearch = useCallback(
    (q: string) => dispatch({ type: "SET_SEARCH", payload: q }),
    [dispatch]
  );

  const retryTask = useCallback(
    (id: string) => {
      dispatch({ type: "RETRY_TASK", payload: { id } });
      dispatch({type: "SET_LOADING_STATE", payload: 'ready'})
    },
    [dispatch]
  );

  const deleteTask = useCallback(
    (id: string) => dispatch({ type: "DELETE_TASK", payload: { id } }),
    [dispatch]
  );

  const clearDone = useCallback(
    () => dispatch({ type: "CLEAR_DONE" }),
    [dispatch]
  );

  return {
    // state
    loadingState: state.loadingState,
    tasks: visibleTasks,
    allTasks: state.tasks,
    counts,
    filter: state.filter,
    sort: state.sort,
    search: state.search,
    activeTasks,
    avgProgress,
    undoSnapshot,
    // actions
    cancelTask,
    retryTask,
    deleteTask,
    clearDone,
    setFilter,
    setSort,
    setSearch,
    commitUndo,
    clearUndo,
    dispatch,
  };
}
