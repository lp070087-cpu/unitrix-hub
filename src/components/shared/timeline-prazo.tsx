"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimelinePrazoProps {
  startDate: string;
  endDate: string;
  label?: string;
  showDays?: boolean;
}

export function TimelinePrazo({ startDate, endDate, label, showDays = true }: TimelinePrazoProps) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const total = end - start;

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  const elapsed = Math.max(0, now - start);
  const progress = Math.min(100, Math.round((elapsed / total) * 100));
  const diasRestantes = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const diasTotais = Math.ceil(total / (1000 * 60 * 60 * 24));
  const diasPassados = Math.min(diasTotais, Math.floor(elapsed / (1000 * 60 * 60 * 24)));

  const statusColor =
    progress >= 100 ? "bg-green-500" :
    progress >= 75 ? "bg-yellow-500" :
    progress >= 50 ? "bg-accent" :
    "bg-blue-500";

  const statusLabel =
    progress >= 100 ? "Concluído" :
    progress >= 75 ? "Quase lá" :
    progress >= 50 ? "Na metade" :
    progress >= 25 ? "Avançando" :
    "Iniciando";

  return (
    <div className="space-y-3">
      {/* Info row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground-muted">
          {label || "Prazo de Entrega"}
        </span>
        <span className="font-mono font-bold text-accent">
          {progress}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${statusColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Status + datas */}
      {showDays && (
        <div className="flex items-center justify-between text-[11px]">
          <span className={`font-semibold ${
            progress >= 100 ? "text-green-400" :
            progress >= 75 ? "text-yellow-400" :
            "text-foreground-dim"
          }`}>
            {statusLabel}
          </span>
          <span className="text-foreground-dim">
            {progress >= 100 ? (
              "Prazo concluído"
            ) : (
              <>
                <span className="text-foreground-muted font-semibold">{diasRestantes} dias</span> restantes
                <span className="text-foreground-dim mx-1">·</span>
                {diasPassados}/{diasTotais} dias
              </>
            )}
          </span>
        </div>
      )}

      {/* Datas */}
      <div className="flex items-center justify-between text-[10px] text-foreground-dim">
        <span>Início: {new Date(startDate).toLocaleDateString("pt-BR")}</span>
        <span>Entrega: {new Date(endDate).toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}
