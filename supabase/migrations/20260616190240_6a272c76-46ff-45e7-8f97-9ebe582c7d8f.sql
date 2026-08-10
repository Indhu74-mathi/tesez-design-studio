
-- Public read for storefront-facing buckets
CREATE POLICY "Public read storefront media" ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images','design-library','blog-images','category-images','homepage-media'));

-- Admin write/update/delete
CREATE POLICY "Admins upload storefront media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('product-images','design-library','blog-images','category-images','homepage-media')
  AND public.has_role(auth.uid(),'admin')
);

CREATE POLICY "Admins update storefront media" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id IN ('product-images','design-library','blog-images','category-images','homepage-media')
  AND public.has_role(auth.uid(),'admin')
);

CREATE POLICY "Admins delete storefront media" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN ('product-images','design-library','blog-images','category-images','homepage-media')
  AND public.has_role(auth.uid(),'admin')
);
