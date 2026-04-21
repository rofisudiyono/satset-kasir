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
  Makanan: { bg: "#FFEDD5", color: "#EA580C" },
  Minuman: { bg: "#E8FAF8", color: "#129A8F" },
  Snack: { bg: "#FEF3C7", color: "#D97706" },
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
  empty: { bg: "#FEE2E2", color: "#DC2626", label: "Habis" },
  low: { bg: "#FEF3C7", color: "#D97706", label: "Tipis" },
  inactive: { bg: "#F3F4F6", color: "#6B7280", label: "Nonaktif" },
  normal: null,
};
