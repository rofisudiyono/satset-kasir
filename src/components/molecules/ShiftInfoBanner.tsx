// src/components/molecules/ShiftInfoBanner.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextBodySm, TextCaption } from "@/components/atoms/Typography";

export interface ShiftInfoBannerProps {
  slot: string;       // e.g. "PAGI"
  startTime?: string; // e.g. "07:30"
  isActive: boolean;
}

export function ShiftInfoBanner({ slot, startTime, isActive }: ShiftInfoBannerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.slotPill}>
        <TextCaption fontWeight="700" color={BrandColors.deep} fontSize={10}>
          {slot}
        </TextCaption>
      </View>
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
    gap: 8,
  },
  slotPill: {
    backgroundColor: BrandColors.tint,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
