import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatINR, COLORS } from "@/lib/catalog";
import { resolveStorageUrl } from "@/lib/storage";

export type CardProduct = {
  id?: string;
  slug: string;
  name: string;
  price: number;
  compareAt?: number;
  image: string | null;
  gallery?: string[];
  colors?: string[];
  badge?: string;
};

export function ProductCard({ p }: { p: CardProduct }) {
  const [failed, setFailed] = useState(false);

  const image = useMemo(() => {
    if (failed || !p.image) return null;
    return resolveStorageUrl(p.image, "product-images");
  }, [p.image, failed]);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        {p.badge && (
          <span className="absolute top-4 left-4 z-10 eyebrow bg-paper/90 text-noir px-2.5 py-1 backdrop-blur">
            {p.badge}
          </span>
        )}

        {image ? (
          <img
            src={image}
            alt={p.name}
            loading="lazy"
            onError={() => {
              console.error("Product image failed:", p.name, image);
              setFailed(true);
            }}
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

        <div className="absolute inset-x-4 bottom-4 flex translate-y-2 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            className="flex-1 bg-noir text-paper text-xs tracking-[0.2em] uppercase py-3 hover:bg-foreground transition"
          >
            Quick View
          </button>
        </div>
      </div>

      <div className="pt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-medium tracking-tight">{p.name}</h3>

          {!!p.colors?.length && (
            <div className="mt-2 flex gap-1.5">
              {p.colors.map((c) => {
                const col = COLORS.find((x) => x.name === c);
                return (
                  <span
                    key={c}
                    title={c}
                    className="h-2.5 w-2.5 rounded-full border border-black/10"
                    style={{ background: col?.hex }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[15px] font-medium">{formatINR(p.price)}</div>
          {p.compareAt ? (
            <div className="text-xs text-muted-foreground line-through">
              {formatINR(p.compareAt)}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}