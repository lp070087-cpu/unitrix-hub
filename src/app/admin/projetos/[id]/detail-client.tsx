"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Check, Circle, Loader2 } from "lucide-react";
import { TimelinePrazo } from "@/components/shared/timeline-prazo";
import { formatCurrency } from "@/lib/utils";
import { toggleMilestone, addMilestone, createPayment, markPaymentPaid } from "../actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProjetoDetailClient({ projeto }: { projeto: any }) {
  const router = useRouter();
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  async function handleToggleMilestone(id: string) {
    try { await toggleMilestone(id); router.refresh(); } catch (e: any) { toast.error(e.message); }
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;
    setAdding(true);
    const fd = new FormData();
    fd.set("title", milestoneTitle);
    fd.set("order", String((projeto.milestones?.length || 0) + 1));
    try {
      await addMilestone(projeto.id, fd);
      toast.success("Etapa adicionada!");
      setMilestoneTitle("");
      router.refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setAdding(false); }
  }

  async function handlePayment(formData: FormData) {
    formData.set("clientId", projeto.clientId);
    formData.set("projectId", projeto.id);
    try { await createPayment(formData); toast.success("Pagamento registrado!"); setShowPayment(false); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  }

  async function handleMarkPaid(paymentId: string) {
    try { await markPaymentPaid(paymentId); toast.success("Pagamento confirmado!"); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  }

  const milestones = projeto.milestones || [];
  const done = milestones.filter((m: any) => m.status === "COMPLETED").length;
  const progress = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <Link href="/admin/projetos" className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      {/* Cabeçalho */}
      <div className="card-premium p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{projeto.title}</h2>
            <p className="text-xs text-foreground-muted mt-1">
              Cliente: <Link href={`/admin/clientes/${projeto.clientId}`} className="text-accent hover:underline">{projeto.client?.name}</Link>
              {projeto.client?.company && ` — ${projeto.client.company}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-accent font-mono">{progress}%</span>
            <p className="text-[10px] text-foreground-dim">concluído</p>
          </div>
        </div>
        {projeto.startDate && projeto.endDate && (
          <TimelinePrazo startDate={projeto.startDate} endDate={projeto.endDate} label="Prazo de Entrega" />
        )}
      </div>

      {/* Milestones */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Etapas ({done}/{milestones.length})</h3>
          <form onSubmit={handleAddMilestone} className="flex gap-2">
            <input value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} placeholder="Nova etapa..." className="bg-background border border-border rounded-md py-1.5 px-3 text-xs text-foreground focus:outline-none focus:border-accent/40 w-40" />
            <button type="submit" disabled={adding} className="btn btn-primary text-[10px] py-1.5 px-3">
              {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            </button>
          </form>
        </div>

        <div className="space-y-1">
          {milestones.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 group cursor-pointer" onClick={() => handleToggleMilestone(m.id)}>
              {m.status === "COMPLETED" ? (
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-background" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-foreground-dim group-hover:text-accent transition-colors flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className={`text-sm ${m.status === "COMPLETED" ? "line-through text-foreground-dim" : "text-foreground"}`}>
                  {m.title}
                </span>
                {m.completedAt && <span className="text-[10px] text-foreground-dim ml-2">· {new Date(m.completedAt).toLocaleDateString("pt-BR")}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagamentos */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Pagamentos</h3>
          <button onClick={() => setShowPayment(!showPayment)} className="btn btn-ghost text-[10px] py-1.5 px-3">
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>
        {showPayment && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} action={handlePayment} className="grid grid-cols-3 gap-2 mb-4 p-3 bg-background rounded-md">
            <input name="description" placeholder="Descrição" required className="bg-surface border border-border rounded-md py-1.5 px-2 text-xs text-foreground" />
            <input name="amount" type="number" step="0.01" placeholder="Valor" required className="bg-surface border border-border rounded-md py-1.5 px-2 text-xs text-foreground font-mono" />
            <select name="type" className="bg-surface border border-border rounded-md py-1.5 px-2 text-xs text-foreground">
              <option value="DEPOSIT">Entrada (50%)</option>
              <option value="FINAL_BALANCE">Saldo Final (50%)</option>
              <option value="SUBSCRIPTION">Mensalidade</option>
            </select>
            <div className="col-span-3 flex justify-end">
              <button type="submit" className="btn btn-primary text-[10px] py-1.5 px-3">Salvar</button>
            </div>
          </motion.form>
        )}
        {projeto.payments.length === 0 ? (
          <p className="text-xs text-foreground-muted py-4 text-center">Nenhum pagamento registrado.</p>
        ) : (
          <div className="space-y-1">
            {projeto.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-sm font-semibold">{p.description}</span>
                  <span className="text-[10px] text-foreground-dim ml-2">
                    {p.type === "DEPOSIT" ? "Entrada" : p.type === "FINAL_BALANCE" ? "Saldo Final" : "Mensalidade"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold">{formatCurrency(Number(p.amount))}</span>
                  {p.status !== "PAID" ? (
                    <button onClick={() => handleMarkPaid(p.id)} className="text-[10px] text-accent hover:underline font-semibold">Marcar Pago</button>
                  ) : (
                    <span className="text-[10px] text-green-400 font-semibold">Pago</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
