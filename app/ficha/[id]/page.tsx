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
import { IDIOMAS_DISPONIVEIS, CLASSES, ARMADURAS, BONUS_SALVAMENTO } from "@/lib/game-data";
import type { Ficha, Profile, FichaData, Pericia, NivelPericia, Item, Habilidade } from "@/types/database";
import { DEFAULT_SETTINGS } from "@/types/database";

const TABS = [
  { id: "basico",     label: "Dados Básicos", icon: "⚔" },
  { id: "atributos",  label: "Atributos",     icon: "💪" },
  { id: "pericias",   label: "Perícias",      icon: "📚" },
  { id: "habilidades",label: "Habilidades",   icon: "✨" },
  { id: "inventario", label: "Inventário",    icon: "💰" },
  { id: "combate",    label: "Combate",       icon: "🛡" },
  { id: "estado",     label: "Estado",        icon: "🧠" },
  { id: "notas",      label: "Notas",         icon: "📝" },
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
      setProfile(prof);
      setIsMestre(prof.role === "mestre");

      const { data: f } = await supabase
        .from("fichas")
        .select("*, profiles(*)")
        .eq("id", id)
        .single() as { data: Ficha | null };

      if (!f) { router.push("/dashboard"); return; }
      if (prof.role === "player" && f.player_id !== user.id) { router.push("/dashboard"); return; }

      setFicha(f as unknown as Ficha);
      setDados(f.dados as unknown as FichaData);
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

        {/* TAB: Estado */}
        {tab === "estado" && (
          <EstadoTab dados={dados} updateDados={updateDados} />
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
                value={(dados as unknown as Record<string, unknown>)[f.key] as string ?? ""}
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
  const classeData = dados.classe ? CLASSES[dados.classe] : null;

  const SALVAMENTOS = [
    { key: "fortitude", label: "Fortitude", attr: "CON" as const },
    { key: "reflexos",  label: "Reflexos",  attr: "DES" as const },
    { key: "vontade",   label: "Vontade",   attr: "CAR" as const },
  ];

  return (
    <div className="space-y-5">
      {/* Atributos */}
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

      {/* Salvaguardas */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-4">Salvaguardas</h3>
        <div className="grid grid-cols-3 gap-3">
          {SALVAMENTOS.map(sv => {
            const attrVal = attrs[sv.attr];
            const attrMod = Math.floor((attrVal - 10) / 2);
            const profNivel = classeData?.salvamentos?.[sv.key as keyof typeof classeData.salvamentos] ?? "";
            const profBonus = BONUS_SALVAMENTO[profNivel as keyof typeof BONUS_SALVAMENTO] ?? 0;
            const total = attrMod + profBonus;
            const profLabel = profNivel === "E" ? "Especialista" : profNivel === "T" ? "Treinado" : "Sem prof.";
            const profColor = profNivel === "E" ? "text-parchment-400" : profNivel === "T" ? "text-emerald-500" : "text-stone-600";
            return (
              <div key={sv.key} className="text-center border border-stone-700 p-3">
                <p className="font-display text-xs tracking-widest uppercase text-stone-500 mb-1">{sv.label}</p>
                <p className={`font-display text-3xl mb-1 ${total >= 0 ? "text-parchment-200" : "text-crimson-400"}`}>
                  {total >= 0 ? "+" : ""}{total}
                </p>
                <p className={`font-display text-xs ${profColor}`}>{profLabel}</p>
                <p className="font-body text-xs text-stone-600 mt-0.5">
                  {sv.attr} {attrMod >= 0 ? "+" : ""}{attrMod}
                  {profBonus > 0 ? ` + ${profBonus} prof.` : ""}
                </p>
                <div className="mt-2">
                  <RolagemDados fichaId={fichaId} nome={sv.label} modificador={total} tipo="atributo" />
                </div>
              </div>
            );
          })}
        </div>
        {!classeData && (
          <p className="font-body text-xs text-stone-600 italic mt-3">
            Selecione uma classe em Dados Básicos para ver as proficiências corretas.
          </p>
        )}
      </div>
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
  const [novaDesc, setNovaDesc] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  function adicionar() {
    if (!novoNome.trim()) return;
    const novo: Item = {
      id: crypto.randomUUID(),
      nome: novoNome,
      quantidade: novaQtd,
      peso: novoPeso || undefined,
      descricao: novaDesc.trim() || undefined,
    };
    updateDados({ inventario: [...dados.inventario, novo] });
    setNovoNome(""); setNovaQtd(1); setNovoPeso(0); setNovaDesc("");
  }

  function remover(id: string) {
    updateDados({ inventario: dados.inventario.filter(i => i.id !== id) });
  }

  function updateItem(id: string, patch: Partial<Item>) {
    updateDados({ inventario: dados.inventario.map(i => i.id === id ? { ...i, ...patch } : i) });
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
              <div key={item.id}>
                <div className="flex items-center gap-3 px-4 py-2">
                  <span className="font-body text-sm text-parchment-200 flex-1">{item.nome}</span>
                  {item.peso && <span className="font-body text-xs text-stone-500">{item.peso}kg</span>}
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateItem(item.id, { quantidade: Math.max(0, item.quantidade - 1) })} className="w-6 h-6 rounded border border-stone-700 text-stone-400 hover:border-stone-500 font-display text-sm">−</button>
                    <span className="font-display text-sm text-parchment-200 w-8 text-center">{item.quantidade}</span>
                    <button onClick={() => updateItem(item.id, { quantidade: item.quantidade + 1 })} className="w-6 h-6 rounded border border-stone-700 text-stone-400 hover:border-stone-500 font-display text-sm">+</button>
                  </div>
                  <button
                    onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                    className="text-stone-600 hover:text-parchment-400 text-xs font-display"
                    title="Ver/editar descrição"
                  >
                    {expandido === item.id ? "▲" : "▼"}
                  </button>
                  <button onClick={() => remover(item.id)} className="text-stone-600 hover:text-crimson-400 transition-colors">✕</button>
                </div>
                {expandido === item.id && (
                  <div className="px-4 pb-3 bg-stone-900/40">
                    <label className="font-display text-xs tracking-widest uppercase text-stone-600 block mb-1">
                      Descrição / Efeito
                    </label>
                    <textarea
                      className="input-field w-full h-16 resize-none text-sm font-body"
                      placeholder="Dano, propriedades, efeito especial..."
                      value={item.descricao ?? ""}
                      onChange={e => updateItem(item.id, { descricao: e.target.value || undefined })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Adicionar item */}
        <div className="border-t border-stone-700 p-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <input
              className="input-field flex-1 min-w-32 text-sm"
              placeholder="Nome do item"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => e.key === "Enter" && adicionar()}
            />
            <input
              type="number" min={1}
              className="input-field w-16 text-sm text-center"
              title="Quantidade" placeholder="Qtd"
              value={novaQtd}
              onChange={e => setNovaQtd(Number(e.target.value))}
            />
            <input
              type="number" min={0} step={0.1}
              className="input-field w-20 text-sm text-center"
              title="Peso (kg)" placeholder="Peso"
              value={novoPeso || ""}
              onChange={e => setNovoPeso(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              placeholder="Descrição / efeito (opcional)"
              value={novaDesc}
              onChange={e => setNovaDesc(e.target.value)}
            />
            <button onClick={adicionar} className="btn-secondary text-sm">+ Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
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

  // Armadura
  const armadura = ARMADURAS.find(a => a.id === c.armadura_id && a.tipo !== "escudo") ?? ARMADURAS[0];
  const escudo   = ARMADURAS.find(a => a.id === c.escudo_id  && a.tipo === "escudo");
  const desMod   = Math.floor((dados.atributos.DES - 10) / 2);
  const caCalc   = 10 + armadura.ca_bonus + desMod + (escudo?.ca_bonus ?? 0) + (c.ca_bonus_extra ?? 0);

  // Sync calculated CA back when armadura changes
  function setArmadura(id: string) {
    const arm  = ARMADURAS.find(a => a.id === id && a.tipo !== "escudo") ?? ARMADURAS[0];
    const esc  = ARMADURAS.find(a => a.id === c.escudo_id && a.tipo === "escudo");
    const nova = 10 + arm.ca_bonus + desMod + (esc?.ca_bonus ?? 0) + (c.ca_bonus_extra ?? 0);
    updateCombate({ armadura_id: id, ca: nova });
  }
  function setEscudo(id: string | undefined) {
    const arm  = ARMADURAS.find(a => a.id === c.armadura_id && a.tipo !== "escudo") ?? ARMADURAS[0];
    const esc  = ARMADURAS.find(a => a.id === id && a.tipo === "escudo");
    const nova = 10 + arm.ca_bonus + desMod + (esc?.ca_bonus ?? 0) + (c.ca_bonus_extra ?? 0);
    updateCombate({ escudo_id: id, ca: nova });
  }
  function setBonusExtra(val: number) {
    const arm  = ARMADURAS.find(a => a.id === c.armadura_id && a.tipo !== "escudo") ?? ARMADURAS[0];
    const esc  = ARMADURAS.find(a => a.id === c.escudo_id && a.tipo === "escudo");
    const nova = 10 + arm.ca_bonus + desMod + (esc?.ca_bonus ?? 0) + val;
    updateCombate({ ca_bonus_extra: val, ca: nova });
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* PV */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-4">Pontos de Vida</h3>
        <div className="space-y-3">
          {[
            { label: "PV Atual",      key: "pv_atual"      as const },
            { label: "PV Máximo",     key: "pv_maximo"     as const },
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

      {/* Defesa */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Defesa</h3>

        {/* CA calculada */}
        <div className="flex items-center justify-between mb-3 p-2 bg-stone-800/50 border border-stone-700">
          <span className="font-display text-xs tracking-widest uppercase text-stone-500">CA Total</span>
          <span className="font-display text-3xl text-parchment-200">{caCalc}</span>
        </div>
        <p className="font-body text-xs text-stone-600 italic mb-3">
          10 + {armadura.ca_bonus} arm. + {desMod >= 0 ? "+" : ""}{desMod} DES
          {escudo ? ` + ${escudo.ca_bonus} escudo` : ""}
          {(c.ca_bonus_extra ?? 0) > 0 ? ` + ${c.ca_bonus_extra} extra` : ""}
        </p>

        {/* Armadura */}
        <p className="font-display text-xs text-stone-600 uppercase mb-1">Armadura</p>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {ARMADURAS.filter(a => a.tipo !== "escudo").map(a => (
            <button
              key={a.id}
              onClick={() => setArmadura(a.id)}
              className={`text-left p-2 border text-xs transition-all ${
                armadura.id === a.id
                  ? "border-parchment-500/50 bg-parchment-500/5 text-parchment-200"
                  : "border-stone-700 text-stone-500 hover:border-stone-600"
              }`}
            >
              <span className="font-display block">{a.nome}</span>
              <span className="font-body text-stone-600">+{a.ca_bonus} CA</span>
            </button>
          ))}
        </div>

        {/* Escudo */}
        <p className="font-display text-xs text-stone-600 uppercase mb-1">Escudo</p>
        <div className="flex gap-1 mb-3 flex-wrap">
          <button
            onClick={() => setEscudo(undefined)}
            className={`px-2 py-1 border text-xs font-display transition-all ${
              !escudo ? "border-parchment-500/40 text-parchment-300" : "border-stone-700 text-stone-500"
            }`}
          >
            Nenhum
          </button>
          {ARMADURAS.filter(a => a.tipo === "escudo").map(a => (
            <button
              key={a.id}
              onClick={() => setEscudo(a.id)}
              className={`px-2 py-1 border text-xs font-display transition-all ${
                escudo?.id === a.id ? "border-parchment-500/40 text-parchment-300" : "border-stone-700 text-stone-500"
              }`}
            >
              {a.nome} (+{a.ca_bonus})
            </button>
          ))}
        </div>

        {/* Bônus extra */}
        <div className="flex items-center gap-2">
          <span className="font-display text-xs text-stone-600 uppercase">Bônus Extra</span>
          <button onClick={() => setBonusExtra(Math.max(0, (c.ca_bonus_extra ?? 0) - 1))}
            className="w-6 h-6 border border-stone-700 text-stone-500 font-display text-sm">−</button>
          <span className="font-display text-sm text-parchment-300 w-6 text-center">{c.ca_bonus_extra ?? 0}</span>
          <button onClick={() => setBonusExtra((c.ca_bonus_extra ?? 0) + 1)}
            className="w-6 h-6 border border-stone-700 text-stone-500 font-display text-sm">+</button>
          <span className="font-body text-xs text-stone-600 italic">(magias, etc)</span>
        </div>

        {/* Iniciativa */}
        <div className="mt-4 pt-3 border-t border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <label className="font-display text-xs tracking-widest uppercase text-stone-500">Bônus Iniciativa</label>
            <input
              type="number"
              className="input-field w-20 text-center"
              value={c.iniciativa_bonus}
              onChange={e => updateCombate({ iniciativa_bonus: Number(e.target.value) })}
            />
          </div>
          <RolagemDados fichaId={fichaId} nome="Iniciativa" modificador={c.iniciativa_bonus} tipo="iniciativa" />
        </div>
      </div>

      {/* Testes de morte */}
      <div className="card p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-2">Testes de Morte</h3>
        <p className="font-body text-xs text-stone-500 italic mb-3">
          1 → 2 falhas • 2–9 → 1 falha • 10–19 → 1 sucesso • 20 → acorda com 1 PV
        </p>
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
              {c.testes_morte[tipo] >= 3 && (
                <p className={`font-display text-xs mt-2 ${tipo === "sucessos" ? "text-emerald-400" : "text-crimson-400"}`}>
                  {tipo === "sucessos" ? "— Estabilizado —" : "— Morto —"}
                </p>
              )}
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
// Tab: Estado (Sanidade, Corrupção)
// ══════════════════════════════════════════════════
const EFEITOS_SANIDADE: Record<number, string> = {
  4: "−1 em Percepção e Diplomacia",
  3: "Pesadelos; −1 em Vontade",
  2: "Ataques de Pânico (1 rodada sem Reações)",
  1: "Fobias (Mestre escolhe)",
  0: "Loucura Total — controle do Mestre",
};
const SINTOMAS_CORRUPCAO: Record<number, string> = {
  1: "Sombra alterada, olhos estranhos, voz ecoante",
  2: "Marcas pela pele, fome anormal, sonhos invasivos",
  3: "−1 em Carisma; animais evitam você",
  4: "Mutação física; −1 em interações sociais",
  5: "Agente Abissal (controle do Mestre)",
};
const FAIXAS_SAN = [
  { v: 5, label: "Saudável",           color: "text-emerald-400" },
  { v: 4, label: "Abalado",            color: "text-green-400" },
  { v: 3, label: "Instável",           color: "text-yellow-400" },
  { v: 2, label: "À Beira do Colapso", color: "text-orange-400" },
  { v: 1, label: "Quebrado",           color: "text-red-400" },
  { v: 0, label: "Loucura Total",      color: "text-red-600" },
];
const FAIXAS_COR = [
  { v: 0, label: "Puro",               color: "text-sky-300" },
  { v: 1, label: "Marcado",            color: "text-violet-400" },
  { v: 2, label: "Infectado",          color: "text-purple-400" },
  { v: 3, label: "Corrompido",         color: "text-purple-600" },
  { v: 4, label: "Deformado",          color: "text-red-500" },
  { v: 5, label: "Servidão Abissal",   color: "text-red-700" },
];

function EstadoTab({ dados, updateDados }: {
  dados: FichaData;
  updateDados: (p: Partial<FichaData>) => void;
}) {
  const san = dados.sanidade ?? 5;
  const cor = dados.corrupcao ?? 0;
  const sanFaixa = FAIXAS_SAN.find(f => f.v === san) ?? FAIXAS_SAN[0];
  const corFaixa = FAIXAS_COR.find(f => f.v === cor) ?? FAIXAS_COR[0];

  const efeitosAtivos = Object.entries(EFEITOS_SANIDADE)
    .filter(([v]) => Number(v) >= san && san < 5)
    .sort(([a], [b]) => Number(b) - Number(a));

  const sintomasAtivos = Object.entries(SINTOMAS_CORRUPCAO)
    .filter(([v]) => Number(v) <= cor && cor > 0)
    .sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-4">
      {/* Aviso interação */}
      {(san <= 3 || cor >= 2) && (
        <div className="card p-3 border-crimson-600/30 bg-crimson-900/10">
          <p className="font-display text-xs tracking-widest uppercase text-crimson-500 mb-1">⚠ Interação Ativa</p>
          <p className="font-body text-xs text-stone-400 italic">
            {cor >= 1 && "• Alta Corrupção: −1 nos testes de Sanidade. "}
            {san <= 2 && "• Sanidade baixa: +2 para ganhar Corrupção. "}
            Cuidado com a espiral de degradação.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sanidade */}
        <div className="card p-4">
          <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">🧠 Sanidade</h3>
          <div className="text-center mb-4">
            <span className={`font-display text-5xl ${sanFaixa.color}`}>{san}</span>
            <span className="font-display text-xl text-stone-600">/5</span>
            <p className={`font-display text-sm tracking-widest uppercase mt-1 ${sanFaixa.color}`}>{sanFaixa.label}</p>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[5,4,3,2,1,0].map(v => (
              <button key={v} onClick={() => updateDados({ sanidade: v })}
                className={`w-8 h-8 border font-display text-sm transition-all ${
                  v === san ? "border-emerald-400 bg-emerald-900/30 text-emerald-300 scale-110"
                  : v < san ? "border-stone-700 text-stone-700 hover:border-stone-500"
                  : "border-emerald-700/40 text-emerald-700 hover:border-emerald-600"
                }`}>{v}</button>
            ))}
          </div>
          <div className="space-y-1">
            {FAIXAS_SAN.map(f => (
              <div key={f.v} className={`p-1.5 border transition-all ${f.v === san ? "border-stone-600 bg-stone-800/40" : "border-transparent opacity-40"}`}>
                <span className={`font-display text-xs ${f.color}`}>{f.v} — {f.label}</span>
                {EFEITOS_SANIDADE[f.v] && (
                  <p className="font-body text-xs text-stone-600 italic mt-0.5 pl-2">{EFEITOS_SANIDADE[f.v]}</p>
                )}
              </div>
            ))}
          </div>
          {efeitosAtivos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-700">
              <p className="font-display text-xs text-crimson-500 uppercase mb-1">Efeitos Ativos</p>
              {efeitosAtivos.map(([v, ef]) => (
                <p key={v} className="font-body text-xs text-crimson-400 italic">• {ef}</p>
              ))}
            </div>
          )}
          <p className="font-body text-xs text-stone-600 italic mt-3">
            Recuperação: descanso seguro +1 • terapia +1 • magia +1/2
          </p>
        </div>

        {/* Corrupção */}
        <div className="card p-4">
          <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">☠ Corrupção</h3>
          <div className="text-center mb-4">
            <span className={`font-display text-5xl ${corFaixa.color}`}>{cor}</span>
            <span className="font-display text-xl text-stone-600">/5</span>
            <p className={`font-display text-sm tracking-widest uppercase mt-1 ${corFaixa.color}`}>{corFaixa.label}</p>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[0,1,2,3,4,5].map(v => (
              <button key={v} onClick={() => updateDados({ corrupcao: v })}
                className={`w-8 h-8 border font-display text-sm transition-all ${
                  v === cor ? "border-purple-400 bg-purple-900/30 text-purple-300 scale-110"
                  : v < cor ? "border-purple-800/50 text-purple-700"
                  : "border-stone-700 text-stone-700 hover:border-stone-500"
                }`}>{v}</button>
            ))}
          </div>
          <div className="space-y-1">
            {FAIXAS_COR.map(f => (
              <div key={f.v} className={`p-1.5 border transition-all ${f.v === cor ? "border-purple-800/50 bg-purple-900/10" : "border-transparent opacity-40"}`}>
                <span className={`font-display text-xs ${f.color}`}>{f.v} — {f.label}</span>
                {SINTOMAS_CORRUPCAO[f.v] && (
                  <p className="font-body text-xs text-stone-600 italic mt-0.5 pl-2">{SINTOMAS_CORRUPCAO[f.v]}</p>
                )}
              </div>
            ))}
          </div>
          {sintomasAtivos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-700">
              <p className="font-display text-xs text-purple-500 uppercase mb-1">Sintomas Acumulados</p>
              {sintomasAtivos.map(([v, s]) => (
                <p key={v} className="font-body text-xs text-purple-400 italic">• {s}</p>
              ))}
            </div>
          )}
          <p className="font-body text-xs text-stone-600 italic mt-3">
            Redução: rituais especiais • purificação • missão santificada
          </p>
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
