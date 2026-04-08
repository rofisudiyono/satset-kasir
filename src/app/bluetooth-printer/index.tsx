import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  AppInput,
  PageHeader,
  SectionCard,
  TextBody,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import {
  ColorBase,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import {
  BluetoothPrinter,
  bluetoothPrinterManager,
  PrinterState,
} from "@/utils/bluetooth-printer";

export default function BluetoothPrinterSettingsPage() {
  const router = useRouter();
  const { isTablet, contentMaxWidth, horizontalPadding } =
    useResponsiveLayout();
  
  const [printerState, setPrinterState] = useState<PrinterState>({
    connected: false,
    printer: null,
    printing: false,
  });
  const [scanning, setScanning] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<BluetoothPrinter[]>([]);

  // Subscribe to printer state changes
  useEffect(() => {
    const unsubscribe = bluetoothPrinterManager.subscribe((state) => {
      setPrinterState(state);
    });

    return unsubscribe;
  }, []);

  const handleScanPrinters = async () => {
    setScanning(true);
    setDiscoveredPrinters([]);

    try {
      const printers = await bluetoothPrinterManager.scanPrinters();
      setDiscoveredPrinters(printers);

      if (printers.length === 0) {
        Alert.alert(
          "Tidak Ditemukan",
          "Tidak ada printer Bluetooth yang ditemukan. Pastikan printer dalam mode pairing dan coba lagi.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setScanning(false);
    }
  };

  const handleConnectPrinter = async (printer: BluetoothPrinter) => {
    Alert.alert(
      "Hubungkan Printer",
      `Hubungkan ke ${printer.name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hubungkan",
          onPress: async () => {
            const success = await bluetoothPrinterManager.connectPrinter(printer);
            if (success) {
              Alert.alert(
                "Berhasil",
                "Printer terhubung. Anda dapat melakukan test print untuk memverifikasi.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = async () => {
    Alert.alert(
      "Putuskan Koneksi",
      "Putuskan koneksi dari printer?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Putuskan",
          style: "destructive",
          onPress: async () => {
            await bluetoothPrinterManager.disconnect();
          },
        },
      ]
    );
  };

  const handleTestPrint = async () => {
    const success = await bluetoothPrinterManager.testPrint();
    if (!success) {
      Alert.alert("Gagal", "Test print gagal. Periksa koneksi printer.");
    }
  };

  const getStatusColor = () => {
    if (printerState.connected) return ColorGreen.green600;
    return ColorNeutral.neutral400;
  };

  const getStatusText = () => {
    if (printerState.connected) return "Terhubung";
    return "Tidak Terhubung";
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Pengaturan Printer Bluetooth"
        subtitle="Kelola koneksi printer Bluetooth untuk cetak struk"
        showBack
        onBack={() => router.back()}
        maxWidth={contentMaxWidth}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: contentMaxWidth,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {/* Connection Status Card */}
        <SectionCard title="Status Koneksi">
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap={4}>
                <TextBodyLg fontWeight="600">
                  {printerState.printer?.name || "Tidak ada printer"}
                </TextBodyLg>
                <TextBodySm color="$colorSecondary">
                  {printerState.printer?.address || "-"}
                </TextBodySm>
              </YStack>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <TextCaption color={ColorBase.white} fontWeight="700">
                  {getStatusText()}
                </TextCaption>
              </View>
            </XStack>

            <XStack gap="$3" marginTop={8}>
              {printerState.connected ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSecondary]}
                    activeOpacity={0.8}
                    onPress={handleDisconnect}
                  >
                    <Ionicons name="close-circle" size={18} color={ColorPrimary.primary600} />
                    <TextBody fontWeight="700" color={ColorPrimary.primary600}>
                      Putuskan
                    </TextBody>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    activeOpacity={0.8}
                    onPress={handleTestPrint}
                    disabled={printerState.printing}
                  >
                    {printerState.printing ? (
                      <ActivityIndicator color={ColorBase.white} />
                    ) : (
                      <>
                        <Ionicons name="print-outline" size={18} color={ColorBase.white} />
                        <TextBody fontWeight="700" color={ColorBase.white}>
                          Test Print
                        </TextBody>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}
            </XStack>
          </YStack>
        </SectionCard>

        {/* Scan Printers Section */}
        <SectionCard title="Printer Tersedia" style={styles.sectionSpacing}>
          <YStack gap="$3">
            <TextBodySm color="$colorSecondary">
              Tekan tombol di bawah untuk memindai printer Bluetooth di sekitar
            </TextBodySm>

            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleScanPrinters}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <ActivityIndicator color={ColorBase.white} />
                  <TextBodyLg fontWeight="700" color={ColorBase.white} style={{ marginLeft: 8 }}>
                    Memindai...
                  </TextBodyLg>
                </>
              ) : (
                <>
                  <Ionicons name="bluetooth" size={20} color={ColorBase.white} />
                  <TextBodyLg fontWeight="700" color={ColorBase.white} style={{ marginLeft: 8 }}>
                    Pindai Printer Bluetooth
                  </TextBodyLg>
                </>
              )}
            </TouchableOpacity>
          </YStack>
        </SectionCard>

        {/* Discovered Printers List */}
        {discoveredPrinters.length > 0 && (
          <SectionCard title={`Ditemukan ${discoveredPrinters.length} Printer`} style={styles.sectionSpacing}>
            <YStack gap="$3">
              {discoveredPrinters.map((printer) => (
                <TouchableOpacity
                  key={printer.id}
                  style={[
                    styles.printerCard,
                    printerState.printer?.id === printer.id && styles.printerCardConnected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleConnectPrinter(printer)}
                >
                  <XStack alignItems="center" gap="$3" flex={1}>
                    <View style={styles.printerIcon}>
                      <Ionicons
                        name="print-outline"
                        size={24}
                        color={
                          printerState.printer?.id === printer.id
                            ? ColorGreen.green600
                            : ColorPrimary.primary600
                        }
                      />
                    </View>
                    <YStack flex={1} gap={2}>
                      <TextBodyLg fontWeight="600">{printer.name}</TextBodyLg>
                      <TextBodySm color="$colorSecondary">{printer.address}</TextBodySm>
                    </YStack>
                  </XStack>
                  {printerState.printer?.id === printer.id && (
                    <View style={[styles.connectedBadge, { backgroundColor: ColorGreen.green600 }]}>
                      <Ionicons name="checkmark-circle" size={16} color={ColorBase.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </YStack>
          </SectionCard>
        )}

        {/* Help Section */}
        <SectionCard title="Panduan" style={styles.sectionSpacing}>
          <YStack gap="$3">
            <TextBodySm color="$colorSecondary">
              Untuk menggunakan printer Bluetooth:
            </TextBodySm>
            <YStack gap={8}>
              <XStack gap="$2">
                <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>1.</TextBodySm>
                <TextBodySm color="$colorSecondary">
                  Pastikan printer Bluetooth dalam mode pairing
                </TextBodySm>
              </XStack>
              <XStack gap="$2">
                <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>2.</TextBodySm>
                <TextBodySm color="$colorSecondary">
                  Tekan "Pindai Printer Bluetooth"
                </TextBodySm>
              </XStack>
              <XStack gap="$2">
                <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>3.</TextBodySm>
                <TextBodySm color="$colorSecondary">
                  Pilih printer dari daftar dan hubungkan
                </TextBodySm>
              </XStack>
              <XStack gap="$2">
                <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>4.</TextBodySm>
                <TextBodySm color="$colorSecondary">
                  Lakukan Test Print untuk memverifikasi koneksi
                </TextBodySm>
              </XStack>
            </YStack>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={ColorPrimary.primary600} />
              <TextBodySm color="$colorSecondary" style={{ marginLeft: 8 }}>
                Printer yang didukung: Thermal 58mm dan 80mm dengan protokol ESC/POS
              </TextBodySm>
            </View>
          </YStack>
        </SectionCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionSpacing: {
    marginTop: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: ColorPrimary.primary600,
  },
  actionButtonSecondary: {
    backgroundColor: ColorBase.white,
    borderWidth: 1.5,
    borderColor: ColorPrimary.primary600,
  },
  scanButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  scanButtonDisabled: {
    backgroundColor: ColorNeutral.neutral300,
  },
  printerCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5EBF5",
    flexDirection: "row",
    alignItems: "center",
  },
  printerCardConnected: {
    borderColor: ColorGreen.green600,
    backgroundColor: "#F0FFF4",
  },
  printerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  connectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: ColorPrimary.primary50,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
});
