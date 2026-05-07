"use server";

import { createClient } from "@/lib/supabase/server";
import { criarPericiasPadrao } from "@/lib/calculos";
import type { FichaData } from "@/types/database";

export function criarFichaBase(nome: string): FichaData {
  return {
    ancestralidade: "",
    heranca: "",
    classe: "",
    escola: "",
    talento_classe: "",
    biografia: "",
    nivel: 1,
    avatar_url: undefined,
    atributos: { FOR: 10, DES: 10, CON: 10, INT: 10, CAR: 10 },
    pericias: criarPericiasPadrao(),
    habilidades: [],
    idiomas: ["Comum"],
    inventario: [],
    dinheiro: { PC: 0, PP: 0, PO: 0, PPl: 0 },
    combate: {
      pv_atual: 10,
      pv_maximo: 10,
      pv_temporario: 0,
      ca: 10,
      iniciativa_bonus: 0,
      condicoes: [],
      testes_morte: { sucessos: 0, falhas: 0 },
    },
    sanidade: 5,
    corrupcao: 0,
    reputacao: [],
    notas: "",
  };
}

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
