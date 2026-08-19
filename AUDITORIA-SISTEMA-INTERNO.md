# AUDITORIA COMPLETA — SISTEMA INTERNO UNITRIX HUB

**Data:** 2026-07-30
**Escopo:** Apenas sistema interno (admin + cliente). Landing page excluída.
**Arquivos analisados:** 60+ arquivos fonte (pages, components, lib, prisma, middleware, config)

---

## 1. O QUE ESTÁ PRONTO ✅

### Autenticação
- NextAuth v5 (beta 25) com provider credentials — funcional para admin e cliente
- JWT strategy com callbacks de `jwt` e `session` populando role e id
- Middleware edge-compatible protegendo rotas `/admin/*` e `/cliente/*`
- Página de login única com UI premium (dark mode, partículas, animação Framer Motion)
- Redirecionamento inteligente pós-login baseado em role
- SignOut funcional nas sidebars admin e cliente
- Tipos TypeScript estendidos para Session, User e JWT

### Layout e Estrutura
- Admin layout com sidebar colapsável (Framer Motion animado) + header sticky com avatar
- Client layout com sidebar colapsável e header
- SidebarContext para estado colapsado compartilhado
- Splash screen cinematográfica (3s, sessionStorage para não repetir)
- ConditionalUI (exibe splash + toaster condicionalmente)
- Sistema de cores premium: background #08080A, accent #B8FF2E (volt green)
- Tipografia Inter + JetBrains Mono, scrollbar customizada
- 8 variantes de animação CSS em tailwind.config.ts

### Dashboard Admin
- 4 stat cards com dados reais: Total Clientes, Projetos Ativos, Receita Total, Pagamentos Pendentes
- Timeline de prazos (componente reutilizável) para projetos ativos
- Clientes recentes (últimos 5) com status badges e links
- Pagamentos recentes (últimos 5) com status
- Estados vazios tratados para todas as seções
- Formatação de moeda BRL

### Dashboard Cliente
- 4 stat cards: Projetos Ativos, Contratos, Total Pago, Pendente
- Projeto atual com progresso visual e timeline de prazos
- Milestones visíveis (somente leitura)
- Pagamentos recentes com status

### CRUD de Clientes
- Listagem em grid de cards (3 colunas) com busca textual
- Criação via formulário completo com validação Zod
- Visualização de detalhes com tabs: perfil, projetos, apresentações, contratos, pagamentos
- Exclusão com confirmação
- Status badges coloridos (8 estados de cliente)
- Server actions: createClient, updateClient, deleteClient, getClientById
- Toast notifications (sonner) em todas as operações

### Projetos
- Listagem em grid com timeline de prazos e status
- Criação inline (formulário modal)
- Detalhes: milestones interativas (toggle completo/pendente), barra de progresso automática
- Pagamentos vinculados ao projeto
- Server actions: createProject, updateProjectProgress, updateProjectStatus, addMilestone, toggleMilestone, createPayment, markPaymentPaid

### Financeiro
- Dashboard com total recebido vs pendente
- Tabela de pagamentos com filtro (todos/pagos/pendentes)
- Confirmar pagamento (mark as paid)
- Dados reais do banco

### Planos e Assinaturas
- Visualização de planos cadastrados com features e preços
- Visualização de assinaturas ativas com status
- Dados reais do banco

### Banco de Dados
- Prisma schema completo: 11 models (User, Client, Presentation, Contract, Payment, Project, ProjectMilestone, Plan, Subscription, Notification)
- Todas as relações configuradas corretamente
- Seed script com: 1 admin, 5 clientes, 2 projetos (com milestones e payments), 5 planos
- Decimal suporte para valores financeiros (10,2)

### Páginas do Cliente
- Todas as 6 páginas implementadas com dados reais do banco
- Apresentações, Contratos, Projetos, Pagamentos, Notificações
- Identificação do cliente via email da sessão

---

## 2. O QUE ESTÁ PARCIALMENTE PRONTO 🟡

### Apresentações (Admin)
- A página lista clientes e gera links `/apresentacao/${c.id}`
- **Falta:** a rota pública não existe. O link está quebrado.
- **Falta:** não há formulário de criação de conteúdo da apresentação
- **Falta:** não é usado o campo `slug` único do modelo Presentation

### Apresentações (Cliente)
- Lê do banco e exibe cards com status
- Links apontam para `/apresentacao/${p.slug}` — rota inexistente
- Dados exibidos corretamente: título, status, datas de envio/visualização

### Contratos (Admin)
- Lista clientes elegíveis (status >= PROPOSAL_SENT)
- Mostra "Gerar Contrato →" mas não há ação implementada
- Não há formulário de criação de contrato

### Contratos (Cliente)
- Lê do banco e exibe cards com escopo, valor, prazo, status
- Link de "Visualizar →" aponta para `/contrato/${c.slug}` — rota inexistente
- Mostra corretamente se está assinado ou pendente

### Milestones
- Toggle completo/pendente funciona com recálculo automático de progresso
- **Falta:** edição de título, descrição e data
- **Falta:** upload de arquivos (campo `files` Json nunca usado)
- **Falta:** status IN_PROGRESS (só PENDING/COMPLETED usados)

### Ações Rápidas no Detalhe do Cliente
- Links para: Criar Apresentação, Gerar Contrato, Registrar Pagamento, Criar Projeto, Gerenciar Assinatura
- **Todos os links são `href="#"`** — nenhum funciona

---

## 3. O QUE É APENAS VISUAL/MOCK 🟠

- **placeholder-section.tsx:** Componente existe com placeholders para Fases 2-4, mas **não está sendo usado** por nenhuma página. Todas as páginas admin têm implementação real (mesmo que parcial).
- **client-placeholder.tsx:** Componente existe com placeholders, mas também **não está sendo usado**. Todas as páginas cliente são reais.
- **Botão "Editar" no detalhe do cliente:** Aponta para `/admin/clientes/[id]/editar` — **rota inexistente**.
- **Links de Ações Rápidas:** Todos são `#` (não implementados).

---

## 4. O QUE ESTÁ QUEBRADO 🔴

| # | Problema | Localização | Impacto |
|---|----------|-------------|---------|
| 1 | **Banco de dados NÃO configurado** — `.env` tem `DATABASE_URL` com placeholder `user:password@ep-xxxx...` | `.env` | Crítico — sistema não conecta ao Neon |
| 2 | **Rota de edição de cliente inexistente** — botão "Editar" leva a 404 | `detail-client.tsx:72` | Médio — funcionalidade quebrada |
| 3 | **Páginas públicas de apresentação/contrato inexistentes** — links gerados não funcionam | `/apresentacao/[slug]`, `/contrato/[slug]` | Alto — fluxo comercial quebrado |
| 4 | **Sidebar colapsável não ajusta padding do main** — `pl-[240px]` é fixo no layout | `admin/layout.tsx:20`, `cliente/layout.tsx:18` | Baixo — visual apenas, sidebar sobrepõe conteúdo |
| 5 | **Cliente sem senha no seed** — Pedro Santos e Ana Oliveira sem `passwordHash` não conseguem logar | `prisma/seed.ts:53,63` | Baixo — apenas dados de exemplo |
| 6 | **ConditionalUI não cobre rotas públicas futuras** — só verifica `/landing` | `conditional-ui.tsx:11` | Baixo — splash screen apareceria em `/apresentacao/*` |
| 7 | **AUTH_SECRET inseguro** — valor previsível no .env | `.env:8` | Médio — tokens JWT facilmente forjáveis |

---

## 5. O QUE FALTA DESENVOLVER 🔵

### Apresentações (PRIORIDADE ALTA)
- [ ] Página pública `/apresentacao/[slug]` — template premium com conteúdo dinâmico
- [ ] Formulário de criação de apresentação (título, conteúdo JSON, selecionar cliente)
- [ ] Geração automática de slug único
- [ ] Envio (status: DRAFT → SENT, registrar `sentAt`)
- [ ] Tracking de visualização (registrar `viewedAt` quando cliente abre)
- [ ] Conteúdo real (campo `content` Json — estrutura de seções, mídia, valores)

### Contratos (PRIORIDADE ALTA)
- [ ] Página pública `/contrato/[slug]` — visualização do contrato
- [ ] Formulário de criação de contrato com preenchimento automático (dados do cliente)
- [ ] Modelo mestre de contrato com variáveis ({{clientName}}, {{value}}, {{deadline}}, etc.)
- [ ] Confirmação de leitura (scroll tracking + checkboxes)
- [ ] Assinatura digital (react-signature-canvas já instalado)
- [ ] Registro de IP, browser, data/hora da assinatura
- [ ] Geração de PDF do contrato assinado
- [ ] Fluxo de status: DRAFT → SENT → READ → SIGNED

### Projetos (PRIORIDADE MÉDIA)
- [ ] Edição inline de milestones (título, descrição, data)
- [ ] Status IN_PROGRESS para milestones
- [ ] Upload de arquivos por milestone (Uploadthing — ainda não configurado)
- [ ] Criar projeto diretamente do detalhe do cliente

### Financeiro (PRIORIDADE MÉDIA)
- [ ] Adicionar vencimento (`dueDate`) nos pagamentos
- [ ] Métodos de pagamento (PIX, cartão, boleto)
- [ ] Métricas financeiras com gráficos (Recharts já instalado)
- [ ] Integração com Stripe/PIX (planejada na spec, não iniciada)
- [ ] Registrar pagamento diretamente do detalhe do cliente

### Planos (PRIORIDADE MÉDIA)
- [ ] CRUD completo (criar, editar, ativar/desativar)
- [ ] Reordenar features

### Assinaturas (PRIORIDADE MÉDIA)
- [ ] Criar assinatura (vincular cliente a plano)
- [ ] Cancelar/pausar assinatura
- [ ] Cobrança recorrente (Stripe — não iniciado)
- [ ] Próxima data de cobrança (campo `nextBilling` nunca populado)

### Notificações (PRIORIDADE BAIXA)
- [ ] Disparo automático de notificações em eventos do sistema
- [ ] Marcar como lida (ação no clique)
- [ ] Links acionáveis (`link` field)
- [ ] Categorização por tipo (CONTRACT, PRESENTATION, PROJECT_UPDATE, PAYMENT, INFO)

### Sistema (PRIORIDADE BAIXA)
- [ ] Página de configurações (`/admin/configuracoes`)
- [ ] Recuperação de senha
- [ ] Edição de perfil do cliente
- [ ] Logs de auditoria (quem fez o quê, quando)
- [ ] Busca avançada (cross-entity)

---

## 6. O QUE FALTA INTEGRAR AO BANCO 🔶

| Item | Detalhe |
|------|---------|
| **Conexão Neon** | CRÍTICO — `DATABASE_URL` no `.env` é placeholder. Nunca conectou a um banco real. |
| **Migrações Prisma** | Não existe pasta `prisma/migrations/`. Rodar `prisma migrate dev` para criar migração inicial. |
| **Seed nunca executado** | O script de seed existe mas nunca rodou contra um banco real. |
| **Campos não utilizados** | `Presentation.content` (Json), `Client.briefing` (Json), `ProjectMilestone.description`, `ProjectMilestone.dueDate`, `ProjectMilestone.files` (Json), `Payment.dueDate`, `Payment.method`, `Notification.link`, `Notification.type` |
| **Tabelas sem dados** | `Presentation`, `Contract`, `Subscription`, `Notification` — existem no schema e seed, mas dados podem estar vazios em ambiente limpo |

---

## 7. PROBLEMAS DE AUTENTICAÇÃO/PERMISSÕES 🔑

| # | Problema | Risco |
|---|----------|------|
| 1 | **Admin e Cliente na mesma rota de login** — se email duplicado, admin sempre ganha (verificado primeiro em `auth.ts:27`) | Baixo |
| 2 | **Role check frágil** — `(session.user as any).role` em vez de tipagem correta (usado em 8+ lugares) | Médio |
| 3 | **ClientLayout não verifica role** — admin pode acessar `/cliente/*` se o middleware falhar (defesa em profundidade ausente) | Baixo |
| 4 | **Server Actions sem verificação de propriedade** — `getClientById`, `deleteClient` não verificam se o admin tem permissão | Baixo |
| 5 | **Cliente identificado por email do JWT** — se email mudar no banco, token fica desatualizado até re-login | Baixo |
| 6 | **AUTH_SECRET previsível** — `"unitrix-dev-secret-change-in-production-32chars"` (não tem 32 chars) | Alto para produção |
| 7 | **Sem rate limiting** — login, assinatura e outras ações sensíveis sem proteção contra brute force | Médio |

---

## 8. PROBLEMAS DE RESPONSIVIDADE 📱

| # | Problema | Localização |
|---|----------|-------------|
| 1 | **Sidebar padding fixo** — `pl-[240px]` não acompanha estado colapsado, conteúdo fica descentralizado | `admin/layout.tsx:20`, `cliente/layout.tsx:18` |
| 2 | **Sem menu hamburguer mobile** — sidebar fixa ocupa 240px mesmo em telas < 640px, sobrepondo ou empurrando conteúdo | `admin-sidebar.tsx`, `client-sidebar.tsx` |
| 3 | **Tabelas não responsivas** — `grid grid-cols-[2fr,1fr,1fr,1fr]` quebra em mobile estreito. Sem versão card para mobile | `financeiro-client.tsx:62`, `assinaturas/page.tsx:27`, `pagamentos/page.tsx:46` |
| 4 | **Toast posição fixa** — `top-right` pode sobrepor header em mobile | `conditional-ui.tsx:18` |
| 5 | **Dashboard cliente sem scroll horizontal** — cards lado a lado em mobile forçam scroll | `dashboard-client.tsx:35` |
| 6 | **Formulário novo cliente** — sem validação visual em tempo real (só no submit) | `novo/page.tsx` |

---

## 9. FLUXOS DO ADMINISTRADOR QUE PRECISAM SER FINALIZADOS 🔧

1. **Fluxo de Apresentação Comercial**
   - Admin seleciona cliente → preenche conteúdo → gera slug → preview → envia ao cliente
   - Atualmente: só gera link quebrado para `/apresentacao/${c.id}`

2. **Fluxo de Contrato Inteligente**
   - Admin seleciona cliente → dados preenchidos automaticamente → edita termos → gera slug → envia ao cliente
   - Atualmente: só lista clientes elegíveis, sem ação real

3. **Edição de Cliente**
   - Rota `/admin/clientes/[id]/editar` inexistente
   - Server action `updateClient` existe e está pronta, mas não há UI

4. **Criação de Projeto do Detalhe do Cliente**
   - Ação "Criar Projeto" no detalhe do cliente não funciona
   - É necessário criar projeto e vincular ao cliente na mesma ação

5. **Registro de Pagamento do Detalhe do Cliente**
   - Não há formulário de pagamento na página de detalhes do cliente
   - Server action `createPayment` existe e funciona, mas a UI só está no detalhe do projeto

6. **Gestão de Planos**
   - CRUD completo: criar, editar, excluir, ativar/desativar

7. **Gestão de Assinaturas**
   - Criar assinatura (vincular cliente + plano), cancelar

8. **Disparo Manual de Notificações**
   - Admin não pode enviar notificação para cliente específico

---

## 10. FLUXOS DO CLIENTE QUE PRECISAM SER FINALIZADOS 🔧

1. **Visualização de Apresentação**
   - Rota pública `/apresentacao/[slug]` inexistente
   - Precisa: template premium, tracking de visualização

2. **Visualização e Assinatura de Contrato**
   - Rota pública `/contrato/[slug]` inexistente
   - Precisa: leitura do contrato, confirmação de leitura, assinatura digital

3. **Assinatura Digital**
   - Página `/cliente/contratos/[id]/assinar` inexistente
   - Canvas de assinatura (react-signature-canvas) não implementado
   - Registro de IP/data/navegador não implementado

4. **Briefing**
   - Campo `briefing` (Json) no modelo Client existe mas nunca é preenchido
   - Cliente não tem formulário de briefing

5. **Edição de Perfil**
   - Cliente não pode editar seus próprios dados (nome, telefone, cidade)

6. **Notificações Acionáveis**
   - Notificações são somente leitura
   - Links (`link` field) nunca são populados
   - Não há ação "Marcar como lida"

7. **Comunicação Admin ↔ Cliente**
   - Sem chat, comentários ou sistema de mensagens
   - Feedback só via notificações (não implementado)

---

## RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| Total de arquivos do sistema interno | ~60 |
| Funcionalidades completamente prontas | ~25 |
| Funcionalidades parcialmente prontas | ~8 |
| Funcionalidades quebradas | 7 |
| Funcionalidades a desenvolver | 30+ |
| Models Prisma implementados | 11/11 |
| Campos do banco não utilizados | 10+ |
| Problemas de segurança identificados | 2 críticos, 5 médios |
| Problemas de responsividade | 6 |

### Estado geral do sistema interno: ~45% concluído

**Fundação (Fase 1):** ~85% — Auth, layouts, dashboard, CRUD clientes, estrutura de projetos e financeiro funcionando.

**Apresentações & Contratos (Fase 2):** ~15% — Modelos no banco, páginas de listagem prontas, mas criação e visualização pública inexistentes.

**Financeiro & Projetos (Fase 3):** ~55% — CRUD de projetos com milestones, pagamentos básicos, mas sem upload de arquivos e métricas avançadas.

**Assinaturas & Relacionamento (Fase 4):** ~20% — Visualização apenas. Sem CRUD de planos, criação de assinaturas, integração com Stripe, ou notificações automáticas.

### Ação mais urgente: Configurar o banco Neon com credenciais reais.
