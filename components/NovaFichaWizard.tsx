"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ANCESTRALIDADES,
  BIOGRAFIAS,
  CLASSES,
  PERICIAS_PRINCIPAIS,
  IDIOMAS_DISPONIVEIS,
  getModificador,
  getModStr,
  calcularPVBase,
  type Atributo,
} from "@/lib/game-data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface AtributosChar {
  FOR: number;
  DES: number;
  CON: number;
  INT: number;
  CAR: number;
}

interface WizardState {
  nome: string;
  ancestralidade: string;
  heranca: string;
  biografia: string;
  biografia_bonus_escolha: string; // which attribute chosen from the flexible group
  classe: string;
  escola: string;
  talento_classe: string;
  atributos_base: AtributosChar;
  free_bonuses: Atributo[];   // 4 free +2 improvements
  pericias_treinadas: string[];
  saberes: string[];
  idiomas: string[];
  notas: string;
}

const ATRIBUTOS: Array<{ key: keyof AtributosChar; label: string }> = [
  { key: 'FOR', label: 'Força' },
  { key: 'DES', label: 'Destreza' },
  { key: 'CON', label: 'Constituição' },
  { key: 'INT', label: 'Inteligência' },
  { key: 'CAR', label: 'Carisma' },
];

const TOTAL_STEPS = 7;

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-display text-xs tracking-widest text-parchment-500 uppercase">
          Passo {step}/{TOTAL_STEPS}
        </span>
        <div className="flex-1 h-px bg-stone-700" />
        <span className="font-display text-xs tracking-widest text-stone-500 uppercase">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full mx-0.5 ${i < step ? 'bg-parchment-500' : 'bg-stone-700'}`}
            />
          ))}
        </span>
      </div>
      <h2 className="font-display text-xl text-parchment-200 tracking-widest uppercase">
        {title}
      </h2>
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 border transition-all duration-150 cursor-pointer ${
        selected
          ? "border-parchment-500 bg-parchment-500/10 shadow-glow-amber"
          : "border-stone-700 bg-stone-900/60 hover:border-stone-500"
      }`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Wizard
// ─────────────────────────────────────────────────────────────
export function NovaFichaWizard({ playerId }: { playerId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<WizardState>({
    nome: "",
    ancestralidade: "",
    heranca: "",
    biografia: "",
    biografia_bonus_escolha: "",
    classe: "",
    escola: "",
    talento_classe: "",
    atributos_base: { FOR: 10, DES: 10, CON: 10, INT: 10, CAR: 10 },
    free_bonuses: [],
    pericias_treinadas: [],
    saberes: [],
    idiomas: [],
    notas: "",
  });

  const up = useCallback(
    (key: keyof WizardState, value: unknown) =>
      setState((s) => ({ ...s, [key]: value })),
    []
  );

  // ── Computed values ──────────────────────────────────────────
  const ancestralidadeData = ANCESTRALIDADES[state.ancestralidade];
  const biografiaData = BIOGRAFIAS[state.biografia];
  const classeData = CLASSES[state.classe];

  const atributosFinais = (() => {
    const base = { ...state.atributos_base };

    // Apply racial bonuses
    if (ancestralidadeData) {
      for (const bonus of ancestralidadeData.bonuses) {
        if (bonus !== "LIVRE") base[bonus as keyof AtributosChar] += 2;
      }
      for (const def of ancestralidadeData.defeitos) {
        if (def !== "LIVRE") base[def as keyof AtributosChar] -= 2;
      }
    }

    // Apply background bonus (simplified: +2 to first non-LIVRE option + LIVRE)
    // Biography gives 2 improvements total
    if (biografiaData && state.biografia_bonus_escolha) {
      const chosen = state.biografia_bonus_escolha as keyof AtributosChar;
      if (chosen in base) base[chosen] += 2;
      // second bonus is always LIVRE — handled via free_bonuses
    }

    // Apply class key attribute
    if (classeData) {
      const chave = classeData.atributo_chave as keyof AtributosChar;
      if (chave in base) base[chave] += 2;
    }

    // Apply 4 free bonuses
    for (const bonus of state.free_bonuses) {
      if (bonus !== "LIVRE" && bonus in base) base[bonus as keyof AtributosChar] += 2;
    }

    return base;
  })();

  const pvTotal =
    ancestralidadeData && classeData
      ? calcularPVBase(
          classeData.pv,
          ancestralidadeData.pv,
          getModificador(atributosFinais.CON)
        )
      : 0;

  // ── Step validation ──────────────────────────────────────────
  const canProceed: Record<number, boolean> = {
    1: state.nome.trim().length > 1,
    2: !!state.ancestralidade && !!state.heranca,
    3: !!state.biografia,
    4: !!state.classe && !!state.escola && !!state.talento_classe,
    5: state.free_bonuses.length === 4,
    6: true,
    7: true,
  };

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const dados = {
      ancestralidade: state.ancestralidade,
      heranca: state.heranca,
      classe: state.classe,
      escola: state.escola,
      talento_classe: state.talento_classe,
      biografia: state.biografia,
      nivel: 1,
      atributos: atributosFinais,
      pv_maximo: pvTotal,
      pv_atual: pvTotal,
      pericias: Object.fromEntries(
        PERICIAS_PRINCIPAIS.map((p) => [p.nome, state.pericias_treinadas.includes(p.nome)])
      ),
      saberes: state.saberes.map((s) => ({ nome: s, treinado: true })),
      idiomas: [
        ...(ancestralidadeData?.idiomas ?? []),
        ...state.idiomas,
      ],
      dinheiro: { PC: 0, PP: 0, PO: 15, PPl: 0 },
      sanidade: 5,
      corrupcao: 0,
      reputacao: [],
      base: { nome: '', nivel: 0, modulos: [], custo_total: 0 },
      notas: state.notas,
      inventario: '',
      testes_morte: { sucessos: 0, falhas: 0 },
    };

    const { data, error } = await supabase
      .from("fichas")
      .insert({ player_id: playerId, nome: state.nome, dados })
      .select("id")
      .single();

    setSaving(false);
    if (!error && data) {
      router.push(`/ficha/${data.id}`);
      router.refresh();
    } else {
      alert("Erro ao salvar ficha: " + error?.message);
    }
  }

  // ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      {/* ── STEP 1: Nome ── */}
      {step === 1 && (
        <div>
          <StepHeader step={1} title="Nome do Personagem" />
          <div className="card p-6 mb-4">
            <p className="font-body italic text-stone-400 text-sm mb-4">
              Que nome carregará este aventureiro através de{" "}
              <span className="text-parchment-300">Ao Tauarua</span>?
            </p>
            <input
              type="text"
              value={state.nome}
              onChange={(e) => up("nome", e.target.value)}
              placeholder="Nome do personagem..."
              className="w-full bg-stone-800 border border-stone-600 px-4 py-3 text-parchment-200 font-display tracking-wide text-lg focus:outline-none focus:border-parchment-500 placeholder-stone-600"
            />
          </div>
        </div>
      )}

      {/* ── STEP 2: Ancestralidade ── */}
      {step === 2 && (
        <div>
          <StepHeader step={2} title="Ancestralidade" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {Object.values(ANCESTRALIDADES).map((anc) => (
              <SelectCard
                key={anc.nome}
                selected={state.ancestralidade === anc.nome}
                onClick={() => { up("ancestralidade", anc.nome); up("heranca", ""); }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-display text-sm text-parchment-200 tracking-wide">{anc.nome}</span>
                  <span className="font-display text-xs text-stone-500">{anc.tamanho}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {anc.bonuses.map((b, i) => (
                    <span key={i} className="text-xs bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded">
                      +{b}
                    </span>
                  ))}
                  {anc.defeitos.map((d, i) => (
                    <span key={i} className="text-xs bg-crimson-900/40 text-crimson-400 px-1.5 py-0.5 rounded">
                      -{d}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-stone-500 font-body">
                  PV: {anc.pv} · {anc.deslocamento}
                </div>
              </SelectCard>
            ))}
          </div>

          {state.ancestralidade && ancestralidadeData && (
            <div className="card p-5">
              <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
                Escolha uma Herança
              </p>
              <div className="space-y-2">
                {ancestralidadeData.heranças.map((h) => (
                  <SelectCard
                    key={h.id}
                    selected={state.heranca === h.id}
                    onClick={() => up("heranca", h.id)}
                  >
                    <span className="font-display text-sm text-parchment-300">{h.nome}</span>
                    <p className="font-body text-xs text-stone-400 mt-0.5">{h.desc}</p>
                  </SelectCard>
                ))}
              </div>
              <div className="mt-4 p-3 bg-stone-800/50 border border-stone-700">
                <p className="font-display text-xs text-parchment-500 tracking-widest uppercase mb-1">
                  {ancestralidadeData.habilidade_racial}
                </p>
                <p className="font-body text-xs text-stone-400">
                  {ancestralidadeData.habilidade_racial_desc}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Biografia ── */}
      {step === 3 && (
        <div>
          <StepHeader step={3} title="Biografia" />
          <p className="font-body italic text-stone-400 text-sm mb-4">
            A história de vida molda as habilidades e perspectivas do personagem.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-96 overflow-y-auto pr-1">
            {Object.values(BIOGRAFIAS).map((bio) => (
              <SelectCard
                key={bio.nome}
                selected={state.biografia === bio.nome}
                onClick={() => { up("biografia", bio.nome); up("biografia_bonus_escolha", ""); }}
              >
                <span className="font-display text-sm text-parchment-200">{bio.nome}</span>
                <p className="font-body text-xs text-stone-400 mt-0.5 line-clamp-2">{bio.desc}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {bio.pericias.map((p, i) => (
                    <span key={i} className="text-xs bg-stone-700/60 text-stone-300 px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </SelectCard>
            ))}
          </div>

          {state.biografia && biografiaData && (
            <div className="card p-5">
              <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
                Bônus de Atributo — Escolha um:
              </p>
              <div className="flex flex-wrap gap-2">
                {biografiaData.bonuses[0].filter(a => a !== 'LIVRE').map((attr) => (
                  <button
                    key={attr}
                    onClick={() => up("biografia_bonus_escolha", attr)}
                    className={`px-4 py-2 font-display text-sm tracking-wide border transition-all ${
                      state.biografia_bonus_escolha === attr
                        ? "border-parchment-500 bg-parchment-500/20 text-parchment-200"
                        : "border-stone-600 text-stone-400 hover:border-stone-400"
                    }`}
                  >
                    {attr} +2
                  </button>
                ))}
              </div>
              <p className="font-body text-xs text-stone-500 mt-2">
                + 1 melhoria livre (será aplicada no passo de atributos)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Classe ── */}
      {step === 4 && (
        <div>
          <StepHeader step={4} title="Classe" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {Object.values(CLASSES).map((cls) => (
              <SelectCard
                key={cls.nome}
                selected={state.classe === cls.nome}
                onClick={() => { up("classe", cls.nome); up("escola", ""); up("talento_classe", ""); }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-sm text-parchment-200">{cls.nome}</span>
                  <span className="font-display text-xs text-stone-500">PV {cls.pv}</span>
                </div>
                <div className="mt-1 flex gap-2">
                  <span className="text-xs bg-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded">
                    Chave: {cls.atributo_chave}
                  </span>
                </div>
                <p className="font-body text-xs text-stone-400 mt-1.5 line-clamp-2">{cls.descricao}</p>
              </SelectCard>
            ))}
          </div>

          {state.classe && classeData && (
            <div className="space-y-4">
              <div className="card p-5">
                <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
                  Escola / Estilo / Círculo / Doutrina
                </p>
                <div className="space-y-2">
                  {classeData.escolas.map((e) => (
                    <SelectCard
                      key={e.id}
                      selected={state.escola === e.id}
                      onClick={() => up("escola", e.id)}
                    >
                      <span className="font-display text-sm text-parchment-300">{e.nome}</span>
                      <p className="font-body text-xs text-stone-400 mt-0.5">{e.desc}</p>
                    </SelectCard>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
                  Talento de Classe
                </p>
                <div className="space-y-2">
                  {classeData.talentos.map((t) => (
                    <SelectCard
                      key={t.id}
                      selected={state.talento_classe === t.id}
                      onClick={() => up("talento_classe", t.id)}
                    >
                      <span className="font-display text-sm text-parchment-300">{t.nome}</span>
                      <p className="font-body text-xs text-stone-400 mt-0.5">{t.desc}</p>
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 5: Atributos ── */}
      {step === 5 && (
        <div>
          <StepHeader step={5} title="Distribuição de Atributos" />
          <div className="card p-5 mb-4">
            <p className="font-body italic text-stone-400 text-sm mb-1">
              Todos os atributos começam em 10. Você tem{" "}
              <span className="text-parchment-300 font-display">
                {4 - state.free_bonuses.length} melhorias livres restantes
              </span>{" "}
              para distribuir (+2 cada).
            </p>
            <p className="font-body text-xs text-stone-500">
              Bônus de ancestralidade, biografia e classe já foram aplicados automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
            {ATRIBUTOS.map(({ key, label }) => {
              const final = atributosFinais[key];
              const mod = getModificador(final);
              const freeBonusCount = state.free_bonuses.filter(b => b === key).length;
              return (
                <div key={key} className="card p-4 text-center">
                  <p className="font-display text-xs tracking-widest text-stone-500 uppercase mb-1">{label}</p>
                  <p className="font-display text-3xl text-parchment-200 mb-0.5">{final}</p>
                  <p className={`font-display text-sm ${mod >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                    {getModStr(final)}
                  </p>
                  <div className="flex gap-1 justify-center mt-2">
                    <button
                      onClick={() => {
                        const newBonuses = [...state.free_bonuses];
                        const idx = newBonuses.lastIndexOf(key);
                        if (idx !== -1) newBonuses.splice(idx, 1);
                        up("free_bonuses", newBonuses);
                      }}
                      disabled={freeBonusCount === 0}
                      className="w-7 h-7 border border-stone-600 text-stone-400 hover:border-crimson-500 hover:text-crimson-400 disabled:opacity-30 font-display text-sm transition-all"
                    >
                      −
                    </button>
                    <button
                      onClick={() => {
                        if (state.free_bonuses.length < 4) {
                          up("free_bonuses", [...state.free_bonuses, key]);
                        }
                      }}
                      disabled={state.free_bonuses.length >= 4}
                      className="w-7 h-7 border border-stone-600 text-stone-400 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30 font-display text-sm transition-all"
                    >
                      +
                    </button>
                  </div>
                  {freeBonusCount > 0 && (
                    <p className="text-xs text-emerald-500 mt-1">+{freeBonusCount * 2} livre</p>
                  )}
                </div>
              );
            })}
          </div>

          {pvTotal > 0 && (
            <div className="card p-4 text-center">
              <p className="font-display text-xs tracking-widest text-stone-500 uppercase mb-1">
                Pontos de Vida Iniciais
              </p>
              <p className="font-display text-4xl text-parchment-200">{pvTotal}</p>
              <p className="font-body text-xs text-stone-500 mt-1">
                Raça {ancestralidadeData?.pv} + Classe {classeData?.pv} + CON{" "}
                {getModStr(atributosFinais.CON)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 6: Perícias & Idiomas ── */}
      {step === 6 && (
        <div>
          <StepHeader step={6} title="Perícias e Idiomas" />

          {/* Perícias from background */}
          <div className="card p-5 mb-4">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
              Perícias Treinadas
            </p>
            <p className="font-body text-xs text-stone-400 mb-3 italic">
              Biografia concede: {biografiaData?.pericias.join(", ")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PERICIAS_PRINCIPAIS.map((p) => {
                const trained = state.pericias_treinadas.includes(p.nome);
                return (
                  <button
                    key={p.nome}
                    onClick={() =>
                      up(
                        "pericias_treinadas",
                        trained
                          ? state.pericias_treinadas.filter(x => x !== p.nome)
                          : [...state.pericias_treinadas, p.nome]
                      )
                    }
                    className={`px-2 py-1.5 text-left border transition-all ${
                      trained
                        ? "border-parchment-500/60 bg-parchment-500/10 text-parchment-300"
                        : "border-stone-700 text-stone-500 hover:border-stone-500"
                    }`}
                  >
                    <span className="font-display text-xs tracking-wide block">{p.nome}</span>
                    <span className="font-body text-xs text-stone-600">{p.atributo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saberes */}
          <div className="card p-5 mb-4">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">
              Saberes Específicos
            </p>
            <div className="flex gap-2 flex-wrap mb-2">
              {state.saberes.map((s, i) => (
                <span key={i} className="flex items-center gap-1 bg-stone-800 border border-stone-700 px-2 py-1 text-xs text-stone-300">
                  Saber: {s}
                  <button
                    onClick={() => up("saberes", state.saberes.filter((_, j) => j !== i))}
                    className="text-stone-600 hover:text-crimson-400 ml-1"
                  >×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Adicionar saber (ex: Submundo, Dragões)..."
              className="w-full bg-stone-800 border border-stone-600 px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-parchment-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  up("saberes", [...state.saberes, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
            />
            <p className="font-body text-xs text-stone-600 mt-1">Pressione Enter para adicionar</p>
          </div>

          {/* Idiomas */}
          <div className="card p-5">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">
              Idiomas Adicionais
            </p>
            <p className="font-body text-xs text-stone-400 mb-3 italic">
              Já possui: {ancestralidadeData?.idiomas.join(", ")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {IDIOMAS_DISPONIVEIS.filter(
                lang => !ancestralidadeData?.idiomas.includes(lang)
              ).map((lang) => {
                const hasIt = state.idiomas.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() =>
                      up(
                        "idiomas",
                        hasIt
                          ? state.idiomas.filter(l => l !== lang)
                          : [...state.idiomas, lang]
                      )
                    }
                    className={`px-2 py-1.5 text-left border transition-all font-display text-xs tracking-wide ${
                      hasIt
                        ? "border-parchment-500/60 bg-parchment-500/10 text-parchment-300"
                        : "border-stone-700 text-stone-500 hover:border-stone-500"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 7: Review ── */}
      {step === 7 && (
        <div>
          <StepHeader step={7} title="Revisão Final" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Identity */}
            <div className="card p-5">
              <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Identidade</p>
              <div className="space-y-2">
                <ReviewRow label="Nome" value={state.nome} />
                <ReviewRow label="Ancestralidade" value={state.ancestralidade} />
                <ReviewRow label="Herança" value={
                  ancestralidadeData?.heranças.find(h => h.id === state.heranca)?.nome ?? "—"
                } />
                <ReviewRow label="Biografia" value={state.biografia} />
                <ReviewRow label="Classe" value={state.classe} />
                <ReviewRow label="PV Inicial" value={String(pvTotal)} highlight />
              </div>
            </div>

            {/* Attributes */}
            <div className="card p-5">
              <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-3">Atributos Finais</p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {ATRIBUTOS.map(({ key, label }) => (
                  <div key={key}>
                    <p className="font-display text-xs text-stone-600 uppercase">{key}</p>
                    <p className="font-display text-2xl text-parchment-200">{atributosFinais[key]}</p>
                    <p className={`font-display text-xs ${getModificador(atributosFinais[key]) >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                      {getModStr(atributosFinais[key])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5 mb-4">
            <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Notas Iniciais</p>
            <textarea
              value={state.notas}
              onChange={e => up("notas", e.target.value)}
              rows={3}
              placeholder="Detalhes do personagem, aparência, motivação..."
              className="w-full bg-stone-800 border border-stone-600 px-3 py-2 text-stone-300 text-sm font-body italic focus:outline-none focus:border-parchment-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full text-center justify-center py-3 text-base"
          >
            {saving ? "Forjando o herói..." : "⚔ Criar Personagem"}
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="btn-secondary disabled:opacity-30"
        >
          ← Voltar
        </button>
        {step < TOTAL_STEPS && (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed[step]}
            className="btn-primary disabled:opacity-30"
          >
            Avançar →
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-display text-xs tracking-widest uppercase text-stone-500">{label}</span>
      <span className={`font-body text-sm ${highlight ? 'text-parchment-300 font-display' : 'text-parchment-200'}`}>
        {value || "—"}
      </span>
    </div>
  );
}
