import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { COLORS, SIZES, formatINR } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { ProductCard, type CardProduct } from "@/components/site/product-card";
import {
  Heart,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle, // 👈 new import
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { firstValidImage } from "@/lib/storage";

type DbProductImage = {
  url: string | null;
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
  size_prices?: {
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
    XXXL: number;
  } | null;
  badge?: string | null;
  status?: string | null;
  category_id?: string | null;
  product_images?: DbProductImage[] | null;
};

type StorefrontProduct = CardProduct & {
  categoryId?: string | null;
  description: string;
  material: string;
  sizes: string[];
  size_prices: {
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
    XXXL: number;
  };
};

export const Route = createFileRoute("/products/$slug")({
  head: () => ({
    meta: [
      { title: "Product — TESEZ" },
      {
        name: "description",
        content: "Shop premium custom apparel from TESEZ.",
      },
    ],
  }),
  component: PDPPage,
});

function PDPPage() {
  const { slug } = Route.useParams();

  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const displayPrice =
    size &&
    product?.size_prices &&
    product.size_prices[size as keyof typeof product.size_prices]
      ? product.size_prices[size as keyof typeof product.size_prices]
      : product?.price ?? 0;
  const [activeImg, setActiveImg] = useState(0);
  const [showSize, setShowSize] = useState(false);

  const cart = useCart();

  useEffect(() => {
    loadProduct(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setColor(product.colors?.[0] ?? null);
    setSize(null);
    setActiveImg(0);
  }, [product]);

  async function loadProduct(currentSlug: string) {
    setLoading(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
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
          size_prices,
          badge,
          status,
          category_id,
          product_images (
            url,
            sort_order
          )
        `)
        .eq("slug", currentSlug)
        .eq("status", "active")
        .single();

      if (error || !data) {
        console.error("Product detail fetch error:", error);
        setProduct(null);
        setRelatedProducts([]);
        setNotFound(true);
        setLoading(false);
        return;
      }

      const mappedProduct = mapDbProductToStorefront(data as DbProduct);
      setProduct(mappedProduct);

      const { data: relatedData, error: relatedError } = await supabase
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
          size_prices,
          badge,
          status,
          category_id,
          product_images (
            url,
            sort_order
          )
        `)
        .eq("status", "active")
        .neq("slug", currentSlug)
        .order("created_at", { ascending: false })
        .limit(4);

      if (relatedError) {
        console.error("Related products fetch error:", relatedError);
        setRelatedProducts([]);
      } else {
        const mappedRelated =
          (relatedData as DbProduct[] | null)?.map((p) => {
            const m = mapDbProductToStorefront(p);
            return {
              id: m.id,
              slug: m.slug,
              name: m.name,
              price: m.price,
              compareAt: m.compareAt,
              image: m.image,
              gallery: m.gallery,
              colors: m.colors,
              badge: m.badge,
            } satisfies CardProduct;
          }) ?? [];

        setRelatedProducts(mappedRelated);
      }
    } catch (err) {
      console.error("loadProduct crashed:", err);
      setProduct(null);
      setRelatedProducts([]);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.gallery?.length
      ? product.gallery
      : product.image
      ? [product.image]
      : [];
  }, [product]);

  const activeImage = gallery[activeImg] ?? product?.image ?? null;

  if (loading) {
    return (
      <div className="container-luxe py-32 text-center text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container-luxe py-32 text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  return (
    <div>
      <div className="container-luxe pt-8 text-xs text-muted-foreground">
        <a href="/" className="hover:text-foreground">
          Home
        </a>{" "}
        /{" "}
        <a href="/products" className="hover:text-foreground">
          Shop
        </a>{" "}
        / <span>{product.name}</span>
      </div>

      <section className="container-luxe pt-6 pb-24 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 grid grid-cols-5 gap-3">
          <div className="hidden md:flex col-span-1 flex-col gap-3">
            {gallery.map((g, i) => (
              <button
                key={`${g}-${i}`}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`aspect-[4/5] overflow-hidden border ${
                  activeImg === i ? "border-foreground" : "border-transparent"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="col-span-5 md:col-span-4 aspect-[4/5] bg-cream overflow-hidden">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-center px-4">
                <div>
                  <div className="tracking-[0.3em] text-sm">TESEZ</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Image unavailable
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-8">
          {product.badge ? (
            <div className="eyebrow text-crimson">{product.badge}</div>
          ) : null}

          <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-2xl">{formatINR(displayPrice)}</div>
            {product.compareAt ? (
              <div className="text-muted-foreground line-through">
                {formatINR(product.compareAt)}
              </div>
            ) : null}
          </div>

          {product.description ? (
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          ) : null}

          {!!product.colors?.length && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div className="eyebrow">
                  Colour —{" "}
                  <span className="text-muted-foreground">
                    {color ?? product.colors[0]}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                {product.colors.map((c) => {
                  const col = COLORS.find((x) => x.name === c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      title={c}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        color === c
                          ? "border-foreground"
                          : "border-transparent ring-1 ring-border"
                      }`}
                      style={{ background: col?.hex ?? "#ddd" }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Size</div>
              <button
                type="button"
                onClick={() => setShowSize(true)}
                className="text-xs flex items-center gap-1 link-underline"
              >
                <Ruler className="h-3 w-3" /> Size Guide
              </button>
            </div>

            <div className="mt-3 grid grid-cols-6 gap-2">
              {(product.sizes?.length ? product.sizes : SIZES).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`py-3 text-xs border transition ${
                    size === s
                      ? "bg-foreground text-paper border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button
              disabled={!size}
              onClick={() =>
                cart.add({
                  productSlug: product.slug,
                  name: product.name,
                  image: product.image ?? "",
                  price: displayPrice,
                  color: color ?? product.colors?.[0] ?? "",
                  size: size!,
                })
              }
              className="flex-1 bg-noir text-paper py-4 eyebrow disabled:opacity-40 hover:opacity-90 transition"
            >
              {size ? "Add to Bag" : "Select a Size"}
            </button>

            <button
              type="button"
              className="border border-foreground py-4 px-5"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Customise This Style link */}
          {/* {size ? (
            <Link
              to="/customize"
              search={{
                slug: product.slug,
                size: size,
                color: color || product.colors?.[0] || "",
              }}
              className="mt-3 block text-center border border-foreground py-4 eyebrow hover:bg-foreground hover:text-paper transition"
            >
              Customise This Style
            </Link>
          ) : (
            <div className="mt-3 block text-center border border-muted py-4 eyebrow text-muted-foreground cursor-not-allowed">
              Select a size to customise
            </div>
          )} */}

          {/* 👇 NEW: For Bulk Orders button */}
          <a
            href={`https://wa.me/919047787569?text=Hi%2C%20I%20am%20interested%20in%20bulk%20ordering%20for%20${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center border border-green-600 py-4 eyebrow hover:bg-green-600 hover:text-white transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            For Bulk Orders
          </a>

          <div className="mt-10 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div>
              <Truck className="h-4 w-4 mb-2" />
              Free ship above ₹2,499
            </div>
            <div>
              <RotateCcw className="h-4 w-4 mb-2" />
              7-day easy returns
            </div>
            <div>
              <ShieldCheck className="h-4 w-4 mb-2" />
              Studio quality promise
            </div>
          </div>

          <details className="mt-10 border-t border-border pt-5">
            <summary className="eyebrow cursor-pointer">Material & Care</summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {product.material || "Premium fabric"} Wash cold, inside-out. Lay
              flat to dry.
            </p>
          </details>

          <details className="border-t border-border py-5">
            <summary className="eyebrow cursor-pointer">
              Shipping & Returns
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Dispatched within 48 hours. 7-day easy returns on unwashed items.
              Customised pieces are non-returnable.
            </p>
          </details>
        </div>
      </section>

      <section className="container-luxe pb-32">
        <h2 className="display-lg mb-12">You may also like.</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((p) => <ProductCard key={p.slug} p={p} />)
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
              No related products found.
            </div>
          )}
        </div>
      </section>

      {showSize && (
        <div
          className="fixed inset-0 z-[80] bg-noir/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSize(false)}
        >
          <div
            className="bg-paper max-w-2xl w-full p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-display text-3xl">Size Guide</h3>
              <button
                type="button"
                onClick={() => setShowSize(false)}
                className="eyebrow"
              >
                Close ×
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="text-left eyebrow text-muted-foreground">
                <tr>
                  <th className="py-3">Size</th>
                  <th>Chest (in)</th>
                  <th>Length (in)</th>
                  <th>Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["S", "38", "27", "17"],
                  ["M", "40", "28", "18"],
                  ["L", "42", "29", "19"],
                  ["XL", "44", "30", "20"],
                  ["XXL", "46", "31", "21"],
                  ["XXXL", "48", "32", "22"],
                ].map((r) => (
                  <tr key={r[0]} className="border-t border-border">
                    <td className="py-3 font-medium">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function mapDbProductToStorefront(p: DbProduct): StorefrontProduct {
  const gallery = [...(p.product_images ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((img) => (img.url ?? "").trim())
    .filter(Boolean);

  const cover = firstValidImage(p.cover_image, gallery[0]) ?? "";

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: p.category_id ?? null,
    price: Number(p.price ?? 0),
    compareAt:
      p.compare_at_price !== null && p.compare_at_price !== undefined
        ? Number(p.compare_at_price)
        : undefined,
    image: cover,
    gallery: gallery.length ? gallery : cover ? [cover] : [],
    description: p.description ?? "",
    material: p.material ?? "",
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    size_prices: p.size_prices ?? {
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
    },
    badge: p.badge ?? undefined,
  };
}