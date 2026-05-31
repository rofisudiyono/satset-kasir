import { api } from "./client";

import type {
  CheckoutOrderBody,
  GetOrderHistoryParams,
  KasirBill,
  KasirBillDetail,
  KasirMenu,
  KasirOrderDetail,
  KasirOrder,
  KasirPromoRecord,
  KasirReadyOrder,
  KasirShift,
  KasirTable,
  KasirTaxSettings,
  KasirTenantInfo,
  KasirApprovalRequest,
  KasirUnpaidOrder,
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

/** Tandai order final sudah diserahkan ke pelanggan (`orders.id`). */
export async function deliverPaidOrder(orderId: string): Promise<unknown> {
  const { data } = await api.post<{ data: unknown }>(
    `/kasir/orders/${orderId}/deliver`,
    {},
  );
  return data.data;
}

export async function requestCancelPaidOrder(
  orderId: string,
  reason: string,
): Promise<KasirApprovalRequest> {
  const { data } = await api.post<{ data: KasirApprovalRequest }>(
    `/kasir/orders/${orderId}/cancel-request`,
    { reason },
  );
  return data.data;
}

export async function requestRefundPaidOrder(
  orderId: string,
  reason: string,
): Promise<KasirApprovalRequest> {
  const { data } = await api.post<{ data: KasirApprovalRequest }>(
    `/kasir/orders/${orderId}/refund-request`,
    { reason },
  );
  return data.data;
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

// ─── Bills ───────────────────────────────────────────────────────────────────

export async function getBills(): Promise<KasirBill[]> {
  const { data } = await api.get<{ data: KasirBill[] }>("/kasir/bills");
  return data.data ?? [];
}

export async function getBillDetail(billId: string): Promise<KasirBillDetail> {
  const { data } = await api.get<{ data: KasirBillDetail }>(`/kasir/bills/${billId}`);
  return data.data;
}

export async function createBill(body: { label: string; tableId?: string }): Promise<KasirBill> {
  const { data } = await api.post<{ data: KasirBill }>("/kasir/bills", body);
  return data.data;
}

export async function addOrderToBill(billId: string, body: Omit<CheckoutOrderBody, "payments">): Promise<void> {
  await api.post(`/kasir/bills/${billId}/orders`, body);
}

export type CollectBillPaymentBody = {
  method: "CASH" | "QRIS" | "TRANSFER" | "DEBIT" | "CREDIT" | "EWALLET" | "VA";
  amountPaid: number;
  amountReceived?: number;
  label?: string;
};

export async function collectBillPayment(billId: string, body: CollectBillPaymentBody): Promise<void> {
  await api.post(`/kasir/bills/${billId}/collect-payment`, body, {
    headers: { "X-Idempotency-Key": `bill-${billId}-${Date.now()}` },
  });
}

// ─── Post-Pay ─────────────────────────────────────────────────────────────────

export async function getUnpaidOrders(): Promise<KasirUnpaidOrder[]> {
  const { data } = await api.get<{ data: KasirUnpaidOrder[] }>("/kasir/orders/unpaid");
  return data.data ?? [];
}

export type CollectPaymentBody = {
  payments: PaymentEntry[];
};

export async function collectPayment(orderId: string, body: CollectPaymentBody): Promise<void> {
  await api.post(`/kasir/orders/${orderId}/collect-payment`, body);
}
