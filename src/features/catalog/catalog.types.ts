/**
 * Catalog and menu types
 */

import type { ProductCategory } from "./category.types";

export type StockStatus = "normal" | "low" | "empty" | "inactive";
export type CatalogStockStatus = Exclude<StockStatus, "inactive">;

export interface VariantOption {
  id: string;
  label: string;
  priceAdd: number;
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  imageUrl?: string;
  category: ProductCategory;
  basePrice: number;
  stockStatus: StockStatus;
  isAvailable?: boolean;
  availabilityReason?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "NO_RECIPE" | "HIDDEN";
  variants?: VariantGroup[];
  barcode?: string;
}
