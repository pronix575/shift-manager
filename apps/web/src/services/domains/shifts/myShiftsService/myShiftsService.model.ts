import { combine, createEffect, createEvent, createStore, sample } from 'effector';

import type { Shift } from 'api/generated/api.types';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from 'api/pagination';
import {
  finishShiftRequest,
  listMyShiftsRequest,
  startShiftRequest,
} from 'api/shifts.api';
import { toApiError } from 'services/core/apiError';

type LoadResult = {
  shiftsPage: PaginatedResponse<Shift>;
  openShift: Shift | null;
};

const pageStarted = createEvent();
const pageChanged = createEvent<number>();
const departmentChanged = createEvent<string>();
const startShiftClicked = createEvent();
const finishShiftClicked = createEvent<string>();

const loadShiftsFx = createEffect<PaginationQuery, LoadResult, Error>(
  async (pagination) => {
    try {
      const shiftsPage = await listMyShiftsRequest(pagination);
      const pageOpenShift =
        shiftsPage.items.find((shift) => shift.status === 'OPEN') ?? null;

      if (shiftsPage.meta.page === DEFAULT_PAGE) {
        return { shiftsPage, openShift: pageOpenShift };
      }

      const firstPage = await listMyShiftsRequest({
        page: DEFAULT_PAGE,
        perPage: 1,
      });

      return {
        shiftsPage,
        openShift:
          firstPage.items.find((shift) => shift.status === 'OPEN') ?? null,
      };
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const startShiftFx = createEffect<string, void, Error>(async (departmentId) => {
  try {
    await startShiftRequest({
      departmentId: departmentId || undefined,
    });
  } catch (error) {
    throw await toApiError(error);
  }
});

const finishShiftFx = createEffect<string, void, Error>(async (shiftId) => {
  try {
    await finishShiftRequest(shiftId);
  } catch (error) {
    throw await toApiError(error);
  }
});

const $pagination = createStore<PaginationQuery>({
  page: DEFAULT_PAGE,
  perPage: DEFAULT_PER_PAGE,
}).on(loadShiftsFx.doneData, (_, result) => ({
  page: result.shiftsPage.meta.page,
  perPage: result.shiftsPage.meta.perPage,
}));

const $shiftsPage = createStore(getEmptyPaginatedResponse<Shift>()).on(
  loadShiftsFx.doneData,
  (_, result) => result.shiftsPage,
);

const $openShift = createStore<Shift | null>(null).on(
  loadShiftsFx.doneData,
  (_, result) => result.openShift,
);

const $departmentId = createStore('').on(
  departmentChanged,
  (_, departmentId) => departmentId,
);

const $message = createStore<string | null>(null)
  .reset(startShiftFx, finishShiftFx, loadShiftsFx)
  .on(startShiftFx.done, () => 'Смена начата')
  .on(finishShiftFx.done, () => 'Смена завершена');

const $error = createStore<string | null>(null)
  .reset(startShiftFx, finishShiftFx, loadShiftsFx)
  .on(startShiftFx.failData, (_, error) => error.message)
  .on(finishShiftFx.failData, (_, error) => error.message)
  .on(loadShiftsFx.failData, (_, error) => error.message);

const $isActionPending = combine(
  startShiftFx.pending,
  finishShiftFx.pending,
  (isStarting, isFinishing) => isStarting || isFinishing,
);

sample({
  clock: pageStarted,
  source: $pagination,
  target: loadShiftsFx,
});

sample({
  clock: pageChanged,
  source: $pagination,
  fn: (pagination, page) => ({ ...pagination, page }),
  target: loadShiftsFx,
});

sample({
  clock: startShiftClicked,
  source: $departmentId,
  target: startShiftFx,
});

sample({
  clock: finishShiftClicked,
  target: finishShiftFx,
});

sample({
  clock: startShiftFx.done,
  source: $pagination,
  target: loadShiftsFx,
});

sample({
  clock: finishShiftFx.done,
  source: $pagination,
  target: loadShiftsFx,
});

export const myShiftsService = {
  inputs: {
    pageStarted,
    pageChanged,
    departmentChanged,
    startShiftClicked,
    finishShiftClicked,
  },
  outputs: {
    $shiftsPage,
    $pagination,
    $openShift,
    $departmentId,
    $message,
    $error,
    $isActionPending,
  },
};
