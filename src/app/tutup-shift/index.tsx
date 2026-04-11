import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  BottomBar,
  DottedSeparator,
  NumpadGrid,
  PageHeader,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH1,
  TextH3,
} from "@/components";
import { ShiftInfoBox } from "@/features/shift/components/ShiftInfoBox";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { useCloseShiftMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";

export default function TutupShiftPage() {
  const router = useRouter();
  const { mutateAsync: closeShiftApi, isPending: isClosingShift } = useCloseShiftMutation();
  const [, setIsShiftStarted] = useAtom(isShiftStartedAtom);
  const [, setShiftData] = useAtom(shiftDataAtom);
  const shiftData = useAtomValue(shiftDataAtom);
  const orders = useAtomValue(posOrdersAtom);
  const { isTablet, contentMaxWidth, horizontalPadding } = useResponsiveLayout();

  const [inputValue, setInputValue] = useState("0");

  const kasAkhir = Number(inputValue);

  // Compute shift stats
  const shiftId = shiftData?.shiftId;
  const shiftOrders = orders.filter((order) => {
    if (order.status !== "PAID") return false;
    if (!shiftData?.openedAt) return true;
    if (order.shiftId && shiftId) return order.shiftId === shiftId;
    return order.createdAt >= shiftData.openedAt;
  });

  const totalPendapatan = shiftOrders.reduce((sum, order) => sum + order.grandTotal, 0);

  const totalTransaksi = shiftOrders.length;
  const totalVoid = orders.filter((order) => {
    if (order.status !== "CANCELLED") return false;
    if (!shiftData?.openedAt) return true;
    if (order.shiftId && shiftId) return order.shiftId === shiftId;
    return order.createdAt >= shiftData.openedAt;
  }).length;

  const salesCash = shiftOrders.reduce(
    (sum, order) =>
      sum +
      order.payments
        .filter((payment) => payment.method === "tunai")
        .reduce((sub, payment) => sub + payment.amountPaid, 0),
    0,
  );
  const salesQris = shiftOrders.reduce(
    (sum, order) =>
      sum +
      order.payments
        .filter((payment) => payment.method === "qris" || payment.method === "ewallet")
        .reduce((sub, payment) => sub + payment.amountPaid, 0),
    0,
  );
  const salesTransfer = shiftOrders.reduce(
    (sum, order) =>
      sum +
      order.payments
        .filter((payment) => payment.method === "transfer" || payment.method === "edc")
        .reduce((sub, payment) => sub + payment.amountPaid, 0),
    0,
  );

  // Rekonsiliasi
  const openingCash = shiftData?.openingCash ?? 0;
  const expectedCash = openingCash + salesCash;
  const selisih = kasAkhir - expectedCash;

  function handleNumpad(key: string) {
    setInputValue((prev) => {
      if (key === "DEL") {
        const next = prev.slice(0, -1);
        return next.length === 0 ? "0" : next;
      }
      if (key === "000") {
        if (prev === "0") return prev;
        if (prev.length >= 10) return prev;
        return prev + "000";
      }
      if (prev === "0") return key;
      if (prev.length >= 12) return prev;
      return prev + key;
    });
  }

  function handleTutupShift() {
    const hasDiscrepancy = selisih !== 0;
    const title = hasDiscrepancy ? "Perhatian: Ada Selisih Kas!" : "Tutup Shift";
    const message = hasDiscrepancy
      ? `Selisih kas: ${selisih >= 0 ? "+" : ""}${formatPrice(selisih)}\n\n${
          selisih > 0
            ? "Kas lebih — periksa kembalian yang diberikan ke pelanggan."
            : "Kas kurang — periksa apakah ada transaksi yang belum tercatat."
        }\n\nTetap tutup shift?`
      : "Yakin ingin menutup shift sekarang? Data shift akan disimpan.";

    Alert.alert(title, message, [
      { text: "Batal", style: "cancel" },
      {
        text: hasDiscrepancy ? "Tetap Tutup" : "Tutup Shift",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await closeShiftApi({
                actualCash: Math.round(kasAkhir),
              });
              setIsShiftStarted(false);
              setShiftData(null);
              router.replace("/(tabs)");
            } catch (e) {
              Alert.alert("Gagal tutup shift", getApiErrorMessage(e));
            }
          })();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Tutup Shift"
        showBack
        onBack={() => router.back()}
        maxWidth={contentMaxWidth}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <XStack
          flexDirection={isTablet ? "row" : "column"}
          gap="$4"
          style={[
            styles.shell,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <YStack flex={isTablet ? 0.56 : undefined} gap={12}>
            <YStack
              backgroundColor={ColorPrimary.primary700}
              borderRadius={16}
              padding={20}
              gap={12}
            >
              <XStack alignItems="center" gap={8}>
                <YStack
                  width={8}
                  height={8}
                  borderRadius={4}
                  backgroundColor={ColorSuccess.success400}
                />
                <TextBodyLg fontWeight="700" color={ColorBase.white}>
                  Ringkasan Shift
                </TextBodyLg>
              </XStack>
              <XStack gap={8} flexWrap="wrap">
                <ShiftInfoBox label="Mulai" value={shiftData?.startTime ?? "-"} />
                <ShiftInfoBox label="Kasir" value={shiftData?.cashierName ?? "-"} />
              </XStack>
              <XStack gap={8} flexWrap="wrap">
                <ShiftInfoBox
                  label="Total Transaksi"
                  value={String(totalTransaksi)}
                />
                <ShiftInfoBox
                  label="Pendapatan"
                  value={`Rp ${totalPendapatan.toLocaleString("id-ID")}`}
                />
                <ShiftInfoBox
                  label="Void"
                  value={String(totalVoid)}
                  valueColor={ColorDanger.danger400}
                />
              </XStack>
            </YStack>

            <YStack
              backgroundColor={ColorBase.white}
              borderRadius={16}
              padding={20}
              gap={10}
              borderWidth={1}
              borderColor={ColorNeutral.neutral200}
            >
              <TextH3 fontWeight="700">Rincian Metode Pembayaran</TextH3>
              <XStack justifyContent="space-between">
                <TextBodySm color={ColorNeutral.neutral600}>Tunai</TextBodySm>
                <TextBodySm fontWeight="700">{formatPrice(salesCash)}</TextBodySm>
              </XStack>
              <XStack justifyContent="space-between">
                <TextBodySm color={ColorNeutral.neutral600}>QRIS</TextBodySm>
                <TextBodySm fontWeight="700">{formatPrice(salesQris)}</TextBodySm>
              </XStack>
              <XStack justifyContent="space-between">
                <TextBodySm color={ColorNeutral.neutral600}>Transfer/EDC</TextBodySm>
                <TextBodySm fontWeight="700">{formatPrice(salesTransfer)}</TextBodySm>
              </XStack>
            </YStack>
          </YStack>

          <YStack flex={isTablet ? 0.44 : undefined} gap={12}>
            <YStack
              backgroundColor={ColorBase.white}
              borderRadius={16}
              padding={20}
              gap={12}
              borderWidth={1}
              borderColor={ColorNeutral.neutral200}
            >
              <YStack gap={4}>
                <TextH3 fontWeight="700">Hitung Kas Akhir</TextH3>
                <TextBodySm color={ColorNeutral.neutral500}>
                  Masukkan jumlah uang aktual di laci kasir
                </TextBodySm>
              </YStack>
              <YStack alignItems="center" paddingVertical={4}>
                <TextH1 fontWeight="800" color={ColorPrimary.primary600}>
                  {formatPrice(kasAkhir)}
                </TextH1>
              </YStack>

              <NumpadGrid onPress={handleNumpad} />
            </YStack>

            <YStack
              backgroundColor={ColorBase.white}
              borderRadius={16}
              padding={20}
              gap={10}
              borderWidth={1}
              borderColor={ColorNeutral.neutral200}
            >
            <TextH3 fontWeight="700">Rekonsiliasi Kas</TextH3>
            <XStack justifyContent="space-between">
              <TextBodySm color={ColorNeutral.neutral600}>Modal Awal</TextBodySm>
              <TextBodySm fontWeight="600">{formatPrice(openingCash)}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color={ColorNeutral.neutral600}>
                + Pendapatan Tunai
              </TextBodySm>
              <TextBodySm fontWeight="600" color={ColorGreen.green600}>
                {formatPrice(salesCash)}
              </TextBodySm>
            </XStack>
            <DottedSeparator />
            <XStack justifyContent="space-between">
              <TextBodySm color={ColorNeutral.neutral600}>
                Kas Seharusnya
              </TextBodySm>
              <TextBodySm fontWeight="700">{formatPrice(expectedCash)}</TextBodySm>
            </XStack>
            <XStack justifyContent="space-between">
              <TextBodySm color={ColorNeutral.neutral600}>Kas Aktual</TextBodySm>
              <TextBodySm fontWeight="700">{formatPrice(kasAkhir)}</TextBodySm>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              backgroundColor={
                selisih === 0
                  ? ColorGreen.green75
                  : selisih > 0
                    ? ColorWarning.warning75
                    : ColorDanger.danger25
              }
              borderRadius={10}
              padding={10}
              marginTop={4}
            >
              <TextBodyLg fontWeight="700">Selisih</TextBodyLg>
              <XStack alignItems="center" gap={6}>
                <Ionicons
                  name={
                    selisih === 0
                      ? "checkmark-circle"
                      : selisih > 0
                        ? "arrow-up-circle"
                        : "arrow-down-circle"
                  }
                  size={18}
                  color={
                    selisih === 0
                      ? ColorGreen.green600
                      : selisih > 0
                        ? ColorWarning.warning600
                        : ColorDanger.danger600
                  }
                />
                <TextBodyLg
                  fontWeight="800"
                  color={
                    selisih === 0
                      ? ColorGreen.green600
                      : selisih > 0
                        ? ColorWarning.warning600
                        : ColorDanger.danger600
                  }
                >
                  {selisih >= 0 ? "+" : ""}
                  {formatPrice(selisih)}
                </TextBodyLg>
              </XStack>
            </XStack>
            {selisih !== 0 && (
              <TextCaption color={ColorNeutral.neutral500} textAlign="center">
                {selisih > 0
                  ? "Kas lebih — periksa kembalian yang diberikan"
                  : "Kas kurang — periksa transaksi yang belum tercatat"}
              </TextCaption>
            )}
            </YStack>
          </YStack>
        </XStack>
      </ScrollView>

      <BottomBar absolute paddingBottom={28}>
        <AppButton
          variant="danger"
          size="lg"
          fullWidth
          disabled={isClosingShift}
          title={isClosingShift ? "Memproses…" : "Tutup Shift Sekarang"}
          icon={
            <Ionicons name="moon-outline" size={18} color={ColorBase.white} />
          }
          onPress={handleTutupShift}
        />
        <TextCaption
          color={ColorNeutral.neutral400}
          textAlign="center"
          marginTop={6}
        >
          Laporan shift akan tersimpan otomatis
        </TextCaption>
      </BottomBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 8,
  },
});
