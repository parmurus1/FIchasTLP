"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Rolagem } from "@/types/database";

interface Props {
  fichaId?: string;
  limit?: number;
}

function getResultClass(r: Rolagem) {
  if (r.valor_dado === 20) return "text-parchment-300";
  if (r.valor_dado === 1) return "text-crimson-400";
  if (r.resultado_total >= 15) return "text-emerald-400";
  if (r.resultado_total <= 5) return "text-orange-400";
  return "text-parchment-200";
}

export function HistoricoRolagens({ fichaId, limit = 15 }: Props) {
  const [rolagens, setRolagens] = useState<Rolagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      let q = supabase
        .from("rolagens")
        .select("*, profiles(username), fichas(id, nome)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fichaId) q = q.eq("ficha_id", fichaId);

      const { data } = await q;
      setRolagens((data ?? []) as unknown as Rolagem[]);
      setLoading(false);
    }

    load();

    // Realtime subscription
    const channel = supabase
      .channel("rolagens-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rolagens" },
        (payload) => {
          const nova = payload.new as Rolagem;
          if (fichaId && nova.ficha_id !== fichaId) return;
          setRolagens(prev => [nova, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fichaId, limit]);

  if (loading) {
    return (
      <div className="card p-4 text-center">
        <span className="font-body text-sm text-stone-500 italic">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="font-display text-xs tracking-widest uppercase text-stone-400 mb-3">
        Histórico de Rolagens
      </h3>

      {rolagens.length === 0 ? (
        <p className="font-body text-sm text-stone-500 italic text-center">Nenhuma rolagem ainda.</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {rolagens.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-stone-800/50 rounded px-3 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {r.valor_dado === 20 && <span className="text-parchment-400 text-xs">✦</span>}
                {r.valor_dado === 1 && <span className="text-crimson-400 text-xs">✕</span>}
                <span className="font-body text-xs text-stone-300 truncate">{r.nome_rolagem}</span>
                {(r as unknown as { fichas: { nome: string } }).fichas?.nome && !fichaId && (
                  <span className="font-body text-xs text-stone-600 truncate">
                    [{(r as unknown as { fichas: { nome: string } }).fichas.nome}]
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-body text-xs text-stone-500">
                  d20({r.valor_dado}){r.modificador !== 0 ? `${r.modificador >= 0 ? "+" : ""}${r.modificador}` : ""}
                </span>
                <span className={`font-display text-sm font-semibold ${getResultClass(r)}`}>
                  {r.resultado_total}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
