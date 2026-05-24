// src/components/molecules/ShiftInfoBanner.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextCaption } from "@/components/atoms/Typography";

export interface ShiftInfoBannerProps {
  slot: string;
  startTime?: string;
  isActive: boolean;
}

export function ShiftInfoBanner({ slot, startTime, isActive }: ShiftInfoBannerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <TextCaption fontWeight="700" color={BrandColors.deep} fontSize={11}>
        {slot}
      </TextCaption>
      <TextCaption color={BrandColors.textMuted} fontSize={11}>
        {isActive && startTime ? `Aktif sejak ${startTime}` : "Belum buka"}
      </TextCaption>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: BrandColors.deep,
  },
});
