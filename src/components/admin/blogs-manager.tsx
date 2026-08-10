import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input, Textarea, Select, Modal, PanelHeader, MediaUploader } from "./ui";

const empty = {
  title: "", slug: "", excerpt: "", content: "", category: "Styling",
  featured_image: null as string | null, status: "draft", read_time: "5 min",
  meta_title: "", meta_description: "",
};

export function BlogsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  async function load() {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.title || !editing.slug) return toast.error("Title and slug required");
    const payload = { ...editing, published_at: editing.status === "published" ? (editing.published_at ?? new Date().toISOString()) : null };
    const op = editing.id
      ? supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : (() => { const { id: _o, ...ins } = payload; return supabase.from("blog_posts").insert(ins); })();
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    setOpen(false);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    load();
  }

  return (
    <>
      <PanelHeader
        eyebrow="Journal"
        title="Blog posts."
        action={
          <button onClick={() => { setEditing({ ...empty }); setOpen(true); }} className="flex items-center gap-2 bg-noir text-paper px-5 py-3 eyebrow">
            <Plus className="h-3 w-3" /> New post
          </button>
        }
      />

      <div className="bg-paper border border-border">
        <table className="w-full text-sm">
          <thead className="text-left eyebrow text-muted-foreground border-b border-border">
            <tr><th className="p-4">Title</th><th>Category</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.slug}</div>
                </td>
                <td>{p.category}</td>
                <td><span className="text-xs px-2 py-1 bg-cream capitalize">{p.status}</span></td>
                <td className="text-right pr-4">
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="p-2"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)} className="p-2"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No posts yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal wide open={open} onClose={() => setOpen(false)} title={editing.id ? "Edit post" : "New post"}>
        <div className="space-y-4">
          <Input label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Input label="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            <Input label="Read time" value={editing.read_time ?? ""} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} />
          </div>
          <Textarea label="Excerpt" value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
          <Textarea label="Content (Markdown / HTML)" value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="min-h-[200px] font-mono text-sm" />
          <div>
            <div className="eyebrow text-muted-foreground mb-2">Featured image</div>
            <MediaUploader bucket="blog-images" value={editing.featured_image} onChange={(url) => setEditing({ ...editing, featured_image: url })} folder="posts" />
          </div>
          <Select label="Status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <div className="border-t border-border pt-4 space-y-3">
            <div className="eyebrow text-muted-foreground">SEO</div>
            <Input label="Meta title" value={editing.meta_title ?? ""} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
            <Textarea label="Meta description" value={editing.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
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
