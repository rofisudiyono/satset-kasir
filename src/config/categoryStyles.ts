/**
 * Category styling constants
 * Used across product listings, cart, and menu
 */

import type { ProductCategory } from "@/types";
import type { Ionicons } from "@expo/vector-icons";
import type React from "react";

export const CATEGORY_COLORS: Record<
  ProductCategory,
  { bg: string; color: string }
> = {
  Makanan: { bg: "#fef3c7", color: "#b45309" },
  Minuman: { bg: "#ecfdf5", color: "#047857" },
  Snack: { bg: "#fffbeb", color: "#d97706" },
};

export const CATEGORY_ICONS: Record<
  ProductCategory,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  Makanan: "restaurant-outline",
  Minuman: "cafe-outline",
  Snack: "pizza-outline",
};

export const STOCK_BADGE: Record<
  string,
  { bg: string; color: string; label: string } | null
> = {
  empty: { bg: "#ffe4e6", color: "#e11d48", label: "Habis" },
  low: { bg: "#fef3c7", color: "#b45309", label: "Tipis" },
  inactive: { bg: "#e9ede9", color: "#5b7268", label: "Nonaktif" },
  normal: null,
};
