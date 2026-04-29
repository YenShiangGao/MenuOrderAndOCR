import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "menu-images";

// 1×1 透明 PNG (67 bytes)
const PNG_BYTES = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63fcffff3f0300050001ff8a91d49d0000000049454e44ae426082",
  "hex",
);

const path = `items/test-${Date.now()}.png`;

console.log(`Uploading ${path} (${PNG_BYTES.length} bytes)...`);

const { error: upErr } = await supabase.storage
  .from(BUCKET)
  .upload(path, PNG_BYTES, {
    contentType: "image/png",
    cacheControl: "31536000",
  });

if (upErr) {
  console.error("Upload failed:", upErr.message);
  process.exit(1);
}

const {
  data: { publicUrl },
} = supabase.storage.from(BUCKET).getPublicUrl(path);

console.log(`Uploaded. Public URL: ${publicUrl}`);

const head = await fetch(publicUrl, { method: "HEAD" });
console.log(`HEAD ${publicUrl} → ${head.status} ${head.headers.get("content-type")}`);

if (head.status !== 200) {
  console.error("Public URL not reachable");
  process.exit(2);
}

// 清理測試檔
const { error: delErr } = await supabase.storage.from(BUCKET).remove([path]);
if (delErr) console.warn("Cleanup failed:", delErr.message);
else console.log("Cleanup OK");
