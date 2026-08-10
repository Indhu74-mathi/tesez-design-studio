import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Modal, Select } from "./ui";

const STATUSES = ["processing", "payment_confirmed", "printing", "quality_check", "packed", "shipped", "delivered", "cancelled"] as const;

export function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function openOrder(o: any) {
    setActive(o);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", o.id);
    setItems(data ?? []);
    setOpen(true);
  }

  async function updateStatus(status: string) {
    if (!active) return;
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success("Status updated.");
    setActive({ ...active, status });
    load();
  }

  function downloadInvoice() {
    if (!active) return;
    const html = `
<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${active.order_number}</title>
<style>body{font-family:-apple-system,sans-serif;padding:48px;color:#111}h1{font-weight:300;letter-spacing:.3em;font-size:14px}h2{font-weight:400;font-size:28px;margin:8px 0 24px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:8px;border-bottom:1px solid #eee}th{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#666}</style>
</head><body>
<h1>TESEZ</h1><h2>Invoice — ${active.order_number}</h2>
<div class="row"><span>Customer</span><span>${active.customer_name ?? ""}</span></div>
<div class="row"><span>Email</span><span>${active.customer_email ?? ""}</span></div>
<div class="row"><span>Status</span><span>${active.status}</span></div>
<div class="row"><span>Date</span><span>${new Date(active.created_at).toLocaleString()}</span></div>
<table><thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
<tbody>${items.map((i) => `<tr><td>${i.product_name}</td><td>${i.size ?? "—"}</td><td>${i.quantity}</td><td>₹${i.unit_price}</td><td>₹${i.unit_price * i.quantity}</td></tr>`).join("")}</tbody></table>
<div style="margin-top:24px"><div class="row"><span>Subtotal</span><span>₹${active.subtotal}</span></div>
<div class="row"><span>Discount</span><span>−₹${active.discount}</span></div>
<div class="row"><span>Shipping</span><span>₹${active.shipping}</span></div>
<div class="row" style="font-size:20px"><strong>Total</strong><strong>₹${active.total}</strong></div></div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `invoice-${active.order_number}.html`; a.click();
    URL.revokeObjectURL(url);
  }

  const shown = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <>
      <PanelHeader eyebrow="Commerce" title="Orders." />
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs border capitalize ${filter === s ? "bg-noir text-paper border-noir" : "border-border"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="bg-paper border border-border">
        <table className="w-full text-sm">
          <thead className="text-left eyebrow text-muted-foreground border-b border-border">
            <tr><th className="p-4">Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="text-right pr-4">Total</th></tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} onClick={() => openOrder(o)} className="border-b border-border last:border-0 cursor-pointer hover:bg-cream">
                <td className="p-4 font-medium">{o.order_number}</td>
                <td>{o.customer_name ?? "—"}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td><span className="text-xs px-2 py-1 bg-cream capitalize">{o.status.replace("_", " ")}</span></td>
                <td className="text-right pr-4">₹{Number(o.total).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No orders.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal wide open={open} onClose={() => setOpen(false)} title={active ? `Order ${active.order_number}` : ""}>
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="eyebrow text-muted-foreground">Customer</div><div className="mt-1">{active.customer_name}</div><div className="text-muted-foreground">{active.customer_email}</div><div className="text-muted-foreground">{active.customer_phone}</div></div>
              <div><div className="eyebrow text-muted-foreground">Shipping</div><div className="mt-1 text-muted-foreground whitespace-pre-line">{active.shipping_address ? JSON.stringify(active.shipping_address, null, 2) : "—"}</div></div>
            </div>
            <table className="w-full text-sm border-t border-border">
              <thead className="text-left eyebrow text-muted-foreground"><tr><th className="py-3">Item</th><th>Size</th><th>Qty</th><th className="text-right">Total</th></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="py-3">{i.product_name}</td><td>{i.size ?? "—"}</td><td>{i.quantity}</td>
                    <td className="text-right">₹{Number(i.unit_price) * i.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end text-sm space-y-1 flex-col items-end pt-3 border-t border-border">
              <div>Subtotal: ₹{active.subtotal}</div>
              <div>Discount: −₹{active.discount}</div>
              <div>Shipping: ₹{active.shipping}</div>
              <div className="font-display text-2xl">Total: ₹{active.total}</div>
            </div>
            <div className="flex items-end gap-3 pt-4 border-t border-border">
              <div className="flex-1">
                <Select label="Update status" value={active.status} onChange={(e) => updateStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </Select>
              </div>
              <button onClick={downloadInvoice} className="flex items-center gap-2 border border-foreground px-5 py-3 eyebrow">
                <Download className="h-3 w-3" /> Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
