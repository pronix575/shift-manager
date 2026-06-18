const MINUTE_MS = 60_000;
const HOUR_MINUTES = 60;

export function getDurationMilliseconds(startedAt: Date, endedAt: Date | null) {
  if (!endedAt) {
    return 0;
  }

  return Math.max(0, endedAt.getTime() - startedAt.getTime());
}

export function getRoundedDurationMinutes(durationMs: number) {
  return Math.max(0, Math.round(durationMs / MINUTE_MS));
}

export function formatDurationFromMilliseconds(durationMs: number) {
  const totalMinutes = getRoundedDurationMinutes(durationMs);
  const hours = Math.floor(totalMinutes / HOUR_MINUTES);
  const minutes = totalMinutes % HOUR_MINUTES;

  return `${hours}ч ${minutes}м`;
}
