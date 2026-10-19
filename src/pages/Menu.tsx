import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fetchFoods, fetchCategories } from '@/lib/api';
import type { Food, Category } from '@/types';
import { FoodCard, FoodCardSkeleton } from '@/components/FoodCard';
import { EmptyState, ErrorState } from '@/components/EmptyState';

type SortKey = 'rating' | 'price_low' | 'price_high' | 'name';

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') ?? 'all';
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<SortKey>('rating');

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchFoods(undefined, undefined), fetchCategories()])
      .then(([f, c]) => { setFoods(f); setCategories(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug === 'all') next.delete('category');
    else next.set('category', slug);
    setParams(next);
  };

  const onSearch = (value: string) => {
    setSearch(value);
    const next = new URLSearchParams(params);
    if (value) next.set('q', value);
    else next.delete('q');
    setParams(next);
  };

  const filtered = useMemo(() => {
    let list = foods.filter((f) => f.category?.slug === activeCategory || activeCategory === 'all');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case 'price_low':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_high': return [...list].sort((a, b) => b.price - a.price);
      case 'name':       return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:           return [...list].sort((a, b) => b.rating - a.rating);
    }
  }, [foods, activeCategory, search, sort]);

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold text-ink-900">Our menu</h1>
        <p className="text-ink-500">Explore {foods.length} dishes across {categories.length} categories.</p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search for biryani, pizza, burgers…"
            className="input !pl-10"
            aria-label="Search food"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input !pl-9 appearance-none cursor-pointer"
            aria-label="Sort by"
          >
            <option value="rating">Top rated</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory('all')}
          className={`chip ${activeCategory === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-ink-700 border border-ink-200 hover:border-primary-300'}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`chip ${activeCategory === c.slug ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-ink-700 border border-ink-200 hover:border-primary-300'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No dishes found"
          description="Try a different search or pick another category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
          {filtered.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
      )}
    </div>
  );
}
