"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ANCESTRALIDADES,
  CLASSES,
  PERICIAS_PRINCIPAIS,
  IDIOMAS_DISPONIVEIS,
  FAIXAS_SANIDADE,
  FAIXAS_CORRUPCAO,
  FAIXAS_REPUTACAO,
  MODULOS_BASE,
  ARMADURAS,
  BONUS_SALVAMENTO,
  getModificador,
  getModStr,
  getReputacaoLabel,
} from "@/lib/game-data";
import type { Ficha } from "@/types/database";

// ─────────────────────────────────────────────────────────────
// Type for dados JSONB
// ─────────────────────────────────────────────────────────────
interface AtributosChar {
  FOR: number; DES: number; CON: number; INT: number; CAR: number;
}

interface ItemInventario {
  id: string;
  nome: string;
  quantidade: number;
  descricao?: string;
  peso?: number;
}

interface FichaDados {
  ancestralidade?: string;
  heranca?: string;
  classe?: string;
  escola?: string;
  talento_classe?: string;
  biografia?: string;
  nivel?: number;
  atributos?: AtributosChar;
  pv_maximo?: number;
  pv_atual?: number;
  pericias?: Record<string, boolean>;
  saberes?: Array<{ nome: string; treinado: boolean }>;
  idiomas?: string[];
  dinheiro?: { PC: number; PP: number; PO: number; PPl: number };
  sanidade?: number;
  corrupcao?: number;
  reputacao?: Array<{ grupo: string; valor: number }>;
  base?: {
    nome: string; nivel: number; modulos: string[]; custo_total: number;
  };
  notas?: string;
  inventario?: string;
  itens?: ItemInventario[];
  armadura_id?: string;
  escudo_id?: string;
  ca_bonus_extra?: number;
  testes_morte?: { sucessos: number; falhas: number };
}

const ATRIBUTO_LABELS: Record<string, string> = {
  FOR: 'Força', DES: 'Destreza', CON: 'Constituição', INT: 'Inteligência', CAR: 'Carisma',
};

const SAVE_LABELS = [
  { key: 'fortitude', label: 'Fortitude', attr: 'CON' as const },
  { key: 'reflexos',  label: 'Reflexos',  attr: 'DES' as const },
  { key: 'vontade',   label: 'Vontade',   attr: 'CAR' as const },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function def<T>(val: T | undefined, fallback: T): T {
  return val !== undefined ? val : fallback;
}

const TABS = [
  { id: 'personagem', icon: '⚔', label: 'Personagem' },
  { id: 'pericias', icon: '📚', label: 'Perícias' },
  { id: 'inventario', icon: '💰', label: 'Inventário' },
  { id: 'estado', icon: '🩺', label: 'Estado' },
  { id: 'reputacao', icon: '⭐', label: 'Reputação' },
  { id: 'base', icon: '🏠', label: 'Base' },
];

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export function FichaClient({ ficha, isMestre }: { ficha: Ficha; isMestre: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState("personagem");
  const [dados, setDados] = useState<FichaDados>(ficha.dados as unknown as FichaDados);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editNome, setEditNome] = useState(false);
  const [nome, setNome] = useState(ficha.nome);

  const atributos: AtributosChar = def(dados.atributos, { FOR: 10, DES: 10, CON: 10, INT: 10, CAR: 10 });
  const dinheiro = def(dados.dinheiro, { PC: 0, PP: 0, PO: 15, PPl: 0 });
  const sanidade = def(dados.sanidade, 5);
  const corrupcao = def(dados.corrupcao, 0);
  const pvAtual = def(dados.pv_atual, def(dados.pv_maximo, 0));
  const pvMax = def(dados.pv_maximo, 0);
  const testesMorte = def(dados.testes_morte, { sucessos: 0, falhas: 0 });

  const update = useCallback((patch: Partial<FichaDados>) => {
    setDados(d => ({ ...d, ...patch }));
  }, []);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("fichas")
      .update({ dados: dados as Record<string, unknown>, nome })
      .eq("id", ficha.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const sanFaixa = FAIXAS_SANIDADE.find(f => f.valor === sanidade) ?? FAIXAS_SANIDADE[0];
  const corFaixa = FAIXAS_CORRUPCAO.find(f => f.valor === corrupcao) ?? FAIXAS_CORRUPCAO[0];

  const ancestralidadeData = dados.ancestralidade ? ANCESTRALIDADES[dados.ancestralidade] : null;
  const classeData = dados.classe ? CLASSES[dados.classe] : null;

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {editNome ? (
              <input
                autoFocus
                value={nome}
                onChange={e => setNome(e.target.value)}
                onBlur={() => setEditNome(false)}
                onKeyDown={e => e.key === 'Enter' && setEditNome(false)}
                className="w-full bg-transparent border-b border-parchment-500 text-parchment-100 font-display text-2xl tracking-widest uppercase focus:outline-none pb-1"
              />
            ) : (
              <h1
                className="font-display text-2xl text-parchment-100 tracking-widest uppercase cursor-pointer hover:text-parchment-300 transition-colors"
                onClick={() => setEditNome(true)}
                title="Clique para editar"
              >
                {nome}
              </h1>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {dados.ancestralidade && (
                <span className="font-body text-sm text-stone-400">
                  <span className="text-stone-600">Raça — </span>{dados.ancestralidade}
                </span>
              )}
              {dados.classe && (
                <span className="font-body text-sm text-stone-400">
                  <span className="text-stone-600">Classe — </span>{dados.classe}
                </span>
              )}
              {dados.biografia && (
                <span className="font-body text-sm text-stone-400">
                  <span className="text-stone-600">Hist. — </span>{dados.biografia}
                </span>
              )}
            </div>
          </div>

          {/* Level + PV quick view */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-xs tracking-widest text-stone-500 uppercase">Nível</p>
              <div className="flex items-center gap-1">
                <button onClick={() => update({ nivel: Math.max(1, def(dados.nivel, 1) - 1) })}
                  className="text-stone-500 hover:text-parchment-300 font-display text-lg leading-none">−</button>
                <p className="font-display text-2xl text-parchment-200 w-8 text-center">{def(dados.nivel, 1)}</p>
                <button onClick={() => update({ nivel: Math.min(20, def(dados.nivel, 1) + 1) })}
                  className="text-stone-500 hover:text-parchment-300 font-display text-lg leading-none">+</button>
              </div>
            </div>
            <PVTracker pvAtual={pvAtual} pvMax={pvMax} onUpdate={(cur, max) => update({ pv_atual: cur, pv_maximo: max })} />
          </div>
        </div>

        {/* Quick saves */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-stone-700/50 flex-wrap">
          {SAVE_LABELS.map(sv => {
            const attrMod = getModificador(atributos[sv.attr]);
            const profNivel = classeData?.salvamentos[sv.key as keyof typeof classeData.salvamentos] ?? '';
            const profBonus = BONUS_SALVAMENTO[profNivel as keyof typeof BONUS_SALVAMENTO] ?? 0;
            const total = attrMod + profBonus;
            const profLabel = profNivel === 'E' ? 'Esp' : profNivel === 'T' ? 'Trei' : '—';
            const profColor = profNivel === 'E' ? 'text-parchment-400' : profNivel === 'T' ? 'text-emerald-500' : 'text-stone-600';
            return (
              <div key={sv.key} className="text-center min-w-[52px]">
                <p className="font-display text-xs tracking-widest text-stone-600 uppercase">{sv.label}</p>
                <p className={`font-display text-base ${total >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                  {getModStr(total)}
                </p>
                <p className={`font-display text-[10px] ${profColor}`}>{profLabel}</p>
              </div>
            );
          })}
          <div className="ml-auto flex gap-2">
            {/* Sanidade/Corrupção mini indicators */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-800/60 border border-stone-700">
              <span className="text-xs">🧠</span>
              <span className={`font-display text-xs ${sanFaixa.color}`}>{sanidade}/5</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-800/60 border border-stone-700">
              <span className="text-xs">☠</span>
              <span className={`font-display text-xs ${corFaixa.color}`}>{corrupcao}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex overflow-x-auto border-b border-stone-700 gap-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2.5 font-display text-xs tracking-widest uppercase transition-all border-b-2 ${
              tab === t.id
                ? 'border-parchment-500 text-parchment-300 -mb-px'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────── */}
      <div className="min-h-[400px]">
        {tab === 'personagem' && (
          <PersonagemTab atributos={atributos} ancestralidadeData={ancestralidadeData} classeData={classeData} dados={dados} onUpdate={update} />
        )}
        {tab === 'pericias' && (
          <PericiasTab dados={dados} atributos={atributos} onUpdate={update} />
        )}
        {tab === 'inventario' && (
          <InventarioTab dinheiro={dinheiro} dados={dados} onUpdate={update} />
        )}
        {tab === 'estado' && (
          <EstadoTab sanidade={sanidade} corrupcao={corrupcao} testesMorte={testesMorte} dados={dados} onUpdate={update} />
        )}
        {tab === 'reputacao' && (
          <ReputacaoTab reputacao={def(dados.reputacao, [])} onUpdate={reps => update({ reputacao: reps })} />
        )}
        {tab === 'base' && (
          <BaseTab base={def(dados.base, { nome: '', nivel: 0, modulos: [], custo_total: 0 })} onUpdate={b => update({ base: b })} />
        )}
      </div>

      {/* ── Save Bar ──────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-stone-700/50">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? '⏳ Salvando...' : saved ? '✓ Salvo!' : '💾 Salvar Ficha'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PV Tracker
// ─────────────────────────────────────────────────────────────
function PVTracker({ pvAtual, pvMax, onUpdate }: {
  pvAtual: number; pvMax: number;
  onUpdate: (cur: number, max: number) => void;
}) {
  const pct = pvMax > 0 ? Math.max(0, Math.min(100, (pvAtual / pvMax) * 100)) : 0;
  const barColor = pct > 50 ? 'bg-emerald-600' : pct > 25 ? 'bg-yellow-500' : 'bg-crimson-500';

  return (
    <div className="text-center min-w-[100px]">
      <p className="font-display text-xs tracking-widest text-stone-500 uppercase mb-1">Pontos de Vida</p>
      <div className="flex items-center gap-1 justify-center">
        <button onClick={() => onUpdate(Math.max(0, pvAtual - 1), pvMax)}
          className="w-6 h-6 border border-crimson-700 text-crimson-400 hover:bg-crimson-700/20 font-display text-sm">−</button>
        <div className="text-center">
          <span className="font-display text-xl text-parchment-200">{pvAtual}</span>
          <span className="font-display text-sm text-stone-600">/{pvMax}</span>
        </div>
        <button onClick={() => onUpdate(Math.min(pvMax, pvAtual + 1), pvMax)}
          className="w-6 h-6 border border-emerald-700 text-emerald-400 hover:bg-emerald-700/20 font-display text-sm">+</button>
      </div>
      <div className="w-full h-1.5 bg-stone-700 mt-1.5 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <button
        onClick={() => {
          const newMax = parseInt(prompt("Novo PV máximo:", String(pvMax)) ?? String(pvMax));
          if (!isNaN(newMax)) onUpdate(Math.min(pvAtual, newMax), newMax);
        }}
        className="font-display text-xs text-stone-600 hover:text-stone-400 mt-0.5"
      >
        Editar máximo
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Personagem
// ─────────────────────────────────────────────────────────────
function PersonagemTab({ atributos, ancestralidadeData, classeData, dados, onUpdate }: {
  atributos: AtributosChar;
  ancestralidadeData: typeof ANCESTRALIDADES[string] | null;
  classeData: typeof CLASSES[string] | null;
  dados: FichaDados;
  onUpdate: (patch: Partial<FichaDados>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Attributes grid */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(ATRIBUTO_LABELS).map(([key, label]) => {
          const val = atributos[key as keyof AtributosChar];
          const mod = getModificador(val);
          return (
            <div key={key} className="card p-3 text-center">
              <p className="font-display text-xs tracking-widest text-stone-500 uppercase mb-1">{label}</p>
              <input
                type="number"
                value={val}
                onChange={e => onUpdate({
                  atributos: { ...atributos, [key]: parseInt(e.target.value) || 10 }
                })}
                className="w-full text-center bg-transparent text-parchment-100 font-display text-3xl focus:outline-none"
                min={1}
                max={30}
              />
              <div className={`font-display text-base mt-1 ${mod >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                {getModStr(val)}
              </div>
              <p className="font-display text-xs text-stone-600 uppercase mt-1">{key}</p>
            </div>
          );
        })}
      </div>

      {/* Class & Race abilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ancestralidadeData && (
          <div className="card p-4">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
              Habilidade Racial
            </p>
            <p className="font-display text-sm text-parchment-300 mb-1">{ancestralidadeData.habilidade_racial}</p>
            <p className="font-body text-xs text-stone-400">{ancestralidadeData.habilidade_racial_desc}</p>
            <div className="mt-3 pt-3 border-t border-stone-700">
              <p className="font-display text-xs text-stone-600 uppercase mb-1">Traços Raciais</p>
              <div className="flex flex-wrap gap-1">
                {ancestralidadeData.tracos.map(t => (
                  <span key={t} className="text-xs bg-stone-800 border border-stone-700 px-2 py-0.5 text-stone-400">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {classeData && (() => {
          const escolhaEscola = classeData.escolas.find(e => e.id === dados.escola);
          const escolhaTalento = classeData.talentos.find(t => t.id === dados.talento_classe);
          return (
            <div className="card p-4 space-y-3">
              <div>
                <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Habilidade de Classe
                </p>
                <p className="font-display text-sm text-parchment-300 mb-0.5">{classeData.habilidade}</p>
                <p className="font-body text-xs text-stone-400">{classeData.habilidade_desc}</p>
              </div>

              {/* Salvamentos da classe */}
              <div className="pt-2 border-t border-stone-700/50">
                <p className="font-display text-xs text-stone-600 uppercase mb-1.5">Salvamentos</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {SAVE_LABELS.map(sv => {
                    const nivel = classeData.salvamentos[sv.key as keyof typeof classeData.salvamentos];
                    const label = nivel === 'E' ? 'Especialista' : nivel === 'T' ? 'Treinado' : 'Sem prof.';
                    const color = nivel === 'E' ? 'text-parchment-400' : nivel === 'T' ? 'text-emerald-500' : 'text-stone-600';
                    return (
                      <div key={sv.key} className="bg-stone-800/50 px-2 py-1.5 border border-stone-700/50">
                        <p className="font-display text-xs text-stone-500 uppercase">{sv.label}</p>
                        <p className={`font-display text-xs mt-0.5 ${color}`}>{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Escola escolhida */}
              {escolhaEscola && (
                <div className="pt-2 border-t border-stone-700/50">
                  <p className="font-display text-xs text-stone-600 uppercase mb-1">
                    Escola / Estilo / Doutrina
                  </p>
                  <p className="font-display text-sm text-parchment-300">{escolhaEscola.nome}</p>
                  <p className="font-body text-xs text-stone-400 mt-0.5 italic">{escolhaEscola.desc}</p>
                </div>
              )}

              {/* Talento escolhido */}
              {escolhaTalento && (
                <div className="pt-2 border-t border-stone-700/50">
                  <p className="font-display text-xs text-stone-600 uppercase mb-1">Talento de Classe</p>
                  <p className="font-display text-sm text-parchment-300">{escolhaTalento.nome}</p>
                  <p className="font-body text-xs text-stone-400 mt-0.5 italic">{escolhaTalento.desc}</p>
                </div>
              )}

              {(!escolhaEscola || !escolhaTalento) && (
                <p className="font-body text-xs text-stone-600 italic pt-1 border-t border-stone-700/30">
                  Escola e talento definidos na criação do personagem.
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Idiomas */}
      {dados.idiomas && dados.idiomas.length > 0 && (
        <div className="card p-4">
          <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Idiomas</p>
          <div className="flex flex-wrap gap-1.5">
            {dados.idiomas.map((lang, i) => (
              <span key={i} className="font-body text-xs bg-stone-800 border border-stone-700 px-2.5 py-1 text-stone-300">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Perícias
// ─────────────────────────────────────────────────────────────
function PericiasTab({ dados, atributos, onUpdate }: {
  dados: FichaDados; atributos: AtributosChar;
  onUpdate: (patch: Partial<FichaDados>) => void;
}) {
  const pericias = def(dados.pericias, {});
  const saberes = def(dados.saberes, []);
  const [novoSaber, setNovoSaber] = useState("");

  function togglePericia(nome: string) {
    onUpdate({ pericias: { ...pericias, [nome]: !pericias[nome] } });
  }

  function addSaber() {
    if (novoSaber.trim()) {
      onUpdate({ saberes: [...saberes, { nome: novoSaber.trim(), treinado: true }] });
      setNovoSaber("");
    }
  }

  function removeSaber(i: number) {
    onUpdate({ saberes: saberes.filter((_, j) => j !== i) });
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Perícias Principais</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {PERICIAS_PRINCIPAIS.map((p) => {
            const trained = !!pericias[p.nome];
            const attrMod = getModificador(atributos[p.atributo as keyof AtributosChar]);
            const total = attrMod + (trained ? 2 : 0); // simplified: +2 if trained
            return (
              <button
                key={p.nome}
                onClick={() => togglePericia(p.nome)}
                className={`flex items-center justify-between px-3 py-2 border transition-all text-left ${
                  trained
                    ? 'border-parchment-500/40 bg-parchment-500/5 hover:bg-parchment-500/10'
                    : 'border-stone-700 hover:border-stone-600'
                }`}
              >
                <div>
                  <span className={`font-display text-sm tracking-wide ${trained ? 'text-parchment-200' : 'text-stone-500'}`}>
                    {p.nome}
                  </span>
                  <span className="font-body text-xs text-stone-600 ml-2">{p.atributo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-display text-sm ${total >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                    {total >= 0 ? '+' : ''}{total}
                  </span>
                  {trained && <span className="text-xs text-parchment-500/60">▪ Treinado</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Saberes Específicos</p>
        <div className="space-y-1.5 mb-3">
          {saberes.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 border border-parchment-500/30 bg-parchment-500/5">
              <span className="font-display text-sm text-parchment-300">Saber: {s.nome}</span>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-emerald-400">
                  +{getModificador(atributos.INT) + 2}
                </span>
                <button onClick={() => removeSaber(i)} className="text-stone-600 hover:text-crimson-400 text-xs">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={novoSaber}
            onChange={e => setNovoSaber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSaber()}
            placeholder="Novo saber (ex: Demônios, Cidade de Vingard)..."
            className="flex-1 bg-stone-800 border border-stone-600 px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-parchment-500"
          />
          <button onClick={addSaber} className="btn-secondary px-4">+</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Inventário (itens estruturados + armadura)
// ─────────────────────────────────────────────────────────────
function InventarioTab({ dinheiro, dados, onUpdate }: {
  dinheiro: { PC: number; PP: number; PO: number; PPl: number };
  dados: FichaDados;
  onUpdate: (patch: Partial<FichaDados>) => void;
}) {
  const MOEDAS: Array<{ key: keyof typeof dinheiro; label: string; desc: string; color: string }> = [
    { key: 'PC', label: 'Peças de Cobre', desc: '10 PC = 1 PP', color: 'text-amber-700' },
    { key: 'PP', label: 'Peças de Prata', desc: '10 PP = 1 PO', color: 'text-stone-300' },
    { key: 'PO', label: 'Peças de Ouro', desc: '10 PO = 1 PPl', color: 'text-parchment-400' },
    { key: 'PPl', label: 'Peças de Platina', desc: 'Raríssima', color: 'text-sky-300' },
  ];

  const itens = def(dados.itens, [] as ItemInventario[]);
  const [novoNome, setNovoNome] = useState("");
  const [novoDesc, setNovoDesc] = useState("");
  const [novoPeso, setNovoPeso] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  function updMoeda(key: keyof typeof dinheiro, val: number) {
    onUpdate({ dinheiro: { ...dinheiro, [key]: Math.max(0, val) } });
  }

  function addItem() {
    if (!novoNome.trim()) return;
    const item: ItemInventario = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      quantidade: 1,
      descricao: novoDesc.trim() || undefined,
      peso: novoPeso ? parseFloat(novoPeso) : undefined,
    };
    onUpdate({ itens: [...itens, item] });
    setNovoNome(""); setNovoDesc(""); setNovoPeso("");
  }

  function updItem(id: string, patch: Partial<ItemInventario>) {
    onUpdate({ itens: itens.map(it => it.id === id ? { ...it, ...patch } : it) });
  }

  function removeItem(id: string) {
    onUpdate({ itens: itens.filter(it => it.id !== id) });
  }

  // Armadura
  const armadura = ARMADURAS.find(a => a.id === dados.armadura_id && a.tipo !== 'escudo') ?? ARMADURAS[0];
  const escudo = ARMADURAS.find(a => a.id === dados.escudo_id && a.tipo === 'escudo');
  const atributos: AtributosChar = def(dados.atributos, { FOR: 10, DES: 10, CON: 10, INT: 10, CAR: 10 });
  const desMod = getModificador(atributos.DES);
  const caTotal = 10 + armadura.ca_bonus + desMod + (escudo?.ca_bonus ?? 0) + (dados.ca_bonus_extra ?? 0);

  return (
    <div className="space-y-4">

      {/* ── Armadura ── */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Armadura & Defesa</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-center px-4 py-2 border border-parchment-500/40 bg-parchment-500/5">
            <p className="font-display text-xs text-stone-500 uppercase">CA Total</p>
            <p className="font-display text-3xl text-parchment-200">{caTotal}</p>
          </div>
          <div className="text-xs text-stone-500 font-body italic">
            10 + {armadura.ca_bonus} (arm.) + {desMod >= 0 ? '+' : ''}{desMod} (DES)
            {escudo ? ` + ${escudo.ca_bonus} (escudo)` : ''}
            {(dados.ca_bonus_extra ?? 0) > 0 ? ` + ${dados.ca_bonus_extra} (extra)` : ''}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {ARMADURAS.filter(a => a.tipo !== 'escudo').map(a => (
            <button
              key={a.id}
              onClick={() => onUpdate({ armadura_id: a.id })}
              className={`text-left p-2.5 border transition-all ${
                armadura.id === a.id
                  ? 'border-parchment-500/50 bg-parchment-500/5'
                  : 'border-stone-700 hover:border-stone-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-display text-sm ${armadura.id === a.id ? 'text-parchment-200' : 'text-stone-400'}`}>
                  {a.nome}
                </span>
                <span className={`font-display text-sm ${armadura.id === a.id ? 'text-emerald-400' : 'text-stone-600'}`}>
                  +{a.ca_bonus}
                </span>
              </div>
              <p className="font-body text-xs text-stone-600 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
        <p className="font-display text-xs text-stone-600 uppercase mb-1 mt-3">Escudo (opcional)</p>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ escudo_id: undefined })}
            className={`px-3 py-1.5 border text-xs font-display transition-all ${
              !escudo ? 'border-parchment-500/40 text-parchment-300' : 'border-stone-700 text-stone-500'
            }`}
          >
            Sem escudo
          </button>
          {ARMADURAS.filter(a => a.tipo === 'escudo').map(a => (
            <button
              key={a.id}
              onClick={() => onUpdate({ escudo_id: a.id })}
              className={`px-3 py-1.5 border text-xs font-display transition-all ${
                escudo?.id === a.id ? 'border-parchment-500/40 text-parchment-300' : 'border-stone-700 text-stone-500'
              }`}
            >
              {a.nome} (+{a.ca_bonus})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="font-display text-xs text-stone-600 uppercase">CA Bônus Extra</span>
          <button onClick={() => onUpdate({ ca_bonus_extra: Math.max(0, (dados.ca_bonus_extra ?? 0) - 1) })}
            className="w-6 h-6 border border-stone-700 text-stone-500 hover:border-crimson-700 font-display text-sm">−</button>
          <span className="font-display text-sm text-parchment-300 w-6 text-center">{dados.ca_bonus_extra ?? 0}</span>
          <button onClick={() => onUpdate({ ca_bonus_extra: (dados.ca_bonus_extra ?? 0) + 1 })}
            className="w-6 h-6 border border-stone-700 text-stone-500 hover:border-emerald-700 font-display text-sm">+</button>
          <span className="font-body text-xs text-stone-600 italic">(magias, feitiços, habilidades)</span>
        </div>
      </div>

      {/* ── Dinheiro ── */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Dinheiro</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOEDAS.map(({ key, label, desc, color }) => (
            <div key={key} className="text-center">
              <p className={`font-display text-xs tracking-widest uppercase mb-1 ${color}`}>{key}</p>
              <div className="flex items-center justify-center gap-1">
                <button onClick={() => updMoeda(key, dinheiro[key] - 1)}
                  className="w-6 h-6 border border-stone-700 text-stone-500 hover:border-crimson-700 hover:text-crimson-400 font-display text-sm">−</button>
                <input
                  type="number"
                  value={dinheiro[key]}
                  onChange={e => updMoeda(key, parseInt(e.target.value) || 0)}
                  className={`w-16 text-center bg-transparent font-display text-xl focus:outline-none ${color}`}
                  min={0}
                />
                <button onClick={() => updMoeda(key, dinheiro[key] + 1)}
                  className="w-6 h-6 border border-stone-700 text-stone-500 hover:border-emerald-700 hover:text-emerald-400 font-display text-sm">+</button>
              </div>
              <p className="font-body text-xs text-stone-600 mt-0.5">{label}</p>
              <p className="font-body text-xs text-stone-700 italic">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-stone-700/50 text-right">
          <span className="font-display text-xs text-stone-600 uppercase">
            Total em PO: {(dinheiro.PPl * 100 + dinheiro.PO + dinheiro.PP / 10 + dinheiro.PC / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Itens ── */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
          Inventário <span className="text-stone-600 normal-case font-body">({itens.length} {itens.length === 1 ? 'item' : 'itens'})</span>
        </p>

        <div className="space-y-1.5 mb-4">
          {itens.length === 0 && (
            <p className="font-body text-sm text-stone-600 italic text-center py-4">Nenhum item no inventário.</p>
          )}
          {itens.map(item => (
            <div key={item.id} className="border border-stone-700 bg-stone-900/40">
              <div className="flex items-center gap-3 px-3 py-2">
                {/* Quantidade */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updItem(item.id, { quantidade: Math.max(0, item.quantidade - 1) })}
                    className="w-5 h-5 text-stone-600 hover:text-crimson-400 font-display text-sm leading-none">−</button>
                  <span className="font-display text-sm text-parchment-300 w-6 text-center">{item.quantidade}</span>
                  <button onClick={() => updItem(item.id, { quantidade: item.quantidade + 1 })}
                    className="w-5 h-5 text-stone-600 hover:text-emerald-400 font-display text-sm leading-none">+</button>
                </div>
                {/* Nome */}
                <input
                  value={item.nome}
                  onChange={e => updItem(item.id, { nome: e.target.value })}
                  className="flex-1 bg-transparent font-display text-sm text-parchment-200 focus:outline-none border-b border-transparent focus:border-stone-600"
                />
                {item.peso !== undefined && (
                  <span className="font-body text-xs text-stone-600 shrink-0">{item.peso}kg</span>
                )}
                <button
                  onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                  className="text-stone-600 hover:text-parchment-400 text-xs font-display shrink-0"
                >
                  {expandido === item.id ? '▲' : '▼'}
                </button>
                <button onClick={() => removeItem(item.id)}
                  className="text-stone-600 hover:text-crimson-400 text-sm shrink-0">✕</button>
              </div>
              {expandido === item.id && (
                <div className="px-3 pb-3 border-t border-stone-800 pt-2 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="font-display text-xs text-stone-600 uppercase mb-1">Descrição</p>
                      <textarea
                        value={item.descricao ?? ''}
                        onChange={e => updItem(item.id, { descricao: e.target.value || undefined })}
                        rows={2}
                        placeholder="Efeito, dano, propriedades especiais..."
                        className="w-full bg-stone-800/60 border border-stone-700 px-2 py-1 text-stone-300 text-xs font-body focus:outline-none focus:border-parchment-500 resize-none"
                      />
                    </div>
                    <div className="w-20">
                      <p className="font-display text-xs text-stone-600 uppercase mb-1">Peso (kg)</p>
                      <input
                        type="number"
                        value={item.peso ?? ''}
                        onChange={e => updItem(item.id, { peso: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="0"
                        className="w-full bg-stone-800/60 border border-stone-700 px-2 py-1 text-stone-300 text-xs font-display focus:outline-none focus:border-parchment-500"
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Adicionar item */}
        <div className="border border-stone-700/50 p-3 space-y-2">
          <p className="font-display text-xs text-stone-600 uppercase">Adicionar Item</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Nome do item..."
              className="flex-1 bg-stone-800 border border-stone-600 px-3 py-1.5 text-stone-300 text-sm focus:outline-none focus:border-parchment-500"
            />
            <button onClick={addItem} className="btn-secondary px-3 text-sm">+ Adicionar</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={novoDesc}
              onChange={e => setNovoDesc(e.target.value)}
              placeholder="Descrição / efeito (opcional)"
              className="flex-1 bg-stone-800 border border-stone-600 px-3 py-1.5 text-stone-300 text-xs focus:outline-none focus:border-parchment-500"
            />
            <input
              type="number"
              value={novoPeso}
              onChange={e => setNovoPeso(e.target.value)}
              placeholder="Peso"
              className="w-20 bg-stone-800 border border-stone-600 px-2 py-1.5 text-stone-300 text-xs text-center focus:outline-none focus:border-parchment-500"
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* ── Notas ── */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Notas</p>
        <textarea
          value={def(dados.notas, '')}
          onChange={e => onUpdate({ notas: e.target.value })}
          rows={5}
          placeholder="Notas, backstory, contatos, quests pendentes..."
          className="w-full bg-stone-800/60 border border-stone-700 px-3 py-2 text-stone-300 text-sm font-body italic focus:outline-none focus:border-parchment-500 resize-none"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Estado (Sanidade, Corrupção, Morte)
// ─────────────────────────────────────────────────────────────
const EFEITOS_SANIDADE: Record<number, string> = {
  4: '−1 em Percepção e Diplomacia',
  3: 'Pesadelos; −1 em Vontade',
  2: 'Ataques de Pânico (1 rodada sem Reações)',
  1: 'Fobias (Mestre escolhe)',
  0: 'Loucura Total — controle do Mestre',
};

const SINTOMAS_CORRUPCAO: Record<number, string> = {
  1: 'Sombra alterada, olhos estranhos, voz ecoante',
  2: 'Marcas pela pele, fome anormal, sonhos invasivos',
  3: '−1 em Carisma; animais evitam você',
  4: 'Pequena mutação física; −1 em interações sociais',
  5: 'Você se torna um Agente Abissal (controle do Mestre)',
};

function EstadoTab({ sanidade, corrupcao, testesMorte, dados, onUpdate }: {
  sanidade: number; corrupcao: number;
  testesMorte: { sucessos: number; falhas: number };
  dados: FichaDados;
  onUpdate: (patch: Partial<FichaDados>) => void;
}) {
  const sanFaixa = FAIXAS_SANIDADE.find(f => f.valor === sanidade) ?? FAIXAS_SANIDADE[0];
  const corFaixa = FAIXAS_CORRUPCAO.find(f => f.valor === corrupcao) ?? FAIXAS_CORRUPCAO[0];

  // Active efeitos: all levels <= current sanidade that have effects (sanidade < 5)
  const efeitosSanAtivos = Object.entries(EFEITOS_SANIDADE)
    .filter(([v]) => Number(v) >= sanidade && sanidade < 5)
    .sort(([a], [b]) => Number(b) - Number(a));

  const sintomasCorAtivos = Object.entries(SINTOMAS_CORRUPCAO)
    .filter(([v]) => Number(v) <= corrupcao && corrupcao > 0)
    .sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-4">

      {/* ── Salvaguarda rápida (interação SAN/COR) ── */}
      {(sanidade <= 3 || corrupcao >= 2) && (
        <div className="card p-4 border-crimson-600/30 bg-crimson-900/10">
          <p className="font-display text-xs tracking-widest uppercase text-crimson-500 mb-1">⚠ Interação Ativa</p>
          <p className="font-body text-xs text-stone-400 italic">
            {corrupcao >= 1 && '• Alta Corrupção: −1 nos testes de Sanidade. '}
            {sanidade <= 2 && '• Sanidade baixa: +2 para ganhar Corrupção. '}
            Cuidado com a espiral de degradação.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── Sanidade ── */}
        <div className="card p-5">
          <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">🧠 Sanidade</p>
          <div className="text-center mb-4">
            <span className={`font-display text-4xl ${sanFaixa.color}`}>{sanidade}</span>
            <span className="font-display text-lg text-stone-600">/5</span>
            <p className={`font-display text-sm tracking-widest uppercase mt-1 ${sanFaixa.color}`}>
              {sanFaixa.label}
            </p>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[5,4,3,2,1,0].map(v => (
              <button
                key={v}
                onClick={() => onUpdate({ sanidade: v })}
                className={`w-8 h-8 border font-display text-sm transition-all ${
                  v === sanidade
                    ? 'border-emerald-400 bg-emerald-900/30 text-emerald-300 scale-110'
                    : v < sanidade
                    ? 'border-stone-700 text-stone-700 hover:border-stone-500'
                    : 'border-emerald-700/40 bg-emerald-900/10 text-emerald-700 hover:border-emerald-600'
                }`}
              >{v}</button>
            ))}
          </div>

          {/* Faixas com efeitos */}
          <div className="space-y-1.5 text-xs font-body">
            {FAIXAS_SANIDADE.slice().reverse().map(f => {
              const isAtivo = f.valor === sanidade;
              const temEfeito = EFEITOS_SANIDADE[f.valor];
              return (
                <div key={f.valor} className={`p-2 border transition-all ${
                  isAtivo
                    ? 'border-parchment-500/30 bg-parchment-500/5'
                    : 'border-transparent opacity-40'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAtivo ? 'bg-parchment-400' : 'bg-stone-700'}`} />
                    <span className={`font-display tracking-wide ${f.color}`}>{f.valor} — {f.label}</span>
                  </div>
                  {temEfeito && (
                    <p className="text-stone-500 italic mt-0.5 pl-3.5">{temEfeito}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Efeitos ativos agora */}
          {efeitosSanAtivos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-700/50">
              <p className="font-display text-xs text-crimson-500 uppercase mb-1">Efeitos Ativos</p>
              {efeitosSanAtivos.map(([v, ef]) => (
                <p key={v} className="font-body text-xs text-crimson-400 italic">• {ef}</p>
              ))}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-stone-700/50">
            <p className="font-display text-xs text-stone-600 uppercase mb-1">Recuperação</p>
            <p className="font-body text-xs text-stone-600 italic">
              Descanso seguro +1 • Terapia/meditação +1 • Magia curativa +1/+2
            </p>
          </div>
        </div>

        {/* ── Corrupção ── */}
        <div className="card p-5">
          <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">☠ Corrupção</p>
          <div className="text-center mb-4">
            <span className={`font-display text-4xl ${corFaixa.color}`}>{corrupcao}</span>
            <span className="font-display text-lg text-stone-600">/5</span>
            <p className={`font-display text-sm tracking-widest uppercase mt-1 ${corFaixa.color}`}>
              {corFaixa.label}
            </p>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[0,1,2,3,4,5].map(v => (
              <button
                key={v}
                onClick={() => onUpdate({ corrupcao: v })}
                className={`w-8 h-8 border font-display text-sm transition-all ${
                  v === corrupcao
                    ? 'border-purple-400 bg-purple-900/30 text-purple-300 scale-110'
                    : v < corrupcao
                    ? 'border-purple-800/50 bg-purple-900/10 text-purple-700'
                    : 'border-stone-700 text-stone-700 hover:border-stone-500'
                }`}
              >{v}</button>
            ))}
          </div>

          {/* Faixas com sintomas */}
          <div className="space-y-1.5 text-xs font-body">
            {FAIXAS_CORRUPCAO.map(f => {
              const isAtivo = f.valor === corrupcao;
              const sintoma = SINTOMAS_CORRUPCAO[f.valor];
              return (
                <div key={f.valor} className={`p-2 border transition-all ${
                  isAtivo
                    ? 'border-purple-500/30 bg-purple-900/10'
                    : 'border-transparent opacity-40'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAtivo ? 'bg-purple-400' : 'bg-stone-700'}`} />
                    <span className={`font-display tracking-wide ${f.color}`}>{f.valor} — {f.label}</span>
                  </div>
                  {sintoma && (
                    <p className="text-stone-500 italic mt-0.5 pl-3.5">{sintoma}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sintomas acumulados ativos */}
          {sintomasCorAtivos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-700/50">
              <p className="font-display text-xs text-purple-500 uppercase mb-1">Sintomas Acumulados</p>
              {sintomasCorAtivos.map(([v, s]) => (
                <p key={v} className="font-body text-xs text-purple-400 italic">• {s}</p>
              ))}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-stone-700/50">
            <p className="font-display text-xs text-stone-600 uppercase mb-1">Como reduzir</p>
            <p className="font-body text-xs text-stone-600 italic">
              Rituais especiais • Purificação • Missão santificada • Bênção de entidades
            </p>
          </div>
        </div>
      </div>

      {/* ── Testes de Morte ── */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-1">💀 Testes de Morte</p>
        <p className="font-body text-xs text-stone-400 italic mb-4">
          A 0 PV: role 1d20 no início de cada turno.
          Role <span className="text-parchment-300">1</span> → 2 falhas •{' '}
          <span className="text-stone-300">2–9</span> → 1 falha •{' '}
          <span className="text-emerald-400">10–19</span> → 1 sucesso •{' '}
          <span className="text-parchment-400">20</span> → acorda com 1 PV
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(['sucessos', 'falhas'] as const).map(tipo => {
            const isSucesso = tipo === 'sucessos';
            const val = testesMorte[tipo];
            return (
              <div key={tipo} className="text-center">
                <p className={`font-display text-xs tracking-widest uppercase mb-2 ${isSucesso ? 'text-emerald-500' : 'text-crimson-500'}`}>
                  {isSucesso ? '✓ Sucessos' : '✗ Falhas'}
                </p>
                <div className="flex justify-center gap-2">
                  {[1,2,3].map(n => (
                    <button
                      key={n}
                      onClick={() => onUpdate({ testes_morte: { ...testesMorte, [tipo]: val === n ? n - 1 : n } })}
                      className={`w-10 h-10 border-2 transition-all font-display ${
                        n <= val
                          ? isSucesso
                            ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
                            : 'border-crimson-500 bg-crimson-900/40 text-crimson-300'
                          : 'border-stone-700 text-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {isSucesso ? '✓' : '✗'}
                    </button>
                  ))}
                </div>
                {val >= 3 && (
                  <p className={`font-display text-xs mt-2 ${isSucesso ? 'text-emerald-400' : 'text-crimson-400'}`}>
                    {isSucesso ? '— Estabilizado —' : '— Morto —'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-stone-700/50 grid grid-cols-2 gap-3 text-center text-xs font-body text-stone-500 italic">
          <p>3 sucessos → Estabilizado (fica em 0 PV, dorme 1d4h)</p>
          <p>3 falhas → Morte</p>
        </div>
        <button
          onClick={() => onUpdate({ testes_morte: { sucessos: 0, falhas: 0 } })}
          className="btn-secondary mt-3 text-xs w-full"
        >
          Reiniciar Testes
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Reputação
// ─────────────────────────────────────────────────────────────
function ReputacaoTab({ reputacao, onUpdate }: {
  reputacao: Array<{ grupo: string; valor: number }>;
  onUpdate: (reps: Array<{ grupo: string; valor: number }>) => void;
}) {
  const [novoGrupo, setNovoGrupo] = useState("");

  function addGrupo() {
    if (novoGrupo.trim()) {
      onUpdate([...reputacao, { grupo: novoGrupo.trim(), valor: 0 }]);
      setNovoGrupo("");
    }
  }

  function setValor(i: number, val: number) {
    const next = [...reputacao];
    next[i] = { ...next[i], valor: Math.max(-5, Math.min(5, val)) };
    onUpdate(next);
  }

  function remove(i: number) {
    onUpdate(reputacao.filter((_, j) => j !== i));
  }

  function getRepColor(val: number) {
    if (val >= 3) return 'text-emerald-400';
    if (val >= 1) return 'text-parchment-400';
    if (val === 0) return 'text-stone-400';
    if (val >= -2) return 'text-orange-400';
    return 'text-crimson-400';
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-1">Como a Reputação funciona</p>
        <p className="font-body text-xs text-stone-400 italic mb-3">
          Cada grupo/facção tem sua opinião independente sobre você. De −5 (Inimigo Mortal) a +5 (Herói Local).
        </p>
        {reputacao.length === 0 && (
          <p className="font-body text-sm text-stone-600 italic text-center py-4">
            Nenhuma reputação registrada ainda.
          </p>
        )}
        <div className="space-y-3">
          {reputacao.map((rep, i) => {
            const faixa = FAIXAS_REPUTACAO.find(f => f.valor === rep.valor);
            return (
              <div key={i} className="flex items-center gap-3 p-3 border border-stone-700 bg-stone-900/40">
                <div className="flex-1">
                  <p className="font-display text-sm text-parchment-200">{rep.grupo}</p>
                  <p className={`font-body text-xs ${getRepColor(rep.valor)}`}>
                    {faixa?.label ?? 'Neutro'} {faixa && faixa.mod !== 0 ? `(Diplomacia ${faixa.mod >= 0 ? '+' : ''}${faixa.mod})` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setValor(i, rep.valor - 1)}
                    className="w-7 h-7 border border-stone-700 text-stone-500 hover:border-crimson-700 hover:text-crimson-400 font-display">−</button>
                  <span className={`font-display text-lg w-6 text-center ${getRepColor(rep.valor)}`}>
                    {rep.valor >= 0 ? '+' : ''}{rep.valor}
                  </span>
                  <button onClick={() => setValor(i, rep.valor + 1)}
                    className="w-7 h-7 border border-stone-700 text-stone-500 hover:border-emerald-700 hover:text-emerald-400 font-display">+</button>
                </div>
                <button onClick={() => remove(i)}
                  className="text-stone-600 hover:text-crimson-400 text-lg">✕</button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={novoGrupo}
            onChange={e => setNovoGrupo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGrupo()}
            placeholder="Nome do grupo/cidade/facção..."
            className="flex-1 bg-stone-800 border border-stone-600 px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-parchment-500"
          />
          <button onClick={addGrupo} className="btn-secondary px-4">+ Adicionar</button>
        </div>
      </div>

      {/* Quick reference */}
      <div className="card p-4">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Tabela de Referência</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
          {FAIXAS_REPUTACAO.map(f => (
            <div key={f.valor} className="flex items-center justify-between py-0.5 border-b border-stone-800">
              <span className="font-display text-xs text-stone-500">
                {f.valor >= 0 ? '+' : ''}{f.valor}
              </span>
              <span className={`font-body text-xs ${
                f.valor >= 3 ? 'text-emerald-400' : f.valor >= 0 ? 'text-stone-300' : 'text-crimson-400'
              }`}>
                {f.label}
              </span>
              {f.mod !== 0 && (
                <span className="font-display text-xs text-stone-600">
                  Dip {f.mod > 0 ? '+' : ''}{f.mod}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Base
// ─────────────────────────────────────────────────────────────
function BaseTab({ base, onUpdate }: {
  base: { nome: string; nivel: number; modulos: string[]; custo_total: number };
  onUpdate: (b: typeof base) => void;
}) {
  const nivelLabels = ['—', 'Casebre', 'Casa', 'Casa Melhorada', 'Mansão', 'Fortificação'];
  const custoPorNivel = [0, 30, 80, 160, 300, 500];
  const manutencao = Math.round(base.custo_total * 0.1);

  function toggleModulo(id: string) {
    const modulo = MODULOS_BASE.find(m => m.id === id)!;
    const hasIt = base.modulos.includes(id);
    const newModulos = hasIt ? base.modulos.filter(m => m !== id) : [...base.modulos, id];
    const newCusto = base.custo_total + (hasIt ? -modulo.custo : modulo.custo);
    const newNivel = newCusto >= custoPorNivel[5] ? 5
      : newCusto >= custoPorNivel[4] ? 4
      : newCusto >= custoPorNivel[3] ? 3
      : newCusto >= custoPorNivel[2] ? 2
      : newCusto >= custoPorNivel[1] ? 1 : 0;
    onUpdate({ ...base, modulos: newModulos, custo_total: Math.max(0, newCusto), nivel: newNivel });
  }

  return (
    <div className="space-y-4">
      {/* Base info */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex-1">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-1">Nome da Base</p>
            <input
              type="text"
              value={base.nome}
              onChange={e => onUpdate({ ...base, nome: e.target.value })}
              placeholder="Ex: A Taverna Abandonada, Torre do Grupo..."
              className="w-full bg-stone-800 border border-stone-600 px-3 py-2 text-parchment-200 font-display text-sm focus:outline-none focus:border-parchment-500"
            />
          </div>
          <div className="text-center">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-1">Nível</p>
            <p className="font-display text-3xl text-parchment-200">{base.nivel}</p>
            <p className="font-body text-xs text-stone-400">{nivelLabels[base.nivel] ?? '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-stone-800/50 border border-stone-700 p-3">
            <p className="font-display text-xs text-stone-500 uppercase">Investido</p>
            <p className="font-display text-xl text-parchment-300">{base.custo_total} PO</p>
          </div>
          <div className="bg-stone-800/50 border border-stone-700 p-3">
            <p className="font-display text-xs text-stone-500 uppercase">Manutenção/mês</p>
            <p className="font-display text-xl text-parchment-300">{manutencao} PO</p>
          </div>
        </div>

        {base.nivel > 0 && (
          <div className="mt-3 p-3 bg-stone-800/40 border border-stone-700/50">
            <p className="font-display text-xs text-parchment-500 tracking-widest uppercase mb-1">Bônus Passivo — Nível {base.nivel}</p>
            <p className="font-body text-xs text-stone-400">
              {base.nivel >= 2 && '• +1 em testes sociais com moradores da região. '}
              {base.nivel >= 3 && '• +1 em investigações dentro da base. '}
              {base.nivel >= 4 && '• Recuperações melhoradas (+1 dado de cura). '}
              {base.nivel >= 5 && '• Escolha 1 Aura: Proteção (+1 CA), Inspiração (+1 CAR) ou Sabedoria (+1 Percepção).'}
            </p>
          </div>
        )}
      </div>

      {/* Módulos */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Módulos Disponíveis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODULOS_BASE.map(mod => {
            const active = base.modulos.includes(mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => toggleModulo(mod.id)}
                className={`flex items-start justify-between p-3 border transition-all text-left ${
                  active
                    ? 'border-parchment-500/40 bg-parchment-500/5'
                    : 'border-stone-700 hover:border-stone-600'
                }`}
              >
                <div className="flex-1 pr-2">
                  <span className={`font-display text-xs tracking-wide ${active ? 'text-parchment-300' : 'text-stone-500'}`}>
                    {mod.nome}
                  </span>
                  <p className="font-body text-xs text-stone-500 mt-0.5">{mod.desc}</p>
                </div>
                <span className={`font-display text-sm flex-shrink-0 ${active ? 'text-parchment-400' : 'text-stone-600'}`}>
                  {mod.custo} PO
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
