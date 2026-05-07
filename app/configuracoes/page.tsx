"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import type { Profile } from "@/types/database";
import { DEFAULT_SETTINGS, type SystemSettings } from "@/types/database";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [configId, setConfigId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [regraJson, setRegraJson] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!prof || (prof as Profile).role !== "mestre") { router.push("/dashboard"); return; }
      setProfile(prof as Profile);

      const { data: cfg } = await supabase
        .from("configuracoes_sistema")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (cfg) {
        setConfigId(cfg.id);
        const d = cfg.dados as SystemSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...d });
        setRegraJson(JSON.stringify(d.regras_customizadas ?? {}, null, 2));
      }
    });
  }, [router]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setJsonError("");

    let regras: Record<string, unknown> = {};
    try {
      regras = JSON.parse(regraJson);
    } catch {
      setJsonError("JSON inválido nas regras customizadas.");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const dados: SystemSettings = { ...settings, regras_customizadas: regras };

    if (configId) {
      await supabase.from("configuracoes_sistema").update({ dados }).eq("id", configId);
    } else {
      const { data } = await supabase.from("configuracoes_sistema")
        .insert({ user_id: profile.id, dados })
        .select("id")
        .single();
      if (data) setConfigId(data.id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dungeon flex items-center justify-center">
        <span className="font-display text-stone-400 tracking-widest animate-pulse">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dungeon">
      <Navbar profile={profile} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <div className="rune-divider mb-3">⚙ ✦ ⚙</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase">
            Configurações do Sistema
          </h1>
          <div className="rune-divider mt-3">⚙ ✦ ⚙</div>
        </div>

        <div className="space-y-5">
          {/* Bônus */}
          <div className="card p-5 space-y-4">
            <h2 className="font-display text-sm tracking-widest uppercase text-parchment-300">Bônus de Treinamento</h2>

            {[
              { label: "Bônus de Proficiência (Treinado)", key: "bonus_proficiencia" as const, default: 2 },
              { label: "Bônus de Especialista", key: "bonus_especialista" as const, default: 4 },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <div>
                  <label className="font-display text-xs tracking-widest uppercase text-stone-400">{f.label}</label>
                  <p className="font-body text-xs text-stone-600">Padrão: {f.default}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className="input-field w-20 text-center"
                  value={settings[f.key]}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>

          {/* Críticos */}
          <div className="card p-5 space-y-4">
            <h2 className="font-display text-sm tracking-widest uppercase text-parchment-300">Valores Críticos</h2>

            {[
              { label: "Valor para Sucesso Crítico", key: "valor_critico_sucesso" as const, default: 20 },
              { label: "Valor para Falha Crítica", key: "valor_critico_falha" as const, default: 1 },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <div>
                  <label className="font-display text-xs tracking-widest uppercase text-stone-400">{f.label}</label>
                  <p className="font-body text-xs text-stone-600">Padrão: {f.default}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="input-field w-20 text-center"
                  value={settings[f.key]}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>

          {/* Regras customizadas */}
          <div className="card p-5 space-y-3">
            <h2 className="font-display text-sm tracking-widest uppercase text-parchment-300">Regras Customizadas (JSON)</h2>
            <p className="font-body text-xs text-stone-500">
              Insira um objeto JSON com regras adicionais do sistema. Será acessível globalmente nas fichas.
            </p>
            <textarea
              className="input-field w-full font-mono text-xs resize-none"
              rows={8}
              value={regraJson}
              onChange={e => setRegraJson(e.target.value)}
              spellCheck={false}
            />
            {jsonError && <p className="text-crimson-400 font-body text-xs">{jsonError}</p>}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary w-full text-sm ${saved ? "bg-emerald-800 border-emerald-600" : ""}`}
          >
            {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar Configurações"}
          </button>
        </div>
      </main>
    </div>
  );
}
