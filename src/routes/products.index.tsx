import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { COLORS, SIZES } from "@/lib/catalog";
import { ProductCard, type CardProduct } from "@/components/site/product-card";
import { SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { firstValidImage } from "@/lib/storage";

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  image_url?: string | null;
  is_active?: boolean | null;
  coming_soon?: boolean | null;
  sort_order?: number | null;
};

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
  badge?: string | null;
  status?: string | null;
  category_id?: string | null;
  product_images?: { url: string | null; sort_order?: number | null }[] | null;
};

type StorefrontProduct = CardProduct & {
  categoryId?: string | null;
  categorySlug?: string | null;
  description?: string;
  material?: string;
  sizes?: string[];
};

// Add validateSearch to accept category from URL
export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — TESEZ" },
      { name: "description", content: "Shop premium custom apparel from TESEZ." },
    ],
  }),
  component: Listing,
});

function Listing() {
  const search = Route.useSearch(); // Get search params from URL
  const [openF, setOpenF] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Set category from URL when page loads or search changes
  useEffect(() => {
    if (search.category) {
      setCat(search.category);
    }
  }, [search.category]);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);

    try {
      // First, get the category ID if category is provided
      let categoryId = null;
      if (search.category) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", search.category)
          .single();
        
        if (categoryData) {
          categoryId = categoryData.id;
        }
      }

      // Build the products query
      let productsQuery = supabase
        .from("products")
        .select(`
          id,
          slug,
          name,
          description,
          material,
          price,
          compare_at_price,
          cover_image,
          colors,
          sizes,
          badge,
          status,
          category_id,
          product_images (
            url,
            sort_order
          )
        `)
        .eq("status", "active");

      // Add category filter if category is provided
      if (categoryId) {
        productsQuery = productsQuery.eq("category_id", categoryId);
      }

      // Execute the query with ordering
      const productsRes = await productsQuery.order("created_at", { ascending: false });

      // Fetch categories
      const categoriesRes = await supabase
        .from("categories")
        .select(`
          id,
          name,
          slug,
          tagline,
          image_url,
          is_active,
          coming_soon,
          sort_order
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (productsRes.error) {
        console.error("Products fetch error:", productsRes.error);
      }

      if (categoriesRes.error) {
        console.error("Categories fetch error:", categoriesRes.error);
      }

      const categoryRows = (categoriesRes.data ?? []) as DbCategory[];
      setCategories(categoryRows);

      const categoryMap = new Map(categoryRows.map((c) => [c.id, c]));

      const mapped: StorefrontProduct[] =
        ((productsRes.data ?? []) as DbProduct[]).map((p) => {
          const gallery = [...(p.product_images ?? [])]
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img) => (img.url ?? "").trim())
            .filter(Boolean) as string[];

          const cover = firstValidImage(p.cover_image, gallery[0]) ?? "";
          const category = p.category_id ? categoryMap.get(p.category_id) : null;

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price ?? 0),
            compareAt:
              p.compare_at_price !== null && p.compare_at_price !== undefined
                ? Number(p.compare_at_price)
                : undefined,
            image: cover || null,
            gallery: gallery.length ? gallery : cover ? [cover] : [],
            colors: p.colors ?? [],
            badge: p.badge ?? undefined,
            categoryId: p.category_id ?? null,
            categorySlug: category?.slug ?? null,
            description: p.description ?? "",
            material: p.material ?? "",
            sizes: p.sizes ?? [],
          };
        }) ?? [];

      setProducts(mapped);
    } catch (err) {
      console.error("Products page crashed:", err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const items = useMemo(() => {
    let r = [...products];

    if (cat) {
      r = r.filter((p) => p.categorySlug === cat);
    }

    if (color) {
      r = r.filter((p) => (p.colors ?? []).includes(color));
    }

    if (sort === "price-asc") {
      r.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      r.sort((a, b) => b.price - a.price);
    }

    return r;
  }, [products, cat, color, sort]);

  // Get the selected category name for display
  const selectedCategoryName = useMemo(() => {
    if (!cat) return null;
    const category = categories.find(c => c.slug === cat);
    return category?.name || cat;
  }, [cat, categories]);

  return (
    <div className="container-luxe pt-16 pb-32">
      <div className="eyebrow text-muted-foreground">Collection</div>
      <h1 className="display-lg mt-4">
        {selectedCategoryName ? `${selectedCategoryName}` : "The Shop."}
      </h1>
      {selectedCategoryName && (
        <p className="text-muted-foreground mt-2">
          Showing products in {selectedCategoryName}
        </p>
      )}

      <div className="mt-12 flex items-center justify-between gap-4 pb-5 border-b border-border">
        <button
          onClick={() => setOpenF(!openF)}
          className="flex items-center gap-2 eyebrow"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter ({[cat, color].filter(Boolean).length})
        </button>

        <div className="text-sm text-muted-foreground hidden md:block">
          {loading ? "Loading..." : `${items.length} pieces`}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-transparent eyebrow border border-border px-3 py-2 cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="best">Best Selling</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {openF && (
        <div className="bg-cream p-6 mt-4 grid md:grid-cols-4 gap-8">
          <FilterCol label="Category">
            {categories
              .filter((c) => !c.coming_soon)
              .map((c) => (
                <Pill
                  key={c.id}
                  active={cat === c.slug}
                  onClick={() => setCat(cat === c.slug ? null : c.slug)}
                >
                  {c.name}
                </Pill>
              ))}
          </FilterCol>

          <FilterCol label="Color">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(color === c.name ? null : c.name)}
                className={`h-6 w-6 rounded-full border-2 transition ${
                  color === c.name ? "border-foreground" : "border-transparent"
                }`}
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
          </FilterCol>

          <FilterCol label="Size">
            {SIZES.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </FilterCol>

          <FilterCol label="Price">
            <Pill>Under ₹1,500</Pill>
            <Pill>₹1,500 – ₹2,500</Pill>
            <Pill>Above ₹2,500</Pill>
          </FilterCol>
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-14">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground py-20">
            Loading products...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-20">
            No products found in this category.
          </div>
        ) : (
          items.map((p) => <ProductCard key={p.id ?? p.slug} p={p} />)
        )}
      </div>
    </div>
  );
}

function FilterCol({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow text-muted-foreground mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs border px-3 py-1.5 transition ${
        active
          ? "bg-foreground text-paper border-foreground"
          : "border-border hover:border-foreground"
      }`}
    >
      {children}
    </button>
  );
}