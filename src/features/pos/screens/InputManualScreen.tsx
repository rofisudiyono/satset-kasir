import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { IconButton, PageHeader } from "@/components";
import {
  cartAtom,
  heldOrdersAtom,
  scannedBarcodeAtom,
  type CartItem,
} from "@/features/cart/store/cart.store";
import { catalogProducts } from "@/features/catalog/api/catalog.data";
import { catalogStockAtom } from "@/features/catalog/store/catalog.store";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  CartBar,
  CartIconButton,
  CartPanel,
  ProductGrid,
  SearchBar,
  VariantSheet,
} from "@/features/transactions/components/transaksi-baru";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import type { CatalogProduct, CategoryFilter } from "@/types";

export function InputManualScreen() {
  const router = useRouter();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const { useTwoPaneLayout } = useDeviceLayout();
  const { width: screenWidth } = useWindowDimensions();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Semua");
  const [cart, setCart] = useAtom(cartAtom);
  const [scannedBarcode, setScannedBarcode] = useAtom(scannedBarcodeAtom);
  const [heldOrders] = useAtom(heldOrdersAtom);
  const [catalogStock] = useAtom(catalogStockAtom);
  const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [sheetVisible, setSheetVisible] = useState(false);

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
    const found = catalogProducts.find((p) => p.barcode === scannedBarcode);
    if (found) {
      handleAddProduct(found);
    }
    setScannedBarcode(null);
  }, [scannedBarcode, setScannedBarcode, handleAddProduct]);

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

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);

  const catalogPanelWidth = screenWidth * 0.65;

  const catalogContent = (
    <>
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
            {!useTwoPaneLayout && <CartIconButton totalItems={totalItems} />}
          </>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: useTwoPaneLayout ? 32 : totalItems > 0 ? 120 : 32,
        }}
      >
        <YStack paddingHorizontal="$4" gap="$3">
          <SearchBar />
          <ProductGrid
            products={filtered}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onAddProduct={handleAddProduct}
            availableWidth={useTwoPaneLayout ? catalogPanelWidth : undefined}
          />
        </YStack>
      </ScrollView>
    </>
  );

  if (useTwoPaneLayout) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.splitLayout}>
          <View style={styles.catalogPanel}>{catalogContent}</View>
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

  return (
    <SafeAreaView style={styles.container}>
      {catalogContent}

      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        onPress={() => router.push("/keranjang")}
      />

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
  divider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  cartPanel: {
    flex: 0.35,
    backgroundColor: ColorBase.bgScreen,
  },
});
