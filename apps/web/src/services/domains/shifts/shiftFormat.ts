import type { Shift } from 'api/generated/api.types';

const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;
const HOUR_MINUTES = 60;
const MINUTE_SECONDS = 60;
const HOUR_SECONDS = HOUR_MINUTES * MINUTE_SECONDS;
const DAY_SECONDS = 24 * HOUR_SECONDS;

export type DurationParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function formatPersonName(person: {
  lastName: string;
  firstName: string;
  middleName?: string | null;
}) {
  return [person.lastName, person.firstName, person.middleName]
    .filter(Boolean)
    .join(' ');
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDurationFromMinutes(totalMinutes: number) {
  const roundedMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(roundedMinutes / HOUR_MINUTES);
  const minutes = roundedMinutes % HOUR_MINUTES;

  return `${hours}ч ${minutes}м`;
}

export function formatDurationFromMilliseconds(durationMs: number) {
  return formatDurationFromMinutes(durationMs / MINUTE_MS);
}

export function formatDurationFromHours(hours: number) {
  return formatDurationFromMinutes(hours * HOUR_MINUTES);
}

export function getDurationPartsFromMilliseconds(
  durationMs: number,
): DurationParts {
  const safeDurationMs = Number.isFinite(durationMs) ? durationMs : 0;
  const totalSeconds = Math.max(0, Math.floor(safeDurationMs / SECOND_MS));

  return {
    days: Math.floor(totalSeconds / DAY_SECONDS),
    hours: Math.floor((totalSeconds % DAY_SECONDS) / HOUR_SECONDS),
    minutes: Math.floor((totalSeconds % HOUR_SECONDS) / MINUTE_SECONDS),
    seconds: totalSeconds % MINUTE_SECONDS,
  };
}

export function formatDurationPartsLabel(parts: DurationParts) {
  const days = parts.days > 0 ? `${parts.days}д ` : '';

  return `${days}${parts.hours}ч ${parts.minutes}м ${parts.seconds}с`;
}

export function getShiftDuration(shift: Shift) {
  if (!shift.endedAt) {
    return '—';
  }

  const durationMs =
    new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime();

  return formatDurationFromMilliseconds(durationMs);
}
