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
        "flex flex-col gap-3 p-3.5 rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-1)]",
        className,
      )}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <TaskThumb type={task.type} size="sm" className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[var(--era-fg)] text-[14px] font-medium font-geist leading-snug line-clamp-2">
            {task.prompt}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--era-fg-low)] shrink-0" />
            <span className="text-[var(--era-fg-mute)] text-[12px] font-mono-geist">
              {task.model}
            </span>
            <span className="text-[var(--era-fg-low)] text-[12px]">·</span>
            <span className="text-[var(--era-fg-mute)] text-[12px] font-mono-geist">
              {meta}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {task.status === "running" && <ProgressBar progress={task.progress} />}

      {/* Error */}
      {(task.status === "failed" || task.status === "cancelled") &&
        task.errorMessage && (
          <p className="text-[#ff5f57] text-[12px] font-geist">
            {task.errorMessage}
          </p>
        )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {task.status === "running" && (
            <span className="text-[var(--era-fg-dim)] text-[13px] font-mono-geist tabular-nums">
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
    const pos = task.position != null ? `позиция ${task.position}` : "очередь";
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
