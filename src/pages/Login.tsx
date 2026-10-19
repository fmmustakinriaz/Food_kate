import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/Toast';

export default function Login() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    await refreshProfile();
    toast('Welcome back!');
    navigate(from, { replace: true });
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600 text-white">
              <ShoppingBag size={20} />
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="text-ink-500 mt-1">Sign in to order and track your meals.</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-error-500/10 p-3 text-sm text-error-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input !pl-10" placeholder="you@example.com" autoComplete="email" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input !pl-10" placeholder="••••••••" autoComplete="current-password" />
            </div>
          </div>
          <button disabled={loading} className="btn-primary w-full !py-3">
            {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}
          </button>
          <p className="text-center text-sm text-ink-500">
            New to Food Kate? <Link to="/register" className="text-primary-600 font-medium hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
