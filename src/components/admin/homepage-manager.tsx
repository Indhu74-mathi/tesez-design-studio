import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Textarea, Input, MediaUploader } from "./ui";

type Section = { key: string; label: string; description: string };

const SECTIONS: Section[] = [
  { key: "hero", label: "Hero Banner", description: "Headline, sub-headline, CTA, image" },
  { key: "marquee", label: "Marquee Strip", description: "Comma-separated phrases scrolling at top" },
  { key: "lifestyle", label: "Lifestyle Banner", description: "Tagline & image between collections" },
  { key: "testimonials", label: "Testimonials", description: "JSON array of {name, city, text, rating}" },
  { key: "faqs", label: "FAQs", description: "JSON array of {q, a}" },
  { key: "footer", label: "Footer", description: "JSON: {tagline, address, columns}" },
];

export function HomepageManager() {
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const { data: rows } = await supabase.from("homepage_sections").select("*");
    const map: Record<string, any> = {};
    (rows ?? []).forEach((r: any) => { map[r.section_key] = r.content ?? {}; });
    SECTIONS.forEach((s) => { if (!map[s.key]) map[s.key] = defaultFor(s.key); });
    setData(map);
  }
  useEffect(() => { load(); }, []);

  async function save(key: string) {
    setSaving(key);
    const { error } = await supabase.from("homepage_sections").upsert(
      { section_key: key, content: data[key], is_active: true },
      { onConflict: "section_key" },
    );
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(`${key} saved.`);
  }

  function set(key: string, patch: any) { setData({ ...data, [key]: { ...data[key], ...patch } }); }

  return (
    <>
      <PanelHeader eyebrow="Content" title="Homepage CMS." />
      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div key={s.key} className="bg-paper border border-border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-display text-xl">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
              </div>
              <button onClick={() => save(s.key)} disabled={saving === s.key} className="bg-noir text-paper px-5 py-2 eyebrow disabled:opacity-50">
                {saving === s.key ? "Saving…" : "Save"}
              </button>
            </div>
            <SectionEditor key={s.key} sectionKey={s.key} value={data[s.key] ?? {}} onChange={(patch) => set(s.key, patch)} />
          </div>
        ))}
      </div>
    </>
  );
}

function defaultFor(key: string) {
  if (key === "hero") return { headline: "", subheadline: "", cta_label: "", cta_link: "", image: null };
  if (key === "marquee") return { items: "" };
  if (key === "lifestyle") return { tagline: "", image: null };
  if (key === "testimonials") return { json: "[]" };
  if (key === "faqs") return { json: "[]" };
  if (key === "footer") return { tagline: "", address: "", columns: "[]" };
  return {};
}

function SectionEditor({ sectionKey, value, onChange }: { sectionKey: string; value: any; onChange: (patch: any) => void }) {
  if (sectionKey === "hero") return (
    <div className="space-y-3">
      <Input label="Headline" value={value.headline ?? ""} onChange={(e) => onChange({ headline: e.target.value })} />
      <Textarea label="Sub-headline" value={value.subheadline ?? ""} onChange={(e) => onChange({ subheadline: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="CTA label" value={value.cta_label ?? ""} onChange={(e) => onChange({ cta_label: e.target.value })} />
        <Input label="CTA link" value={value.cta_link ?? ""} onChange={(e) => onChange({ cta_link: e.target.value })} />
      </div>
      <div><div className="eyebrow text-muted-foreground mb-2">Image</div>
        <MediaUploader bucket="homepage-media" value={value.image} onChange={(url) => onChange({ image: url })} folder="hero" />
      </div>
    </div>
  );
  if (sectionKey === "lifestyle") return (
    <div className="space-y-3">
      <Input label="Tagline" value={value.tagline ?? ""} onChange={(e) => onChange({ tagline: e.target.value })} />
      <div><div className="eyebrow text-muted-foreground mb-2">Image</div>
        <MediaUploader bucket="homepage-media" value={value.image} onChange={(url) => onChange({ image: url })} folder="lifestyle" />
      </div>
    </div>
  );
  if (sectionKey === "marquee") return (
    <Textarea label="Items (one per line)" value={value.items ?? ""} onChange={(e) => onChange({ items: e.target.value })} />
  );
  // JSON-based sections
  return (
    <Textarea
      label="Content (JSON)"
      className="font-mono text-xs min-h-[180px]"
      value={value.json ?? (sectionKey === "footer" ? JSON.stringify(value, null, 2) : "[]")}
      onChange={(e) => onChange({ json: e.target.value })}
    />
  );
}
