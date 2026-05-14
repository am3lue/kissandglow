-- RUN THIS IN SUPABASE SQL EDITOR TO FIX PERMISSIONS

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Clear old policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 3. Create fresh Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)));

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)));

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)));

-- 4. Fix Product Policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Products view policy" ON products;
DROP POLICY IF EXISTS "Products admin policy" ON products;

CREATE POLICY "Products view policy" ON products FOR SELECT USING (true);
CREATE POLICY "Products admin policy" ON products FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
