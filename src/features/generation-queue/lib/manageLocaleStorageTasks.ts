import { GenerationTask } from "@/entities/generation-task";

const LS_KEY = "era2_queue_v1";

export function persistTasks(tasks: GenerationTask[]) {
  try {
    const toSave = tasks.map((t) =>
      t.status === "running" ? { ...t, persistedAt: Date.now() } : t,
    );
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch (error) {
   console.error('Error during persisting tasks: ', error)
  }
}

function throttle<T extends (...args: Array<GenerationTask[]>) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let isThrottled = false;
  let savedArgs: Parameters<T> | null = null;
  let savedThis: ThisParameterType<T> | null = null;

  return function wrapper(
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    if (isThrottled) {
      savedArgs = args;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      savedThis = this;
      return;
    }

    func.apply(this, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis!, savedArgs);
        savedArgs = null;
        savedThis = null;
      }
    }, delay);
  };
}

export const throttledPersistTasks = throttle(persistTasks, 3000);

export function loadTasks(): GenerationTask[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.length === 0) return null;
    return parsed as GenerationTask[];
  } catch {
    return null;
  }
}