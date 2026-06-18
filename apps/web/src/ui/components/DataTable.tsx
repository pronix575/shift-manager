import { Table } from '@heroui/react';
import { ReactNode } from 'react';

type DataTableColumn<T> = {
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
};

export function DataTable<T>({
  ariaLabel,
  columns,
  rows,
  getRowKey,
  getRowClassName,
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
    </Table>
  );
}
