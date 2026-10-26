import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Star, Utensils, Pizza, Beef, Salad, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchFoods } from '@/lib/api';
import type { Food } from '@/types';
import { FoodCard, FoodCardSkeleton } from '@/components/FoodCard';
import { toast } from '@/components/Toast';

const CATEGORY_ICONS: Record<string, typeof Utensils> = {
  biryani: Utensils,
  pizza: Pizza,
  burgers: Beef,
  'rice-dishes': Salad,
};

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFoods()
      .then((f) => setFoods(f.slice(0, 8)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { slug: 'biryani',     name: 'Biryani',     desc: 'Aromatic & spiced',     icon: Utensils },
    { slug: 'pizza',       name: 'Pizza',       desc: 'Wood-fired & cheesy',   icon: Pizza },
    { slug: 'burgers',     name: 'Burgers',     desc: 'Juicy & satisfying',     icon: Beef },
    { slug: 'rice-dishes', name: 'Rice Dishes', desc: 'Wok-tossed & fragrant',  icon: Salad },
  ];

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-accent-200/30 blur-3xl" />
        </div>
        <div className="container-page relative grid lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
          <div className="animate-fade-up">
            <span className="badge bg-white text-primary-700 border border-primary-200 shadow-sm">
              <Star size={13} className="fill-accent-400 text-accent-400" /> Rated 4.7 by 12,000+ foodies
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 leading-[1.05]">
              Delicious meals,<br />
              <span className="text-primary-600">delivered hot</span> to your door.
            </h1>
            <p className="mt-5 text-lg text-ink-600 max-w-lg">
              From dum biryani to wood-fired pizza, Food Kate brings your favorite dishes fresh from the kitchen — in under 35 minutes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/menu" className="btn-primary !text-base !px-6 !py-3">
                Order now <ArrowRight size={18} />
              </Link>
              <Link to="/menu?category=biryani" className="btn-secondary !text-base !px-6 !py-3">
                Explore biryani
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              {[
                { icon: Truck,   label: 'Free delivery over tk 499' },
                { icon: Clock,   label: 'Avg delivery 32 min' },
                { icon: ShieldCheck, label: '100% secure checkout' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-ink-600">
                  <Icon size={16} className="text-primary-600" /> {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/39536492/pexels-photo-39536492.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Chicken biryani"
                className="rounded-3xl shadow-cardHover aspect-[4/5] object-cover w-full"
              />
              <div className="space-y-4">
                <img
                  src="https://images.pexels.com/photos/31596394/pexels-photo-31596394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Margherita pizza"
                  className="rounded-3xl shadow-card aspect-square object-cover w-full"
                />
                <img
                  src="https://images.pexels.com/photos/4109233/pexels-photo-4109233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Cheeseburger"
                  className="rounded-3xl shadow-card aspect-[4/3] object-cover w-full"
                />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-cardHover p-4 flex items-center gap-3 animate-pop">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-success-500/15 text-success-600">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs text-ink-500">On its way</p>
                <p className="text-sm font-bold text-ink-900">Arrives in 28 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="container-page py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900">Browse by category</h2>
            <p className="text-ink-500 mt-1">Pick a craving — we'll do the rest.</p>
          </div>
          <Link to="/menu" className="btn-ghost hidden sm:inline-flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? Utensils;
            return (
              <Link
                key={c.slug}
                to={`/menu?category=${c.slug}`}
                className="card p-6 group hover:-translate-y-1 hover:shadow-cardHover transition-all"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-900">{c.name}</h3>
                <p className="text-sm text-ink-500 mt-0.5">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600 link-underline">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- POPULAR ---------- */}
      <section className="container-page py-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900">Popular this week</h2>
            <p className="text-ink-500 mt-1">Top-rated dishes our customers keep coming back for.</p>
          </div>
          <Link to="/menu" className="btn-ghost hidden sm:inline-flex">
            See full menu <ArrowRight size={16} />
          </Link>
        </div>

        {error && <p className="text-error-600">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : foods.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
      </section>

      {/* ---------- FEATURE STRIP ---------- */}
      <section className="container-page py-14">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Truck, title: 'Lightning delivery', desc: 'Hot food at your door in 30 minutes, on average.' },
            { icon: ShieldCheck, title: 'Secure payments', desc: 'Pay by card, UPI, or cash on delivery — your choice.' },
            { icon: Star, title: 'Top-rated kitchens', desc: 'Every dish is prepared by vetted, hygiene-certified chefs.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-ink-900">{title}</h3>
              <p className="text-sm text-ink-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-page pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-500 p-10 sm:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/10" />
          <h2 className="text-3xl sm:text-4xl font-bold relative">Hungry? Your next meal is a tap away.</h2>
          <p className="mt-3 text-primary-50 max-w-xl mx-auto relative">
            Join thousands of happy customers ordering fresh, hot food every day.
          </p>
          <Link
            to="/menu"
            className="btn mt-6 bg-white text-primary-700 hover:bg-primary-50 !text-base !px-6 !py-3 relative"
            onClick={() => toast('Loading the menu for you…')}
          >
            Start your order <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
