import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { deletarFicha } from "@/lib/ficha-actions";
import type { Ficha, Profile, FichaData } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role === "mestre") redirect("/mestre");

  const { data: fichas } = await supabase
    .from("fichas")
    .select("*")
    .eq("player_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-dungeon">
      <Navbar profile={profile} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="rune-divider mb-4">✦</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase text-center mb-1">
            Suas Fichas
          </h1>
          <p className="font-body italic text-stone-400 text-center">
            Bem-vindo, <span className="text-parchment-300">{profile.username}</span>
          </p>
          <div className="rune-divider mt-4">✦</div>
        </div>

        {/* Nova ficha */}
        <div className="flex justify-end mb-6">
          <Link href="/criar" className="btn-primary">
            + Criar Personagem
          </Link>
        </div>

        {/* Grid de fichas */}
        {fichas && fichas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fichas.map((ficha: Ficha) => (
              <FichaCard key={ficha.id} ficha={ficha} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

function FichaCard({ ficha }: { ficha: Ficha }) {
  const d = ficha.dados as FichaData;
  const pvPct = d.combate ? (d.combate.pv_atual / d.combate.pv_maximo) * 100 : null;

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("fichaId") as string;
    await deletarFicha(id);
  }

  return (
    <div className="card p-5 transition-all hover:border-parchment-500/50 hover:shadow-glow-amber group relative">
      <Link href={`/ficha/${ficha.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-base text-parchment-200 tracking-wide">{ficha.nome}</h3>
          <span className="text-parchment-500/40 text-lg">⚔</span>
        </div>

        <div className="space-y-1.5">
          {d.ancestralidade && (
            <div className="flex items-center gap-2">
              <span className="font-display text-xs tracking-widest uppercase text-stone-500">Raça</span>
              <span className="font-body text-sm text-parchment-300">{d.ancestralidade}</span>
            </div>
          )}
          {d.classe && (
            <div className="flex items-center gap-2">
              <span className="font-display text-xs tracking-widest uppercase text-stone-500">Classe</span>
              <span className="font-body text-sm text-parchment-300">{d.classe}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-display text-xs tracking-widest uppercase text-stone-500">Nível</span>
            <span className="font-body text-sm text-parchment-300">{d.nivel ?? 1}</span>
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
              PV {d.combate?.pv_atual}/{d.combate?.pv_maximo}
            </p>
          </div>
        )}
      </Link>

      <div className="mt-4 pt-3 border-t border-stone-700 flex items-center justify-between">
        <span className="font-display text-xs tracking-widest uppercase text-stone-500">
          {new Date(ficha.updated_at).toLocaleDateString("pt-BR")}
        </span>
        <form action={handleDelete}>
          <input type="hidden" name="fichaId" value={ficha.id} />
          <button
            type="submit"
            className="font-display text-xs tracking-widest uppercase text-stone-600 hover:text-crimson-400 transition-colors"
            onClick={e => { if (!confirm("Deletar esta ficha?")) e.preventDefault(); }}
          >
            Deletar
          </button>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-16 text-center">
      <div className="text-4xl text-parchment-500/20 mb-4">📜</div>
      <h3 className="font-display text-base tracking-widest uppercase text-stone-400 mb-2">
        Nenhuma Ficha
      </h3>
      <p className="font-body italic text-stone-500 text-sm mb-6">
        Sua bolsa de aventureiro está vazia. Crie sua primeira ficha de personagem.
      </p>
      <Link href="/criar" className="btn-primary inline-flex">
        + Criar Personagem
      </Link>
    </div>
  );
}
