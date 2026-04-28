import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  TextBody,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components/atoms/Typography";
import {
  ColorBase,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
  ColorWarning,
} from "@/themes/Colors";
import {
  BluetoothPrinter,
  bluetoothPrinterManager,
  PrinterState,
} from "@/utils/bluetooth-printer";

interface PrinterTestModalProps {
  visible: boolean;
  onClose: () => void;
}

function buildTestReceiptHtml(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body { font-family: monospace; width: 280px; margin: 0 auto; font-size: 12px; }
          h2 { text-align: center; margin: 4px 0; font-size: 14px; }
          p { text-align: center; margin: 2px 0; font-size: 11px; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; vertical-align: top; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>*** TEST PRINT ***</h2>
        <p>Kasir Toko Makmur</p>
        <p>Jl. Contoh No. 123, Jakarta</p>
        <p>Telp: (021) 12345678</p>
        <hr/>
        <p>${dateStr}</p>
        <p>${timeStr} WIB</p>
        <hr/>
        <table>
          <tr><td>Kopi Susu</td><td style="text-align:right">Rp 25.000</td></tr>
          <tr><td>Croissant</td><td style="text-align:right">Rp 18.000</td></tr>
          <tr><td>Air Mineral</td><td style="text-align:right">Rp 5.000</td></tr>
        </table>
        <hr/>
        <table>
          <tr><td>Subtotal</td><td style="text-align:right">Rp 48.000</td></tr>
          <tr class="bold"><td>TOTAL</td><td style="text-align:right">Rp 48.000</td></tr>
          <tr><td>Tunai</td><td style="text-align:right">Rp 50.000</td></tr>
          <tr><td>Kembalian</td><td style="text-align:right">Rp 2.000</td></tr>
        </table>
        <hr/>
        <p class="bold">Printer berfungsi dengan baik!</p>
        <p>Terima kasih</p>
        <br/><br/>
      </body>
    </html>
  `;
}

export function PrinterTestModal({ visible, onClose }: PrinterTestModalProps) {
  const [printerState, setPrinterState] = useState<PrinterState>({
    connected: false,
    printer: null,
    printing: false,
    reconnecting: false,
  });
  const [scanning, setScanning] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<
    BluetoothPrinter[]
  >([]);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const unsubscribe = bluetoothPrinterManager.subscribe((state) => {
      setPrinterState(state);
    });
    return unsubscribe;
  }, []);

  const handleSystemPrint = async () => {
    setIsPrinting(true);
    try {
      await Print.printAsync({ html: buildTestReceiptHtml() });
    } catch {
      Alert.alert("Gagal", "Tidak dapat membuka dialog cetak.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBluetoothTestPrint = async () => {
    await bluetoothPrinterManager.testPrint();
  };

  const handleScanPrinters = async () => {
    setScanning(true);
    setDiscoveredPrinters([]);
    try {
      const printers = await bluetoothPrinterManager.scanPrinters();
      setDiscoveredPrinters(printers);
      if (printers.length === 0) {
        Alert.alert(
          "Tidak Ditemukan",
          "Tidak ada printer Bluetooth ditemukan. Pastikan printer dalam mode pairing.",
          [{ text: "OK" }],
        );
      }
    } finally {
      setScanning(false);
    }
  };

  const handleConnectPrinter = (printer: BluetoothPrinter) => {
    Alert.alert("Hubungkan Printer", `Hubungkan ke ${printer.name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hubungkan",
        onPress: async () => {
          await bluetoothPrinterManager.connectPrinter(printer);
        },
      },
    ]);
  };

  const handleDisconnect = () => {
    Alert.alert("Putuskan Koneksi", "Putuskan koneksi dari printer?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Putuskan",
        style: "destructive",
        onPress: async () => {
          await bluetoothPrinterManager.disconnect();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor={ColorNeutral.neutral100}
        >
          <YStack>
            <TextH3 fontWeight="700">Test Printer</TextH3>
            <TextCaption color="$colorSecondary">
              Verifikasi printer sebelum mulai shift
            </TextCaption>
          </YStack>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons
              name="close"
              size={22}
              color={ColorNeutral.neutral600}
            />
          </TouchableOpacity>
        </XStack>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* System Print Section */}
          <YStack style={styles.card}>
            <XStack alignItems="center" gap="$3" marginBottom="$3">
              <View style={styles.iconWrap}>
                <Ionicons
                  name="print-outline"
                  size={22}
                  color={ColorPrimary.primary600}
                />
              </View>
              <YStack flex={1}>
                <TextBodyLg fontWeight="700">Cetak Struk Test (PDF)</TextBodyLg>
                <TextBodySm color="$colorSecondary">
                  Buka dialog cetak sistem untuk memverifikasi printer
                </TextBodySm>
              </YStack>
            </XStack>

            <TouchableOpacity
              style={[styles.primaryButton, isPrinting && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={() => void handleSystemPrint()}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator color={ColorBase.white} size="small" />
              ) : (
                <Ionicons
                  name="print-outline"
                  size={18}
                  color={ColorBase.white}
                />
              )}
              <TextBody
                fontWeight="700"
                color={ColorBase.white}
                style={{ marginLeft: 8 }}
              >
                {isPrinting ? "Memproses..." : "Cetak Test (PDF)"}
              </TextBody>
            </TouchableOpacity>
          </YStack>

          {/* Bluetooth Printer Section */}
          <YStack style={[styles.card, { marginTop: 12 }]}>
            <XStack alignItems="center" gap="$3" marginBottom="$3">
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: printerState.connected
                      ? ColorGreen.green50
                      : ColorNeutral.neutral50,
                  },
                ]}
              >
                <Ionicons
                  name="bluetooth"
                  size={22}
                  color={
                    printerState.connected
                      ? ColorGreen.green600
                      : ColorNeutral.neutral500
                  }
                />
              </View>
              <YStack flex={1}>
                <TextBodyLg fontWeight="700">Printer Bluetooth</TextBodyLg>
                <TextBodySm color="$colorSecondary">
                  Thermal printer ESC/POS 58mm / 80mm
                </TextBodySm>
              </YStack>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: printerState.connected
                      ? ColorGreen.green600
                      : ColorNeutral.neutral300,
                  },
                ]}
              >
                <TextCaption color={ColorBase.white} fontWeight="700">
                  {printerState.connected ? "Terhubung" : "Offline"}
                </TextCaption>
              </View>
            </XStack>

            {/* Connected printer info */}
            {printerState.printer && (
              <XStack
                backgroundColor={
                  printerState.connected
                    ? ColorGreen.green50
                    : ColorNeutral.neutral50
                }
                borderRadius="$3"
                padding="$3"
                alignItems="center"
                gap="$2"
                marginBottom="$3"
                borderWidth={1}
                borderColor={
                  printerState.connected
                    ? ColorGreen.green100
                    : ColorNeutral.neutral100
                }
              >
                <Ionicons
                  name={
                    printerState.connected
                      ? "checkmark-circle"
                      : "alert-circle-outline"
                  }
                  size={16}
                  color={
                    printerState.connected
                      ? ColorGreen.green600
                      : ColorNeutral.neutral500
                  }
                />
                <YStack flex={1}>
                  <TextBodySm fontWeight="600">
                    {printerState.printer.name}
                  </TextBodySm>
                  <TextCaption color="$colorSecondary">
                    {printerState.printer.address}
                  </TextCaption>
                </YStack>
              </XStack>
            )}

            {/* Action buttons */}
            <XStack gap="$2">
              {printerState.connected ? (
                <>
                  <TouchableOpacity
                    style={[styles.outlineButton, { flex: 1 }]}
                    activeOpacity={0.8}
                    onPress={handleDisconnect}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={16}
                      color={ColorPrimary.primary600}
                    />
                    <TextBodySm
                      fontWeight="700"
                      color={ColorPrimary.primary600}
                      style={{ marginLeft: 4 }}
                    >
                      Putuskan
                    </TextBodySm>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      { flex: 1 },
                      printerState.printing && styles.buttonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => void handleBluetoothTestPrint()}
                    disabled={printerState.printing}
                  >
                    {printerState.printing ? (
                      <ActivityIndicator color={ColorBase.white} size="small" />
                    ) : (
                      <Ionicons
                        name="print-outline"
                        size={16}
                        color={ColorBase.white}
                      />
                    )}
                    <TextBodySm
                      fontWeight="700"
                      color={ColorBase.white}
                      style={{ marginLeft: 4 }}
                    >
                      {printerState.printing ? "Mencetak..." : "Test Print"}
                    </TextBodySm>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { flex: 1 },
                    scanning && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => void handleScanPrinters()}
                  disabled={scanning}
                >
                  {scanning ? (
                    <ActivityIndicator color={ColorBase.white} size="small" />
                  ) : (
                    <Ionicons
                      name="bluetooth"
                      size={16}
                      color={ColorBase.white}
                    />
                  )}
                  <TextBodySm
                    fontWeight="700"
                    color={ColorBase.white}
                    style={{ marginLeft: 4 }}
                  >
                    {scanning ? "Memindai..." : "Pindai Printer"}
                  </TextBodySm>
                </TouchableOpacity>
              )}
            </XStack>
          </YStack>

          {/* Discovered Printers */}
          {discoveredPrinters.length > 0 && (
            <YStack style={[styles.card, { marginTop: 12 }]}>
              <TextBodyLg fontWeight="700" marginBottom="$3">
                Printer Ditemukan ({discoveredPrinters.length})
              </TextBodyLg>
              <YStack gap="$2">
                {discoveredPrinters.map((printer) => (
                  <TouchableOpacity
                    key={printer.id}
                    style={[
                      styles.printerItem,
                      printerState.printer?.id === printer.id &&
                        styles.printerItemActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleConnectPrinter(printer)}
                  >
                    <XStack alignItems="center" gap="$3" flex={1}>
                      <View
                        style={[
                          styles.printerIcon,
                          printerState.printer?.id === printer.id && {
                            backgroundColor: ColorGreen.green100,
                          },
                        ]}
                      >
                        <Ionicons
                          name="print-outline"
                          size={20}
                          color={
                            printerState.printer?.id === printer.id
                              ? ColorGreen.green600
                              : ColorPrimary.primary600
                          }
                        />
                      </View>
                      <YStack flex={1}>
                        <TextBodySm fontWeight="600">{printer.name}</TextBodySm>
                        <TextCaption color="$colorSecondary">
                          {printer.address}
                        </TextCaption>
                      </YStack>
                      {printerState.printer?.id === printer.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={ColorGreen.green600}
                        />
                      )}
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            </YStack>
          )}

          {/* Tips */}
          <YStack style={[styles.infoBox, { marginTop: 12 }]}>
            <XStack gap="$2" alignItems="flex-start">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={ColorWarning.warning600}
              />
              <YStack flex={1} gap={4}>
                <TextBodySm fontWeight="700" color={ColorWarning.warning700}>
                  Tips Test Printer
                </TextBodySm>
                <TextCaption color="$colorSecondary" lineHeight={16}>
                  • Gunakan tombol Cetak Test (PDF) untuk printer WiFi atau USB
                  {"\n"}• Gunakan tombol Pindai Printer untuk thermal Bluetooth
                  {"\n"}• Pastikan printer sudah dinyalakan dan kertas tersedia
                </TextCaption>
              </YStack>
            </XStack>
          </YStack>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ColorNeutral.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  outlineButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: ColorBase.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: ColorPrimary.primary600,
  },
  buttonDisabled: {
    backgroundColor: ColorNeutral.neutral300,
  },
  printerItem: {
    backgroundColor: ColorNeutral.neutral50,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
  },
  printerItemActive: {
    backgroundColor: ColorGreen.green50,
    borderColor: ColorGreen.green200,
  },
  printerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    backgroundColor: ColorWarning.warning50,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorWarning.warning100,
  },
});
