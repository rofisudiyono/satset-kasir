/**
 * Type exports
 */

export type {
  CatalogProduct,
  CatalogStockStatus,
  VariantGroup,
  VariantOption,
} from "@/features/catalog/catalog.types";
export type {
  CategoryFilter,
  ProductCategory,
} from "@/features/catalog/category.types";
export type {
  Product,
  ProductDetail,
  ProductVariantGroup,
  ProductVariantOption,
  SortOption,
  StockStatus,
} from "@/features/inventory/inventory.types";
export type {
  AppliedPromo,
  CashNumpadKey,
  OrderType,
  PaymentMethod,
  PaymentMethodOption,
  PromoConfig,
} from "@/features/payment/payment.types";
export type {
  IoniconName as SettingIoniconName,
  SettingRowProps,
} from "@/features/settings/settings.types";
export type {
  ReceiptItem,
  StoreInfo,
  Transaction,
  TxStatus,
} from "@/features/transactions/transaction.types";
export type {
  PosFulfillmentStatus,
  PosOrder,
  PosOrderItem,
  PosOrderPayment,
  PosOrderSource,
  PosOrderStatus,
  PosShift,
  ShiftSlot,
} from "@/features/pos/pos.types";
export type {
  KdsFulfillmentEvent,
  KdsNotificationItem,
} from "@/features/pos/kds.types";
export type { FilterTab } from "./filters.types";
export type { IoniconName } from "./icons.types";
export type { TabConfig } from "./navigation.types";
