import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { formatCredits, formatDuration, formatEta } from "../lib/formatEta";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { TaskActions } from "./TaskActions";
import { TaskThumb } from "./TaskThumb";

interface TaskRowProps {
  task: GenerationTask;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
  className?: string;
}

export function TaskRow({
  task,
  onCancel,
  onRetry,
  onDelete,
  className,
}: TaskRowProps) {
  const meta = buildMeta(task);

  return (
    <div
      className={cn(
        "group flex min-h-[80px] items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted",
        className,
      )}
    >
      {/* Thumb */}
      <TaskThumb type={task.type} className="shrink-0" />

      {/* Middle */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate text-[15px] font-medium leading-snug text-foreground">
          {task.prompt}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
            <span className="font-mono text-[13px] text-muted-foreground">
              {task.model}
            </span>
          </div>

          <span className="text-[13px] text-muted-foreground">·</span>

          <span className="font-mono text-[13px] text-muted-foreground">
            {meta}
          </span>
        </div>

        {task.status === "running" && (
          <ProgressBar progress={task.progress} className="w-full" />
        )}

        {(task.status === "failed" || task.status === "cancelled") &&
          task.errorMessage && (
            <p className="text-[12px] text-destructive">
              {task.errorMessage}
            </p>
          )}
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-3">
        {task.status === "running" && (
          <span className="w-9 text-right font-mono text-[15px] tabular-nums text-muted-foreground">
            {Math.round(task.progress)}%
          </span>
        )}

        <StatusBadge status={task.status} />

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
      task.position != null
        ? `позиция ${task.position} в очереди`
        : "в очереди";
    return `${pos} · ${formatCredits(task.credits)}`;
  }

  if (task.status === "running" && task.etaSeconds != null) {
    return `${formatEta(task.etaSeconds)} · ${formatCredits(task.credits)}`;
  }

  if (task.status === "done" && task.startedAt && task.finishedAt) {
    return `${formatDuration(task.startedAt, task.finishedAt)} · ${formatCredits(task.credits)}`;
  }

  return formatCredits(task.credits);
}