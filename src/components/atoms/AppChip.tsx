// src/components/atoms/AppChip.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextBodySm, TextCaption } from "./Typography";

export interface AppChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onPress?: () => void;
  size?: "sm" | "md";
}

export function AppChip({
  label,
  active = false,
  count,
  onPress,
  size = "md",
}: AppChipProps) {
  const isSmall = size === "sm";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        isSmall ? styles.chipSm : styles.chipMd,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      <TextBodySm
        fontWeight="600"
        fontSize={isSmall ? 12 : 13}
        color={active ? BrandColors.surface : BrandColors.textMuted}
      >
        {label}
      </TextBodySm>
      {count !== undefined && (
        <View style={[styles.countBadge, active && styles.countBadgeActive]}>
          <TextCaption
            fontWeight="700"
            fontSize={10}
            color={active ? BrandColors.surface : BrandColors.deep}
          >
            {count}
          </TextCaption>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
  },
  chipSm: {
    height: 28,
    paddingHorizontal: 12,
  },
  chipMd: {
    height: 34,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: BrandColors.buttonSolid,
  },
  chipInactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(23, 31, 27, 0.12)",
  },
  countBadge: {
    backgroundColor: BrandColors.tint,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
