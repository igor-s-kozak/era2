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
    "bg-[var(--era-bg-3)] text-[var(--era-fg-mute)] border border-[var(--era-line)]",
  running:
    "bg-[rgba(232,84,32,0.15)] text-[var(--era-accent-2)] border border-[rgba(232,84,32,0.25)]",
  done: "bg-[rgba(76,175,125,0.15)] text-[#4caf7d] border border-[rgba(76,175,125,0.25)]",
  failed:
    "bg-[rgba(255,95,87,0.15)] text-[#ff5f57] border border-[rgba(255,95,87,0.25)]",
  cancelled:
    "bg-[var(--era-bg-3)] text-[var(--era-fg-low)] border border-[var(--era-line)]",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-[10px] py-[3px] rounded-full text-[12px] font-semibold font-geist whitespace-nowrap",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
