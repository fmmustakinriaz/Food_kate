import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Utensils, ShoppingBag, Users, Home } from 'lucide-react';

const navItem = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-50'
  }`;

export default function AdminLayout() {
  return (
    <div className="container-page py-8">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="card p-4 h-fit lg:sticky lg:top-24">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Admin</p>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={navItem}><LayoutDashboard size={18} /> Dashboard</NavLink>
            <NavLink to="/admin/foods" className={navItem}><Utensils size={18} /> Food items</NavLink>
            <NavLink to="/admin/orders" className={navItem}><ShoppingBag size={18} /> Orders</NavLink>
            <NavLink to="/admin/customers" className={navItem}><Users size={18} /> Customers</NavLink>
          </nav>
          <div className="mt-4 pt-4 border-t border-ink-100">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50">
              <Home size={18} /> Back to site
            </Link>
          </div>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
