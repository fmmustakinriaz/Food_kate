import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertCircle } from 'lucide-react';
import { fetchCategories, createFood, updateFood, deleteFood } from '@/lib/api';
import type { Category, Food } from '@/types';
import { toast } from '@/components/Toast';

interface Props {
  editing?: Food | null;
}

export default function FoodForm({ editing }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    rating: '4.5',
    prep_minutes: '20',
    is_available: true,
    category_id: '',
  });

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        price: String(editing.price),
        image_url: editing.image_url,
        rating: String(editing.rating),
        prep_minutes: String(editing.prep_minutes),
        is_available: editing.is_available,
        category_id: editing.category_id,
      });
    }
  }, [editing]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price || !form.category_id || !form.image_url) {
      setError('Name, price, category, and image URL are required.');
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      rating: parseFloat(form.rating) || 4.5,
      prep_minutes: parseInt(form.prep_minutes) || 20,
      is_available: form.is_available,
      category_id: form.category_id,
    };
    setSaving(true);
    try {
      if (editing && id) {
        await updateFood(id, payload);
        toast('Food item updated');
      } else {
        await createFood(payload);
        toast('Food item added');
      }
      navigate('/admin/foods');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this food item? This cannot be undone.')) return;
    try {
      await deleteFood(id);
      toast('Food item deleted');
      navigate('/admin/foods');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete item.');
    }
  };

  if (loading) return <div className="container-page py-10"><div className="skeleton h-96 rounded-2xl" /></div>;

  return (
    <div className="container-page py-10 max-w-3xl">
      <Link to="/admin/foods" className="btn-ghost !px-3 mb-4">
        <ArrowLeft size={16} /> Back to food items
      </Link>
      <h1 className="text-3xl font-bold text-ink-900 mb-6">
        {editing ? 'Edit food item' : 'Add new food item'}
      </h1>

      <form onSubmit={submit} className="card p-6 space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-error-500/10 p-3 text-sm text-error-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="Chicken Biryani" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="desc">Description</label>
            <textarea id="desc" value={form.description} onChange={(e) => set('description', e.target.value)} className="input min-h-[80px]" placeholder="Aromatic basmati rice with spiced chicken…" />
          </div>
          <div>
            <label className="label" htmlFor="price">Price (tk )</label>
            <input id="price" type="number" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} className="input" placeholder="249" />
          </div>
          <div>
            <label className="label" htmlFor="cat">Category</label>
            <select id="cat" value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="input cursor-pointer">
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rating">Rating (0–5)</label>
            <input id="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="prep">Prep time (minutes)</label>
            <input id="prep" type="number" min="1" value={form.prep_minutes} onChange={(e) => set('prep_minutes', e.target.value)} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="img">Image URL</label>
            <input id="img" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className="input" placeholder="https://images.pexels.com/…" />
            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="mt-3 h-32 w-full max-w-xs object-cover rounded-xl bg-ink-100" />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-400" />
              <span className="text-sm text-ink-700">Available for ordering</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving…' : editing ? 'Save changes' : 'Add item'}
          </button>
          {editing && (
            <button type="button" onClick={handleDelete} className="btn-danger">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
