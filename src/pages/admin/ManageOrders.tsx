import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, ChevronRight, Filter } from 'lucide-react';
import { fetchAllOrders, updateOrderStatus } from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import { StatusBadge, ORDER_STATUSES } from '@/components/StatusBadge';
import { EmptyState, ErrorState } from '@/components/EmptyState';
import { toast } from '@/components/Toast';

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const load = () => {
    setLoading(true);
    fetchAllOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast(`Order marked as ${status.replace('_', ' ')}`);
    } catch (e) {
      toast('Could not update status');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (error) return <ErrorState message={error} />;
  if (loading) return <div className="skeleton h-64 rounded-2xl" />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900 mb-1">Orders</h1>
      <p className="text-ink-500 mb-6">{orders.length} total orders.</p>

      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        <Filter size={16} className="text-ink-400 shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={`chip ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white border border-ink-200 text-ink-700'}`}
        >
          All
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`chip ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-ink-200 text-ink-700'}`}
          >
            {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders match this filter" description="Try a different status filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const open = openId === order.id;
            return (
              <div key={order.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : order.id)}
                  className="w-full flex flex-wrap items-center gap-4 p-4 text-left hover:bg-ink-50/40 transition"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-ink-500 flex items-center gap-1">
                      <Clock size={11} /> {new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {order.profiles?.full_name ?? 'Customer'}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                  <span className="font-bold text-ink-900">tk {Number(order.total).toFixed(0)}</span>
                  <ChevronRight size={18} className={`text-ink-400 transition ${open ? 'rotate-90' : ''}`} />
                </button>

                {open && (
                  <div className="border-t border-ink-100 p-5 space-y-4 animate-fade-in">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-ink-500 mb-1">Customer</p>
                        <p className="text-ink-800">{order.profiles?.full_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-ink-500 mb-1">Contact phone</p>
                        <p className="text-ink-800">{order.contact_phone}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-ink-500 mb-1">Delivery address</p>
                        <p className="text-ink-800">{order.delivery_address}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-ink-500 text-sm mb-2">Items</p>
                      <div className="space-y-2">
                        {(order.order_items ?? []).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img src={item.image_url} alt={item.name} className="h-11 w-11 rounded-lg object-cover bg-ink-100" />
                            <div className="flex-1 text-sm">
                              <p className="font-medium text-ink-900">{item.name}</p>
                              <p className="text-ink-500">tk {Number(item.price).toFixed(0)} × {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold text-ink-900">tk {(Number(item.price) * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-ink-500 text-sm mb-2">Update status</p>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatus(order.id, s)}
                            disabled={order.status === s}
                            className={`chip text-xs ${
                              order.status === s
                                ? 'bg-primary-600 text-white'
                                : 'bg-white border border-ink-200 text-ink-700 hover:border-primary-300'
                            }`}
                          >
                            {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
