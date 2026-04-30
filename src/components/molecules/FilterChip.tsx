/**
 * FilterChip — Pill-shaped toggle chip for filter rows
 *
 * Shared between Transaksi and Inventori pages.
 */
import React from "react";
import { TouchableOpacity } from "react-native";
import { YStack } from "tamagui";

import { ColorBase } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

import { TextBodySm } from "../atoms/Typography";

export interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Horizontal padding. Default 16 */
  paddingH?: number;
}

export function FilterChip({
  label,
  active,
  onPress,
  paddingH = 16,
}: FilterChipProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <YStack
        backgroundColor={active ? BrandColors.buttonSolid : ColorBase.white}
        borderRadius={999}
        paddingHorizontal={paddingH}
        paddingVertical={9}
        borderWidth={1}
        borderColor={active ? BrandColors.buttonSolid : "$borderColor"}
      >
        <TextBodySm
          fontWeight="700"
          color={active ? ColorBase.white : "$colorSecondary"}
        >
          {label}
        </TextBodySm>
      </YStack>
    </TouchableOpacity>
  );
}
