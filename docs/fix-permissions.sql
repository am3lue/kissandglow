-- RE-RUN THIS IN SUPABASE SQL EDITOR TO FIX RECURSION AND PERMISSIONS

-- 0. Update Profiles Table Schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 0.1 Update Orders Status Constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'));

-- 0.2 Add explicit FK from orders to profiles for easier joining
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- 1. Create a helper function to check if a user is an admin without recursion
-- Using SECURITY DEFINER bypasses RLS for the internal query
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Enhanced Trigger for automatic profile creation on signup
-- Now includes email for identifiable "known" customers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_admin)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Profiles Policies (Remove recursion)
DROP POLICY IF EXISTS "Profiles view policy" ON profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Profiles view policy" ON profiles FOR SELECT 
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Profiles update policy" ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 3. Fix Orders Policies
DROP POLICY IF EXISTS "Orders select policy" ON orders;
DROP POLICY IF EXISTS "Orders insert policy" ON orders;
DROP POLICY IF EXISTS "Orders admin update policy" ON orders;

CREATE POLICY "Orders select policy" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Orders insert policy" ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own pending orders" ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'Pending')
  WITH CHECK (auth.uid() = user_id AND status = 'Cancelled');

CREATE POLICY "Orders admin update policy" ON orders FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Orders admin delete policy" ON orders FOR DELETE 
  USING (is_admin());

-- 4. Fix Order Items Policies
DROP POLICY IF EXISTS "Order items select policy" ON order_items;
DROP POLICY IF EXISTS "Order items insert policy" ON order_items;
DROP POLICY IF EXISTS "Order items admin all policy" ON order_items;

CREATE POLICY "Order items select policy" ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Order items insert policy" ON order_items FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR is_admin()
  );

CREATE POLICY "Order items admin all policy" ON order_items FOR ALL
  USING (is_admin());

-- 5. Fix Product Policies
DROP POLICY IF EXISTS "Products view policy" ON products;
DROP POLICY IF EXISTS "Products admin policy" ON products;

CREATE POLICY "Products view policy" ON products FOR SELECT USING (true);
CREATE POLICY "Products admin policy" ON products FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 6. Storage Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND is_admin());
