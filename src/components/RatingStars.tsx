import { Star } from 'lucide-react';

export function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-accent-400 text-accent-400" />
      <span className="text-sm font-semibold text-ink-700">{rating.toFixed(1)}</span>
    </div>
  );
}
