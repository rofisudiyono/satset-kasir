import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { XStack, YStack } from "tamagui";

import { FilterChip } from "@/components";
import { TextBodySm } from "@/components/atoms/Typography";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/categoryStyles";
import { categoryFilters } from "@/features/catalog/api/category.data";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import type { CatalogProduct, CategoryFilter } from "@/types";

import { SearchBar } from "./SearchBar";

const PADDING = 16 * 2;
const GAP = 12;
const COMPACT_PADDING = 12 * 2;
const COMPACT_GAP = 10;
const TABLET_COLS = 3;
const H_PAD = 16;
const COMPACT_H_PAD = 12;

type Props = {
  products: CatalogProduct[];
  categoryFilter: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onAddProduct: (product: CatalogProduct) => void;
  availableWidth?: number;
  numColumns?: number;
  searchValue?: string;
  onSearchChangeText?: (value: string) => void;
  onBarcodePress?: () => void;
  contentBottomInset?: number;
  compact?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ProductGrid({
  products,
  categoryFilter,
  onCategoryChange,
  onAddProduct,
  availableWidth,
  numColumns = TABLET_COLS,
  searchValue,
  onSearchChangeText,
  onBarcodePress,
  contentBottomInset = 32,
  compact = false,
  refreshing = false,
  onRefresh,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const containerWidth = availableWidth ?? screenWidth;
  const horizontalPadding = compact ? COMPACT_PADDING : PADDING;
  const itemGap = compact ? COMPACT_GAP : GAP;
  const cardWidth =
    (containerWidth - horizontalPadding - itemGap * (numColumns - 1)) /
    numColumns;

  const renderItem = useCallback<ListRenderItem<CatalogProduct>>(
    ({ item }) => (
      <ProductCard
        name={item.name}
        imageUrl={item.imageUrl}
        basePrice={item.basePrice}
        categoryIcon={CATEGORY_ICONS[item.category]}
        categoryIconBg={CATEGORY_COLORS[item.category].bg}
        categoryIconColor={CATEGORY_COLORS[item.category].color}
        stockStatus={item.stockStatus}
        availabilityReason={item.availabilityReason}
        width={cardWidth}
        compact={compact}
        onAdd={() => onAddProduct(item)}
      />
    ),
    [cardWidth, compact, onAddProduct],
  );

  const keyExtractor = useCallback((item: CatalogProduct) => item.id, []);

  const columnWrapperStyle = useMemo(
    () => (numColumns > 1 ? [styles.columnRow, { gap: itemGap }] : undefined),
    [itemGap, numColumns],
  );

  const contentContainerStyle = useMemo(
    () => [
      styles.listContent,
      {
        gap: itemGap,
        paddingBottom: contentBottomInset,
        paddingHorizontal: compact ? COMPACT_H_PAD : H_PAD,
      },
    ],
    [compact, contentBottomInset, itemGap],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <YStack gap={compact ? "$3" : "$3"} paddingBottom={compact ? "$3" : "$3"}>
        <SearchBar
          value={searchValue}
          onChangeText={onSearchChangeText}
          onBarcodePress={onBarcodePress}
          compact={compact}
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
                    color={
                      active ? ColorBase.white : ColorNeutral.neutral700
                    }
                  >
                    {c}
                  </TextBodySm>
                </Pressable>
              );
            })}
          </XStack>
        </ScrollView>
      </YStack>
    ),
    [
      categoryFilter,
      compact,
      onBarcodePress,
      onCategoryChange,
      onSearchChangeText,
      searchValue,
    ],
  );

  return (
    <FlatList
      style={styles.list}
      data={products}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={numColumns}
      key={String(numColumns)}
      columnWrapperStyle={columnWrapperStyle}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={5}
      removeClippedSubviews={Platform.OS === "android"}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {},
  columnRow: {},
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
