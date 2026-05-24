import { atomWithMMKV } from "@/store/storage";
import type { AppliedPromo, OrderType, ProductCategory } from "@/types";
import { atom } from "jotai";

export interface CartItem {
  cartId: string;
  productId: string;   // maps to menuId on backend
  productName: string;
  category: ProductCategory;
  variantId?: string;  // maps to menuVariantId on backend (UUID)
  variantLabel?: string;
  note?: string;
  quantity: number;
  unitPrice: number;
}

export const cartAtom = atom<CartItem[]>([]);

export const cartTotalItemsAtom = atom((get) =>
  get(cartAtom).reduce((total, item) => total + item.quantity, 0),
);

export const cartTotalPriceAtom = atom((get) =>
  get(cartAtom).reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  ),
);

// Signals the transaksi-baru page that a barcode was scanned
export const scannedBarcodeAtom = atom<string | null>(null);

// Snapshot of the cart at payment time — used to build the checkout payload and success receipt.
export const cartSnapshotAtom = atom<CartItem[]>([]);

// ─── Hold Order ───────────────────────────────────────────────────────────────

export interface HeldOrder {
  id: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  orderNote: string;
  customerVisitStatus: CustomerVisitStatus;
  tableId?: string;
  tableLabel?: string;
  tableNumber: string;
  orderType: OrderType;
  createdAt: string;
  label: string; // display label, e.g. "Meja 3" or "Budi"
}

export const heldOrdersAtom = atomWithMMKV<HeldOrder[]>("heldOrders", []);

export const heldOrdersCountAtom = atom((get) => get(heldOrdersAtom).length);

export type CustomerVisitStatus = "returning" | "new";

export interface CartOrderDraft {
  customerName: string;
  customerPhone: string;
  orderNote: string;
  customerVisitStatus: CustomerVisitStatus | null;
  orderType: OrderType;
  tableId?: string;
  tableLabel?: string;
}

export const cartOrderDraftAtom = atomWithMMKV<CartOrderDraft>("cartOrderDraft", {
  customerName: "",
  customerPhone: "",
  orderNote: "",
  customerVisitStatus: null,
  orderType: "Dine In",
  tableId: undefined,
  tableLabel: undefined,
});

export const cartCheckoutContextAtom = atom<{
  appliedPromo: AppliedPromo | null;
  promoEnabled: boolean;
}>({
  appliedPromo: null,
  promoEnabled: false,
});
