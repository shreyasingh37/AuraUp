import { getSupabase } from "./supabaseClient";

export type PhotoRow = {
  id: string;
  user_id: string;
  image_url: string; // storage path, e.g. "<uid>/2026-04-17.jpg"
  date: string; // YYYY-MM-DD
};

export const PHOTOS_BUCKET = "photos";

export function pickImageExt(file: File) {
  const t = file.type.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  return "jpg";
}

export function buildPhotoPath(userId: string, dateISO: string, ext: string) {
  return `${userId}/${dateISO}.${ext}`;
}

export async function getPhotoForDate(userId: string, date: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("id,user_id,image_url,date")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as PhotoRow | null;
}

export async function listPhotos(userId: string, limit = 366) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("id,user_id,image_url,date")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PhotoRow[];
}

export async function uploadDailyPhoto(userId: string, dateISO: string, file: File) {
  const supabase = getSupabase();
  const ext = pickImageExt(file);
  const path = buildPhotoPath(userId, dateISO, ext);

  const existing = await getPhotoForDate(userId, dateISO);

  const { error: upErr } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
  if (upErr) throw upErr;

  const { data, error: dbErr } = await supabase
    .from("photos")
    .upsert({ user_id: userId, date: dateISO, image_url: path }, { onConflict: "user_id,date" })
    .select("id,user_id,image_url,date")
    .single();
  if (dbErr) throw dbErr;

  if (existing && existing.image_url !== path) {
    // Best-effort cleanup of the previous daily photo file.
    await supabase.storage.from(PHOTOS_BUCKET).remove([existing.image_url]);
  }

  return data as PhotoRow;
}

export async function createSignedPhotoUrl(storagePath: string, expiresIn = 60 * 60) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
