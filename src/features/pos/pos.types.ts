/**
 * POS domain types (Kasir flow alignment)
 *
 * P0 note:
 * - These types are intentionally separate from `Transaction` (riwayat UI lama).
 * - Implementation will gradually migrate to these in P1+.
 */

import type { PaymentMethod } from "@/features/payment/payment.types";

export type PosOrderSource = "WALK_IN" | "WEB";

export type PosOrderStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";

export type PosFulfillmentStatus = "QUEUED" | "PREPARING" | "READY" | "SERVED";

export type ShiftSlot = "PAGI" | "SIANG" | "MALAM";

export interface PosOrderItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  note?: string;
  // Future: modifiers/add-ons
  modifierLabels?: string[];
}

export interface PosOrderPayment {
  id: string;
  method: PaymentMethod;
  amountPaid: number;
  /**
   * Cash-only. Amount received from customer to calculate change.
   */
  amountReceived?: number;
  /**
   * Optional label for partial/split payments (e.g. "Split 1/2", "DP", etc.)
   */
  label?: string;
  paidAt: number; // epoch ms
}

export interface PosOrder {
  id: string;
  createdAt: number; // epoch ms
  shiftId?: string;
  source: PosOrderSource;
  status: PosOrderStatus;
  fulfillment: PosFulfillmentStatus;

  tableId?: string;
  tableLabel?: string;
  customerName?: string;
  serviceMode?: "DINE_IN" | "TAKEAWAY" | "DELIVERY";

  items: PosOrderItem[];
  payments: PosOrderPayment[];

  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  promoCode?: string;
}

export interface PosShift {
  id: string;
  openedAt: number; // epoch ms
  closedAt?: number; // epoch ms
  slot: ShiftSlot;

  cashierName: string;
  openingCash: number;

  salesCash: number;
  salesQris: number;
  salesTransfer: number;

  actualCash?: number;
  expectedCash: number;
  discrepancy?: number;
  closeNote?: string;
}
