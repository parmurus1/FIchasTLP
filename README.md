# Grimório da Campanha

Plataforma de fichas de RPG com Next.js + Supabase.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Banco de Dados + Auth**: Supabase
- **Estilo**: Tailwind CSS
- **Deploy**: Vercel

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/schema.sql`
3. Execute o SQL para criar as tabelas e políticas

### 3. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
NEXT_PUBLIC_MASTER_SECRET=sua-senha-secreta-do-mestre
```

As chaves ficam em: **Supabase → Settings → API**

### 4. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Deploy no Vercel

1. Faça push do projeto para o GitHub
2. Conecte o repositório no [vercel.com](https://vercel.com)
3. Adicione as variáveis de ambiente no painel da Vercel
4. Deploy automático!

No Supabase, configure a URL de redirect:
- **Authentication → URL Configuration → Site URL**: `https://seu-projeto.vercel.app`
- **Redirect URLs**: `https://seu-projeto.vercel.app/auth/callback`

---

## Estrutura de Roles

| Role | Acesso |
|------|--------|
| `player` | Vê e edita só a própria ficha |
| `mestre` | Vê todas as fichas, acesso à Mesa do Mestre |

O registro como **mestre** exige uma chave secreta (`NEXT_PUBLIC_MASTER_SECRET`).

---

## Próximos Passos

- [ ] Implementar campos da ficha em `/app/ficha/[id]/page.tsx`
- [ ] Adicionar sistema de salvamento automático
- [ ] Upload de avatar/imagem do personagem
- [ ] Log de sessões/notas de campanha
