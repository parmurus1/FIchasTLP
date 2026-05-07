"use client";

import type { WizardData } from "../page";
import type { Atributos } from "@/types/database";
import { ANCESTRALIDADES, CLASSES, BIOGRAFIAS } from "@/lib/game-data";
import { getModStr, calcularPVBase } from "@/lib/calculos";

const ATRIBUTO_KEYS = ["FOR", "DES", "CON", "INT", "CAR"] as const;
const ATRIBUTO_LABELS: Record<string, string> = {
  FOR: "Força", DES: "Destreza", CON: "Constituição", INT: "Inteligência", CAR: "Carisma",
};

interface Props {
  wizard: WizardData;
  atributos: Atributos;
}

export function ResumoStep({ wizard, atributos }: Props) {
  const anc = wizard.ancestralidade ? ANCESTRALIDADES[wizard.ancestralidade] : null;
  const cls = wizard.classe ? CLASSES[wizard.classe] : null;
  const bio = wizard.biografia ? BIOGRAFIAS[wizard.biografia] : null;

  const pvMax = calcularPVBase(
    cls?.pv ?? 8,
    anc?.pv ?? 8,
    Math.floor((atributos.CON - 10) / 2)
  );

  const escola = cls?.escolas.find(e => e.id === wizard.escola);
  const talento = cls?.talentos.find(t => t.id === wizard.talento_classe);
  const heranca = anc?.heranças.find(h => h.id === wizard.heranca);

  const periciasTreinadas = wizard.pericias.filter(p => p.nivel !== "destreinado");

  return (
    <div className="space-y-5">
      {/* Identidade */}
      <div className="card p-5">
        <h3 className="font-display text-base text-parchment-200 tracking-widest uppercase mb-3">
          {wizard.nome || "(sem nome)"}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm font-body">
          <div>
            <span className="text-stone-500">Ancestralidade:</span>
            <span className="text-parchment-300 ml-2">{wizard.ancestralidade || "—"}</span>
          </div>
          <div>
            <span className="text-stone-500">Classe:</span>
            <span className="text-parchment-300 ml-2">{wizard.classe || "—"}</span>
          </div>
          <div>
            <span className="text-stone-500">Biografia:</span>
            <span className="text-parchment-300 ml-2">{wizard.biografia || "—"}</span>
          </div>
          <div>
            <span className="text-stone-500">Herança:</span>
            <span className="text-parchment-300 ml-2">{heranca?.nome || "—"}</span>
          </div>
          {escola && (
            <div className="col-span-2">
              <span className="text-stone-500">Escola:</span>
              <span className="text-parchment-300 ml-2">{escola.nome}</span>
            </div>
          )}
          {talento && (
            <div className="col-span-2">
              <span className="text-stone-500">Talento:</span>
              <span className="text-parchment-300 ml-2">{talento.nome}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="font-display text-xs tracking-widest uppercase text-stone-500">PV Máx.</div>
          <div className="font-display text-2xl text-crimson-400">{pvMax}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="font-display text-xs tracking-widest uppercase text-stone-500">CA Base</div>
          <div className="font-display text-2xl text-parchment-200">
            {10 + Math.floor((atributos.DES - 10) / 2)}
          </div>
        </div>
        <div className="card p-3 text-center">
          <div className="font-display text-xs tracking-widest uppercase text-stone-500">Nível</div>
          <div className="font-display text-2xl text-parchment-200">1</div>
        </div>
      </div>

      {/* Atributos */}
      <div className="card p-4">
        <h4 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Atributos Finais</h4>
        <div className="grid grid-cols-5 gap-2">
          {ATRIBUTO_KEYS.map(k => (
            <div key={k} className="text-center bg-stone-800 rounded p-2">
              <div className="font-display text-xs text-stone-400">{k}</div>
              <div className="font-display text-xl text-parchment-100">{atributos[k]}</div>
              <div className="font-body text-xs text-parchment-400">{getModStr(atributos[k])}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Perícias treinadas */}
      {periciasTreinadas.length > 0 && (
        <div className="card p-4">
          <h4 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Perícias Treinadas</h4>
          <div className="flex flex-wrap gap-2">
            {periciasTreinadas.map(p => (
              <span key={p.nome} className={`font-body text-xs rounded px-2 py-0.5 border ${
                p.nivel === "especialista"
                  ? "border-parchment-400 text-parchment-300 bg-parchment-500/10"
                  : "border-stone-700 text-stone-300 bg-stone-800"
              }`}>
                {p.nome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Habilidades */}
      {wizard.habilidades.length > 0 && (
        <div className="card p-4">
          <h4 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Habilidades</h4>
          <div className="space-y-2">
            {wizard.habilidades.map((h, i) => (
              <div key={i} className="bg-stone-800/50 rounded p-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm text-parchment-200">{h.nome}</span>
                  <span className="font-body text-xs text-stone-500 capitalize">[{h.origem}]</span>
                </div>
                <p className="font-body text-xs text-stone-400 mt-0.5">{h.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idiomas */}
      {wizard.idiomas.length > 0 && (
        <div className="card p-4">
          <h4 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-2">Idiomas</h4>
          <div className="flex flex-wrap gap-2">
            {wizard.idiomas.map(id => (
              <span key={id} className="font-body text-xs bg-stone-800 border border-stone-700 rounded px-2 py-0.5 text-stone-300">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-parchment-500/5 border border-parchment-500/20 rounded p-4 text-center">
        <p className="font-display text-xs tracking-widest uppercase text-parchment-400">
          ✦ Revise seus dados e clique em Finalizar Criação ✦
        </p>
      </div>
    </div>
  );
}
