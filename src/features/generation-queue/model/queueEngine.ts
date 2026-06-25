import type { GenerationTask } from "@/entities/generation-task";
import type { QueueAction, QueueState } from "./queueReducer";

export const MAX_CONCURRENT = 2;

// Duration profiles per type (ms to reach 100%)
const DURATION_MAP: Record<GenerationTask["type"], [number, number]> = {
  text: [8_000, 15_000],
  image: [15_000, 30_000],
  video: [40_000, 90_000],
  audio: [25_000, 50_000],
};

const ERROR_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
];

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Per-task tick state
interface TaskTickState {
  intervalId: ReturnType<typeof setInterval>;
  totalDuration: number;
  elapsed: number;
}

export class QueueEngine {
  private dispatch: React.Dispatch<QueueAction>;
  private getState: () => QueueState;
  private tickStates = new Map<string, TaskTickState>();
  private masterIntervalId?: ReturnType<typeof setInterval>;
  private stopped = false;

  constructor(
    dispatch: React.Dispatch<QueueAction>,
    getState: () => QueueState
  ) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  start() {
    this.stopped = false;
    // Master loop: fills slots every 500ms
    this.masterIntervalId = setInterval(() => {
      if (this.stopped) return;
      this.fillSlots();
    }, 500);
  }

  stop() {
    this.stopped = true;
    if (this.masterIntervalId !== undefined) {
      clearInterval(this.masterIntervalId);
    }
    for (const [, ts] of this.tickStates) {
      clearInterval(ts.intervalId);
    }
    this.tickStates.clear();
  }

  cancelTask(id: string) {
    this.dispatch({ type: "CANCEL_TASK", payload: { id } });
    this.stopTaskTicker(id);
  }

  private fillSlots() {
    const state = this.getState();
    const running = state.tasks.filter((t) => t.status === "running");
    const slots = MAX_CONCURRENT - running.length;
    if (slots <= 0) return;

    const queued = state.tasks
      .filter((t) => t.status === "queued")
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, slots);

    for (const task of queued) {
      this.startTask(task);
    }
  }

  private startTask(task: GenerationTask) {
    const [minDur, maxDur] = DURATION_MAP[task.type];
    const totalDuration = randBetween(minDur, maxDur);
    const startedAt = Date.now();

    this.dispatch({
      type: "SET_STATUS",
      payload: { id: task.id, status: "running", startedAt },
    });

    const TICK_MS = randBetween(400, 700);
    const ticksTotal = totalDuration / TICK_MS;
    const avgDelta = 100 / ticksTotal;

    const ts: TaskTickState = {
      intervalId: setInterval(() => {
        if (this.stopped) return;

        const currentState = this.getState();
        const currentTask = currentState.tasks.find((t) => t.id === task.id);

        if (!currentTask || currentTask.status !== "running") {
          this.stopTaskTicker(task.id);
          return;
        }

        ts.elapsed += TICK_MS;

        // Random failure ~15%
        if (Math.random() < 0.15 / (100 / avgDelta)) {
          const msg = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
          this.dispatch({
            type: "SET_STATUS",
            payload: {
              id: task.id,
              status: "failed",
              errorMessage: msg,
              finishedAt: Date.now(),
            },
          });
          this.stopTaskTicker(task.id);
          return;
        }

        const delta = avgDelta * randBetween(80, 120) / 100;
        const newProgress = Math.min(100, currentTask.progress + delta);

        if (newProgress >= 100) {
          this.dispatch({
            type: "SET_STATUS",
            payload: {
              id: task.id,
              status: "done",
              finishedAt: Date.now(),
            },
          });
          this.stopTaskTicker(task.id);
        } else {
          this.dispatch({ type: "TICK_PROGRESS", payload: { id: task.id, delta } });
        }
      }, TICK_MS),
      totalDuration,
      elapsed: 0,
    };

    this.tickStates.set(task.id, ts);
  }

  private stopTaskTicker(id: string) {
    const ts = this.tickStates.get(id);
    if (ts) {
      clearInterval(ts.intervalId);
      this.tickStates.delete(id);
    }
  }
}
