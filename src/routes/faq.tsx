import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type FAQItem = {
  q: string;
  a: string;
};

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — TESEZ" },
      {
        name: "description",
        content:
          "Answers to common questions about TESEZ products, sizing, customisation, and shipping.",
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaqs();
  }, []);

  async function loadFaqs() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("content")
        .eq("section_key", "faqs")
        .maybeSingle();

      if (error) {
        console.error("FAQ fetch error:", error);
        setFaqs([]);
        return;
      }

      const raw = data?.content?.json ?? "[]";

      let parsed: FAQItem[] = [];
      try {
        const json = JSON.parse(raw);
        parsed = Array.isArray(json) ? json : [];
      } catch (e) {
        console.error("FAQ JSON parse error:", e);
        parsed = [];
      }

      setFaqs(parsed);
    } catch (err) {
      console.error("FAQ load crashed:", err);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-luxe pt-16 pb-32 max-w-4xl">
      <div className="eyebrow text-muted-foreground">Help</div>
      <h1 className="display-xl mt-4">FAQ.</h1>

      {loading ? (
        <div className="mt-16 text-muted-foreground">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="mt-16 text-muted-foreground">
          No FAQs added yet.
        </div>
      ) : (
        <div className="mt-16 divide-y divide-border border-y border-border">
          {faqs.map((item, index) => (
            <details key={`${item.q}-${index}`} className="py-6 group">
              <summary className="cursor-pointer flex justify-between items-center gap-6 font-display text-2xl list-none">
                <span>{item.q}</span>
                <span className="text-xl shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-4 max-w-[90%]">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {item.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}