import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Type, Move, RotateCw, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS } from "@/lib/catalog";

// Types
type Layer = { 
  id: string; 
  type: "image" | "text"; 
  content: string; 
  x: number; 
  y: number; 
  scale: number; 
  rotation: number; 
  color?: string 
};

type Design = {
  id: string; 
  name: string; 
  file_url: string; 
  category: string; 
  is_active: boolean;
};

export const Route = createFileRoute("/customize")({
  validateSearch: (search: Record<string, unknown>) => ({
    slug: (search.slug as string) || undefined,
    size: (search.size as string) || undefined,
    color: (search.color as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Design Studio — TESEZ" },
      { name: "description", content: "Customise your t-shirt with our live design studio. Upload artwork, add text, see it on the garment in real time." },
    ],
  }),
  component: Studio,
});

const POSITIONS = ["Front", "Back", "Left Chest", "Right Chest", "Full Front", "Full Back", "Sleeve Left", "Sleeve Right"] as const;
const DESIGN_CATEGORIES = ["All", "Minimal", "Luxury", "Typography", "Anime", "Gaming", "Fitness", "Travel", "Music", "Streetwear", "Vintage", "Corporate", "Motivational", "Trending"];

// Static product categories
const PRODUCT_CATEGORIES = {
  Mens: [
    "Oversized",
    "Regular fit",
    "Hoodies",
    "Acid wash",
    "Sweatshirt",
    "Polo Tshirt"
  ],
  Womens: [
    "Regular fit",
    "Oversized",
    "Crop top",
    "Hoodies",
    "Acid wash",
    "Sweatshirt"
  ]
};

function Studio() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  // State
  const [selectedCategory, setSelectedCategory] = useState<"Mens" | "Womens">("Mens");
  const [selectedProductType, setSelectedProductType] = useState<string>("Oversized");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("Black");

  // Canvas state
  const [selectedPositions, setSelectedPositions] = useState<Set<(typeof POSITIONS)[number]>>(new Set(["Front"]));
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Design library state
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designCategory, setDesignCategory] = useState<string>("All");
  const [designsLoading, setDesignsLoading] = useState(true);

  // Fetch designs from Supabase
  useEffect(() => {
    async function fetchDesigns() {
      setDesignsLoading(true);
      try {
        const { data, error } = await supabase
          .from("designs")
          .select("*")
          .eq("is_active", true)
          .order("name");
        
        if (!error && data) {
          setDesigns(data);
        } else {
          console.error("Failed to fetch designs:", error);
        }
      } catch (err) {
        console.error("Error fetching designs:", err);
      } finally {
        setDesignsLoading(false);
      }
    }
    fetchDesigns();
  }, []);

  // Color hex
  const colorHex = COLORS.find((c) => c.name === selectedColor)?.hex ?? "#0b0b0b";

  // Canvas helpers
  function addImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const id = String(Date.now());
      setLayers((l) => [...l, { 
        id, 
        type: "image", 
        content: reader.result as string, 
        x: 50, 
        y: 50, 
        scale: 1, 
        rotation: 0 
      }]);
      setSelected(id);
    };
    reader.readAsDataURL(file);
  }

  function addDesignFromLibrary(design: Design) {
    const id = String(Date.now());
    setLayers((l) => [...l, { 
      id, 
      type: "image", 
      content: design.file_url, 
      x: 50, 
      y: 50, 
      scale: 1, 
      rotation: 0 
    }]);
    setSelected(id);
  }

  function addText() {
    if (!text.trim()) return;
    const id = String(Date.now());
    setLayers((l) => [...l, { 
      id, 
      type: "text", 
      content: text, 
      x: 50, 
      y: 50, 
      scale: 1, 
      rotation: 0, 
      color: selectedColor === "White" ? "#0b0b0b" : "#ffffff" 
    }]);
    setSelected(id);
    setText("");
  }
  
  function update(id: string, patch: Partial<Layer>) {
    setLayers((l) => l.map((x) => x.id === id ? { ...x, ...patch } : x));
  }
  
  function remove(id: string) { 
    setLayers((l) => l.filter((x) => x.id !== id)); 
    setSelected(null); 
  }

  // Toggle position selection
  function togglePosition(position: (typeof POSITIONS)[number]) {
    const newPositions = new Set(selectedPositions);
    if (newPositions.has(position)) {
      newPositions.delete(position);
      if (newPositions.size === 0) {
        newPositions.add("Front");
      }
    } else {
      newPositions.add(position);
    }
    setSelectedPositions(newPositions);
  }

  // Get image URL for WhatsApp (handles both uploaded and library images)
  function getImageUrl(content: string): string {
    // If it's a data URL (uploaded image), return as is
    if (content.startsWith('data:image')) {
      return content;
    }
    // If it's a Supabase URL or any other URL, return it
    if (content.startsWith('http')) {
      return content;
    }
    // If it's a relative path, construct full URL
    if (content.startsWith('/')) {
      return window.location.origin + content;
    }
    return content;
  }

  // WhatsApp redirect with all details and images
  function handleWhatsAppOrder() {
    // Build layer details with images
    let layerDetails = '';
    layers.forEach((layer, index) => {
      const layerType = layer.type === 'image' ? '🖼️ Image' : '📝 Text';
      if (layer.type === 'image') {
        const imageUrl = getImageUrl(layer.content);
        layerDetails += `  Layer ${index + 1}: ${layerType}\n  Image URL: ${imageUrl}\n\n`;
      } else {
        layerDetails += `  Layer ${index + 1}: ${layerType} - "${layer.content}"\n\n`;
      }
    });

    // Get the first image for preview
    const firstImage = layers.find(l => l.type === 'image');
    const previewImage = firstImage ? getImageUrl(firstImage.content) : '';

    const message = encodeURIComponent(
      `🛍️ *CUSTOM ORDER REQUEST*\n\n` +
      `📋 *Product Details:*\n` +
      `Category: ${selectedCategory}\n` +
      `Type: ${selectedProductType}\n` +
      `Size: ${selectedSize}\n` +
      `Color: ${selectedColor}\n` +
      `Print Positions: ${Array.from(selectedPositions).join(', ')}\n\n` +
      `🎨 *Design Layers:*\n${layerDetails || '  No layers added'}\n` +
      `📊 *Total Layers: ${layers.length}\n\n` +
      `📸 *Preview Image:*\n${previewImage || 'No image uploaded'}\n\n` +
      `👤 *Customer Information:*\n` +
      `Name: [Your Name]\n` +
      `Phone: [Your Phone]\n` +
      `Email: [Your Email]\n\n` +
      `📦 *Delivery Address:*\n` +
      `[Your Full Address]\n\n` +
      `💬 *Additional Notes:*\n` +
      `[Any special instructions or requirements]`
    );
    
    // Open WhatsApp with the formatted message
    window.open(`https://wa.me/919047787569?text=${message}`, '_blank');
  }

  // Filter designs by category
  const filteredDesigns = useMemo(() => {
    if (designCategory === "All") return designs;
    return designs.filter(d => d.category === designCategory);
  }, [designs, designCategory]);

  // Handle category change
  function handleCategoryChange(category: "Mens" | "Womens") {
    setSelectedCategory(category);
    setSelectedProductType(PRODUCT_CATEGORIES[category][0]);
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="container-luxe pt-12 pb-6">
        <div className="eyebrow text-muted-foreground">Design Studio</div>
        <h1 className="display-lg mt-2">Compose. <span className="italic">Live.</span></h1>
      </div>

      <div className="container-luxe grid lg:grid-cols-12 gap-8 pb-24">
        {/* Left: Tools */}
        <aside className="lg:col-span-3 space-y-8">
          <Panel title="01 — Product Category">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleCategoryChange("Mens")}
                className={`flex-1 py-2 text-sm border ${selectedCategory === "Mens" ? "bg-foreground text-paper border-foreground" : "border-border"}`}
              >
                Men's
              </button>
              <button
                onClick={() => handleCategoryChange("Womens")}
                className={`flex-1 py-2 text-sm border ${selectedCategory === "Womens" ? "bg-foreground text-paper border-foreground" : "border-border"}`}
              >
                Women's
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {PRODUCT_CATEGORIES[selectedCategory].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedProductType(type)}
                  className={`py-2 text-xs border ${selectedProductType === type ? "bg-foreground text-paper border-foreground" : "border-border"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="02 — Colour">
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`h-9 w-9 rounded-full border-2 ${selectedColor === c.name ? "border-foreground" : "border-transparent ring-1 ring-border"}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </Panel>

          <Panel title="03 — Size">
            <div className="grid grid-cols-5 gap-1.5">
              {["S", "M", "L", "XL", "XXL"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`py-2 text-xs border ${selectedSize === s ? "bg-foreground text-paper border-foreground" : "border-border"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="04 — Print Positions (Select Multiple)">
            <div className="flex flex-wrap gap-1.5">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePosition(p)}
                  className={`text-xs border px-2 py-1.5 flex items-center gap-1 ${selectedPositions.has(p) ? "bg-foreground text-paper border-foreground" : "border-border"}`}
                >
                  {p}
                  {selectedPositions.has(p) && <X className="h-3 w-3" />}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Selected: {Array.from(selectedPositions).join(' • ')}
            </div>
          </Panel>
        </aside>

        {/* Canvas */}
        <div className="lg:col-span-6">
          <div className="relative bg-paper aspect-[4/5] shadow-soft overflow-hidden">
            <div className="absolute inset-[12%]" style={{ background: colorHex }}>
              <div
                className="absolute border border-dashed border-white/30"
                style={getPrintArea(Array.from(selectedPositions)[0])}
                onMouseDown={() => setSelected(null)}
              >
                {layers.map((l) => (
                  <div
                    key={l.id}
                    onMouseDown={(e) => { e.stopPropagation(); setSelected(l.id); }}
                    style={{
                      position: "absolute",
                      left: `${l.x}%`, top: `${l.y}%`,
                      transform: `translate(-50%, -50%) rotate(${l.rotation}deg) scale(${l.scale})`,
                      cursor: "move",
                      outline: selected === l.id ? "1px dashed #ffffff80" : "none",
                      padding: 4,
                    }}
                  >
                    {l.type === "image"
                      ? <img src={l.content} alt="" className="max-w-[200px] max-h-[200px] pointer-events-none" />
                      : <span style={{ color: l.color, fontFamily: "var(--font-display)" }} className="text-3xl whitespace-nowrap pointer-events-none">{l.content}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-4 left-4 eyebrow text-paper/70 bg-noir/50 backdrop-blur px-2 py-1">
              {selectedProductType} • {selectedColor}
            </div>
            <div className="absolute bottom-4 right-4 eyebrow text-paper/70 bg-noir/50 backdrop-blur px-2 py-1">
              {Array.from(selectedPositions).join(' • ')}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            {selectedCategory} · {selectedProductType} · {selectedColor} · {selectedSize} · {Array.from(selectedPositions).join(', ')}
          </p>
        </div>

        {/* Right: Layers + Designs */}
        <aside className="lg:col-span-3 space-y-8">
          <Panel title="Upload Artwork">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" hidden onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-foreground/40 p-6 flex flex-col items-center gap-2 hover:bg-paper transition">
              <Upload className="h-5 w-5" />
              <span className="text-xs">PNG · JPG · SVG · up to 10MB</span>
            </button>
          </Panel>

          <Panel title="Add Text">
            <div className="flex gap-2">
              <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Your line" 
                className="flex-1 bg-paper border border-border p-3 text-sm" 
                onKeyPress={(e) => e.key === 'Enter' && addText()}
              />
              <button onClick={addText} className="bg-foreground text-paper px-3"><Type className="h-4 w-4" /></button>
            </div>
          </Panel>

          {selected && (() => {
            const l = layers.find((x) => x.id === selected); 
            if (!l) return null;
            return (
              <Panel title="Edit Layer">
                <Slider label="Size" value={l.scale} min={0.3} max={3} step={0.05} onChange={(v) => update(l.id, { scale: v })} />
                <Slider label="Rotate" value={l.rotation} min={-180} max={180} step={1} onChange={(v) => update(l.id, { rotation: v })} />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => update(l.id, { x: 50, y: 50 })} className="flex-1 border border-border py-2 text-xs flex items-center justify-center gap-1">
                    <Move className="h-3 w-3" />Center
                  </button>
                  <button onClick={() => update(l.id, { rotation: 0 })} className="flex-1 border border-border py-2 text-xs flex items-center justify-center gap-1">
                    <RotateCw className="h-3 w-3" />Reset
                  </button>
                  <button onClick={() => remove(l.id)} className="border border-border py-2 px-3 text-xs">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </Panel>
            );
          })()}

          <Panel title="Design Library">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {DESIGN_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDesignCategory(cat)}
                  className={`text-[10px] px-2 py-1 border ${designCategory === cat ? 'bg-foreground text-paper border-foreground' : 'border-border'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {designsLoading ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                Loading designs...
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No designs in this category.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {filteredDesigns.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => addDesignFromLibrary(d)}
                    className="aspect-square bg-cream border border-border overflow-hidden hover:border-foreground transition relative group"
                    title={d.name}
                  >
                    <img src={d.file_url} alt={d.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-[8px] text-center px-1">{d.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Panel>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              Layers: {layers.length} | Positions: {Array.from(selectedPositions).length}
            </div>
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-green-600 text-white py-4 eyebrow hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow text-muted-foreground mb-3">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))} 
        className="w-full" 
      />
    </div>
  );
}

function getPrintArea(p: (typeof POSITIONS)[number]): React.CSSProperties {
  switch (p) {
    case "Front":     return { top: "20%", left: "30%", width: "40%", height: "40%" };
    case "Back":      return { top: "20%", left: "30%", width: "40%", height: "40%" };
    case "Left Chest":return { top: "15%", left: "60%", width: "18%", height: "18%" };
    case "Right Chest":return { top: "15%", left: "22%", width: "18%", height: "18%" };
    case "Full Front":return { top: "10%", left: "15%", width: "70%", height: "75%" };
    case "Full Back": return { top: "10%", left: "15%", width: "70%", height: "75%" };
    case "Sleeve Left": return { top: "50%", left: "5%", width: "15%", height: "25%" };
    case "Sleeve Right": return { top: "50%", left: "80%", width: "15%", height: "25%" };
  }
}