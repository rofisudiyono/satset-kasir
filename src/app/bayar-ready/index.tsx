import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import {
  getApiErrorMessage,
  usePayReadyOrderMutation,
  useReadyOrdersQuery,
} from "@/hooks/api/use-kasir-api";
import { useDeviceProfile } from "@/hooks/use-device-profile";
import { useAuth } from "@/lib/auth";
import type { PaymentEntry } from "@/lib/api/kasir.api";
import type { KasirReadyOrder } from "@/lib/api/types";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { getHistoryRoute } from "@/lib/routing/device-routes";
import { ColorBase, ColorNeutral, ColorPrimary, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

type QuickMethod = "CASH" | "QRIS";

function needsManualApproval(row: KasirReadyOrder) {
  return row.paymentStatus === "PENDING_MANUAL_APPROVAL";
}

export default function BayarReadyPage() {
  const router = useRouter();
  const { readyId } = useLocalSearchParams<{ readyId: string }>();
  const { isLoggedIn } = useAuth();
  const { isTablet } = useDeviceProfile();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const payMutation = usePayReadyOrderMutation();
  const [method, setMethod] = useState<QuickMethod>("CASH");

  const readyQuery = useReadyOrdersQuery(Boolean(isLoggedIn && isShiftStarted));

  const row = useMemo(() => {
    const list = readyQuery.data ?? [];
    return list.find((r) => r.id === readyId) ?? null;
  }, [readyQuery.data, readyId]);

  const manual = row ? needsManualApproval(row) : false;

  async function handlePay() {
    if (!row) return;
    const payments: PaymentEntry[] = [
      {
        method,
        amountPaid: row.grandTotal,
        ...(method === "CASH" ? { amountReceived: row.grandTotal } : {}),
        label: manual ? "Persetujuan manual (WEB)" : "Pembayaran siap bayar",
      },
    ];
    try {
      await payMutation.mutateAsync({
        readyOrderId: row.id,
        payments,
        manualApproval: manual,
      });
      Alert.alert("Berhasil", manual ? "Pembayaran manual tercatat." : "Pembayaran berhasil.", [
        { text: "OK", onPress: () => router.replace(getHistoryRoute(isTablet) as never) },
      ]);
    } catch (error) {
      Alert.alert("Gagal", getApiErrorMessage(error, "Pembayaran tidak berhasil."));
    }
  }

  if (!readyId) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Bayar" showBack onBack={() => router.back()} />
        <TextBodySm padding="$4">Parameter tidak valid.</TextBodySm>
      </SafeAreaView>
    );
  }

  if (readyQuery.isLoading && !row) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Bayar" showBack onBack={() => router.back()} />
        <TextBodySm padding="$4">Memuat pesanan…</TextBodySm>
      </SafeAreaView>
    );
  }

  if (!row) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Bayar" showBack onBack={() => router.back()} />
        <YStack padding="$4" gap="$2">
          <TextBodySm color="$colorSecondary">
            Pesanan tidak ditemukan di daftar siap bayar (mungkin sudah dibayar atau dihapus).
          </TextBodySm>
          <AppButton variant="outline" onPress={() => router.back()}>
            Kembali
          </AppButton>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title={manual ? "Konfirmasi manual" : "Terima pembayaran"}
        subtitle={manual ? "Order web — bayar di kasir" : "Order siap bayar"}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {manual ? (
          <View style={styles.banner}>
            <Ionicons name="information-circle" size={22} color={ColorWarning.warning800} />
            <TextBodySm flex={1} color={ColorWarning.warning900}>
              Tamu memilih bayar manual. Setelah uang diterima, catat metode di bawah.
            </TextBodySm>
          </View>
        ) : null}

        <View style={styles.card}>
          <TextCaption color="$colorSecondary">Total</TextCaption>
          <TextH3 fontWeight="800" marginTop={4}>
            {formatPrice(row.grandTotal)}
          </TextH3>
          <XStack marginTop={12} justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Meja / label</TextBodySm>
            <TextBodySm fontWeight="700">{row.tableLabel || "—"}</TextBodySm>
          </XStack>
          <XStack marginTop={8} justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Pelanggan</TextBodySm>
            <TextBodySm fontWeight="700" textAlign="right" flex={1}>
              {[row.customerName, row.customerPhone].filter(Boolean).join("\n") || "—"}
            </TextBodySm>
          </XStack>
          {row.source === "WEB" ? (
            <XStack marginTop={8} justifyContent="space-between">
              <TextBodySm color="$colorSecondary">Sumber</TextBodySm>
              <TextBodySm fontWeight="700">WEB</TextBodySm>
            </XStack>
          ) : null}
        </View>

        <TextBodyLg fontWeight="700" marginBottom={8}>
          Metode pembayaran
        </TextBodyLg>
        <XStack gap="$2" marginBottom="$4">
          {(["CASH", "QRIS"] as const).map((m) => {
            const active = method === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, active && styles.methodChipActive]}
                onPress={() => setMethod(m)}
              >
                <TextBodySm fontWeight={active ? "800" : "600"} color={active ? ColorPrimary.primary700 : "$colorSecondary"}>
                  {m}
                </TextBodySm>
              </TouchableOpacity>
            );
          })}
        </XStack>

        <AppButton
          onPress={() => void handlePay()}
          disabled={payMutation.isPending}
        >
          {payMutation.isPending ? "Memproses…" : manual ? "Catat & selesaikan" : "Proses pembayaran"}
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: ColorWarning.warning100,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    alignItems: "center",
    backgroundColor: ColorBase.white,
  },
  methodChipActive: {
    borderColor: ColorPrimary.primary600,
    backgroundColor: ColorPrimary.primary50,
  },
});
