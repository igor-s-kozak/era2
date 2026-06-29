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
        "h-[5px] w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full origin-left rounded-full bg-primary",
          animated && "transition-[width] duration-300 ease-out"
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}