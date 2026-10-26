import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search, Utensils } from 'lucide-react';
import { fetchFoods } from '@/lib/api';
import type { Food } from '@/types';
import { RatingStars } from '@/components/RatingStars';
import { EmptyState, ErrorState } from '@/components/EmptyState';

export default function ManageFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetchFoods()
      .then(setFoods)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.category?.name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Food items</h1>
          <p className="text-ink-500 mt-1">{foods.length} items on the menu.</p>
        </div>
        <Link to="/admin/foods/new" className="btn-primary">
          <Plus size={16} /> Add food item
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input !pl-10" placeholder="Search items…" />
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No food items"
          description="Add your first dish to start the menu."
          action={<Link to="/admin/foods/new" className="btn-primary"><Plus size={16} /> Add food item</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Item</th>
                  <th className="text-left px-4 py-3 font-semibold">Category</th>
                  <th className="text-left px-4 py-3 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-ink-50/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={f.image_url} alt={f.name} className="h-11 w-11 rounded-lg object-cover bg-ink-100" />
                        <span className="font-medium text-ink-900">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{f.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900">tk {Number(f.price).toFixed(0)}</td>
                    <td className="px-4 py-3"><RatingStars rating={f.rating} /></td>
                    <td className="px-4 py-3">
                      {f.is_available
                        ? <span className="badge bg-success-500/15 text-success-700">Available</span>
                        : <span className="badge bg-ink-100 text-ink-500">Hidden</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/foods/${f.id}/edit`}
                        className="btn-ghost !px-3 !py-1.5 text-sm"
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
