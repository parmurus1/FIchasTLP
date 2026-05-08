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
  testes_morte?: { sucessos: number; falhas: number };
}

const ATRIBUTO_LABELS: Record<string, string> = {
  FOR: 'Força', DES: 'Destreza', CON: 'Constituição', INT: 'Inteligência', CAR: 'Carisma',
};

const SAVE_LABELS = [
  { key: 'fortitude', label: 'Fortitude', attr: 'CON' },
  { key: 'reflexos', label: 'Reflexos', attr: 'DES' },
  { key: 'vontade', label: 'Vontade', attr: 'INT' },
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
        <div className="flex gap-3 mt-3 pt-3 border-t border-stone-700/50">
          {SAVE_LABELS.map(sv => {
            const mod = getModificador(atributos[sv.attr as keyof AtributosChar]);
            return (
              <div key={sv.key} className="text-center">
                <p className="font-display text-xs tracking-widest text-stone-600 uppercase">{sv.label}</p>
                <p className={`font-display text-sm ${mod >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                  {getModStr(mod)}
                </p>
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

        {classeData && (
          <div className="card p-4">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
              Habilidade de Classe
            </p>
            <p className="font-display text-sm text-parchment-300 mb-1">{classeData.habilidade}</p>
            <p className="font-body text-xs text-stone-400">{classeData.habilidade_desc}</p>
            <div className="mt-3 pt-3 border-t border-stone-700">
              <p className="font-display text-xs text-stone-600 uppercase mb-1">Escolhas</p>
              <p className="font-body text-xs text-stone-400">
                <span className="text-stone-500">Escola/Estilo:</span>{" "}
                {classeData.escolas.find(e => e.id === dados.escola)?.nome ?? dados.escola ?? "—"}
              </p>
              <p className="font-body text-xs text-stone-400 mt-0.5">
                <span className="text-stone-500">Talento:</span>{" "}
                {classeData.talentos.find(t => t.id === dados.talento_classe)?.nome ?? dados.talento_classe ?? "—"}
              </p>
            </div>
          </div>
        )}
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
// Tab: Inventário
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

  function updMoeda(key: keyof typeof dinheiro, val: number) {
    onUpdate({ dinheiro: { ...dinheiro, [key]: Math.max(0, val) } });
  }

  return (
    <div className="space-y-4">
      {/* Dinheiro */}
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

      {/* Inventário */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Inventário & Equipamentos</p>
        <textarea
          value={def(dados.inventario, '')}
          onChange={e => onUpdate({ inventario: e.target.value })}
          rows={10}
          placeholder={`Liste seus itens aqui...\n\nEx:\n• Espada longa (1d8 cortante)\n• Armadura de Couro (+2 CA)\n• Grimório Rúnico — 8 runas de nível 1\n• Kit de Escriba Rúnico\n• Corda (15 metros)\n• 3x Poção de Cura (2d8+2 PV)`}
          className="w-full bg-stone-800/60 border border-stone-700 px-3 py-2 text-stone-300 text-sm font-body italic focus:outline-none focus:border-parchment-500 resize-none leading-relaxed"
        />
      </div>

      {/* Notas */}
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
function EstadoTab({ sanidade, corrupcao, testesMorte, dados, onUpdate }: {
  sanidade: number; corrupcao: number;
  testesMorte: { sucessos: number; falhas: number };
  dados: FichaDados;
  onUpdate: (patch: Partial<FichaDados>) => void;
}) {
  const sanFaixa = FAIXAS_SANIDADE.find(f => f.valor === sanidade) ?? FAIXAS_SANIDADE[0];
  const corFaixa = FAIXAS_CORRUPCAO.find(f => f.valor === corrupcao) ?? FAIXAS_CORRUPCAO[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sanidade */}
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
            {[0,1,2,3,4,5].map(v => (
              <button
                key={v}
                onClick={() => onUpdate({ sanidade: v })}
                className={`w-8 h-8 border font-display text-sm transition-all ${
                  v <= sanidade
                    ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                    : 'border-stone-700 text-stone-700 hover:border-stone-500'
                }`}
              >{v}</button>
            ))}
          </div>
          <div className="space-y-1 text-xs font-body">
            {FAIXAS_SANIDADE.map(f => (
              <div key={f.valor} className={`flex items-center gap-2 ${f.valor === sanidade ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${f.valor === sanidade ? 'bg-parchment-500' : 'bg-stone-700'}`} />
                <span className={f.color}>{f.valor} — {f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Corrupção */}
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
                  v <= corrupcao && corrupcao > 0
                    ? 'border-purple-500 bg-purple-900/30 text-purple-400'
                    : v === 0 && corrupcao === 0
                    ? 'border-sky-500 bg-sky-900/20 text-sky-400'
                    : 'border-stone-700 text-stone-700 hover:border-stone-500'
                }`}
              >{v}</button>
            ))}
          </div>
          <div className="space-y-1 text-xs font-body">
            {FAIXAS_CORRUPCAO.map(f => (
              <div key={f.valor} className={`flex items-center gap-2 ${f.valor === corrupcao ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${f.valor === corrupcao ? 'bg-parchment-500' : 'bg-stone-700'}`} />
                <span className={f.color}>{f.valor} — {f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testes de Morte */}
      <div className="card p-5">
        <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">💀 Testes de Morte</p>
        <p className="font-body text-xs text-stone-400 italic mb-4">
          A 0 PV: role 1d20 no início de cada turno. 3 sucessos = estabilizado. 3 falhas = morte.
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
                      className={`w-10 h-10 border-2 transition-all ${
                        n <= val
                          ? isSucesso
                            ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
                            : 'border-crimson-500 bg-crimson-900/40 text-crimson-300'
                          : 'border-stone-700 text-stone-700'
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
        <button
          onClick={() => onUpdate({ testes_morte: { sucessos: 0, falhas: 0 } })}
          className="btn-secondary mt-4 text-xs w-full"
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
