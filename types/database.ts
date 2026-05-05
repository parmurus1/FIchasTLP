export type Role = "player" | "mestre";

export interface Profile {
  id: string;
  username: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ficha {
  id: string;
  player_id: string;
  nome: string;
  dados: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // join
  profiles?: Profile;
}

// Placeholder para geração futura de tipos do Supabase
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
    };
  };
};
