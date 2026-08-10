import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Modal } from "./ui";

export function CustomersManager() {
  const [rows, setRows] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: allOrders } = await supabase.from("orders").select("user_id, total");
    const totals = new Map<string, { count: number; spend: number }>();
    (allOrders ?? []).forEach((o: any) => {
      if (!o.user_id) return;
      const t = totals.get(o.user_id) ?? { count: 0, spend: 0 };
      t.count += 1; t.spend += Number(o.total ?? 0);
      totals.set(o.user_id, t);
    });
    setRows((profiles ?? []).map((p: any) => ({ ...p, ...(totals.get(p.id) ?? { count: 0, spend: 0 }) })));
  }
  useEffect(() => { load(); }, []);

  async function openCustomer(p: any) {
    setActive(p);
    const { data } = await supabase.from("orders").select("*").eq("user_id", p.id).order("created_at", { ascending: false });
    setOrders(data ?? []);
    setOpen(true);
  }

  return (
    <>
      <PanelHeader eyebrow="Audience" title="Customers." />
      <div className="bg-paper border border-border">
        <table className="w-full text-sm">
          <thead className="text-left eyebrow text-muted-foreground border-b border-border">
            <tr><th className="p-4">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th className="text-right pr-4">Total spend</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => openCustomer(r)} className="border-b border-border last:border-0 cursor-pointer hover:bg-cream">
                <td className="p-4">{r.full_name || "—"}</td>
                <td>{r.email}</td>
                <td>{r.phone ?? "—"}</td>
                <td>{r.count}</td>
                <td className="text-right pr-4">₹{r.spend.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={active?.full_name || active?.email || "Customer"}>
        {active && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="eyebrow text-muted-foreground">Email</div><div className="mt-1">{active.email}</div></div>
              <div><div className="eyebrow text-muted-foreground">Phone</div><div className="mt-1">{active.phone ?? "—"}</div></div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="eyebrow text-muted-foreground mb-2">Order history ({orders.length})</div>
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="flex justify-between bg-cream px-3 py-2">
                    <span>{o.order_number}</span>
                    <span className="capitalize">{o.status.replace("_", " ")}</span>
                    <span>₹{Number(o.total).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                {orders.length === 0 && <div className="text-muted-foreground">No orders.</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
