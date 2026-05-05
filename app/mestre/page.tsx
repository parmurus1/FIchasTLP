import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import type { Ficha, Profile } from "@/types/database";

type FichaComPlayer = Ficha & { profiles: Profile };

export default async function MestrePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  if (!profile) redirect("/login");
  if (profile.role !== "mestre") redirect("/dashboard");

  // Busca todos os players
  const { data: players } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "player")
    .order("username") as { data: Profile[] | null };

  // Busca todas as fichas com info do player
  const { data: fichas } = await supabase
    .from("fichas")
    .select("*, profiles(*)")
    .order("updated_at", { ascending: false }) as { data: FichaComPlayer[] | null };

  const totalFichas = fichas?.length ?? 0;
  const totalPlayers = players?.length ?? 0;

  return (
    <div className="min-h-screen bg-dungeon">
      <Navbar profile={profile} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="rune-divider mb-4">⚔ ✦ ⚔</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase text-center mb-1">
            Mesa do Mestre
          </h1>
          <p className="font-body italic text-stone-400 text-center">
            Visão geral da campanha
          </p>
          <div className="rune-divider mt-4">⚔ ✦ ⚔</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon="⚔" label="Aventureiros" value={totalPlayers} />
          <StatCard icon="📜" label="Fichas" value={totalFichas} />
          <StatCard
            icon="🕯"
            label="Campanha"
            value="Ativa"
            isText
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Fichas por player */}
        <section>
          <h2 className="font-display text-sm tracking-[0.3em] uppercase text-parchment-400 mb-5">
            Fichas dos Aventureiros
          </h2>

          {fichas && fichas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(fichas as FichaComPlayer[]).map((ficha) => (
                <MestreFichaCard key={ficha.id} ficha={ficha} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="font-body italic text-stone-500">
                Nenhum aventureiro criou fichas ainda.
              </p>
            </div>
          )}
        </section>

        {/* Players sem fichas */}
        {players && players.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-sm tracking-[0.3em] uppercase text-parchment-400 mb-5">
              Todos os Aventureiros
            </h2>
            <div className="card divide-y divide-stone-700/50">
              {players.map((player: Profile) => {
                const playerFichas = fichas?.filter((f) => f.player_id === player.id) ?? [];
                return (
                  <div key={player.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-parchment-500/60">⚔</span>
                      <span className="font-body text-parchment-200">{player.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xs tracking-widest uppercase text-stone-500">
                        {playerFichas.length} ficha{playerFichas.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  isText = false,
  className = "",
}: {
  icon: string;
  label: string;
  value: string | number;
  isText?: boolean;
  className?: string;
}) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="font-display text-xs tracking-widest uppercase text-stone-500">{label}</span>
      </div>
      <span className={`font-display ${isText ? "text-lg text-parchment-300" : "text-3xl text-parchment-200"}`}>
        {value}
      </span>
    </div>
  );
}

function MestreFichaCard({ ficha }: { ficha: FichaComPlayer }) {
  return (
    <Link href={`/ficha/${ficha.id}`} className="block group">
      <div className="card p-5 transition-all duration-200 group-hover:border-crimson-500/40 h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-base text-parchment-200 tracking-wide">
            {ficha.nome}
          </h3>
          <span className="text-crimson-500/40 text-lg">👁</span>
        </div>

        {ficha.profiles && (
          <div className="mb-3">
            <span className="font-display text-xs tracking-widest uppercase text-stone-500">Player: </span>
            <span className="font-body text-sm text-parchment-400">{ficha.profiles.username}</span>
          </div>
        )}

        {/* Preview de dados */}
        <div className="space-y-1">
          {(ficha.dados as Record<string, string>).classe && (
            <div className="font-body text-sm text-stone-400">
              {(ficha.dados as Record<string, string>).classe}
              {(ficha.dados as Record<string, string>).nivel ? ` · Nível ${(ficha.dados as Record<string, string>).nivel}` : ""}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-700">
          <span className="font-display text-xs tracking-widest uppercase text-stone-500">
            {new Date(ficha.updated_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>
    </Link>
  );
}
