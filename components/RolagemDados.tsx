"use client";

import { useState } from "react";
import type { SystemSettings } from "@/types/database";
import { DEFAULT_SETTINGS } from "@/types/database";

interface Props {
  fichaId: string | null;
  nome: string;
  modificador: number;
  tipo?: string;
  settings?: SystemSettings;
  onRolagem?: (resultado: number, dado: number) => void;
}

export function RolagemDados({
  fichaId,
  nome,
  modificador,
  tipo = "pericia",
  settings = DEFAULT_SETTINGS,
  onRolagem,
}: Props) {
  const [resultado, setResultado] = useState<{ dado: number; total: number } | null>(null);
  const [rolling, setRolling] = useState(false);

  async function rolar() {
    setRolling(true);
    const dado = Math.floor(Math.random() * 20) + 1;
    const total = dado + modificador;

    setResultado({ dado, total });
    onRolagem?.(total, dado);

    // Save to DB (fire and forget)
    try {
      const { realizarRolagem } = await import("@/lib/rolagem-actions");
      await realizarRolagem(fichaId, tipo, nome, modificador);
    } catch {}

    setRolling(false);
  }

  const isCriticoSucesso = resultado?.dado === settings.valor_critico_sucesso;
  const isCriticoFalha = resultado?.dado === settings.valor_critico_falha;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={rolar}
        disabled={rolling}
        className={`font-display text-xs tracking-widest uppercase px-2 py-1 rounded border transition-all ${
          rolling
            ? "border-stone-700 text-stone-600 cursor-wait"
            : "border-stone-700 text-stone-400 hover:border-parchment-500 hover:text-parchment-300"
        }`}
        title={`Rolar ${nome}`}
      >
        {rolling ? "⟳" : "⚄"}
      </button>

      {resultado && (
        <span
          className={`font-display text-sm font-semibold ${
            isCriticoSucesso
              ? "text-parchment-300 animate-pulse"
              : isCriticoFalha
              ? "text-crimson-400 animate-pulse"
              : "text-parchment-200"
          }`}
          title={`d20(${resultado.dado}) ${modificador >= 0 ? "+" : ""}${modificador} = ${resultado.total}`}
        >
          {isCriticoSucesso && "✦ "}
          {isCriticoFalha && "✕ "}
          {resultado.total}
          {isCriticoSucesso && " ✦"}
          {isCriticoFalha && " ✕"}
        </span>
      )}
    </div>
  );
}
