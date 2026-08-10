import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://mmarqpikdxjgafeivkzp.supabase.co";

function cleanValue(value?: string | null) {
  return (value ?? "").trim();
}

export function isAbsoluteUrl(value?: string | null) {
  const v = cleanValue(value);
  return /^https?:\/\//i.test(v);
}

/**
 * Extract storage object path from any of these formats:
 *
 * 1) full public URL
 *    https://<project>.supabase.co/storage/v1/object/public/product-images/products/a.jpg
 *
 * 2) raw storage path
 *    products/a.jpg
 *
 * 3) accidentally stored path with storage prefix
 *    storage/v1/object/public/product-images/products/a.jpg
 *
 * 4) leading slash path
 *    /storage/v1/object/public/product-images/products/a.jpg
 */
export function extractStoragePath(
  value?: string | null,
  bucket = "product-images"
): string | null {
  const raw = cleanValue(value);
  if (!raw) return null;

  // full public URL
  if (isAbsoluteUrl(raw)) {
    try {
      const url = new URL(raw);

      // exact public prefix
      const publicPrefix = `/storage/v1/object/public/${bucket}/`;
      const idx = url.pathname.indexOf(publicPrefix);
      if (idx >= 0) {
        return url.pathname.slice(idx + publicPrefix.length);
      }

      // fallback: if pathname contains bucket name
      const bucketMarker = `/${bucket}/`;
      const bucketIdx = url.pathname.indexOf(bucketMarker);
      if (bucketIdx >= 0) {
        return url.pathname.slice(bucketIdx + bucketMarker.length);
      }

      return null;
    } catch {
      return null;
    }
  }

  let path = raw.replace(/^\/+/, "");

  // remove full storage prefix if saved by mistake
  const publicPrefix = `storage/v1/object/public/${bucket}/`;
  if (path.startsWith(publicPrefix)) {
    path = path.slice(publicPrefix.length);
  }

  // remove bucket name if path starts with bucket/
  if (path.startsWith(`${bucket}/`)) {
    path = path.slice(bucket.length + 1);
  }

  return path || null;
}

/**
 * Always return a clean Supabase public URL for the object.
 * Even if DB contains a full old URL, we extract the object path
 * and regenerate the final public URL from current bucket path.
 */
export function resolveStorageUrl(
  value?: string | null,
  bucket = "product-images"
): string | null {
  const path = extractStoragePath(value, bucket);
  if (!path) return null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function firstValidImage(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    const v = cleanValue(value);
    if (v) return v;
  }
  return null;
}

/**
 * Picks first usable image from:
 * - cover_image
 * - gallery urls
 */
export function getFirstProductImage(
  coverImage?: string | null,
  gallery?: Array<string | null | undefined>
): string | null {
  const cover = cleanValue(coverImage);
  if (cover) return cover;

  if (gallery?.length) {
    for (const item of gallery) {
      const v = cleanValue(item);
      if (v) return v;
    }
  }

  return null;
}

/**
 * Converts gallery values into final public URLs
 */
export function resolveGallery(
  values: Array<string | null | undefined>,
  bucket = "product-images"
): string[] {
  return values
    .map((v) => resolveStorageUrl(v, bucket))
    .filter((v): v is string => Boolean(v));
}