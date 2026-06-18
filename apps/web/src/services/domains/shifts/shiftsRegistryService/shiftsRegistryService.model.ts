import { createEffect, createEvent, createStore, sample } from 'effector';

import type { Shift } from 'api/generated/api.types';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from 'api/pagination';
import {
  listShiftsRequest,
  type ShiftFilterQuery,
} from 'api/shifts.api';
import { toApiError } from 'services/core/apiError';

type LoadPayload = {
  query: ShiftFilterQuery;
  pagination: PaginationQuery;
};

const pageStarted = createEvent();
const queryChanged = createEvent<Partial<ShiftFilterQuery>>();
const submitted = createEvent();
const pageChanged = createEvent<number>();

const loadShiftsFx = createEffect<LoadPayload, PaginatedResponse<Shift>, Error>(
  async ({ query, pagination }) => {
    try {
      return await listShiftsRequest({ ...query, ...pagination });
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const $query = createStore<ShiftFilterQuery>({}).on(
  queryChanged,
  (query, patch) => ({ ...query, ...patch }),
);

const $pagination = createStore<PaginationQuery>({
  page: DEFAULT_PAGE,
  perPage: DEFAULT_PER_PAGE,
}).on(loadShiftsFx.doneData, (_, shiftsPage) => ({
  page: shiftsPage.meta.page,
  perPage: shiftsPage.meta.perPage,
}));

const $shiftsPage = createStore(getEmptyPaginatedResponse<Shift>()).on(
  loadShiftsFx.doneData,
  (_, shiftsPage) => shiftsPage,
);

const $error = createStore<string | null>(null)
  .reset(loadShiftsFx)
  .on(loadShiftsFx.failData, (_, error) => error.message);

sample({
  clock: pageStarted,
  source: { query: $query, pagination: $pagination },
  target: loadShiftsFx,
});

sample({
  clock: submitted,
  source: { query: $query, pagination: $pagination },
  fn: ({ query, pagination }) => ({
    query,
    pagination: { page: DEFAULT_PAGE, perPage: pagination.perPage },
  }),
  target: loadShiftsFx,
});

sample({
  clock: pageChanged,
  source: { query: $query, pagination: $pagination },
  fn: ({ query, pagination }, page) => ({
    query,
    pagination: { ...pagination, page },
  }),
  target: loadShiftsFx,
});

export const shiftsRegistryService = {
  inputs: {
    pageStarted,
    queryChanged,
    submitted,
    pageChanged,
  },
  outputs: {
    $query,
    $pagination,
    $shiftsPage,
    $error,
  },
};
