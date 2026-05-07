"use client";

import type { WizardData } from "../page";
import type { Atributos, AtributoKey } from "@/types/database";
import { BIOGRAFIAS } from "@/lib/game-data";
import { getModStr, treinarPericia } from "@/lib/calculos";

const ATRIBUTO_KEYS: AtributoKey[] = ["FOR", "DES", "CON", "INT", "CAR"];

interface Props {
  wizard: WizardData;
  update: (partial: Partial<WizardData>) => void;
  atributos: Atributos;
}

export function BiografiaStep({ wizard, update, atributos }: Props) {
  const bioNames = Object.keys(BIOGRAFIAS);
  const selected = wizard.biografia ? BIOGRAFIAS[wizard.biografia] : null;

  // Determine forced attribute options from first bonus group
  const forcedOptions = selected
    ? selected.bonuses[0].filter(b => b !== "LIVRE")
    : [];

  function handleBio(nome: string) {
    const bio = BIOGRAFIAS[nome];
    // Train the biography skills
    let newPericias = [...wizard.pericias];
    for (const p of bio.pericias) {
      const baseName = p.split(" ")[0]; // handle "Saber: X" type
      newPericias = treinarPericia(newPericias, baseName);
      // Also try exact match
      newPericias = treinarPericia(newPericias, p);
    }

    update({
      biografia: nome,
      biografiaAttrForcado: forcedOptions.length === 1 ? (forcedOptions[0] as AtributoKey) : "",
      biografiaAttrLivre: "",
      pericias: newPericias,
    });
  }

  function setForcado(key: AtributoKey) {
    update({ biografiaAttrForcado: key });
  }

  function setLivre(key: AtributoKey) {
    update({ biografiaAttrLivre: key });
  }

  return (
    <div className="space-y-6">
      {/* Grid de biografias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
        {bioNames.map(nome => {
          const bio = BIOGRAFIAS[nome];
          return (
            <button
              key={nome}
              onClick={() => handleBio(nome)}
              className={`card p-3 text-left transition-all ${
                wizard.biografia === nome
                  ? "border-parchment-500 shadow-glow-amber"
                  : "hover:border-parchment-500/40"
              }`}
            >
              <div className="font-display text-xs text-parchment-200 tracking-wide">{bio.nome}</div>
              <div className="font-body text-xs text-stone-500 mt-1 line-clamp-2">{bio.desc}</div>
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
            <p className="font-body text-sm text-stone-300">{selected.desc}</p>
          </div>

          {/* Perícias treinadas */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Perícias Treinadas</p>
            <div className="flex flex-wrap gap-2">
              {selected.pericias.map(p => (
                <span key={p} className="font-body text-sm bg-stone-800 border border-stone-700 rounded px-2 py-0.5 text-stone-300">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Atributo forçado */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">
              Atributo Forçado (+2)
            </p>
            {forcedOptions.length === 1 ? (
              <span className="font-body text-sm text-parchment-300 bg-parchment-500/10 border border-parchment-500/30 rounded px-3 py-1">
                {forcedOptions[0]} +2 (fixo)
              </span>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {forcedOptions.map(key => (
                  <button
                    key={key}
                    onClick={() => setForcado(key as AtributoKey)}
                    className={`font-display text-sm px-3 py-1 rounded border transition-all ${
                      wizard.biografiaAttrForcado === key
                        ? "border-parchment-500 text-parchment-200 bg-parchment-500/10"
                        : "border-stone-700 text-stone-400 hover:border-stone-500"
                    }`}
                  >
                    {key} +2
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Atributo livre */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">
              Melhoria Livre (+2)
            </p>
            <div className="flex gap-2 flex-wrap">
              {ATRIBUTO_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setLivre(key)}
                  className={`font-display text-sm px-3 py-1 rounded border transition-all ${
                    wizard.biografiaAttrLivre === key
                      ? "border-parchment-500 text-parchment-200 bg-parchment-500/10"
                      : "border-stone-700 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  {key} +2
                </button>
              ))}
            </div>
          </div>

          {/* Preview atributos */}
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Atributos Atuais</p>
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
