import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Utensils, Users, ArrowRight, Clock } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { ErrorState } from '@/components/EmptyState';
import type { Order } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    foodCount: number; orderCount: number; customerCount: number; revenue: number; orders: Order[];
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!stats) return <div className="skeleton h-96 rounded-2xl" />;

  const recent = stats.orders.slice(0, 5);

  const cards = [
    { label: 'Total revenue',   value: `tk ${stats.revenue.toFixed(0)}`,  icon: TrendingUp, color: 'bg-success-500/15 text-success-600' },
    { label: 'Total orders',    value: stats.orderCount,                icon: ShoppingBag, color: 'bg-primary-500/15 text-primary-600' },
    { label: 'Food items',      value: stats.foodCount,                 icon: Utensils,    color: 'bg-blue-500/15 text-blue-600' },
    { label: 'Customers',       value: stats.customerCount,             icon: Users,       color: 'bg-accent-400/20 text-accent-600' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900 mb-1">Dashboard</h1>
      <p className="text-ink-500 mb-6">Overview of your store performance.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${c.color}`}>
                <Icon size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold text-ink-900">{c.value}</p>
              <p className="text-sm text-ink-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-display font-bold text-lg text-ink-900">Recent orders</h2>
          <Link to="/admin/orders" className="btn-ghost !px-3 text-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No orders yet.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  <ShoppingBag size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-1">
                    <Clock size={11} /> {new Date(o.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <StatusBadge status={o.status} />
                <span className="font-bold text-ink-900">tk {Number(o.total).toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
