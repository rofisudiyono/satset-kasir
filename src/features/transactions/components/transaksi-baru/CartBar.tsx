import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { YStack } from "tamagui";

import { TextBodyLg, TextBodySm } from "@/components/atoms/Typography";
import { ColorBase } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

type Props = {
  totalItems: number;
  totalPrice: number;
  onPress: () => void;
  isBillMode?: boolean;
};

export function CartBar({ totalItems, totalPrice, onPress, isBillMode = false }: Props) {
  if (totalItems === 0) return null;

  return (
    <View style={styles.cartBar}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.cartBarInner}
      >
        <View style={styles.cartBarIcon}>
          <Ionicons
            name={isBillMode ? "add-circle-outline" : "bag-outline"}
            size={20}
            color={ColorBase.white}
          />
        </View>
        <YStack flex={1} gap={1}>
          <TextBodySm color="rgba(255,255,255,0.75)" fontWeight="600">
            {totalItems} item dipilih
          </TextBodySm>
          <TextBodyLg fontWeight="800" color={ColorBase.white}>
            {formatPrice(totalPrice)}
          </TextBodyLg>
        </YStack>
        <View style={styles.cartBarButton}>
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            {isBillMode ? "Tambah ke Tagihan" : "Bayar"}
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
  },
  cartBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.buttonSolid,
    borderRadius: 14,
    padding: 12,
  },
  cartBarIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
