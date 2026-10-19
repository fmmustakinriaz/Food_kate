/*
# Create demo admin account

Creates a ready-to-use admin login so the admin dashboard is reachable
without manual setup. The user is created through Supabase Auth so the
password is hashed automatically, then its app_metadata role is set to
'admin' (user-immutable) which is_admin() reads to authorize admin actions.

Credentials (demo only — change after first login):
- Email: admin@foodkate.app
- Password: admin12345

This migration is idempotent: re-running it will not duplicate the user
and will simply re-assert the admin role.
*/

DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Try to find an existing admin user by email
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@foodkate.app';

  IF admin_id IS NULL THEN
    -- Create the auth user with a hashed password
    admin_id := extensions.uuid_generate_v4();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    )
    VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@foodkate.app',
      crypt('admin12345', extensions.gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('role', 'admin'),
      jsonb_build_object('full_name', 'Food Kate Admin')
    );

    -- Create the profile row (the trigger normally does this, but
    -- direct inserts into auth.users bypass the AFTER INSERT trigger
    -- when invoked from within a DO block in some environments)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (admin_id, 'Food Kate Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    -- Re-assert admin role for an existing user
    UPDATE auth.users
      SET raw_app_meta_data = jsonb_build_object('role', 'admin')
      WHERE id = admin_id;
    UPDATE public.profiles SET role = 'admin' WHERE id = admin_id;
  END IF;
END $$;
