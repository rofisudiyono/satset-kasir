import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import {
  getApiErrorMessage,
  useDeliverOrderMutation,
  useReadyOrdersQuery,
} from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import type { KasirReadyOrder } from "@/lib/api/types";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSuccess, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

function needsManualApproval(row: KasirReadyOrder) {
  return row.paymentStatus === "PENDING_MANUAL_APPROVAL";
}

function ReadyRow({
  row,
  onPress,
  onDeliver,
}: {
  row: KasirReadyOrder;
  onPress: () => void;
  onDeliver?: () => void;
}) {
  const manual = needsManualApproval(row);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onDeliver ? undefined : onPress}
      activeOpacity={onDeliver ? 1 : 0.85}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap={4}>
          <XStack alignItems="center" gap={8} flexWrap="wrap">
            <TextBodyLg fontWeight="700">
              {row.tableLabel || "Takeaway"}
            </TextBodyLg>
            {row.source === "WEB" ? (
              <View style={styles.badgeWeb}>
                <TextCaption fontWeight="700" color={ColorPrimary.primary700}>
                  WEB
                </TextCaption>
              </View>
            ) : null}
            {manual ? (
              <View style={styles.badgeManual}>
                <TextCaption fontWeight="700" color={ColorWarning.warning800}>
                  Manual
                </TextCaption>
              </View>
            ) : null}
            {row.canMarkDelivered ? (
              <View style={styles.badgeReady}>
                <TextCaption fontWeight="700" color={ColorSuccess.success700}>
                  Siap Antar
                </TextCaption>
              </View>
            ) : null}
          </XStack>
          <TextBodySm color="$colorSecondary">
            {[row.customerName, row.customerPhone].filter(Boolean).join(" · ") || "—"}
          </TextBodySm>
          <TextCaption color="$colorSecondary" numberOfLines={1}>
            {row.canMarkDelivered ? "ID order" : "ID siap"}: {row.id.slice(0, 13)}…
          </TextCaption>
        </YStack>
        <YStack alignItems="flex-end" gap={4}>
          <TextBodyLg fontWeight="800">{formatPrice(row.grandTotal)}</TextBodyLg>
          {onDeliver ? (
            <TouchableOpacity style={styles.deliverBtn} onPress={onDeliver}>
              <TextCaption fontWeight="800" color={ColorBase.white}>
                Sudah diantar
              </TextCaption>
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={20} color={ColorNeutral.neutral400} />
          )}
        </YStack>
      </XStack>
    </TouchableOpacity>
  );
}

export default function SiapAntarPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const deliverMutation = useDeliverOrderMutation();
  const { data = [], isLoading, isError, refetch } = useReadyOrdersQuery(
    Boolean(isLoggedIn && isShiftStarted),
  );

  const { manualRows, deliveryRows, pendingRows } = useMemo(() => {
    const manual: KasirReadyOrder[] = [];
    const delivery: KasirReadyOrder[] = [];
    const pending: KasirReadyOrder[] = [];
    for (const r of data) {
      if (r.canMarkDelivered) delivery.push(r);
      else if (needsManualApproval(r)) manual.push(r);
      else pending.push(r);
    }
    return { manualRows: manual, deliveryRows: delivery, pendingRows: pending };
  }, [data]);

  async function handleDeliver(row: KasirReadyOrder) {
    if (!row.orderId) return;
    try {
      await deliverMutation.mutateAsync(row.orderId);
    } catch (error) {
      Alert.alert("Gagal", getApiErrorMessage(error, "Gagal menandai pesanan sudah diantar."));
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Siap antar"
        subtitle="Kasir bisa memantau pesanan siap diantar dan membantu menyerahkan ke pelanggan."
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isError ? (
          <TextBodySm color="$colorSecondary">Gagal memuat daftar. Tarik untuk coba lagi.</TextBodySm>
        ) : null}

        {isLoading ? (
          <TextBodySm color="$colorSecondary">Memuat…</TextBodySm>
        ) : null}

        {!isLoading && data.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$6" gap="$2">
            <Ionicons name="bag-check-outline" size={40} color={ColorNeutral.neutral300} />
            <TextBodySm color="$colorSecondary" textAlign="center">
              Belum ada pesanan siap diantar untuk cabang ini.
            </TextBodySm>
          </YStack>
        ) : null}

        {deliveryRows.length > 0 ? (
          <YStack gap="$2" marginBottom="$4">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="restaurant" size={18} color={ColorSuccess.success700} />
              <TextH3 fontWeight="700">Siap diantar</TextH3>
            </XStack>
            <TextCaption color="$colorSecondary">
              Pesanan sudah selesai dimasak dan bisa diantar oleh kasir atau tim dapur.
            </TextCaption>
            {deliveryRows.map((row) => (
              <ReadyRow
                key={row.id}
                row={row}
                onPress={() => {}}
                onDeliver={() => void handleDeliver(row)}
              />
            ))}
          </YStack>
        ) : null}

        {manualRows.length > 0 ? (
          <YStack gap="$2" marginBottom="$4">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="alert-circle" size={18} color={ColorWarning.warning700} />
              <TextH3 fontWeight="700">Perlu pencatatan manual</TextH3>
            </XStack>
            <TextCaption color="$colorSecondary">
              Pelanggan web pilih bayar ke kasir. Konfirmasi pembayaran di layar berikut.
            </TextCaption>
            {manualRows.map((row) => (
              <ReadyRow
                key={row.id}
                row={row}
                onPress={() =>
                  router.push({
                    pathname: "/bayar-ready",
                    params: { readyId: row.id },
                  } as never)
                }
              />
            ))}
          </YStack>
        ) : null}

        {pendingRows.length > 0 ? (
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="card-outline" size={18} color={ColorSuccess.success700} />
              <TextH3 fontWeight="700">Perlu tindak lanjut kasir</TextH3>
            </XStack>
            <TextCaption color="$colorSecondary">
              Pesanan ini sudah selesai dimasak, tetapi masih menunggu penyelesaian pembayaran.
            </TextCaption>
            {pendingRows.map((row) => (
              <ReadyRow
                key={row.id}
                row={row}
                onPress={() =>
                  router.push({
                    pathname: "/bayar-ready",
                    params: { readyId: row.id },
                  } as never)
                }
              />
            ))}
          </YStack>
        ) : null}

        <TouchableOpacity onPress={() => void refetch()} style={styles.refreshBtn}>
          <TextBodySm fontWeight="600" color={ColorPrimary.primary600}>
            Muat ulang
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
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  badgeWeb: {
    backgroundColor: ColorPrimary.primary50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeManual: {
    backgroundColor: ColorWarning.warning100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeReady: {
    backgroundColor: ColorSuccess.success200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deliverBtn: {
    backgroundColor: ColorSuccess.success600,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshBtn: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
