import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const LABELS: Record<TaskStatus, string> = {
  queued: "В очереди",
  running: "Идёт",
  done: "Готово",
  failed: "Ошибка",
  cancelled: "Отменено",
};

const STYLES: Record<TaskStatus, string> = {
  queued:
    "border border-border bg-muted text-muted-foreground",

  running:
    "border border-[rgba(232,84,32,0.25)] bg-[rgba(232,84,32,0.15)] text-[var(--c-accent-2)]",

  done:
    "border border-[rgba(76,175,125,0.25)] bg-[rgba(76,175,125,0.15)] text-[#4caf7d]",

  failed:
    "border border-[rgba(255,95,87,0.25)] bg-[rgba(255,95,87,0.15)] text-destructive",

  cancelled:
    "border border-border bg-muted text-[var(--c-fg-low)]",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-[10px] py-[3px] text-[12px] font-semibold",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}