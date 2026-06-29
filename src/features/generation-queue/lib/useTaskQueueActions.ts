import { SEED_TASKS } from "@/entities/generation-task";
import { useCallback, useEffect, useState } from "react";
import { useQueue } from "../model/useQueue";

export function useTaskQueueActions({
  clearDone,
  clearUndo,
  commitUndo,
  dispatch,
  filter,
  search,
}: Pick<
  ReturnType<typeof useQueue>,
  "clearDone" | "clearUndo" | "commitUndo" | "dispatch" | "filter" | "search"
>) {

  const [undoTimer, setUndoTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleClearDone = useCallback(() => {
    clearDone();
    const t = setTimeout(() => clearUndo(), 5000);
    setUndoTimer(t);
  }, [clearDone, clearUndo]);

  const handleUndo = useCallback(() => {
    commitUndo();
    if (undoTimer) clearTimeout(undoTimer);
  }, [commitUndo, undoTimer]);

  useEffect(() => {
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [undoTimer]);

  const handleRetry = useCallback(() => {
    dispatch({ type: "INIT_START" });
    setTimeout(() => {
      dispatch({ type: "INIT_SUCCESS", payload: SEED_TASKS });
    }, 600);
  }, [dispatch]);

  const hasFilter = filter !== "all" || search.trim().length > 0;

  return {
    handleClearDone,
    handleUndo,
    handleRetry,
    hasFilter,
  };
}
