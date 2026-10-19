# Food Kate 🍛

A complete, professional food-ordering web app — fresh meals, delivered fast.
Built with React, Vite, Tailwind CSS, and Supabase (Postgres + Auth).

## Features

### Customer website
- Beautiful homepage with hero, category cards, and popular dishes
- Searchable, filterable menu (by category and sort order)
- Food detail pages with quantity selector and "related dishes"
- Slide-out cart drawer + full cart page with quantity controls
- Checkout with delivery details and payment-method selection
- Order history with live status tracking timeline
- User registration, login, logout, and editable profile

### Admin dashboard (`/admin`)
- Dashboard stats: revenue, order count, food count, customer count
- Manage food items: add, edit, delete, toggle availability
- View and manage all customer orders, update order status
- View all registered customers

## Demo accounts

| Role     | Email              | Password     |
| -------- | ------------------ | ------------ |
| Admin    | admin@foodkate.app | admin12345   |
| Customer | (create via /register) | —        |

> The first account you register is a regular customer. To promote another
> account to admin, update `raw_app_meta_data` for that user in Supabase to
> `{"role":"admin"}` and set `profiles.role = 'admin'`.

## Tech stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (custom theme, animations)
- **Routing:** react-router-dom
- **Icons:** lucide-react
- **Backend:** Supabase (Postgres database, Auth, Row Level Security)

## Project structure

```
src/
├── components/      Reusable UI (Navbar, Footer, FoodCard, CartDrawer, …)
├── context/         AuthContext + CartContext (shared state)
├── lib/             supabase.ts (client) + api.ts (data access)
├── pages/           Customer screens (Home, Menu, Cart, Checkout, …)
│   └── admin/       Admin screens (Dashboard, ManageFoods, ManageOrders, …)
├── types/           Shared TypeScript types
├── App.tsx          Routes
└── main.tsx         Entry point
```

## Database

Supabase Postgres with these tables (all RLS-enabled):

- `profiles` — extends auth.users with name, phone, address, role
- `categories` — Biryani, Pizza, Burgers, Rice Dishes
- `foods` — menu items (price, image, rating, prep time, availability)
- `orders` — customer orders with status + delivery info
- `order_items` — foods + quantities per order
- `payments` — payment method + status (no card numbers stored)

**Security:** customers can only see and modify their own orders; only admins
can manage food items, categories, and order statuses. Admin authorization uses
the user's `app_metadata.role`, which is set server-side and not user-editable.

## Local development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run typecheck
```

Supabase credentials are pre-configured in `.env` — no setup needed.

## Testing checklist

- [ ] Home page loads with hero, categories, and 8 popular dishes
- [ ] Menu page filters by category and searches by name
- [ ] Food detail page shows description, price, quantity, and add-to-cart
- [ ] Cart drawer opens, updates quantities, shows correct total
- [ ] Register a new customer account → redirected home
- [ ] Place an order with COD → appears in My Orders with status timeline
- [ ] Admin login (admin@foodkate.app / admin12345) → dashboard with stats
- [ ] Admin can add/edit/delete a food item
- [ ] Admin can update an order's status → customer sees it update
- [ ] Unauthenticated users are redirected to login on /checkout and /admin

## Security checklist

- [x] Passwords hashed by Supabase Auth (bcrypt)
- [x] No plain-text passwords or card numbers stored
- [x] Row Level Security on every table
- [x] Customer data isolated per user
- [x] Admin-only writes on foods/categories/orders-status
- [x] Protected routes (RequireAuth, RequireAdmin) in the frontend
- [x] Owner columns default to `auth.uid()` so inserts satisfy RLS
- [x] `is_admin()` reads role from `app_metadata` (not user-mutable)
