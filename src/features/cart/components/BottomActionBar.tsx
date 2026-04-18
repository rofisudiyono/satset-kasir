import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { XStack } from "tamagui";

import { TextBodyLg } from "@/components";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSurface } from "@/themes/Colors";

interface BottomActionBarProps {
  cartLength: number;
  onHoldOrder: () => void;
  onPay: () => void;
}

export function BottomActionBar({
  cartLength,
  onHoldOrder,
  onPay,
}: BottomActionBarProps) {
  return (
    <View style={styles.bottomBar}>
      <XStack gap={10}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.holdOrderBtn}
          onPress={onHoldOrder}
        >
          <TextBodyLg fontWeight="700" color="$colorSecondary">
            Tahan Order
          </TextBodyLg>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.payBtn, cartLength === 0 && { opacity: 0.5 }]}
          disabled={cartLength === 0}
          onPress={onPay}
        >
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            Lanjut Bayar
          </TextBodyLg>
        </TouchableOpacity>
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorBase.white,
    borderTopWidth: 1,
    borderTopColor: ColorSurface.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  holdOrderBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ColorNeutral.neutral200,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
});
