import { Inbox } from "lucide-react";

interface EmptyStateProps {
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

export function EmptyState({ hasFilter, onClearFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Inbox size={28} strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <p className="text-[16px] font-medium text-foreground">
          {hasFilter ? "Нет задач по фильтру" : "Очередь пуста"}
        </p>

        <p className="mt-1 text-[14px] text-muted-foreground">
          {hasFilter
            ? "Попробуйте другой фильтр или сбросьте поиск"
            : "Запустите генерацию — задачи появятся здесь"}
        </p>
      </div>

      {hasFilter && onClearFilter && (
        <button
          onClick={onClearFilter}
          className="mt-2 h-9 rounded-full border border-border bg-card px-4 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Сбросить фильтр
        </button>
      )}
    </div>
  );
}