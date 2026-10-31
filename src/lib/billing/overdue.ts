import "server-only";
import { prisma } from "@/lib/prisma";
import { todayUTC } from "./dates";

/** PENDING com vencimento anterior a hoje → OVERDUE. */
export async function markOverdue() {
  const res = await prisma.payment.updateMany({ where: { status: "PENDING", dueDate: { lt: todayUTC() } }, data: { status: "OVERDUE" } });
  return { markedOverdue: res.count };
}
