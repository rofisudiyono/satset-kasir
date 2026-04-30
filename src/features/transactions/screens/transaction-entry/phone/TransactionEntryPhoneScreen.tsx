import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { TextBodySm, TextCaption, TextH2 } from "@/components";
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
    menusRefreshing,
    refetchMenus,
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
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.catalogPanel} onLayout={handlePanelLayout}>
        <View style={styles.catalogPanelHeader}>
          <YStack gap={6} flex={1} paddingRight="$2">
            <TextH2 fontWeight="800" color={BrandColors.text}>
              Katalog Aktif
            </TextH2>
            <TextBodySm color={BrandColors.textMuted} fontWeight="500">
              {products.length} menu tersedia
            </TextBodySm>
          </YStack>

          <View style={styles.catalogBadge}>
            <TextCaption fontWeight="700" color={BrandColors.deep}>
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
            refreshing={menusRefreshing}
            onRefresh={() => {
              void refetchMenus();
            }}
          />
        )}
      </View>

        <CartBar
          totalItems={cartTotalItems}
          totalPrice={cartTotalPrice}
          onPress={openCart}
        />
      </KeyboardAvoidingView>

      <Modal
        visible={isCartVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCart}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboard}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 20}
          >
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
                <TextH2 fontWeight="800" color={BrandColors.text}>
                  Ringkasan Pesanan
                </TextH2>
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
          </KeyboardAvoidingView>
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
  keyboardRoot: {
    flex: 1,
  },
  catalogPanel: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
    overflow: "hidden",
  },
  catalogPanelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: BrandColors.canvas,
  },
  catalogBadge: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.sage,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 14, 32, 0.32)",
    justifyContent: "flex-end",
  },
  modalKeyboard: {
    flex: 1,
    width: "100%",
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
