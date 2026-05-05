-- ============================================================
-- RPG Campaign Platform — Schema Supabase
-- Execute este SQL no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Tabela de perfis (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'mestre')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Trigger para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabela de fichas de personagem (estrutura base — será expandida)
CREATE TABLE IF NOT EXISTS public.fichas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL DEFAULT 'Novo Personagem',
  dados      JSONB NOT NULL DEFAULT '{}',   -- todos os campos da ficha ficam aqui
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fichas_updated_at ON public.fichas;
CREATE TRIGGER fichas_updated_at
  BEFORE UPDATE ON public.fichas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas   ENABLE ROW LEVEL SECURITY;

-- Profiles: qualquer usuário autenticado pode ver perfis
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: só pode editar o próprio perfil
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Fichas: player vê só a própria; mestre vê todas
CREATE POLICY "fichas_select_player" ON public.fichas
  FOR SELECT USING (
    auth.uid() = player_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'mestre'
    )
  );

-- Fichas: player cria só para si mesmo
CREATE POLICY "fichas_insert_player" ON public.fichas
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Fichas: player edita só a própria; mestre edita qualquer
CREATE POLICY "fichas_update" ON public.fichas
  FOR UPDATE USING (
    auth.uid() = player_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'mestre'
    )
  );

-- Fichas: player deleta só a própria; mestre deleta qualquer
CREATE POLICY "fichas_delete" ON public.fichas
  FOR DELETE USING (
    auth.uid() = player_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'mestre'
    )
  );
