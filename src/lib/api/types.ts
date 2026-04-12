/** User payload dari JWT / login (selaras backend JWTPayload + metadata UI). */
export type AuthUser = {
  id: string;
  type: "superadmin" | "tenant_user";
  role: string;
  tenantId: string | null;
  branchId: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  /** Email yang dipakai login (untuk tampilan; tidak ada di JWT). */
  email?: string;
};

export type ApiErrorBody = {
  error?: string;
  message?: string;
};

export type ShiftSlotApi = "PAGI" | "SIANG" | "MALAM";

// ─── Menu (Kasir) ─────────────────────────────────────────────────────────────

export type KasirMenuVariant = {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
};

export type KasirMenu = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  hasRecipe: boolean;
  isActive: boolean;
  isAvailable: boolean;
  availabilityReason: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "NO_RECIPE" | "HIDDEN";
  hasVariants: boolean;
  variants: KasirMenuVariant[];
};

export type KasirTable = {
  id: string;
  branchId: string;
  label: string;
  capacity: number | null;
  isActive: boolean;
  branch: {
    id: string;
    name: string;
  } | null;
};

// ─── Order History ────────────────────────────────────────────────────────────

export type KasirOrderItem = {
  id: string;
  menuId: string;
  menuVariantId: string | null;
  nameSnapshot: string;
  variantNameSnapshot: string | null;
  unitPriceSnapshot: number;
  qty: number;
  note: string | null;
};

export type KasirOrderPayment = {
  id: string;
  method: string;
  amountPaid: number;
  amountReceived: number | null;
  label: string | null;
  paidAt: string;
};

export type KasirOrderFulfillmentStatus =
  | "QUEUED"
  | "COOKING"
  | "READY"
  | "DELIVERED";

export type KasirOrder = {
  id: string;
  shiftId: string;
  source: "WALK_IN" | "WEB";
  customerName: string | null;
  tableLabel: string | null;
  status: "PAID" | "CANCELLED" | "REFUND";
  /** Setelah lunas: apakah pesanan sudah diserahkan ke pelanggan (backend `orders.fulfillment_status`). */
  fulfillmentStatus?: KasirOrderFulfillmentStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  items: KasirOrderItem[];
  payments: KasirOrderPayment[];
  paidAt: string | null;
  createdAt: string;
};

// ─── Checkout ─────────────────────────────────────────────────────────────────

export type CheckoutOrderItem = {
  menuId: string;
  menuVariantId?: string;
  qty: number;
  note?: string;
  modifiers?: { modifierOptionId: string }[];
};

export type CheckoutPayment = {
  method: "CASH" | "QRIS" | "TRANSFER" | "DEBIT" | "CREDIT" | "EWALLET";
  amountPaid: number;
  amountReceived?: number;
  label?: string;
};

export type CheckoutOrderBody = {
  source?: "WALK_IN" | "WEB";
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableId?: string;
  tableLabel?: string;
  customerName?: string;
  orderNote?: string;
  promoCode?: string;
  items: CheckoutOrderItem[];
  payments: CheckoutPayment[];
};

export type KasirShift = {
  id: string;
  tenantId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  shiftSlot: ShiftSlotApi;
  status: "OPEN" | "CLOSED";
  openingCash: number;
  salesCash: number;
  salesQris: number;
  salesTransfer: number;
  expectedCash: number;
  actualCash: number | null;
  discrepancy: number | null;
  closeNote: string | null;
  openedAt: string;
  closedAt: string | null;
};

export type KasirReadyPaymentStatus =
  | "PENDING"
  | "PENDING_MANUAL_APPROVAL"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type KasirReadyOrder = {
  id: string;
  tenantId: string;
  branchId: string;
  shiftId: string;
  source: "WALK_IN" | "WEB";
  tableId: string | null;
  tableLabel: string | null;
  customerId: string | null;
  customerName: string | null;
  customerPhone?: string | null;
  orderNote: string | null;
  webPaymentMode?: "MANUAL" | "ONLINE" | null;
  paymentStatus?: KasirReadyPaymentStatus;
  trackingToken?: string | null;
  items: unknown;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  promoId: string | null;
  grandTotal: number;
  readyAt: string;
  createdAt: string;
};

// ─── Pending Web Orders ───────────────────────────────────────────────────────

export type TempOrderItemSnapshot = {
  menuId: string;
  menuVariantId?: string;
  name: string;
  variantName?: string;
  qty: number;
  unitPrice: number;
  note?: string;
  modifiers: { label: string; extraPrice: number }[];
};

export type PendingWebOrder = {
  id: string;
  tenantId: string;
  branchId: string;
  shiftId: string;
  tableId: string | null;
  tableLabel: string | null;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  webPaymentMode: "MANUAL" | "ONLINE";
  trackingToken: string | null;
  orderNote: string | null;
  items: TempOrderItemSnapshot[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  promoId: string | null;
  grandTotal: number;
  createdAt: string;
};
