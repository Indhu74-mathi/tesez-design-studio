import halfsleeve from "@/assets/cat-halfsleeve.jpg";
import fullsleeve from "@/assets/cat-fullsleeve.jpg";
import collar from "@/assets/cat-collar.jpg";
import hoodie from "@/assets/cat-hoodie.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export type Color = { name: string; hex: string };
export const COLORS: Color[] = [
  { name: "Black", hex: "#0b0b0b" },
  { name: "White", hex: "#f5f3ee" },
  { name: "Navy", hex: "#0f1e3a" },
  { name: "Grey", hex: "#8a8a8a" },
  { name: "Maroon", hex: "#5a1a22" },
];

export const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  comingSoon?: boolean;
};

export const CATEGORIES: Category[] = [
  { slug: "half-sleeve", name: "Half Sleeve", tagline: "Everyday essential, elevated.", image: halfsleeve },
  { slug: "full-sleeve", name: "Full Sleeve", tagline: "Layered. Considered.", image: fullsleeve },
  { slug: "collar", name: "Collar", tagline: "Sharp, soft, polished.", image: collar },
  { slug: "hoodie", name: "Hoodies", tagline: "Quiet weight, loud presence.", image: hoodie },
  { slug: "kids", name: "Kids Wear", tagline: "Coming soon.", image: hoodie, comingSoon: true },
];

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  gallery: string[];
  description: string;
  material: string;
  colors: string[];
  sizes?: string[];
  badge?: string;
};


export const PRODUCTS: Product[] = [
  { 
    slug: "atelier-noir-tee",
    name: "Atelier Noir Tee",
    category: "half-sleeve",
    price: 1499,
    compareAt: 1999,
    image: product1,
    gallery: [product1, product2, product3],
    description: "A study in restraint. Cut from heavyweight combed cotton, finished with a sculpted drop shoulder and a hand-felled hem.",
    material: "240 GSM combed cotton, garment-dyed for depth.",
    colors: ["Black", "White", "Navy"],
    badge: "Best Seller",
  },
  {
    slug: "typograph-oversize",
    name: "Typograph Oversize",
    category: "half-sleeve",
    price: 1699,
    image: product2,
    gallery: [product2, product1, product4],
    description: "An oversized silhouette built around a single, considered typographic statement.",
    material: "220 GSM ring-spun cotton.",
    colors: ["White", "Black", "Grey"],
    badge: "New",
  },
  {
    slug: "maison-crimson",
    name: "Maison Crimson",
    category: "half-sleeve",
    price: 1599,
    image: product3,
    gallery: [product3, product1, product2],
    description: "A deep oxblood maroon — the kind of red worn quietly.",
    material: "210 GSM Supima cotton.",
    colors: ["Maroon", "Black"],
  },
  {
    slug: "courthouse-polo",
    name: "Courthouse Polo",
    category: "collar",
    price: 2199,
    image: product4,
    gallery: [product4, product3, product1],
    description: "A tailored polo with a clean two-button placket and a hand-finished collar.",
    material: "Mercerised pima cotton piqué.",
    colors: ["Navy", "Black", "White"],
    badge: "Trending",
  },
  {
    slug: "longline-onyx",
    name: "Longline Onyx",
    category: "full-sleeve",
    price: 1899,
    image: product1,
    gallery: [product1, product2, product3],
    description: "Elongated cut with raglan sleeves. Built for layering or solo wear.",
    material: "260 GSM organic cotton.",
    colors: ["Black", "Grey", "Navy"],
  },
  {
    slug: "concrete-hoodie",
    name: "Concrete Hoodie",
    category: "hoodie",
    price: 2999,
    image: hoodie,
    gallery: [hoodie, product1, product2],
    description: "Heavyweight French terry, brushed for hand-feel. A hood that holds its shape.",
    material: "420 GSM brushed French terry.",
    colors: ["Grey", "Black", "Navy"],
    badge: "New",
  },
];

export const DESIGN_CATEGORIES = [
  "Minimal", "Luxury", "Typography", "Anime", "Gaming",
  "Fitness", "Travel", "Music", "Streetwear", "Vintage",
  "Corporate", "Motivational", "Trending",
];

export const BLOG_POSTS = [
  { slug: "the-language-of-restraint", title: "The Language of Restraint", category: "Styling", excerpt: "Why doing less, exactly right, is the new luxury.", date: "Jun 4, 2026", read: "5 min" },
  { slug: "anatomy-of-a-tee", title: "Anatomy of a Tee", category: "Printing", excerpt: "From GSM to grain — what makes a t-shirt worth wearing for ten years.", date: "May 22, 2026", read: "7 min" },
  { slug: "corporate-quiet", title: "Corporate, Quiet.", category: "Corporate Branding", excerpt: "Bulk branding that doesn't shout. A field guide for thoughtful teams.", date: "May 9, 2026", read: "6 min" },
  { slug: "streetwear-now", title: "Streetwear, Now.", category: "Streetwear", excerpt: "Tracking the silhouettes shaping the next twelve months.", date: "Apr 28, 2026", read: "4 min" },
];

export const REVIEWS = [
  { name: "Aarav S.", city: "Bengaluru", text: "The cotton has actual weight. Wore it three times this week — it gets better with every wash.", rating: 5 },
  { name: "Meera P.", city: "Mumbai", text: "Customised six tees for our launch team. The print quality is studio-grade.", rating: 5 },
  { name: "Karan D.", city: "Delhi", text: "Fits the way fashion magazines promise but never deliver. Finally.", rating: 5 },
  { name: "Sara I.", city: "Pune", text: "The studio made designing genuinely fun. Live preview is shockingly good.", rating: 5 },
];

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
