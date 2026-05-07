"use client";

import type { WizardData } from "../page";
import type { Atributos, AtributoKey } from "@/types/database";
import { getModStr } from "@/lib/calculos";

const ATRIBUTO_KEYS: AtributoKey[] = ["FOR", "DES", "CON", "INT", "CAR"];
const ATRIBUTO_LABELS: Record<AtributoKey, string> = {
  FOR: "Força", DES: "Destreza", CON: "Constituição", INT: "Inteligência", CAR: "Carisma",
};
const TOTAL_MELHORIAS = 4;

interface Props {
  wizard: WizardData;
  update: (partial: Partial<WizardData>) => void;
  atributos: Atributos;
}

export function AtributosFinaisStep({ wizard, update, atributos }: Props) {
  const usadas = wizard.melhoriasLivres.length;
  const restantes = TOTAL_MELHORIAS - usadas;

  function addMelhoria(key: AtributoKey) {
    if (usadas >= TOTAL_MELHORIAS) return;
    update({ melhoriasLivres: [...wizard.melhoriasLivres, key] });
  }

  function removeMelhoria(key: AtributoKey) {
    const idx = wizard.melhoriasLivres.lastIndexOf(key);
    if (idx === -1) return;
    const arr = [...wizard.melhoriasLivres];
    arr.splice(idx, 1);
    update({ melhoriasLivres: arr });
  }

  function countFor(key: AtributoKey) {
    return wizard.melhoriasLivres.filter(k => k === key).length;
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm tracking-widest uppercase text-parchment-300">
            Melhorias Livres
          </h3>
          <span className={`font-display text-lg ${restantes > 0 ? "text-parchment-300" : "text-stone-500"}`}>
            {restantes} restante{restantes !== 1 ? "s" : ""}
          </span>
        </div>

        <p className="font-body text-sm text-stone-400 mb-4">
          Distribua {TOTAL_MELHORIAS} melhorias de +2 nos atributos à sua escolha. Você pode melhorar o mesmo atributo múltiplas vezes.
        </p>

        {/* Atributos com controles */}
        <div className="space-y-3">
          {ATRIBUTO_KEYS.map(k => {
            const count = countFor(k);
            const finalValue = atributos[k];
            return (
              <div key={k} className="flex items-center gap-3">
                <div className="w-32">
                  <div className="font-display text-xs tracking-widest uppercase text-stone-400">{k}</div>
                  <div className="font-body text-xs text-stone-500">{ATRIBUTO_LABELS[k]}</div>
                </div>

                {/* Value display */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="bg-stone-800 rounded px-3 py-1.5 min-w-[48px] text-center">
                    <span className="font-display text-base text-parchment-200">{finalValue}</span>
                  </div>
                  <span className="font-body text-xs text-parchment-400">{getModStr(finalValue)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <span className="font-body text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded px-2 py-0.5">
                      +{count * 2}
                    </span>
                  )}
                  <button
                    onClick={() => removeMelhoria(k)}
                    disabled={count === 0}
                    className="w-7 h-7 rounded border border-stone-700 text-stone-400 hover:border-crimson-500 hover:text-crimson-400 disabled:opacity-30 disabled:cursor-not-allowed font-display text-sm transition-all"
                  >
                    −
                  </button>
                  <button
                    onClick={() => addMelhoria(k)}
                    disabled={restantes === 0}
                    className="w-7 h-7 rounded border border-stone-700 text-stone-400 hover:border-parchment-500 hover:text-parchment-300 disabled:opacity-30 disabled:cursor-not-allowed font-display text-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_MELHORIAS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded ${i < usadas ? "bg-parchment-500" : "bg-stone-700"}`}
              />
            ))}
          </div>
          <p className="font-body text-xs text-stone-500 mt-1 text-center">
            {usadas} de {TOTAL_MELHORIAS} melhorias usadas
          </p>
        </div>
      </div>

      {/* Summary table */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">
          Atributos Finais
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {ATRIBUTO_KEYS.map(k => (
            <div key={k} className="text-center bg-stone-800 rounded p-2">
              <div className="font-display text-xs text-stone-400 tracking-widest">{k}</div>
              <div className="font-display text-xl text-parchment-100 mt-1">{atributos[k]}</div>
              <div className="font-body text-xs text-parchment-400">{getModStr(atributos[k])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
