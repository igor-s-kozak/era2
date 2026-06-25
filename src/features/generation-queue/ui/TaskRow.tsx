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
        "flex items-center gap-4 px-4 py-3 rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-1)] hover:bg-[var(--era-bg-2)] transition-colors group min-h-[80px]",
        className,
      )}
    >
      {/* Thumb */}
      <TaskThumb type={task.type} className="shrink-0" />

      {/* Middle */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p className="text-[var(--era-fg)] text-[15px] font-medium font-geist truncate leading-snug">
          {task.prompt}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--era-fg-low)] shrink-0" />
            <span className="text-[var(--era-fg-mute)] text-[13px] font-mono-geist">
              {task.model}
            </span>
          </div>
          <span className="text-[var(--era-fg-low)] text-[13px]">·</span>
          <span className="text-[var(--era-fg-mute)] text-[13px] font-mono-geist">
            {meta}
          </span>
        </div>

        {task.status === "running" && (
          <ProgressBar
            progress={task.progress}
            className="w-full max-w-[640px]"
          />
        )}

        {(task.status === "failed" || task.status === "cancelled") &&
          task.errorMessage && (
            <p className="text-[#ff5f57] text-[12px] font-geist">
              {task.errorMessage}
            </p>
          )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">
        {task.status === "running" && (
          <span className="text-[var(--era-fg-dim)] text-[15px] font-mono-geist tabular-nums w-9 text-right">
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
