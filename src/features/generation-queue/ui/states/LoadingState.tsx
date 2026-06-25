import { cn } from "@/shared/lib/utils";

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-1)]", className)}>
      <div className="w-14 h-14 rounded-xl bg-[var(--era-bg-3)] animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 w-2/3 rounded-full bg-[var(--era-bg-3)] animate-pulse" />
        <div className="h-3 w-1/3 rounded-full bg-[var(--era-bg-3)] animate-pulse" />
      </div>
      <div className="h-6 w-16 rounded-full bg-[var(--era-bg-3)] animate-pulse shrink-0" />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(5)].map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
