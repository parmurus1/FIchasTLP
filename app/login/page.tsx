"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single() as { data: { role: string } | null };
      router.push(profile?.role === "mestre" ? "/mestre" : "/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-dungeon flex items-center justify-center p-4">
      {/* Ornamentos de canto */}
      <span className="fixed top-4 left-4 text-parchment-500/20 font-display text-4xl select-none">✦</span>
      <span className="fixed top-4 right-4 text-parchment-500/20 font-display text-4xl select-none">✦</span>
      <span className="fixed bottom-4 left-4 text-parchment-500/20 font-display text-4xl select-none">✦</span>
      <span className="fixed bottom-4 right-4 text-parchment-500/20 font-display text-4xl select-none">✦</span>

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="rune-divider mb-4">⚔ ✦ ⚔</div>
          <h1 className="font-display text-3xl text-parchment-200 tracking-widest uppercase mb-2">
            Grimório
          </h1>
          <p className="font-body text-stone-400 italic text-lg">
            da Campanha
          </p>
          <div className="rune-divider mt-4">⚔ ✦ ⚔</div>
        </div>

        {/* Card */}
        <div className="card p-8 candle-glow">
          <h2 className="font-display text-sm tracking-[0.3em] uppercase text-parchment-400 text-center mb-8">
            Identificação do Aventureiro
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="aventureiro@taverna.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="border border-crimson-600/50 bg-crimson-600/10 px-4 py-3 text-crimson-400 font-body text-sm">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar na Taverna"}
            </button>
          </form>

          <div className="divider my-6">ou</div>

          <p className="text-center font-body text-stone-400 text-sm">
            Ainda não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-parchment-400 hover:text-parchment-200 transition-colors underline underline-offset-2"
            >
              Registrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
