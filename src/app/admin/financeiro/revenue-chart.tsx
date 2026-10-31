"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

type Row = { month: string; projetos: number; recorrente: number };

const COLORS = { projetos: "rgb(165 185 162)", recorrente: "rgb(140 168 204)" };

function compact(v: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);
}

export function RevenueChart({ data }: { data: Row[] }) {
  return (
    <div>
      <div className="mb-3 flex gap-4 text-2xs text-foreground-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: COLORS.projetos }} />Projetos</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: COLORS.recorrente }} />Recorrente</span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgb(44 47 54)" strokeDasharray="0" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "rgb(112 115 123)", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgb(112 115 123)", fontSize: 11 }} tickFormatter={compact} width={48} />
            <Tooltip
              cursor={{ fill: "rgb(34 37 43 / 0.6)" }}
              contentStyle={{ background: "rgb(24 26 31)", border: "1px solid rgb(60 64 72)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "rgb(241 240 236)", marginBottom: 4 }}
              formatter={(v: number, name: string) => [formatCurrency(v), name === "projetos" ? "Projetos" : "Recorrente"]}
            />
            <Bar dataKey="projetos" stackId="a" fill={COLORS.projetos} radius={[0, 0, 0, 0]} />
            <Bar dataKey="recorrente" stackId="a" fill={COLORS.recorrente} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
