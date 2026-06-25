import { cn } from "@/shared/lib/utils";

interface ProgressBarProps {
  progress: number; // 0–100
  className?: string;
  animated?: boolean;
}

export function ProgressBar({ progress, className, animated = true }: ProgressBarProps) {
  return (
    <div
      className={cn(
        "h-[5px] w-full rounded-full bg-[var(--era-bg-3)] overflow-hidden",
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[var(--era-accent)] origin-left",
          animated && "transition-[width] duration-300 ease-out"
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
