import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { XStack } from "tamagui";

import { TextBodyLg } from "@/components";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSurface } from "@/themes/Colors";

interface BottomActionBarProps {
  cartLength: number;
  onHoldOrder: () => void;
  onPay: () => void;
  compact?: boolean;
}

export function BottomActionBar({
  cartLength,
  onHoldOrder,
  onPay,
  compact = false,
}: BottomActionBarProps) {
  return (
    <View style={[styles.bottomBar, compact && styles.bottomBarCompact]}>
      <XStack gap={compact ? 8 : 10}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.holdOrderBtn, compact && styles.actionBtnCompact]}
          onPress={onHoldOrder}
        >
          <TextBodyLg
            fontWeight="800"
            fontSize={compact ? 13 : undefined}
            color="$colorSecondary"
          >
            Tahan Order
          </TextBodyLg>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.payBtn,
            compact && styles.actionBtnCompact,
            cartLength === 0 && { opacity: 0.5 },
          ]}
          disabled={cartLength === 0}
          onPress={onPay}
        >
          <TextBodyLg
            fontWeight="800"
            fontSize={compact ? 13 : undefined}
            color={ColorBase.white}
          >
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
  bottomBarCompact: {
    backgroundColor: "rgba(251, 252, 250, 0.98)",
    borderTopColor: "rgba(31, 41, 55, 0.06)",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
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
  actionBtnCompact: {
    height: 48,
    borderRadius: 12,
  },
});
