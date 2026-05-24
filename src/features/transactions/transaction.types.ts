/**
 * Transaction types
 */

import type { PaymentMethod } from "@/features/payment/payment.types";

export type TxStatus = "Lunas" | "Void" | "Refund";

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
}

export interface Transaction {
  id: string;
  /** Nomor nota human-readable dari backend (contoh: 260525-0001). */
  orderNumber?: string;
  time: string;
  createdAt?: number; // epoch ms
  /**
   * The shift that produced this transaction (to support shift-scoped reports).
   */
  shiftId?: string;
  table?: string;
  amount: string;
  /**
   * Numeric amount to support calculations (shift summary, etc.)
   */
  amountValue?: number;
  status: TxStatus;
  items?: string;
  /**
   * Display label. Kept for backward compatibility with existing UI.
   */
  paymentMethod?: string;
  /**
   * Normalized method id from Payment module.
   */
  paymentMethodId?: PaymentMethod;
}
