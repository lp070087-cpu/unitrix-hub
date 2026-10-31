import type { ContractSnapshot } from "@/lib/contracts/master";
import { formatDateTime } from "@/lib/utils";

export type SignatureEvidence = {
  signerName: string | null;
  signerDocument: string | null;
  signedAt: string | Date | null;
  signatureIp: string | null;
  signatureBrowser: string | null;
  signatureHash: string | null;
  signatureData: string | null;
  readConfirmedAt: string | Date | null;
  termsAcceptedAt: string | Date | null;
  version: number;
};

function maskDocument(doc: string | null) {
  if (!doc) return "—";
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  if (d.length === 14) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return doc;
}

/** Documento editorial claro (papel). Seguro para Server Components. */
export function ContractDocument({ snapshot, evidence, banner }: { snapshot: ContractSnapshot; evidence?: SignatureEvidence | null; banner?: React.ReactNode }) {
  const { contratada, contratante } = snapshot.parties;
  return (
    <article className="contract-doc mx-auto w-full max-w-[860px] rounded-lg bg-paper text-paper-ink shadow-lift print:max-w-none print:rounded-none print:shadow-none">
      <style>{`@media print {
        @page { margin: 18mm 16mm; }
        body { background: #fff !important; }
        .no-print { display: none !important; }
        .contract-doc { color: #111; }
        .contract-doc section { break-inside: avoid-page; }
      }`}</style>
      <header className="border-b border-paper-line px-6 pb-8 pt-10 sm:px-12 sm:pt-14">
        <p className="font-mono text-2xs uppercase tracking-[0.18em] text-paper-muted">
          {snapshot.templateName} · Versão {snapshot.version}
        </p>
        <h1 className="mt-4 font-display text-[40px] leading-[1.02] tracking-[-0.02em] sm:text-[56px] text-balance">{snapshot.title}</h1>
        {banner && <div className="mt-6">{banner}</div>}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          {snapshot.summary.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="font-mono text-2xs uppercase tracking-[0.14em] text-paper-muted">{s.label}</dt>
              <dd className="mt-1 text-[15px] font-medium break-words">{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="px-6 py-8 sm:px-12 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {[contratada, contratante].map((p) => (
            <div key={p.role} className="rounded-md border border-paper-line p-4">
              <p className="font-mono text-2xs uppercase tracking-[0.16em] text-paper-muted">{p.role}</p>
              <p className="mt-2 font-medium">{p.name}</p>
              <p className="mt-1 text-sm text-paper-muted">CPF/CNPJ: {p.document}</p>
              <p className="text-sm text-paper-muted">Endereço: {p.address}</p>
              {p.extra && <p className="text-sm text-paper-muted break-all">{p.extra}</p>}
            </div>
          ))}
        </div>

        <p className="mt-8 text-[15px] leading-relaxed text-pretty">{snapshot.preamble}</p>

        <ol className="mt-10 space-y-10">
          {snapshot.sections.map((s) => (
            <li key={s.number}>
              <section aria-labelledby={`clausula-${s.number}`}>
                <h2 id={`clausula-${s.number}`} className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tabular-nums text-paper-muted">{String(s.number).padStart(2, "0")}</span>
                  <span className="font-display text-[26px] leading-tight tracking-[-0.01em]">Cláusula {s.number}ª — {s.title}</span>
                </h2>
                <div className="mt-4 space-y-3 pl-0 sm:pl-8">
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="whitespace-pre-line text-[15px] leading-[1.7] text-pretty">
                      <span className="mr-2 font-mono text-xs tabular-nums text-paper-muted">
                        {s.number}.{i + 1}
                      </span>
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            </li>
          ))}
        </ol>

        {evidence?.signedAt && <EvidenceBlock evidence={evidence} contratante={contratante.name} />}

        <aside className="mt-12 rounded-md border border-dashed border-paper-line px-4 py-3 text-xs leading-relaxed text-paper-muted">
          {snapshot.notice}
        </aside>
      </div>
    </article>
  );
}

function EvidenceBlock({ evidence, contratante }: { evidence: SignatureEvidence; contratante: string }) {
  const rows: [string, string][] = [
    ["Signatário", evidence.signerName ?? "—"],
    ["CPF/CNPJ", maskDocument(evidence.signerDocument)],
    ["Representando", contratante],
    ["Data e hora", `${formatDateTime(evidence.signedAt)} (Brasília)`],
    ["Leitura confirmada", formatDateTime(evidence.readConfirmedAt)],
    ["Termos aceitos", formatDateTime(evidence.termsAcceptedAt)],
    ["Endereço IP", evidence.signatureIp ?? "—"],
    ["Navegador", evidence.signatureBrowser ?? "—"],
    ["Versão do documento", String(evidence.version)],
  ];
  return (
    <section className="mt-14 border-t border-paper-line pt-8" aria-labelledby="evidencias">
      <p className="font-mono text-2xs uppercase tracking-[0.18em] text-paper-muted">Assinatura eletrônica</p>
      <h2 id="evidencias" className="mt-2 font-display text-[28px] leading-tight">Evidências da assinatura</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_240px]">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="font-mono text-2xs uppercase tracking-[0.14em] text-paper-muted">{k}</dt>
              <dd className="mt-0.5 text-sm break-words">{v}</dd>
            </div>
          ))}
          <div className="min-w-0 sm:col-span-2">
            <dt className="font-mono text-2xs uppercase tracking-[0.14em] text-paper-muted">Hash de integridade (SHA-256)</dt>
            <dd className="mt-0.5 font-mono text-xs break-all">{evidence.signatureHash ?? "—"}</dd>
          </div>
        </dl>
        {evidence.signatureData && (
          <figure className="rounded-md border border-paper-line bg-white p-3">
            <img src={evidence.signatureData} alt={`Assinatura de ${evidence.signerName ?? "signatário"}`} className="h-28 w-full object-contain" />
            <figcaption className="mt-2 border-t border-paper-line pt-2 text-center text-xs text-paper-muted">{evidence.signerName}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
