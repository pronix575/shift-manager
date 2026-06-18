import { BadRequestException } from '@nestjs/common';

import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  PaginationParams,
} from 'core/pagination/pagination';

type PaginationQuery = {
  page?: string;
  perPage?: string;
};

export function parseOptionalDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException('Дата должна быть строкой');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`Некорректная дата: ${value}`);
  }

  return date;
}

export function hasPaginationQuery(query: PaginationQuery) {
  return query.page !== undefined || query.perPage !== undefined;
}

export function parsePagination(query: PaginationQuery): PaginationParams {
  const page = parsePositiveInteger(query.page, 'page', DEFAULT_PAGE);
  const perPage = parsePositiveInteger(
    query.perPage,
    'perPage',
    DEFAULT_PER_PAGE,
  );

  if (perPage > MAX_PER_PAGE) {
    throw new BadRequestException(
      `Размер страницы не может быть больше ${MAX_PER_PAGE}`,
    );
  }

  return { page, perPage };
}

export function parseOptionalPagination(
  query: PaginationQuery,
): PaginationParams | undefined {
  return hasPaginationQuery(query) ? parsePagination(query) : undefined;
}

function parsePositiveInteger(
  value: string | undefined,
  name: string,
  defaultValue: number,
) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    throw new BadRequestException(
      `Параметр ${name} должен быть положительным целым числом`,
    );
  }

  return numberValue;
}
