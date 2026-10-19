import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserOrders } from '@/lib/api';
import type { Order } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState, ErrorState } from '@/components/EmptyState';

const STATUS_TIMELINE: { key: Order['status']; label: string }[] = [
  { key: 'pending',          label: 'Order placed' },
  { key: 'preparing',        label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered',        label: 'Delivered' },
];

function Timeline({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') {
    return <p className="text-sm text-error-600 font-medium">This order was cancelled.</p>;
  }
  const currentIndex = STATUS_TIMELINE.findIndex((s) => s.key === status);
  return (
    <ol className="flex items-center text-xs">
      {STATUS_TIMELINE.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                done ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-400'
              } ${active ? 'ring-4 ring-primary-100' : ''}`}>
                {i + 1}
              </span>
              <span className={`mt-1 ${done ? 'text-ink-700 font-medium' : 'text-ink-400'}`}>{step.label}</span>
            </div>
            {i < STATUS_TIMELINE.length - 1 && (
              <span className={`h-0.5 flex-1 mx-1 -mt-4 ${i < currentIndex ? 'bg-primary-600' : 'bg-ink-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchUserOrders(user.id)
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="container-page py-10"><div className="skeleton h-40 rounded-2xl" /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} /></div>;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink-900 mb-2">My orders</h1>
      <p className="text-ink-500 mb-8">Track your orders and view past meals.</p>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place your first order, it will show up here with live tracking."
          action={<Link to="/menu" className="btn-primary">Order your first meal</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const open = openId === order.id;
            return (
              <div key={order.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : order.id)}
                  className="w-full flex flex-wrap items-center gap-4 p-5 text-left hover:bg-ink-50/50 transition"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-ink-500">
                      {new Date(order.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                      {' · '}
                      <Clock size={12} className="inline -mt-0.5" /> {order.order_items?.length ?? 0} items
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                  <span className="font-bold text-ink-900">₹{Number(order.total).toFixed(0)}</span>
                  <ChevronRight size={18} className={`text-ink-400 transition ${open ? 'rotate-90' : ''}`} />
                </button>

                {open && (
                  <div className="border-t border-ink-100 p-5 space-y-5 animate-fade-in">
                    <Timeline status={order.status} />
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-ink-500 mb-1">Delivery address</p>
                        <p className="text-ink-800">{order.delivery_address}</p>
                      </div>
                      <div>
                        <p className="text-ink-500 mb-1">Contact</p>
                        <p className="text-ink-800">{order.contact_phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-ink-500 text-sm mb-2">Items</p>
                      <div className="space-y-2">
                        {(order.order_items ?? []).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-ink-100" />
                            <div className="flex-1 text-sm">
                              <p className="font-medium text-ink-900">{item.name}</p>
                              <p className="text-ink-500">₹{Number(item.price).toFixed(0)} × {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold text-ink-900">
                              ₹{(Number(item.price) * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {order.notes && (
                      <p className="text-sm text-ink-500 bg-ink-50 rounded-lg p-3">
                        <span className="font-medium text-ink-700">Note:</span> {order.notes}
                      </p>
                    )}
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
