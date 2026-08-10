import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadToBucket } from "@/lib/admin/upload";

export function MediaUploader({
  bucket, value, onChange, folder, accept = "image/*", label = "Upload image",
}: {
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  accept?: string;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function pick(file: File) {
    setUploading(true);
    try {
      const url = await uploadToBucket(bucket, file, folder);
      onChange(url);
      toast.success("Uploaded.");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative w-20 h-20 border border-border">
          <img src={value} className="w-full h-full object-cover" alt="" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-noir text-paper rounded-full p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 border border-foreground px-4 py-2 eyebrow disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {label}
      </button>
    </div>
  );
}

export function MultiMediaUploader({
  bucket, values, onChange, folder, accept = "image/*",
}: {
  bucket: string;
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function pickMany(files: FileList) {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadToBucket(bucket, file, folder));
      }
      onChange([...values, ...urls]);
      toast.success(`Uploaded ${urls.length} file${urls.length > 1 ? "s" : ""}.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={url} className="relative w-20 h-20 border border-border">
            <img src={url} className="w-full h-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="absolute -top-2 -right-2 bg-noir text-paper rounded-full p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) pickMany(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="mt-3 flex items-center gap-2 border border-foreground px-4 py-2 eyebrow disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        Add images
      </button>
    </div>
  );
}

export function PanelHeader({
  title, eyebrow: e, action,
}: { title: string; eyebrow: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <div className="eyebrow text-muted-foreground">{e}</div>
        <h1 className="display-lg mt-2">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open, onClose, title, children, wide,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    function esc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-noir/60 flex items-start justify-center overflow-auto py-10 px-4">
      <div className={`bg-paper w-full ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="eyebrow">{title}</div>
          <button onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input {...props} className={`mt-2 w-full border border-border bg-paper px-3 py-2 outline-none focus:border-noir transition ${props.className ?? ""}`} />
    </label>
  );
}

export function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <textarea {...props} className={`mt-2 w-full border border-border bg-paper px-3 py-2 outline-none focus:border-noir transition min-h-[100px] ${props.className ?? ""}`} />
    </label>
  );
}

export function Select({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <select {...props} className="mt-2 w-full border border-border bg-paper px-3 py-2 outline-none focus:border-noir transition">
        {children}
      </select>
    </label>
  );
}
