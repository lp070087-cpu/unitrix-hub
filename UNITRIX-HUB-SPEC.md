# UNITRIX HUB — Especificação Completa de Arquitetura

**Versão:** 1.0.0  
**Data:** 2026-07-10  
**Admin:** lo070087@gmail.com  
**Stack:** Next.js 15 App Router + Neon PostgreSQL + Tailwind + Shadcn/UI + Framer Motion  

---

## 1. Visão Geral

O Unitrix Hub é uma plataforma premium de relacionamento comercial B2B. Não é um painel administrativo — é um portal de alto padrão onde a Unitrix gerencia todo o ciclo de vida comercial com seus clientes: do lead à entrega e assinatura recorrente.

### 1.1. Pilares da Experiência

| Pilar | Manifestação |
|---|---|
| **Sofisticação** | Splash screen cinematográfica, transições suaves, tipografia premium, dark mode refinado |
| **Tecnologia** | Next.js 15 App Router, Server Components, Edge runtime onde aplicável, Framer Motion |
| **Confiança** | Contratos com confirmação de leitura, assinatura digital com registro de IP/data/navegador |
| **Exclusividade** | Cada cliente tem sua URL personalizada para apresentações e contratos |
| **Alto Padrão** | Inspiração visual: Linear, Stripe, Vercel, Framer, Oryzo AI |

---

## 2. Stack Técnica

### 2.1. Stack Oficial Unitrix

| Camada | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| **Framework** | Next.js | 15+ (App Router) | RSC, Server Actions, streaming, edge |
| **Linguagem** | TypeScript | 5.x | Tipagem estrita, segurança |
| **UI** | Tailwind CSS + shadcn/ui | v3 + latest | Consistência, 47 componentes prontos da biblioteca (sellphone) |
| **Animação** | Framer Motion | latest | Declarativo, GPU-accelerated, orquestração de layout |
| **Banco** | Neon (PostgreSQL serverless) | latest | Branching, pooling, escala a zero, integração Vercel |
| **ORM** | Prisma | latest | Type-safe, migrations, relação com schema existente do CMS-ECOMMERCE |
| **Auth** | NextAuth v5 (Auth.js) | latest | Edge-compatible, multi-provider, sessão em Server Components |
| **Hospedagem** | Vercel | — | Deploy automático, Analytics, Edge Functions |
| **Email** | Resend | latest | Transacionais (convite, notificações, contrato) |
| **Upload** | Uploadthing | latest | Arquivos de projeto, avatares, assets de apresentação |
| **Pagamento** | Stripe | latest | Assinaturas recorrentes, checkout |

### 2.2. Bibliotecas Complementares

| Biblioteca | Uso |
|---|---|
| `framer-motion` | Transições de página, splash screen, animações de UI |
| `recharts` | Gráficos do dashboard (já presente no sellphone) |
| `react-hook-form` + `zod` | Formulários (já presente no sellphone) |
| `date-fns` | Manipulação de datas (contratos, prazos, cronogramas) |
| `react-signature-canvas` | Assinatura digital com mouse/touch |
| `sonner` | Toast notifications (já presente no sellphone) |
| `next-themes` | Tema dark/light |
| `@number-flow/react` | Contadores animados de valores financeiros |
| `motion` | Variante moderna do Framer Motion |

---

## 3. Modelo de Dados (Prisma Schema)

### 3.1. Diagrama de Entidades

```
User (admin Unitrix)
  │
  ├──1:N──> Client
  │          │
  │          ├──1:N──> Presentation
  │          ├──1:N──> Contract
  │          ├──1:N──> Payment
  │          ├──1:N──> Project
  │          │          └──1:N──> ProjectMilestone
  │          └──1:N──> Notification
  │
  ├──1:N──> Plan (planos de assinatura)
  └──1:N──> Subscription
```

### 3.2. Schema Completo

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?   // Only for admin (Unitrix owner)
  role          Role      @default(ADMIN)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  clients       Client[]
  presentations Presentation[]
  contracts     Contract[]
  plans         Plan[]
}

model Client {
  id              String    @id @default(cuid())
  name            String
  company         String?
  document        String?   // CPF or CNPJ
  email           String    @unique
  phone           String?
  address         String?
  city            String?
  segment         String?
  projectType     String?
  budget          Decimal?  @db.Decimal(10, 2)
  status          ClientStatus @default(LEAD)
  passwordHash    String?   // For client login

  // Commercial flow
  briefing        Json?     // Briefing form data
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])

  presentations   Presentation[]
  contracts       Contract[]
  payments        Payment[]
  projects        Project[]
  notifications   Notification[]
  subscriptions   Subscription[]
}

model Presentation {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique  // unitrix.app/apresentacao/{slug}
  content     Json?    // Estrutura da apresentação (seções, mídia, valores)
  status      PresentationStatus @default(DRAFT)
  sentAt      DateTime?
  viewedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
}

model Contract {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique  // unitrix.app/contrato/{slug}
  scope           String   // Escopo do projeto
  deadline        DateTime // Prazo
  value           Decimal  @db.Decimal(10, 2)
  conditions      String?  // Condições adicionais
  status          ContractStatus @default(DRAFT)

  // Template variables (filled from Client + Presentation)
  clientName      String
  clientDocument  String?
  clientCompany   String?
  projectType     String?
  startDate       DateTime?
  endDate         DateTime?

  // Reading confirmation
  readConfirmed   Boolean  @default(false)
  readConfirmedAt DateTime?

  // Digital signature
  signatureData   String?  // Base64 da assinatura
  signatureIp     String?
  signatureBrowser String?
  signedAt        DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
}

model Payment {
  id            String   @id @default(cuid())
  description   String
  amount        Decimal  @db.Decimal(10, 2)
  type          PaymentType  // ENTRADA, SALDO_FINAL, MENSALIDADE
  status        PaymentStatus @default(PENDING)
  dueDate       DateTime?
  paidAt        DateTime?
  method        PaymentMethod?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  clientId      String
  client        Client   @relation(fields: [clientId], references: [id])
  projectId     String?
  project       Project? @relation(fields: [projectId], references: [id])
}

model Project {
  id            String   @id @default(cuid())
  title         String
  description   String?
  progress      Int      @default(0)  // 0-100
  status        ProjectStatus @default(PLANNING)
  startDate     DateTime?
  endDate       DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  clientId      String
  client        Client   @relation(fields: [clientId], references: [id])
  milestones    ProjectMilestone[]
  payments      Payment[]
}

model ProjectMilestone {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      MilestoneStatus @default(PENDING)
  order       Int
  dueDate     DateTime?
  completedAt DateTime?
  files       Json?    // Uploaded files (Uploadthing URLs)

  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
}

model Plan {
  id          String   @id @default(cuid())
  name        String   // "Landing Page", "Sistema Web", "SaaS"...
  description String?
  price       Decimal  @db.Decimal(10, 2)
  interval    Interval @default(MONTHLY)  // MONTHLY, YEARLY
  features    Json?    // ["Hospedagem", "SSL", "Suporte", ...]
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  subscriptions Subscription[]
}

model Subscription {
  id          String   @id @default(cuid())
  status      SubscriptionStatus @default(ACTIVE)
  startedAt   DateTime @default(now())
  canceledAt  DateTime?
  nextBilling DateTime?

  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  planId      String
  plan        Plan     @relation(fields: [planId], references: [id])
}

model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      NotificationType
  read      Boolean  @default(false)
  link      String?  // Deep link para o recurso
  createdAt DateTime @default(now())

  clientId  String
  client    Client   @relation(fields: [clientId], references: [id])
}

// ── Enums ──

enum Role { ADMIN }

enum ClientStatus {
  LEAD           // Cadastrado, sem briefing
  BRIEFING       // Briefing preenchido
  PROPOSAL_SENT  // Apresentação enviada
  NEGOTIATION    // Em negociação
  CONTRACTED     // Contrato assinado
  IN_PROGRESS    // Projeto em desenvolvimento
  COMPLETED      // Projeto concluído
  SUBSCRIBER     // Assinante ativo (pós-entrega)
  CANCELLED      // Cancelado
}

enum PresentationStatus { DRAFT, SENT, VIEWED }

enum ContractStatus { DRAFT, SENT, READ, SIGNED, EXPIRED }

enum PaymentType { DEPOSIT, FINAL_BALANCE, SUBSCRIPTION }

enum PaymentStatus { PENDING, PAID, OVERDUE, CANCELLED }

enum PaymentMethod { PIX, CREDIT_CARD, BANK_TRANSFER }

enum ProjectStatus { PLANNING, IN_PROGRESS, REVIEW, COMPLETED, DELIVERED }

enum MilestoneStatus { PENDING, IN_PROGRESS, COMPLETED }

enum Interval { MONTHLY, YEARLY }

enum SubscriptionStatus { ACTIVE, PAUSED, CANCELLED, EXPIRED }

enum NotificationType { CONTRACT, PRESENTATION, PROJECT_UPDATE, PAYMENT, INFO }
```

---

## 4. Estrutura de Rotas

```
unitrix.app/
│
├── /                          → Splash Screen (pública)
│
├── /auth/
│   ├── /login                 → Login (admin + clientes)
│   └── /recuperar-senha       → Recuperação
│
├── /admin/                    → Área Administrativa (ADMIN apenas)
│   ├── /dashboard             → Dashboard principal
│   ├── /clientes              → Lista de clientes
│   ├── /clientes/[id]         → Detalhes do cliente
│   ├── /clientes/novo         → Cadastrar cliente
│   ├── /apresentacoes         → Lista de apresentações
│   ├── /apresentacoes/nova    → Criar apresentação
│   ├── /contratos             → Lista de contratos
│   ├── /contratos/novo        → Criar contrato
│   ├── /financeiro            → Visão financeira
│   ├── /projetos              → Lista de projetos
│   ├── /projetos/[id]         → Detalhes do projeto
│   ├── /planos                → Gerenciar planos de assinatura
│   └── /assinaturas           → Assinaturas ativas
│
├── /cliente/                  → Área do Cliente (CLIENTE autenticado)
│   ├── /dashboard             → Resumo do cliente
│   ├── /apresentacoes         → Apresentações recebidas
│   ├── /contratos             → Contratos
│   ├── /contratos/[id]/assinar → Assinatura digital
│   ├── /projetos              → Projetos
│   ├── /projetos/[id]         → Detalhes do projeto + timeline
│   ├── /pagamentos            → Histórico de pagamentos
│   └── /notificacoes          → Central de notificações
│
├── /apresentacao/[slug]       → Apresentação pública (link compartilhável)
└── /contrato/[slug]           → Contrato público (link compartilhável)
```

---

## 5. Arquitetura de Componentes

### 5.1. Layout Base

```
RootLayout
├── SplashScreen (quando ativa)
├── AuthLayout (para /auth/*)
├── AdminLayout (para /admin/*)
│   ├── AdminSidebar
│   ├── AdminHeader
│   └── AdminContent
└── ClientLayout (para /cliente/*)
    ├── ClientSidebar
    ├── ClientHeader
    └── ClientContent
```

### 5.2. Componentes Reutilizáveis da Biblioteca

| Componente | Origem | Adaptação necessária |
|---|---|---|
| **47 componentes shadcn/ui** | `sellphone` | Nenhuma — copiar direto. Botão, card, dialog, dropdown, form, input, select, table, tabs, toast, tooltip, etc. |
| **18 componentes de negócio** | `sellphone` | Adaptar: Header, Footer, ProductCard → ClientCard, Features → PlanFeatures |
| **Recharts (gráficos)** | `sellphone`, `cms-ecommerce` | Reutilizar wrappers de gráfico |
| **Sidebar com SimpleBar** | `cms-ecommerce` | Reescrever como Server Component com shadcn/ui |
| **Formulários (react-hook-form + zod)** | `sellphone` | Reutilizar padrão de validação |
| **Sonner (toast)** | `sellphone` | Reutilizar configuração |
| **next-themes** | `sellphone` | Reutilizar toggle de tema |
| **Animações GSAP/Lenis** | `banco-xp` | NÃO usar — migrar para Framer Motion (mais compatível com React Server Components) |

### 5.3. Componentes Novos (específicos do Unitrix Hub)

```
components/
├── ui/                          # shadcn/ui (copiados do sellphone)
├── splash/
│   ├── splash-screen.tsx        # Tela de entrada cinematográfica
│   └── splash-particles.tsx     # Partículas com Framer Motion
├── layout/
│   ├── admin-sidebar.tsx        # Sidebar do admin
│   ├── admin-header.tsx         # Header do admin
│   ├── client-sidebar.tsx       # Sidebar do cliente
│   └── client-header.tsx        # Header do cliente
├── dashboard/
│   ├── stats-cards.tsx          # Cards de métricas
│   ├── revenue-chart.tsx        # Gráfico financeiro
│   ├── recent-clients.tsx       # Clientes recentes
│   └── project-status.tsx       # Status dos projetos
├── clients/
│   ├── client-card.tsx          # Card de cliente
│   ├── client-form.tsx          # Formulário de cadastro
│   ├── client-status-badge.tsx  # Badge de status
│   └── client-timeline.tsx      # Timeline do cliente
├── presentations/
│   ├── presentation-builder.tsx # Builder de apresentação
│   ├── presentation-preview.tsx # Preview da apresentação
│   └── presentation-view.tsx    # Visualização pública
├── contracts/
│   ├── contract-form.tsx        # Formulário de contrato
│   ├── contract-view.tsx        # Visualização do contrato
│   ├── contract-signature.tsx   # Componente de assinatura
│   └── contract-read-confirm.tsx # Confirmação de leitura
├── projects/
│   ├── project-card.tsx         # Card de projeto
│   ├── project-timeline.tsx     # Timeline visual
│   ├── milestone-list.tsx       # Lista de etapas
│   └── progress-ring.tsx        # Anel de progresso circular
├── payments/
│   ├── payment-table.tsx        # Tabela de pagamentos
│   ├── payment-status.tsx       # Badge de status
│   └── subscription-card.tsx    # Card de assinatura
└── shared/
    ├── empty-state.tsx          # Estado vazio premium
    ├── loading-skeleton.tsx     # Skeleton loader
    ├── page-transition.tsx      # Transição de página
    └── brand-logo.tsx           # Logo Unitrix (SVG inline)
```

---

## 6. Fluxos Principais

### 6.1. Fluxo de Entrada (Splash → Login)

```
Usuário acessa unitrix.app
        │
        ▼
┌──────────────────┐
│  Splash Screen    │  2-4 segundos
│  ─ Fade in logo   │
│  ─ Partículas     │
│  ─ Glow animado   │
│  ─ Zoom reveal    │
│  ─ Blur transition│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Login            │
│  ─ Email          │
│  ─ Senha          │
└──────┬───────────┘
       │
   ┌───┴───┐
   │       │
  ADMIN  CLIENTE
   │       │
   ▼       ▼
/admin  /cliente
```

### 6.2. Fluxo Comercial Completo

```
LEAD (cadastro)
  │
  ▼
BRIEFING (formulário)
  │
  ▼
APRESENTAÇÃO (criação → envio → visualização)
  │
  ▼
CONTRATO (geração automática → confirmação de leitura → assinatura)
  │
  ▼
PAGAMENTO 50% (entrada)
  │
  ▼
EM DESENVOLVIMENTO (timeline, milestones, entregas)
  │
  ▼
PAGAMENTO 50% (saldo final)
  │
  ▼
ENTREGA (liberação de arquivos, código, acesso)
  │
  ▼
ASSINATURA MENSAL (hospedagem + suporte)
  │
  ▼
RELACIONAMENTO CONTÍNUO
```

### 6.3. Fluxo de Contrato Inteligente

```
Admin preenche formulário do contrato
  │
  ▼
Sistema busca modelo mestre
  │
  ├── Substitui: {{clientName}}, {{document}}, {{value}},
  │              {{deadline}}, {{projectType}}, {{dates}}
  │
  ▼
Gera contrato em /contrato/{slug}
  │
  ▼
Cliente acessa link
  │
  ├── Lê o contrato (scroll tracking)
  │
  ▼
Confirmação de leitura
  │
  ├── ☐ Confirmo que li todo o contrato
  ├── ☐ Estou de acordo com os termos
  │
  ▼
Assinatura digital
  │
  ├── Mouse / Touch / Digital
  ├── Salva: data, hora, IP, navegador
  │
  ▼
Contrato assinado → PDF gerado → histórico salvo
```

---

## 7. Identidade Visual

### 7.1. Sistema de Cores

| Token | Hex | Uso |
|---|---|---|
| `background` | `#08080A` | Fundo principal |
| `surface` | `#0E0E11` | Cards, sidebar |
| `surface-hover` | `#141418` | Hover states |
| `border` | `rgba(255,255,255,0.06)` | Bordas sutis |
| `border-strong` | `rgba(255,255,255,0.10)` | Bordas ativas |
| `foreground` | `#E8E8E8` | Texto principal |
| `foreground-muted` | `#777` | Texto secundário |
| `foreground-dim` | `#444` | Texto terciário |
| `accent` | `#B8FF2E` | Cor de destaque (volt green) |
| `accent-hover` | `#A3EE1A` | Hover do accent |
| `accent-muted` | `rgba(184,255,46,0.12)` | Fundos com accent |

### 7.2. Tipografia

| Elemento | Família | Peso | Tamanho |
|---|---|---|---|
| Títulos | Inter | 900 | 32-48px |
| Headings | Inter | 700 | 18-24px |
| Body | Inter | 400 | 14-15px |
| Captions | Inter | 500 | 11-12px |
| Dados financeiros | JetBrains Mono | 600 | 18-28px |

### 7.3. Efeitos Cinematográficos Globais

- Entrada de página: `fade + slideUp (20px)` via Framer Motion
- Cards: `hover: scale(1.01) + shadow glow`
- Números: `number-flow` animado ao entrar no viewport
- Toast: `sonner` com tema dark personalizado
- Loading: Skeleton com shimmer animation (shadcn/ui)

---

## 8. Estratégia de Reuso da Biblioteca

### 8.1. Do CMS-ECOMMERCE (DASH)

| O que levar | Como adaptar |
|---|---|
| Lógica de auth (NextAuth → NextAuth v5) | Migrar JWT + bloqueio de role |
| Schema Prisma (6 models) | Expandir para 10 models |
| Estrutura de API Routes | Converter para Route Handlers (App Router) |
| Componentes de tabela (react-table, gridjs) | Substituir por shadcn/ui Table |
| Gráficos ApexCharts | Substituir por Recharts (já no sellphone) |
| Sidebar com Redux | Substituir por Server Component + CSS |

### 8.2. Do Sellphone (Next.js + shadcn/ui)

| O que levar | Como adaptar |
|---|---|
| 47 componentes shadcn/ui | Copiar direto — zero adaptação |
| Configuração Recharts | Reutilizar wrappers |
| Configuração react-hook-form + zod | Reutilizar padrão |
| Sonner toast | Reutilizar |
| next-themes | Reutilizar |
| 18 componentes de negócio | Adaptar visualmente |

### 8.3. Do Banco-XP (LP Financeira)

| O que levar | Como adaptar |
|---|---|
| Paleta de cores escura | Referência de tom |
| Efeito glow CSS | Adaptar para componentes React |
| Estrutura de grid | Referência de layout |

---

## 9. Plano de Fases

### Fase 1 — Fundação (ATUAL)
**Escopo:** Estrutura base + Auth + Splash + Dashboard Admin + Gestão de Clientes

- [x] Especificação de arquitetura (este documento)
- [ ] Inicialização do projeto Next.js 15 + TypeScript + Tailwind
- [ ] Configuração shadcn/ui (47 componentes)
- [ ] Configuração Prisma + Neon
- [ ] Schema do banco e migrations
- [ ] Auth (NextAuth v5 com credenciais)
- [ ] Splash Screen cinematográfica
- [ ] Layout Admin (sidebar + header)
- [ ] Dashboard Admin (métricas, charts, clientes recentes)
- [ ] CRUD de Clientes
- [ ] Layout Cliente (sidebar + header)
- [ ] Dashboard Cliente (resumo)

### Fase 2 — Apresentações & Contratos
- [ ] Builder de apresentação (template fixo, dados dinâmicos)
- [ ] Visualização pública (/apresentacao/[slug])
- [ ] Gerador de contrato (modelo mestre + variáveis)
- [ ] Visualização do contrato (/contrato/[slug])
- [ ] Confirmação de leitura (checkboxes)
- [ ] Assinatura digital (canvas + registro de IP/data/navegador)
- [ ] Geração de PDF do contrato assinado

### Fase 3 — Financeiro & Projetos
- [ ] Gestão de pagamentos (entrada + saldo final + mensalidade)
- [ ] Dashboard financeiro
- [ ] Timeline de produção com milestones
- [ ] Upload de arquivos por etapa
- [ ] Indicador de progresso (25% → 50% → 75% → 100%)
- [ ] Liberação de entrega

### Fase 4 — Assinaturas & Relacionamento
- [ ] Planos de assinatura configuráveis
- [ ] Stripe integration
- [ ] Gestão de assinaturas
- [ ] Notificações (email + in-app)
- [ ] Central de notificações do cliente

### Fase 5 — Polimento & Deploy
- [ ] Revisão de animações Framer Motion
- [ ] Otimização de performance (Lighthouse > 90)
- [ ] Testes E2E (Playwright)
- [ ] Documentação de deploy (Vercel + Neon)
- [ ] Deploy produção

---

## 10. Padrões de Código

### 10.1. Server Components por Padrão

Todo componente é Server Component a menos que precise de:
- Estado (`useState`, `useReducer`)
- Efeitos (`useEffect`)
- Event handlers complexos
- Contexto de tema
- Animações Framer Motion

### 10.2. Data Fetching

```typescript
// Server Component — fetch direto no componente
async function AdminDashboard() {
  const stats = await prisma.$transaction([...])
  return <DashboardView stats={stats} />
}

// Client Component — recebe dados como props
("use client")
function DashboardView({ stats }: { stats: Stats[] }) {
  // Animações, interatividade aqui
}
```

### 10.3. Server Actions para Mutations

```typescript
// app/admin/clientes/actions.ts
("use server")
export async function createClient(data: ClientInput) {
  // Validação com zod
  // Prisma create
  // Revalidate cache
}
```

### 10.4. Nomenclatura

- Arquivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Funções: `camelCase`
- Rotas dinâmicas: `[id]` para single, `[...slug]` para catch-all
- Server Actions: `actions.ts` dentro da pasta da rota

---

## 11. Considerações de Segurança

- **Auth:** NextAuth v5 com JWT estratégia (sem banco de sessão)
- **Admin middleware:** Verifica role ADMIN em todas as rotas `/admin/*`
- **Client middleware:** Verifica autenticação em todas as rotas `/cliente/*`
- **Contratos públicos:** `/contrato/[slug]` — acesso apenas com slug válido + cliente autenticado
- **Server Actions:** Validação zod em TODA mutation
- **Rate limiting:** Upstash Redis para endpoints sensíveis (login, assinatura)
- **Dados sensíveis:** CPF/CNPJ armazenados com criptografia a nível de aplicação

---

*Documento gerado em 2026-07-10. Sujeito a revisão e atualização conforme o desenvolvimento avança.*
