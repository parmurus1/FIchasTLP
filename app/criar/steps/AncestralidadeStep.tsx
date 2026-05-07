"use client";

import type { WizardData } from "../page";
import type { Atributos, AtributoKey } from "@/types/database";
import { ANCESTRALIDADES } from "@/lib/game-data";
import { getModStr } from "@/lib/calculos";

const ATRIBUTO_KEYS: AtributoKey[] = ["FOR", "DES", "CON", "INT", "CAR"];
const ATRIBUTO_LABELS: Record<AtributoKey, string> = {
  FOR: "FOR", DES: "DES", CON: "CON", INT: "INT", CAR: "CAR",
};

interface Props {
  wizard: WizardData;
  update: (partial: Partial<WizardData>) => void;
  atributos: Atributos;
}

export function AncestralidadeStep({ wizard, update, atributos }: Props) {
  const ancNames = Object.keys(ANCESTRALIDADES);
  const selected = wizard.ancestralidade ? ANCESTRALIDADES[wizard.ancestralidade] : null;

  // Count how many LIVRE bonuses the selected ancestry has
  const livreCount = selected ? selected.bonuses.filter(b => b === "LIVRE").length : 0;

  function handleAnc(nome: string) {
    const anc = ANCESTRALIDADES[nome];
    update({
      ancestralidade: nome,
      heranca: anc.heranças[0]?.id ?? "",
      escolhasLivresAnc: [],
      idiomas: [...anc.idiomas],
      habilidades: wizard.habilidades
        .filter(h => h.origem !== "ancestralidade")
        .concat([{
          nome: anc.habilidade_racial,
          descricao: anc.habilidade_racial_desc,
          origem: "ancestralidade",
        }]),
    });
  }

  function handleLivre(idx: number, key: AtributoKey) {
    const arr = [...wizard.escolhasLivresAnc];
    arr[idx] = key;
    update({ escolhasLivresAnc: arr });
  }

  return (
    <div className="space-y-6">
      {/* Grid de ancestralidades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ancNames.map(nome => {
          const anc = ANCESTRALIDADES[nome];
          const isSelected = wizard.ancestralidade === nome;
          return (
            <button
              key={nome}
              onClick={() => handleAnc(nome)}
              className={`card p-3 text-left transition-all ${
                isSelected
                  ? "border-parchment-500 shadow-glow-amber"
                  : "hover:border-parchment-500/40"
              }`}
            >
              <div className="font-display text-sm text-parchment-200 tracking-wide mb-1">{anc.nome}</div>
              <div className="font-body text-xs text-stone-400">
                PV {anc.pv} · {anc.tamanho}
              </div>
              <div className="font-body text-xs text-stone-500 mt-1">
                {anc.bonuses.map((b, i) => (
                  <span key={i} className="text-emerald-400 mr-1">{b === "LIVRE" ? "✦" : `+${b}`}</span>
                ))}
                {anc.defeitos.map((d, i) => (
                  <span key={i} className="text-crimson-400 mr-1">-{d}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalhes da ancestralidade selecionada */}
      {selected && (
        <div className="card p-5 space-y-4">
          <div>
            <h3 className="font-display text-base text-parchment-200 tracking-widest uppercase mb-2">
              {selected.nome}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-body">
              <span className="badge-player">PV {selected.pv}</span>
              <span className="badge-player">{selected.tamanho}</span>
              <span className="badge-player">{selected.deslocamento}</span>
            </div>
          </div>

          {/* Bônus e defeitos */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Melhorias de Atributo</p>
            <div className="flex flex-wrap gap-2">
              {selected.bonuses.map((b, i) => (
                <span key={i} className={`font-body text-sm px-2 py-0.5 rounded border ${b === "LIVRE" ? "border-parchment-500/50 text-parchment-300" : "border-emerald-700 text-emerald-400"}`}>
                  {b === "LIVRE" ? "✦ Livre +2" : `${b} +2`}
                </span>
              ))}
              {selected.defeitos.map((d, i) => (
                <span key={i} className="font-body text-sm px-2 py-0.5 rounded border border-crimson-600 text-crimson-400">
                  {d} -2
                </span>
              ))}
            </div>
          </div>

          {/* Escolhas livres */}
          {livreCount > 0 && (
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">
                Escolha Atributo Livre ({livreCount} escolha{livreCount > 1 ? "s" : ""})
              </p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: livreCount }).map((_, i) => (
                  <div key={i} className="flex gap-1">
                    {ATRIBUTO_KEYS.map(key => (
                      <button
                        key={key}
                        onClick={() => handleLivre(i, key)}
                        className={`font-display text-xs px-2 py-1 rounded border transition-all ${
                          wizard.escolhasLivresAnc[i] === key
                            ? "border-parchment-500 text-parchment-200 bg-parchment-500/10"
                            : "border-stone-700 text-stone-400 hover:border-stone-500"
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Herança */}
          {selected.heranças.length > 0 && (
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Herança</p>
              <div className="space-y-2">
                {selected.heranças.map(h => (
                  <button
                    key={h.id}
                    onClick={() => update({ heranca: h.id })}
                    className={`w-full text-left card p-3 transition-all ${
                      wizard.heranca === h.id
                        ? "border-parchment-500/70 bg-parchment-500/5"
                        : "hover:border-parchment-500/30"
                    }`}
                  >
                    <div className="font-display text-sm text-parchment-200">{h.nome}</div>
                    <div className="font-body text-xs text-stone-400 mt-1">{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Habilidade racial */}
          <div className="bg-stone-800/60 rounded p-3">
            <p className="font-display text-xs tracking-widest uppercase text-parchment-500 mb-1">
              Habilidade Racial
            </p>
            <p className="font-display text-sm text-parchment-200">{selected.habilidade_racial}</p>
            <p className="font-body text-xs text-stone-300 mt-1">{selected.habilidade_racial_desc}</p>
          </div>

          {/* Idiomas */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-1">Idiomas</p>
            <div className="flex flex-wrap gap-1">
              {selected.idiomas.map(id => (
                <span key={id} className="font-body text-xs bg-stone-800 border border-stone-700 rounded px-2 py-0.5 text-stone-300">
                  {id}
                </span>
              ))}
            </div>
          </div>

          {/* Atributos com melhorias aplicadas */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Atributos após Ancestralidade</p>
            <div className="flex gap-3 flex-wrap">
              {ATRIBUTO_KEYS.map(k => (
                <div key={k} className="text-center bg-stone-800 rounded px-3 py-2">
                  <div className="font-display text-xs text-stone-400 tracking-widest">{k}</div>
                  <div className="font-display text-lg text-parchment-200">{atributos[k]}</div>
                  <div className="font-body text-xs text-parchment-400">{getModStr(atributos[k])}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
