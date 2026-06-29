import type { GenerationTask } from "@/entities/generation-task";
import type { QueueAction, QueueState } from "./queueReducer";
import { DURATION_MAP, ERROR_MESSAGES, MAX_CONCURRENT } from "../lib/consts";
import { randBetween } from "../lib/randomize";

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
    getState: () => QueueState,
  ) {
    this.dispatch = dispatch;
    this.getState = getState;
  }

  start() {
    this.stopped = false;
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
    this.dispatch({ type: "SET_LOADING_STATE", payload: "idle" });
    this.tickStates.clear();
  }

  cancelTask(id: string) {
    this.dispatch({ type: "CANCEL_TASK", payload: { id } });
    this.stopTaskTicker(id);
  }

  private fillSlots() {
    const state = this.getState();
    const running = state.tasks
      .filter((t) => t.status === "running")
      //@ts-expect-error: newly available array method
      .toSorted((a, b) => a.createdAt - b.createdAt);

    const queued = state.tasks
      .filter((t) => t.status === "queued")
      //@ts-expect-error: newly available array method
      .toSorted((a, b) => a.createdAt - b.createdAt);

    const runningAndQueued = [...running, ...queued].slice(0, MAX_CONCURRENT);

    if (runningAndQueued.length === 0) {
      this.stop();
    }

    for (const task of runningAndQueued) {
      if (!this.tickStates.has(task.id)) {
        this.startOrContinueTask(task);
      }
    }
  }

  private startOrContinueTask(task: GenerationTask) {
    const [minDur, maxDur] = DURATION_MAP[task.type];
    let totalDuration = randBetween(minDur, maxDur);
    const startedAt = Date.now();
  
    if (
      task.status === "running" &&
      task.persistedAt &&
      task.etaSeconds
    ) {
      /*
        Восстановление задачи, которая была в статусе running на момент, когда мы покинули страницу (закрыли и открыли через время/или сразу перезагрузка).  
        Принимается во внимание временнАя метка сохранения состояния таска в localStorage (task.persistedAt),
        примерное время до завершения выполнения на момент сохранения в localStorage (task.etaSeconds) и Date.now()  
      */
      if (task.persistedAt + task.etaSeconds * 1000 < Date.now()) {
        /*
          В этом блоке running-задачи при восстановлении переводятся в статус выполненных или failed       
        */
        if (Math.random() < 0.15) {
          const msg =
            ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
          this.dispatch({
            type: "SET_STATUS",
            payload: {
              id: task.id,
              status: "failed",
              errorMessage: msg,
              finishedAt: task.persistedAt! + task.etaSeconds! * 1000,
            },
          });
        }
        this.dispatch({
          type: "SET_STATUS",
          payload: {
            id: task.id,
            status: "done",
            finishedAt: task.persistedAt! + task.etaSeconds! * 1000,
          },
        });
        return;
      } else {
        /*
          В этом блоке восстанавливаем актуальные данные для running-задачи, которая не упала с ошибкой и не завершена к текущему моменту     
        */
  
        const now = Date.now();
        const oldElapsed = task.persistedAt - task.startedAt!; // продолжительность времени выполнения задачи на момент сохранения в localStorage
        const newElapsed = now - task.startedAt!
        const expectedCompletion = task.persistedAt + task.etaSeconds * 1000
        totalDuration = expectedCompletion - now;
        const newProgress = task.progress * (newElapsed/oldElapsed) // вычисляем по основному свойству пропорции
        this.dispatch({
          type: "RESTORE_TASK_FROM_STORAGE",
          payload: {id: task.id, progress: newProgress, etaSeconds: totalDuration}
        })
      }
    }
    

    if (task.status !== "running") {
      this.dispatch({
        type: "SET_STATUS",
        payload: { id: task.id, status: "running", startedAt },
      });
    }

    const TICK_MS = randBetween(400, 700);
    const ticksTotal = totalDuration / TICK_MS;
    const avgDelta = 100 / ticksTotal;

    const ts: TaskTickState = {
      intervalId: setInterval(() => {
        if (this.stopped) {
          return;
        }
        const currentState = this.getState();
        const currentTask = currentState.tasks.find((t) => t.id === task.id);

        if (!currentTask || currentTask.status !== "running") {
          this.stopTaskTicker(task.id);
          return;
        }

        ts.elapsed += TICK_MS;

        if (Math.random() < 0.15 / (100 / avgDelta)) {
          const msg =
            ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
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

        const delta = (avgDelta * randBetween(80, 120)) / 100;

        const oldProgress = currentTask.progress;
        const newProgress = Math.min(100, oldProgress + delta);

        if (newProgress === 100) {
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
          const etaSeconds = Math.ceil((totalDuration - ts.elapsed) / 1000);
          this.dispatch({
            type: "TICK_PROGRESS",
            payload: { id: task.id, progress: newProgress, etaSeconds },
          });
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
