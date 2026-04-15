import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH1,
  TextH3,
} from "@/components";
import { useDeviceProfile } from "@/hooks/use-device-profile";
import {
  CartBar,
  CartPanel,
  ProductGrid,
  VariantSheet,
} from "@/features/transactions/components/transaksi-baru";
import {
  ColorAccentOrange,
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorSky,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";

import { useTransactionEntry } from "../shared/useTransactionEntry";

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  const accent = tone === "accent";

  return (
    <View
      style={[
        styles.statPill,
        accent ? styles.statPillAccent : styles.statPillDefault,
      ]}
    >
      <TextCaption
        fontWeight="700"
        color={accent ? ColorAccentOrange.orange700 : "rgba(255,255,255,0.78)"}
      >
        {label}
      </TextCaption>
      <TextBodyLg
        fontWeight="800"
        color={accent ? ColorNeutral.neutral900 : ColorBase.white}
      >
        {value}
      </TextBodyLg>
    </View>
  );
}

export function TransactionEntryPhoneScreen() {
  const { width } = useDeviceProfile();
  const {
    products,
    categoryFilter,
    setCategoryFilter,
    handleAddProduct,
    openScanner,
    openHeldOrders,
    heldOrdersCount,
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

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={styles.heroShell}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />

        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
          <YStack flex={1} gap="$2">
            <View style={styles.kicker}>
              <TextCaption fontWeight="700" color={ColorPrimary.primary700}>
                POS PHONE MODE
              </TextCaption>
            </View>

            <TextH1 fontWeight="700" color={ColorBase.white}>
              Input Manual
            </TextH1>

            <TextBodySm color="rgba(255,255,255,0.76)">
              Ruang kerja ringkas untuk kasir mobile. Pilih produk cepat,
              tahan order, lalu buka cart saat siap checkout.
            </TextBodySm>
          </YStack>

          <XStack gap="$2">
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={openHeldOrders}
              style={styles.heroAction}
            >
              <Ionicons
                name="pause-circle-outline"
                size={18}
                color={ColorBase.white}
              />
              <TextCaption fontWeight="700" color={ColorBase.white}>
                {heldOrdersCount > 0 ? `${heldOrdersCount} hold` : "Hold"}
              </TextCaption>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={openScanner}
              style={styles.heroActionPrimary}
            >
              <Ionicons
                name="scan-outline"
                size={18}
                color={ColorNeutral.neutral900}
              />
            </TouchableOpacity>
          </XStack>
        </XStack>

        <XStack gap="$2.5" marginTop="$4">
          <StatPill label="Cart" value={`${cartTotalItems} item`} />
          <StatPill
            label="Total"
            value={cartTotalItems > 0 ? formatPrice(cartTotalPrice) : "Belum ada"}
            tone="accent"
          />
        </XStack>
      </View>

      <View style={styles.catalogPanel}>
        <View style={styles.catalogPanelHeader}>
          <YStack gap={2}>
            <TextH3 fontWeight="700">Katalog Aktif</TextH3>
            <TextBodySm color="$colorSecondary">
              Grid padat dua kolom untuk layar phone
            </TextBodySm>
          </YStack>

          <View style={styles.catalogBadge}>
            <TextCaption fontWeight="700" color={ColorPrimary.primary700}>
              {products.length} menu
            </TextCaption>
          </View>
        </View>

        <ProductGrid
          products={products}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onAddProduct={handleAddProduct}
          availableWidth={width - 24}
          numColumns={2}
          searchValue={searchQuery}
          onSearchChangeText={setSearchQuery}
          onBarcodePress={openScanner}
          contentBottomInset={116}
          compact
        />
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
                <TextCaption color={ColorPrimary.primary700} fontWeight="700">
                  WORKSPACE CART
                </TextCaption>
                <TextH3 fontWeight="700">Keranjang Aktif</TextH3>
              </YStack>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeCart}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={ColorNeutral.neutral800}
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
    backgroundColor: "#EDF3FF",
  },
  heroShell: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "#0F1E46",
    overflow: "hidden",
  },
  heroGlowA: {
    position: "absolute",
    top: -40,
    right: -18,
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroGlowB: {
    position: "absolute",
    bottom: -60,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,184,108,0.16)",
  },
  kicker: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: ColorSky.sky50,
  },
  heroAction: {
    minWidth: 72,
    height: 44,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  heroActionPrimary: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFD6A1",
    alignItems: "center",
    justifyContent: "center",
  },
  statPill: {
    flex: 1,
    minHeight: 72,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  statPillDefault: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statPillAccent: {
    backgroundColor: "#FFF3E1",
  },
  catalogPanel: {
    flex: 1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: ColorBase.white,
    overflow: "hidden",
  },
  catalogPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  catalogBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: ColorPrimary.primary50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 14, 32, 0.28)",
    justifyContent: "flex-end",
  },
  cartModal: {
    height: "92%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: ColorBase.white,
    overflow: "hidden",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ColorNeutral.neutral100,
  },
  cartPanelShell: {
    flex: 1,
  },
});
