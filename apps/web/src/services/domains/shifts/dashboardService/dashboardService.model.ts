import { createEffect, createEvent, createStore, sample } from 'effector';

import type { Organization, Shift, StatsSummary } from 'api/generated/api.types';
import { getOrganizationRequest } from 'api/organization.api';
import {
  DEFAULT_PAGE,
  getEmptyPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from 'api/pagination';
import {
  getStatsSummaryRequest,
  listShiftsRequest,
} from 'api/shifts.api';
import { toApiError } from 'services/core/apiError';

const DASHBOARD_SHIFTS_PER_PAGE = 8;

type DashboardLoadResult = {
  organization: Organization;
  summary: StatsSummary;
  shiftsPage: PaginatedResponse<Shift>;
};

const pageStarted = createEvent();
const refreshClicked = createEvent();
const shiftsPageChanged = createEvent<number>();

const loadDashboardFx = createEffect<PaginationQuery, DashboardLoadResult, Error>(
  async (pagination) => {
    try {
      const [organization, summary, shiftsPage] = await Promise.all([
        getOrganizationRequest(),
        getStatsSummaryRequest(),
        listShiftsRequest(pagination),
      ]);

      return { organization, summary, shiftsPage };
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const loadShiftsFx = createEffect<PaginationQuery, PaginatedResponse<Shift>, Error>(
  async (pagination) => {
    try {
      return await listShiftsRequest(pagination);
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const $organization = createStore<Organization | null>(null).on(
  loadDashboardFx.doneData,
  (_, result) => result.organization,
);

const $summary = createStore<StatsSummary | null>(null).on(
  loadDashboardFx.doneData,
  (_, result) => result.summary,
);

const $shiftsPage = createStore(
  getEmptyPaginatedResponse<Shift>(DASHBOARD_SHIFTS_PER_PAGE),
)
  .on(loadDashboardFx.doneData, (_, result) => result.shiftsPage)
  .on(loadShiftsFx.doneData, (_, shiftsPage) => shiftsPage);

const $shiftsPagination = createStore<PaginationQuery>({
  page: DEFAULT_PAGE,
  perPage: DASHBOARD_SHIFTS_PER_PAGE,
})
  .on(loadDashboardFx.doneData, (_, result) => ({
    page: result.shiftsPage.meta.page,
    perPage: result.shiftsPage.meta.perPage,
  }))
  .on(loadShiftsFx.doneData, (_, shiftsPage) => ({
    page: shiftsPage.meta.page,
    perPage: shiftsPage.meta.perPage,
  }));

const $error = createStore<string | null>(null)
  .reset(loadDashboardFx, loadShiftsFx)
  .on(loadDashboardFx.failData, (_, error) => error.message)
  .on(loadShiftsFx.failData, (_, error) => error.message);

sample({
  clock: pageStarted,
  source: $shiftsPagination,
  target: loadDashboardFx,
});

sample({
  clock: refreshClicked,
  source: $shiftsPagination,
  target: loadDashboardFx,
});

sample({
  clock: shiftsPageChanged,
  source: $shiftsPagination,
  fn: (pagination, page) => ({ ...pagination, page }),
  target: loadShiftsFx,
});

export const dashboardService = {
  inputs: {
    pageStarted,
    refreshClicked,
    shiftsPageChanged,
  },
  outputs: {
    $organization,
    $summary,
    $shiftsPage,
    $shiftsPagination,
    $error,
  },
};
