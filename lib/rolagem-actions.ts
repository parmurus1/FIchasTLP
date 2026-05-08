"use server";

import { createClient } from "@/lib/supabase/server";
import type { Rolagem } from "@/types/database";

export async function realizarRolagem(
  fichaId: string | null,
  tipo: string,
  nome: string,
  modificador: number
): Promise<{ rolagem: Rolagem } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const valorDado = Math.floor(Math.random() * 20) + 1;
  const total = valorDado + modificador;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("rolagens") as any)
    .insert({
      ficha_id: fichaId,
      user_id: user.id,
      tipo,
      nome_rolagem: nome,
      dado_base: 20,
      valor_dado: valorDado,
      modificador,
      resultado_total: total,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { rolagem: data as unknown as Rolagem };
}

export async function buscarRolagens(
  fichaId?: string,
  limit = 20
): Promise<Rolagem[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("rolagens") as any)
    .select("*, profiles(username), fichas(id, nome)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (fichaId) {
    query = query.eq("ficha_id", fichaId);
  }

  const { data } = await query;
  return (data ?? []) as unknown as Rolagem[];
}