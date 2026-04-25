import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import {
  CartBar,
  CartPanel,
  ProductGrid,
  VariantSheet,
} from "@/features/transactions/components/transaksi-baru";
import { ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

import { useTransactionEntry } from "../shared/useTransactionEntry";

export function TransactionEntryPhoneScreen() {
  const [panelWidth, setPanelWidth] = useState(0);

  const {
    products,
    categoryFilter,
    setCategoryFilter,
    handleAddProduct,
    openScanner,
    cartTotalItems,
    cartTotalPrice,
    searchQuery,
    setSearchQuery,
    variantProduct,
    isVariantSheetVisible,
    closeVariantSheet,
    addToCart,
    isCartVisible,
    openCart,
    closeCart,
  } = useTransactionEntry();

  function handlePanelLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setPanelWidth(w);
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.catalogPanel} onLayout={handlePanelLayout}>
        <View style={styles.catalogPanelHeader}>
          <YStack gap={2}>
            <TextH3 fontWeight="700">Katalog Aktif</TextH3>
            <TextBodySm color="$colorSecondary">
              {products.length} menu tersedia
            </TextBodySm>
          </YStack>

          <View style={styles.catalogBadge}>
            <TextCaption fontWeight="700" color={BrandColors.text}>
              {products.length} menu
            </TextCaption>
          </View>
        </View>

        {panelWidth > 0 && (
          <ProductGrid
            products={products}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onAddProduct={handleAddProduct}
            availableWidth={panelWidth}
            numColumns={2}
            searchValue={searchQuery}
            onSearchChangeText={setSearchQuery}
            onBarcodePress={openScanner}
            contentBottomInset={cartTotalItems > 0 ? 88 : 0}
            compact
          />
        )}
      </View>

      <CartBar
        totalItems={cartTotalItems}
        totalPrice={cartTotalPrice}
        onPress={openCart}
      />

      <Modal
        visible={isCartVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCart}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView
            style={styles.cartModal}
            edges={Platform.OS === "ios" ? ["top", "bottom"] : ["bottom"]}
          >
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="$4"
              paddingTop="$4"
              paddingBottom="$3"
            >
              <YStack gap={2}>
                <TextCaption color={BrandColors.text} fontWeight="700">
                  KERANJANG
                </TextCaption>
                <TextH3 fontWeight="700">Ringkasan Pesanan</TextH3>
              </YStack>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeCart}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={ColorNeutral.neutral700}
                />
              </TouchableOpacity>
            </XStack>

            <View style={styles.cartPanelShell}>
              <CartPanel />
            </View>
          </SafeAreaView>
        </View>
      </Modal>

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
  catalogPanel: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
    overflow: "hidden",
  },
  catalogPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: BrandColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  catalogBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BrandColors.tint,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 14, 32, 0.32)",
    justifyContent: "flex-end",
  },
  cartModal: {
    height: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: BrandColors.surface,
    overflow: "hidden",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.tint,
  },
  cartPanelShell: {
    flex: 1,
  },
});
