import type { TaskStatus } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type FilterValue = TaskStatus | "all";
type SortValue = "newest" | "oldest";

const FILTER_CHIPS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
];

interface QueueToolbarProps {
  filter: FilterValue;
  sort: SortValue;
  search: string;
  onFilterChange: (f: FilterValue) => void;
  onSortChange: (s: SortValue) => void;
  onSearchChange: (q: string) => void;
  className?: string;
}

export function QueueToolbar({
  filter,
  sort,
  search,
  onFilterChange,
  onSortChange,
  onSearchChange,
  className,
}: QueueToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange(val), 300);
    },
    [onSearchChange],
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="no-scrollbar flex flex-shrink-0 items-center gap-2 overflow-x-auto max-md:w-full">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => onFilterChange(chip.value)}
            className={cn(
              "h-[34px] whitespace-nowrap rounded-full px-[14px] text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === chip.value
                ? "bg-primary font-medium text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:border-muted hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1" />

      <div className="relative max-md:hidden">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-fg-low)]"
        />
        <input
          type="text"
          defaultValue={search}
          onChange={handleSearch}
          placeholder="Поиск..."
          className="h-[34px] w-[160px] rounded-xl border border-border bg-card pl-8 pr-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none"
        />
      </div>

      <div className="relative max-md:hidden" ref={sortRef}>
        <button
          onClick={() => setSortOpen((v) => !v)}
          className="flex h-[34px] items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-[14px] text-[14px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          <ChevronDown
            size={13}
            className={cn("transition-transform", sortOpen && "rotate-180")}
          />
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-border bg-card py-1 shadow-lg">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setSortOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-[14px] transition-colors hover:bg-muted",
                  sort === opt.value
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}