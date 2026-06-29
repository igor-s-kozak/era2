import { GenerationTask } from "@/entities/generation-task";

export const DURATION_MAP: Record<GenerationTask["type"], [number, number]> = {
  text: [8_000, 15_000],
  image: [15_000, 30_000],
  video: [40_000, 90_000],
  audio: [25_000, 50_000],
};

export const ERROR_MESSAGES = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
];

export const MAX_CONCURRENT = 2;