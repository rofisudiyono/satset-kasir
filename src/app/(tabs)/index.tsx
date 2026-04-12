import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import { usePendingWebOrdersQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import type { PendingWebOrder } from "@/lib/api/types";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSuccess } from "@/themes/Colors";
import { formatPrice } from "@/utils";

function formatItems(order: PendingWebOrder): string {
  return order.items
    .map((i) => `${i.qty}x ${i.name}${i.variantName ? ` (${i.variantName})` : ""}`)
    .join(", ");
}

function PendingOrderCard({
  order,
  onPress,
}: {
  order: PendingWebOrder;
  onPress: () => void;
}) {
  const isOnline = order.webPaymentMode === "ONLINE";

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.85}>
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack gap={8} alignItems="center" flexWrap="wrap" flex={1}>
          <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeManual]}>
            <TextCaption
              fontWeight="700"
              color={isOnline ? ColorSuccess.success700 : ColorPrimary.primary700}
            >
              {isOnline ? "QRIS/VA" : "Manual"}
            </TextCaption>
          </View>
          <TextCaption color={ColorNeutral.neutral500} fontWeight="600">
            #{order.id.slice(0, 8).toUpperCase()}
          </TextCaption>
        </XStack>
        <XStack alignItems="center" gap={4}>
          <TextBodyLg fontWeight="800" color={ColorPrimary.primary700}>
            {formatPrice(order.grandTotal)}
          </TextBodyLg>
          <Ionicons name="chevron-forward" size={18} color={ColorNeutral.neutral400} />
        </XStack>
      </XStack>

      <YStack gap={2}>
        <TextBodyLg fontWeight="700">
          {[order.tableLabel, order.customerName].filter(Boolean).join(" · ") || "Takeaway"}
        </TextBodyLg>
        {order.customerPhone ? (
          <TextBodySm color="$colorSecondary">{order.customerPhone}</TextBodySm>
        ) : null}
        <TextBodySm color="$colorSecondary" numberOfLines={2}>
          {formatItems(order)}
        </TextBodySm>
        {order.orderNote ? (
          <TextBodySm color="$colorSecondary" fontStyle="italic">
            Catatan: {order.orderNote}
          </TextBodySm>
        ) : null}
      </YStack>
    </TouchableOpacity>
  );
}

export default function WebOrdersTabPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);

  const { data = [], isLoading, isError, refetch } = usePendingWebOrdersQuery(
    Boolean(isLoggedIn && isShiftStarted),
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Web Orders"
        subtitle="Pesanan dari QR/Web menunggu konfirmasi pembayaran kasir"
        actions={
          <AppButton variant="outline" size="sm" onPress={() => void refetch()}>
            Refresh
          </AppButton>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryCard}>
          <TextCaption color="rgba(255,255,255,0.8)">Menunggu konfirmasi</TextCaption>
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            {data.length} pesanan
          </TextBodyLg>
        </View>

        {isError ? (
          <TextBodySm color="$colorSecondary">Gagal memuat data. Tarik untuk coba lagi.</TextBodySm>
        ) : null}

        <TextH3 fontWeight="700">Daftar Pending</TextH3>

        {isLoading ? (
          <View style={styles.emptyCard}>
            <TextBodySm color="$colorSecondary">Memuat pesanan…</TextBodySm>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyCard}>
            <TextBodySm color="$colorSecondary">
              Tidak ada pesanan web yang menunggu konfirmasi.
            </TextBodySm>
          </View>
        ) : (
          data.map((order) => (
            <PendingOrderCard
              key={order.id}
              order={order}
              onPress={() =>
                router.push({
                  pathname: "/konfirmasi-web-order",
                  params: { pendingId: order.id },
                } as never)
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: ColorPrimary.primary600,
  },
  orderCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeManual: {
    backgroundColor: ColorPrimary.primary50,
  },
  badgeOnline: {
    backgroundColor: ColorSuccess.success50,
  },
  emptyCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
});
