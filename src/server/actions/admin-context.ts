import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

export async function getAdminDb() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}
