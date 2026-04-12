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
const TABLET_COLS = 3;
const H_PAD = 16;

type Props = {
  products: CatalogProduct[];
  categoryFilter: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onAddProduct: (product: CatalogProduct) => void;
  availableWidth?: number;
};

export function ProductGrid({
  products,
  categoryFilter,
  onCategoryChange,
  onAddProduct,
  availableWidth,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const containerWidth = availableWidth ?? screenWidth;
  const cardWidth =
    (containerWidth - PADDING - GAP * (TABLET_COLS - 1)) / TABLET_COLS;

  const renderItem = useCallback<ListRenderItem<CatalogProduct>>(
    ({ item }) => (
      <ProductCard
        name={item.name}
        basePrice={item.basePrice}
        categoryIcon={CATEGORY_ICONS[item.category]}
        categoryIconBg={CATEGORY_COLORS[item.category].bg}
        categoryIconColor={CATEGORY_COLORS[item.category].color}
        stockStatus={item.stockStatus}
        availabilityReason={item.availabilityReason}
        width={cardWidth}
        onAdd={() => onAddProduct(item)}
      />
    ),
    [onAddProduct, cardWidth],
  );

  const keyExtractor = useCallback((item: CatalogProduct) => item.id, []);

  const columnWrapperStyle = useMemo(
    () => (TABLET_COLS > 1 ? styles.columnRow : undefined),
    [],
  );

  const contentContainerStyle = useMemo(
    () => [styles.listContent, { gap: GAP }],
    [],
  );

  const ListHeaderComponent = useCallback(
    () => (
      <YStack gap="$3" paddingBottom="$3">
        <SearchBar />
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
    [categoryFilter, onCategoryChange],
  );

  return (
    <FlatList
      style={styles.list}
      data={products}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={TABLET_COLS}
      key={String(TABLET_COLS)}
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
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: 32,
  },
  columnRow: {
    gap: GAP,
  },
});
