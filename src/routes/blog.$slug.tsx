import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/storage";

type BlogPostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  read_time?: string | null;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  status?: string | null;
};

type RelatedBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
  read_time?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        category,
        read_time,
        featured_image,
        meta_title,
        meta_description,
        published_at,
        created_at,
        status
      `)
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      throw notFound();
    }

    return { post: data as BlogPostDetail };
  },

  head: ({ loaderData }) => {
    if (!loaderData?.post) return { meta: [] };

    const post = loaderData.post;
    const image = resolveStorageUrl(post.featured_image, "blog-images");

    return {
      meta: [
        {
          title: post.meta_title?.trim() || `${post.title} — TESEZ Journal`,
        },
        {
          name: "description",
          content:
            post.meta_description?.trim() ||
            post.excerpt ||
            "Read the latest journal post from TESEZ.",
        },
        { property: "og:title", content: post.title },
        ...(image ? [{ property: "og:image", content: image }] : []),
      ],
    };
  },

  component: BlogDetailPage,
  notFoundComponent: () => (
    <div className="container-luxe py-32 text-center">Story not found</div>
  ),
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">Could not load</div>
  ),
});

function BlogDetailPage() {
  const { post } = Route.useLoaderData();
  const [related, setRelated] = useState<RelatedBlogPost[]>([]);

  useEffect(() => {
    loadRelated();
  }, [post.id]);

  async function loadRelated() {
    const { data } = await supabase
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
        created_at
      `)
      .eq("status", "published")
      .neq("id", post.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(3);

    setRelated((data ?? []) as RelatedBlogPost[]);
  }

  const heroImage = resolveStorageUrl(post.featured_image, "blog-images");
  const dateLabel = formatBlogDate(post.published_at ?? post.created_at);

  return (
    <article>
      <div className="container-luxe pt-16 pb-10 max-w-4xl">
        <div className="eyebrow text-muted-foreground">
          {post.category || "Journal"}
          {dateLabel ? ` · ${dateLabel}` : ""}
          {post.read_time ? ` · ${post.read_time}` : ""}
        </div>

        <h1 className="display-xl mt-4">{post.title}</h1>

        {post.excerpt ? (
          <p className="mt-6 text-xl text-muted-foreground">{post.excerpt}</p>
        ) : null}
      </div>

      {heroImage ? (
        <div className="container-luxe">
          <img
            src={heroImage}
            alt={post.title}
            className="w-full aspect-[16/8] object-cover"
          />
        </div>
      ) : null}

      <div className="container-luxe py-16">
        <div className="max-w-5xl mx-auto">
          {post.content ? (
            isHtmlContent(post.content) ? (
              <div
                className="prose prose-lg max-w-none prose-headings:font-display prose-p:text-foreground/85 prose-p:leading-9 prose-p:mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div className="text-[22px] leading-[1.95] text-foreground/85">
                {post.content
                  .split(/\n\s*\n/)
                  .map((para, idx) => para.trim())
                  .filter(Boolean)
                  .map((para, idx) => (
                    <p key={idx} className="mb-10">
                      {para}
                    </p>
                  ))}
              </div>
            )
          ) : (
            <p className="text-lg leading-relaxed text-muted-foreground">
              No content added for this post yet.
            </p>
          )}

          <Link to="/blog" className="mt-14 inline-block eyebrow link-underline">
            ← All Stories
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-luxe pb-32">
          <h2 className="display-lg mb-12">More stories.</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {related.map((item) => {
              const img = resolveStorageUrl(item.featured_image, "blog-images");

              return (
                <Link
                  key={item.id}
                  to="/blog/$slug"
                  params={{ slug: item.slug }}
                  className="group block"
                >
                  <div className="aspect-[4/3] bg-cream overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                        Image unavailable
                      </div>
                    )}
                  </div>

                  <div className="mt-4 eyebrow text-muted-foreground">
                    {item.category || "Journal"}
                  </div>

                  <h3 className="font-display text-2xl mt-2 leading-tight">
                    {item.title}
                  </h3>

                  {item.excerpt ? (
                    <p className="mt-2 text-muted-foreground line-clamp-3">
                      {item.excerpt}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}

function isHtmlContent(content?: string | null) {
  if (!content) return false;
  return /<\/?[a-z][\s\S]*>/i.test(content);
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