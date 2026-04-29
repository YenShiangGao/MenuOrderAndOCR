import "server-only";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase-admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadResult =
  | { ok: true; path: string; url: string }
  | { ok: false; error: string };

export async function uploadMenuImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "只支援 JPG / PNG / WebP" };
  }
  if (file.size === 0) {
    return { ok: false, error: "檔案是空的" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "圖片不可超過 5MB" };
  }

  const ext = EXT_MAP[file.type];
  const path = `items/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) {
    return { ok: false, error: `上傳失敗:${error.message}` };
  }

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return { ok: true, path, url: data.publicUrl };
}

/**
 * 從 public URL 推回 storage 路徑(用於刪除舊圖)。
 * URL 形如 https://xxx.supabase.co/storage/v1/object/public/menu-images/items/xxx.jpg
 */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.slice(idx + marker.length);
}

export async function deleteMenuImage(url: string): Promise<void> {
  const path = pathFromPublicUrl(url);
  if (!path) return;
  // 失敗不擋業務邏輯(M1 容忍 orphan 檔案,日後加 cleanup)
  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([path]);
}
