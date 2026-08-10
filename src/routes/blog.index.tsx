import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/storage";

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

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Journal — TESEZ" },
      {
        name: "description",
        content:
          "Field notes on fashion, fabric, printing, and the discipline of restraint.",
      },
    ],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);

    try {
      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Blog list fetch error:", error);
        setPosts([]);
        return;
      }

      setPosts((data ?? []) as BlogPostRow[]);
    } catch (err) {
      console.error("Blog list crashed:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-luxe pt-16 pb-32">
      <div className="eyebrow text-muted-foreground">Journal</div>
      <h1 className="display-xl mt-4">Field notes.</h1>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No blog posts published yet.
        </div>
      ) : (
        <div className="mt-16 grid md:grid-cols-2 gap-10 lg:gap-14">
          {posts.map((post, i) => {
            const image = resolveStorageUrl(post.featured_image, "blog-images");
            const dateLabel = formatBlogDate(post.published_at ?? post.created_at);

            return (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className={`group block ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <div
                  className={`overflow-hidden bg-cream mb-6 ${
                    i === 0 ? "aspect-[16/7]" : "aspect-[4/3]"
                  }`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
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

                <div className="eyebrow text-muted-foreground">
                  {post.category || "Journal"}
                  {dateLabel ? ` · ${dateLabel}` : ""}
                  {post.read_time ? ` · ${post.read_time}` : ""}
                </div>

                <h2
                  className={`font-display mt-3 leading-tight ${
                    i === 0 ? "text-5xl" : "text-3xl"
                  }`}
                >
                  {post.title}
                </h2>

                {post.excerpt ? (
                  <p className="mt-3 text-muted-foreground max-w-xl">
                    {post.excerpt}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatBlogDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}