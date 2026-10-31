import Link from "next/link";
import { Plus, Users, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { CLIENT_STATUS_MAP, formatDate } from "@/lib/utils";

export const metadata = { title: "Clientes" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { company: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where, orderBy: { createdAt: "desc" }, take: 200,
      select: { id: true, name: true, company: true, email: true, status: true, createdAt: true, passwordHash: true, _count: { select: { projects: true, contracts: true } } },
    }),
    prisma.client.count(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${total} ${total === 1 ? "cliente cadastrado" : "clientes cadastrados"}`}
        actions={<Button asChild><Link href="/admin/clientes/novo"><Plus /> Novo cliente</Link></Button>}
      />

      <form className="flex flex-col gap-2 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-dim" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nome, empresa ou e-mail" className="pl-9" aria-label="Buscar clientes" />
        </div>
        <Select name="status" defaultValue={status} className="sm:w-52" aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {Object.entries(CLIENT_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      <Card>
        {clients.length === 0 ? (
          <EmptyState icon={Users} title={q || status ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
            description={q || status ? "Ajuste a busca ou os filtros." : "Cadastre o primeiro cliente ou converta uma solicitação recebida pelo site."}
            action={!q && !status ? <Button asChild variant="secondary"><Link href="/admin/clientes/novo">Cadastrar cliente</Link></Button> : undefined} />
        ) : (
          <>
            <ul className="divide-y divide-border md:hidden">
              {clients.map((c) => {
                const s = CLIENT_STATUS_MAP[c.status];
                return (
                  <li key={c.id}>
                    <Link href={`/admin/clientes/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-surface-hover/50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-foreground-muted">{c.company || c.email}</p>
                      </div>
                      <Badge tone={s?.tone}>{s?.label ?? c.status}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="hidden md:block">
              <Table>
                <THead><tr><TH>Cliente</TH><TH>Status</TH><TH>Projetos</TH><TH>Contratos</TH><TH>Portal</TH><TH>Desde</TH></tr></THead>
                <TBody>
                  {clients.map((c) => {
                    const s = CLIENT_STATUS_MAP[c.status];
                    return (
                      <TR key={c.id}>
                        <TD>
                          <Link href={`/admin/clientes/${c.id}`} className="block hover:text-accent">
                            <span className="font-medium">{c.name}</span>
                            <span className="block text-xs text-foreground-muted">{c.company ? `${c.company} · ` : ""}{c.email}</span>
                          </Link>
                        </TD>
                        <TD><Badge tone={s?.tone}>{s?.label ?? c.status}</Badge></TD>
                        <TD className="num text-foreground-muted">{c._count.projects}</TD>
                        <TD className="num text-foreground-muted">{c._count.contracts}</TD>
                        <TD>{c.passwordHash ? <Badge tone="success" dot>Ativo</Badge> : <Badge>Sem acesso</Badge>}</TD>
                        <TD className="text-foreground-muted">{formatDate(c.createdAt)}</TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
