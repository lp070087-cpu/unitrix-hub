import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestMeta } from "@/lib/server/request";
import { readSnapshot } from "@/lib/contracts/master";
import { ContractDocument } from "@/components/documents/contract-document";
import { PrintButton } from "@/components/documents/print-button";
import { Logo } from "@/components/ui/logo";
import { formatDateTime } from "@/lib/utils";
import { SignPanel } from "./sign-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contrato", robots: { index: false, follow: false } };

const NOT_SIGNABLE: Record<string, string> = {
  DRAFT: "Rascunho — este documento ainda não foi enviado e não pode ser assinado.",
  SUPERSEDED: "Esta versão foi substituída por uma versão mais recente e não pode mais ser assinada.",
  CANCELLED: "Este contrato foi cancelado e não pode ser assinado.",
};

export default async function ContratoPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/contrato/${slug}`)}`);

  let c = await prisma.contract.findUnique({ where: { slug } });
  if (!c) notFound();
  const isAdmin = session.user.role === "ADMIN";
  const isOwner = session.user.role === "CLIENT" && session.user.id === c.clientId;
  if (!isAdmin && !isOwner) notFound();
  if (isOwner && c.status === "DRAFT") notFound();

  // Primeira visualização do cliente
  if (isOwner && !c.viewedAt && c.status === "SENT") {
    const now = new Date();
    const res = await prisma.contract.updateMany({ where: { id: c.id, viewedAt: null, status: "SENT" }, data: { viewedAt: now, status: "VIEWED" } });
    if (res.count > 0) {
      const { ip, userAgent } = await getRequestMeta();
      await prisma.contractEvent.create({ data: { contractId: c.id, action: "VIEWED", actor: session.user.email ?? "cliente", ip, userAgent } });
      c = { ...c, viewedAt: now, status: "VIEWED" };
    }
  }

  const snapshot = readSnapshot(c.contentSnapshot);
  const signable = (c.status === "SENT" || c.status === "VIEWED") && !c.signedAt;
  const notice = NOT_SIGNABLE[c.status];

  const banner = c.signedAt ? (
    <p className="flex items-start gap-2 rounded-md border border-paper-line bg-white/60 px-3 py-2 text-sm">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" strokeWidth={1.6} />
      <span>Assinado eletronicamente por <strong className="font-medium">{c.signerName}</strong> em {formatDateTime(c.signedAt)}.{c.supersededAt ? " Possui aditivo posterior." : ""}</span>
    </p>
  ) : notice ? (
    <p className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
      <span>{notice}</span>
    </p>
  ) : isAdmin && signable ? (
    <p className="rounded-md border border-paper-line px-3 py-2 text-sm text-paper-muted">Visualização administrativa. A assinatura só pode ser feita pelo cliente titular.</p>
  ) : null;

  return (
    <div className="min-h-dvh bg-background pb-16 print:bg-white print:pb-0">
      <header className="no-print sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[860px] items-center justify-between gap-3 px-4">
          <Link href={isAdmin ? `/admin/contratos/${c.id}` : "/cliente/contratos"} className="inline-flex items-center gap-2 text-[13px] text-foreground-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.6} /> <span className="hidden sm:inline">{isAdmin ? "Voltar ao painel" : "Meus contratos"}</span>
          </Link>
          <Logo />
          <PrintButton />
        </div>
      </header>

      <main className="px-4 pt-6 sm:pt-10 print:p-0">
        {snapshot ? (
          <ContractDocument snapshot={snapshot} banner={banner} evidence={c.signedAt ? { ...c, version: c.version } : null} />
        ) : (
          <div className="mx-auto max-w-[860px] rounded-lg bg-paper p-8 text-paper-ink">
            <p className="font-display text-3xl">{c.title}</p>
            <p className="mt-3 text-sm text-paper-muted">O documento deste contrato não está disponível. Entre em contato com a Unitrix.</p>
          </div>
        )}

        {isOwner && signable && snapshot && <SignPanel slug={c.slug} defaultName={c.clientName} readConfirmed={c.readConfirmed} />}
      </main>
    </div>
  );
}
