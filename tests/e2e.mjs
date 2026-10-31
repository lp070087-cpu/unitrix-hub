// Testes E2E do Unitrix Hub — rodam contra um servidor local (BASE_URL) e banco de TESTE local.
// Uso: BASE_URL=http://localhost:3100 node tests/e2e.mjs
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL || "http://localhost:3100";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || "")) { console.error("Recusado: use banco local de teste."); process.exit(1); }
const prisma = new PrismaClient();
const PW = "Teste#12345";
let pass = 0, fail = 0; const failures = [];
const ok = (name, cond, extra = "") => { if (cond) pass++; else { fail++; failures.push(`${name} ${extra}`); } console.log(`${cond ? "✔" : "✘"} ${name}${cond ? "" : " " + extra}`); };

class Jar {
  constructor() { this.c = new Map(); }
  set(res) { for (const h of res.headers.getSetCookie?.() || []) { const [kv] = h.split(";"); const i = kv.indexOf("="); const k = kv.slice(0, i), v = kv.slice(i + 1); if (v === "" || /Max-Age=0/i.test(h)) this.c.delete(k); else this.c.set(k, v); } }
  header() { return [...this.c].map(([k, v]) => `${k}=${v}`).join("; "); }
}
async function req(jar, path, opts = {}) {
  const res = await fetch(BASE + path, { redirect: "manual", ...opts, headers: { ...(opts.headers || {}), cookie: jar?.header() || "" } });
  jar?.set(res);
  return res;
}
async function login(email) {
  const jar = new Jar();
  const csrf = await (await req(jar, "/api/auth/csrf")).json();
  const body = new URLSearchParams({ csrfToken: csrf.csrfToken, email, password: PW, callbackUrl: BASE + "/" });
  await req(jar, "/api/auth/callback/credentials", { method: "POST", body, headers: { "content-type": "application/x-www-form-urlencoded" } });
  const s = await (await req(jar, "/api/auth/session")).json();
  return { jar, session: s };
}
const loc = (r) => r.headers.get("location") || "";
const isLoginRedirect = (r) => [302, 303, 307, 308].includes(r.status) && loc(r).includes("/auth/login");

async function page(jar, path) {
  const r = await req(jar, path);
  const text = r.status === 200 ? await r.text() : "";
  return { r, text };
}
const looksBroken = (t) => /Application error|Internal Server Error|Unhandled Runtime Error/i.test(t);

async function main() {
  const admin = await login("admin@teste.local");
  const ca = await login("cliente-a@teste.local");
  const cb = await login("cliente-b@teste.local");
  ok("login admin → role ADMIN", admin.session?.user?.role === "ADMIN");
  ok("login cliente A → role CLIENT", ca.session?.user?.role === "CLIENT");
  ok("login cliente B → role CLIENT", cb.session?.user?.role === "CLIENT");
  const bad = await login("admin@teste.local".replace("admin", "naoexiste"));
  ok("login inválido → sem sessão", !bad.session?.user);

  const A = await prisma.client.findUnique({ where: { email: "cliente-a@teste.local" } });
  const B = await prisma.client.findUnique({ where: { email: "cliente-b@teste.local" } });

  // Inventário de rotas estáticas
  const publicRoutes = ["/", "/auth/login", "/robots.txt", "/sitemap.xml"];
  const adminRoutes = ["/admin", "/admin/solicitacoes", "/admin/clientes", "/admin/clientes/novo", "/admin/projetos", "/admin/briefings", "/admin/apresentacoes", "/admin/contratos", "/admin/contratos/novo", "/admin/financeiro", "/admin/planos", "/admin/assinaturas", "/admin/notificacoes"];
  const clientRoutes = ["/cliente", "/cliente/projetos", "/cliente/briefing", "/cliente/apresentacoes", "/cliente/contratos", "/cliente/pagamentos", "/cliente/mensalidades", "/cliente/notificacoes"];

  for (const p of publicRoutes) { const { r, text } = await page(null, p); ok(`público ${p} 200`, r.status === 200 && !looksBroken(text), `status=${r.status}`); }
  { const r = await req(null, "/rota-que-nao-existe"); ok("404 para rota inexistente", r.status === 404, `status=${r.status}`); }

  for (const p of adminRoutes) {
    const { r, text } = await page(admin.jar, p); ok(`ADMIN ${p} 200`, r.status === 200 && !looksBroken(text), `status=${r.status}`);
    const u = await req(null, p); ok(`anônimo ${p} → login`, isLoginRedirect(u), `status=${u.status} loc=${loc(u)}`);
    const c = await req(ca.jar, p); ok(`CLIENT ${p} bloqueado`, [302, 303, 307, 308].includes(c.status) && !loc(c).includes("/admin"), `status=${c.status} loc=${loc(c)}`);
  }
  for (const p of clientRoutes) {
    const { r, text } = await page(ca.jar, p); ok(`CLIENT ${p} 200`, r.status === 200 && !looksBroken(text), `status=${r.status}`);
    const u = await req(null, p); ok(`anônimo ${p} → login`, isLoginRedirect(u), `status=${u.status}`);
    const a = await req(admin.jar, p); ok(`ADMIN em ${p} → /admin`, [302, 303, 307, 308].includes(a.status) && loc(a).includes("/admin"), `status=${a.status} loc=${loc(a)}`);
  }
  { const r = await req(admin.jar, "/auth/login"); ok("logado em /auth/login → redireciona", [302, 303, 307, 308].includes(r.status), `status=${r.status}`); }

  // Rotas dinâmicas e isolamento entre clientes (dados criados por tests/flows)
  const projA = await prisma.project.findFirst({ where: { clientId: A.id } });
  const contractA = await prisma.contract.findFirst({ where: { clientId: A.id, status: { not: "DRAFT" } } });
  const briefA = await prisma.briefing.findFirst({ where: { clientId: A.id } });
  const presA = await prisma.presentation.findFirst({ where: { clientId: A.id } });
  if (projA) {
    ok("ADMIN /admin/projetos/[id] 200", (await req(admin.jar, `/admin/projetos/${projA.id}`)).status === 200);
    ok("CLIENT A vê o próprio projeto", (await req(ca.jar, `/cliente/projetos/${projA.id}`)).status === 200);
    ok("CLIENT B NÃO vê projeto de A (IDOR)", (await req(cb.jar, `/cliente/projetos/${projA.id}`)).status === 404);
  }
  ok("ADMIN /admin/clientes/[id] 200", (await req(admin.jar, `/admin/clientes/${A.id}`)).status === 200);
  ok("ADMIN /admin/clientes/[id]/editar 200", (await req(admin.jar, `/admin/clientes/${A.id}/editar`)).status === 200);
  ok("ADMIN cliente inexistente → 404", (await req(admin.jar, `/admin/clientes/naoexiste`)).status === 404);
  if (contractA) {
    ok("ADMIN /admin/contratos/[id] 200", (await req(admin.jar, `/admin/contratos/${contractA.id}`)).status === 200);
    ok("CLIENT A abre /contrato/[slug]", (await req(ca.jar, `/contrato/${contractA.slug}`)).status === 200);
    ok("CLIENT B NÃO abre contrato de A", (await req(cb.jar, `/contrato/${contractA.slug}`)).status === 404);
    const an = await req(null, `/contrato/${contractA.slug}`); ok("anônimo /contrato → login", isLoginRedirect(an), `status=${an.status}`);
  }
  if (briefA) {
    ok("CLIENT A abre briefing", (await req(ca.jar, `/cliente/briefing/${briefA.id}`)).status === 200);
    ok("CLIENT B NÃO abre briefing de A", (await req(cb.jar, `/cliente/briefing/${briefA.id}`)).status === 404);
    ok("ADMIN /admin/briefings/[id] 200", (await req(admin.jar, `/admin/briefings/${briefA.id}`)).status === 200);
  }
  if (presA) {
    ok("ADMIN /admin/apresentacoes/[id] 200", (await req(admin.jar, `/admin/apresentacoes/${presA.id}`)).status === 200);
    const pub = await req(null, `/apresentacao/${presA.slug}`);
    ok(`apresentação ${presA.status} acesso público coerente`, presA.status === "DRAFT" || presA.status === "ARCHIVED" ? pub.status === 404 : pub.status === 200, `status=${pub.status}`);
  }
  ok("apresentação inexistente → 404", (await req(null, "/apresentacao/nao-existe-xyz")).status === 404);

  // Cron protegido
  { const r = await req(null, "/api/cron/billing"); ok("cron sem token → 401/503", [401, 403, 503].includes(r.status), `status=${r.status}`); }

  console.log(`\nResultado: ${pass} passaram, ${fail} falharam`);
  if (fail) { console.log(failures.map((f) => " - " + f).join("\n")); process.exitCode = 1; }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
