import type { GenerationTask } from "@/entities/generation-task";
import { cn } from "@/shared/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { TaskThumb } from "./TaskThumb";
interface StatusBarProps {
  activeTasks: GenerationTask[];
  avgProgress: number;
  onNavigateToQueue: () => void;
}

export function StatusBar({
  activeTasks,
  avgProgress,
  onNavigateToQueue,
}: StatusBarProps) {
  const [expanded, setExpanded] = useState(true);

  const count = activeTasks.length;
  const running = activeTasks.filter((t) => t.status === "running");

  if (count === 0) return null;

  // ─── Collapsed pill ────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 sm:bottom-0 sm:right-0 sm:left-0 sm:rounded-none sm:border-x-0 sm:border-b-0">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-full border border-[var(--era-line)] bg-[var(--era-bg-1)] text-[var(--era-fg-mute)] text-[13px] font-geist shadow-lg hover:bg-[var(--era-bg-2)] transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--era-accent)] animate-pulse shrink-0" />
          {count} {count === 1 ? "генерация" : "генерации"} · {avgProgress}%
          <ChevronRight size={13} />
        </button>
      </div>
    );
  }

  // ─── Single task ──────────────────────────────────────────────────────────
  if (count === 1) {
    const task = activeTasks[0];
    return (
      <div className="fixed bottom-6 right-6 z-50 sm:fixed sm:bottom-0 sm:right-0 sm:left-0 sm:rounded-none sm:rounded-t-2xl">
        <div
          className={cn(
            "w-[300px] sm:w-full rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-1)] shadow-xl overflow-hidden",
            "sm:rounded-b-none",
          )}
        >
          <div className="flex items-center gap-3 p-4">
            <TaskThumb type={task.type} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[var(--era-fg)] text-[13px] font-medium font-geist truncate">
                Генерация {typeLabel(task.type)}
              </p>
              <p className="text-[var(--era-fg-mute)] text-[12px] font-mono-geist">
                {task.model} · {Math.round(task.progress)}%
              </p>
              {task.status === "running" && (
                <ProgressBar progress={task.progress} className="mt-1.5" />
              )}
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-[var(--era-fg-low)] hover:text-[var(--era-fg-mute)] transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Multiple tasks ───────────────────────────────────────────────────────
  const previewTasks = activeTasks.slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:fixed sm:bottom-0 sm:right-0 sm:left-0 sm:rounded-none sm:rounded-t-2xl">
      <div
        className={cn(
          "w-[332px] sm:w-full rounded-2xl border border-[var(--era-line)] bg-[var(--era-bg-1)] shadow-xl overflow-hidden",
          "sm:rounded-b-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--era-line)]">
          <span className="w-[18px] h-[18px] rounded-full bg-[var(--era-accent)] flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--era-fg)] text-[14px] font-medium font-geist leading-tight">
              Генерации идут
            </p>
            <p className="text-[var(--era-fg-mute)] text-[12px] font-mono-geist">
              {running.length} {pluralActive(running.length)} · {avgProgress}%
            </p>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="text-[var(--era-fg-low)] hover:text-[var(--era-fg-mute)] transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Task list */}
        <div className="px-3.5 py-2 flex flex-col gap-2">
          {previewTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5">
              <TaskThumb type={task.type} size="sm" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[var(--era-fg-dim)] text-[12px] font-geist truncate">
                  {task.prompt}
                </p>
                {task.status === "running" ? (
                  <ProgressBar
                    progress={task.progress}
                    className="mt-1"
                    animated
                  />
                ) : (
                  <p className="text-[var(--era-fg-low)] text-[11px] font-geist mt-0.5">
                    в очереди
                  </p>
                )}
              </div>
              <span className="text-[var(--era-fg-low)] text-[11px] font-mono-geist tabular-nums shrink-0 w-7 text-right">
                {task.status === "running"
                  ? `${Math.round(task.progress)}%`
                  : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <button
          onClick={onNavigateToQueue}
          className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-[var(--era-line)] text-[var(--era-fg-mute)] text-[13px] font-geist hover:text-[var(--era-fg-dim)] hover:bg-[var(--era-bg-2)] transition-colors"
        >
          Открыть очередь
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

function typeLabel(type: GenerationTask["type"]): string {
  return {
    image: "изображения",
    video: "видео",
    text: "текста",
    audio: "аудио",
  }[type];
}

function pluralActive(n: number): string {
  if (n === 1) return "активна";
  if (n >= 2 && n <= 4) return "активны";
  return "активных";
}
