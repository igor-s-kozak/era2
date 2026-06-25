import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { Download, MoreHorizontal, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
interface TaskActionsProps {
  task: GenerationTask;
  onCancel: () => void;
  onRetry: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  className?: string;
}

function IconBtn({
  onClick,
  title,
  className,
  children,
}: {
  onClick: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center text-[var(--era-fg-mute)] hover:text-[var(--era-fg-dim)] hover:bg-[var(--era-bg-3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--era-accent)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TaskActions({
  task,
  onCancel,
  onRetry,
  onDelete,
  onDownload,
}: TaskActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  const primaryAction = (() => {
    if (task.status === "running" || task.status === "queued") {
      return (
        <IconBtn onClick={onCancel} title="Отменить">
          <X size={14} />
        </IconBtn>
      );
    }
    if (task.status === "failed" || task.status === "cancelled") {
      return (
        <IconBtn onClick={onRetry} title="Повторить">
          <RotateCcw size={14} />
        </IconBtn>
      );
    }
    if (task.status === "done") {
      return (
        <IconBtn onClick={onDownload ?? (() => {})} title="Скачать">
          <Download size={14} />
        </IconBtn>
      );
    }
    return null;
  })();

  return (
    <div className="flex items-center gap-1">
      {primaryAction}

      <div className="relative" ref={menuRef}>
        <IconBtn onClick={() => setMenuOpen((v) => !v)} title="Ещё">
          <MoreHorizontal size={14} />
        </IconBtn>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-xl border border-[var(--era-line)] bg-[var(--era-bg-1)] shadow-lg py-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ff5f57] hover:bg-[var(--era-bg-3)] transition-colors font-geist"
            >
              <Trash2 size={13} />
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
