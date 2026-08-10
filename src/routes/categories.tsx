import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/storage";
import { firstValidImage } from "@/lib/storage";

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  coming_soon: boolean | null;
};

type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  image: string | null;
  comingSoon: boolean;
};

type DbProductImage = { url: string | null; sort_order?: number | null };
type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  material?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  cover_image?: string | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  size_prices?: { S: number; M: number; L: number; XL: number; XXL: number; XXXL: number; } | null;
  badge?: string | null;
  status?: string | null;
  category_id?: string | null;
  product_images?: DbProductImage[] | null;
};

type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  categoryId?: string | null;
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  description: string;
  material: string;
  colors: string[];
  sizes: string[];
  size_prices: { S: number; M: number; L: number; XL: number; XXL: number; XXXL: number; };
  badge?: string;
};

function mapDbProductToStorefront(p: DbProduct): StorefrontProduct {
  const gallery = (p.product_images ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(img => (img.url ?? "").trim()).filter(Boolean);
  const cover = firstValidImage(p.cover_image, gallery[0]) ?? "";
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: p.category_id ?? null,
    price: Number(p.price ?? 0),
    compareAt: p.compare_at_price != null ? Number(p.compare_at_price) : undefined,
    image: cover,
    gallery: gallery.length ? gallery : cover ? [cover] : [],
    description: p.description ?? "",
    material: p.material ?? "",
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    size_prices: p.size_prices ?? { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0 },
    badge: p.badge ?? undefined,
  };
}

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — TESEZ" },
      {
        name: "description",
        content: "Browse the TESEZ catalogue by category.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, tagline, image_url, sort_order, is_active, coming_soon")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Categories fetch error:", error);
      setCategories([]);
      setLoading(false);
      return;
    }

    const mapped: StoreCategory[] =
      (data as DbCategory[] | null)?.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        tagline: c.tagline ?? "",
        image: resolveStorageUrl(c.image_url, "category-images"),
        comingSoon: !!c.coming_soon,
      })) ?? [];

    console.log("Mapped categories:", mapped);
    setCategories(mapped);
    setLoading(false);
  }

  return (
    <div>
      <section className="container-luxe pt-20 pb-12">
        <div className="eyebrow text-muted-foreground">The Catalogue</div>
        <h1 className="display-xl mt-4 max-w-4xl">Every silhouette, considered.</h1>
      </section>

      <section className="container-luxe pb-32 grid md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            No categories found.
          </div>
        ) : (
          categories.map((c) => <CategoryCard key={c.id} c={c} />)
        )}
      </section>
    </div>
  );
}

function CategoryCard({ c }: { c: StoreCategory }) {
  const [failed, setFailed] = useState(false);

  const image = useMemo(() => {
    if (failed || !c.image) return null;
    return c.image;
  }, [c.image, failed]);

  return (
    <Link
      to="/products"
      search={{ category: c.slug }}
      className="group relative overflow-hidden aspect-[5/4] block bg-cream"
    >
      {image ? (
        <img
          src={image}
          alt={c.name}
          loading="lazy"
          onError={() => {
            console.error("Category image failed:", c.name, image);
            setFailed(true);
          }}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-center px-6">
          <div>
            <div className="tracking-[0.3em] text-sm">TESEZ</div>
            <div className="text-sm text-muted-foreground mt-2">Image unavailable</div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent" />
      <div className="absolute inset-x-8 bottom-8 text-paper">
        <div className="eyebrow opacity-70">
          {c.comingSoon ? "Coming Soon" : "Shop"}
        </div>
        <div className="font-display text-4xl md:text-5xl mt-2">{c.name}</div>
        {c.tagline && <div className="opacity-80 mt-2">{c.tagline}</div>}
      </div>
    </Link>
  );
}