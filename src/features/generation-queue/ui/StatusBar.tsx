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
  const [expanded, setExpanded] = useState(false);
  const count = activeTasks.length;

  const running = activeTasks.filter((t) => t.status === "running");

  if (count === 0) return null;

  if (!expanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-md:bottom-4 max-md:right-0 max-md:left-0 max-md:w-full max-md:rounded-none max-md:border-x-0 max-md:border-b-0">
        <button
          onClick={() => setExpanded(true)}
          className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] text-muted-foreground shadow-lg transition-colors hover:bg-muted"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
          {count}{" "}
          {count === 1 ? "генерация" : count > 4 ? "генераций" : "генерации"} ·{" "}
          {avgProgress}%
          <ChevronRight className="max-md:absolute max-md:right-6" size={13} />
        </button>
      </div>
    );
  }

  // Один таск
  if (count === 1) {
    const task = activeTasks[0];

    return (
      <div className="fixed bottom-6 right-6 z-50 max-md:bottom-4 max-md:right-0 max-md:left-0 max-md:rounded-none max-md:rounded-t-2xl">
        <div
          className={cn(
            "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
            "sm:rounded-b-none",
          )}
        >
          <div className="flex items-center gap-3 p-4">
            <TaskThumb type={task.type} size="sm" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">
                Генерация {typeLabel(task.type)}
              </p>

              <p className="font-mono text-[12px] text-muted-foreground">
                {task.model} · {Math.round(task.progress)}%
              </p>

              {task.status === "running" && (
                <ProgressBar progress={task.progress} className="mt-1.5" />
              )}
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Несколько тасков
  const previewTasks = activeTasks.slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-md:bottom-4 max-md:right-0 max-md:left-0 max-md:rounded-none max-md:rounded-t-2xl">
      <div
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
          "sm:rounded-b-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-foreground">
              Генерации идут
            </p>
            <p className="font-mono text-[12px] text-muted-foreground">
              {running.length} {pluralActive(running.length)} · {avgProgress}%
            </p>
          </div>

          <button
            onClick={() => setExpanded(false)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Список тасков */}
        <div className="flex flex-col gap-2 px-3.5 py-2">
          {previewTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5">
              <TaskThumb type={task.type} size="sm" className="shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-muted-foreground">
                  {task.prompt}
                </p>

                {task.status === "running" ? (
                  <ProgressBar
                    progress={task.progress}
                    className="mt-1"
                    animated
                  />
                ) : (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    в очереди
                  </p>
                )}
              </div>

              <span className="w-7 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
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
          className="flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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