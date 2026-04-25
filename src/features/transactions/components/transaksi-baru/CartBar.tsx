import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { YStack } from "tamagui";

import { TextBodyLg, TextBodySm } from "@/components";
import { ColorBase } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

type Props = {
  totalItems: number;
  totalPrice: number;
  onPress: () => void;
};

export function CartBar({ totalItems, totalPrice, onPress }: Props) {
  if (totalItems === 0) return null;

  return (
    <View style={styles.cartBar}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.cartBarInner}
      >
        <View style={styles.cartBarIcon}>
          <Ionicons name="bag-outline" size={20} color={BrandColors.text} />
        </View>
        <YStack flex={1} gap={1}>
          <TextBodySm color="rgba(8,116,95,0.7)" fontWeight="600">
            {totalItems} item dipilih
          </TextBodySm>
          <TextBodyLg fontWeight="800" color={BrandColors.text}>
            {formatPrice(totalPrice)}
          </TextBodyLg>
        </YStack>
        <View style={styles.cartBarButton}>
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            Proses
          </TextBodyLg>
          <Ionicons name="arrow-forward" size={16} color={ColorBase.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 10,
    backgroundColor: BrandColors.surface,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    shadowColor: BrandColors.deep,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.tint,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
  },
  cartBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BrandColors.tintStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBarButton: {
    backgroundColor: BrandColors.green,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
