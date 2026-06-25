import { Inbox } from "lucide-react";

interface EmptyStateProps {
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

export function EmptyState({ hasFilter, onClearFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--era-bg-3)] flex items-center justify-center text-[var(--era-fg-low)]">
        <Inbox size={28} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[var(--era-fg-dim)] text-[16px] font-medium font-geist">
          {hasFilter ? "Нет задач по фильтру" : "Очередь пуста"}
        </p>
        <p className="text-[var(--era-fg-mute)] text-[14px] font-geist mt-1">
          {hasFilter
            ? "Попробуйте другой фильтр или сбросьте поиск"
            : "Запустите генерацию — задачи появятся здесь"}
        </p>
      </div>
      {hasFilter && onClearFilter && (
        <button
          onClick={onClearFilter}
          className="mt-2 h-9 px-4 rounded-full border border-[var(--era-line)] bg-[var(--era-bg-1)] text-[var(--era-fg-mute)] text-[14px] font-geist hover:text-[var(--era-fg-dim)] transition-colors"
        >
          Сбросить фильтр
        </button>
      )}
    </div>
  );
}
