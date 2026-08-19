import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-sidebar";
import { ProjetoDetailClient } from "./detail-client";

async function getProjeto(id: string) {
  const projeto = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      milestones: { orderBy: { order: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!projeto) return null;
  return JSON.parse(JSON.stringify(projeto));
}

export default async function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;
  const projeto = await getProjeto(id);
  if (!projeto) notFound();

  return <><AdminHeader title={projeto.title} /><ProjetoDetailClient projeto={projeto} /></>;
}
