import "server-only";
import { randomBytes } from "crypto";
import { slugify } from "@/lib/utils";

/** String base36 aleatória e sem viés (rejection sampling) a partir de crypto. */
export function randomBase36(length = 10) {
  let out = "";
  while (out.length < length) {
    for (const byte of randomBytes(32)) {
      if (byte < 252) out += (byte % 36).toString(36);
      if (out.length >= length) break;
    }
  }
  return out;
}

/** Slug público não adivinhável: `titulo-xxxxxxxxxx`. */
export function unguessableSlug(title: string) {
  return `${slugify(title).slice(0, 48)}-${randomBase36(10)}`;
}
