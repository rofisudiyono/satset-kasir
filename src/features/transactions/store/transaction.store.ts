import { atomWithMMKV } from "@/store/storage";
import type { Transaction } from "@/types";

export const transactionsAtom = atomWithMMKV<Transaction[]>("transactions", []);

export function buildTransaction(
  params: {
    total: number;
    items: string;
    methodLabel: string;
    methodId?: Transaction["paymentMethodId"];
    orderType?: string;
    customerName?: string;
    shiftId?: string;
    createdAt?: number;
  },
  existingCount: number,
): Transaction {
  const pad = String(existingCount + 1).padStart(4, "0");
  const createdAt = params.createdAt ?? Date.now();
  const now = new Date(createdAt);
  const time =
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB";
  return {
    id: `#TRX-${pad}`,
    time,
    createdAt,
    shiftId: params.shiftId,
    table: params.customerName || params.orderType || "Tanpa nama",
    items: params.items,
    amount: `Rp ${params.total.toLocaleString("id-ID")}`,
    amountValue: params.total,
    status: "Lunas",
    paymentMethod: params.methodLabel,
    paymentMethodId: params.methodId,
  };
}
