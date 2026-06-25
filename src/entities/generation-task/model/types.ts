export type GenType = "text" | "image" | "video" | "audio";

export type TaskStatus =
  | "queued"
  | "running"
  | "done"
  | "failed"
  | "cancelled";

export interface GenerationTask {
  id: string;
  prompt: string;
  type: GenType;
  model: string;
  status: TaskStatus;
  progress: number; // 0–100
  createdAt: number; // Date.now()
  startedAt?: number;
  finishedAt?: number;
  credits: number;
  etaSeconds?: number; // estimated seconds remaining
  errorMessage?: string;
  position?: number; // position in queue (for queued tasks)
}
