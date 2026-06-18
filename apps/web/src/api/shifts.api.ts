import { Shift, StatsSummary } from './generated/api.types';
import { apiClient } from './http/client';

export type ShiftQuery = {
  from?: string;
  to?: string;
  employeeId?: string;
  departmentId?: string;
};

export type StartShiftPayload = {
  departmentId?: string;
  comment?: string;
};

export type UpdateShiftPayload = {
  startedAt?: string;
  endedAt?: string;
  departmentId?: string;
  comment?: string;
};

function cleanQuery(query: ShiftQuery) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string>;
}

export function listShiftsRequest(query: ShiftQuery = {}) {
  return apiClient
    .get('shifts', { searchParams: cleanQuery(query) })
    .json<Shift[]>();
}

export function listMyShiftsRequest(query: ShiftQuery = {}) {
  return apiClient
    .get('shifts/me', { searchParams: cleanQuery(query) })
    .json<Shift[]>();
}

export function startShiftRequest(payload: StartShiftPayload) {
  return apiClient.post('shifts/start', { json: payload }).json<Shift>();
}

export function finishShiftRequest(id: string) {
  return apiClient.post(`shifts/${id}/finish`).json<Shift>();
}

export function updateShiftRequest(id: string, payload: UpdateShiftPayload) {
  return apiClient.patch(`shifts/${id}`, { json: payload }).json<Shift>();
}

export function getStatsSummaryRequest(query: ShiftQuery = {}) {
  return apiClient
    .get('stats/summary', { searchParams: cleanQuery(query) })
    .json<StatsSummary>();
}

export function exportShiftsRequest(query: ShiftQuery = {}) {
  return apiClient
    .get('shifts/export.xlsx', { searchParams: cleanQuery(query) })
    .blob();
}
