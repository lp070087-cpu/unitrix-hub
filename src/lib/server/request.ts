import "server-only";
import { headers } from "next/headers";
import { createHash } from "crypto";

export async function getRequestMeta() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") || "";
  const ip = (fwd.split(",")[0] || h.get("x-real-ip") || "").trim() || "desconhecido";
  const userAgent = (h.get("user-agent") || "desconhecido").slice(0, 400);
  return { ip, userAgent };
}

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function hashIp(ip: string) {
  return sha256(`${process.env.AUTH_SECRET || "unitrix"}:${ip}`).slice(0, 32);
}
