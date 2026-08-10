
-- New columns on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_signature TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- Add 'payment_confirmed' to order_status enum (between processing and printing in concept)
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'payment_confirmed' BEFORE 'printing';

-- Allow guest checkout: anyone can create a pending order row tied to no user
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT
WITH CHECK (
  -- Signed-in users must own the row; anonymous users must leave user_id null
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);
GRANT INSERT ON public.orders TO anon;

DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items for their order" ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (
        (auth.uid() IS NOT NULL AND o.user_id = auth.uid())
        OR (auth.uid() IS NULL AND o.user_id IS NULL)
      )
  )
);
GRANT INSERT ON public.order_items TO anon;

-- Public can look up an order by order_number for tracking (read-only, minimal)
-- Skipped — keep orders private; tracking page can use a server fn instead.
