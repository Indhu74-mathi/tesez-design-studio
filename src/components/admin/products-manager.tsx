import { useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Input,
  Modal,
  MultiMediaUploader,
  PanelHeader,
  Select,
  Textarea,
} from "./ui";
import { resolveStorageUrl, getFirstProductImage } from "@/lib/storage";

const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;
const COLORS = [
  "Black",
  "White",
  "Navy",
  "Grey",
  "Maroon",
  "Olive",
  "Beige",
  "Crimson",
] as const;

type ProductStatus = "draft" | "active" | "archived";

type Category = {
  id: string;
  name: string;
};

type ProductImageRow = {
  url: string | null;
};

type ProductRow = {
  id?: string;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  material?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  stock_quantity: number | string;
  status: ProductStatus;
  category_id?: string | null;
  colors?: string[];
  sizes?: string[];
  badge?: string | null;
  featured?: boolean;
  cover_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  product_images?: ProductImageRow[];
  size_prices?: {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
  XXXL: number;
};
};

const EMPTY_PRODUCT: ProductRow = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  material: "",
  price: 0,
  compare_at_price: null,
  stock_quantity: 0,
  status: "draft",
  category_id: null,
  colors: [],
  sizes: [],
  badge: "",
  featured: false,
  cover_image: null,
  meta_title: "",
  meta_description: "",
  product_images: [],
  size_prices: {
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
  XXXL: 0,
},
};

function formatINR(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `₹${n.toLocaleString("en-IN")}`;
}

function ProductThumb({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  const finalSrc = useMemo(() => {
    if (failed) return null;
    return resolveStorageUrl(src, "product-images");
  }, [src, failed]);

  if (!finalSrc) {
    return (
      <div className="w-10 h-12 bg-cream border border-border flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-[0.18em]">
        TESEZ
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={() => {
        console.error("Admin product thumb failed:", alt, finalSrc);
        setFailed(true);
      }}
      className="w-10 h-12 object-cover bg-cream border border-border"
    />
  );
}

export function ProductsManager() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow>(EMPTY_PRODUCT);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        return;
      }

      const mapped: ProductRow[] = (data ?? []).map((p: any) => {
        const galleryUrls = (p.product_images ?? [])
          .map((img: any) => img?.url)
          .filter(Boolean);

        return {
          ...p,
          status: (p.status ?? "draft") as ProductStatus,
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          product_images: p.product_images ?? [],
          cover_image: getFirstProductImage(p.cover_image, galleryUrls),
          size_prices: p.size_prices ?? {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          XXL: 0,
          XXXL: 0,
          },
        };
      });

      setItems(mapped);

      const { data: categoryData, error: catErr } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (catErr) {
        toast.error(catErr.message);
        return;
      }

      setCats(categoryData ?? []);
    } catch (err: any) {
      console.error("Products load failed:", err);
      toast.error(err?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openEdit(p: ProductRow) {
    try {
      setEditing({
        ...EMPTY_PRODUCT,
        ...p,
        status: (p.status ?? "draft") as ProductStatus,
        colors: p.colors ?? [],
        sizes: p.sizes ?? [],
      });

      if (!p.id) {
        setGallery([]);
        setOpen(true);
        return;
      }

      const { data, error } = await supabase
        .from("product_images")
        .select("url")
        .eq("product_id", p.id)
        .order("sort_order");

      if (error) {
        toast.error(error.message);
        return;
      }

      setGallery((data ?? []).map((r: any) => r.url).filter(Boolean));
      setOpen(true);
    } catch (err: any) {
      console.error("openEdit failed:", err);
      toast.error(err?.message ?? "Failed to open product");
    }
  }

  function openNew() {
    setEditing({ ...EMPTY_PRODUCT });
    setGallery([]);
    setOpen(true);
  }

  async function save() {
    if (!editing.name.trim() || !editing.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);

    try {
      const normalizedGallery = (gallery ?? [])
        .map((url) => (url ?? "").trim())
        .filter(Boolean);

      const finalCover =
        getFirstProductImage(editing.cover_image, normalizedGallery) ?? null;

      const payload = {
        name: editing.name.trim(),
        slug: editing.slug.trim(),
        sku: editing.sku?.trim() || null,
        description: editing.description?.trim() || "",
        material: editing.material?.trim() || "",
        price: Number(editing.price || 0),
        compare_at_price:
          editing.compare_at_price !== "" &&
          editing.compare_at_price !== null &&
          editing.compare_at_price !== undefined
            ? Number(editing.compare_at_price)
            : null,
        stock_quantity: Number(editing.stock_quantity || 0),
        status: editing.status as ProductStatus,
        category_id: editing.category_id || null,
        colors: editing.colors ?? [],
        sizes: editing.sizes ?? [],
        badge: editing.badge?.trim() || null,
        featured: !!editing.featured,
        cover_image: finalCover,
        meta_title: editing.meta_title?.trim() || "",
        meta_description: editing.meta_description?.trim() || "",
        size_prices: editing.size_prices,
      };

      let productId = editing.id;

      if (editing.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editing.id);

        if (error) {
          toast.error(error.message);
          return;
        }
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          toast.error(error.message);
          return;
        }

        productId = data.id;
      }

      if (!productId) {
        toast.error("Product ID missing after save");
        return;
      }

      // delete old gallery rows
      const { error: delErr } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      if (delErr) {
        toast.error(delErr.message);
        return;
      }

      // insert new gallery rows
      if (normalizedGallery.length > 0) {
        const galleryRows = normalizedGallery.map((url, i) => ({
          product_id: productId as string,
          url,
          sort_order: i,
          alt: null,
        }));

        const { error: imgErr } = await supabase
          .from("product_images")
          .insert(galleryRows);

        if (imgErr) {
          toast.error(imgErr.message);
          return;
        }
      }

      toast.success("Product saved successfully.");
      setOpen(false);
      setEditing({ ...EMPTY_PRODUCT });
      setGallery([]);
      await load();
    } catch (err: any) {
      console.error("save failed:", err);
      toast.error(err?.message ?? "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Deleted.");
      await load();
    } catch (err: any) {
      console.error("delete failed:", err);
      toast.error(err?.message ?? "Failed to delete product");
    }
  }

  return (
    <>
      <PanelHeader
        eyebrow="Catalog"
        title="Products."
        action={
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-noir text-paper px-5 py-3 eyebrow"
          >
            <Plus className="h-3 w-3" /> Add product
          </button>
        }
      />

      <div className="bg-paper border border-border">
        <table className="w-full text-sm">
          <thead className="text-left eyebrow text-muted-foreground border-b border-border">
            <tr>
              <th className="p-4">Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-muted-foreground"
                >
                  Loading products...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-muted-foreground"
                >
                  No products yet.
                </td>
              </tr>
            ) : (
              items.map((p) => {
                const galleryUrls = (p.product_images ?? [])
                  .map((x) => x.url)
                  .filter(Boolean) as string[];

                const thumb = getFirstProductImage(p.cover_image, galleryUrls);

                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProductThumb src={thumb} alt={p.name} />

                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{p.sku ?? "—"}</td>
                    <td>{formatINR(p.price)}</td>
                    <td>{Number(p.stock_quantity ?? 0)}</td>
                    <td>
                      <span className="text-xs px-2 py-1 bg-cream capitalize">
                        {p.status}
                      </span>
                    </td>

                    <td className="text-right pr-4">
                      <button onClick={() => openEdit(p)} className="p-2">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => p.id && del(p.id)}
                        className="p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        wide
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing({ ...EMPTY_PRODUCT });
          setGallery([]);
        }}
        title={editing.id ? "Edit product" : "New product"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <Input
              label="Slug"
              value={editing.slug}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
            />

            <Input
              label="SKU"
              value={editing.sku ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, sku: e.target.value })
              }
            />

            <Input
              label="Badge (optional)"
              value={editing.badge ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, badge: e.target.value })
              }
            />

            <Input
              label="Price (₹)"
              type="number"
              value={editing.price}
              onChange={(e) =>
                setEditing({ ...editing, price: e.target.value })
              }
            />

            <Input
              label="Compare-at price (₹)"
              type="number"
              value={editing.compare_at_price ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  compare_at_price: e.target.value,
                })
              }
            />

            <Input
              label="Stock quantity"
              type="number"
              value={editing.stock_quantity}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  stock_quantity: e.target.value,
                })
              }
            />

            <Select
              label="Status"
              value={editing.status}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  status: e.target.value as ProductStatus,
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>

            <Select
              label="Category"
              value={editing.category_id ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category_id: e.target.value || null,
                })
              }
            >
              <option value="">— None —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Input
              label="Material"
              value={editing.material ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, material: e.target.value })
              }
            />
          </div>

          <Textarea
            label="Description"
            value={editing.description ?? ""}
            onChange={(e) =>
              setEditing({ ...editing, description: e.target.value })
            }
          />

          <div>
            <div className="eyebrow text-muted-foreground mb-2">Sizes</div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const on = editing.sizes?.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        sizes: on
                          ? (editing.sizes ?? []).filter((x) => x !== s)
                          : [...(editing.sizes ?? []), s],
                      })
                    }
                    className={`px-3 py-1 text-xs border ${
                      on
                        ? "bg-noir text-paper border-noir"
                        : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">

            <div className="px-4 py-3 bg-cream border-b font-medium">
              Size Wise Price
            </div>

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left p-3 border">
                    Size
                  </th>

                  <th className="text-left p-3 border">
                    Price (₹)
                  </th>

                </tr>

              </thead>

              <tbody>

                {SIZES.map((size) => (

                  <tr key={size}>

                    <td className="border p-3 font-medium">

                      {size}

                    </td>

                    <td className="border p-2">

                      <Input

                        type="number"

                        value={
                          editing.size_prices?.[
                            size as keyof typeof editing.size_prices
                          ] ?? 0
                        }

                        onChange={(e)=>

                          setEditing({

                            ...editing,

                            size_prices:{

                              ...(editing.size_prices ?? {
                                S:0,
                                M:0,
                                L:0,
                                XL:0,
                                XXL:0,
                                XXXL:0,
                              }),

                              [size]:Number(e.target.value)

                            }

                          })

                        }

                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        
          <div>
            <div className="eyebrow text-muted-foreground mb-2">Colors</div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => {
                const on = editing.colors?.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        colors: on
                          ? (editing.colors ?? []).filter((x) => x !== c)
                          : [...(editing.colors ?? []), c],
                      })
                    }
                    className={`px-3 py-1 text-xs border ${
                      on
                        ? "bg-noir text-paper border-noir"
                        : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="eyebrow text-muted-foreground mb-2">
              Gallery (first image is cover)
            </div>
            <MultiMediaUploader
              bucket="product-images"
              folder="products"
              values={gallery}
              onChange={setGallery}
            />
          </div>

          <div className="border-t border-border pt-4">
            <div className="eyebrow text-muted-foreground mb-3">SEO</div>

            <Input
              label="Meta title"
              value={editing.meta_title ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, meta_title: e.target.value })
              }
            />

            <div className="h-3" />

            <Textarea
              label="Meta description"
              value={editing.meta_description ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  meta_description: e.target.value,
                })
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!editing.featured}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  featured: e.target.checked,
                })
              }
            />
            Featured on homepage
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => {
                setOpen(false);
                setEditing({ ...EMPTY_PRODUCT });
                setGallery([]);
              }}
              className="px-5 py-3 eyebrow"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={save}
              disabled={saving}
              className="bg-noir text-paper px-6 py-3 eyebrow disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save product"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}