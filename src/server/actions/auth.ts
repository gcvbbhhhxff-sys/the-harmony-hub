"use server";

import { createClient } from "@/lib/supabase/server";

export async function startAnonymousSession() {
  try {
    const supabase = await createClient();
    const { data: current, error: currentError } = await supabase.auth.getUser();
    if (currentError) {
      console.error("[startAnonymousSession/getUser]", currentError);
    }

    if (current.user) return { ok: true };

    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("[startAnonymousSession/signInAnonymously]", error);
      return { ok: false, message: "Não foi possível iniciar a sessão de pedido. Verifique se o acesso anônimo está habilitado no Supabase." };
    }

    return { ok: true };
  } catch (error) {
    console.error("[startAnonymousSession]", error);
    return { ok: false, message: "Erro ao iniciar sessão." };
  }
}
