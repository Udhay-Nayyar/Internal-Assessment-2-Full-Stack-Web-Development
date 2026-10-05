import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'danger' | 'info' | 'muted';

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
