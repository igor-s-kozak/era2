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
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {/* Filter chips — horizontal scroll on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => onFilterChange(chip.value)}
            className={cn(
              "h-[34px] px-[14px] rounded-full text-[14px] font-geist whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--era-accent)]",
              filter === chip.value
                ? "bg-[var(--era-accent)] text-white font-medium"
                : "border border-[var(--era-line)] bg-[var(--era-bg-1)] text-[var(--era-fg-mute)] hover:text-[var(--era-fg-dim)] hover:border-[var(--era-bg-3)]",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0" />

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--era-fg-low)] pointer-events-none"
        />
        <input
          type="text"
          defaultValue={search}
          onChange={handleSearch}
          placeholder="Поиск..."
          className="h-[34px] pl-8 pr-3 rounded-xl border border-[var(--era-line)] bg-[var(--era-bg-1)] text-[var(--era-fg-dim)] text-[14px] font-geist placeholder:text-[var(--era-fg-low)] focus:outline-none focus:border-[var(--era-accent)] transition-colors w-[160px]"
        />
      </div>

      {/* Sort dropdown */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => setSortOpen((v) => !v)}
          className="h-[34px] px-[14px] flex items-center gap-2 rounded-xl border border-[var(--era-line)] bg-[var(--era-bg-1)] text-[var(--era-fg-mute)] text-[14px] font-geist hover:text-[var(--era-fg-dim)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--era-accent)]"
        >
          {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          <ChevronDown
            size={13}
            className={cn("transition-transform", sortOpen && "rotate-180")}
          />
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-[var(--era-line)] bg-[var(--era-bg-1)] shadow-lg py-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setSortOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-[14px] font-geist transition-colors hover:bg-[var(--era-bg-3)]",
                  sort === opt.value
                    ? "text-[var(--era-fg)] font-medium"
                    : "text-[var(--era-fg-mute)]",
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
