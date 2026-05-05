import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { FichaClient } from "@/components/FichaClient";
import { NovaFichaWizard } from "@/components/NovaFichaWizard";
import type { Profile, Ficha } from "@/types/database";

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
    return (
      <div className="min-h-screen bg-dungeon">
        <Navbar profile={profile} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <div className="rune-divider mb-4">⚔ ✦ ⚔</div>
            <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase text-center">
              Criar Personagem
            </h1>
            <div className="rune-divider mt-4">⚔ ✦ ⚔</div>
          </div>
          <NovaFichaWizard playerId={user.id} />
        </main>
      </div>
    );
  }

  // Busca ficha existente
  const { data: ficha } = await supabase
    .from("fichas")
    .select("*, profiles(*)")
    .eq("id", id)
    .single() as { data: Ficha | null };

  if (!ficha) notFound();

  // Player só pode ver a própria
  if (profile.role === "player" && ficha.player_id !== user.id) {
    redirect("/dashboard");
  }

  const isMestre = profile.role === "mestre";

  return (
    <div className="min-h-screen bg-dungeon">
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <FichaClient ficha={ficha} isMestre={isMestre} />
      </main>
    </div>
  );
}
