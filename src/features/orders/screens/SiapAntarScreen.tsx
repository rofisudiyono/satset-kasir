import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  PageHeader,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import {
  getApiErrorMessage,
  useDeliverOrderMutation,
  useReadyOrdersQuery,
} from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import type { KasirReadyOrder } from "@/lib/api/types";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  ColorBase,
  ColorNeutral,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

function needsManualApproval(row: KasirReadyOrder) {
  return row.paymentStatus === "PENDING_MANUAL_APPROVAL";
}

const ReadyRow = memo(function ReadyRow({
  row,
  onPress,
  onDeliver,
  deliverLoading = false,
}: {
  row: KasirReadyOrder;
  onPress: () => void;
  onDeliver?: () => void;
  deliverLoading?: boolean;
}) {
  const manual = needsManualApproval(row);
  return (
    <Pressable
      disabled={Boolean(onDeliver)}
      style={({ pressed }) => [
        styles.card,
        !onDeliver && pressed && styles.cardPressed,
      ]}
      onPress={onDeliver ? undefined : onPress}
    >
      <View
        style={[
          styles.cardAccent,
          onDeliver ? styles.cardAccentReady : styles.cardAccentPayment,
        ]}
      />
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap={4}>
          <XStack alignItems="center" gap={8} flexWrap="wrap">
            <TextBodyLg fontWeight="700">
              {row.tableLabel || "Takeaway"}
            </TextBodyLg>
            {row.source === "WEB" ? (
              <View style={styles.badgeWeb}>
                <TextCaption fontWeight="700" color={BrandColors.text}>
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
            {[row.customerName, row.customerPhone].filter(Boolean).join(" · ") ||
              "—"}
          </TextBodySm>
          <TextCaption color="$colorSecondary" numberOfLines={1}>
            {row.canMarkDelivered ? "ID order" : "ID siap"}: {row.id.slice(0, 13)}…
          </TextCaption>
        </YStack>
        <YStack alignItems="flex-end" gap={4}>
          <TextBodyLg fontWeight="800">{formatPrice(row.grandTotal)}</TextBodyLg>
          {onDeliver ? (
            <Pressable
              style={({ pressed }) => [styles.deliverBtn, pressed && { opacity: 0.88 }]}
              onPress={onDeliver}
              disabled={deliverLoading}
            >
              <TextCaption fontWeight="800" color={ColorBase.white}>
                {deliverLoading ? "Memproses..." : "Sudah diantar"}
              </TextCaption>
            </Pressable>
          ) : (
            <Ionicons name="chevron-forward" size={20} color={ColorNeutral.neutral400} />
          )}
        </YStack>
      </XStack>
    </Pressable>
  );
});

type SiapEntry =
  | { kind: "meta"; id: string; variant: "error" | "loading" | "empty" }
  | {
      kind: "section";
      id: string;
      title: string;
      subtitle: string;
      icon: keyof typeof Ionicons.glyphMap;
      iconColor: string;
      marginTop: number;
    }
  | { kind: "order"; id: string; row: KasirReadyOrder; action: "deliver" | "bayar" }
  | { kind: "footer"; id: string };

function buildEntries(
  isError: boolean,
  isLoading: boolean,
  dataLen: number,
  deliveryRows: KasirReadyOrder[],
  manualRows: KasirReadyOrder[],
  pendingRows: KasirReadyOrder[],
): SiapEntry[] {
  const out: SiapEntry[] = [];
  if (isError) {
    out.push({ kind: "meta", id: "meta-error", variant: "error" });
  }
  if (isLoading) {
    out.push({ kind: "meta", id: "meta-loading", variant: "loading" });
  }
  if (!isLoading && !isError && dataLen === 0) {
    out.push({ kind: "meta", id: "meta-empty", variant: "empty" });
  }

  let firstSection = true;
  const pushSection = (
    key: string,
    title: string,
    subtitle: string,
    icon: keyof typeof Ionicons.glyphMap,
    iconColor: string,
  ) => {
    const marginTop = firstSection
      ? out.length > 0
        ? 12
        : 0
      : 20;
    firstSection = false;
    out.push({
      kind: "section",
      id: `section-${key}`,
      title,
      subtitle,
      icon,
      iconColor,
      marginTop,
    });
  };

  if (deliveryRows.length > 0) {
    pushSection(
      "delivery",
      "Siap diantar",
      "Pesanan sudah selesai dimasak dan bisa diantar oleh kasir atau tim dapur.",
      "restaurant",
      ColorSuccess.success700,
    );
    for (const row of deliveryRows) {
      out.push({
        kind: "order",
        id: `order-${row.id}`,
        row,
        action: "deliver",
      });
    }
  }

  if (manualRows.length > 0) {
    pushSection(
      "manual",
      "Perlu pencatatan manual",
      "Pelanggan web pilih bayar ke kasir. Konfirmasi pembayaran di layar berikut.",
      "alert-circle",
      ColorWarning.warning700,
    );
    for (const row of manualRows) {
      out.push({
        kind: "order",
        id: `order-${row.id}`,
        row,
        action: "bayar",
      });
    }
  }

  if (pendingRows.length > 0) {
    pushSection(
      "pending",
      "Perlu tindak lanjut kasir",
      "Pesanan ini sudah selesai dimasak, tetapi masih menunggu penyelesaian pembayaran.",
      "card-outline",
      ColorSuccess.success700,
    );
    for (const row of pendingRows) {
      out.push({
        kind: "order",
        id: `order-${row.id}`,
        row,
        action: "bayar",
      });
    }
  }

  out.push({ kind: "footer", id: "footer-refresh" });
  return out;
}

export type SiapAntarScreenProps = {
  variant: "stack" | "tab";
};

export function SiapAntarScreen({ variant }: SiapAntarScreenProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const deliverMutation = useDeliverOrderMutation();
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const { data = [], isLoading, isError, isFetching, refetch } = useReadyOrdersQuery(
    Boolean(isLoggedIn && isShiftStarted),
  );

  const { manualRows, deliveryRows, pendingRows } = useMemo(() => {
    const manual: KasirReadyOrder[] = [];
    const delivery: KasirReadyOrder[] = [];
    const pending: KasirReadyOrder[] = [];
    for (const r of data) {
      if (r.canMarkDelivered || r.paymentStatus === 'PAID') delivery.push(r);
      else if (needsManualApproval(r)) manual.push(r);
      else pending.push(r);
    }
    return { manualRows: manual, deliveryRows: delivery, pendingRows: pending };
  }, [data]);

  const entries = useMemo(
    () =>
      buildEntries(
        isError,
        isLoading,
        data.length,
        deliveryRows,
        manualRows,
        pendingRows,
      ),
    [
      isError,
      isLoading,
      data.length,
      deliveryRows,
      manualRows,
      pendingRows,
    ],
  );

  const handleDeliver = useCallback(
    (row: KasirReadyOrder) => {
      Alert.alert(
        "Tandai sudah diantar?",
        `${row.tableLabel || row.customerName || "Pesanan"} akan hilang dari daftar siap antar.`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Sudah Diantar",
            onPress: async () => {
              setDeliveringOrderId(row.id);
              try {
                await deliverMutation.mutateAsync(row.id);
                void refetch();
              } catch (error) {
                Alert.alert(
                  "Gagal",
                  getApiErrorMessage(error, "Gagal menandai pesanan sudah diantar."),
                );
              } finally {
                setDeliveringOrderId(null);
              }
            },
          },
        ],
      );
    },
    [deliverMutation, refetch],
  );

  const goBayarReady = useCallback(
    (row: KasirReadyOrder) => {
      router.push({
        pathname: "/pilih-pembayaran" as never,
        params: {
          collectOrderId: row.id,
          grandTotal: String(row.grandTotal),
        },
      });
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderItem = useCallback<ListRenderItem<SiapEntry>>(
    ({ item }) => {
      if (item.kind === "meta") {
        if (item.variant === "error") {
          return (
            <TextBodySm color="$colorSecondary">
              Gagal memuat daftar. Tarik untuk coba lagi.
            </TextBodySm>
          );
        }
        if (item.variant === "loading") {
          return <TextBodySm color="$colorSecondary">Memuat…</TextBodySm>;
        }
        return (
          <YStack
            alignItems="center"
            paddingVertical="$6"
            paddingHorizontal="$4"
            gap="$2"
            style={styles.emptyPanel}
          >
            <Ionicons name="bag-check-outline" size={42} color={ColorNeutral.neutral300} />
            <TextBodySm color="$colorSecondary" textAlign="center">
              Belum ada pesanan siap diantar untuk cabang ini.
            </TextBodySm>
          </YStack>
        );
      }

      if (item.kind === "section") {
        return (
          <YStack
            gap="$2"
            marginTop={item.marginTop}
            marginBottom="$2"
            style={styles.sectionHeader}
          >
            <XStack alignItems="center" gap="$2">
              <Ionicons name={item.icon} size={18} color={item.iconColor} />
              <TextH3 fontWeight="700">{item.title}</TextH3>
            </XStack>
            <TextCaption color="$colorSecondary">{item.subtitle}</TextCaption>
          </YStack>
        );
      }

      if (item.kind === "order") {
        const { row, action } = item;
        if (action === "deliver") {
          return (
            <ReadyRow
              row={row}
              onPress={() => {}}
              onDeliver={() => void handleDeliver(row)}
              deliverLoading={deliveringOrderId === row.id}
            />
          );
        }
        return <ReadyRow row={row} onPress={() => goBayarReady(row)} />;
      }

      return (
        <Pressable onPress={handleRefresh} style={styles.refreshBtn}>
          <TextBodySm fontWeight="600" color={BrandColors.text}>
            Muat ulang
          </TextBodySm>
        </Pressable>
      );
    },
    [deliveringOrderId, goBayarReady, handleDeliver, handleRefresh],
  );

  const keyExtractor = useCallback((item: SiapEntry) => item.id, []);

  const getItemType = useCallback((item: SiapEntry) => item.kind, []);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Siap antar"
        subtitle="Kasir bisa memantau pesanan siap diantar dan membantu menyerahkan ke pelanggan."
        showBack={variant === "stack"}
        onBack={variant === "stack" ? () => router.back() : undefined}
      />

      <FlashList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        drawDistance={480}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={BrandColors.deep}
            colors={[BrandColors.deep]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 112,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 5,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  cardAccentReady: {
    backgroundColor: ColorSuccess.success500,
  },
  cardAccentPayment: {
    backgroundColor: BrandColors.deep,
  },
  cardPressed: {
    opacity: 0.88,
  },
  badgeWeb: {
    backgroundColor: BrandColors.tint,
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
    borderRadius: 999,
  },
  sectionHeader: {
    paddingHorizontal: 2,
  },
  emptyPanel: {
    backgroundColor: ColorBase.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
  },
  refreshBtn: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
