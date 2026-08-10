
-- Drop any policy allowing public/anon/authenticated SELECT on coupons
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT polname FROM pg_policy WHERE polrelid = 'public.coupons'::regclass LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.coupons', p.polname);
  END LOOP;
END $$;

-- Admin-only access for everything
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Revoke anon/authenticated grants; server (service_role) keeps full access for checkout validation
REVOKE ALL ON public.coupons FROM anon;
REVOKE ALL ON public.coupons FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated; -- gated by admin RLS
GRANT ALL ON public.coupons TO service_role;
