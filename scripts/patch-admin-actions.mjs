import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const files = [
  "src/app/admin/faqs/actions.ts",
  "src/app/admin/categories/actions.ts",
  "src/app/admin/ads/actions.ts",
  "src/app/admin/platforms/actions.ts",
  "src/app/admin/homepage/actions.ts",
  "src/app/admin/settings/actions.ts",
  "src/app/admin/payments/actions.ts",
];

for (const rel of files) {
  const fp = path.join(root, rel);
  let s = fs.readFileSync(fp, "utf8");
  if (s.includes("requireAdminForAction")) {
    console.log("skip", rel);
    continue;
  }
  s = s.replace(
    'import { createSupabaseServerClient } from "@/lib/supabase/server";',
    'import { requireAdminForAction } from "@/lib/auth/require-admin";',
  );
  s = s.replace(
    /const supabase = await createSupabaseServerClient\(\);/g,
    "const gate = await requireAdminForAction();\n  if (!gate.ok) return gate;\n  const { supabase } = gate;",
  );
  fs.writeFileSync(fp, s);
  console.log("patched", rel);
}
