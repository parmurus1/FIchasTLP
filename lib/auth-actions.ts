"use server";

import { createClient } from "@/lib/supabase/server";

// MASTER_SECRET sem NEXT_PUBLIC_ → fica só no servidor, nunca vai pro bundle do browser
const MASTER_SECRET = process.env.MASTER_SECRET ?? "arcana-mestre-2024";

export async function registrarUsuario(
  email: string,
  password: string,
  username: string,
  role: string,
  masterKey: string
): Promise<{ success: boolean; error?: string; redirectTo?: string }> {
  // Valida a chave do mestre no servidor
  if (role === "mestre" && masterKey !== MASTER_SECRET) {
    return { success: false, error: "Chave de Mestre inválida." };
  }

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, role },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  return {
    success: true,
    redirectTo: role === "mestre" ? "/mestre" : "/dashboard",
  };
}
