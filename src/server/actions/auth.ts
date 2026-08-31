"use server";

import { createClient } from "@/lib/supabase/server";

export async function startAnonymousSession() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { ok: false, message: "Não foi possível iniciar sessão. Recarregue a página." };
    }
    
    return { ok: true };
  } catch (error) {
    console.error("[startAnonymousSession]", error);
    return { ok: false, message: "Erro ao iniciar sessão." };
  }
}
