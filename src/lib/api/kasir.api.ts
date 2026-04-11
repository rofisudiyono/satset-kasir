import { api } from "./client";

import type { KasirReadyOrder, KasirShift, ShiftSlotApi } from "./types";

export async function getActiveShift(): Promise<KasirShift | null> {
  const { data } = await api.get<{ data: KasirShift | null }>("/kasir/shifts/active");
  return data.data ?? null;
}

export type OpenShiftBody = {
  branchId: string;
  shiftSlot: ShiftSlotApi;
  openingCash: number;
};

export async function openShift(body: OpenShiftBody): Promise<KasirShift> {
  const { data } = await api.post<{ data: KasirShift }>("/kasir/shifts/open", body);
  return data.data;
}

export type CloseShiftBody = {
  actualCash: number;
  closeNote?: string;
};

export type CloseShiftResult = {
  data: KasirShift;
  summary: {
    salesCash: number;
    salesQris: number;
    salesTransfer: number;
    expectedCash: number;
    actualCash: number;
    discrepancy: number;
  };
};

export async function closeShift(body: CloseShiftBody): Promise<CloseShiftResult> {
  const { data } = await api.post<CloseShiftResult>("/kasir/shifts/close", body);
  return data;
}

export async function getReadyOrders(): Promise<KasirReadyOrder[]> {
  const { data } = await api.get<{ data: KasirReadyOrder[] }>("/kasir/orders/ready");
  return data.data ?? [];
}

export type OrderQueueItem = {
  menuId: string;
  qty: number;
  note?: string;
  modifiers?: { modifierOptionId: string }[];
};

export type QueueOrderBody = {
  source?: "WALK_IN" | "WEB";
  tableId?: string;
  tableLabel?: string;
  customerId?: string;
  customerName?: string;
  orderNote?: string;
  promoId?: string;
  promoCode?: string;
  items: OrderQueueItem[];
};

export async function queueOrder(body: QueueOrderBody): Promise<{ id: string } & Record<string, unknown>> {
  const { data } = await api.post<{ data: { id: string } & Record<string, unknown> }>(
    "/kasir/orders/queue",
    body,
  );
  return data.data;
}

export type PaymentEntry = {
  method: "CASH" | "QRIS" | "TRANSFER" | "DEBIT" | "CREDIT" | "EWALLET";
  amountPaid: number;
  amountReceived?: number;
  label?: string;
};

export async function payReadyOrder(
  readyOrderId: string,
  payments: PaymentEntry[],
): Promise<unknown> {
  const { data } = await api.post<{ data: unknown }>(
    `/kasir/orders/${readyOrderId}/pay`,
    { payments },
  );
  return data.data;
}

export async function cancelPaidOrder(orderId: string, reason: string): Promise<void> {
  await api.post(`/kasir/orders/${orderId}/cancel`, { reason });
}

export async function refundPaidOrder(orderId: string, reason: string): Promise<void> {
  await api.post(`/kasir/orders/${orderId}/refund`, { reason });
}
