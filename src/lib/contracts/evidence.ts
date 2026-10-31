import "server-only";
import { sha256 } from "@/lib/server/request";

/** JSON canônico: chaves ordenadas recursivamente, sem espaços. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

export function computeSignatureHash(input: {
  contractId: string;
  version: number;
  contentSnapshot: unknown;
  signerName: string;
  signerDocument: string;
  signedAt: Date;
  ip: string;
  userAgent: string;
  signatureData: string;
}) {
  return sha256(
    canonicalJson({
      contractId: input.contractId,
      version: input.version,
      contentSnapshot: input.contentSnapshot,
      signerName: input.signerName,
      signerDocument: input.signerDocument,
      signedAt: input.signedAt.toISOString(),
      ip: input.ip,
      userAgent: input.userAgent,
      signatureDataSha256: sha256(input.signatureData),
    })
  );
}
