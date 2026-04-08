import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useCallback, useState } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, PageHeader, TextBodySm } from "@/components";
import { categoryFilters } from "@/features/catalog/api/category.data";
import { products as mockProducts } from "@/features/inventory/api/inventory.data";
import { InventoriFAB } from "@/features/inventory/components/InventoriFAB";
import { InventoriListHeader } from "@/features/inventory/components/InventoriListHeader";
import { InventoriSidebar } from "@/features/inventory/components/InventoriSidebar";
import { MemoProductRow } from "@/features/inventory/components/ProductRow";
import { userProductsAtom } from "@/features/inventory/store/inventory.store";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import type { CategoryFilter, Product, SortOption } from "@/types";

export default function InventoriPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Semua");
  const [sortOption, setSortOption] = useState<SortOption>("Nama A-Z");
  const [searchQuery, setSearchQuery] = useState("");
  const userProducts = useAtomValue(userProductsAtom);
  const { useTwoPaneLayout } = useDeviceLayout();

  const allProducts = [...userProducts, ...mockProducts];

  const filtered = allProducts.filter((p) => {
    const matchCategory =
      categoryFilter === "Semua" || p.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const emptyCount = allProducts.filter((p) => p.stockStatus === "empty").length;
  const categoryCount = new Set(allProducts.map((p) => p.category)).size;

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item, index }) => (
      <MemoProductRow product={item} isFirst={index === 0} />
    ),
    [],
  );

  const renderCardItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <MemoProductRow product={item} isFirst={false} isCard />,
    [],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const sharedListHeaderProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    categoryFilter,
    onCategoryChange: setCategoryFilter,
    sortOption,
    onSortChange: setSortOption,
    totalProducts: allProducts.length,
    emptyCount,
    categoryCount,
    filteredCount: filtered.length,
  };

  // ── Tablet: sidebar + grid split ──────────────────────────────────────────
  if (useTwoPaneLayout) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}
      >
        <PageHeader title="Produk" />
        <View style={styles.tabletLayout}>
          <InventoriSidebar
            allProducts={allProducts}
            totalProducts={allProducts.length}
            emptyCount={emptyCount}
            categoryCount={categoryCount}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />

          <View style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}>
            <FlatList
              data={filtered}
              keyExtractor={keyExtractor}
              renderItem={renderCardItem}
              numColumns={2}
              columnWrapperStyle={{ gap: 0 }}
              ListHeaderComponent={
                <InventoriListHeader {...sharedListHeaderProps} hideCategories />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12 }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="cube-outline"
                    size={40}
                    color={ColorNeutral.neutral300}
                  />
                  <TextBodySm color="$colorTertiary" marginTop={8}>
                    Tidak ada produk ditemukan
                  </TextBodySm>
                </View>
              }
            />
          </View>
        </View>
        <InventoriFAB />
      </SafeAreaView>
    );
  }

  // ── Phone layout ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}
    >
      <PageHeader
        title="Produk"
        onBack={() => router.back()}
        actions={
          <AppButton
            variant="primary"
            size="sm"
            onPress={() => router.push("/inventory/tambah-produk")}
          >
            + Tambah
          </AppButton>
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={<InventoriListHeader {...sharedListHeaderProps} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListFooterComponent={<View style={{ height: 8 }} />}
        style={{ marginHorizontal: 16 }}
      />

      <InventoriFAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabletLayout: {
    flex: 1,
    flexDirection: "row",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
});
