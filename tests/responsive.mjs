// Verifica overflow horizontal e erros de console em larguras móveis/desktop.
// Uso: BASE_URL=http://localhost:3100 node tests/responsive.mjs [dirScreenshots]
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const SHOTS = process.argv[2];
const widths = [375, 390, 430, 768, 1024, 1440];
const groups = {
  anon: ["/", "/auth/login", "/nao-existe"],
  admin: ["/admin", "/admin/solicitacoes", "/admin/clientes", "/admin/clientes/novo", "/admin/projetos", "/admin/briefings", "/admin/apresentacoes", "/admin/contratos", "/admin/contratos/novo", "/admin/financeiro", "/admin/planos", "/admin/assinaturas", "/admin/notificacoes"],
  client: ["/cliente", "/cliente/projetos", "/cliente/briefing", "/cliente/apresentacoes", "/cliente/contratos", "/cliente/pagamentos", "/cliente/mensalidades", "/cliente/notificacoes"],
};
const extra = (process.env.EXTRA_ROUTES || "").split(",").filter(Boolean); // formato grupo:/rota

async function loginCtx(browser, email) {
  const ctx = await browser.newContext();
  if (!email) return ctx;
  const p = await ctx.newPage();
  await p.goto(BASE + "/auth/login");
  await p.fill('input[type="email"]', email);
  await p.fill('input[type="password"]', "Teste#12345");
  await Promise.all([p.waitForURL(/\/(admin|cliente)/, { timeout: 20000 }), p.click('button[type="submit"]')]);
  await p.close();
  return ctx;
}

const browser = await chromium.launch();
const ctxs = { anon: await loginCtx(browser), admin: await loginCtx(browser, "admin@teste.local"), client: await loginCtx(browser, "cliente-a@teste.local") };
for (const e of extra) { const [g, r] = e.split(":"); groups[g].push(r); }
let issues = 0, checks = 0;
for (const [g, routes] of Object.entries(groups)) {
  for (const route of routes) {
    for (const w of widths) {
      const page = await ctxs[g].newPage({ viewport: { width: w, height: 900 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => { if (m.type() === "error" && !/favicon|404 \(Not Found\)/.test(m.text())) errors.push(m.text()); });
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);
      const { sw, iw, culprit } = await page.evaluate(() => {
        const iw = window.innerWidth, sw = document.documentElement.scrollWidth;
        let culprit = "";
        if (sw > iw) for (const el of document.querySelectorAll("body *")) { const r = el.getBoundingClientRect(); if (r.right > iw + 1 && getComputedStyle(el).position !== "fixed") { culprit = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 80)}`; break; } }
        return { sw, iw, culprit };
      });
      checks++;
      if (sw > iw || errors.length) { issues++; console.log(`✘ [${g}] ${route} @${w}px ${sw > iw ? `overflow ${sw}>${iw} ${culprit}` : ""} ${errors.slice(0, 2).join(" | ")}`); }
      if (SHOTS && (w === 390 || w === 1440)) await page.screenshot({ path: `${SHOTS}/${g}${route.replace(/\//g, "_") || "_home"}-${w}.png`, fullPage: route === "/" });
      await page.close();
    }
  }
}
console.log(`\nResponsividade: ${checks - issues}/${checks} sem problemas`);
await browser.close();
process.exitCode = issues ? 1 : 0;
