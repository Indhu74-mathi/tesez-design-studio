import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input, Modal, PanelHeader, MediaUploader } from "./ui";

const empty = { name: "", slug: "", tagline: "", image_url: null as string | null, sort_order: 0, is_active: true, coming_soon: false };

export function CategoriesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  async function load() {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.name || !editing.slug) return toast.error("Name and slug required");
    const payload = { ...editing, sort_order: Number(editing.sort_order) || 0 };
    const fn = editing.id
      ? supabase.from("categories").update(payload).eq("id", editing.id)
      : (() => { const { id: _o, ...ins } = payload; return supabase.from("categories").insert(ins); })();
    const { error } = await fn;
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    setOpen(false);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <>
      <PanelHeader
        eyebrow="Catalog"
        title="Categories."
        action={
          <button onClick={() => { setEditing({ ...empty }); setOpen(true); }} className="flex items-center gap-2 bg-noir text-paper px-5 py-3 eyebrow">
            <Plus className="h-3 w-3" /> Add category
          </button>
        }
      />
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="bg-paper border border-border overflow-hidden">
            {c.image_url && <img src={c.image_url} alt="" className="w-full h-40 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-xl">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.tagline}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setOpen(true); }} className="p-2"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => del(c.id)} className="p-2"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {!c.is_active && <span className="bg-cream px-2 py-1">Hidden</span>}
                {c.coming_soon && <span className="bg-cream px-2 py-1">Coming soon</span>}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No categories yet.</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing.id ? "Edit category" : "New category"}>
        <div className="space-y-4">
          <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <Input label="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
          <Input label="Tagline" value={editing.tagline ?? ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
          <Input label="Sort order" type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
          <div>
            <div className="eyebrow text-muted-foreground mb-2">Image</div>
            <MediaUploader bucket="category-images" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="categories" />
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.coming_soon} onChange={(e) => setEditing({ ...editing, coming_soon: e.target.checked })} /> Coming soon</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setOpen(false)} className="px-5 py-3 eyebrow">Cancel</button>
            <button onClick={save} className="bg-noir text-paper px-6 py-3 eyebrow">Save</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
