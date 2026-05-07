"use server";

import { createClient } from "@/lib/supabase/server";
import type { IniciativaEntry } from "@/types/database";

export async function adicionarIniciativa(
  nome: string,
  valor: number,
  tipo: "jogador" | "monstro" | "npc"
): Promise<{ entry: IniciativaEntry } | { error: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("iniciativas")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .single();

  const novaOrdem = (existing?.ordem ?? 0) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("iniciativas") as any)
    .insert({ nome, iniciativa_valor: valor, tipo, ativo: false, ordem: novaOrdem })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { entry: data as IniciativaEntry };
}

export async function atualizarOrdem(
  lista: Array<{ id: string; ordem: number; ativo: boolean }>
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  for (const item of lista) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("iniciativas") as any)
      .update({ ordem: item.ordem, ativo: item.ativo })
      .eq("id", item.id);
  }

  return { success: true };
}

export async function limparIniciativas(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase.from("iniciativas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  return { success: true };
}

export async function getIniciativas(): Promise<IniciativaEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("iniciativas")
    .select("*")
    .order("iniciativa_valor", { ascending: false });
  return (data ?? []) as IniciativaEntry[];
}

export async function removerIniciativa(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase.from("iniciativas").delete().eq("id", id);
  return { success: true };
}

export async function marcarAtivo(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("iniciativas") as any).update({ ativo: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("iniciativas") as any).update({ ativo: true }).eq("id", id);
  return { success: true };
}
