// Fluxos completos via navegador (Playwright) contra servidor local + banco de teste local.
// Uso: BASE_URL=http://localhost:3100 node tests/flows.mjs
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || "playwright");
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL || "http://localhost:3100";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || "")) { console.error("Recusado: banco local apenas."); process.exit(1); }
const prisma = new PrismaClient();
const RUN = Date.now().toString(36);
let pass = 0, fail = 0;
const ok = (n, c, x = "") => { c ? pass++ : fail++; console.log(`${c ? "✔" : "✘"} ${n}${c ? "" : " " + x}`); };
const step = async (name, fn) => { try { await fn(); } catch (e) { ok(name, false, e.message.split("\n")[0]); } };

const browser = await chromium.launch();
async function ctxFor(email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/auth/login");
  await p.fill('input[type="email"]', email);
  await p.fill('input[type="password"]', "Teste#12345");
  await Promise.all([p.waitForURL(/\/(admin|cliente)/), p.click('button[type="submit"]')]);
  return { ctx, p };
}
const field = (p, label) => p.locator(`label:has-text("${label}")`).locator("xpath=following::*[self::input or self::select or self::textarea][1]").first();
const toast = (p, re) => p.locator("[data-sonner-toast]").filter({ hasText: re }).first().waitFor({ timeout: 15000 });

const A = await prisma.client.findUnique({ where: { email: "cliente-a@teste.local" } });

// 1. Lead pelo site
await step("lead", async () => {
  const ctx = await browser.newContext(); const p = await ctx.newPage();
  await p.goto(BASE + "/#orcamento");
  await p.waitForTimeout(3500);
  await p.fill('[name="name"]', "Lead Teste " + RUN);
  await p.fill('[name="company"]', "Empresa Lead");
  await p.fill('[name="whatsapp"]', "(81) 99999-0000");
  await p.fill('[name="email"]', `lead-${RUN}@teste.local`);
  await p.selectOption('[name="projectType"]', { index: 1 });
  await p.fill('textarea[name="description"]', "Preciso de um sistema de agendamento com painel administrativo. " + RUN);
  await p.locator('#orcamento button[type="submit"], form button[type="submit"]').last().click();
  await p.waitForTimeout(2500);
  const lead = await prisma.lead.findFirst({ where: { email: `lead-${RUN}@teste.local` } });
  ok("Lead persistido pelo formulário do site", !!lead);
  const notif = await prisma.notification.findFirst({ where: { audience: "ADMIN", type: "LEAD" }, orderBy: { createdAt: "desc" } });
  ok("Notificação admin de novo lead", !!notif);
  await ctx.close();
});

const { p: ad } = await ctxFor("admin@teste.local");

// 2. Admin vê lead
await step("lead admin", async () => {
  await ad.goto(BASE + "/admin/solicitacoes");
  ok("Lead visível em /admin/solicitacoes", await ad.getByText("Lead Teste " + RUN).isVisible());
});

// 3. Criar projeto 50/50
let project;
await step("projeto", async () => {
  await ad.goto(BASE + "/admin/projetos");
  await ad.getByRole("button", { name: "Novo projeto" }).click();
  const dlg = ad.getByRole("dialog");
  await field(dlg, "Cliente").selectOption(A.id);
  await field(dlg, "Título").fill("Projeto E2E " + RUN);
  await field(dlg, "Início").fill("2026-11-01");
  await field(dlg, "Entrega prevista").fill("2026-12-20");
  await field(dlg, "Valor total").fill("10000");
  await dlg.getByRole("button", { name: "Criar projeto" }).click();
  await ad.waitForTimeout(2500);
  project = await prisma.project.findFirst({ where: { title: "Projeto E2E " + RUN }, include: { payments: true, delivery: true } });
  ok("Projeto criado", !!project);
  ok("Cobranças 50/50 geradas (2 × 5000)", project?.payments.length === 2 && project.payments.every((x) => Number(x.amount) === 5000), JSON.stringify(project?.payments.map((x) => [x.type, x.amount])));
  ok("Entrega inicia bloqueada", project?.delivery?.status === "BLOCKED");
});

// 4. Contrato: criar, enviar, assinar como cliente
let contract;
await step("contrato", async () => {
  await ad.goto(BASE + `/admin/contratos/novo?clientId=${A.id}&projectId=${project.id}`);
  await ad.fill("#title", "Contrato E2E " + RUN);
  await ad.fill("#scope", "Desenvolvimento de plataforma web com painel administrativo.");
  if (!(await ad.inputValue("#value"))) await ad.fill("#value", "10000");
  if (!(await ad.inputValue("#deadline"))) await ad.fill("#deadline", "2026-12-20");
  await ad.locator('button[type="submit"]').last().click();
  await ad.waitForURL(/\/admin\/contratos\/(?!novo)[^/]+/, { timeout: 15000 });
  contract = await prisma.contract.findFirst({ where: { title: "Contrato E2E " + RUN } });
  ok("Contrato criado com snapshot", !!contract?.contentSnapshot && contract.status === "DRAFT");
  await ad.getByRole("button", { name: /Enviar/ }).first().click();
  const confirmBtn = ad.getByRole("dialog").getByRole("button", { name: /Enviar|Confirmar/ });
  if (await confirmBtn.count()) await confirmBtn.first().click();
  await ad.waitForTimeout(2000);
  contract = await prisma.contract.findUnique({ where: { id: contract.id } });
  ok("Contrato enviado (SENT)", contract.status === "SENT", contract.status);
});

const { ctx: cbx, p: cb } = await ctxFor("cliente-b@teste.local");
await step("idor contrato", async () => {
  const r = await cb.goto(BASE + `/contrato/${contract.slug}`);
  ok("Cliente B não acessa contrato de A", r.status() === 404, String(r.status()));
});

const { p: ca } = await ctxFor("cliente-a@teste.local");
await step("assinatura", async () => {
  await ca.goto(BASE + `/contrato/${contract.slug}`);
  const panel = ca.locator('section[aria-labelledby="assinar"]');
  await panel.scrollIntoViewIfNeeded();
  const boxes = panel.locator('input[type="checkbox"], button[role="checkbox"]');
  const n = await boxes.count();
  for (let i = 0; i < n; i++) { await boxes.nth(i).click(); await ca.waitForTimeout(700); }
  const texts = panel.locator('input:not([type="checkbox"]):not([type="hidden"])');
  await texts.nth(0).fill("Cliente A da Silva");
  await texts.nth(1).fill("529.982.247-25");
  const canvas = panel.locator("canvas");
  const b = await canvas.boundingBox();
  await ca.mouse.move(b.x + 20, b.y + 30); await ca.mouse.down();
  for (let i = 1; i < 25; i++) await ca.mouse.move(b.x + 20 + i * 10, b.y + 30 + Math.sin(i) * 20);
  await ca.mouse.up();
  await panel.getByRole("button", { name: /Assinar/ }).last().click();
  await ca.waitForTimeout(3000);
  const c = await prisma.contract.findUnique({ where: { id: contract.id }, include: { events: true } });
  ok("Contrato assinado com evidências (hash, IP, UA, data)", c.status === "SIGNED" && !!c.signatureHash && !!c.signatureIp && !!c.signedAt && !!c.readConfirmedAt && !!c.termsAcceptedAt, `${c.status}`);
  ok("Eventos de auditoria registrados", ["CREATED", "SENT", "VIEWED", "SIGNED"].every((a) => c.events.some((e) => e.action === a)), c.events.map((e) => e.action).join(","));
});

// 5. Briefing: admin cria, cliente preenche e envia, admin solicita ajuste e aprova
let briefing;
await step("briefing", async () => {
  await ad.goto(BASE + "/admin/briefings");
  await ad.getByRole("button", { name: /Novo briefing|Criar briefing/ }).first().click();
  const dlg = ad.getByRole("dialog");
  await field(dlg, "Cliente").selectOption(A.id);
  await ad.waitForTimeout(400);
  const proj = field(dlg, "Projeto");
  if (await proj.count()) await proj.selectOption(project.id).catch(() => {});
  await field(dlg, "Título").fill("Briefing E2E " + RUN);
  await dlg.getByRole("button", { name: "Criar briefing" }).click();
  await ad.waitForTimeout(2500);
  briefing = await prisma.briefing.findFirst({ where: { title: "Briefing E2E " + RUN } });
  ok("Briefing criado pelo admin", !!briefing);
  // cliente preenche diretamente os campos obrigatórios via wizard
  await ca.goto(BASE + `/cliente/briefing/${briefing.id}`);
  const fills = { "Nome da empresa / marca": "Empresa A", "Objetivo principal": "Aumentar vendas online", "Público-alvo": "Pequenas empresas" };
  for (let s = 0; s < 6; s++) {
    const kind = ca.getByLabel("Tipo de projeto", { exact: true }); if (await kind.isVisible().catch(() => false)) await kind.selectOption({ index: 1 });
    for (const [k, v] of Object.entries(fills)) { const el = ca.getByLabel(k, { exact: true }); if (await el.isVisible().catch(() => false)) await el.fill(v); }
    const next = ca.getByRole("button", { name: /Próxima etapa/ });
    if (await next.count()) { await next.first().click(); await ca.waitForTimeout(400); } else break;
  }
  await ca.getByRole("button", { name: /Enviar para análise/ }).first().click();
  const conf = ca.getByRole("button", { name: "Confirmar envio" }); if (await conf.count()) await conf.click();
  await ca.waitForTimeout(2500);
  briefing = await prisma.briefing.findUnique({ where: { id: briefing.id } });
  ok("Cliente enviou briefing (SUBMITTED)", briefing.status === "SUBMITTED", briefing.status);
  await ad.goto(BASE + `/admin/briefings/${briefing.id}`);
  await ad.getByRole("button", { name: /Solicitar ajustes/ }).first().click();
  await field(ad.getByRole("dialog"), "O que precisa ser ajustado").fill("Detalhar as integrações desejadas.");
  await ad.getByRole("dialog").getByRole("button", { name: /Solicitar|Enviar/ }).last().click();
  await ad.waitForTimeout(2000);
  briefing = await prisma.briefing.findUnique({ where: { id: briefing.id } });
  ok("Admin solicitou ajustes (REVISION_REQUESTED)", briefing.status === "REVISION_REQUESTED", briefing.status);
  await ca.goto(BASE + `/cliente/briefing/${briefing.id}`);
  ok("Cliente vê nota de ajuste", (await ca.getByText("Detalhar as integrações").count()) > 0);
  for (let i = 0; i < 6; i++) { const nx = ca.getByRole("button", { name: /Próxima etapa/ }); if (await nx.count()) { await nx.first().click(); await ca.waitForTimeout(300); } else break; }
  await ca.getByRole("button", { name: /Enviar para análise/ }).first().click();
  await ca.getByRole("button", { name: "Confirmar envio" }).click();
  await ca.waitForTimeout(2500);
  await ad.reload();
  await ad.getByRole("button", { name: /Aprovar/ }).first().click();
  const c2 = ad.getByRole("dialog").getByRole("button", { name: /Aprovar|Confirmar/ }); if (await c2.count()) await c2.last().click();
  await ad.waitForTimeout(2000);
  briefing = await prisma.briefing.findUnique({ where: { id: briefing.id } });
  ok("Admin aprovou briefing", briefing.status === "APPROVED", briefing.status);
});

// 6. Timeline + pagamentos + entrega
await step("entrega", async () => {
  await ad.goto(BASE + `/admin/projetos/${project.id}`);
  for (const t of ["Design", "Desenvolvimento"]) {
    await ad.getByRole("button", { name: /^Etapa$|Nova etapa|Adicionar etapa/ }).first().click();
    const dlg = ad.getByRole("dialog");
    await field(dlg, "Título").fill(t);
    await dlg.locator('button[type="submit"]').last().click();
    await ad.waitForTimeout(1500);
  }
  const ms = await prisma.projectMilestone.count({ where: { projectId: project.id } });
  ok("Etapas adicionadas à timeline", ms === 2, String(ms));

  // tentar liberar entrega antes da quitação
  const pays = await prisma.payment.findMany({ where: { projectId: project.id }, orderBy: { type: "asc" } });
  await field(ad, "Link da entrega").fill("https://exemplo.teste/entrega");
  await ad.getByRole("button", { name: "Salvar entrega" }).click();
  await ad.waitForTimeout(1500);
  const lib = ad.getByRole("button", { name: /Liberar entrega/ });
  ok("Botão de liberação desabilitado antes da quitação", (await lib.count()) === 0 || await lib.first().isDisabled());
  let d = await prisma.delivery.findUnique({ where: { projectId: project.id } });
  ok("Entrega NÃO liberada sem quitação", d.status !== "RELEASED", d.status);

  // confirmar os 2 pagamentos (duplo clique no primeiro)
  for (let i = 0; i < 2; i++) {
    await ad.reload();
    const btn = ad.getByRole("button", { name: "Confirmar pagamento" }).first();
    await btn.click();
    const dlg = ad.getByRole("dialog");
    const go = dlg.getByRole("button", { name: "Confirmar recebimento" });
    await go.dblclick();
    await ad.waitForTimeout(2000);
  }
  const paid = await prisma.payment.findMany({ where: { projectId: project.id } });
  ok("Entrada e saldo confirmados (sem duplicar)", paid.length === 2 && paid.every((x) => x.status === "PAID"), JSON.stringify(paid.map((x) => x.status)));

  await ad.reload();
  const sel = field(ad, "Situação"); if (await sel.count()) { await sel.selectOption("READY"); await ad.getByRole("button", { name: "Salvar entrega" }).click(); await ad.waitForTimeout(1500); await ad.reload(); }
  ad.once("dialog", (d) => d.accept());
  await ad.getByRole("button", { name: /Liberar entrega/ }).first().click();
  await ad.waitForTimeout(2000);
  d = await prisma.delivery.findUnique({ where: { projectId: project.id } });
  const pr = await prisma.project.findUnique({ where: { id: project.id } });
  ok("Entrega liberada após quitação → projeto DELIVERED", d.status === "RELEASED" && pr.status === "DELIVERED", `${d.status}/${pr.status}`);
  const r = await ca.goto(BASE + `/cliente/projetos/${project.id}`);
  ok("Cliente A vê entrega liberada", r.status() === 200 && (await ca.locator('a[href*="exemplo.teste"]').count()) > 0);
  const rb = await cb.goto(BASE + `/cliente/projetos/${project.id}`);
  ok("Cliente B não vê projeto de A", rb.status() === 404);
});

// 7. Plano → assinatura → mensalidade → pagamento → próxima cobrança
await step("assinatura", async () => {
  await ad.goto(BASE + "/admin/planos");
  await ad.getByRole("button", { name: "Novo plano" }).first().click();
  const dlg = ad.getByRole("dialog");
  await field(dlg, "Nome").fill("Plano E2E " + RUN);
  await field(dlg, "Preço").fill("497");
  await dlg.locator('button[type="submit"]').last().click();
  await ad.waitForTimeout(2000);
  const plan = await prisma.plan.findFirst({ where: { name: "Plano E2E " + RUN } });
  ok("Plano criado", !!plan);

  await ad.goto(BASE + "/admin/assinaturas");
  await ad.getByRole("button", { name: "Nova assinatura" }).first().click();
  const d2 = ad.getByRole("dialog");
  await field(d2, "Cliente").selectOption(A.id);
  await field(d2, "Plano").selectOption(plan.id);
  const today = new Date().toISOString().slice(0, 10);
  await field(d2, "Início").fill(today);
  await d2.getByRole("button", { name: "Criar assinatura" }).click();
  await ad.waitForTimeout(2000);
  let sub = await prisma.subscription.findFirst({ where: { planId: plan.id } });
  ok("Assinatura criada com próxima cobrança", !!sub?.nextBilling);
  const before = sub.nextBilling;

  await ad.reload();
  const gen = ad.getByRole("button", { name: /Gerar cobrança/ }).first();
  await gen.click(); await ad.waitForTimeout(1500);
  await ad.reload();
  const gen2 = ad.getByRole("button", { name: /Gerar cobrança/ }).first();
  if (await gen2.count()) { await gen2.click(); await ad.waitForTimeout(1500); }
  const charges = await prisma.payment.findMany({ where: { subscriptionId: sub.id } });
  ok("Mensalidade gerada uma única vez (idempotente)", charges.length === 1, String(charges.length));

  await ad.goto(BASE + `/admin/financeiro?tipo=SUBSCRIPTION`);
  await ad.goto(BASE + `/admin/financeiro`);
  const row = ad.locator(`text=${charges[0].description}`).first();
  ok("Mensalidade aparece no financeiro", (await row.count()) > 0);
  await prisma.$disconnect;
  // confirmar pela UI do financeiro
  const btns = ad.getByRole("button", { name: "Confirmar pagamento" });
  const nb = await btns.count();
  for (let i = 0; i < nb; i++) {
    const tr = btns.nth(i).locator("xpath=ancestor::*[self::tr or self::li or self::article][1]");
    if ((await tr.innerText()).includes(charges[0].description)) { await btns.nth(i).click(); break; }
  }
  await ad.getByRole("dialog").getByRole("button", { name: "Confirmar recebimento" }).click();
  await ad.waitForTimeout(2000);
  const p1 = await prisma.payment.findUnique({ where: { id: charges[0].id } });
  sub = await prisma.subscription.findUnique({ where: { id: sub.id } });
  ok("Mensalidade paga", p1.status === "PAID", p1.status);
  ok("Próxima cobrança avançou", sub.nextBilling > before, `${before?.toISOString()} → ${sub.nextBilling?.toISOString()}`);
  const r = await ca.goto(BASE + "/cliente/mensalidades");
  ok("Cliente vê mensalidade", r.status() === 200 && (await ca.getByText("Plano E2E " + RUN).count()) > 0);
});

// 8. Apresentação: criar, enviar, público, aceite
await step("apresentacao", async () => {
  await ad.goto(BASE + "/admin/apresentacoes");
  await ad.getByRole("button", { name: /Nova apresentação/ }).first().click();
  const dlg = ad.getByRole("dialog");
  await field(dlg, "Cliente").selectOption(A.id);
  await field(dlg, "Título").fill("Proposta E2E " + RUN);
  await dlg.getByRole("button", { name: "Criar e editar" }).click();
  await ad.waitForURL(/\/admin\/apresentacoes\/[^/]+$/, { timeout: 15000 });
  let pres = await prisma.presentation.findFirst({ where: { title: "Proposta E2E " + RUN } });
  const anon = await (await browser.newContext()).newPage();
  let r = await anon.goto(BASE + `/apresentacao/${pres.slug}`);
  ok("Rascunho não é público", r.status() === 404, String(r.status()));
  await ad.getByRole("button", { name: /Enviar/ }).first().click();
  const c = ad.getByRole("dialog").getByRole("button", { name: /Enviar|Confirmar/ }); if (await c.count()) await c.last().click();
  await ad.waitForTimeout(2000);
  pres = await prisma.presentation.findUnique({ where: { id: pres.id } });
  ok("Apresentação enviada", pres.status === "SENT", pres.status);
  r = await anon.goto(BASE + `/apresentacao/${pres.slug}`);
  ok("Apresentação pública acessível pelo link", r.status() === 200);
  await ca.goto(BASE + `/apresentacao/${pres.slug}`);
  const ap = ca.getByRole("button", { name: /Aprovar/ });
  if (await ap.count()) { await ap.first().click(); const cc = ca.getByRole("dialog").getByRole("button", { name: /Aprovar|Confirmar/ }); if (await cc.count()) await cc.last().click(); await ca.waitForTimeout(2000); }
  pres = await prisma.presentation.findUnique({ where: { id: pres.id } });
  ok("Cliente aprovou a apresentação", pres.status === "ACCEPTED" && !!pres.acceptedAt, pres.status);
});

// 9. Notificações do cliente
await step("notificacoes", async () => {
  const n = await prisma.notification.count({ where: { clientId: A.id, audience: "CLIENT" } });
  ok("Cliente recebeu notificações dos eventos", n >= 3, String(n));
  const leakB = await prisma.notification.count({ where: { clientId: (await prisma.client.findUnique({ where: { email: "cliente-b@teste.local" } })).id, title: { contains: RUN } } });
  ok("Nenhuma notificação de A vazou para B", leakB === 0);
});

// 10. Logout
await step("logout", async () => {
  await ca.goto(BASE + "/cliente", { waitUntil: "networkidle" });
  await ca.getByRole("button", { name: "Sair" }).first().click();
  await ca.waitForURL(/\/auth\/login/, { timeout: 10000 });
  const r = await ca.goto(BASE + "/cliente");
  ok("Logout encerra a sessão", ca.url().includes("/auth/login"));
});

console.log(`\nFluxos: ${pass} passaram, ${fail} falharam`);
await browser.close(); await prisma.$disconnect();
process.exitCode = fail ? 1 : 0;
