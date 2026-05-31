import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { TextBodyLg } from "@/components/atoms/Typography";
import { ColorBase, ColorSurface } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

interface BottomActionBarProps {
  cartLength: number;
  onHoldOrder?: () => void;
  onPay: () => void;
  compact?: boolean;
  isBillMode?: boolean;
  isLoading?: boolean;
}

export function BottomActionBar({
  cartLength,
  onHoldOrder,
  onPay,
  compact = false,
  isBillMode = false,
  isLoading = false,
}: BottomActionBarProps) {
  const isCartEmpty = cartLength === 0;
  const disabled = isCartEmpty || isLoading;

  if (isBillMode) {
    return (
      <View style={[styles.bottomBar, compact && styles.bottomBarCompact]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.billBtn, compact && styles.actionBtnCompact, disabled && styles.actionBtnDisabled]}
          disabled={disabled}
          onPress={onPay}
        >
          <Ionicons name="add-circle-outline" size={18} color={ColorBase.white} style={{ marginRight: 6 }} />
          <TextBodyLg fontWeight="800" fontSize={compact ? 13 : undefined} color={ColorBase.white}>
            Tambah ke Tagihan
          </TextBodyLg>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.bottomBar, compact && styles.bottomBarCompact]}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.payBtn,
          compact && styles.actionBtnCompact,
          disabled && styles.actionBtnDisabled,
        ]}
        disabled={disabled}
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
    backgroundColor: "rgba(253, 255, 250, 0.98)",
    borderTopColor: BrandColors.border,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
  },
  payBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: BrandColors.buttonSolid,
    alignItems: "center",
    justifyContent: "center",
  },
  billBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: BrandColors.buttonSolid,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnCompact: {
    height: 48,
    borderRadius: 12,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
});
