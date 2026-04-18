import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { TextBody, TextBodySm, TextH3 } from "@/components";
import { scannedBarcodeAtom } from "@/features/cart/store/cart.store";
import { catalogProducts } from "@/features/catalog/api/catalog.data";
import { useDeviceProfile } from "@/hooks/use-device-profile";
import { getInputManualRoute } from "@/lib/routing/device-routes";
import { ColorBase, ColorNeutral, ColorPrimary } from "@/themes/Colors";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BarcodeScannerPage() {
  const router = useRouter();
  const { isTablet } = useDeviceProfile();
  const setScannedBarcode = useSetAtom(scannedBarcodeAtom);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState("");

  function closeScanner() {
    router.replace(getInputManualRoute(isTablet) as never);
  }

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    processBarcode(data);
  }

  function processBarcode(code: string) {
    const found = catalogProducts.find((p) => p.barcode === code.trim());
    if (found) {
      setScannedBarcode(code.trim());
      closeScanner();
    } else {
      Alert.alert(
        "Produk Tidak Ditemukan",
        `Barcode: ${code}\n\nProduk dengan barcode ini tidak ada di katalog.`,
        [{ text: "Scan Ulang", onPress: () => setScanned(false) }],
      );
    }
  }

  function handleManualInput() {
    if (!manualCode.trim()) return;
    processBarcode(manualCode.trim());
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap={16}
          paddingHorizontal={32}
        >
          <Ionicons
            name="camera-outline"
            size={64}
            color={ColorNeutral.neutral300}
          />
          <TextH3 fontWeight="700" textAlign="center">
            Izin Kamera Diperlukan
          </TextH3>
          <TextBody color="$colorSecondary" textAlign="center">
            Aplikasi memerlukan akses kamera untuk memindai barcode produk.
          </TextBody>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <TextBody fontWeight="700" color={ColorBase.white}>
              Izinkan Kamera
            </TextBody>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeScanner}>
            <TextBodySm color={ColorNeutral.neutral500}>Batal</TextBodySm>
          </TouchableOpacity>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "code128", "qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <SafeAreaView edges={["top"]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeScanner}
            >
              <Ionicons name="close" size={24} color={ColorBase.white} />
            </TouchableOpacity>
            <TextH3 fontWeight="700" color={ColorBase.white}>
              Scan Barcode
            </TextH3>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        {/* Scan frame */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <TextBodySm color={ColorBase.white} textAlign="center" marginTop={16}>
            Arahkan kamera ke barcode produk
          </TextBodySm>
        </View>

        {/* Manual input */}
        <View style={styles.manualContainer}>
          <TextBodySm
            color={ColorBase.white}
            marginBottom={8}
            textAlign="center"
          >
            Atau masukkan kode manual:
          </TextBodySm>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Ketik barcode..."
              placeholderTextColor={ColorNeutral.neutral400}
              keyboardType="default"
              returnKeyType="search"
              onSubmitEditing={handleManualInput}
            />
            <TouchableOpacity
              style={styles.manualBtn}
              onPress={handleManualInput}
            >
              <Ionicons name="search" size={20} color={ColorBase.white} />
            </TouchableOpacity>
          </View>

          {scanned && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => setScanned(false)}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={ColorPrimary.primary600}
              />
              <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>
                Scan Ulang
              </TextBodySm>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FRAME_SIZE = 240;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: "transparent",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: ColorBase.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  manualContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  manualRow: {
    flexDirection: "row",
    gap: 8,
  },
  manualInput: {
    flex: 1,
    height: 48,
    backgroundColor: ColorBase.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#000",
  },
  manualBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
  rescanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: ColorBase.white,
    borderRadius: 12,
  },
  permBtn: {
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
  },
});
