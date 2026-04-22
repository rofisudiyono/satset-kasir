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
  Makanan: { bg: "#F0DEC8", color: "#874914" },
  Minuman: { bg: "#D8E9E6", color: "#327A74" },
  Snack: { bg: "#F3E6C9", color: "#8B4F10" },
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
  empty: { bg: "#F5D5D1", color: "#B42318", label: "Habis" },
  low: { bg: "#F3E6C9", color: "#8B4F10", label: "Tipis" },
  inactive: { bg: "#F3F4F6", color: "#6B7280", label: "Nonaktif" },
  normal: null,
};
