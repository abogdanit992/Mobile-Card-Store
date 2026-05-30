import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const MEDIA_BUCKET = "media";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Upload an image to the public `media` bucket and return its public URL.
 * Returns null when no file was provided. Throws on validation/upload error.
 * Uses the service-role client, so it bypasses storage RLS.
 */
export async function uploadImageFile(
  file: FormDataEntryValue | null,
  prefix: string,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Uploaded file must be an image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large (max 5 MB).");
  }

  const ext = (file.name.split(".").pop() || "png")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5) || "png";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const admin = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(MEDIA_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
