/**
 * Supabase SQL Setup Script
 * Copy and run this in your Supabase SQL Editor
 */

/*
-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock_count INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  how_to_use TEXT,
  ingredients TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  result_images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Order Items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies

-- Profiles: Users can view their own, Admins can view all
CREATE POLICY "Profiles view policy" ON profiles FOR SELECT 
  USING (auth.uid() = id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Profiles update policy" ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Products: Everyone can view, only Admins can manage (All actions)
CREATE POLICY "Products view policy" ON products FOR SELECT USING (true);

CREATE POLICY "Products admin policy" ON products 
  FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Orders: Users can view own, Admins can view/manage all
CREATE POLICY "Orders select policy" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Orders insert policy" ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orders admin update policy" ON orders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Order Items: Link to order permissions
CREATE POLICY "Order items select policy" ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE))
    )
  );

CREATE POLICY "Order items insert policy" ON order_items FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

-- 7. Trigger for automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Storage Setup
-- Note: Run these in the Supabase SQL Editor to enable image uploads
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Policy to allow public viewing
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Policies to allow Admins to Manage (Upload, Update, Delete)
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)));

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)));

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)));
*/
*/
