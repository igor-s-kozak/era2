import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(255,95,87,0.12)] flex items-center justify-center text-[#ff5f57]">
        <AlertTriangle size={28} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[var(--era-fg-dim)] text-[16px] font-medium ">
          Не удалось загрузить очередь
        </p>
        <p className="text-[var(--era-fg-mute)] text-[14px]  mt-1">
          Проверьте соединение и попробуйте снова
        </p>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 h-10 px-6 rounded-full bg-[var(--era-accent)] text-white text-[14px] font-medium  shadow-[0_6px_12px_rgba(232,84,33,0.4)] hover:bg-[var(--era-accent-2)] transition-colors"
      >
        Повторить
      </button>
    </div>
  );
}
