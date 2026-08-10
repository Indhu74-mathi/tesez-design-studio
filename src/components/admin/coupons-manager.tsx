import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Modal, Input, Select } from "./ui";

const empty = { code: "", type: "percent", value: 10, min_subtotal: null as number | null, max_uses: null as number | null, expires_at: "", is_active: true };

export function CouponsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(empty);

  async function load() {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.code) return toast.error("Code required");
    const payload = {
      ...editing,
      code: editing.code.toUpperCase().trim(),
      value: Number(editing.value),
      min_subtotal: editing.min_subtotal ? Number(editing.min_subtotal) : null,
      max_uses: editing.max_uses ? Number(editing.max_uses) : null,
      expires_at: editing.expires_at || null,
    };
    const op = editing.id
      ? supabase.from("coupons").update(payload).eq("id", editing.id)
      : (() => { const { id: _o, used_count: _u, ...ins } = payload; return supabase.from("coupons").insert(ins); })();
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    setOpen(false);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  }

  return (
    <>
      <PanelHeader
        eyebrow="Promotions"
        title="Coupons."
        action={
          <button onClick={() => { setEditing({ ...empty }); setOpen(true); }} className="flex items-center gap-2 bg-noir text-paper px-5 py-3 eyebrow">
            <Plus className="h-3 w-3" /> New coupon
          </button>
        }
      />

      <div className="bg-paper border border-border">
        <table className="w-full text-sm">
          <thead className="text-left eyebrow text-muted-foreground border-b border-border">
            <tr><th className="p-4">Code</th><th>Type</th><th>Value</th><th>Used / Max</th><th>Expires</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-4 font-mono">{c.code}</td>
                <td className="capitalize">{c.type}</td>
                <td>{c.type === "percent" ? `${c.value}%` : `₹${c.value}`}</td>
                <td>{c.used_count} / {c.max_uses ?? "∞"}</td>
                <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                <td>{c.is_active ? "Yes" : "No"}</td>
                <td className="text-right pr-4">
                  <button onClick={() => { setEditing({ ...c, expires_at: c.expires_at ? c.expires_at.slice(0,10) : "" }); setOpen(true); }} className="p-2"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => del(c.id)} className="p-2"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No coupons.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing.id ? "Edit coupon" : "New coupon"}>
        <div className="space-y-4">
          <Input label="Code" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed ₹ off</option>
            </Select>
            <Input label={editing.type === "percent" ? "Percent (%)" : "Amount (₹)"} type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
            <Input label="Min subtotal (₹)" type="number" value={editing.min_subtotal ?? ""} onChange={(e) => setEditing({ ...editing, min_subtotal: e.target.value })} />
            <Input label="Max uses" type="number" value={editing.max_uses ?? ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value })} />
          </div>
          <Input label="Expires on" type="date" value={editing.expires_at ?? ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setOpen(false)} className="px-5 py-3 eyebrow">Cancel</button>
            <button onClick={save} className="bg-noir text-paper px-6 py-3 eyebrow">Save</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
