import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, Users, FileText, Palette, Tag,
  Settings as SettingsIcon, Image as ImageIcon, FolderOpen, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/admin/use-admin";
import { DashboardPanel } from "@/components/admin/dashboard-panel";
import { ProductsManager } from "@/components/admin/products-manager";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { DesignsManager } from "@/components/admin/designs-manager";
import { BlogsManager } from "@/components/admin/blogs-manager";
import { OrdersManager } from "@/components/admin/orders-manager";
import { CustomersManager } from "@/components/admin/customers-manager";
import { CouponsManager } from "@/components/admin/coupons-manager";
import { HomepageManager } from "@/components/admin/homepage-manager";
import { SettingsManager } from "@/components/admin/settings-manager";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — TESEZ" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type TabKey =
  | "dashboard" | "products" | "categories" | "designs"
  | "blogs" | "orders" | "customers" | "coupons" | "homepage" | "settings";

const NAV: { key: TabKey; label: string; Icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "products", label: "Products", Icon: Package },
  { key: "categories", label: "Categories", Icon: FolderOpen },
  { key: "designs", label: "Design Library", Icon: Palette },
  { key: "blogs", label: "Blogs", Icon: FileText },
  { key: "orders", label: "Orders", Icon: ShoppingBag },
  { key: "customers", label: "Customers", Icon: Users },
  { key: "coupons", label: "Coupons", Icon: Tag },
  { key: "homepage", label: "Homepage CMS", Icon: ImageIcon },
  { key: "settings", label: "Settings", Icon: SettingsIcon },
];

function Admin() {
  const { loading, isAdmin } = useIsAdmin();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const nav = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    nav({ to: "/auth" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="eyebrow text-muted-foreground">Verifying access…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md">
          <div className="eyebrow text-muted-foreground">403</div>
          <h1 className="display-lg mt-4">Admin access required.</h1>
          <p className="text-muted-foreground mt-4">
            Your account doesn't have the admin role. Ask a platform owner to grant access.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/" className="bg-noir text-paper px-6 py-3 eyebrow">Return home</Link>
            <button onClick={signOut} className="border border-foreground px-6 py-3 eyebrow">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-60 bg-noir text-paper flex flex-col p-6 sticky top-0 h-screen">
        <Link to="/" className="font-display text-2xl tracking-[0.3em] mb-12">TESEZ</Link>
        <nav className="space-y-1 flex-1 overflow-auto">
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 text-sm py-3 px-4 rounded-sm transition text-left ${
                tab === key ? "bg-paper/15" : "hover:bg-paper/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 text-sm py-3 px-4 rounded-sm hover:bg-paper/5 text-left mt-4"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <div className="text-xs text-paper/40 mt-4">v1.0 · Admin</div>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "products" && <ProductsManager />}
        {tab === "categories" && <CategoriesManager />}
        {tab === "designs" && <DesignsManager />}
        {tab === "blogs" && <BlogsManager />}
        {tab === "orders" && <OrdersManager />}
        {tab === "customers" && <CustomersManager />}
        {tab === "coupons" && <CouponsManager />}
        {tab === "homepage" && <HomepageManager />}
        {tab === "settings" && <SettingsManager />}
      </main>
    </div>
  );
}
