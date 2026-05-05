import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import type { Profile } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FichaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  if (!profile) redirect("/login");

  // Rota especial: criar nova ficha
  if (id === "nova") {
    return <NovaFichaPage profile={profile} />;
  }

  // Busca ficha existente
  const { data: ficha } = await supabase
    .from("fichas")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (!ficha) notFound();

  // Player só pode ver a própria
  if (profile.role === "player" && ficha.player_id !== user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-dungeon">
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="rune-divider mb-4">✦</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase text-center">
            {ficha.nome}
          </h1>
          <div className="rune-divider mt-4">✦</div>
        </div>

        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">📜</div>
          <h2 className="font-display text-sm tracking-widest uppercase text-parchment-400 mb-2">
            Campos da Ficha
          </h2>
          <p className="font-body italic text-stone-400 text-sm">
            Os campos da ficha serão adicionados aqui conforme o sistema de jogo da campanha.
          </p>
        </div>
      </main>
    </div>
  );
}

function NovaFichaPage({ profile }: { profile: { username: string; role: string } }) {
  return (
    <div className="min-h-screen bg-dungeon">
      {/* @ts-expect-error – profile shape is compatible */}
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="rune-divider mb-4">✦</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase text-center">
            Nova Ficha
          </h1>
          <div className="rune-divider mt-4">✦</div>
        </div>
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">⚔</div>
          <p className="font-body italic text-stone-400">
            O formulário de criação de personagem será implementado aqui.
          </p>
        </div>
      </main>
    </div>
  );
}
