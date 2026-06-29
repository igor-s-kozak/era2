import { GenerationTask } from "@/entities/generation-task";
import { DURATION_MAP, ERROR_MESSAGES } from "../lib/consts";


export function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomizeSeed (tasks: GenerationTask[]): GenerationTask[] {
  const now = Date.now();
  const tasksLen = tasks.length;
  const firstRunningTaskId = `t${Math.ceil(Math.random() * tasksLen * 2)}`;
  const secondRunningTaskId = `t${Math.ceil(Math.random() * tasksLen * 2)}`;
  const firstDoneTaskId = `t${Math.ceil(Math.random() * tasksLen)}`;
  const secondDoneTaskId = `t${Math.ceil(Math.random() * tasksLen)}`;
  const errorTaskId = `t${Math.ceil(Math.random() * tasksLen)}`; 

  return tasks.map((task, index) => {
    const [minDur, maxDur] = DURATION_MAP[task.type];
    const totalDuration = randBetween(minDur, maxDur);
    if ([firstRunningTaskId, secondRunningTaskId].includes(task.id)) {
      return {
        ...task,
        status: "running",
        startedAt: now - totalDuration + minDur,
        progress: minDur / totalDuration,
        etaSeconds: Math.floor((totalDuration - minDur) / 1000)
      };
    }
    if ([firstDoneTaskId, secondDoneTaskId].includes(task.id)) {
      const createdAt = now - index * 1e5;
      const ratio = ["image", "text"].includes(task.type) ? 0.9 : (index/10) + 1.1;
      const startedAt = createdAt + (index + 1) * 1e4 * ratio
      return {
        ...task,
        status: "done",
        progress: 100,
        createdAt,
        startedAt,
        finishedAt: startedAt + totalDuration,
        etaSeconds: 0,
      };
    }
    if (errorTaskId === task.id) {
      const credits = Math.ceil(Math.random() * 99) * index;
      const eMesRandInd = now % 3;
      const errorMessage = ERROR_MESSAGES[eMesRandInd];
      const createdAt = now - index * 1e5;
      const startedAt = createdAt + (index + 1) * 1e3
      return {
        ...task,
        status: "failed",
        progress: 0,
        createdAt,
        startedAt,
        credits: errorMessage === ERROR_MESSAGES[0] ? index * 3 : credits,
        errorMessage,
        finishedAt: startedAt + totalDuration
      };
    }
    return task;
  });
}