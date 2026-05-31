"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletarFicha } from "@/lib/ficha-actions";
import type { Ficha, FichaData } from "@/types/database";

export function FichaCard({ ficha }: { ficha: Ficha }) {
  const router = useRouter();
  const d = ficha.dados as unknown as FichaData;
  const pvAtual = d?.combate?.pv_atual ?? 0;
  const pvMax = d?.combate?.pv_maximo ?? 0;
  const pvPct = pvMax > 0 ? (pvAtual / pvMax) * 100 : null;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Deletar esta ficha?")) return;
    const result = await deletarFicha(ficha.id);
    if ("success" in result && result.success) {
      router.refresh();
    }
  }

  return (
    <div className="card p-5 transition-all hover:border-parchment-500/50 hover:shadow-glow-amber group relative">
      <Link href={`/ficha/${ficha.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-base text-parchment-200 tracking-wide">{ficha.nome}</h3>
          <span className="text-parchment-500/40 text-lg">⚔</span>
        </div>

        <div className="space-y-1.5">
          {d?.ancestralidade && (
            <div className="flex items-center gap-2">
              <span className="font-display text-xs tracking-widest uppercase text-stone-500">Raça</span>
              <span className="font-body text-sm text-parchment-300">{d.ancestralidade}</span>
            </div>
          )}
          {d?.classe && (
            <div className="flex items-center gap-2">
              <span className="font-display text-xs tracking-widest uppercase text-stone-500">Classe</span>
              <span className="font-body text-sm text-parchment-300">{d.classe}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-display text-xs tracking-widest uppercase text-stone-500">Nível</span>
            <span className="font-body text-sm text-parchment-300">{d?.nivel ?? 1}</span>
          </div>
        </div>

        {pvPct !== null && (
          <div className="mt-3">
            <div className="w-full h-1.5 bg-stone-800 rounded overflow-hidden">
              <div
                className={`h-full rounded ${pvPct > 50 ? "bg-emerald-700" : pvPct > 25 ? "bg-yellow-700" : "bg-crimson-600"}`}
                style={{ width: `${Math.min(100, Math.max(0, pvPct))}%` }}
              />
            </div>
            <p className="font-body text-xs text-stone-500 mt-0.5">
              PV {pvAtual}/{pvMax}
            </p>
          </div>
        )}
      </Link>

      <div className="mt-4 pt-3 border-t border-stone-700 flex items-center justify-between">
        <span className="font-display text-xs tracking-widest uppercase text-stone-500">
          {new Date(ficha.updated_at).toLocaleDateString("pt-BR")}
        </span>
        <button
          onClick={handleDelete}
          className="font-display text-xs tracking-widest uppercase text-stone-600 hover:text-crimson-400 transition-colors"
        >
          Deletar
        </button>
      </div>
    </div>
  );
}
