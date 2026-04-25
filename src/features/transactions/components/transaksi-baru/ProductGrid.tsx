import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  ListRenderItem,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { XStack, YStack } from "tamagui";

import { FilterChip } from "@/components";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/categoryStyles";
import { categoryFilters } from "@/features/catalog/api/category.data";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { CatalogProduct, CategoryFilter } from "@/types";

import { SearchBar } from "./SearchBar";

const PADDING = 16 * 2;
const GAP = 12;
const COMPACT_PADDING = 12 * 2;
const COMPACT_GAP = 8;
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
      <YStack gap={compact ? "$2" : "$3"} paddingBottom={compact ? "$2" : "$3"}>
        <SearchBar
          value={searchValue}
          onChangeText={onSearchChangeText}
          onBarcodePress={onBarcodePress}
          compact={compact}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {categoryFilters.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={categoryFilter === c}
                onPress={() => onCategoryChange(c)}
                paddingH={14}
              />
            ))}
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
  },
  listContent: {},
  columnRow: {},
});
