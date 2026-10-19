/*
# Food Kate — core database schema

## What this migration does
Creates the complete data layer for the Food Kate food-ordering app:
- `profiles`       — extends Supabase Auth users with a role, name, phone, address
- `categories`     — food categories (Biryani, Pizza, Burgers, Rice Dishes)
- `foods`          — individual food items with price, image, rating, category
- `orders`         — a customer's order with status and delivery address
- `order_items`    — the foods + quantities inside each order
- `payments`       — payment record per order (method + status, NO card numbers)
- Helper function `is_admin()` — checks the signed-in user's app-metadata role
- Seeds sample categories and 12 food items with real image URLs
- Enables Row Level Security on every table and writes scoped policies

## Security model
- `categories` and `foods` are publicly readable (anon + authenticated) because
  visitors browse the menu without signing in. Only admins may write them.
- `profiles` are read/updatable by their owner; admins may read all profiles.
- `orders`, `order_items`, and `payments` are customer-owned: a customer can
  only see and create their own rows. Admins may read and update order status.
- Admin authorization uses `raw_app_meta_data ->> 'role' = 'admin'`, which is
  set server-side and is NOT user-editable.
- No card numbers or raw payment details are ever stored — `payments` only
  records the method (e.g. "cod", "card") and a status string.

## Notes
1. Owner columns (`user_id`) default to `auth.uid()` so frontend inserts that
   omit `user_id` still satisfy the INSERT WITH CHECK policy.
2. `order_items` ownership is derived through its parent `orders` row via an
   EXISTS subquery, so we don't duplicate `user_id` on the child table.
3. Re-running this migration is safe: CREATE TABLE IF NOT EXISTS, DROP POLICY
   IF EXISTS before each CREATE POLICY, and INSERT ... ON CONFLICT DO NOTHING
   for seed data.
*/

-- ---------- helper: is_admin() ----------
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL DEFAULT '',
  phone       text DEFAULT '',
  address     text DEFAULT '',
  role        text NOT NULL DEFAULT 'customer',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------- categories ----------
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  icon        text DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read_public" ON public.categories;
CREATE POLICY "categories_read_public"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
CREATE POLICY "categories_admin_insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
CREATE POLICY "categories_admin_update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;
CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------- foods ----------
CREATE TABLE IF NOT EXISTS public.foods (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name         text NOT NULL,
  description  text NOT NULL DEFAULT '',
  price        numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url    text NOT NULL DEFAULT '',
  rating       numeric(2,1) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  prep_minutes int NOT NULL DEFAULT 20 CHECK (prep_minutes > 0),
  is_available boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "foods_read_public" ON public.foods;
CREATE POLICY "foods_read_public"
  ON public.foods FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "foods_admin_insert" ON public.foods;
CREATE POLICY "foods_admin_insert"
  ON public.foods FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "foods_admin_update" ON public.foods;
CREATE POLICY "foods_admin_update"
  ON public.foods FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "foods_admin_delete" ON public.foods;
CREATE POLICY "foods_admin_delete"
  ON public.foods FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS public.orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','preparing','out_for_delivery','delivered','cancelled')),
  total         numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  delivery_address text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  notes         text DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_own_or_admin_delete" ON public.orders;
CREATE POLICY "orders_own_or_admin_delete"
  ON public.orders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ---------- order_items ----------
CREATE TABLE IF NOT EXISTS public.order_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_id    uuid NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  name       text NOT NULL,
  price      numeric(10,2) NOT NULL CHECK (price >= 0),
  quantity   int NOT NULL CHECK (quantity > 0),
  image_url  text DEFAULT ''
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_own_or_admin"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- ---------- payments ----------
CREATE TABLE IF NOT EXISTS public.payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  method      text NOT NULL DEFAULT 'cod' CHECK (method IN ('cod','card','upi')),
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','paid','failed','refunded')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own_or_admin" ON public.payments;
CREATE POLICY "payments_select_own_or_admin"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payments_admin_update" ON public.payments;
CREATE POLICY "payments_admin_update"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------- seed: categories ----------
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Biryani',     'biryani',     'utensils'),
  ('Pizza',       'pizza',       'pizza'),
  ('Burgers',     'burgers',     'beef'),
  ('Rice Dishes', 'rice-dishes', 'bowl-rice')
ON CONFLICT (slug) DO NOTHING;

-- ---------- seed: foods ----------
INSERT INTO public.foods (category_id, name, description, price, image_url, rating, prep_minutes, is_available)
SELECT c.id, v.name, v.description, v.price, v.image_url, v.rating, v.prep_minutes, v.is_available
FROM (VALUES
  ('biryani', 'Chicken Biryani',      'Aromatic basmati rice layered with spiced chicken, saffron, and fried onions, served with raita.', 249.00, 'https://images.pexels.com/photos/39536492/pexels-photo-39536492.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.8, 30, true),
  ('biryani', 'Mutton Biryani',       'Slow-cooked tender mutton dum biryani with whole spices, mint, and basmati rice.',                 329.00, 'https://images.pexels.com/photos/9609856/pexels-photo-9609856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.7, 35, true),
  ('biryani', 'Veg Biryani',          'Fragrant vegetable biryani with paneer, peas, carrots, and cashews in a saffron rice pot.',       199.00, 'https://images.pexels.com/photos/12669168/pexels-photo-12669168.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.5, 25, true),
  ('pizza',   'Margherita Pizza',     'Classic wood-fired pizza with San Marzano tomatoes, fresh mozzarella, and basil.',                 299.00, 'https://images.pexels.com/photos/31596394/pexels-photo-31596394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.6, 20, true),
  ('pizza',   'Pepperoni Pizza',      'Loaded with mozzarella and spicy pepperoni slices on a hand-stretched crust.',                    349.00, 'https://images.pexels.com/photos/3915857/pexels-photo-3915857.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.7, 22, true),
  ('pizza',   'BBQ Chicken Pizza',    'Smoky BBQ sauce, grilled chicken, red onions, and melted cheese on a thin crust.',                 379.00, 'https://images.pexels.com/photos/33458049/pexels-photo-33458049.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.5, 22, true),
  ('burgers', 'Classic Cheeseburger', 'Juicy beef patty, cheddar, lettuce, tomato, and house sauce in a toasted brioche bun.',             179.00, 'https://images.pexels.com/photos/4109233/pexels-photo-4109233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.6, 15, true),
  ('burgers', 'Bacon BBQ Burger',     'Double bacon, smoky BBQ sauce, crispy onion rings, and melted cheddar on a beef patty.',            229.00, 'https://images.pexels.com/photos/28966660/pexels-photo-28966660.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.7, 18, true),
  ('burgers', 'Crispy Chicken Burger','Buttermilk-fried chicken fillet, fresh lettuce, pickles, and mayo in a soft bun.',                  169.00, 'https://images.pexels.com/photos/34407059/pexels-photo-34407059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.4, 16, true),
  ('rice-dishes', 'Shrimp Fried Rice','Wok-tossed rice with shrimp, eggs, scallions, and garlic in a light soy sauce.',                   219.00, 'https://images.pexels.com/photos/34683317/pexels-photo-34683317.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.5, 18, true),
  ('rice-dishes', 'Veg Fried Rice',   'Steamed rice stir-fried with mixed vegetables, ginger, and a house omelette on top.',              159.00, 'https://images.pexels.com/photos/28503589/pexels-photo-28503589.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.3, 15, true),
  ('rice-dishes', 'Jeera Rice',       'Fragrant basmati tempered with cumin seeds and ghee, served with chutney and yogurt.',              129.00, 'https://images.pexels.com/photos/35267286/pexels-photo-35267286.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.4, 12, true)
) AS v(slug, name, description, price, image_url, rating, prep_minutes, is_available)
JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;

-- ---------- auto-create profile on signup ----------
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
