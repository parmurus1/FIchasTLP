// ============================================================
// Grimório — Lógica de Cálculo do Sistema de RPG
// ============================================================

import type { Atributos, AtributoKey, Pericia, NivelPericia } from "@/types/database";
import type { SystemSettings } from "@/types/database";
import { DEFAULT_SETTINGS } from "@/types/database";

/** Calcula o modificador de um atributo: floor((valor - 10) / 2) */
export function getModificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

/** Retorna string formatada do modificador: "+3" ou "-1" */
export function getModStr(valor: number): string {
  const mod = getModificador(valor);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Retorna o atributo associado a uma perícia */
export function getAtributoDaPericia(nomePericia: string): AtributoKey {
  const map: Record<string, AtributoKey> = {
    Acrobacia: "DES",
    Arcanismo: "INT",
    Atletismo: "FOR",
    Diplomacia: "CAR",
    Dissimulação: "CAR",
    Furtividade: "DES",
    Intimidação: "CAR",
    Ladroagem: "DES",
    Manufatura: "INT",
    Medicina: "INT",
    Natureza: "INT",
    Ocultismo: "INT",
    Performance: "CAR",
    Religião: "CAR",
    Sobrevivência: "INT",
    Sociedade: "INT",
  };
  return map[nomePericia] ?? "INT";
}

/** Calcula o bônus total de uma perícia */
export function getBonusPericia(
  pericia: Pericia,
  atributos: Atributos,
  settings: SystemSettings = DEFAULT_SETTINGS
): number {
  const mod = getModificador(atributos[pericia.atributo]);
  let bonus = mod;

  if (pericia.nivel === "treinado") {
    bonus += settings.bonus_proficiencia;
  } else if (pericia.nivel === "especialista") {
    bonus += settings.bonus_especialista;
  }

  if (pericia.bonus_extra) {
    bonus += pericia.bonus_extra;
  }

  return bonus;
}

/** Aplica melhorias de ancestralidade nos atributos (+2 each bonus, -2 each defeito) */
export function aplicarMelhoriasAncestralidade(
  atributos: Atributos,
  bonuses: string[],
  defeitos: string[],
  escolhasLivres: AtributoKey[] = []
): Atributos {
  const result = { ...atributos };
  let livreIdx = 0;

  for (const b of bonuses) {
    if (b === "LIVRE") {
      const escolha = escolhasLivres[livreIdx++];
      if (escolha) result[escolha] = (result[escolha] ?? 10) + 2;
    } else {
      const key = b as AtributoKey;
      result[key] = (result[key] ?? 10) + 2;
    }
  }

  for (const d of defeitos) {
    const key = d as AtributoKey;
    result[key] = (result[key] ?? 10) - 2;
  }

  return result;
}

/** Aplica melhorias da biografia (atributo forçado + livre) */
export function aplicarMelhoriasBiografia(
  atributos: Atributos,
  attrForcado: AtributoKey,
  attrLivre: AtributoKey
): Atributos {
  return {
    ...atributos,
    [attrForcado]: atributos[attrForcado] + 2,
    [attrLivre]: atributos[attrLivre] + 2,
  };
}

/** Aplica melhoria da classe no atributo-chave */
export function aplicarMelhoriaClasse(
  atributos: Atributos,
  attrChave: AtributoKey
): Atributos {
  return {
    ...atributos,
    [attrChave]: atributos[attrChave] + 2,
  };
}

/** Aplica N melhorias livres (+2 cada) */
export function aplicarMelhoriasLivres(
  atributos: Atributos,
  escolhas: AtributoKey[]
): Atributos {
  const result = { ...atributos };
  for (const key of escolhas) {
    result[key] = (result[key] ?? 10) + 2;
  }
  return result;
}

/** Cria a lista inicial de perícias (todas destreinadas) */
export function criarPericiasPadrao(): Pericia[] {
  const lista = [
    { nome: "Acrobacia", atributo: "DES" as AtributoKey },
    { nome: "Arcanismo", atributo: "INT" as AtributoKey },
    { nome: "Atletismo", atributo: "FOR" as AtributoKey },
    { nome: "Diplomacia", atributo: "CAR" as AtributoKey },
    { nome: "Dissimulação", atributo: "CAR" as AtributoKey },
    { nome: "Furtividade", atributo: "DES" as AtributoKey },
    { nome: "Intimidação", atributo: "CAR" as AtributoKey },
    { nome: "Ladroagem", atributo: "DES" as AtributoKey },
    { nome: "Manufatura", atributo: "INT" as AtributoKey },
    { nome: "Medicina", atributo: "INT" as AtributoKey },
    { nome: "Natureza", atributo: "INT" as AtributoKey },
    { nome: "Ocultismo", atributo: "INT" as AtributoKey },
    { nome: "Performance", atributo: "CAR" as AtributoKey },
    { nome: "Religião", atributo: "CAR" as AtributoKey },
    { nome: "Sobrevivência", atributo: "INT" as AtributoKey },
    { nome: "Sociedade", atributo: "INT" as AtributoKey },
  ];

  return lista.map((p) => ({ ...p, nivel: "destreinado" as NivelPericia }));
}

/** Treina uma perícia (seta para "treinado" se destreinada) */
export function treinarPericia(pericias: Pericia[], nome: string): Pericia[] {
  return pericias.map((p) =>
    p.nome === nome && p.nivel === "destreinado" ? { ...p, nivel: "treinado" as NivelPericia } : p
  );
}

/** Calcula PV base (classe + ancestralidade + mod CON) */
export function calcularPVBase(
  classePV: number,
  ancestralidadePV: number,
  conMod: number
): number {
  return classePV + ancestralidadePV + conMod;
}
