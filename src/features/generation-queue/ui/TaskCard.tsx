import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { formatCredits, formatDuration, formatEta } from "../lib/formatEta";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";
import { TaskThumb } from "./TaskThumb";

interface TaskCardProps {
  task: GenerationTask;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
  className?: string;
}

export function TaskCard({
  task,
  onCancel,
  onRetry,
  onDelete,
  className,
}: TaskCardProps) {
  const meta = buildMeta(task);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <TaskThumb type={task.type} size="sm" className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground">
            {task.prompt}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
            <span className="text-[12px] font-mono text-muted-foreground">
              {task.model}
            </span>
            <span className="text-[12px] text-muted-foreground">·</span>
            <span className="text-[12px] font-mono text-muted-foreground">
              {meta}
            </span>
          </div>
        </div>
      </div>

      {task.status === "running" && (
        <ProgressBar progress={task.progress} />
      )}

      {(task.status === "failed" || task.status === "cancelled") &&
        task.errorMessage && (
          <p className="text-[12px] text-destructive">
            {task.errorMessage}
          </p>
        )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />

          {task.status === "running" && (
            <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
              {Math.round(task.progress)}%
            </span>
          )}
        </div>

        <TaskActions
          task={task}
          onCancel={onCancel}
          onRetry={onRetry}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function buildMeta(task: GenerationTask): string {
  if (task.status === "queued") {
    const pos =
      task.position != null ? `позиция ${task.position}` : "очередь";
    return `${pos} · ${formatCredits(task.credits)}`;
  }

  if (task.status === "running" && task.etaSeconds != null) {
    return `${formatEta(task.etaSeconds)} · ${formatCredits(task.credits)}`;
  }

  if (task.status === "done" && task.startedAt && task.finishedAt) {
    return `${formatDuration(
      task.startedAt,
      task.finishedAt,
    )} · ${formatCredits(task.credits)}`;
  }

  return formatCredits(task.credits);
}