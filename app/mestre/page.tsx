"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { HistoricoRolagens } from "@/components/HistoricoRolagens";
import {
  adicionarIniciativa,
  limparIniciativas,
  removerIniciativa,
  marcarAtivo,
} from "@/lib/iniciativa-actions";
import type { Profile, Ficha, IniciativaEntry, FichaData } from "@/types/database";

const TABS = [
  { id: "personagens", label: "Personagens", icon: "⚔" },
  { id: "rolagens", label: "Rolagens", icon: "⚄" },
  { id: "iniciativa", label: "Iniciativa", icon: "⚡" },
];

export default function MestrePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [iniciativas, setIniciativas] = useState<IniciativaEntry[]>([]);
  const [tab, setTab] = useState("personagens");
  const [loading, setLoading] = useState(true);

  // Add monster form
  const [novoNome, setNovoNome] = useState("");
  const [novoValor, setNovoValor] = useState(0);
  const [novoTipo, setNovoTipo] = useState<"jogador" | "monstro" | "npc">("monstro");
  const [addingInit, setAddingInit] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single() as { data: Profile | null };
      if (!prof || (prof as Profile).role !== "mestre") { router.push("/dashboard"); return; }
      setProfile(prof as Profile);

      const { data: f } = await supabase
        .from("fichas")
        .select("*, profiles(*)")
        .order("updated_at", { ascending: false });
      setFichas((f ?? []) as Ficha[]);

      const { data: ini } = await supabase
        .from("iniciativas")
        .select("*")
        .order("iniciativa_valor", { ascending: false });
      setIniciativas((ini ?? []) as IniciativaEntry[]);

      setLoading(false);
    }

    load();

    // Realtime: iniciativas
    const supabaseRt = createClient();
    const channel = supabaseRt
      .channel("iniciativas-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "iniciativas" }, () => {
        supabaseRt
          .from("iniciativas")
          .select("*")
          .order("iniciativa_valor", { ascending: false })
          .then(({ data }) => setIniciativas((data ?? []) as IniciativaEntry[]));
      })
      .subscribe();

    return () => { supabaseRt.removeChannel(channel); };
  }, [router]);

  async function handleAddIniciativa() {
    if (!novoNome.trim()) return;
    setAddingInit(true);
    await adicionarIniciativa(novoNome, novoValor, novoTipo);
    setNovoNome(""); setNovoValor(0);
    setAddingInit(false);
  }

  async function handleAddFichaIniciativa(ficha: Ficha) {
    const dados = ficha.dados as FichaData;
    const bonus = dados.combate?.iniciativa_bonus ?? 0;
    const roll = Math.floor(Math.random() * 20) + 1 + bonus;
    await adicionarIniciativa(ficha.nome, roll, "jogador");
  }

  async function handleLimpar() {
    if (!confirm("Limpar toda a iniciativa?")) return;
    await limparIniciativas();
  }

  async function handleProximo() {
    if (iniciativas.length === 0) return;
    const atualIdx = iniciativas.findIndex(i => i.ativo);
    const proximo = iniciativas[(atualIdx + 1) % iniciativas.length];
    await marcarAtivo(proximo.id);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dungeon flex items-center justify-center">
        <span className="font-display text-stone-400 tracking-widest animate-pulse">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dungeon">
      {profile && <Navbar profile={profile} />}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="rune-divider mb-3">⚔ ✦ ⚔</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase">Mesa do Mestre</h1>
          <div className="rune-divider mt-3">⚔ ✦ ⚔</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center">
            <div className="font-display text-xs tracking-widest uppercase text-stone-500">Fichas</div>
            <div className="font-display text-2xl text-parchment-200">{fichas.length}</div>
          </div>
          <div className="card p-3 text-center">
            <div className="font-display text-xs tracking-widest uppercase text-stone-500">Na Iniciativa</div>
            <div className="font-display text-2xl text-parchment-200">{iniciativas.length}</div>
          </div>
          <div className="card p-3 text-center col-span-2 sm:col-span-1">
            <Link href="/configuracoes" className="font-display text-xs tracking-widest uppercase text-parchment-400 hover:text-parchment-200 transition-colors">
              ⚙ Configurações
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-stone-700">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 font-display text-xs tracking-widest uppercase border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-parchment-500 text-parchment-300"
                  : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Personagens */}
        {tab === "personagens" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fichas.map(f => {
              const d = f.dados as FichaData;
              const pvPct = d.combate ? (d.combate.pv_atual / d.combate.pv_maximo) * 100 : 100;
              return (
                <Link key={f.id} href={`/ficha/${f.id}`}>
                  <div className="card p-4 hover:border-parchment-500/40 transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-display text-sm text-parchment-200">{f.nome}</h3>
                        <p className="font-body text-xs text-stone-400">
                          {d.ancestralidade} {d.classe} · Nv. {d.nivel}
                        </p>
                      </div>
                      <span className="font-body text-xs text-stone-500">
                        {(f as Ficha & { profiles: Profile }).profiles?.username}
                      </span>
                    </div>

                    {d.combate && (
                      <>
                        <div className="w-full h-2 bg-stone-800 rounded overflow-hidden mb-1">
                          <div
                            className={`h-full rounded ${pvPct > 50 ? "bg-emerald-600" : pvPct > 25 ? "bg-yellow-600" : "bg-crimson-500"}`}
                            style={{ width: `${Math.min(100, Math.max(0, pvPct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-body text-stone-500">
                          <span>PV {d.combate.pv_atual}/{d.combate.pv_maximo}</span>
                          <span>CA {d.combate.ca}</span>
                        </div>
                        {d.combate.condicoes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {d.combate.condicoes.map(c => (
                              <span key={c} className="font-body text-xs text-crimson-400 bg-crimson-900/30 border border-crimson-800 rounded px-1">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-3 pt-2 border-t border-stone-800 flex gap-2">
                      <button
                        onClick={e => { e.preventDefault(); handleAddFichaIniciativa(f); }}
                        className="font-display text-xs tracking-widest text-stone-500 hover:text-parchment-400 transition-colors"
                      >
                        + Iniciativa
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* TAB: Rolagens */}
        {tab === "rolagens" && (
          <div className="max-w-2xl">
            <HistoricoRolagens limit={50} />
          </div>
        )}

        {/* TAB: Iniciativa */}
        {tab === "iniciativa" && (
          <div className="max-w-2xl space-y-4">
            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleProximo} disabled={iniciativas.length === 0} className="btn-primary text-sm disabled:opacity-50">
                ⚡ Próximo Turno
              </button>
              <button onClick={handleLimpar} className="btn-secondary text-sm text-crimson-400 border-crimson-800 hover:border-crimson-600">
                ✕ Limpar
              </button>
            </div>

            {/* Lista de iniciativas */}
            {iniciativas.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="font-body italic text-stone-500">Nenhuma entrada na iniciativa.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {iniciativas.map((ini, idx) => (
                  <div
                    key={ini.id}
                    className={`card p-3 flex items-center gap-3 transition-all ${
                      ini.ativo ? "border-parchment-500 shadow-glow-amber bg-parchment-500/5" : ""
                    }`}
                  >
                    <span className="font-display text-2xl text-parchment-300 w-10 text-center">
                      {ini.iniciativa_valor}
                    </span>
                    <div className="flex-1">
                      <span className="font-display text-sm text-parchment-200">{ini.nome}</span>
                      <span className={`ml-2 font-body text-xs capitalize ${
                        ini.tipo === "jogador" ? "text-parchment-400" :
                        ini.tipo === "monstro" ? "text-crimson-400" : "text-blue-400"
                      }`}>
                        [{ini.tipo}]
                      </span>
                    </div>
                    {ini.ativo && (
                      <span className="font-display text-xs tracking-widest text-parchment-400 uppercase">Ativo</span>
                    )}
                    <button
                      onClick={() => marcarAtivo(ini.id)}
                      className="font-body text-xs text-stone-600 hover:text-parchment-400 transition-colors"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => removerIniciativa(ini.id)}
                      className="text-stone-600 hover:text-crimson-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar combatente */}
            <div className="card p-4">
              <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">Adicionar Combatente</h3>
              <div className="flex gap-2 flex-wrap">
                <input
                  className="input-field flex-1 min-w-32 text-sm"
                  placeholder="Nome"
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                />
                <input
                  type="number"
                  className="input-field w-20 text-center text-sm"
                  title="Valor de Iniciativa"
                  placeholder="Init"
                  value={novoValor || ""}
                  onChange={e => setNovoValor(Number(e.target.value))}
                />
                <select
                  className="input-field text-sm"
                  value={novoTipo}
                  onChange={e => setNovoTipo(e.target.value as "jogador" | "monstro" | "npc")}
                >
                  <option value="monstro">Monstro</option>
                  <option value="npc">NPC</option>
                  <option value="jogador">Jogador</option>
                </select>
                <button onClick={handleAddIniciativa} disabled={addingInit} className="btn-primary text-sm">
                  + Adicionar
                </button>
              </div>

              {/* Jogadores rápidos */}
              {fichas.length > 0 && (
                <div className="mt-3">
                  <p className="font-display text-xs tracking-widest uppercase text-stone-600 mb-2">Adicionar Jogador</p>
                  <div className="flex flex-wrap gap-2">
                    {fichas.map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleAddFichaIniciativa(f)}
                        className="font-body text-xs bg-stone-800 border border-stone-700 rounded px-2 py-1 text-stone-300 hover:border-parchment-500/50 transition-all"
                      >
                        {f.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
