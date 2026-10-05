import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

// Reusable generic table: works for Book, Member and BorrowRecord rows
export function DataTable<T>({ data, columns, getRowKey, emptyMessage = 'No records found.' }: DataTableProps<T>) {
  if (data.length === 0) return <p className="empty">{emptyMessage}</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((col) => (
                <td key={col.header}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
