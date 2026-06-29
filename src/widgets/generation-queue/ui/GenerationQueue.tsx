import {
  EmptyState,
  ErrorState,
  QueueStats,
  QueueToolbar,
  TaskCard,
  TaskRow,
  useQueue,
} from "@/features/generation-queue";
import { useTaskQueueActions } from "@/features/generation-queue/lib/useTaskQueueActions";
import { LoadingState } from "@/features/generation-queue/ui/states/LoadingState";
import { cn } from "@/shared/lib/utils";
import { RotateCcw, Trash2 } from "lucide-react";

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

  const { handleClearDone, handleUndo, handleRetry, hasFilter } =
    useTaskQueueActions({
      clearDone,
      clearUndo,
      commitUndo,
      dispatch,
      filter,
      search,
    });

  if (loadingState === "loading") {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="h-14 w-72 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-muted"
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
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[24px]">
            Очередь генераций
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Все ваши задачи в реальном времени
          </p>
        </div>

        {counts.done > 0 && (
          <button
            onClick={handleClearDone}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] text-muted-foreground transition-colors hover:border-muted hover:text-foreground"
          >
            <Trash2 size={14} />
            <span className="max-md:hidden">Очистить готовые</span>
          </button>
        )}
      </div>

      {/* Undo toast */}
      {undoSnapshot && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted px-4 py-3">
          <p className="text-[14px] text-muted-foreground">
            Готовые задачи удалены
          </p>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 text-[14px] font-medium text-primary transition-colors hover:text-primary/80"
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
          <div className="hidden flex-col gap-2 md:flex">
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