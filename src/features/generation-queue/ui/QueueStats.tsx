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
        "flex flex-col gap-2 rounded-2xl border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
        <span className="text-[14px] text-muted-foreground">{label}</span>
      </div>
      <span className="font-mono text-[30px] font-semibold leading-none tabular-nums text-foreground">
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
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>
      <StatCard
        label="В очереди"
        value={counts.queued}
        dotColor="bg-muted-foreground"
      />
      <StatCard
        label="Идёт"
        value={counts.running}
        dotColor="bg-primary"
      />
      <StatCard
        label="Готово"
        value={counts.done}
        dotColor="bg-[#4caf7d]"
      />
      <StatCard
        label="Ошибка"
        value={counts.failed}
        dotColor="bg-destructive"
      />
    </div>
  );
}