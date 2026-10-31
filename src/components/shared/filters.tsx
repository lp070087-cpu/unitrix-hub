"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export type FilterDef = { name: string; label: string; options: [string, string][] };

/** Filtros por searchParams (status, tipo, cliente…). */
export function Filters({ filters }: { filters: FilterDef[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = filters.some((f) => params.get(f.name));

  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {filters.map((f) => (
        <Select key={f.name} aria-label={f.label} value={params.get(f.name) ?? ""} onChange={(e) => update(f.name, e.target.value)} className="h-9 sm:w-48">
          <option value="">{f.label}: todos</option>
          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      ))}
      {active && <Button variant="ghost" size="sm" onClick={() => router.replace(pathname, { scroll: false })}>Limpar filtros</Button>}
    </div>
  );
}
