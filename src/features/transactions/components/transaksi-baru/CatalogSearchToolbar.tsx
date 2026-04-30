import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { XStack, YStack } from "tamagui";

import { FilterChip } from "@/components";
import { TextBodySm } from "@/components/atoms/Typography";
import { categoryFilters } from "@/features/catalog/api/category.data";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import type { CategoryFilter } from "@/types";

import { SearchBar } from "./SearchBar";

const COMPACT_H_PAD = 12;

export type CatalogSearchToolbarProps = {
  compact: boolean;
  /** Rapatkan jarak vertikal (toolbar di bawah judul, bukan di dalam list) */
  dense?: boolean;
  searchValue?: string;
  onSearchChangeText?: (value: string) => void;
  onBarcodePress?: () => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  /** Samakan dengan padding header panel */
  paddingHorizontal?: number;
};

export function CatalogSearchToolbar({
  compact,
  dense = false,
  searchValue,
  onSearchChangeText,
  onBarcodePress,
  categoryFilter,
  onCategoryChange,
  paddingHorizontal = COMPACT_H_PAD,
}: CatalogSearchToolbarProps) {
  return (
    <YStack
      gap={dense ? 8 : 12}
      paddingHorizontal={paddingHorizontal}
      paddingTop={dense ? 4 : 0}
      paddingBottom={dense ? 6 : 12}
    >
      <SearchBar
        value={searchValue}
        onChangeText={onSearchChangeText}
        onBarcodePress={onBarcodePress}
        compact={compact}
        slim={dense}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {categoryFilters.map((c) => {
            const active = categoryFilter === c;
            if (!compact) {
              return (
                <FilterChip
                  key={c}
                  label={c}
                  active={active}
                  onPress={() => onCategoryChange(c)}
                  paddingH={14}
                />
              );
            }
            return (
              <Pressable
                key={c}
                onPress={() => onCategoryChange(c)}
                style={[
                  styles.compactChip,
                  active && styles.compactChipActive,
                ]}
              >
                <TextBodySm
                  fontWeight="700"
                  fontSize={13}
                  lineHeight={16}
                  color={active ? ColorBase.white : ColorNeutral.neutral700}
                >
                  {c}
                </TextBodySm>
              </Pressable>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}

const styles = StyleSheet.create({
  compactChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    alignItems: "center",
    justifyContent: "center",
  },
  compactChipActive: {
    backgroundColor: BrandColors.buttonSolid,
    borderColor: BrandColors.buttonSolid,
  },
});
