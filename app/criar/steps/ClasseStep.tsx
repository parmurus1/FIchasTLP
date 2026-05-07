"use client";

import type { WizardData } from "../page";
import type { Atributos } from "@/types/database";
import { CLASSES } from "@/lib/game-data";
import { getModStr } from "@/lib/calculos";

const ATRIBUTO_KEYS = ["FOR", "DES", "CON", "INT", "CAR"] as const;

interface Props {
  wizard: WizardData;
  update: (partial: Partial<WizardData>) => void;
  atributos: Atributos;
}

export function ClasseStep({ wizard, update, atributos }: Props) {
  const classeNames = Object.keys(CLASSES);
  const selected = wizard.classe ? CLASSES[wizard.classe] : null;

  function handleClasse(nome: string) {
    const c = CLASSES[nome];
    update({
      classe: nome,
      escola: c.escolas[0]?.id ?? "",
      talento_classe: c.talentos[0]?.id ?? "",
      habilidades: wizard.habilidades
        .filter(h => h.origem !== "classe")
        .concat([{
          nome: c.habilidade,
          descricao: c.habilidade_desc,
          origem: "classe",
        }]),
    });
  }

  return (
    <div className="space-y-6">
      {/* Grid classes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {classeNames.map(nome => {
          const c = CLASSES[nome];
          return (
            <button
              key={nome}
              onClick={() => handleClasse(nome)}
              className={`card p-3 text-left transition-all ${
                wizard.classe === nome
                  ? "border-parchment-500 shadow-glow-amber"
                  : "hover:border-parchment-500/40"
              }`}
            >
              <div className="font-display text-sm text-parchment-200 tracking-wide">{c.nome}</div>
              <div className="font-body text-xs text-stone-400 mt-1">
                PV {c.pv} · Chave: {c.atributo_chave}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalhes */}
      {selected && (
        <div className="card p-5 space-y-4">
          <div>
            <h3 className="font-display text-base text-parchment-200 tracking-widest uppercase mb-1">
              {selected.nome}
            </h3>
            <p className="font-body text-sm text-stone-300">{selected.descricao}</p>
          </div>

          <div className="flex gap-3">
            <div className="bg-stone-800 rounded px-3 py-2 text-center">
              <div className="font-display text-xs text-stone-400 tracking-widest">PV Base</div>
              <div className="font-display text-lg text-parchment-200">{selected.pv}</div>
            </div>
            <div className="bg-stone-800 rounded px-3 py-2 text-center">
              <div className="font-display text-xs text-stone-400 tracking-widest">Chave</div>
              <div className="font-display text-lg text-parchment-200">{selected.atributo_chave}</div>
            </div>
          </div>

          {/* Perícias */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Perícias da Classe</p>
            <div className="flex flex-wrap gap-1">
              {selected.pericias.map(p => (
                <span key={p} className="font-body text-xs bg-stone-800 border border-stone-700 rounded px-2 py-0.5 text-stone-300">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Escola */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Escola / Estilo</p>
            <div className="space-y-2">
              {selected.escolas.map(e => (
                <button
                  key={e.id}
                  onClick={() => update({ escola: e.id })}
                  className={`w-full text-left card p-3 transition-all ${
                    wizard.escola === e.id
                      ? "border-parchment-500/70 bg-parchment-500/5"
                      : "hover:border-parchment-500/30"
                  }`}
                >
                  <div className="font-display text-sm text-parchment-200">{e.nome}</div>
                  <div className="font-body text-xs text-stone-400 mt-1">{e.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Talento */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Talento de Classe</p>
            <div className="space-y-2">
              {selected.talentos.map(t => (
                <button
                  key={t.id}
                  onClick={() => update({ talento_classe: t.id })}
                  className={`w-full text-left card p-3 transition-all ${
                    wizard.talento_classe === t.id
                      ? "border-parchment-500/70 bg-parchment-500/5"
                      : "hover:border-parchment-500/30"
                  }`}
                >
                  <div className="font-display text-sm text-parchment-200">{t.nome}</div>
                  <div className="font-body text-xs text-stone-400 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Habilidade */}
          <div className="bg-stone-800/60 rounded p-3">
            <p className="font-display text-xs tracking-widest uppercase text-parchment-500 mb-1">Habilidade de Classe</p>
            <p className="font-display text-sm text-parchment-200">{selected.habilidade}</p>
            <p className="font-body text-xs text-stone-300 mt-1">{selected.habilidade_desc}</p>
          </div>

          {/* Atributos atuais */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Atributos Atuais</p>
            <div className="flex gap-3 flex-wrap">
              {ATRIBUTO_KEYS.map(k => (
                <div key={k} className="text-center bg-stone-800 rounded px-3 py-2">
                  <div className="font-display text-xs text-stone-400 tracking-widest">{k}</div>
                  <div className={`font-display text-lg ${k === selected.atributo_chave ? "text-parchment-300" : "text-parchment-200"}`}>
                    {atributos[k]}
                  </div>
                  <div className="font-body text-xs text-parchment-400">{getModStr(atributos[k])}</div>
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-stone-500 mt-1">
              * {selected.atributo_chave} recebe +2 da classe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
