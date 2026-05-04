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

export type KasirTenantInfo = {
  tenantName: string | null;
  logoPath: string | null;
  branchName: string | null;
  address?: string | null;
  phone?: string | null;
  tenantAddress?: string | null;
  tenantPhone?: string | null;
  branchAddress?: string | null;
  branchPhone?: string | null;
  defaultPaymentTiming: 'PREPAY' | 'POSTPAY';
};

// ─── Unpaid Orders (Post-Pay) ─────────────────────────────────────────────────

export type KasirUnpaidOrderItem = {
  id: string;
  menuId: string | null;
  nameSnapshot: string;
  variantNameSnapshot: string | null;
  qty: number;
  unitPriceSnapshot: number;
  note: string | null;
  modifiers: { id: string; labelSnapshot: string; extraPriceSnapshot: number }[];
};

export type KasirUnpaidOrder = {
  id: string;
  tableId: string | null;
  tableLabel: string | null;
  customerName: string | null;
  orderNote: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  fulfillmentStatus: string;
  createdAt: string;
  items: KasirUnpaidOrderItem[];
};

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
  sku?: string | null;
  name: string;
  imageUrl?: string | null;
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
  menuId: string | null;
  menuVariantId: string | null;
  nameSnapshot: string;
  variantNameSnapshot: string | null;
  unitPriceSnapshot: number;
  qty: number;
  note: string | null;
  modifiers?: KasirOrderItemModifier[];
};

export type KasirOrderItemModifier = {
  id: string;
  modifierOptionId?: string | null;
  labelSnapshot: string;
  extraPriceSnapshot: number;
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
  branchId?: string;
  shiftId: string;
  source: "WALK_IN" | "WEB";
  customerName: string | null;
  tableLabel: string | null;
  status: "PAID" | "CANCELLED" | "REFUND";
  paymentStatus?: "PENDING" | "PENDING_MANUAL_APPROVAL" | "PAID" | "FAILED" | "REFUNDED";
  /** Setelah lunas: apakah pesanan sudah diserahkan ke pelanggan (backend `orders.fulfillment_status`). */
  fulfillmentStatus?: KasirOrderFulfillmentStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  items: KasirOrderItem[];
  payments: KasirOrderPayment[];
  voidReason?: string | null;
  refundReason?: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type KasirOrderHistoryScope = "shift" | "branch";

export type GetOrderHistoryParams = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  q?: string;
  status?: KasirOrder["status"];
  scope?: KasirOrderHistoryScope;
};

export type KasirOrderDetail = KasirOrder;

export type KasirApprovalRequest = {
  id: string;
  tenantId: string;
  branchId: string;
  orderId: string;
  requestedBy: string;
  reviewedBy: string | null;
  type: "VOID" | "REFUND";
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  reason: string;
  reviewNote: string | null;
  expiresAt: string | null;
  createdAt: string;
  reviewedAt: string | null;
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
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  orderNote?: string;
  promoCode?: string;
  promoId?: string;
  items: CheckoutOrderItem[];
  payments?: CheckoutPayment[];
};

// ─── Promo ────────────────────────────────────────────────────────────────────

export type KasirPromoRecord = {
  id: string;
  code: string | null;
  name: string;
  type: "percent" | "fixed";
  value: string;
  minPurchase: number;
  appliesTo: "all" | "specific_menu";
  menuIds: string[] | null;
  startDate: string;
  endDate: string;
  usageCount: number;
  maxUsage: number | null;
};

export type ValidatePromoResponse = {
  promoId: string;
  code: string | null;
  name: string;
  type: "percent" | "fixed";
  value: string;
  discount: number;
  subtotalAfterDiscount: number;
};

// ─── Tax Settings ─────────────────────────────────────────────────────────────

export type KasirTaxSettings = {
  id: string;
  tenantId: string;
  isEnabled: boolean;
  rate: string;
  type: "inclusive" | "exclusive";
  label: string;
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
  orderId: string | null;
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
  canMarkDelivered: boolean;
  isFinalOrder: boolean;
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
