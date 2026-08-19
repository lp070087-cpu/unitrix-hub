# Deploy Unitrix Hub — Vercel + Neon

Guia passo a passo para colocar o Unitrix Hub no ar.

---

## 1. Banco de Dados — Neon

1. Crie uma conta gratuita em [neon.tech](https://neon.tech)
2. Crie um projeto chamado `unitrix-hub`
3. Copie a **Connection string** (formato `postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/unitrix-hub?sslmode=require`)
4. Copie também a **Direct URL** (mesma string sem o pooler)

---

## 2. Variáveis de Ambiente — Vercel

No dashboard do projeto Vercel, vá em **Settings → Environment Variables** e crie:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | A connection string do Neon (com pooler) |
| `DIRECT_URL` | A connection string do Neon (direct, sem pooler) |
| `AUTH_SECRET` | Gere com `openssl rand -base64 32` no terminal |
| `AUTH_URL` | `https://unitrix-hub.vercel.app` (seu domínio real) |

---

## 3. Deploy na Vercel

```bash
# 1. Instalar dependências
npm install

# 2. Conectar ao GitHub
git init
git add .
git commit -m "Unitrix Hub v1.0"

# 3. Criar repositório no GitHub e push
git remote add origin https://github.com/seu-usuario/unitrix-hub.git
git branch -M main
git push -u origin main
```

No Vercel:
1. Importe o repositório do GitHub
2. Framework: **Next.js**
3. Build Command: `npx prisma generate && next build` (já configurado no `vercel.json`)
4. Root Directory: `./`
5. Adicione as 4 variáveis de ambiente acima
6. Clique **Deploy**

---

## 4. Rodar o Seed (após deploy)

```bash
# Localmente, com o .env apontando para o Neon de produção:
npm run db:push
npm run db:seed
```

Ou via Vercel CLI:
```bash
npx vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma db push
npm run db:seed
```

---

## 5. Acessos Iniciais

**Admin:** `lo070087@gmail.com` / `unitrix2026`

**Clientes de exemplo:**
- `ricardo@fintechpro.com.br` / `cliente123`
- `marina@clinicavida.com.br` / `cliente123`
- `carlos@logpro.com.br` / `cliente123`

---

## 6. Testar

```bash
npm run dev
# Acesse http://localhost:3000
# Login como admin: lo070087@gmail.com / unitrix2026
```

---

## 7. Próximos Passos (Fase 2+)

- Implementar criação de apresentações
- Sistema de contratos com assinatura digital
- Stripe/PIX integração financeira
- Notificações por email (Resend)
- Upload de arquivos (Uploadthing)

---

*Unitrix Hub — unitrix.app*
