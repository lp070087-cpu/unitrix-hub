# Unitrix Hub

**Plataforma premium de relacionamento comercial B2B.**

Stack: Next.js 15 App Router + Neon PostgreSQL + Tailwind + Framer Motion

---

## Estrutura

```
unitrix-hub/
├── prisma/
│   ├── schema.prisma        # 10 models
│   └── seed.ts              # Admin + 5 clientes + projetos + planos
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout + Splash Screen
│   │   ├── page.tsx         # Redirect inteligente
│   │   ├── globals.css      # Estilos globais premium
│   │   ├── auth/login/      # Login (admin + clientes)
│   │   ├── api/auth/        # NextAuth v5
│   │   ├── admin/           # Área ADMIN
│   │   │   ├── page.tsx     # Dashboard com métricas
│   │   │   └── clientes/    # CRUD completo
│   │   └── cliente/         # Área do CLIENTE
│   │       └── page.tsx     # Dashboard com projeto + pagamentos
│   ├── components/
│   │   ├── splash/          # Splash Screen cinematográfica
│   │   └── layout/          # Sidebars + placeholders
│   └── lib/
│       ├── auth.ts          # NextAuth v5 (admin + clientes)
│       ├── prisma.ts        # Prisma singleton
│       └── utils.ts         # Helpers + status maps
├── public/
│   └── apresentacao/        # Apresentações HTML
│       ├── unitrix.html     # LP comercial
│       └── sistema-interno.html  # Tour do sistema
├── vercel.json              # Config de build Vercel
├── DEPLOY.md                # Guia de deploy
├── UNITRIX-HUB-SPEC.md      # Especificação completa
└── README.md
```

---

## Setup Rápido

```bash
npm install
cp .env.example .env
# Preencher DATABASE_URL e DIRECT_URL do Neon
# AUTH_SECRET: openssl rand -base64 32
npx prisma db push
npm run db:seed
npm run dev
```

Acesse: `http://localhost:3000`

**Admin:** `lo070087@gmail.com` / `unitrix2026`  
**Cliente:** `ricardo@fintechpro.com.br` / `cliente123`

---

## Fases

| Fase | Escopo | Status |
|---|---|---|
| **1** | Auth, Splash, Dashboard Admin, Gestão de Clientes, Dashboard Cliente | ✅ |
| **2** | Apresentações, Contratos, Assinatura Digital | 🔜 |
| **3** | Financeiro, Timeline de Produção, Milestones | 🔜 |
| **4** | Assinaturas, Stripe, Notificações | 🔜 |
| **5** | Polimento, Testes, Deploy Produção | 🔜 |

---

## Deploy

Ver [DEPLOY.md](./DEPLOY.md) para o guia completo de deploy na Vercel + Neon.

---

*Unitrix Hub &copy; 2026 — unitrix.app*
