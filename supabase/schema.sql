-- ============================================================
-- Grimório da Campanha — Schema Supabase (v2)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'mestre')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.fichas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL DEFAULT 'Novo Personagem',
  dados      JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rolagens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id        UUID REFERENCES public.fichas(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL DEFAULT 'pericia',
  nome_rolagem    TEXT NOT NULL,
  dado_base       INTEGER NOT NULL DEFAULT 20,
  valor_dado      INTEGER NOT NULL,
  modificador     INTEGER NOT NULL DEFAULT 0,
  resultado_total INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.iniciativas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,
  iniciativa_valor INTEGER NOT NULL DEFAULT 0,
  tipo             TEXT NOT NULL DEFAULT 'jogador' CHECK (tipo IN ('jogador', 'monstro', 'npc')),
  ativo            BOOLEAN NOT NULL DEFAULT false,
  ordem            INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.configuracoes_sistema (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dados   JSONB NOT NULL DEFAULT '{}'
);

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

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rolagens              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iniciativas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Fichas
CREATE POLICY "fichas_select" ON public.fichas FOR SELECT USING (
  auth.uid() = player_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);
CREATE POLICY "fichas_insert" ON public.fichas FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "fichas_update" ON public.fichas FOR UPDATE USING (
  auth.uid() = player_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);
CREATE POLICY "fichas_delete" ON public.fichas FOR DELETE USING (
  auth.uid() = player_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);

-- Rolagens
CREATE POLICY "rolagens_select" ON public.rolagens FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);
CREATE POLICY "rolagens_insert" ON public.rolagens FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Iniciativas
CREATE POLICY "iniciativas_select" ON public.iniciativas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "iniciativas_insert" ON public.iniciativas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);
CREATE POLICY "iniciativas_update" ON public.iniciativas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);
CREATE POLICY "iniciativas_delete" ON public.iniciativas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'mestre')
);

-- Configurações
CREATE POLICY "config_select" ON public.configuracoes_sistema FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "config_insert" ON public.configuracoes_sistema FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "config_update" ON public.configuracoes_sistema FOR UPDATE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rolagens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.iniciativas;
