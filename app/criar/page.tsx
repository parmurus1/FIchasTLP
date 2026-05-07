"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { AncestralidadeStep } from "./steps/AncestralidadeStep";
import { BiografiaStep } from "./steps/BiografiaStep";
import { ClasseStep } from "./steps/ClasseStep";
import { AtributosFinaisStep } from "./steps/AtributosFinaisStep";
import { ResumoStep } from "./steps/ResumoStep";
import type { Profile, FichaData, AtributoKey, Habilidade, Pericia } from "@/types/database";
import {
  criarPericiasPadrao,
  treinarPericia,
  aplicarMelhoriasAncestralidade,
  aplicarMelhoriasBiografia,
  aplicarMelhoriaClasse,
  aplicarMelhoriasLivres,
  calcularPVBase,
} from "@/lib/calculos";
import { ANCESTRALIDADES, CLASSES } from "@/lib/game-data";
import { finalizarCriacao } from "@/lib/ficha-actions";

const STEPS = ["Ancestralidade", "Biografia", "Classe", "Atributos", "Resumo"];

export type WizardData = {
  nome: string;
  ancestralidade: string;
  heranca: string;
  escolhasLivresAnc: AtributoKey[];
  biografia: string;
  biografiaAttrForcado: AtributoKey | "";
  biografiaAttrLivre: AtributoKey | "";
  classe: string;
  escola: string;
  talento_classe: string;
  melhoriasLivres: AtributoKey[];
  idiomas: string[];
  pericias: Pericia[];
  habilidades: Habilidade[];
};

const defaultWizard: WizardData = {
  nome: "",
  ancestralidade: "",
  heranca: "",
  escolhasLivresAnc: [],
  biografia: "",
  biografiaAttrForcado: "",
  biografiaAttrLivre: "",
  classe: "",
  escola: "",
  talento_classe: "",
  melhoriasLivres: [],
  idiomas: ["Comum"],
  pericias: criarPericiasPadrao(),
  habilidades: [],
};

function computeAtributos(w: WizardData) {
  let attrs = { FOR: 10, DES: 10, CON: 10, INT: 10, CAR: 10 };
  if (w.ancestralidade && ANCESTRALIDADES[w.ancestralidade]) {
    const anc = ANCESTRALIDADES[w.ancestralidade];
    attrs = aplicarMelhoriasAncestralidade(attrs, anc.bonuses, anc.defeitos, w.escolhasLivresAnc);
  }
  if (w.biografiaAttrForcado && w.biografiaAttrLivre) {
    attrs = aplicarMelhoriasBiografia(attrs, w.biografiaAttrForcado as AtributoKey, w.biografiaAttrLivre as AtributoKey);
  }
  if (w.classe && CLASSES[w.classe]) {
    attrs = aplicarMelhoriaClasse(attrs, CLASSES[w.classe].atributo_chave as AtributoKey);
  }
  if (w.melhoriasLivres.length > 0) {
    attrs = aplicarMelhoriasLivres(attrs, w.melhoriasLivres);
  }
  return attrs;
}

export default function CriarPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [wizard, setWizard] = useState<WizardData>(defaultWizard);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load profile once
  useState(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      createClient().from("profiles").select("*").eq("id", user.id).single()
        .then(({ data }) => {
          if (data) setProfile(data as Profile);
        });
    });
  });

  function update(partial: Partial<WizardData>) {
    setWizard(prev => ({ ...prev, ...partial }));
  }

  const atributos = computeAtributos(wizard);

  async function handleSave() {
    if (!userId || !wizard.nome.trim()) return;
    setSaving(true);
    setError("");

    const ancData = ANCESTRALIDADES[wizard.ancestralidade];
    const classData = CLASSES[wizard.classe];
    const pvMax = calcularPVBase(
      classData?.pv ?? 8,
      ancData?.pv ?? 8,
      Math.floor((atributos.CON - 10) / 2)
    );

    const dados: FichaData = {
      ancestralidade: wizard.ancestralidade,
      heranca: wizard.heranca,
      classe: wizard.classe,
      escola: wizard.escola,
      talento_classe: wizard.talento_classe,
      biografia: wizard.biografia,
      nivel: 1,
      atributos,
      pericias: wizard.pericias,
      habilidades: wizard.habilidades,
      idiomas: wizard.idiomas,
      inventario: [],
      dinheiro: { PC: 0, PP: 0, PO: 0, PPl: 0 },
      combate: {
        pv_atual: pvMax,
        pv_maximo: pvMax,
        pv_temporario: 0,
        ca: 10 + Math.floor((atributos.DES - 10) / 2),
        iniciativa_bonus: Math.floor((atributos.DES - 10) / 2),
        condicoes: [],
        testes_morte: { sucessos: 0, falhas: 0 },
      },
      sanidade: 5,
      corrupcao: 0,
      reputacao: [],
      notas: "",
    };

    const result = await finalizarCriacao(userId, wizard.nome, dados);
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
    } else {
      router.push(`/ficha/${result.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-dungeon">
      {profile && <Navbar profile={profile} />}

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="rune-divider mb-3">⚔ ✦ ⚔</div>
          <h1 className="font-display text-2xl text-parchment-200 tracking-widest uppercase">
            Criar Personagem
          </h1>
          <div className="rune-divider mt-3">⚔ ✦ ⚔</div>
        </div>

        {/* Nome */}
        {step === 0 && (
          <div className="card p-4 mb-6">
            <label className="font-display text-xs tracking-widest uppercase text-stone-400 block mb-1">
              Nome do Personagem
            </label>
            <input
              className="input-field w-full"
              placeholder="Como seu herói é chamado?"
              value={wizard.nome}
              onChange={e => update({ nome: e.target.value })}
            />
          </div>
        )}

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div className={`h-1 rounded mb-1 ${i <= step ? "bg-parchment-500" : "bg-stone-700"}`} />
              <span className={`font-display text-xs tracking-widest uppercase ${i === step ? "text-parchment-300" : "text-stone-600"}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Steps */}
        {step === 0 && (
          <AncestralidadeStep wizard={wizard} update={update} atributos={atributos} />
        )}
        {step === 1 && (
          <BiografiaStep wizard={wizard} update={update} atributos={atributos} />
        )}
        {step === 2 && (
          <ClasseStep wizard={wizard} update={update} atributos={atributos} />
        )}
        {step === 3 && (
          <AtributosFinaisStep wizard={wizard} update={update} atributos={atributos} />
        )}
        {step === 4 && (
          <ResumoStep wizard={wizard} atributos={atributos} />
        )}

        {error && (
          <p className="text-crimson-400 font-body text-sm mt-3 text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            className="btn-secondary"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← Anterior
          </button>

          {step < STEPS.length - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !wizard.nome.trim()}
            >
              Próximo →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || !wizard.nome.trim() || !wizard.ancestralidade || !wizard.classe}
            >
              {saving ? "Salvando..." : "✦ Finalizar Criação"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
