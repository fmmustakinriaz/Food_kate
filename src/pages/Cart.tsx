import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { EmptyState } from '@/components/EmptyState';

export default function Cart() {
  const { lines, setQty, remove, subtotal, deliveryFee, total, clear } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added any dishes yet. Let's fix that."
          action={<Link to="/menu" className="btn-primary">Browse menu</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-ink-900">Your cart</h1>
        <button onClick={clear} className="btn-ghost text-error-500 hover:text-error-600">
          <Trash2 size={16} /> Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {lines.map((line) => (
            <div key={line.food.id} className="card p-4 flex gap-4">
              <img src={line.food.image_url} alt={line.food.name} className="h-24 w-24 rounded-xl object-cover bg-ink-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link to={`/food/${line.food.id}`} className="font-semibold text-ink-900 hover:text-primary-600">
                      {line.food.name}
                    </Link>
                    <p className="text-sm text-ink-500 mt-0.5">tk {line.food.price.toFixed(0)} each</p>
                  </div>
                  <button onClick={() => remove(line.food.id)} className="text-ink-400 hover:text-error-500 h-fit" aria-label={`Remove ${line.food.name}`}>
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(line.food.id, line.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-md bg-ink-100 hover:bg-ink-200 text-ink-700" aria-label="Decrease">
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center font-semibold">{line.quantity}</span>
                    <button onClick={() => setQty(line.food.id, line.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-md bg-primary-50 hover:bg-primary-100 text-primary-700" aria-label="Increase">
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="font-bold text-ink-900">tk {(line.food.price * line.quantity).toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card p-6 h-fit sticky top-24">
          <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-600" /> Order summary
          </h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="font-medium text-ink-900">tk {subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between text-ink-600"><span>Delivery fee</span><span className="font-medium text-ink-900">tk {deliveryFee.toFixed(0)}</span></div>
            {subtotal > 0 && subtotal < 499 && (
              <p className="text-xs text-warning-600 bg-warning-500/10 rounded-lg p-2">
                Add tk {(499 - subtotal).toFixed(0)} more to get free delivery.
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100 flex justify-between text-base font-bold text-ink-900">
            <span>Total</span><span>tk {total.toFixed(0)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-5">
            Proceed to checkout <ArrowRight size={16} />
          </Link>
          <Link to="/menu" className="btn-ghost w-full mt-2 justify-center">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
