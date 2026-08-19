# AUDITORIA DO SEED — FASE 1, UNITRIX HUB

**Data:** 2026-08-10
**Arquivo:** prisma/seed.ts (196 linhas)
**Status:** Encontrado 1 problema estrutural.

---

## 1. REGISTROS PREVISTOS

| # | Entidade | Quantidade | Estrategia |
|---|----------|------------|------------|
| 1 | Admin (User) | 1 | upsert por email |
| 2 | Clientes (Client) | 5 | upsert por email |
| 3 | Projetos (Project) | 2 | create (sem upsert) |
| 4 | Milestones (ProjectMilestone) | 6 | createMany (sem upsert) |
| 5 | Pagamentos (Payment) | 3 | createMany + create (sem upsert) |
| 6 | Planos (Plan) | 5 | upsert por ID deterministico |

### Detalhamento

**Admin (1):**
- Email: do .env (ADMIN_EMAIL) ou fallback hardcoded
- Nome: "Unitrix Admin"
- Role: ADMIN
- Senha: do .env (ADMIN_PASSWORD) ou fallback hardcoded, depois bcrypt hash cost 12

**Clientes (5):**
- Ricardo Almeida / Fintech Pro — SaaS, R$45.000, IN_PROGRESS
- Marina Costa / Clinica Vida — Sistema Web, R$28.000, CONTRACTED
- Pedro Santos / EduTech Brasil — App Mobile, R$65.000, PROPOSAL_SENT
- Ana Oliveira / Green E-commerce — E-commerce, R$35.000, LEAD
- Carlos Mendes / LogPro Sistemas — ERP, R$120.000, COMPLETED
- Senha: todos usam "cliente123", depois bcrypt hash cost 12

**Projetos (2):**
- "Fintech Pro — Plataforma SaaS" vinculado a Ricardo, 35% progresso, IN_PROGRESS
- "Clinica Vida — Sistema de Gestao" vinculado a Marina, 0% progresso, PLANNING

**Milestones (6, todos do projeto Fintech):**
- Planejamento e Discovery (COMPLETED)
- Design UI/UX (COMPLETED)
- Desenvolvimento Backend (IN_PROGRESS)
- Desenvolvimento Frontend (PENDING)
- Testes e QA (PENDING)
- Deploy e Entrega (PENDING)

**Pagamentos (3):**
- Fintech: Entrada 50% R$22.500 (PAID) + Saldo Final 50% R$22.500 (PENDING)
- Clinica Vida: Entrada 50% R$14.000 (PENDING)

**Planos (5):**
- Landing Page — R$3.500
- Site Institucional — R$6.500
- Sistema Web — R$15.000
- SaaS — R$35.000
- Hospedagem + Suporte — R$497/mes

---

## 2. ANALISE DE SEGURANCA

| Item | Status |
|------|--------|
| Senha admin hasheada | OK — bcrypt cost 12 |
| Senhas clientes hasheadas | OK — bcrypt cost 12 |
| Email admin em fallback hardcoded | ATENCAO — hardcoded na linha 10 |
| Senha admin em fallback hardcoded | ATENCAO — hardcoded na linha 11 |
| Senha clientes hardcoded | ATENCAO — hardcoded nas linhas 38,50,62,74,86 |

Nenhum dado sensivel novo — esses valores ja existem no .env e no codigo. O seed prioriza as variaveis de ambiente (process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD) e so usa os fallbacks se elas nao existirem. As senhas sao hasheadas com bcrypt cost 12 antes de irem para o banco. Nenhum hash ou segredo trafega em texto plano para o banco de dados.

---

## 3. ANALISE DE IDEMPOTENCIA

| Entidade | Estrategia | Idempotente? |
|----------|------------|---------------|
| User (admin) | upsert — where: { email } | SIM |
| Client (5x) | upsert — where: { email } | SIM |
| Project (2x) | create | NAO |
| ProjectMilestone (6x) | createMany | NAO |
| Payment (3x) | createMany + create | NAO |
| Plan (5x) | upsert — where: { id: "seed-..." } | SIM |

### Problema: projetos, milestones e pagamentos nao sao idempotentes

Executar o seed uma segunda vez criara duplicatas:

- 2 projetos extras (total: 4)
- 6 milestones extras (total: 12)
- 3 pagamentos extras (total: 6)

Admin, clientes e planos usam upsert e sao seguros contra reexecucao — encontrando um registro pelo identificador unico (email ou ID deterministico), apenas atualizam (update vazio) sem duplicar.

Projetos, milestones e pagamentos usam create / createMany sem verificacao previa de existencia. Nao ha campo unico nesses modelos que permita upsert direto (projetos nao tem slug, milestones e pagamentos nao tem identificador natural unico alem do ID gerado).

### Recomendacao de correcao

Para tornar projetos idempotentes, adicionar verificacao findFirst antes do create:

```
const existing = await prisma.project.findFirst({
  where: { clientId: fintechClient.id, title: "Fintech Pro — Plataforma SaaS" }
});
if (!existing) { ... criar projeto, milestones e payments ... }
```

---

## 4. RELACIONAMENTOS

| Relacao | Origem | Destino | Correto? |
|---------|--------|---------|-----------|
| createdById | Client -> User | admin.id (do upsert) | SIM |
| createdById | Plan -> User | admin.id (do upsert) | SIM |
| clientId | Project -> Client | fintechClient / clinicaClient | SIM |
| projectId | Milestone -> Project | project.id (do create) | SIM |
| clientId | Payment -> Client | fintechClient / clinicaClient | SIM |
| projectId | Payment -> Project | project.id (do create) | SIM |

Todos os relacionamentos batem com o schema.prisma. Nenhum campo obrigatorio faltando.

---

## 5. COMPATIBILIDADE COM SCHEMA

Todos os campos usados no seed existem no schema.prisma atual. Tipos compativeis (Decimal como number, DateTime como Date, Json como string JSON.stringify). Nenhum campo inexistente.

---

## 6. RESUMO FINAL

| Item | Status |
|------|--------|
| Seed analisado | OK |
| Registros previstos | 1 admin + 5 clientes + 2 projetos + 6 milestones + 3 payments + 5 planos |
| Senha/hash | OK — bcrypt cost 12 em todas |
| Idempotencia | PARCIAL — admin/clientes/planos sim, projetos/milestones/payments nao |
| Relacionamentos | OK — todos corretos |
| Compatibilidade com schema | OK — 100% compativel |
| Dados sensiveis | ATENCAO — fallbacks hardcoded (mas ja existentes no .env) |
| Problemas encontrados | 1 — projetos, milestones e pagamentos duplicam ao reexecutar o seed |

---

## PROBLEMA ENCONTRADO

**Projetos, milestones e pagamentos NAO sao idempotentes.** Executar o seed uma segunda vez criara duplicatas desses registros. Admin, clientes e planos usam upsert e sao seguros.

**Impacto:** Baixo para primeiro uso (banco vazio). Moderado se o seed for reexecutado apos uso real do sistema.

---

## COMANDO RECOMENDADO

```
npx tsx prisma/seed.ts
```

Pronto para executar. O seed criara todos os registros corretamente na primeira execucao. Apenas evite reexecutar sem antes limpar os registros nao-idempotentes (projetos, milestones, pagamentos).

---

**Auditoria concluida. Aguardando sua autorizacao para executar o seed ou para corrigir a idempotencia.**
