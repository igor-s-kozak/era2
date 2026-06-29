import { cn } from "@/shared/lib/utils";

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border bg-card p-4",
        className,
      )}
    >
      <div className="h-14 w-14 shrink-0 rounded-xl bg-muted animate-pulse" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-2/3 rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-1/3 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-6 w-16 shrink-0 rounded-full bg-muted animate-pulse" />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}