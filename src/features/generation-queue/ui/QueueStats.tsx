import { cn } from "@/shared/lib/utils";
import type { QueueCounts } from "../model/selectors";
interface StatCardProps {
  label: string;
  value: number;
  dotColor: string;
  className?: string;
}

function StatCard({ label, value, dotColor, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-1)]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
        <span className="text-[var(--era-fg-mute)] text-[14px] font-geist">
          {label}
        </span>
      </div>
      <span className="text-[var(--era-fg)] text-[30px] font-semibold font-geist leading-none tabular-nums">
        {value}
      </span>
    </div>
  );
}

interface QueueStatsProps {
  counts: QueueCounts;
  className?: string;
}

export function QueueStats({ counts, className }: QueueStatsProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-3 sm:grid-cols-2", className)}>
      <StatCard
        label="В очереди"
        value={counts.queued}
        dotColor="bg-[var(--era-fg-mute)]"
      />
      <StatCard
        label="Идёт"
        value={counts.running}
        dotColor="bg-[var(--era-accent)]"
      />
      <StatCard label="Готово" value={counts.done} dotColor="bg-[#4caf7d]" />
      <StatCard label="Ошибка" value={counts.failed} dotColor="bg-[#ff5f57]" />
    </div>
  );
}
