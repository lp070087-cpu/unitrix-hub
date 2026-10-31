import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/states";
import { ClientForm } from "@/components/admin/client-form";

export const metadata = { title: "Editar cliente" };

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.client.findUnique({ where: { id } });
  if (!c) notFound();
  const initial = {
    name: c.name, company: c.company ?? "", document: c.document ?? "", email: c.email, phone: c.phone ?? "", address: c.address ?? "",
    city: c.city ?? "", segment: c.segment ?? "", projectType: c.projectType ?? "", status: c.status, budget: c.budget ? Number(c.budget) : "",
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/admin/clientes/${id}`} className="inline-flex items-center gap-1.5 text-[13px] text-foreground-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {c.name}</Link>
      <PageHeader title="Editar cliente" />
      <ClientForm clientId={id} initial={initial} hasAccess={!!c.passwordHash} />
    </div>
  );
}
