import type { CartItem } from "@/features/cart/store/cart.store";
import type { PaymentMethod, Transaction } from "@/types";
import type {
  CheckoutOrderBody,
  CheckoutPayment,
  KasirOrder,
} from "@/lib/api/types";

import type { PosFulfillmentStatus, PosOrder, PosOrderPayment } from "./pos.types";

const WEB_ORDER_TIMEOUT_MS = 30 * 60 * 1000;

export function mapOrderTypeToServiceMode(orderType: string) {
  if (orderType === "Take Away") return "TAKEAWAY" as const;
  if (orderType === "Delivery") return "DELIVERY" as const;
  return "DINE_IN" as const;
}

export function buildPosOrderFromCart(params: {
  orderId: string;
  shiftId?: string;
  cart: CartItem[];
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  orderNote?: string;
  tableLabel?: string;
  orderType: string;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  source?: PosOrder["source"];
  promoCode?: string;
  promoId?: string;
}) {
  const subtotal = params.cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return {
    id: params.orderId,
    createdAt: Date.now(),
    shiftId: params.shiftId,
    source: params.source ?? "WALK_IN",
    status: "PENDING",
    fulfillment: "QUEUED" as PosFulfillmentStatus,
    tableId: params.tableId,
    customerName: params.customerName?.trim() || undefined,
    customerPhone: params.customerPhone?.trim() || undefined,
    orderNote: params.orderNote?.trim() || undefined,
    tableLabel: params.tableLabel?.trim() || undefined,
    serviceMode: mapOrderTypeToServiceMode(params.orderType),
    items: params.cart.map((item) => ({
      id: item.cartId,
      productId: item.productId,
      name: item.productName,
      qty: item.quantity,
      unitPrice: item.unitPrice,
      note: item.note?.trim() || undefined,
      modifierLabels: item.variantLabel ? [item.variantLabel] : undefined,
    })),
    payments: [],
    subtotal,
    discountAmount: params.discountAmount,
    taxAmount: params.taxAmount,
    grandTotal: params.grandTotal,
    promoCode: params.promoCode,
    promoId: params.promoId,
  } satisfies PosOrder;
}

export function calculateOrderPaidAmount(order: PosOrder) {
  return order.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
}

export function calculateOrderRemainingAmount(order: PosOrder) {
  return Math.max(0, order.grandTotal - calculateOrderPaidAmount(order));
}

export function getPaymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case "tunai":
      return "Tunai";
    case "qris":
      return "QRIS";
    case "transfer":
      return "Transfer";
    case "edc":
      return "Kartu";
    case "ewallet":
      return "E-Wallet";
  }
}

export function getPaymentBucket(method: PaymentMethod) {
  if (method === "tunai") return "cash";
  if (method === "qris" || method === "ewallet") return "qris";
  return "transfer";
}

export function appendPaymentToOrder(
  order: PosOrder,
  payment: PosOrderPayment,
): PosOrder {
  const payments = [...order.payments, payment];
  const amountPaid = payments.reduce((sum, item) => sum + item.amountPaid, 0);

  return {
    ...order,
    payments,
    status: amountPaid >= order.grandTotal ? "PAID" : "PARTIALLY_PAID",
  };
}

export function expireStaleWebOrders(orders: PosOrder[], currentTime = Date.now()) {
  return orders.map((order) => {
    if (
      order.source === "WEB" &&
      order.status === "PENDING" &&
      currentTime - order.createdAt >= WEB_ORDER_TIMEOUT_MS
    ) {
      return { ...order, status: "EXPIRED" as const };
    }
    return order;
  });
}

export function buildOrderItemsSummary(order: PosOrder) {
  return order.items
    .map((item) => `${item.name}${item.modifierLabels?.[0] ? ` (${item.modifierLabels[0]})` : ""} x${item.qty}`)
    .join(", ");
}

export function mapPosOrderToTransaction(order: PosOrder): Transaction {
  const paidAmount = calculateOrderPaidAmount(order);
  const createdAt = order.createdAt;
  const time =
    new Date(createdAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

  const status: Transaction["status"] =
    order.status === "CANCELLED" ? "Void" : "Lunas";

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    time,
    createdAt,
    shiftId: order.shiftId,
    table: order.customerName || order.tableLabel || "Tanpa nama",
    items: buildOrderItemsSummary(order),
    amount: `Rp ${order.grandTotal.toLocaleString("id-ID")}`,
    amountValue: paidAmount || order.grandTotal,
    status,
    paymentMethod: order.payments[0]
      ? getPaymentMethodLabel(order.payments[0].method)
      : "Belum dibayar",
    paymentMethodId: order.payments[0]?.method,
  };
}

export function getOutstandingItemIds(order: PosOrder, selectedIds: string[]) {
  return order.items.filter((item) => selectedIds.includes(item.id));
}

export function getSelectedItemsAmount(order: PosOrder, selectedIds: string[]) {
  return getOutstandingItemIds(order, selectedIds).reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0,
  );
}

export function mapPaymentMethodToCheckoutMethod(
  method: PaymentMethod,
): CheckoutPayment["method"] {
  switch (method) {
    case "tunai":
      return "CASH";
    case "qris":
      return "QRIS";
    case "transfer":
      return "TRANSFER";
    case "edc":
      return "DEBIT";
    case "ewallet":
      return "EWALLET";
  }
}

export function buildCheckoutOrderBody(params: {
  cart: CartItem[];
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  orderNote?: string;
  tableLabel?: string;
  promoCode?: string;
  promoId?: string;
  payment?: {
    method: PaymentMethod;
    amountPaid: number;
    amountReceived?: number;
    label?: string;
  };
}): CheckoutOrderBody {
  const customerName = params.customerName?.trim();
  const customerPhone = params.customerPhone?.trim();
  const orderNote = params.orderNote?.trim();
  const tableLabel = params.tableLabel?.trim();
  const promoCode = params.promoCode?.trim();

  return {
    source: "WALK_IN",
    orderType: params.orderType,
    tableId: params.tableId,
    customerName: customerName || undefined,
    customerPhone: customerPhone || undefined,
    orderNote: orderNote || undefined,
    tableLabel: tableLabel || undefined,
    promoCode: promoCode || undefined,
    promoId: params.promoId || undefined,
    items: params.cart.map((item) => ({
      menuId: item.productId,
      menuVariantId: item.variantId,
      qty: item.quantity,
      note: item.note?.trim() || undefined,
    })),
    payments: params.payment
      ? [
          {
            method: mapPaymentMethodToCheckoutMethod(params.payment.method),
            amountPaid: params.payment.amountPaid,
            amountReceived: params.payment.amountReceived,
            label: params.payment.label?.trim() || undefined,
          },
        ]
      : [],
  };
}

function formatKasirOrderTime(value: string) {
  return (
    new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

export function mapKasirOrderToTransaction(order: KasirOrder): Transaction {
  const status: Transaction["status"] =
    order.status === "CANCELLED"
      ? "Void"
      : order.status === "REFUND"
        ? "Refund"
        : "Lunas";

  const firstPayment = order.payments[0];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    time: formatKasirOrderTime(order.paidAt ?? order.createdAt),
    createdAt: new Date(order.createdAt).getTime(),
    shiftId: order.shiftId,
    table: order.customerName || order.tableLabel || "Tanpa nama",
    items: order.items
      .map((item) =>
        `${item.nameSnapshot}${item.variantNameSnapshot ? ` (${item.variantNameSnapshot})` : ""} x${item.qty}`,
      )
      .join(", "),
    amount: `Rp ${order.grandTotal.toLocaleString("id-ID")}`,
    amountValue: order.grandTotal,
    status,
    paymentMethod: firstPayment?.label || firstPayment?.method || "Belum dibayar",
    paymentMethodId:
      firstPayment?.method === "CASH"
        ? "tunai"
        : firstPayment?.method === "QRIS"
          ? "qris"
          : firstPayment?.method === "TRANSFER"
            ? "transfer"
            : firstPayment?.method === "DEBIT" || firstPayment?.method === "CREDIT"
              ? "edc"
              : firstPayment?.method === "EWALLET"
                ? "ewallet"
                : undefined,
  };
}
