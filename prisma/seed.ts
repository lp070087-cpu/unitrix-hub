import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Unitrix Hub...");

  // ── Admin user ──
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "❌ ADMIN_EMAIL e ADMIN_PASSWORD precisam estar configurados no .env para executar o seed."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Unitrix Admin",
      role: "ADMIN",
      passwordHash,
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  // ── Sample clients (dados de demonstração — senha padrão: "cliente123") ──
  const DEMO_PASSWORD = "cliente123";

  const clients = [
    {
      name: "Ricardo Almeida",
      company: "Fintech Pro",
      email: "ricardo@fintechpro.com.br",
      phone: "(11) 98765-4321",
      city: "São Paulo",
      segment: "Fintech",
      projectType: "SaaS",
      budget: 45000,
      status: "IN_PROGRESS",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    },
    {
      name: "Marina Costa",
      company: "Clínica Vida",
      email: "marina@clinicavida.com.br",
      phone: "(21) 99876-5432",
      city: "Rio de Janeiro",
      segment: "Saúde",
      projectType: "Sistema Web",
      budget: 28000,
      status: "CONTRACTED",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    },
    {
      name: "Pedro Santos",
      company: "EduTech Brasil",
      email: "pedro@edutech.com.br",
      phone: "(31) 97654-3210",
      city: "Belo Horizonte",
      segment: "Educação",
      projectType: "Aplicativo Mobile",
      budget: 65000,
      status: "PROPOSAL_SENT",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    },
    {
      name: "Ana Oliveira",
      company: "Green E-commerce",
      email: "ana@greenecommerce.com.br",
      phone: "(41) 96543-2109",
      city: "Curitiba",
      segment: "E-commerce",
      projectType: "E-commerce",
      budget: 35000,
      status: "LEAD",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    },
    {
      name: "Carlos Mendes",
      company: "LogPro Sistemas",
      email: "carlos@logpro.com.br",
      phone: "(51) 95432-1098",
      city: "Porto Alegre",
      segment: "Logística",
      projectType: "ERP",
      budget: 120000,
      status: "COMPLETED",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
    },
  ];

  for (const data of clients) {
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        createdById: admin.id,
      },
    });
    console.log(`  ✅ Cliente: ${client.name} (${client.status})`);
  }

  // ── Sample projects ──
  const fintechClient = await prisma.client.findUnique({ where: { email: "ricardo@fintechpro.com.br" } });
  const clinicaClient = await prisma.client.findUnique({ where: { email: "marina@clinicavida.com.br" } });

  if (fintechClient) {
    // Verifica se o projeto já existe (clientId + title)
    let fintechProject = await prisma.project.findFirst({
      where: {
        clientId: fintechClient.id,
        title: "Fintech Pro — Plataforma SaaS",
      },
    });

    if (!fintechProject) {
      fintechProject = await prisma.project.create({
        data: {
          title: "Fintech Pro — Plataforma SaaS",
          description: "Plataforma de gestão financeira com dashboard, relatórios e integração bancária.",
          progress: 35,
          status: "IN_PROGRESS",
          startDate: new Date("2026-06-01"),
          endDate: new Date("2026-09-01"),
          clientId: fintechClient.id,
        },
      });
      console.log(`  ✅ Projeto: ${fintechProject.title} (novo)`);
    } else {
      console.log(`  ✅ Projeto: ${fintechProject.title} (já existia)`);
    }

    // Milestones — verifica existência por projectId + title + order
    const fintechMilestones = [
      { title: "Planejamento e Discovery", description: "Definição de escopo, arquitetura e wireframes.", status: "COMPLETED", order: 1, completedAt: new Date("2026-06-15") },
      { title: "Design UI/UX", description: "Prototipação de alta fidelidade de todas as telas.", status: "COMPLETED", order: 2, completedAt: new Date("2026-07-01") },
      { title: "Desenvolvimento Backend", description: "API, banco de dados, autenticação e integrações.", status: "IN_PROGRESS", order: 3 },
      { title: "Desenvolvimento Frontend", description: "Implementação do dashboard e interface do cliente.", status: "PENDING", order: 4 },
      { title: "Testes e QA", description: "Testes automatizados e revisão de qualidade.", status: "PENDING", order: 5 },
      { title: "Deploy e Entrega", description: "Publicação em produção e documentação.", status: "PENDING", order: 6 },
    ];

    for (const m of fintechMilestones) {
      const existing = await prisma.projectMilestone.findFirst({
        where: {
          projectId: fintechProject.id,
          title: m.title,
          order: m.order,
        },
      });

      if (!existing) {
        await prisma.projectMilestone.create({
          data: { ...m, projectId: fintechProject.id },
        });
      }
    }

    const milestoneCount = await prisma.projectMilestone.count({ where: { projectId: fintechProject.id } });
    console.log(`     ↳ ${milestoneCount} milestones`);

    // Pagamentos — verifica existência por clientId + description + amount + projectId
    const fintechPayments = [
      { description: "Entrada — 50%", amount: 22500, type: "DEPOSIT", status: "PAID", paidAt: new Date("2026-06-05") },
      { description: "Saldo Final — 50%", amount: 22500, type: "FINAL_BALANCE", status: "PENDING" },
    ];

    for (const p of fintechPayments) {
      const existing = await prisma.payment.findFirst({
        where: {
          clientId: fintechClient.id,
          description: p.description,
          amount: p.amount,
          projectId: fintechProject.id,
        },
      });

      if (!existing) {
        await prisma.payment.create({
          data: { ...p, clientId: fintechClient.id, projectId: fintechProject.id },
        });
      }
    }

    const paymentCount = await prisma.payment.count({ where: { clientId: fintechClient.id } });
    console.log(`     ↳ ${paymentCount} pagamentos`);
  }

  if (clinicaClient) {
    // Verifica se o projeto já existe (clientId + title)
    let clinicaProject = await prisma.project.findFirst({
      where: {
        clientId: clinicaClient.id,
        title: "Clínica Vida — Sistema de Gestão",
      },
    });

    if (!clinicaProject) {
      clinicaProject = await prisma.project.create({
        data: {
          title: "Clínica Vida — Sistema de Gestão",
          description: "Sistema de agendamento, prontuário eletrônico e faturamento.",
          progress: 0,
          status: "PLANNING",
          startDate: new Date("2026-08-01"),
          endDate: new Date("2026-11-01"),
          clientId: clinicaClient.id,
        },
      });
      console.log(`  ✅ Projeto: ${clinicaProject.title} (novo)`);
    } else {
      console.log(`  ✅ Projeto: ${clinicaProject.title} (já existia)`);
    }

    // Pagamento — verifica existência por clientId + description + amount + projectId
    const existingPayment = await prisma.payment.findFirst({
      where: {
        clientId: clinicaClient.id,
        description: "Entrada — 50%",
        amount: 14000,
        projectId: clinicaProject.id,
      },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          description: "Entrada — 50%",
          amount: 14000,
          type: "DEPOSIT",
          status: "PENDING",
          clientId: clinicaClient.id,
          projectId: clinicaProject.id,
        },
      });
    }

    const paymentCount = await prisma.payment.count({ where: { clientId: clinicaClient.id } });
    console.log(`     ↳ ${paymentCount} pagamentos`);
  }

  // ── Sample plans ──
  const plans = [
    { name: "Landing Page", description: "Criação de landing page de alta conversão.", price: 3500, features: JSON.stringify(["Design premium", "SEO otimizado", "Formulário de captura", "Pixel de rastreamento", "Hospedagem"]) },
    { name: "Site Institucional", description: "Site multi-página com design exclusivo.", price: 6500, features: JSON.stringify(["Até 10 páginas", "Design responsivo", "Blog integrado", "SEO avançado", "Hospedagem + SSL"]) },
    { name: "Sistema Web", description: "Aplicação web sob medida.", price: 15000, features: JSON.stringify(["Painel administrativo", "Banco de dados", "Autenticação", "API REST", "Hospedagem + Suporte"]) },
    { name: "SaaS", description: "Plataforma SaaS completa.", price: 35000, features: JSON.stringify(["Arquitetura multi-tenant", "Pagamentos integrados", "Autenticação avançada", "API pública", "Dashboard analítico", "Infraestrutura escalável"]) },
    { name: "Hospedagem + Suporte", description: "Plano mensal de manutenção.", price: 497, interval: "MONTHLY", features: JSON.stringify(["Servidor gerenciado", "SSL incluso", "Backup diário", "Monitoramento 24/7", "Suporte técnico", "Atualizações"]) },
  ];

  for (const data of plans) {
    const planId = `seed-${data.name.toLowerCase().replace(/\s+/g, "-")}`;
    const plan = await prisma.plan.upsert({
      where: { id: planId },
      update: { price: data.price, description: data.description, features: data.features },
      create: { id: planId, ...data, createdById: admin.id },
    });
    console.log(`  ✅ Plano: ${plan.name} — R$ ${plan.price}`);
  }

  console.log("\n🎉 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
