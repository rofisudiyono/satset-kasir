import type { Ionicons } from "@expo/vector-icons";
import type { StyleProp, ViewStyle } from "react-native";

export type ProductStockStatus = "normal" | "low" | "empty" | "inactive";

export interface ProductCardProps {
  name: string;
  imageUrl?: string;
  basePrice: number;
  categoryIcon: React.ComponentProps<typeof Ionicons>["name"];
  categoryIconBg: string;
  categoryIconColor: string;
  categoryLabel?: string;
  sku?: string;
  stockStatus: ProductStockStatus;
  availabilityReason?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "NO_RECIPE" | "HIDDEN";
  onAdd: () => void;
  width?: number;
  compact?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}
