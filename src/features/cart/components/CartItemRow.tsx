/**
 * CartItemRow — Individual cart/order item row with quantity and note controls
 *
 * Used in keranjang (cart) and potentially in order review screens
 * Displays product info, variants, quantity controls, notes, and price
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { XStack, YStack } from "tamagui";

import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/categoryStyles";
import type { CartItem } from "@/features/cart/store/cart.store";
import { TextBodyLg, TextCaption } from "@/components/atoms/Typography";
import {
  ColorBase,
  ColorDanger,
  ColorNeutral,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

const styles = StyleSheet.create({
  cartItemRow: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: ColorNeutral.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnPrimary: {
    backgroundColor: BrandColors.buttonSolid,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: ColorDanger.danger100,
    alignItems: "center",
    justifyContent: "center",
  },
});

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (cartId: string, qty: number) => void;
  onRemove: (cartId: string) => void;
  onOpenNote: (cartId: string) => void;
}

export const CartItemRow = React.memo(function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  onOpenNote,
}: CartItemRowProps) {
  const categoryColor = CATEGORY_COLORS[item.category] ?? {
    bg: ColorNeutral.neutral100,
    color: ColorNeutral.neutral500,
  };
  const categoryIcon = CATEGORY_ICONS[item.category] ?? "bag-outline";

  return (
    <View style={styles.cartItemRow}>
      {/* Product icon */}
      <View style={[styles.itemIcon, { backgroundColor: categoryColor.bg }]}>
        <Ionicons name={categoryIcon} size={26} color={categoryColor.color} />
      </View>

      {/* Info + controls */}
      <YStack flex={1} gap={4}>
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap={2}>
            <TextBodyLg fontWeight="700" numberOfLines={2} lineHeight={20}>
              {item.productName}
            </TextBodyLg>
            {item.variantLabel && (
              <TextCaption color="$colorSecondary">
                {item.variantLabel}
              </TextCaption>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onOpenNote(item.cartId)}
            >
              <TextCaption
                color={item.note ? "$colorSecondary" : "$colorTertiary"}
                fontStyle="italic"
              >
                {item.note ? item.note : "Tambah catatan..."}
              </TextCaption>
            </TouchableOpacity>
            <TextCaption color="$colorSecondary">
              {formatPrice(item.unitPrice)} / item
            </TextCaption>
          </YStack>

          {/* Qty controls + price */}
          <YStack alignItems="flex-end" gap={6} marginLeft={12}>
            <XStack alignItems="center" gap={10}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  item.quantity > 1
                    ? onUpdateQty(item.cartId, item.quantity - 1)
                    : onRemove(item.cartId)
                }
              >
                <View style={styles.qtyBtn}>
                  <Ionicons
                    name="remove"
                    size={16}
                    color={ColorNeutral.neutral700}
                  />
                </View>
              </TouchableOpacity>

              <TextBodyLg fontWeight="700" minWidth={20} textAlign="center">
                {item.quantity}
              </TextBodyLg>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onUpdateQty(item.cartId, item.quantity + 1)}
              >
                <View style={[styles.qtyBtn, styles.qtyBtnPrimary]}>
                  <Ionicons name="add" size={16} color={ColorBase.white} />
                </View>
              </TouchableOpacity>
            </XStack>

            <TextBodyLg fontWeight="700" color="$primary">
              {formatPrice(item.unitPrice * item.quantity)}
            </TextBodyLg>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onRemove(item.cartId)}
            >
              <View style={styles.deleteBtn}>
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={ColorDanger.danger600}
                />
              </View>
            </TouchableOpacity>
          </YStack>
        </XStack>
      </YStack>
    </View>
  );
});
