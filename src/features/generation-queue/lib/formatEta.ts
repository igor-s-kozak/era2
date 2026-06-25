export function formatEta(seconds: number): string {
  if (seconds <= 0) return "< 1 сек";
  if (seconds < 60) return `≈ ${seconds} сек`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `≈ ${m} мин`;
  return `≈ ${m} мин ${s} сек`;
}

export function formatDuration(startedAt: number, finishedAt: number): string {
  const ms = finishedAt - startedAt;
  const s = Math.round(ms / 1000);
  if (s < 60) return `за ${s} сек`;
  const m = Math.floor(s / 60);
  return `за ${m} мин`;
}

export function formatCredits(credits: number): string {
  return `${credits} cr`;
}
