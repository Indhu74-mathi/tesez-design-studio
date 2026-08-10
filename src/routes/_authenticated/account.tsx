import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My account — TESEZ" }, { name: "robots", content: "noindex" }] }),
  component: Account,
});

const PAYMENT_BADGE: Record<string, string> = {
  pending: "bg-cream text-foreground",
  paid: "bg-noir text-paper",
  failed: "bg-crimson text-paper",
  refunded: "bg-cream text-muted-foreground",
};

function Account() {
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("orders").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setOrders(o ?? []);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    window.location.href = "/";
  }

  async function downloadInvoice(order: any) {
    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    const html = invoiceHTML(order, items ?? []);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tesez-invoice-${order.order_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container-luxe py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow text-muted-foreground">Account</div>
          <h1 className="display-lg mt-3">{profile?.full_name || profile?.email || "Welcome."}</h1>
          <p className="text-muted-foreground mt-2">{profile?.email}</p>
        </div>
        <button onClick={signOut} className="eyebrow border border-foreground px-5 py-3">Sign out</button>
      </div>

      <div className="mt-12">
        <div className="eyebrow text-muted-foreground mb-5">My orders</div>
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="bg-paper border border-border p-10 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/products" className="inline-block mt-4 eyebrow border-b border-foreground pb-1">Start browsing</Link>
          </div>
        ) : (
          <div className="bg-paper border border-border divide-y divide-border">
            {orders.map((o) => (
              <div key={o.id} className="p-5 grid sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 items-center">
                <div>
                  <div className="font-medium">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div>{formatINR(Number(o.total))}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Payment</div>
                  <span className={`text-xs px-2 py-1 inline-block mt-1 capitalize ${PAYMENT_BADGE[o.payment_status] ?? "bg-cream"}`}>
                    {o.payment_status}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Order status</div>
                  <div className="text-sm capitalize">{o.status.replace("_", " ")}</div>
                </div>
                <button onClick={() => downloadInvoice(o)} className="eyebrow border border-foreground px-4 py-2 flex items-center gap-2">
                  <Download className="h-3 w-3" /> Invoice
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function invoiceHTML(order: any, items: any[]) {
  const addr = order.shipping_address ?? {};
  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.order_number}</title>
<style>
  *{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,sans-serif;padding:48px;color:#111;max-width:780px;margin:auto;background:#fff}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:20px}
  .logo{font-family:Georgia,serif;font-size:28px;letter-spacing:.3em}
  .meta{text-align:right;font-size:12px;color:#555}
  h2{font-weight:400;font-size:24px;margin:32px 0 4px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;font-size:13px}
  .box{border:1px solid #e5e5e5;padding:16px}
  .label{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#777;margin-bottom:6px}
  table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
  th,td{text-align:left;padding:10px;border-bottom:1px solid #eee}
  th{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#777;background:#fafafa}
  .totals{margin-top:16px;margin-left:auto;width:280px;font-size:13px}
  .totals .row{display:flex;justify-content:space-between;padding:6px 0}
  .totals .total{border-top:2px solid #111;font-size:18px;padding-top:10px;margin-top:6px;font-weight:600}
  .footer{margin-top:48px;text-align:center;font-size:11px;color:#777}
  @media print { body { padding:24px; } }
</style></head><body>
<div class="top">
  <div><div class="logo">TESEZ</div><div style="font-size:11px;color:#555;margin-top:4px">Premium custom apparel · Crafted in India</div></div>
  <div class="meta">
    <div><strong>Invoice</strong></div>
    <div>${order.order_number}</div>
    <div>${new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
    <div>Payment: ${order.payment_status}</div>
  </div>
</div>
<div class="grid">
  <div class="box"><div class="label">Billed to</div>
    <div><strong>${order.customer_name ?? ""}</strong></div>
    <div>${order.customer_email ?? ""}</div>
    <div>${order.customer_phone ?? ""}</div>
  </div>
  <div class="box"><div class="label">Ship to</div>
    <div>${addr.full_name ?? ""}</div>
    <div>${addr.line1 ?? ""}${addr.line2 ? ", " + addr.line2 : ""}</div>
    <div>${addr.city ?? ""}, ${addr.state ?? ""} ${addr.pincode ?? ""}</div>
    <div>${addr.country ?? ""}</div>
  </div>
</div>
<table>
  <thead><tr><th>Item</th><th>Size</th><th>Color</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${items.map((i) => `<tr>
    <td>${i.product_name}</td><td>${i.size ?? "—"}</td><td>${i.color ?? "—"}</td>
    <td style="text-align:right">${i.quantity}</td>
    <td style="text-align:right">₹${Number(i.unit_price).toLocaleString("en-IN")}</td>
    <td style="text-align:right">₹${(Number(i.unit_price) * i.quantity).toLocaleString("en-IN")}</td>
  </tr>`).join("")}</tbody>
</table>
<div class="totals">
  <div class="row"><span>Subtotal</span><span>₹${Number(order.subtotal).toLocaleString("en-IN")}</span></div>
  ${Number(order.discount) > 0 ? `<div class="row"><span>Discount${order.coupon_code ? " (" + order.coupon_code + ")" : ""}</span><span>−₹${Number(order.discount).toLocaleString("en-IN")}</span></div>` : ""}
  <div class="row"><span>GST (5%)</span><span>₹${Number(order.tax).toLocaleString("en-IN")}</span></div>
  <div class="row"><span>Shipping</span><span>${Number(order.shipping) === 0 ? "Free" : "₹" + Number(order.shipping).toLocaleString("en-IN")}</span></div>
  <div class="row total"><span>Total</span><span>₹${Number(order.total).toLocaleString("en-IN")}</span></div>
</div>
<div class="footer">Thank you for choosing TESEZ. Wear your design.</div>
<script>setTimeout(() => window.print(), 400)</script>
</body></html>`;
}
