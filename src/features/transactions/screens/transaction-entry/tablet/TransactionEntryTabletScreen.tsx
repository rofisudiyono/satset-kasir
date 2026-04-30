import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TextBodySm, TextH2 } from "@/components";
import {
  CatalogSearchToolbar,
  CartPanel,
  ProductGrid,
  VariantSheet,
} from "@/features/transactions/components/transaksi-baru";
import {
  ColorNeutral,
  ColorPrimary,
  ColorSurface,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

import { useTransactionEntry } from "../shared/useTransactionEntry";

export function TransactionEntryTabletScreen() {
  const [catalogPanelWidth, setCatalogPanelWidth] = useState(0);
  const {
    products,
    categoryFilter,
    setCategoryFilter,
    handleAddProduct,
    openScanner,
    openHeldOrders,
    heldOrdersCount,
    searchQuery,
    setSearchQuery,
    variantProduct,
    isVariantSheetVisible,
    closeVariantSheet,
    addToCart,
  } = useTransactionEntry();

  function handleCatalogLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;
    setCatalogPanelWidth((current) =>
      Math.abs(current - nextWidth) > 1 ? nextWidth : current,
    );
  }

  const hasMeasuredCatalogPanel = catalogPanelWidth > 0;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={styles.splitLayout}>
        <View style={styles.catalogPanel} onLayout={handleCatalogLayout}>
          <View style={styles.catalogHeader}>
            <View style={styles.titleBlock}>
              <View style={styles.sectionMarker} />
              <View>
                <TextH2 fontWeight="800" color={ColorNeutral.neutral900}>
                  Input Manual
                </TextH2>
                <TextBodySm color={ColorNeutral.neutral500} marginTop={2}>
                  Pilih menu dan tambah item ke keranjang
                </TextBodySm>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={openScanner}
                style={styles.headerAction}
              >
                <Ionicons
                  name="scan-outline"
                  size={18}
                  color={ColorPrimary.primary700}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={openHeldOrders}
                style={styles.headerAction}
              >
                <Ionicons
                  name="pause-circle-outline"
                  size={18}
                  color={ColorPrimary.primary700}
                />
                {heldOrdersCount > 0 ? <View style={styles.actionDot} /> : null}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.catalogToolbar}>
            <CatalogSearchToolbar
              compact
              dense
              searchValue={searchQuery}
              onSearchChangeText={setSearchQuery}
              onBarcodePress={openScanner}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              paddingHorizontal={18}
            />
          </View>

          <View style={styles.catalogScroll}>
            {hasMeasuredCatalogPanel ? (
              <ProductGrid
                products={products}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                onAddProduct={handleAddProduct}
                availableWidth={catalogPanelWidth}
                numColumns={4}
                contentBottomInset={24}
                compact
                omitListHeader
                listContentPaddingH={18}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cartPanel}>
          <CartPanel compact />
        </View>
      </View>

      <VariantSheet
        product={variantProduct}
        visible={isVariantSheetVisible}
        onClose={closeVariantSheet}
        onAddToCart={addToCart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  splitLayout: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  catalogPanel: {
    flex: 0.65,
    backgroundColor: BrandColors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: "hidden",
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  catalogHeader: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: BrandColors.surfaceWarm,
    borderBottomWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  catalogToolbar: {
    backgroundColor: BrandColors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionMarker: {
    width: 4,
    height: 34,
    borderRadius: 999,
    backgroundColor: BrandColors.buttonSolid,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BrandColors.tint,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: BrandColors.coral,
  },
  catalogScroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: BrandColors.surfaceWarm,
  },
  divider: {
    width: 1,
    backgroundColor: "transparent",
  },
  cartPanel: {
    flex: 0.35,
    backgroundColor: BrandColors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: "hidden",
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
});
