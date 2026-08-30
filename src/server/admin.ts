import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id,papel")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar admin:", error);
    return null;
  }

  if (!admin) return null;

  return { user, admin };
}
