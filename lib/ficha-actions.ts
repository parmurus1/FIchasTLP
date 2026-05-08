"use server";

import { createClient } from "@/lib/supabase/server";
import type { FichaData } from "@/types/database";

export async function finalizarCriacao(
  playerId: string,
  nome: string,
  dados: FichaData
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("fichas") as any)
    .insert({ player_id: playerId, nome, dados: dados as unknown as Record<string, unknown> })
    .select("id")
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Nenhum dado retornado" };
  return { id: data.id };
}

export async function atualizarFicha(
  fichaId: string,
  dados: FichaData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("fichas") as any)
    .update({ dados: dados as unknown as Record<string, unknown> })
    .eq("id", fichaId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletarFicha(
  fichaId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("fichas").delete().eq("id", fichaId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}