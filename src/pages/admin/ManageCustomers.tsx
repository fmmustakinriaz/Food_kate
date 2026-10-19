import { useEffect, useState } from 'react';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { EmptyState, ErrorState } from '@/components/EmptyState';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setCustomers((data as Profile[]) ?? []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  if (error) return <ErrorState message={error} />;
  if (loading) return <div className="skeleton h-64 rounded-2xl" />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900 mb-1">Customers</h1>
      <p className="text-ink-500 mb-6">{customers.length} registered customers.</p>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" description="Registered customers will appear here." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-100 text-primary-700 text-lg font-bold">
                  {(c.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 truncate">{c.full_name || 'Unnamed'}</p>
                  <span className={`badge ${c.role === 'admin' ? 'bg-primary-50 text-primary-700' : 'bg-ink-100 text-ink-600'}`}>
                    {c.role}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-ink-600">
                <p className="flex items-center gap-2"><Mail size={14} /> <span className="truncate">id:{c.id.slice(0, 8)}</span></p>
                <p className="flex items-center gap-2"><Phone size={14} /> {c.phone || 'No phone'}</p>
                <p className="flex items-center gap-2"><MapPin size={14} /> {c.address || 'No address'}</p>
              </div>
              <p className="mt-3 text-xs text-ink-400">
                Joined {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
