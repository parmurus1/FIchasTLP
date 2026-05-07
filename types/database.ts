// ============================================================
// Grimório da Campanha — Types (v2)
// ============================================================

export type Role = string;

export interface Profile {
  id: string;
  username: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ── Ficha ────────────────────────────────────────────────────

export type AtributoKey = "FOR" | "DES" | "CON" | "INT" | "CAR";

export interface Atributos {
  FOR: number;
  DES: number;
  CON: number;
  INT: number;
  CAR: number;
}

export type NivelPericia = "destreinado" | "treinado" | "especialista";

export interface Pericia {
  nome: string;
  atributo: AtributoKey;
  nivel: NivelPericia;
  bonus_extra?: number;
}

export interface Habilidade {
  nome: string;
  descricao: string;
  origem: "ancestralidade" | "classe" | "biografia" | "outro";
}

export interface Item {
  id: string;
  nome: string;
  quantidade: number;
  peso?: number;
  descricao?: string;
}

export interface EstadoCombate {
  pv_atual: number;
  pv_maximo: number;
  pv_temporario: number;
  ca: number;
  iniciativa_bonus: number;
  condicoes: string[];
  testes_morte: { sucessos: number; falhas: number };
}

export interface FichaData {
  // Identidade
  ancestralidade: string;
  heranca: string;
  classe: string;
  escola: string;
  talento_classe: string;
  biografia: string;
  nivel: number;
  avatar_url?: string;

  // Atributos
  atributos: Atributos;

  // Perícias
  pericias: Pericia[];

  // Habilidades
  habilidades: Habilidade[];

  // Idiomas
  idiomas: string[];

  // Inventário
  inventario: Item[];
  dinheiro: { PC: number; PP: number; PO: number; PPl: number };

  // Combate
  combate: EstadoCombate;

  // Extras (mantidos do sistema anterior)
  sanidade?: number;
  corrupcao?: number;
  reputacao?: Array<{ grupo: string; valor: number }>;
  base?: { nome: string; nivel: number; modulos: string[]; custo_total: number };

  // Notas
  notas: string;
}

export interface Ficha {
  id: string;
  player_id: string;
  nome: string;
  dados: FichaData;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

// ── Rolagem ──────────────────────────────────────────────────

export interface Rolagem {
  id: string;
  ficha_id: string | null;
  user_id: string | null;
  tipo: string;
  nome_rolagem: string;
  dado_base: number;
  valor_dado: number;
  modificador: number;
  resultado_total: number;
  created_at: string;
  profiles?: Profile;
  fichas?: Pick<Ficha, "id" | "nome">;
}

// ── Iniciativa ───────────────────────────────────────────────

export interface IniciativaEntry {
  id: string;
  nome: string;
  iniciativa_valor: number;
  tipo: "jogador" | "monstro" | "npc";
  ativo: boolean;
  ordem: number;
  created_at: string;
}

// ── Configurações ────────────────────────────────────────────

export interface SystemSettings {
  bonus_proficiencia: number;
  bonus_especialista: number;
  valor_critico_sucesso: number;
  valor_critico_falha: number;
  regras_customizadas?: Record<string, unknown>;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  bonus_proficiencia: 2,
  bonus_especialista: 4,
  valor_critico_sucesso: 20,
  valor_critico_falha: 1,
};

// ── Database type (Supabase generic) ─────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
      };
      fichas: {
        Row: Ficha;
        Insert: Partial<Ficha> & { player_id: string; nome: string };
        Update: Partial<Ficha>;
      };
      rolagens: {
        Row: Rolagem;
        Insert: Omit<Rolagem, "id" | "created_at" | "profiles" | "fichas">;
        Update: Partial<Rolagem>;
      };
      iniciativas: {
        Row: IniciativaEntry;
        Insert: Omit<IniciativaEntry, "id" | "created_at">;
        Update: Partial<IniciativaEntry>;
      };
      configuracoes_sistema: {
        Row: { id: string; user_id: string; dados: SystemSettings };
        Insert: { user_id: string; dados: SystemSettings };
        Update: { dados?: SystemSettings };
      };
    };
  };
};
