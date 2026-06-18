import { Pagination, Table } from '@heroui/react';
import { ReactNode } from 'react';

import { PaginationMeta } from 'api/pagination';

export type DataTableColumn<T> = {
  key: string;
  label: string;
  isRowHeader?: boolean;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  ariaLabel: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  getRowClassName?: (row: T) => string;
  pagination?: Omit<DataTablePaginationProps, 'ariaLabel'>;
};

export type DataTablePaginationProps = {
  ariaLabel: string;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function DataTable<T>({
  ariaLabel,
  columns,
  rows,
  getRowKey,
  getRowClassName,
  pagination,
}: DataTableProps<T>) {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label={ariaLabel}>
          <Table.Header>
            {columns.map((column) => (
              <Table.Column
                key={column.key}
                isRowHeader={column.isRowHeader}
                className={column.align === 'right' ? 'text-right' : ''}
              >
                {column.label}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={getRowKey(row)} className={getRowClassName?.(row)}>
                {columns.map((column) => (
                  <Table.Cell
                    key={column.key}
                    className={column.align === 'right' ? 'text-right' : ''}
                  >
                    {column.render(row)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      {pagination && (
        <DataTablePagination ariaLabel={ariaLabel} {...pagination} />
      )}
    </Table>
  );
}

export function DataTablePagination({
  ariaLabel,
  meta,
  onPageChange,
}: DataTablePaginationProps) {
  const firstRow = meta.total === 0 ? 0 : (meta.page - 1) * meta.perPage + 1;
  const lastRow = Math.min(meta.page * meta.perPage, meta.total);
  const visiblePages = getVisiblePages(meta.page, meta.totalPages);

  return (
    <Pagination
      aria-label={`${ariaLabel}: пагинация`}
      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      size="sm"
    >
      <Pagination.Summary>
        Показано {firstRow}-{lastRow} из {meta.total}
      </Pagination.Summary>

      {meta.totalPages > 1 && (
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={meta.page <= 1}
              onPress={() => onPageChange(meta.page - 1)}
            >
              <Pagination.PreviousIcon />
              Назад
            </Pagination.Previous>
          </Pagination.Item>

          {visiblePages.map((page, index) => (
            <Pagination.Item key={`${page}-${index}`}>
              {page === 'ellipsis' ? (
                <Pagination.Ellipsis />
              ) : (
                <Pagination.Link
                  aria-label={`Страница ${page}`}
                  isActive={page === meta.page}
                  onPress={() => onPageChange(page)}
                >
                  {page}
                </Pagination.Link>
              )}
            </Pagination.Item>
          ))}

          <Pagination.Item>
            <Pagination.Next
              isDisabled={meta.page >= meta.totalPages}
              onPress={() => onPageChange(meta.page + 1)}
            >
              Вперед
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      )}
    </Pagination>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  return sortedPages.flatMap((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage !== undefined && page - previousPage > 1) {
      return ['ellipsis' as const, page];
    }

    return [page];
  });
}
