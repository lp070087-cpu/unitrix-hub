# DIAGNOSTICO DE CONEXAO — FASE 1, NEON/PRISMA

**Data:** 2026-08-10
**Escopo:** Verificacao de conectividade entre Unitrix Hub e Neon PostgreSQL.
**Regras:** Somente leitura e diagnostico. Nenhuma migration, push, ou seed.

---

## 1. VERIFICACAO DO .ENV

| Variavel | Status |
|----------|--------|
| DATABASE_URL | Configurada — credenciais reais, host com pooler |
| DIRECT_URL | Configurada — credenciais reais, host direto (sem pooler) |
| AUTH_SECRET | Placeholder de dev (aceitavel para esta etapa) |

**Confirmado:** A DIRECT_URL foi atualizada. O host agora e `ep-rough-night-acsaqxdk.sa-east-1.aws.neon.tech` (sem `-pooler`), usando mesmo banco (`neondb`), mesmo usuario (`neondb_owner`) e mesma regiao (`sa-east-1`) da DATABASE_URL. A estrutura esta correta.

```
DATABASE_URL (pooler):    ...@ep-rough-night-acsaqxdk-pooler.sa-east-1.../neondb
DIRECT_URL (direta):      ...@ep-rough-night-acsaqxdk.sa-east-1.../neondb
```

Diferenca unica: remocao de `-pooler.` — exatamente o esperado.

---

## 2. VERIFICACAO DO PRISMA SCHEMA

| Item | Status |
|------|--------|
| Provider | postgresql — correto |
| DATABASE_URL | Aponta para env("DATABASE_URL") — correto |
| DIRECT_URL | Aponta para env("DIRECT_URL") — correto |
| 10 modelos | Definidos |
| Relacionamentos | Todos validos |
| Constraints | 4 campos @unique (User.email, Client.email, Presentation.slug, Contract.slug) |

---

## 3. TESTE DE CONEXAO — SANDBOX

**Resultado: NAO EXECUTAVEL NO SANDBOX**

O ambiente sandbox do Claude tem restricoes de rede que impedem conexoes externas. Foram tentadas 3 abordagens:

| Tentativa | Comando | Resultado |
|-----------|---------|-----------|
| prisma db pull --print | Conexao Prisma de leitura | Timeout (bloqueio de rede) |
| TCP /dev/tcp para porta 5432 | Conexao crua PostgreSQL | DNS failure (resolucao de nomes bloqueada) |
| PrismaClient.$connect() via Node | Driver Prisma | Erro de binary engine (Windows vs Linux) |

**Nenhum desses erros e do Neon ou da configuracao.** Sao limitacoes conhecidas do sandbox:
- DNS externo bloqueado — nomes como `aws.neon.tech` nao resolvem
- Binarios do Prisma compilados para Windows (`.dll.node`) — sandbox roda Linux
- Conexoes TCP para portas externas sao restritas

---

## 4. TESTE DE CONEXAO — RECOMENDACAO LOCAL

O teste real deve ser executado no seu computador (Windows), onde o projeto foi desenvolvido. Execute:

```
npx prisma db pull --print
```

**O que este comando faz:**
- Conecta ao Neon via DIRECT_URL (somente leitura)
- Le o schema atual do banco (vazio, sem tabelas)
- Imprime o schema que seria gerado (sem modificar nada)
- Se a conexao falhar, mostrara o erro especifico

**Resultados esperados:**

- Se retornar um schema Prisma (models), a conexao esta OK
- Se retornar "The database does not contain any models yet", a conexao esta OK e o banco esta vazio (esperado, pois nunca rodamos migration)
- Se retornar erro de autenticacao, a senha ou usuario estao incorretos
- Se retornar erro de timeout/host, o endpoint ou firewall esta bloqueando
- Se retornar erro de SSL, o parametro sslmode precisa de ajuste

---

## 5. RESULTADO FINAL

### STATUS DA CONEXAO NEON/PRISMA

| Item | Status |
|------|--------|
| DATABASE_URL detectada | SIM — configurada com credenciais reais |
| DIRECT_URL detectada | SIM — configurada com credenciais reais |
| Prisma configurado | SIM — schema validado, datasource correto |
| Conexao com Neon (sandbox) | NAO TESTAVEL — restricoes de rede do ambiente |
| Conexao com Neon (local) | PENDENTE — execute o comando abaixo |

---

## PROXIMA ACAO

Execute **localmente** no seu terminal (na pasta do projeto):

```
npx prisma db pull --print
```

E me diga o resultado. Se a conexao funcionar, estaremos prontos para criar a primeira migration.

**Nenhuma alteracao foi feita no projeto. Migration bloqueada. Aguardando resultado do teste local.**
