import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl, firstValidImage } from "@/lib/storage";
import { ProductCard, type CardProduct } from "@/components/site/product-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TESEZ — Wear Your Design. Express Your Style." },
      {
        name: "description",
        content:
          "Premium custom apparel. Designer t-shirts, hoodies, and a live customisation studio. Crafted in India.",
      },
      { property: "og:title", content: "TESEZ — Premium Custom Apparel" },
      {
        property: "og:description",
        content: "Designer t-shirts and bespoke prints. Wear your design.",
      },
    ],
  }),
  component: Home,
});

type HomepageSectionRow = {
  section_key: string;
  content: any;
  is_active?: boolean | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  coming_soon?: boolean | null;
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

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  read_time?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  status?: string | null;
};

type HomepageData = {
  hero: {
    headline?: string;
    subheadline?: string;
    cta_label?: string;
    cta_link?: string;
    image?: string | null;
  };
  marquee: {
    items?: string;
  };
  lifestyle: {
    tagline?: string;
    image?: string | null;
  };
  testimonials: {
    json?: string;
  };
  faqs: {
    json?: string;
  };
  footer: {
    json?: string;
  };
};

type Testimonial = {
  name: string;
  city?: string;
  text: string;
  rating?: number;
};

function Home() {
  const [loading, setLoading] = useState(true);

  const [homepage, setHomepage] = useState<HomepageData>({
    hero: {
      headline: "Wear your design.",
      subheadline:
        "A custom apparel house built around restraint, weight and the quiet authority of a garment made properly.",
      cta_label: "Shop the Collection",
      cta_link: "/products",
      image: null,
    },
    marquee: {
      items:
        "Heavyweight Cotton\nHand-Finished Hems\nStudio-Grade Print\nShipped in 48 Hours\nBulk for Teams",
    },
    lifestyle: {
      tagline: "Quiet weight. Loud presence.",
      image: null,
    },
    testimonials: { json: "[]" },
    faqs: { json: "[]" },
    footer: { json: "{}" },
  });

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [blogs, setBlogs] = useState<BlogPostRow[]>([]);

  useEffect(() => {
    loadHomepage();
  }, []);

  async function loadHomepage() {
    setLoading(true);

    try {
      const [
        sectionsRes,
        categoriesRes,
        productsRes,
        blogsRes,
      ] = await Promise.all([
        supabase.from("homepage_sections").select("*"),
        supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
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
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("blog_posts")
          .select(`
            id,
            slug,
            title,
            excerpt,
            category,
            read_time,
            featured_image,
            published_at,
            created_at,
            status
          `)
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      // homepage sections
      if (!sectionsRes.error) {
        const rows = (sectionsRes.data ?? []) as HomepageSectionRow[];
        const map: Record<string, any> = {};
        rows.forEach((row) => {
          map[row.section_key] = row.content ?? {};
        });

        setHomepage((prev) => ({
          hero: map.hero ?? prev.hero,
          marquee: map.marquee ?? prev.marquee,
          lifestyle: map.lifestyle ?? prev.lifestyle,
          testimonials: map.testimonials ?? prev.testimonials,
          faqs: map.faqs ?? prev.faqs,
          footer: map.footer ?? prev.footer,
        }));
      } else {
        console.error("Homepage sections fetch error:", sectionsRes.error);
      }

      // categories
      if (!categoriesRes.error) {
        setCategories((categoriesRes.data ?? []) as CategoryRow[]);
      } else {
        console.error("Categories fetch error:", categoriesRes.error);
        setCategories([]);
      }

      // products
      if (!productsRes.error) {
        const mappedProducts: CardProduct[] =
          ((productsRes.data ?? []) as DbProduct[]).map((p) => {
            const gallery = [...(p.product_images ?? [])]
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((img) => (img.url ?? "").trim())
              .filter(Boolean);

            const cover = firstValidImage(p.cover_image, gallery[0]) ?? null;

            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: Number(p.price ?? 0),
              compareAt:
                p.compare_at_price !== null && p.compare_at_price !== undefined
                  ? Number(p.compare_at_price)
                  : undefined,
              image: cover,
              gallery: gallery.length ? gallery : cover ? [cover] : [],
              colors: p.colors ?? [],
              badge: p.badge ?? undefined,
            };
          }) ?? [];

        setProducts(mappedProducts);
      } else {
        console.error("Products fetch error:", productsRes.error);
        setProducts([]);
      }

      // blogs
      if (!blogsRes.error) {
        setBlogs((blogsRes.data ?? []) as BlogPostRow[]);
      } else {
        console.error("Blogs fetch error:", blogsRes.error);
        setBlogs([]);
      }
    } catch (err) {
      console.error("Homepage load crashed:", err);
      setCategories([]);
      setProducts([]);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  const heroImage = resolveStorageUrl(homepage.hero?.image, "homepage-media");
  const lifestyleImage = resolveStorageUrl(
    homepage.lifestyle?.image,
    "homepage-media"
  );

  const marqueeItems = useMemo(() => {
    return (homepage.marquee?.items ?? "")
      .split(/\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);
  }, [homepage.marquee?.items]);

  const testimonials = useMemo<Testimonial[]>(() => {
    try {
      const raw = homepage.testimonials?.json;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [homepage.testimonials?.json]);

  const best = products.slice(0, 4);
  const trending = products.slice(4, 8).length ? products.slice(4, 8) : products.slice(0, 4);
  const fresh = [...products].slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-noir text-paper overflow-hidden">
        <div className="grid lg:grid-cols-12 min-h-[88vh]">
          <div className="lg:col-span-7 relative overflow-hidden order-2 lg:order-1">
            {heroImage ? (
              <img
                src={heroImage}
                alt="TESEZ hero"
                className="absolute inset-0 h-full w-full object-cover ken-burns"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
          </div>

          <div className="lg:col-span-5 relative flex flex-col justify-between p-8 md:p-14 lg:p-16 order-1 lg:order-2">
            <div className="eyebrow text-paper/60 fade-up">Volume 06 · TESEZ</div>

            <div className="fade-up" style={{ animationDelay: "0.15s" }}>
              <h1 className="display-xl text-paper whitespace-pre-line">
                {homepage.hero?.headline || "Wear your design."}
              </h1>

              {homepage.hero?.subheadline ? (
                <p className="mt-8 max-w-md text-paper/70 leading-relaxed whitespace-pre-line">
                  {homepage.hero.subheadline}
                </p>
              ) : null}

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to={(homepage.hero?.cta_link as any) || "/products"}
                  className="group inline-flex items-center gap-3 bg-paper text-noir px-7 py-4 eyebrow hover:bg-cream transition-colors"
                >
                  {homepage.hero?.cta_label || "Shop the Collection"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/customize"
                  className="inline-flex items-center gap-3 border border-paper/40 text-paper px-7 py-4 eyebrow hover:border-paper transition"
                >
                  Customise Now
                </Link>
              </div>
            </div>

            <div
              className="mt-10 flex items-center gap-6 text-xs text-paper/50 fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-paper text-paper" />
                ))}
              </div>
              <div>4.9 · TESEZ customer favourites</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      {marqueeItems.length > 0 && (
        <section className="border-y border-border bg-background py-5 overflow-hidden">
          <div className="marquee-track eyebrow text-foreground/70">
            {[...Array(2)].flatMap((_, i) =>
              marqueeItems.flatMap((item, j) => [
                <span key={`${i}-${j}-txt`}>{item}</span>,
                <span key={`${i}-${j}-sep`}>—</span>,
              ])
            )}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {/* CATEGORIES */}
      <section className="container-luxe py-24 md:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow text-muted-foreground">01 — Categories</div>
            <h2 className="display-lg mt-3">The catalogue.</h2>
          </div>
          <Link to="/categories" className="hidden md:inline link-underline eyebrow">
            All Categories →
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-muted-foreground">No categories added yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {categories.map((c) => {
              const image = resolveStorageUrl(c.image_url, "category-images");

              return (
                <Link
                  key={c.id}
                  to="/products"
                  search={{ category: c.slug }}
                  className="group relative overflow-hidden aspect-square"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="h-full w-full bg-cream" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 text-paper">
                    <div className="eyebrow opacity-70">
                      {c.coming_soon ? "Coming Soon" : "Shop"}
                    </div>
                    <div className="font-display text-xl md:text-2xl mt-1">
                      {c.name}
                    </div>
                    {c.tagline ? (
                      <div className="text-xs opacity-70 mt-1 hidden md:block">
                        {c.tagline}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      {/* BEST SELLERS */}
      <Showcase eyebrow="02 — Best Sellers" title="What the studio can't keep in stock." items={best} />

      {/* CUSTOMIZE BLOCK */}
      <section className="bg-cream py-24 md:py-32">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
            {best[1]?.image ? (
              <img
                src={resolveStorageUrl(best[1].image, "product-images") ?? ""}
                alt="Customisation studio"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-cream" />
            )}
          </div>

          <div>
            <div className="eyebrow text-muted-foreground">03 — Studio</div>
            <h2 className="display-lg mt-3">
              Design it. <span className="italic">Live.</span>
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
              Upload artwork, set type, drag, scale, rotate. Our real-time mockup
              shows you what your garment will look like — front, back, full bleed.
            </p>

            <Link
              to="/customize"
              className="mt-10 inline-flex items-center gap-3 bg-noir text-paper px-7 py-4 eyebrow hover:opacity-90 transition"
            >
              Open the Studio <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Showcase eyebrow="04 — Trending" title="On rotation right now." items={trending} />

      {/* LIFESTYLE BANNER */}
      <section className="relative h-[70vh] overflow-hidden">
        {lifestyleImage ? (
          <img
            src={lifestyleImage}
            alt="Lifestyle banner"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-noir/70 via-noir/30 to-transparent" />
        <div className="relative container-luxe h-full flex items-center">
          <div className="text-paper max-w-xl">
            <div className="eyebrow opacity-70">Why TESEZ</div>
            <h2 className="display-lg mt-3 whitespace-pre-line">
              {homepage.lifestyle?.tagline || "Quiet weight.\nLoud presence."}
            </h2>
            <p className="mt-6 opacity-80">
              Heavyweight fabrics, studio-grade prints, considered fits. No filler.
            </p>
            <Link to="/about" className="mt-8 inline-block eyebrow link-underline">
              Our Process →
            </Link>
          </div>
        </div>
      </section>

      <Showcase eyebrow="05 — New Arrivals" title="Just landed." items={fresh} />

      {/* VALUES - kept static */}
      <section className="container-luxe py-24 md:py-32 grid md:grid-cols-4 gap-10">
        {[
          ["240 GSM+", "Heavyweight combed cotton, garment-dyed for depth."],
          ["Studio Print", "DTG and screen, finished by hand."],
          ["48-Hour Ship", "Dispatched from our atelier within two days."],
          ["Made to Last", "Reinforced seams. Built for ten years of wear."],
        ].map(([t, d]) => (
          <div key={t}>
            <div className="font-display text-3xl">{t}</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </section>

      {/* REVIEWS / TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="bg-noir text-paper py-24 md:py-32">
          <div className="container-luxe">
            <div className="eyebrow text-paper/50">06 — From the Wardrobe</div>
            <h2 className="display-lg mt-3 max-w-3xl">What people are saying.</h2>

            <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {testimonials.map((r, idx) => (
                <div key={`${r.name}-${idx}`} className="border-t border-paper/15 pt-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(Number(r.rating || 5))].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-paper text-paper" />
                    ))}
                  </div>
                  <p className="text-paper/80 leading-relaxed">"{r.text}"</p>
                  <div className="mt-6 eyebrow text-paper/50">
                    {r.name}
                    {r.city ? ` · ${r.city}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JOURNAL */}
      <section className="bg-cream py-24 md:py-32">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="eyebrow text-muted-foreground">07 — Journal</div>
              <h2 className="display-lg mt-3">Field notes.</h2>
            </div>
            <Link to="/blog" className="hidden md:inline link-underline eyebrow">
              All Stories →
            </Link>
          </div>

          {blogs.length === 0 ? (
            <div className="text-muted-foreground">No published blog posts yet.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {blogs.map((p) => {
                const image = resolveStorageUrl(p.featured_image, "blog-images");

                return (
                  <Link
                    key={p.id}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="group"
                  >
                    <div className="aspect-[4/3] bg-noir/5 overflow-hidden mb-5">
                      {image ? (
                        <img
                          src={image}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-cream" />
                      )}
                    </div>

                    <div className="eyebrow text-muted-foreground">
                      {p.category || "Journal"}
                      {p.read_time ? ` · ${p.read_time}` : ""}
                    </div>

                    <h3 className="font-display text-2xl mt-2 leading-tight">
                      {p.title}
                    </h3>

                    {p.excerpt ? (
                      <p className="text-sm text-muted-foreground mt-3">
                        {p.excerpt}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section className="container-luxe py-28 text-center">
        <div className="eyebrow text-muted-foreground">08 - Get in Touch</div>
        <h2 className="display-lg mt-4 max-w-3xl mx-auto">
          Let's create something <br />
          <span className="italic">extraordinary.</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Have a question, custom order, or collaboration idea? 
          We'd love to hear from you.
        </p>

        <Link
          to="/contact"
          className="mt-10 inline-block bg-noir text-paper px-12 py-4 eyebrow hover:opacity-90 transition"
        >
          Contact Us →
        </Link>
      </section>
    </div>
  );
}

function Showcase({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: CardProduct[];
}) {
  if (!items.length) return null;

  return (
    <section className="container-luxe py-24 md:py-32">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="eyebrow text-muted-foreground">{eyebrow}</div>
          <h2 className="display-lg mt-3">{title}</h2>
        </div>
        <Link to="/products" className="hidden md:inline link-underline eyebrow">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
        {items.map((p) => (
          <ProductCard key={`${p.slug}-${eyebrow}`} p={p} />
        ))}
      </div>
    </section>
  );
}