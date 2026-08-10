import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/catalog";
import { Minus, Plus, X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Bag — TESEZ" }, { name: "description", content: "Review your TESEZ bag." }]}),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const shipping = subtotal === 0 ? 0 : subtotal >= 2499 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-luxe py-32 text-center">
        <div className="eyebrow text-muted-foreground">Your Bag</div>
        <h1 className="display-lg mt-4">It's empty in here.</h1>
        <Link to="/products" className="inline-block mt-10 bg-noir text-paper px-8 py-4 eyebrow">Browse the Shop</Link>
      </div>
    );
  }

  return (
    <div className="container-luxe pt-12 pb-32 grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <div className="eyebrow text-muted-foreground">Your Bag · {items.length} item{items.length !== 1 ? "s" : ""}</div>
        <h1 className="display-lg mt-3 mb-10">Almost yours.</h1>
        <div className="space-y-6">
          {items.map((it) => (
            <div key={it.id} className="flex gap-5 pb-6 border-b border-border">
              <div className="w-28 h-36 bg-cream overflow-hidden flex-shrink-0">
                <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{it.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{it.color} · {it.size}</div>
                    {it.customDesign && <div className="text-xs text-crimson mt-1">Custom · {it.customDesign}</div>}
                  </div>
                  <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex items-center border border-border">
                    <button onClick={() => setQty(it.id, it.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-sm">{it.qty}</span>
                    <button onClick={() => setQty(it.id, it.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="font-medium">{formatINR(it.price * it.qty)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="lg:col-span-1">
        <div className="bg-cream p-8 sticky top-28">
          <div className="eyebrow text-muted-foreground mb-5">Summary</div>
          <Row label="Subtotal" value={formatINR(subtotal)} />
          <Row label="Shipping" value={shipping === 0 ? "Complimentary" : formatINR(shipping)} />
          <div className="border-t border-foreground/20 mt-4 pt-4">
            <Row label="Total" value={formatINR(total)} bold />
          </div>
          <Link to="/checkout" className="block w-full text-center mt-6 bg-noir text-paper py-4 eyebrow hover:opacity-90 transition">Checkout</Link>
          <Link to="/products" className="block text-center mt-3 eyebrow link-underline">← Continue shopping</Link>
        </div>
      </aside>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between py-1.5 ${bold ? "text-lg" : "text-sm"}`}><span>{label}</span><span className={bold ? "font-medium" : ""}>{value}</span></div>;
}
