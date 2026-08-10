import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function DashboardPanel() {
  const [stats, setStats] = useState({
    revenue: 0, orders: 0, customers: 0, aov: 0,
    paid: 0, pending: 0, failed: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, status, payment_status, total, created_at")
        .order("created_at", { ascending: false });
      const all = orders ?? [];
      const paid = all.filter((o: any) => o.payment_status === "paid");
      const pending = all.filter((o: any) => o.payment_status === "pending");
      const failed = all.filter((o: any) => o.payment_status === "failed");
      const revenue = paid.reduce((s, o: any) => s + Number(o.total ?? 0), 0);
      const aov = paid.length ? revenue / paid.length : 0;
      const { count: custCount } = await supabase
        .from("profiles").select("*", { count: "exact", head: true });
      setStats({
        revenue, orders: all.length, customers: custCount ?? 0, aov,
        paid: paid.length, pending: pending.length, failed: failed.length,
      });
      setRecent(all.slice(0, 6));
    })();
  }, []);

  const cards = [
    ["Revenue", `₹${Math.round(stats.revenue).toLocaleString("en-IN")}`, DollarSign],
    ["Total Orders", String(stats.orders), ShoppingCart],
    ["Customers", String(stats.customers), Users],
    ["AOV", `₹${Math.round(stats.aov).toLocaleString("en-IN")}`, TrendingUp],
  ] as const;

  const payCards = [
    ["Paid", stats.paid, CheckCircle2, "text-emerald-700"],
    ["Pending", stats.pending, Clock, "text-amber-700"],
    ["Failed", stats.failed, XCircle, "text-crimson"],
  ] as const;

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="eyebrow text-muted-foreground">Dashboard</div>
          <h1 className="display-lg mt-2">Today.</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {cards.map(([l, v, Icon]) => (
          <div key={l} className="bg-paper p-6 border border-border">
            <div className="flex justify-between items-start">
              <div className="eyebrow text-muted-foreground">{l}</div>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="font-display text-4xl mt-3">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {payCards.map(([l, v, Icon, color]) => (
          <div key={l as string} className="bg-paper p-6 border border-border">
            <div className="flex justify-between items-start">
              <div className="eyebrow text-muted-foreground">{l as string} payments</div>
              <Icon className={`h-4 w-4 ${color as string}`} />
            </div>
            <div className="font-display text-4xl mt-3">{v as number}</div>
          </div>
        ))}
      </div>

      <div className="bg-paper p-6 border border-border mt-4">
        <div className="eyebrow text-muted-foreground mb-5">Recent Orders</div>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left eyebrow text-muted-foreground">
              <tr><th className="py-3">Order</th><th>Customer</th><th>Payment</th><th>Status</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-3 font-medium">{r.order_number}</td>
                  <td>{r.customer_name ?? "—"}</td>
                  <td><span className="text-xs bg-cream px-2 py-1 capitalize">{r.payment_status}</span></td>
                  <td><span className="text-xs bg-cream px-2 py-1 capitalize">{r.status.replace("_", " ")}</span></td>
                  <td className="text-right">₹{Number(r.total).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
