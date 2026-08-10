import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Modal, Input, Select, MediaUploader } from "./ui";

const DESIGN_CATEGORIES = [
  "Minimal", "Luxury", "Typography", "Anime", "Gaming",
  "Fitness", "Travel", "Music", "Streetwear", "Vintage",
  "Corporate", "Motivational", "Trending",
];

export function DesignsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", file_url: null as string | null, file_type: "image/png", category: "Minimal" });

  async function load() {
    const { data } = await supabase.from("designs").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name || !form.file_url) return toast.error("Name and file required");
    const { error } = await supabase.from("designs").insert({
      name: form.name, file_url: form.file_url, file_type: form.file_type, category: form.category,
    });
    if (error) return toast.error(error.message);
    toast.success("Design added.");
    setOpen(false);
    setForm({ name: "", file_url: null, file_type: "image/png", category: "Minimal" });
    load();
  }

  async function toggle(d: any) {
    await supabase.from("designs").update({ is_active: !d.is_active }).eq("id", d.id);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete design?")) return;
    await supabase.from("designs").delete().eq("id", id);
    load();
  }

  const shown = items.filter((d) => filter === "All" || d.category === filter);

  return (
    <>
      <PanelHeader
        eyebrow="Design Library"
        title="Designs."
        action={
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-noir text-paper px-5 py-3 eyebrow">
            <Plus className="h-3 w-3" /> Upload design
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...DESIGN_CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1 text-xs border ${filter === c ? "bg-noir text-paper border-noir" : "border-border"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shown.map((d) => (
          <div key={d.id} className="bg-paper border border-border">
            <div className="aspect-square bg-cream flex items-center justify-center p-3">
              <img src={d.file_url} alt={d.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="p-3">
              <div className="text-xs font-medium truncate">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.category}</div>
              <div className="flex justify-between mt-2">
                <button onClick={() => toggle(d)} className="p-1">
                  {d.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                </button>
                <button onClick={() => del(d.id)} className="p-1"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <div className="col-span-6 text-center py-12 text-muted-foreground">No designs.</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Upload design">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {DESIGN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div>
            <div className="eyebrow text-muted-foreground mb-2">File (PNG / JPG / SVG)</div>
            <MediaUploader
              bucket="design-library"
              accept="image/png,image/jpeg,image/svg+xml"
              value={form.file_url}
              onChange={(url) => setForm({ ...form, file_url: url, file_type: url?.endsWith(".svg") ? "image/svg+xml" : url?.endsWith(".jpg") || url?.endsWith(".jpeg") ? "image/jpeg" : "image/png" })}
              folder={form.category.toLowerCase()}
            />
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
