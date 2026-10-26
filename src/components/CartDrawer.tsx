import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const { lines, isOpen, setOpen, setQty, remove, subtotal, deliveryFee, total, count } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink-900/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-600" />
            <h2 className="font-display font-bold text-ink-900">Your Cart</h2>
            <span className="badge bg-primary-50 text-primary-700">{count}</span>
          </div>
          <button onClick={() => setOpen(false)} className="btn-ghost !p-2" aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-100">
              <ShoppingBag size={32} className="text-ink-400" />
            </div>
            <p className="text-ink-600 font-medium">Your cart is empty</p>
            <p className="text-sm text-ink-400">Add some delicious meals to get started.</p>
            <Link to="/menu" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Browse menu
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {lines.map((line) => (
                <div key={line.food.id} className="flex gap-3 card !shadow-none p-3">
                  <img
                    src={line.food.image_url}
                    alt={line.food.name}
                    className="h-16 w-16 rounded-lg object-cover bg-ink-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-sm text-ink-900 truncate">{line.food.name}</p>
                      <button
                        onClick={() => remove(line.food.id)}
                        className="text-ink-400 hover:text-error-500 transition"
                        aria-label={`Remove ${line.food.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">tk {line.food.price.toFixed(0)} each</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQty(line.food.id, line.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded-md bg-ink-100 hover:bg-ink-200 text-ink-700"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          onClick={() => setQty(line.food.id, line.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded-md bg-primary-50 hover:bg-primary-100 text-primary-700"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-ink-900">
                        tk {(line.food.price * line.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ink-100 px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm text-ink-600">
                <span>Subtotal</span>
                <span className="font-medium text-ink-900">tk {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-600">
                <span>Delivery fee</span>
                <span className="font-medium text-ink-900">tk {deliveryFee.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink-900 pt-1 border-t border-ink-100">
                <span>Total</span>
                <span>tk {total.toFixed(0)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="btn-primary w-full mt-2"
              >
                Proceed to checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
