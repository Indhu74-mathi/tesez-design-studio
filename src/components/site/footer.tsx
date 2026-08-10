import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-noir text-paper mt-32">
      <div className="container-luxe py-20">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5">
            <div className="font-display text-5xl md:text-6xl tracking-[0.18em] font-light">TESEZ</div>
            <p className="mt-6 text-paper/60 max-w-sm leading-relaxed">
              Wear your design. Express your style. Premium custom apparel, considered down to the stitch.
            </p>
            <form className="mt-8 flex border-b border-paper/30 max-w-sm focus-within:border-paper transition">
              <input type="email" placeholder="Your email" className="bg-transparent flex-1 py-3 text-sm placeholder:text-paper/40 outline-none" />
              <button className="eyebrow text-paper/80 hover:text-paper transition">Subscribe →</button>
            </form>
          </div>

          <FooterCol title="Shop" links={[
            ["/categories", "All Categories"],
            ["/products", "Bestsellers"],
            ["/customize", "Customize"],
            ["/products", "New Arrivals"],
          ]} />
          <FooterCol title="Help" links={[
            ["/faq", "FAQ"],
            ["/track-order", "Track Order"],
            ["/shipping", "Shipping"],
            ["/returns", "Returns"],
          ]} />
          <FooterCol title="Studio" links={[
            ["/about", "About"],
            ["/blog", "Journal"],
            ["/contact", "Contact"],
            ["https://wa.me/919047787569?text=Hi%2C%20I%20am%20interested%20in%20bulk%20orders%20with%20TESEZ.", "Bulk Orders"],
          ]} />
        </div>

        <div className="mt-20 pt-8 border-t border-paper/15 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-xs text-paper/50">
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-paper">Privacy</Link>
            <Link to="/terms" className="hover:text-paper">Terms</Link>
            <Link to="/shipping" className="hover:text-paper">Shipping</Link>
            <Link to="/returns" className="hover:text-paper">Returns</Link>
          </div>
          <div className="flex gap-5">
            <a 
              href="https://www.instagram.com/tesez.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-paper transition"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a 
              href="https://www.facebook.com/tesez" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-paper transition"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
          <div>© {new Date().getFullYear()} TESEZ. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 md:col-start-auto">
      <div className="eyebrow text-paper/50 mb-5">{title}</div>
      <ul className="space-y-3 text-sm text-paper/80">
        {links.map(([to, label]) => {
          // If the link is external (starts with http), use <a>
          if (to.startsWith("http")) {
            return (
              <li key={to + label}>
                <a
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  {label}
                </a>
              </li>
            );
          }
          return (
            <li key={to + label}>
              <Link to={to} className="link-underline">{label}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}