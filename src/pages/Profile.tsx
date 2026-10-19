import { useEffect, useState, FormEvent } from 'react';
import { User, Mail, Phone, MapPin, Save, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/Toast';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
    }
  }, [profile]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, address })
      .eq('id', user.id);
    setSaving(false);
    if (error) { toast('Could not save changes.'); return; }
    await refreshProfile();
    toast('Profile updated');
  };

  if (!user || !profile) return null;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink-900 mb-2">My profile</h1>
      <p className="text-ink-500 mb-8">Manage your personal details and delivery info.</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-100 text-primary-700 text-2xl font-bold">
              {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-ink-900">{profile.full_name || 'Foodie'}</p>
              <p className="text-sm text-ink-500 truncate">{user.email}</p>
              <span className="badge bg-primary-50 text-primary-700 mt-1.5">{profile.role}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-ink-600"><Mail size={15} /> {user.email}</div>
            <div className="flex items-center gap-2 text-ink-600"><Phone size={15} /> {profile.phone || 'No phone added'}</div>
            <div className="flex items-center gap-2 text-ink-600"><MapPin size={15} /> {profile.address || 'No address saved'}</div>
          </div>
          <button onClick={() => signOut()} className="btn-secondary w-full mt-6 text-error-600">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <form onSubmit={save} className="card p-6 lg:col-span-2 space-y-4">
          <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
            <User size={18} className="text-primary-600" /> Edit details
          </h2>
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label" htmlFor="address">Default delivery address</label>
            <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-[80px]" />
          </div>
          <button disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
