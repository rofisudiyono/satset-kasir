import { api } from "./client";

import type {
  CheckoutOrderBody,
  GetOrderHistoryParams,
  KasirMenu,
  KasirOrderDetail,
  KasirOrder,
  KasirPromoRecord,
  KasirReadyOrder,
  KasirShift,
  KasirTable,
  KasirTaxSettings,
  KasirTenantInfo,
  PendingWebOrder,
  ShiftSlotApi,
  ValidatePromoResponse,
} from "./types";

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
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
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

/** Order WEB mode manual: dapur selesai → menunggu kasir mencatat pembayaran (sama payload dengan `/pay`). */
export async function manualApproveReadyOrder(
  readyOrderId: string,
  payments: PaymentEntry[],
): Promise<unknown> {
  const { data } = await api.post<{ data: unknown }>(
    `/kasir/orders/${readyOrderId}/manual-approve`,
    { payments },
  );
  return data.data;
}

/** Tandai order final sudah diserahkan ke pelanggan (`orders.id`, bukan id temp siap bayar). */
export async function deliverPaidOrder(orderId: string): Promise<unknown> {
  const { data } = await api.post<{ data: unknown }>(
    `/kasir/orders/${orderId}/deliver`,
    {},
  );
  return data.data;
}

export async function cancelPaidOrder(orderId: string, reason: string): Promise<void> {
  await api.post(`/kasir/orders/${orderId}/cancel`, { reason });
}

export async function refundPaidOrder(orderId: string, reason: string): Promise<void> {
  await api.post(`/kasir/orders/${orderId}/refund`, { reason });
}

export async function getMenus(): Promise<KasirMenu[]> {
  const { data } = await api.get<{ data: KasirMenu[] }>("/kasir/menus");
  return data.data ?? [];
}

export async function getTables(branchId?: string): Promise<KasirTable[]> {
  const { data } = await api.get<{ data: KasirTable[] }>("/kasir/tables", {
    params: {
      branchId: branchId || undefined,
    },
  });
  return data.data ?? [];
}

export async function getOrderHistory(params?: GetOrderHistoryParams): Promise<KasirOrder[]> {
  const { data } = await api.get<{ data: KasirOrder[] }>("/kasir/orders", {
    params: {
      page: params?.page,
      limit: params?.limit,
      from: params?.from,
      to: params?.to,
      q: params?.q,
      status: params?.status,
      scope: params?.scope,
    },
  });
  return data.data ?? [];
}

export async function getOrderDetail(orderId: string): Promise<KasirOrderDetail> {
  const { data } = await api.get<{ data: KasirOrderDetail }>(`/kasir/orders/${orderId}`);
  return data.data;
}

export async function checkoutOrder(body: CheckoutOrderBody): Promise<KasirOrder> {
  const { data } = await api.post<{ data: KasirOrder }>("/kasir/orders/checkout", body);
  return data.data;
}

// ─── Pending Web Orders ───────────────────────────────────────────────────────

export async function getPendingWebOrders(): Promise<PendingWebOrder[]> {
  const { data } = await api.get<{ data: PendingWebOrder[] }>("/kasir/orders/pending-web");
  return data.data ?? [];
}

export async function confirmPendingWebOrder(
  pendingId: string,
  payments: PaymentEntry[],
): Promise<KasirOrder> {
  const { data } = await api.post<{ data: KasirOrder }>(
    `/kasir/orders/pending-web/${pendingId}/confirm`,
    { payments },
  );
  return data.data;
}

export async function cancelPendingWebOrder(pendingId: string): Promise<void> {
  await api.delete(`/kasir/orders/pending-web/${pendingId}`);
}

// ─── Promos ───────────────────────────────────────────────────────────────────

export async function getActivePromos(): Promise<KasirPromoRecord[]> {
  const { data } = await api.get<{ data: KasirPromoRecord[] }>("/kasir/promos");
  return data.data ?? [];
}

export async function validatePromoCode(payload: {
  code: string;
  subtotal: number;
  menuIds?: string[];
}): Promise<ValidatePromoResponse> {
  const { data } = await api.post<{ data: ValidatePromoResponse }>(
    "/kasir/promos/validate",
    payload,
  );
  return data.data;
}

// ─── Tax Settings ─────────────────────────────────────────────────────────────

export async function getTaxSettings(): Promise<KasirTaxSettings | null> {
  const { data } = await api.get<{ data: KasirTaxSettings | null }>("/kasir/settings/tax");
  return data.data ?? null;
}

export async function getTenantInfo(): Promise<KasirTenantInfo> {
  const { data } = await api.get<{ data: KasirTenantInfo }>("/kasir/tenant-info");
  return data.data;
}
