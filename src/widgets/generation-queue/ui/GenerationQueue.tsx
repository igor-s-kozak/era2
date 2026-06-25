import {
  EmptyState,
  ErrorState,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  useQueue,
} from "@/features/generation-queue";
import { LoadingState } from "@/features/generation-queue/ui/states/LoadingState";
import { cn } from "@/shared/lib/utils";
import { RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
interface GenerationQueueProps {
  className?: string;
}

export function GenerationQueue({ className }: GenerationQueueProps) {
  const {
    loadingState,
    tasks,
    counts,
    filter,
    sort,
    search,
    cancelTask,
    retryTask,
    deleteTask,
    clearDone,
    setFilter,
    setSort,
    setSearch,
    undoSnapshot,
    commitUndo,
    clearUndo,
    dispatch,
  } = useQueue();

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
      const { SEED_TASKS } = require("@/entities/generation-task");
      dispatch({ type: "INIT_SUCCESS", payload: SEED_TASKS });
    }, 600);
  }, [dispatch]);

  const hasFilter = filter !== "all" || search.trim().length > 0;

  if (loadingState === "loading" || loadingState === "idle") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="h-14 w-72 rounded-2xl bg-[var(--era-bg-3)] animate-pulse" />
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-[var(--era-bg-3)] animate-pulse"
            />
          ))}
        </div>
        <LoadingState />
      </div>
    );
  }

  if (loadingState === "error") {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[var(--era-fg)] text-[32px] sm:text-[24px] font-semibold font-geist leading-[1.1] tracking-tight">
            Очередь генераций
          </h1>
          <p className="text-[var(--era-fg-mute)] text-[14px] font-geist mt-1">
            Все ваши задачи в реальном времени
          </p>
        </div>
        {counts.done > 0 && (
          <button
            onClick={handleClearDone}
            className="shrink-0 flex items-center gap-2 h-10 px-4 rounded-full border border-[var(--era-line)] bg-[var(--era-bg-1)] text-[var(--era-fg-mute)] text-[14px] font-geist hover:text-[var(--era-fg-dim)] hover:border-[var(--era-bg-3)] transition-colors"
          >
            <Trash2 size={14} />
            <span className="sm:hidden">Очистить готовые</span>
          </button>
        )}
      </div>

      {/* Undo toast */}
      {undoSnapshot && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-2)]">
          <p className="text-[var(--era-fg-mute)] text-[14px] font-geist">
            Готовые задачи удалены
          </p>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 text-[var(--era-accent-2)] text-[14px] font-medium font-geist hover:text-[var(--era-accent-hi)] transition-colors"
          >
            <RotateCcw size={13} />
            Отменить
          </button>
        </div>
      )}

      {/* Stats */}
      <QueueStats counts={counts} />

      {/* Toolbar */}
      <QueueToolbar
        filter={filter}
        sort={sort}
        search={search}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onSearchChange={setSearch}
      />

      {/* List */}
      {tasks.length === 0 ? (
        <EmptyState
          hasFilter={hasFilter}
          onClearFilter={() => {
            setFilter("all");
            setSearch("");
          }}
        />
      ) : (
        <>
          {/* Desktop / Tablet rows */}
          <div className="hidden sm-up:flex flex-col gap-2 md:flex">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onCancel={() => cancelTask(task.id)}
                onRetry={() => retryTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onCancel={() => cancelTask(task.id)}
                onRetry={() => retryTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
