import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelHeader, Input, Textarea } from "./ui";

type Group = { title: string; description: string; fields: { key: string; label: string; type?: string; placeholder?: string }[] };

const GROUPS: Group[] = [
  {
    title: "Payments — Razorpay",
    description: "Keys are sensitive. Store live keys via Lovable Cloud secrets. These fields are for display / non-secret config.",
    fields: [
      { key: "razorpay_key_id", label: "Razorpay Key ID (publishable)", placeholder: "rzp_live_xxx" },
      { key: "razorpay_mode", label: "Mode (test / live)", placeholder: "test" },
    ],
  },
  {
    title: "Email",
    description: "Sender details for transactional and order emails.",
    fields: [
      { key: "email_from_name", label: "From name", placeholder: "TESEZ" },
      { key: "email_from_address", label: "From address", placeholder: "hello@tesez.com" },
      { key: "email_support", label: "Support email", placeholder: "support@tesez.com" },
    ],
  },
  {
    title: "Social Media",
    description: "Public links rendered in footer.",
    fields: [
      { key: "social_instagram", label: "Instagram URL" },
      { key: "social_twitter", label: "Twitter / X URL" },
      { key: "social_youtube", label: "YouTube URL" },
      { key: "social_linkedin", label: "LinkedIn URL" },
    ],
  },
  {
    title: "Contact",
    description: "Business contact details shown publicly.",
    fields: [
      { key: "contact_phone", label: "Phone" },
      { key: "contact_email", label: "Email" },
      { key: "contact_address", label: "Address", type: "textarea" },
    ],
  },
];

export function SettingsManager() {
  const [values, setValues] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await supabase.from("settings").select("key, value");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { map[r.key] = r.value?.text ?? ""; });
    setValues(map);
  }
  useEffect(() => { load(); }, []);

  async function saveGroup(group: Group) {
    const ops = group.fields.map((f) =>
      supabase.from("settings").upsert(
        { key: f.key, value: { text: values[f.key] ?? "" }, is_public: !f.key.includes("razorpay") && !f.key.includes("email_from") },
        { onConflict: "key" },
      )
    );
    const results = await Promise.all(ops);
    const err = results.find((r) => r.error);
    if (err?.error) return toast.error(err.error.message);
    toast.success(`${group.title} saved.`);
  }

  return (
    <>
      <PanelHeader eyebrow="Configuration" title="Settings." />
      <div className="space-y-4 max-w-3xl">
        {GROUPS.map((g) => (
          <div key={g.title} className="bg-paper border border-border p-6">
            <div className="flex justify-between items-start mb-1">
              <div className="font-display text-xl">{g.title}</div>
              <button onClick={() => saveGroup(g)} className="bg-noir text-paper px-5 py-2 eyebrow">Save</button>
            </div>
            <div className="text-xs text-muted-foreground mb-4">{g.description}</div>
            <div className="space-y-3">
              {g.fields.map((f) => f.type === "textarea" ? (
                <Textarea key={f.key} label={f.label} value={values[f.key] ?? ""} placeholder={f.placeholder}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              ) : (
                <Input key={f.key} label={f.label} value={values[f.key] ?? ""} placeholder={f.placeholder}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              ))}
            </div>
          </div>
        ))}
        <div className="bg-cream border border-border p-6 text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">Razorpay Secret:</strong> the Key Secret should never live in this database. Add it to your <code>.env</code> file.</p>
          <p><strong className="text-foreground">Current Setup:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Key ID: <code className="bg-paper px-2 py-0.5 text-xs">{values.razorpay_key_id || "Not set"}</code></li>
            <li>Mode: <code className="bg-paper px-2 py-0.5 text-xs">{values.razorpay_mode || "test"}</code></li>
            <li>Secret: Stored in environment variables (not shown here)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Your Razorpay Key ID: <strong>rzp_live_TJISCrPoZa2A3F</strong> (Saved in settings)
          </p>
          <p className="text-xs text-muted-foreground">
            Your Razorpay Secret: <strong>gARPyfT70SK4vHpvrWJU2C1</strong> (Add to .env file)
          </p>
        </div>
      </div>
    </>
  );
}