import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition ${
      isActive ? 'text-primary-600 bg-primary-50' : 'text-ink-600 hover:text-primary-600 hover:bg-primary-50/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white shadow-sm">
            <ShoppingBag size={18} />
          </span>
          <span className="font-display text-xl font-bold text-ink-900">
            Food<span className="text-primary-600">Kate</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/menu" className={navLink}>Menu</NavLink>
          {user && <NavLink to="/orders" className={navLink}>My Orders</NavLink>}
          {isAdmin && <NavLink to="/admin" className={navLink}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/menu" className="btn-ghost !px-3 hidden sm:inline-flex" aria-label="Search">
            <Search size={18} />
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="btn-ghost !px-3 relative"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white animate-pop">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="btn-secondary !px-2.5 !py-2"
                aria-label="Account menu"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[8rem] truncate">{profile?.full_name || 'Account'}</span>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-52 z-20 card p-1.5 animate-fade-up">
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                      <ShoppingBag size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { setUserMenu(false); signOut(); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-500/10"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link to="/login" className="btn-secondary !py-2">Login</Link>
              <Link to="/register" className="btn-primary !py-2">Sign up</Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden btn-ghost !px-3"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white animate-fade-in">
          <div className="container-page py-3 flex flex-col gap-1">
            <NavLink to="/" end className={navLink} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/menu" className={navLink} onClick={() => setMenuOpen(false)}>Menu</NavLink>
            {user && <NavLink to="/orders" className={navLink} onClick={() => setMenuOpen(false)}>My Orders</NavLink>}
            {user && <NavLink to="/profile" className={navLink} onClick={() => setMenuOpen(false)}>My Profile</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navLink} onClick={() => setMenuOpen(false)}>Admin</NavLink>}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary flex-1" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </div>
            )}
            {user && (
              <button onClick={() => { setMenuOpen(false); signOut(); }} className="btn-secondary mt-2 text-error-600">
                <LogOut size={16} /> Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
