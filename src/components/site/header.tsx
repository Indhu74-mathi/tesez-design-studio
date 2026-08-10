import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, X, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/LOGO.png"; // 👈 import the logo image

const NAV = [
  { to: "/categories", label: "Categories" },
  { to: "/products", label: "Shop" },
  { to: "/customize", label: "Studio" },
  { to: "/blog", label: "Journal" },
  { to: "/about", label: "About" },
];

export function Header() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* announcement bar */}
      <div className="bg-noir text-paper text-[11px] tracking-[0.22em] uppercase text-center py-2.5 font-medium">
        Complimentary shipping on orders above ₹2,499 · Crafted in India
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
            : "bg-background border-b border-transparent"
        }`}
      >
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          <button className="md:hidden -ml-2 p-2" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden md:flex items-center gap-9 text-[13px] tracking-wide">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="link-underline text-foreground/80 hover:text-foreground transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Logo image instead of text */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <img
              src={logo}
              alt="TESEZ"
              className="h-8 md:h-20 w-auto object-contain" // adjust height as needed
            />
          </Link>

          <div className="flex items-center gap-1.5 md:gap-3 text-foreground">
            {/* Home Icon */}
            <Link to="/" className="p-2 hover:opacity-60 transition" aria-label="Home">
              <Home className="h-[18px] w-[18px]" />
            </Link>
            
            <button className="p-2 hover:opacity-60 transition" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            
            <Link to="/auth" className="p-2 hover:opacity-60 transition" aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </Link>
            
            <Link to="/account" className="p-2 hover:opacity-60 transition hidden md:inline-flex" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
            </Link>
            
            <Link to="/cart" className="p-2 relative hover:opacity-60 transition" aria-label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute top-1 right-1 bg-crimson text-white text-[9px] font-medium rounded-full h-4 min-w-4 px-1 inline-flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-noir text-paper animate-in fade-in duration-300">
          <div className="container-luxe pt-6 flex justify-between items-center">
            {/* Mobile drawer logo – also use image */}
            <Link to="/" onClick={() => setOpen(false)}>
              <img src={logo} alt="TESEZ" className="h-8 w-auto object-contain" />
            </Link>
            <button onClick={() => setOpen(false)} className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="container-luxe mt-16 flex flex-col gap-7">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display text-4xl tracking-tight">
                {n.label}
              </Link>
            ))}
            <Link to="/" onClick={() => setOpen(false)} className="font-display text-4xl tracking-tight">
              Home
            </Link>
            <Link to="/auth" onClick={() => setOpen(false)} className="eyebrow mt-6 opacity-70">
              Sign in / Register
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}