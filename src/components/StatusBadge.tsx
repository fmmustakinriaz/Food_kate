import type { OrderStatus } from '@/types';

const MAP: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  pending:           { label: 'Pending',          className: 'bg-warning-500/15 text-warning-600',  dot: 'bg-warning-500' },
  preparing:         { label: 'Preparing',        className: 'bg-primary-500/15 text-primary-700',  dot: 'bg-primary-500' },
  out_for_delivery:  { label: 'Out for delivery', className: 'bg-blue-500/15 text-blue-700',        dot: 'bg-blue-500' },
  delivered:         { label: 'Delivered',        className: 'bg-success-500/15 text-success-700',  dot: 'bg-success-500' },
  cancelled:         { label: 'Cancelled',        className: 'bg-error-500/15 text-error-600',      dot: 'bg-error-500' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = MAP[status];
  return (
    <span className={`badge ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled',
];
