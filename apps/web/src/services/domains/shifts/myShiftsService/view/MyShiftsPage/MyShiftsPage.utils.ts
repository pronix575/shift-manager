import type { DurationParts } from 'services/domains/shifts/shiftFormat';

export function formatTimerValue(value: DurationParts[keyof DurationParts]) {
  return value.toString().padStart(2, '0');
}
