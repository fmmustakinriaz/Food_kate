import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Truck, Banknote, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/lib/api';
import type { PaymentMethod } from '@/types';
import { toast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';

export default function Checkout() {
  const { lines, subtotal, deliveryFee, total, clear } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(profile?.address ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [notes, setNotes] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cod');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty — add some dishes first."
          action={<Link to="/menu" className="btn-primary">Browse menu</Link>}
        />
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!address.trim() || !phone.trim()) {
      setError('Please enter your delivery address and phone number.');
      return;
    }
    if (!user) { setError('Please sign in to place an order.'); return; }
    setLoading(true);
    try {
      await placeOrder({
        userId: user.id,
        items: lines.map((l) => ({ food: l.food, quantity: l.quantity })),
        deliveryAddress: address.trim(),
        contactPhone: phone.trim(),
        notes: notes.trim(),
        paymentMethod: method,
        total,
      });
      clear();
      toast('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const methods: { key: PaymentMethod; label: string; icon: typeof Banknote; desc: string }[] = [
    { key: 'cod',  label: 'Cash on delivery', icon: Banknote,   desc: 'Pay when your food arrives' },
    { key: 'card', label: 'Credit / debit card', icon: CreditCard, desc: 'Secure card payment' },
    { key: 'upi',  label: 'UPI',               icon: Smartphone,  desc: 'Pay via UPI app' },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink-900 mb-6">Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery */}
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
              <Truck size={18} className="text-primary-600" /> Delivery details
            </h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="address">Delivery address</label>
                <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="input min-h-[80px]" placeholder="Flat 12, 21 Spice Lane, Food City — 560001" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Contact phone</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="input" placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">Order notes (optional)</label>
                <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="input" placeholder="Less spicy, leave at door, etc." />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg text-ink-900">Payment method</h2>
            <div className="mt-4 space-y-2.5">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = method === m.key;
                return (
                  <label
                    key={m.key}
                    className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition ${
                      active ? 'border-primary-500 bg-primary-50/60 ring-1 ring-primary-400' : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    <input type="radio" name="method" className="sr-only" checked={active}
                      onChange={() => setMethod(m.key)} />
                    <span className={`grid h-10 w-10 place-items-center rounded-lg ${active ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600'}`}>
                      <Icon size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink-900">{m.label}</span>
                      <span className="block text-xs text-ink-500">{m.desc}</span>
                    </span>
                    {active && <CheckCircle2 size={18} className="text-primary-600" />}
                  </label>
                );
              })}
              <p className="text-xs text-ink-400 pt-1">
                We never store your card number. Payments are processed securely.
              </p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="card p-6 h-fit sticky top-24">
          <h2 className="font-display font-bold text-lg text-ink-900">Order summary</h2>
          <div className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-1">
            {lines.map((l) => (
              <div key={l.food.id} className="flex gap-3">
                <img src={l.food.image_url} alt={l.food.name} className="h-12 w-12 rounded-lg object-cover bg-ink-100" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-ink-900 truncate">{l.food.name}</p>
                  <p className="text-ink-500">× {l.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-ink-900">₹{(l.food.price * l.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100 space-y-2 text-sm">
            <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between text-ink-600"><span>Delivery</span><span>₹{deliveryFee.toFixed(0)}</span></div>
            <div className="flex justify-between text-base font-bold text-ink-900 pt-1 border-t border-ink-100">
              <span>Total</span><span>₹{total.toFixed(0)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-error-500/10 p-3 text-sm text-error-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button disabled={loading} className="btn-primary w-full mt-5 !py-3">
            {loading ? 'Placing order…' : <>Place order <ArrowRight size={16} /></>}
          </button>
          <p className="text-center text-xs text-ink-400 mt-3">
            By placing this order you agree to our terms of service.
          </p>
        </aside>
      </form>
    </div>
  );
}
