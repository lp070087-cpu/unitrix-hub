/**
 * Seed EXCLUSIVO para bancos de teste locais. Recusa qualquer DATABASE_URL que não seja localhost.
 * Uso: npx tsx scripts/seed-test.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error("Recusado: seed de teste só roda contra banco local.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("Teste#12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@teste.local" }, update: { passwordHash: pw },
    create: { email: "admin@teste.local", name: "Admin Teste", role: "ADMIN", passwordHash: pw },
  });
  for (const [email, name, company] of [["cliente-a@teste.local", "Cliente A", "Empresa A"], ["cliente-b@teste.local", "Cliente B", "Empresa B"]]) {
    await prisma.client.upsert({
      where: { email }, update: { passwordHash: pw },
      create: { email, name, company, status: "CONTRACTED", passwordHash: pw, createdById: admin.id },
    });
  }
  console.log("Seed de teste OK — senha: Teste#12345");
}

main().finally(() => prisma.$disconnect());
