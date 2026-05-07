"use server";

import { createClient } from "@/lib/supabase/server";
import type { FichaData } from "@/types/database";

export async function finalizarCriacao(
  playerId: string,
  nome: string,
  dados: FichaData
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fichas")
    .insert({ player_id: playerId, nome, dados: dados as unknown as Record<string, unknown> })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function atualizarFicha(
  fichaId: string,
  dados: FichaData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("fichas")
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
