"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginAdmin(email: string, password: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("[loginAdmin]", error);
      return { ok: false, message: error.message || "Erro ao fazer login." };
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("id,papel")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      return { ok: false, message: "Usuário não é administrador." };
    }

    return { ok: true };
  } catch (error) {
    console.error("[loginAdmin]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer login." };
  }
}

export async function logoutAdmin() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[logoutAdmin]", error);
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("[logoutAdmin]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer logout." };
  }
}
