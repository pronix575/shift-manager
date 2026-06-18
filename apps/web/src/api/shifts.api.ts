import type { Api } from './generated/api.types';
import { apiClient } from './http/client';
import type { PaginationQuery } from './pagination';

export type ShiftFilterQuery = Api.ShiftsControllerExport.RequestQuery;

export type ShiftQuery = ShiftFilterQuery & PaginationQuery;

export type StartShiftPayload = Api.ShiftsControllerStart.RequestBody;
export type UpdateShiftPayload = Api.ShiftsControllerUpdate.RequestBody;

function cleanQuery(query: Record<string, number | string | undefined>) {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ) as Record<string, string>;
}

export function listShiftsRequest(query: ShiftQuery = {}) {
  return apiClient
    .get('shifts', { searchParams: cleanQuery(query) })
    .json<Api.ShiftsControllerList.ResponseBody>();
}

export function listMyShiftsRequest(query: ShiftQuery = {}) {
  return apiClient
    .get('shifts/me', { searchParams: cleanQuery(query) })
    .json<Api.ShiftsControllerListMine.ResponseBody>();
}

export function startShiftRequest(payload: StartShiftPayload) {
  return apiClient
    .post('shifts/start', { json: payload })
    .json<Api.ShiftsControllerStart.ResponseBody>();
}

export function finishShiftRequest(id: string) {
  return apiClient
    .post(`shifts/${id}/finish`)
    .json<Api.ShiftsControllerFinish.ResponseBody>();
}

export function updateShiftRequest(id: string, payload: UpdateShiftPayload) {
  return apiClient
    .patch(`shifts/${id}`, { json: payload })
    .json<Api.ShiftsControllerUpdate.ResponseBody>();
}

export function getStatsSummaryRequest(query: ShiftFilterQuery = {}) {
  return apiClient
    .get('stats/summary', { searchParams: cleanQuery(query) })
    .json<Api.StatsControllerSummary.ResponseBody>();
}

export function exportShiftsRequest(query: ShiftFilterQuery = {}) {
  return apiClient
    .get('shifts/export.xlsx', { searchParams: cleanQuery(query) })
    .blob();
}
