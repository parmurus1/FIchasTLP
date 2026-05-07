"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { RolagemDados } from "@/components/RolagemDados";
import { HistoricoRolagens } from "@/components/HistoricoRolagens";
import { NovaFichaWizard } from "@/components/NovaFichaWizard";
import { atualizarFicha } from "@/lib/ficha-actions";
import { getModStr, getBonusPericia } from "@/lib/calculos";
import { IDIOMAS_DISPONIVEIS } from "@/lib/game-data";
import type { Ficha, Profile, FichaData, Pericia, NivelPericia, Item, Habilidade } from "@/types/database";
import { DEFAULT_SETTINGS } from "@/types/database";

const TABS = [
  { id: "basico", label: "Dados Básicos", icon: "⚔" },
  { id: "atributos", label: "Atributos", icon: "💪" },
  { id: "pericias", label: "Perícias", icon: "📚" },
  { id: "habilidades", label: "Habilidades", icon: "✨" },
  { id: "inventario", label: "Inventário", icon: "💰" },
  { id: "combate", label: "Combate", icon: "🛡" },
  { id: "notas", label: "Notas", icon: "📝" },
];

const ATTR_LABELS: Record<string, string> = {
  FOR: "Força", DES: "Destreza", CON: "Constituição", INT: "Inteligência", CAR: "Carisma",
};
const NIVEL_LABELS: Record<NivelPericia, string> = {
  destreinado: "—", treinado: "T", especialista: "E",
};

export default function FichaPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [dados, setDados] = useState<FichaData | null>(null);
  const [tab, setTab] = useState("basico");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isNova, setIsNova] = useState(false);
  const [isMestre, setIsMestre] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (id === "nova") { setIsNova(true); return; }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single() as { data: Profile | null };
      if (!prof) { router.push("/login"); return; }
      setProfile(prof as Profile);
      setIsMestre(prof.role === "mestre");

      const { data: f } = await supabase
        .from("fichas")
        .select("*, profiles(*)")
        .eq("id", id)
        .single();

      if (!f) { router.push("/dashboard"); return; }
      if (prof.role === "player" && f.player_id !== user.id) { router.push("/dashboard"); return; }

      setFicha(f as Ficha);
      setDados(f.dados as FichaData);
    });
  }, [id, router]);

  const updateDados = useCallback((partial: Partial<FichaData>) => {
    setDados(prev => prev ? { ...prev, ...partial } : null);
  }, []);

  async function handleSave() {
    if (!ficha || !dados) return;
    setSaving(true);
    await atualizarFicha(ficha.id, dados);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Nova ficha ──
  if (isNova) {
    return (
      <div className="min-h-screen bg-dungeon">
        {profile && <Navbar profile={profile} />}
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8 text-center">
            <div className="rune-divider mb-4">⚔ ✦ ⚔</div>
            <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase">Criar Personagem</h1>
            <div className="rune-divider mt-4">⚔ ✦ ⚔</div>
          </div>
          <NovaFichaWizard playerId={profile?.id ?? ""} />
        </main>
      </div>
    );
  }

  if (!profile || !ficha || !dados) {
    return (
      <div className="min-h-screen bg-dungeon flex items-center justify-center">
        <span className="font-display text-stone-400 tracking-widest animate-pulse">Carregando...</span>
      </div>
    );
  }

  // ── Tabs ──
  return (
    <div className="min-h-screen bg-dungeon">
      <Navbar profile={profile} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl text-parchment-200 tracking-widest">{ficha.nome}</h1>
            <p className="font-body text-sm text-stone-400">
              {dados.ancestralidade} · {dados.classe} · Nível {dados.nivel}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary text-sm ${saved ? "bg-emerald-800 border-emerald-600" : ""}`}
          >
            {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar"}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border-b border-stone-700 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 font-display text-xs tracking-widest uppercase whitespace-nowrap border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-parchment-500 text-parchment-300"
                  : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* TAB: Dados Básicos */}
        {tab === "basico" && (
          <DadosBasicosTab dados={dados} updateDados={updateDados} fichaId={ficha.id} />
        )}

        {/* TAB: Atributos */}
        {tab === "atributos" && (
          <AtributosTab dados={dados} updateDados={updateDados} fichaId={ficha.id} />
        )}

        {/* TAB: Perícias */}
        {tab === "pericias" && (
          <PericisasTab dados={dados} updateDados={updateDados} fichaId={ficha.id} />
        )}

        {/* TAB: Habilidades */}
        {tab === "habilidades" && (
          <HabilidadesTab dados={dados} updateDados={updateDados} />
        )}

        {/* TAB: Inventário */}
        {tab === "inventario" && (
          <InventarioTab dados={dados} updateDados={updateDados} />
        )}

        {/* TAB: Combate */}
        {tab === "combate" && (
          <CombateTab dados={dados} updateDados={updateDados} fichaId={ficha.id} />
        )}

        {/* TAB: Notas */}
        {tab === "notas" && (
          <NotasTab dados={dados} updateDados={updateDados} />
        )}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Dados Básicos
// ══════════════════════════════════════════════════
function DadosBasicosTab({ dados, updateDados, fichaId }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
  fichaId: string;
}) {
  const [novoIdioma, setNovoIdioma] = useState("");

  function addIdioma() {
    if (novoIdioma && !dados.idiomas.includes(novoIdioma)) {
      updateDados({ idiomas: [...dados.idiomas, novoIdioma] });
      setNovoIdioma("");
    }
  }

  function removeIdioma(id: string) {
    updateDados({ idiomas: dados.idiomas.filter(i => i !== id) });
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-4 space-y-3">
          {[
            { label: "Ancestralidade", key: "ancestralidade" },
            { label: "Classe", key: "classe" },
            { label: "Biografia", key: "biografia" },
          ].map(f => (
            <div key={f.key}>
              <label className="font-display text-xs tracking-widest uppercase text-stone-500 block mb-1">{f.label}</label>
              <input
                className="input-field w-full"
                value={(dados as Record<string, unknown>)[f.key] as string ?? ""}
                onChange={e => updateDados({ [f.key]: e.target.value } as Partial<FichaData>)}
              />
            </div>
          ))}
          <div>
            <label className="font-display text-xs tracking-widest uppercase text-stone-500 block mb-1">Nível</label>
            <input
              type="number"
              min={1}
              max={20}
              className="input-field w-24"
              value={dados.nivel}
              onChange={e => updateDados({ nivel: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Idiomas */}
        <div className="card p-4">
          <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Idiomas</h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dados.idiomas.map(id => (
              <span key={id} className="flex items-center gap-1 font-body text-xs bg-stone-800 border border-stone-700 rounded px-2 py-0.5 text-stone-300">
                {id}
                <button onClick={() => removeIdioma(id)} className="text-stone-600 hover:text-crimson-400 ml-1">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              className="input-field flex-1 text-sm"
              value={novoIdioma}
              onChange={e => setNovoIdioma(e.target.value)}
            >
              <option value="">Adicionar idioma...</option>
              {IDIOMAS_DISPONIVEIS.filter(i => !dados.idiomas.includes(i)).map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <button onClick={addIdioma} className="btn-secondary text-sm px-3">+</button>
          </div>
        </div>

        {/* Rolagem recente */}
        <HistoricoRolagens fichaId={fichaId} limit={10} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Atributos
// ══════════════════════════════════════════════════
function AtributosTab({ dados, updateDados, fichaId }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
  fichaId: string;
}) {
  const attrs = dados.atributos;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(Object.keys(attrs) as Array<keyof typeof attrs>).map(k => {
        const val = attrs[k];
        const mod = Math.floor((val - 10) / 2);
        return (
          <div key={k} className="card p-4 text-center">
            <div className="font-display text-xs tracking-widest uppercase text-stone-400 mb-2">
              {ATTR_LABELS[k] ?? k}
            </div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <button
                onClick={() => updateDados({ atributos: { ...attrs, [k]: Math.max(1, val - 1) } })}
                className="w-8 h-8 rounded border border-stone-700 text-stone-400 hover:border-crimson-500 hover:text-crimson-400 font-display text-lg transition-all"
              >−</button>
              <span className="font-display text-4xl text-parchment-100 w-12">{val}</span>
              <button
                onClick={() => updateDados({ atributos: { ...attrs, [k]: val + 1 } })}
                className="w-8 h-8 rounded border border-stone-700 text-stone-400 hover:border-parchment-500 hover:text-parchment-300 font-display text-lg transition-all"
              >+</button>
            </div>
            <div className="font-display text-2xl text-parchment-400 mb-3">
              {getModStr(val)}
            </div>
            <RolagemDados
              fichaId={fichaId}
              nome={`Teste de ${ATTR_LABELS[k] ?? k}`}
              modificador={mod}
              tipo="atributo"
            />
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Perícias
// ══════════════════════════════════════════════════
function PericisasTab({ dados, updateDados, fichaId }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
  fichaId: string;
}) {
  const NIVEIS: NivelPericia[] = ["destreinado", "treinado", "especialista"];

  function cycleNivel(nome: string) {
    const updated = dados.pericias.map(p => {
      if (p.nome !== nome) return p;
      const idx = NIVEIS.indexOf(p.nivel);
      return { ...p, nivel: NIVEIS[(idx + 1) % NIVEIS.length] };
    });
    updateDados({ pericias: updated });
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-700">
            <th className="font-display text-xs tracking-widest uppercase text-stone-500 text-left p-3">Perícia</th>
            <th className="font-display text-xs tracking-widest uppercase text-stone-500 p-3">Attr</th>
            <th className="font-display text-xs tracking-widest uppercase text-stone-500 p-3">Nível</th>
            <th className="font-display text-xs tracking-widest uppercase text-stone-500 p-3">Bônus</th>
            <th className="font-display text-xs tracking-widest uppercase text-stone-500 p-3">Rolar</th>
          </tr>
        </thead>
        <tbody>
          {dados.pericias.map((p: Pericia) => {
            const bonus = getBonusPericia(p, dados.atributos, DEFAULT_SETTINGS);
            const nivelColors: Record<NivelPericia, string> = {
              destreinado: "text-stone-600",
              treinado: "text-parchment-400",
              especialista: "text-parchment-200",
            };
            return (
              <tr key={p.nome} className="border-b border-stone-800 hover:bg-stone-800/30 transition-colors">
                <td className="font-body p-3 text-parchment-200">{p.nome}</td>
                <td className="font-display text-xs text-stone-400 p-3 text-center">{p.atributo}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => cycleNivel(p.nome)}
                    className={`font-display text-xs tracking-widest uppercase px-2 py-0.5 rounded border border-stone-700 hover:border-parchment-500/50 transition-all ${nivelColors[p.nivel]}`}
                    title="Clique para alterar nível"
                  >
                    {NIVEL_LABELS[p.nivel]}
                  </button>
                </td>
                <td className={`font-display p-3 text-center ${bonus >= 0 ? "text-parchment-300" : "text-crimson-400"}`}>
                  {bonus >= 0 ? "+" : ""}{bonus}
                </td>
                <td className="p-3 text-center">
                  <RolagemDados
                    fichaId={fichaId}
                    nome={p.nome}
                    modificador={bonus}
                    tipo="pericia"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Habilidades
// ══════════════════════════════════════════════════
function HabilidadesTab({ dados, updateDados }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
}) {
  const [novoNome, setNovoNome] = useState("");
  const [novaDesc, setNovaDesc] = useState("");

  function adicionar() {
    if (!novoNome.trim()) return;
    const nova: Habilidade = { nome: novoNome, descricao: novaDesc, origem: "outro" };
    updateDados({ habilidades: [...dados.habilidades, nova] });
    setNovoNome(""); setNovaDesc("");
  }

  function remover(idx: number) {
    updateDados({ habilidades: dados.habilidades.filter((_, i) => i !== idx) });
  }

  const ORIGEM_COLORS: Record<string, string> = {
    ancestralidade: "text-emerald-400",
    classe: "text-parchment-400",
    biografia: "text-blue-400",
    outro: "text-stone-400",
  };

  return (
    <div className="space-y-4">
      {dados.habilidades.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-body italic text-stone-500">Nenhuma habilidade registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dados.habilidades.map((h, i) => (
            <div key={i} className="card p-4 flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-sm text-parchment-200">{h.nome}</span>
                  <span className={`font-body text-xs capitalize ${ORIGEM_COLORS[h.origem] ?? "text-stone-500"}`}>
                    [{h.origem}]
                  </span>
                </div>
                <p className="font-body text-sm text-stone-300">{h.descricao}</p>
              </div>
              <button onClick={() => remover(i)} className="text-stone-600 hover:text-crimson-400 transition-colors shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Adicionar Habilidade</h3>
        <div className="space-y-2">
          <input
            className="input-field w-full"
            placeholder="Nome da habilidade"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
          />
          <textarea
            className="input-field w-full h-20 resize-none"
            placeholder="Descrição..."
            value={novaDesc}
            onChange={e => setNovaDesc(e.target.value)}
          />
          <button onClick={adicionar} className="btn-secondary w-full">+ Adicionar</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Inventário
// ══════════════════════════════════════════════════
function InventarioTab({ dados, updateDados }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
}) {
  const [novoNome, setNovoNome] = useState("");
  const [novaQtd, setNovaQtd] = useState(1);
  const [novoPeso, setNovoPeso] = useState(0);

  function adicionar() {
    if (!novoNome.trim()) return;
    const novo: Item = {
      id: crypto.randomUUID(),
      nome: novoNome,
      quantidade: novaQtd,
      peso: novoPeso || undefined,
    };
    updateDados({ inventario: [...dados.inventario, novo] });
    setNovoNome(""); setNovaQtd(1); setNovoPeso(0);
  }

  function remover(id: string) {
    updateDados({ inventario: dados.inventario.filter(i => i.id !== id) });
  }

  function updateQtd(id: string, qty: number) {
    updateDados({ inventario: dados.inventario.map(i => i.id === id ? { ...i, quantidade: Math.max(0, qty) } : i) });
  }

  const pesoTotal = dados.inventario.reduce((sum, i) => sum + (i.peso ?? 0) * i.quantidade, 0);

  return (
    <div className="space-y-4">
      {/* Dinheiro */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Dinheiro</h3>
        <div className="flex gap-4 flex-wrap">
          {(["PC", "PP", "PO", "PPl"] as const).map(moeda => (
            <div key={moeda} className="text-center">
              <label className="font-display text-xs tracking-widest text-stone-500 block mb-1">{moeda}</label>
              <input
                type="number"
                min={0}
                className="input-field w-20 text-center"
                value={dados.dinheiro[moeda]}
                onChange={e => updateDados({ dinheiro: { ...dados.dinheiro, [moeda]: Number(e.target.value) } })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700">
          <h3 className="font-display text-xs tracking-widest uppercase text-stone-400">
            Itens ({dados.inventario.length})
          </h3>
          <span className="font-body text-xs text-stone-500">{pesoTotal.toFixed(1)} kg total</span>
        </div>

        {dados.inventario.length === 0 ? (
          <p className="font-body italic text-stone-500 p-6 text-center">Inventário vazio.</p>
        ) : (
          <div className="divide-y divide-stone-800">
            {dados.inventario.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2">
                <span className="font-body text-sm text-parchment-200 flex-1">{item.nome}</span>
                {item.peso && <span className="font-body text-xs text-stone-500">{item.peso}kg</span>}
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQtd(item.id, item.quantidade - 1)} className="w-6 h-6 rounded border border-stone-700 text-stone-400 hover:border-stone-500 font-display text-sm">−</button>
                  <span className="font-display text-sm text-parchment-200 w-8 text-center">{item.quantidade}</span>
                  <button onClick={() => updateQtd(item.id, item.quantidade + 1)} className="w-6 h-6 rounded border border-stone-700 text-stone-400 hover:border-stone-500 font-display text-sm">+</button>
                </div>
                <button onClick={() => remover(item.id)} className="text-stone-600 hover:text-crimson-400 transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar item */}
        <div className="border-t border-stone-700 p-4 flex gap-2 flex-wrap">
          <input
            className="input-field flex-1 min-w-32 text-sm"
            placeholder="Nome do item"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
          />
          <input
            type="number"
            min={1}
            className="input-field w-16 text-sm text-center"
            title="Quantidade"
            placeholder="Qtd"
            value={novaQtd}
            onChange={e => setNovaQtd(Number(e.target.value))}
          />
          <input
            type="number"
            min={0}
            step={0.1}
            className="input-field w-20 text-sm text-center"
            title="Peso (kg)"
            placeholder="Peso"
            value={novoPeso || ""}
            onChange={e => setNovoPeso(Number(e.target.value))}
          />
          <button onClick={adicionar} className="btn-secondary text-sm">+ Adicionar</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Combate
// ══════════════════════════════════════════════════
function CombateTab({ dados, updateDados, fichaId }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
  fichaId: string;
}) {
  const c = dados.combate;
  const updateCombate = (partial: Partial<typeof c>) => {
    updateDados({ combate: { ...c, ...partial } });
  };

  const CONDICOES_COMUNS = ["Envenenado", "Amedrontado", "Atordoado", "Invisível", "Paralisado", "Sangrando"];

  function toggleCondicao(cond: string) {
    const has = c.condicoes.includes(cond);
    updateCombate({ condicoes: has ? c.condicoes.filter(x => x !== cond) : [...c.condicoes, cond] });
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* PV */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-4">Pontos de Vida</h3>
        <div className="space-y-3">
          {[
            { label: "PV Atual", key: "pv_atual" as const },
            { label: "PV Máximo", key: "pv_maximo" as const },
            { label: "PV Temporário", key: "pv_temporario" as const },
          ].map(f => (
            <div key={f.key} className="flex items-center justify-between">
              <label className="font-display text-xs tracking-widest uppercase text-stone-500">{f.label}</label>
              <input
                type="number"
                className="input-field w-20 text-center"
                value={c[f.key]}
                onChange={e => updateCombate({ [f.key]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>

        {/* PV bar */}
        <div className="mt-4">
          <div className="w-full h-3 bg-stone-800 rounded overflow-hidden">
            <div
              className={`h-full rounded transition-all ${
                c.pv_atual / c.pv_maximo > 0.5 ? "bg-emerald-600" :
                c.pv_atual / c.pv_maximo > 0.25 ? "bg-yellow-600" : "bg-crimson-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (c.pv_atual / c.pv_maximo) * 100))}%` }}
            />
          </div>
          <p className="font-body text-xs text-stone-500 mt-1 text-right">
            {c.pv_atual} / {c.pv_maximo} PV
          </p>
        </div>
      </div>

      {/* CA e Iniciativa */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-4">Defesa</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-display text-xs tracking-widest uppercase text-stone-500">CA</label>
            <input
              type="number"
              className="input-field w-20 text-center"
              value={c.ca}
              onChange={e => updateCombate({ ca: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="font-display text-xs tracking-widest uppercase text-stone-500">Bônus Iniciativa</label>
            <input
              type="number"
              className="input-field w-20 text-center"
              value={c.iniciativa_bonus}
              onChange={e => updateCombate({ iniciativa_bonus: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-2">Rolar Iniciativa</p>
          <RolagemDados fichaId={fichaId} nome="Iniciativa" modificador={c.iniciativa_bonus} tipo="iniciativa" />
        </div>
      </div>

      {/* Testes de morte */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Testes de Morte</h3>
        <div className="flex gap-6">
          {(["sucessos", "falhas"] as const).map(tipo => (
            <div key={tipo} className="flex-1 text-center">
              <p className={`font-display text-xs tracking-widest uppercase mb-2 ${tipo === "sucessos" ? "text-emerald-500" : "text-crimson-500"}`}>
                {tipo === "sucessos" ? "Sucessos" : "Falhas"}
              </p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => updateCombate({ testes_morte: { ...c.testes_morte, [tipo]: c.testes_morte[tipo] === i + 1 ? i : i + 1 } })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      i < c.testes_morte[tipo]
                        ? tipo === "sucessos" ? "bg-emerald-600 border-emerald-500" : "bg-crimson-600 border-crimson-500"
                        : "border-stone-700 bg-stone-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condições */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Condições</h3>
        <div className="flex flex-wrap gap-2">
          {CONDICOES_COMUNS.map(cond => (
            <button
              key={cond}
              onClick={() => toggleCondicao(cond)}
              className={`font-body text-xs px-2 py-1 rounded border transition-all ${
                c.condicoes.includes(cond)
                  ? "border-crimson-500 text-crimson-400 bg-crimson-900/30"
                  : "border-stone-700 text-stone-400 hover:border-stone-600"
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Tab: Notas
// ══════════════════════════════════════════════════
function NotasTab({ dados, updateDados }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
}) {
  return (
    <div className="card p-4">
      <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Anotações do Jogador</h3>
      <textarea
        className="input-field w-full resize-none font-body text-sm"
        rows={20}
        placeholder="Escreva aqui suas anotações, história, planos..."
        value={dados.notas}
        onChange={e => updateDados({ notas: e.target.value })}
      />
    </div>
  );
}
