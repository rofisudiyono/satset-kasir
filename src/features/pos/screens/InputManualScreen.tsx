import { useRouter } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, PageHeader, TextBodySm } from "@/components";
import {
  cartAtom,
  heldOrdersAtom,
  scannedBarcodeAtom,
  type CartItem,
} from "@/features/cart/store/cart.store";
import { catalogStockAtom } from "@/features/catalog/store/catalog.store";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  CartPanel,
  ProductGrid,
  VariantSheet,
} from "@/features/transactions/components/transaksi-baru";
import { useMenusQuery } from "@/hooks/api/use-kasir-api";
import type { KasirMenu } from "@/lib/api/types";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import type { CatalogProduct, CategoryFilter, ProductCategory } from "@/types";

function normalizeCategoryName(name: string): ProductCategory {
  const lower = name.toLowerCase();
  if (lower.includes("makanan") || lower.includes("food") || lower.includes("makan")) return "Makanan";
  if (lower.includes("minuman") || lower.includes("drink") || lower.includes("minum")) return "Minuman";
  if (lower.includes("snack") || lower.includes("cemilan") || lower.includes("camilan")) return "Snack";
  return "Makanan";
}

function mapMenuToCatalogProduct(menu: KasirMenu): CatalogProduct {
  const variants =
    menu.hasVariants && menu.variants.length > 0
      ? [
          {
            name: "Pilihan",
            options: menu.variants.map((v) => ({
              id: v.id,
              label: v.name,
              priceAdd: v.price - menu.price,
            })),
          },
        ]
      : undefined;

  return {
    id: menu.id,
    name: menu.name,
    category: normalizeCategoryName(menu.categoryName),
    basePrice: menu.price,
    stockStatus: "normal",
    variants,
  };
}

export function InputManualScreen() {
  const router = useRouter();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const { width: screenWidth } = useWindowDimensions();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Semua");
  const [cart, setCart] = useAtom(cartAtom);
  const [scannedBarcode, setScannedBarcode] = useAtom(scannedBarcodeAtom);
  const [heldOrders] = useAtom(heldOrdersAtom);
  const catalogStock = useAtomValue(catalogStockAtom);
  const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const { data: apiMenus, isLoading: menusLoading } = useMenusQuery(isShiftStarted);

  const catalogProducts = useMemo<CatalogProduct[]>(
    () => (apiMenus ?? []).map(mapMenuToCatalogProduct),
    [apiMenus],
  );

  useEffect(() => {
    if (isShiftStarted) return;
    router.replace("/buka-shift" as never);
  }, [isShiftStarted, router]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "cartId">) => {
      const existing = cart.find(
        (c) =>
          c.productId === item.productId &&
          c.variantLabel === item.variantLabel,
      );
      if (existing) {
        setCart((prev) =>
          prev.map((c) =>
            c.cartId === existing.cartId
              ? { ...c, quantity: c.quantity + item.quantity }
              : c,
          ),
        );
      } else {
        setCart((prev) => [
          ...prev,
          { ...item, cartId: `${item.productId}-${Date.now()}` },
        ]);
      }
    },
    [cart, setCart],
  );

  const handleAddProduct = useCallback(
    (product: CatalogProduct) => {
      if (product.variants) {
        setVariantProduct(product);
        setSheetVisible(true);
      } else {
        addToCart({
          productId: product.id,
          productName: product.name,
          category: product.category,
          quantity: 1,
          unitPrice: product.basePrice,
        });
      }
    },
    [addToCart],
  );

  useEffect(() => {
    if (!scannedBarcode) return;
    const found = catalogProducts.find((p) => (p as any).barcode === scannedBarcode);
    if (found) handleAddProduct(found);
    setScannedBarcode(null);
  }, [scannedBarcode, setScannedBarcode, handleAddProduct, catalogProducts]);

  const productsWithLiveStock = catalogProducts
    .map((p) => {
      const liveStock = catalogStock[p.id];
      if (liveStock === undefined) return p;
      const stockStatus: typeof p.stockStatus =
        liveStock === 0 ? "empty" : liveStock <= 5 ? "low" : "normal";
      return { ...p, stockStatus };
    })
    .filter((p) => p.stockStatus !== "empty");

  const filtered =
    categoryFilter === "Semua"
      ? productsWithLiveStock
      : productsWithLiveStock.filter((p) => p.category === categoryFilter);

  const catalogPanelWidth = screenWidth * 0.65;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={styles.splitLayout}>
        <View style={styles.catalogPanel}>
          <PageHeader
            title="Input Manual"
            subtitle="Pilih menu, atur catatan item, lalu lanjut ke pembayaran"
            actions={
              <>
                <IconButton
                  iconName="scan-outline"
                  onPress={() => router.push("/barcode-scanner" as never)}
                />
                <IconButton
                  iconName="pause-circle-outline"
                  onPress={() => router.push("/pesanan-ditahan" as never)}
                  badge={heldOrders.length > 0 ? heldOrders.length : undefined}
                />
              </>
            }
          />
          <View style={styles.catalogScroll}>
            <ProductGrid
              products={filtered}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onAddProduct={handleAddProduct}
              availableWidth={catalogPanelWidth}
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cartPanel}>
          <CartPanel />
        </View>
      </View>

      <VariantSheet
        product={variantProduct}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onAddToCart={addToCart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  splitLayout: {
    flex: 1,
    flexDirection: "row",
  },
  catalogPanel: {
    flex: 0.65,
    backgroundColor: ColorBase.bgScreen,
  },
  catalogScroll: {
    flex: 1,
    minHeight: 0,
  },
  divider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  cartPanel: {
    flex: 0.35,
    backgroundColor: ColorBase.bgScreen,
  },
});
