"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types/database";

// Defina aqui a senha secreta do mestre para proteger o registro
// Em produção, coloque isso no .env.local como NEXT_PUBLIC_MASTER_SECRET
const MASTER_SECRET = process.env.NEXT_PUBLIC_MASTER_SECRET ?? "arcana-mestre-2024";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (role === "mestre" && masterKey !== MASTER_SECRET) {
      setError("Chave de Mestre inválida.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(role === "mestre" ? "/mestre" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-dungeon flex items-center justify-center p-4">
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
          <p className="font-body text-stone-400 italic text-lg">da Campanha</p>
          <div className="rune-divider mt-4">⚔ ✦ ⚔</div>
        </div>

        {/* Card */}
        <div className="card p-8 candle-glow">
          <h2 className="font-display text-sm tracking-[0.3em] uppercase text-parchment-400 text-center mb-8">
            Forjar Nova Conta
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="label">Nome de Aventureiro</label>
              <input
                type="text"
                className="input"
                placeholder="Thorin, o Sombrio"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                placeholder="aventureiro@taverna.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Seleção de papel */}
            <div>
              <label className="label">Papel na Campanha</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setRole("player")}
                  className={`p-3 border text-center transition-all duration-150 ${
                    role === "player"
                      ? "border-parchment-500 bg-parchment-500/15 text-parchment-200"
                      : "border-stone-600 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  <div className="font-display text-xs tracking-widest uppercase mb-1">⚔ Player</div>
                  <div className="font-body text-xs text-stone-400">Aventureiro</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mestre")}
                  className={`p-3 border text-center transition-all duration-150 ${
                    role === "mestre"
                      ? "border-crimson-500 bg-crimson-500/15 text-parchment-200"
                      : "border-stone-600 text-stone-400 hover:border-stone-500"
                  }`}
                >
                  <div className="font-display text-xs tracking-widest uppercase mb-1">👁 Mestre</div>
                  <div className="font-body text-xs text-stone-400">Narrador</div>
                </button>
              </div>
            </div>

            {/* Campo extra para mestre */}
            {role === "mestre" && (
              <div className="animate-fade-in">
                <label className="label">Chave do Mestre</label>
                <input
                  type="password"
                  className="input border-crimson-600/50"
                  placeholder="Somente o Mestre conhece"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  required
                />
                <p className="text-xs text-stone-500 mt-1 font-body italic">
                  Palavra secreta definida no servidor para proteger o acesso.
                </p>
              </div>
            )}

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
              {loading ? "Forjando..." : "Criar Conta"}
            </button>
          </form>

          <div className="divider my-6">ou</div>

          <p className="text-center font-body text-stone-400 text-sm">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-parchment-400 hover:text-parchment-200 transition-colors underline underline-offset-2"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
