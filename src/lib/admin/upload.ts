import { supabase } from "@/integrations/supabase/client";

export async function uploadToBucket(bucket: string, file: File, folder = ""): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder ? folder + "/" : ""}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
