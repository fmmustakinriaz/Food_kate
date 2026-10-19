import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-white">
      <div className="container-page py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white">
              <ShoppingBag size={18} />
            </span>
            <span className="font-display text-xl font-bold text-ink-900">
              Food<span className="text-primary-600">Kate</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-ink-500 max-w-xs">
            Fresh meals from biryani to pizza, delivered hot to your door. Order in seconds, track in real time.
          </p>
          <div className="mt-4 flex gap-2">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 text-ink-600 hover:bg-primary-50 hover:text-primary-600 transition" aria-label="Social link">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link to="/menu" className="hover:text-primary-600">Menu</Link></li>
            <li><Link to="/menu?category=biryani" className="hover:text-primary-600">Biryani</Link></li>
            <li><Link to="/menu?category=pizza" className="hover:text-primary-600">Pizza</Link></li>
            <li><Link to="/menu?category=burgers" className="hover:text-primary-600">Burgers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link to="/login" className="hover:text-primary-600">Login</Link></li>
            <li><Link to="/register" className="hover:text-primary-600">Create account</Link></li>
            <li><Link to="/orders" className="hover:text-primary-600">Track order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-900 uppercase tracking-wider">Contact</h4>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-500">
            <li className="flex items-center gap-2"><Phone size={15} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={15} /> hello@foodkate.app</li>
            <li className="flex items-center gap-2"><MapPin size={15} /> 21 Spice Lane, Food City</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} Food Kate. All rights reserved.</p>
          <p>Made with fresh ingredients and care.</p>
        </div>
      </div>
    </footer>
  );
}
