import React, { useCallback, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";

import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/categoryStyles";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { CatalogProduct, CategoryFilter } from "@/types";

import { CatalogSearchToolbar } from "./CatalogSearchToolbar";

const GAP = 12;
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
  /** Judul + search dipisah di parent (tablet); list hanya grid produk */
  omitListHeader?: boolean;
  /** Override padding horizontal isi list (selaraskan dengan toolbar luar) */
  listContentPaddingH?: number;
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
  omitListHeader = false,
  listContentPaddingH,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const hPadSingle = listContentPaddingH ?? (compact ? COMPACT_H_PAD : H_PAD);
  const horizontalPaddingTotal = hPadSingle * 2;

  const containerWidth = availableWidth ?? screenWidth;
  const itemGap = compact ? COMPACT_GAP : GAP;
  const cardWidth =
    (containerWidth - horizontalPaddingTotal - itemGap * (numColumns - 1)) /
    numColumns;

  const renderItem = useCallback<ListRenderItem<CatalogProduct>>(
    ({ item, index }) => {
      const isLastInRow = index % numColumns === numColumns - 1;
      return (
        <View style={!isLastInRow ? { marginRight: itemGap } : undefined}>
          <ProductCard
            name={item.name}
            imageUrl={item.imageUrl}
            basePrice={item.basePrice}
            categoryIcon={CATEGORY_ICONS[item.category]}
            categoryIconBg={CATEGORY_COLORS[item.category].bg}
            categoryIconColor={CATEGORY_COLORS[item.category].color}
            categoryLabel={item.category}
            sku={item.sku ?? undefined}
            stockStatus={item.stockStatus}
            availabilityReason={item.availabilityReason}
            width={cardWidth}
            compact={compact}
            onAdd={() => onAddProduct(item)}
          />
        </View>
      );
    },
    [cardWidth, compact, itemGap, numColumns, onAddProduct],
  );

  const keyExtractor = useCallback((item: CatalogProduct) => item.id, []);

  const horizontalPad = hPadSingle;

  const contentContainerStyle = useMemo(
    () => [
      styles.listContent,
      {
        gap: itemGap,
        paddingBottom: contentBottomInset,
        paddingHorizontal: horizontalPad,
      },
    ],
    [contentBottomInset, itemGap, horizontalPad],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <CatalogSearchToolbar
        compact={compact}
        dense={false}
        searchValue={searchValue}
        onSearchChangeText={onSearchChangeText}
        onBarcodePress={onBarcodePress}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        paddingHorizontal={0}
      />
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
    <FlashList
      style={styles.list}
      data={products}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={numColumns}
      key={String(numColumns)}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={omitListHeader ? undefined : ListHeaderComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      removeClippedSubviews={Platform.OS === "android"}
      drawDistance={420}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: 16,
  },
  listContent: {},
});
