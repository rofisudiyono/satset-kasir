import React, { useCallback } from "react";
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { XStack } from "tamagui";

import { FilterChip } from "@/components";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/categoryStyles";
import { categoryFilters } from "@/features/catalog/api/category.data";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { CatalogProduct, CategoryFilter } from "@/types";

const PADDING = 16 * 2;
const GAP = 12;
const TABLET_COLS = 3;

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
        width={cardWidth}
        onAdd={() => onAddProduct(item)}
      />
    ),
    [onAddProduct, cardWidth],
  );

  const keyExtractor = useCallback((item: CatalogProduct) => item.id, []);

  return (
    <>
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

      <FlatList
        data={products}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={TABLET_COLS}
        key={TABLET_COLS}
        columnWrapperStyle={TABLET_COLS > 1 ? { gap: GAP } : undefined}
        contentContainerStyle={{ gap: GAP }}
        scrollEnabled={false}
      />
    </>
  );
}
