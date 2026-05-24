import React from "react";
import { YStack } from "tamagui";

import { TextBodyLg, TextBodySm } from "@/components/atoms/Typography";
import { BrandColors } from "@/themes/brand";

interface ShiftInfoBoxProps {
  label: string;
  value: string;
  valueColor?: string;
}

/**
 * Info box kecil untuk ringkasan shift (tampil di atas card primary).
 */
export function ShiftInfoBox({ label, value, valueColor }: ShiftInfoBoxProps) {
  return (
    <YStack
      flex={1}
      backgroundColor="rgba(255,255,255,0.15)"
      borderRadius={10}
      padding={12}
      gap={4}
    >
      <TextBodySm color="rgba(240,253,232,0.78)">{label}</TextBodySm>
      <TextBodyLg
        fontWeight="700"
        color={(valueColor as string) ?? BrandColors.surface}
        numberOfLines={1}
      >
        {value}
      </TextBodyLg>
    </YStack>
  );
}
