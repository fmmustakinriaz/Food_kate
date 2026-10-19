import { Link } from 'react-router-dom';
import { Plus, Clock } from 'lucide-react';
import type { Food } from '@/types';
import { RatingStars } from './RatingStars';
import { useCart } from '@/context/CartContext';

export function FoodCard({ food }: { food: Food }) {
  const { add } = useCart();

  return (
    <div className="card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
      <Link to={`/food/${food.id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden bg-ink-100">
          <img
            src={food.image_url}
            alt={food.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {!food.is_available && (
          <div className="absolute inset-0 bg-ink-900/55 flex items-center justify-center">
            <span className="badge bg-white text-ink-800">Out of stock</span>
          </div>
        )}
        <div className="absolute top-3 left-3 badge bg-white/90 text-ink-800 backdrop-blur">
          <RatingStars rating={food.rating} />
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/food/${food.id}`} className="hover:text-primary-600 transition">
            <h3 className="font-semibold text-ink-900 leading-snug">{food.name}</h3>
          </Link>
          <span className="shrink-0 inline-flex items-center gap-1 text-xs text-ink-500">
            <Clock size={13} /> {food.prep_minutes}m
          </span>
        </div>
        <p className="mt-1.5 text-sm text-ink-500 line-clamp-2 min-h-[2.5rem]">
          {food.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-ink-900">
            ₹{food.price.toFixed(0)}
          </span>
          <button
            disabled={!food.is_available}
            onClick={() => add(food)}
            className="btn-primary !px-3 !py-2 !text-xs"
            aria-label={`Add ${food.name} to cart`}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
