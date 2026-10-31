import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/states";
import { ClientForm } from "@/components/admin/client-form";

export const metadata = { title: "Novo cliente" };

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: leadId } = await searchParams;
  const lead = leadId ? await prisma.lead.findUnique({ where: { id: leadId } }) : null;
  const initial = lead
    ? { leadId: lead.id, name: lead.name, company: lead.company ?? "", email: lead.email, phone: lead.whatsapp, projectType: lead.projectType, status: "LEAD", notes: lead.description }
    : {};
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/clientes" className="inline-flex items-center gap-1.5 text-[13px] text-foreground-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Clientes</Link>
      <PageHeader title={lead ? "Converter solicitação em cliente" : "Novo cliente"} description="Os dados alimentam contratos, apresentações e o portal do cliente." />
      <ClientForm initial={initial} />
    </div>
  );
}
