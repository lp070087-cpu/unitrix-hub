import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePresentationContent } from "@/lib/presentations/types";
import { PresentationView, type Viewer } from "./presentation-view";

export const dynamic = "force-dynamic";

const PUBLIC_STATUSES = ["SENT", "VIEWED", "ACCEPTED"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.presentation.findUnique({ where: { slug }, select: { title: true, status: true } });
  const visible = p && PUBLIC_STATUSES.includes(p.status);
  return { title: visible ? p.title : "Apresentação", robots: { index: false, follow: false, nocache: true } };
}

export default async function ApresentacaoPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [session, found] = await Promise.all([
    auth(),
    prisma.presentation.findUnique({ where: { slug }, include: { client: { select: { name: true, company: true } } } }),
  ]);
  if (!found) notFound();
  let p = found;
  const isAdmin = session?.user?.role === "ADMIN";
  if (!isAdmin && !PUBLIC_STATUSES.includes(p.status)) notFound();

  // Primeira visualização por não-admin
  if (!isAdmin && !p.viewedAt) {
    const now = new Date();
    const res = await prisma.presentation.updateMany({ where: { id: p.id, viewedAt: null }, data: { viewedAt: now } });
    if (res.count > 0) {
      await prisma.presentation.updateMany({ where: { id: p.id, status: "SENT" }, data: { status: "VIEWED" } });
      p = { ...p, viewedAt: now, status: p.status === "SENT" ? "VIEWED" : p.status };
    }
  }

  const viewer: Viewer = isAdmin
    ? "admin"
    : !session?.user
      ? "anon"
      : session.user.role === "CLIENT" && session.user.id === p.clientId
        ? "owner"
        : "other";

  return (
    <PresentationView
      slug={p.slug}
      status={p.status}
      content={parsePresentationContent(p.content, p.title)}
      clientLabel={p.client.company || p.client.name}
      viewer={viewer}
      accepted={p.acceptedAt ? { at: p.acceptedAt.toISOString(), by: p.acceptedByName ?? "" } : null}
    />
  );
}
