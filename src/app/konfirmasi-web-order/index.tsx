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
  useConfirmPendingWebOrderMutation,
  useCancelPendingWebOrderMutation,
  usePendingWebOrdersQuery,
} from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import type { PaymentEntry } from "@/lib/api/kasir.api";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { ColorBase, ColorDanger, ColorNeutral, ColorPrimary, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

type PayMethod = "CASH" | "QRIS" | "TRANSFER";

export default function KonfirmasiWebOrderPage() {
  const router = useRouter();
  const { pendingId } = useLocalSearchParams<{ pendingId: string }>();
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);

  const [method, setMethod] = useState<PayMethod>("CASH");
  const confirmMutation = useConfirmPendingWebOrderMutation();
  const cancelMutation = useCancelPendingWebOrderMutation();

  const query = usePendingWebOrdersQuery(Boolean(isLoggedIn && isShiftStarted));
  const order = useMemo(
    () => (query.data ?? []).find((o) => o.id === pendingId) ?? null,
    [query.data, pendingId],
  );

  async function handleConfirm() {
    if (!order) return;
    const payments: PaymentEntry[] = [
      {
        method,
        amountPaid: order.grandTotal,
        ...(method === "CASH" ? { amountReceived: order.grandTotal } : {}),
      },
    ];
    try {
      await confirmMutation.mutateAsync({ pendingId: order.id, payments });
      Alert.alert(
        "Pembayaran dikonfirmasi",
        "Pesanan sudah masuk dapur.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert("Gagal", getApiErrorMessage(error, "Konfirmasi pembayaran gagal."));
    }
  }

  function handleCancel() {
    Alert.alert(
      "Batalkan pesanan?",
      "Pesanan web ini akan dihapus dan tidak diproses.",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, batalkan",
          style: "destructive",
          onPress: async () => {
            if (!order) return;
            try {
              await cancelMutation.mutateAsync(order.id);
              router.back();
            } catch (error) {
              Alert.alert("Gagal", getApiErrorMessage(error, "Gagal membatalkan pesanan."));
            }
          },
        },
      ],
    );
  }

  if (!pendingId) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Konfirmasi Bayar" showBack onBack={() => router.back()} />
        <TextBodySm padding="$4">Parameter tidak valid.</TextBodySm>
      </SafeAreaView>
    );
  }

  if (query.isLoading && !order) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Konfirmasi Bayar" showBack onBack={() => router.back()} />
        <TextBodySm padding="$4">Memuat pesanan…</TextBodySm>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Konfirmasi Bayar" showBack onBack={() => router.back()} />
        <YStack padding="$4" gap="$2">
          <TextBodySm color="$colorSecondary">
            Pesanan tidak ditemukan (mungkin sudah dikonfirmasi atau dibatalkan).
          </TextBodySm>
          <AppButton variant="outline" onPress={() => router.back()}>Kembali</AppButton>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Konfirmasi Pembayaran"
        subtitle="Pesanan web — terima bayar lalu kirim ke dapur"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner info */}
        <View style={styles.banner}>
          <Ionicons name="globe-outline" size={20} color={ColorPrimary.primary700} />
          <TextBodySm flex={1} color={ColorPrimary.primary700}>
            Pesanan dari web. Menu sudah dipilih customer.{" "}
            {order.webPaymentMode === "ONLINE"
              ? "Customer memilih QRIS/VA — konfirmasi setelah pembayaran diterima."
              : "Customer memilih bayar manual di kasir."}
          </TextBodySm>
        </View>

        {/* Detail pesanan */}
        <View style={styles.card}>
          <XStack justifyContent="space-between" marginBottom={12}>
            <TextCaption color="$colorSecondary">Total Pembayaran</TextCaption>
            <TextH3 fontWeight="800">{formatPrice(order.grandTotal)}</TextH3>
          </XStack>

          <XStack justifyContent="space-between" marginBottom={6}>
            <TextBodySm color="$colorSecondary">Meja / Label</TextBodySm>
            <TextBodySm fontWeight="700">{order.tableLabel || "—"}</TextBodySm>
          </XStack>
          <XStack justifyContent="space-between" marginBottom={6}>
            <TextBodySm color="$colorSecondary">Pelanggan</TextBodySm>
            <TextBodySm fontWeight="700">
              {[order.customerName, order.customerPhone].filter(Boolean).join(" · ") || "—"}
            </TextBodySm>
          </XStack>
          {order.discountAmount > 0 ? (
            <XStack justifyContent="space-between" marginBottom={6}>
              <TextBodySm color="$colorSecondary">Diskon</TextBodySm>
              <TextBodySm fontWeight="700" color={ColorDanger.danger600}>
                -{formatPrice(order.discountAmount)}
              </TextBodySm>
            </XStack>
          ) : null}
        </View>

        {/* Item list */}
        <TextBodyLg fontWeight="700" marginBottom={8}>Menu Dipesan</TextBodyLg>
        <View style={styles.card}>
          {order.items.map((item, idx) => (
            <XStack key={idx} justifyContent="space-between" marginBottom={idx < order.items.length - 1 ? 8 : 0}>
              <YStack flex={1}>
                <TextBodySm fontWeight="700">
                  {item.qty}x {item.name}
                  {item.variantName ? ` (${item.variantName})` : ""}
                </TextBodySm>
                {item.note ? (
                  <TextCaption color={ColorWarning.warning700} fontStyle="italic">
                    {item.note}
                  </TextCaption>
                ) : null}
                {item.modifiers?.map((m, mi) => (
                  <TextCaption key={mi} color="$colorSecondary">+ {m.label}</TextCaption>
                ))}
              </YStack>
              <TextBodySm fontWeight="600">
                {formatPrice(item.unitPrice * item.qty)}
              </TextBodySm>
            </XStack>
          ))}
        </View>

        {/* Pilih metode */}
        <TextBodyLg fontWeight="700" marginBottom={8}>Metode Pembayaran</TextBodyLg>
        <XStack gap="$2" marginBottom="$5">
          {(["CASH", "QRIS", "TRANSFER"] as const).map((m) => {
            const active = method === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, active && styles.methodChipActive]}
                onPress={() => setMethod(m)}
              >
                <TextBodySm
                  fontWeight={active ? "800" : "600"}
                  color={active ? ColorPrimary.primary700 : "$colorSecondary"}
                >
                  {m}
                </TextBodySm>
              </TouchableOpacity>
            );
          })}
        </XStack>

        <AppButton
          onPress={() => void handleConfirm()}
          disabled={confirmMutation.isPending || cancelMutation.isPending}
        >
          {confirmMutation.isPending ? "Memproses…" : "Konfirmasi Bayar & Kirim ke Dapur"}
        </AppButton>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          disabled={cancelMutation.isPending || confirmMutation.isPending}
        >
          <TextBodySm color={ColorDanger.danger600} fontWeight="600">
            Batalkan pesanan ini
          </TextBodySm>
        </TouchableOpacity>
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
    paddingBottom: 48,
    gap: 12,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: ColorPrimary.primary50,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorPrimary.primary200,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
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
  cancelBtn: {
    alignSelf: "center",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
