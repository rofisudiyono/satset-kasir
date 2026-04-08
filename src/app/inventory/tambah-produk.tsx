import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";

import { AppButton, TextBodySm, TextCaption, TextH3 } from "@/components";
import {
  buildProduct,
  userProductsAtom,
} from "@/features/inventory/store/inventory.store";
import { ColorBase, ColorNeutral } from "@/themes/Colors";

import type {
  TambahProdukCategory,
  TambahProdukVariantGroup,
} from "@/features/inventory/components/tambah-produk";
import {
  FotoProdukSection,
  HargaSection,
  InformasiDasarSection,
  StatusProdukSection,
  StokSection,
  VariantProdukSection,
} from "@/features/inventory/components/tambah-produk";

export default function TambahProdukPage() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const [userProducts, setUserProducts] = useAtom(userProductsAtom);

  // If editing, find the existing product
  const editingProduct = editId
    ? userProducts.find((p) => p.id === editId)
    : undefined;
  const isEditMode = !!editingProduct;

  const [photos, setPhotos] = useState<string[]>(["1", "2"]);
  const [namaProduk, setNamaProduk] = useState(
    editingProduct?.name ?? "Kopi Susu",
  );
  const [sku, setSku] = useState(editingProduct?.sku ?? "KPS-001");
  const [barcode, setBarcode] = useState("");
  const [kategori, setKategori] = useState<TambahProdukCategory>(
    (editingProduct?.category as TambahProdukCategory) ?? "Minuman",
  );
  const [deskripsi, setDeskripsi] = useState("");
  const [hargaModal, setHargaModal] = useState("8000");
  const [hargaJual, setHargaJual] = useState(
    editingProduct
      ? String(Number(editingProduct.price.replace(/[^0-9]/g, "")))
      : "15000",
  );
  const [hasVariant, setHasVariant] = useState(
    editingProduct?.hasVariant ?? true,
  );
  const [variantGroups, setVariantGroups] = useState<
    TambahProdukVariantGroup[]
  >([
    {
      name: "Ukuran",
      values: [
        { name: "Small", price: "0" },
        { name: "Medium", price: "5000" },
        { name: "Large", price: "10000" },
      ],
    },
  ]);
  const [stokAwal, setStokAwal] = useState(
    editingProduct ? String(editingProduct.stock) : "100",
  );
  const [minAlert, setMinAlert] = useState("10");
  const [satuan, setSatuan] = useState("pcs");
  const [isActive, setIsActive] = useState(
    editingProduct ? editingProduct.stockStatus !== "inactive" : true,
  );

  function removeVariantValue(groupIdx: number, valIdx: number) {
    setVariantGroups((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx
          ? { ...g, values: g.values.filter((_, vi) => vi !== valIdx) }
          : g,
      ),
    );
  }

  function addVariantValue(
    groupIdx: number,
    value: { name: string; price: string },
  ) {
    setVariantGroups((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx ? { ...g, values: [...g.values, value] } : g,
      ),
    );
  }

  function addVariantGroup(name: string) {
    setVariantGroups((prev) => [...prev, { name, values: [] }]);
  }

  function removeVariantGroup(groupIdx: number) {
    setVariantGroups((prev) => prev.filter((_, gi) => gi !== groupIdx));
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSimpan() {
    if (!namaProduk.trim()) {
      Alert.alert("Nama produk tidak boleh kosong.");
      return;
    }

    if (isEditMode && editingProduct) {
      // Update existing product
      setUserProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: namaProduk.trim(),
                sku: sku.trim() || p.sku,
                category: kategori as typeof p.category,
                price: `Rp ${Number(hargaJual).toLocaleString("id-ID")}`,
                stock: Number(stokAwal) || 0,
                stockStatus: !isActive
                  ? "inactive"
                  : Number(stokAwal) === 0
                    ? "empty"
                    : Number(stokAwal) <= 5
                      ? "low"
                      : "normal",
                hasVariant,
              }
            : p,
        ),
      );
      Alert.alert("Berhasil", `Produk "${namaProduk}" berhasil diperbarui.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      // Create new product
      const product = buildProduct({
        name: namaProduk.trim(),
        sku: sku.trim() || `SKU-${Date.now()}`,
        kategori,
        hargaJual,
        stokAwal,
        hasVariant,
        isActive,
      });
      setUserProducts((prev) => [product, ...prev]);
      Alert.alert("Berhasil", `Produk "${namaProduk}" berhasil disimpan.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }

  // Shared header used by both layouts
  const formHeader = (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      backgroundColor={ColorBase.white}
      borderBottomWidth={1}
      borderBottomColor={ColorNeutral.neutral200}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.batalBtn}
        activeOpacity={0.7}
      >
        <Ionicons
          name="close"
          size={18}
          color={ColorNeutral.neutral700 ?? ColorNeutral.neutral500}
        />
        <TextBodySm fontWeight="500" color={ColorNeutral.neutral700}>
          Batal
        </TextBodySm>
      </TouchableOpacity>

      <TextH3 fontWeight="700" flex={1} textAlign="center">
        {isEditMode ? "Edit Produk" : "Tambah Produk"}
      </TextH3>

      <AppButton
        variant="primary"
        size="sm"
        title="Simpan"
        onPress={handleSimpan}
      />
    </XStack>
  );

  return (
    <SafeAreaView style={styles.container}>
      {formHeader}

      <View style={styles.tabletBody}>
        {/* Left column wrapper: Photo + Info Dasar + Variant */}
        <View style={styles.tabletColLeft}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabletColContent}
          >
            <FotoProdukSection photos={photos} onRemovePhoto={removePhoto} />

            <InformasiDasarSection
              namaProduk={namaProduk}
              setNamaProduk={setNamaProduk}
              sku={sku}
              setSku={setSku}
              barcode={barcode}
              setBarcode={setBarcode}
              kategori={kategori}
              setKategori={setKategori}
              deskripsi={deskripsi}
              setDeskripsi={setDeskripsi}
            />

            <VariantProdukSection
              hasVariant={hasVariant}
              setHasVariant={setHasVariant}
              variantGroups={variantGroups}
              onRemoveVariantValue={removeVariantValue}
              onAddVariantValue={addVariantValue}
              onAddGroup={addVariantGroup}
              onRemoveGroup={removeVariantGroup}
            />
          </ScrollView>
        </View>

        {/* Divider */}
        <View style={styles.tabletDivider} />

        {/* Right column wrapper: Harga + Stok + Status */}
        <View style={styles.tabletColRight}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabletColContent}
          >
            <HargaSection
              hargaModal={hargaModal}
              setHargaModal={setHargaModal}
              hargaJual={hargaJual}
              setHargaJual={setHargaJual}
            />

            <StokSection
              stokAwal={stokAwal}
              setStokAwal={setStokAwal}
              minAlert={minAlert}
              setMinAlert={setMinAlert}
              satuan={satuan}
              setSatuan={setSatuan}
            />

            <StatusProdukSection
              isActive={isActive}
              setIsActive={setIsActive}
            />

            <AppButton
              variant="primary"
              size="lg"
              fullWidth
              title={isEditMode ? "Simpan Perubahan" : "Simpan Produk"}
              onPress={handleSimpan}
            />
            <TextCaption
              color={ColorNeutral.neutral400}
              textAlign="center"
              marginTop={6}
              marginBottom={8}
            >
              Semua perubahan akan langsung tersimpan ke inventori setelah
              dipublikasikan
            </TextCaption>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 48,
  },
  batalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bottomBar: {
    backgroundColor: ColorBase.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ColorNeutral.neutral200,
  },
  // Tablet
  tabletBody: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: ColorBase.bgScreen,
  },
  tabletColLeft: {
    flex: 3,
  },
  tabletColRight: {
    flex: 2,
  },
  tabletColContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 48,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral100,
  },
});

const stepStyles = StyleSheet.create({
  dot: {
    width: "100%",
    height: 3,
    borderRadius: 2,
  },
});
