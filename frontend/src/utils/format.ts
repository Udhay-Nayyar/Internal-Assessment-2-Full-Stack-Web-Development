import type { BorrowRecord } from '../types';

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Overdue = not yet returned AND dueDate is before today (Q2d)
export function isOverdue(record: Pick<BorrowRecord, 'dueDate' | 'returnDate' | 'status'>): boolean {
  if (record.returnDate !== null || record.status === 'returned') return false;
  return new Date(record.dueDate) < startOfToday();
}

// "YYYY-MM-DD" for <input type="date">
export function toInputDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// The backend wants an ISO string; use the end of the chosen day (local time)
export function endOfDayISO(dateInput: string): string {
  return new Date(`${dateInput}T23:59:59`).toISOString();
}
