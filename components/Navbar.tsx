"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface NavbarProps {
  profile: Profile;
}

export function Navbar({ profile }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-stone-700 bg-stone-900/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href={profile.role === "mestre" ? "/mestre" : "/dashboard"}
            className="flex items-center gap-3 group"
          >
            <span className="text-parchment-500 text-lg group-hover:text-parchment-300 transition-colors">⚔</span>
            <span className="font-display text-sm tracking-widest uppercase text-parchment-300 group-hover:text-parchment-100 transition-colors">
              Grimório
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-6">
            {profile.role === "mestre" ? (
              <Link
                href="/mestre"
                className="font-display text-xs tracking-widest uppercase text-stone-400 hover:text-parchment-300 transition-colors"
              >
                Mesa do Mestre
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="font-display text-xs tracking-widest uppercase text-stone-400 hover:text-parchment-300 transition-colors"
              >
                Minhas Fichas
              </Link>
            )}
          </nav>

          {/* User info + logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-body text-sm text-stone-400">{profile.username}</span>
              <span className={profile.role === "mestre" ? "badge-mestre" : "badge-player"}>
                {profile.role === "mestre" ? "👁 Mestre" : "⚔ Player"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="font-display text-xs tracking-widest uppercase text-stone-500 hover:text-crimson-400 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
