import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-luxe text-center">
      <div>
        <div className="eyebrow text-muted-foreground">404 — Not Found</div>
        <h1 className="display-lg mt-4">This page slipped through the seam.</h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto">Let's get you back to something beautiful.</p>
        <Link to="/" className="inline-block mt-8 eyebrow border-b border-foreground pb-1">Return Home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-luxe text-center">
      <div>
        <h1 className="display-lg">Something didn't render.</h1>
        <p className="mt-4 text-muted-foreground">Try again or return to the home page.</p>
        <div className="mt-8 flex gap-4 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="bg-noir text-paper px-6 py-3 eyebrow">Try again</button>
          <a href="/" className="border border-foreground px-6 py-3 eyebrow">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TESEZ — Wear Your Design. Express Your Style." },
      { name: "description", content: "TESEZ is a premium custom apparel house. Designer t-shirts, hoodies and bespoke prints, crafted in India." },
      { name: "theme-color", content: "#0b0b0b" },
      { property: "og:title", content: "TESEZ — Wear Your Design. Express Your Style." },
      { property: "og:description", content: "TESEZ is a premium custom apparel house. Designer t-shirts, hoodies and bespoke prints, crafted in India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TESEZ — Wear Your Design. Express Your Style." },
      { name: "twitter:description", content: "TESEZ is a premium custom apparel house. Designer t-shirts, hoodies and bespoke prints, crafted in India." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d30069db-d806-4d2f-acb8-4cf06529c997/id-preview-8b7390d0--ce9334cc-41dc-4789-8bac-f5aab9be36da.lovable.app-1781881455261.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d30069db-d806-4d2f-acb8-4cf06529c997/id-preview-8b7390d0--ce9334cc-41dc-4789-8bac-f5aab9be36da.lovable.app-1781881455261.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter+Tight:wght@300;400;500;600&display=swap" },
      // 👇 NEW: favicon link
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = pathname.startsWith("/admin");
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {!hideChrome && <Header />}
        <main className="min-h-[60vh]"><Outlet /></main>
        {!hideChrome && <Footer />}
        <Toaster position="top-center" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}

// In your root.tsx or index.html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>