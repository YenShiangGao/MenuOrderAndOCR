import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: buckets, error } = await supabase.storage.listBuckets();
if (error) {
  console.error("Error listing buckets:", error.message);
  process.exit(1);
}

console.log("Buckets found:");
buckets.forEach((b) => console.log(`  - ${b.name} (public=${b.public})`));

const menuBucket = buckets.find((b) => b.name === "menu-images");
if (!menuBucket) {
  console.log("\nmenu-images bucket NOT FOUND");
  process.exit(2);
}
if (!menuBucket.public) {
  console.log("\nmenu-images bucket exists but is PRIVATE — needs public=true");
  process.exit(3);
}
console.log("\nOK menu-images bucket exists and is public");
