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
  orderNote: string | null;
  items: unknown;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  promoId: string | null;
  grandTotal: number;
  readyAt: string;
  createdAt: string;
};
