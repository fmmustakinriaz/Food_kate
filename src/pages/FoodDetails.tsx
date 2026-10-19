import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, Clock, Check, ChevronRight } from 'lucide-react';
import { fetchFoodById, fetchFoods } from '@/lib/api';
import type { Food } from '@/types';
import { RatingStars } from '@/components/RatingStars';
import { FoodCard } from '@/components/FoodCard';
import { useCart } from '@/context/CartContext';
import { toast } from '@/components/Toast';
import { ErrorState } from '@/components/EmptyState';

export default function FoodDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add, setOpen } = useCart();
  const [food, setFood] = useState<Food | null>(null);
  const [related, setRelated] = useState<Food[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([fetchFoodById(id), fetchFoods()])
      .then(([f, all]) => {
        setFood(f);
        if (f) {
          setRelated(all.filter((x) => x.category_id === f.category_id && x.id !== f.id).slice(0, 4));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="skeleton aspect-[4/3] rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-9 w-2/3 rounded-lg" />
            <div className="skeleton h-5 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded-lg" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="container-page py-10"><ErrorState message={error} /></div>;
  if (!food) return <div className="container-page py-10"><ErrorState message="Dish not found." /></div>;

  const handleAdd = () => {
    add(food, qty);
    toast(`Added ${qty} × ${food.name} to cart`);
    setOpen(true);
  };

  const buyNow = () => {
    add(food, qty);
    navigate('/checkout');
  };

  return (
    <div className="container-page py-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/menu" className="hover:text-primary-600">Menu</Link>
        <ChevronRight size={14} />
        <span className="text-ink-700 truncate">{food.name}</span>
      </nav>

      <Link to="/menu" className="btn-ghost !px-3 mb-4">
        <ArrowLeft size={16} /> Back to menu
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="relative">
          <img
            src={food.image_url}
            alt={food.name}
            className="w-full aspect-[4/3] object-cover rounded-3xl shadow-card"
          />
          <div className="absolute top-4 left-4 badge bg-white/90 backdrop-blur text-ink-800 shadow-sm">
            <RatingStars rating={food.rating} size={15} />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="badge bg-primary-50 text-primary-700 w-fit">{food.category?.name}</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink-900">{food.name}</h1>

          <div className="mt-3 flex items-center gap-4 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1"><Clock size={15} /> Ready in {food.prep_minutes} min</span>
            {food.is_available ? (
              <span className="inline-flex items-center gap-1 text-success-600"><Check size={15} /> In stock</span>
            ) : (
              <span className="text-error-600">Out of stock</span>
            )}
          </div>

          <p className="mt-5 text-ink-600 leading-relaxed">{food.description}</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink-900">₹{food.price.toFixed(0)}</span>
            <span className="text-sm text-ink-400">incl. taxes</span>
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 card !shadow-none p-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm text-ink-500">
              Total: <span className="font-semibold text-ink-800">₹{(food.price * qty).toFixed(0)}</span>
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleAdd} disabled={!food.is_available} className="btn-secondary !py-3">
              <ShoppingBag size={18} /> Add to cart
            </button>
            <button onClick={buyNow} disabled={!food.is_available} className="btn-primary !py-3 flex-1 sm:flex-none">
              Buy now <ArrowLeft size={0} className="hidden" />
              <ChevronRight size={18} className="rotate-180" />
            </button>
          </div>

          {/* Feature bullets */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {['Fresh ingredients', 'Hygiene-certified', 'Secure packaging'].map((t) => (
              <div key={t} className="card !shadow-none p-3 text-xs text-ink-600">
                <Check size={16} className="mx-auto text-success-500 mb-1" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-ink-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </section>
      )}
    </div>
  );
}
