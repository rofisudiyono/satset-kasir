import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, PageHeader } from "@/components";
import { useDeviceProfile } from "@/hooks/use-device-profile";
import {
  CartPanel,
  ProductGrid,
  VariantSheet,
} from "@/features/transactions/components/transaksi-baru";
import { ColorBase, ColorNeutral } from "@/themes/Colors";

import { useTransactionEntry } from "../shared/useTransactionEntry";

export function TransactionEntryTabletScreen() {
  const {
    width,
  } = useDeviceProfile();
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

  const catalogPanelWidth = width * 0.65;

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
                  onPress={openScanner}
                />
                <IconButton
                  iconName="pause-circle-outline"
                  onPress={openHeldOrders}
                  badge={heldOrdersCount > 0 ? heldOrdersCount : undefined}
                />
              </>
            }
          />

          <View style={styles.catalogScroll}>
            <ProductGrid
              products={products}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onAddProduct={handleAddProduct}
              availableWidth={catalogPanelWidth}
              searchValue={searchQuery}
              onSearchChangeText={setSearchQuery}
              onBarcodePress={openScanner}
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
