import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { FichaCard } from "@/components/FichaCard";
import type { Ficha, Profile } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

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
