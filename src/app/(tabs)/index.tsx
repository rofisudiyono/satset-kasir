import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import { posOrdersAtom, ensurePosSeedDataAtom, expireWebOrdersAtom } from "@/features/pos/store/pos.store";
import { buildOrderItemsSummary } from "@/features/pos/pos.utils";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { ColorBase, ColorDanger, ColorNeutral, ColorPrimary, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

export default function WebOrdersTabPage() {
  const router = useRouter();
  const [orders, setOrders] = useAtom(posOrdersAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const expireWebOrders = useSetAtom(expireWebOrdersAtom);
  const { isTablet, contentMaxWidth, horizontalPadding, sectionGap } =
    useResponsiveLayout();

  useEffect(() => {
    ensureSeedData();
    expireWebOrders();
  }, [ensureSeedData, expireWebOrders]);

  const webOrders = orders.filter((order) => order.source === "WEB");
  const activeOrders = webOrders.filter((order) => order.status === "PENDING");
  const expiredOrders = webOrders.filter((order) => order.status === "EXPIRED");

  function handleConfirm(orderId: string) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, source: "WALK_IN" as const } : order,
      ),
    );
    router.push({
      pathname: "/pilih-pembayaran",
      params: { orderId },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Web Orders"
        subtitle="Order dari QR/Web yang perlu dikonfirmasi dalam 30 menit"
        maxWidth={contentMaxWidth}
        actions={
          <AppButton variant="outline" size="sm" onPress={() => expireWebOrders()}>
            Refresh
          </AppButton>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            gap: sectionGap,
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
        <XStack gap="$3" flexWrap="wrap">
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <TextCaption color="rgba(255,255,255,0.8)">Perlu Konfirmasi</TextCaption>
            <TextBodyLg fontWeight="700" color={ColorBase.white}>
              {activeOrders.length}
            </TextBodyLg>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardWarning]}>
            <TextCaption color={ColorWarning.warning700}>Expired</TextCaption>
            <TextBodyLg fontWeight="700" color={ColorWarning.warning700}>
              {expiredOrders.length}
            </TextBodyLg>
          </View>
        </XStack>

        <XStack
          gap="$4"
          flexDirection={isTablet ? "row" : "column"}
          alignItems="stretch"
        >
          <YStack gap="$3" flex={isTablet ? 1.15 : undefined}>
            <TextH3 fontWeight="700">Daftar aktif</TextH3>
            {activeOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <TextBodySm color="$colorSecondary">Tidak ada web order aktif.</TextBodySm>
              </View>
            ) : (
              activeOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <XStack gap={8} alignItems="center" flexWrap="wrap" flex={1}>
                      <View style={styles.pendingBadge}>
                        <TextCaption color={ColorPrimary.primary600} fontWeight="700">
                          Menunggu
                        </TextCaption>
                      </View>
                      <TextCaption color={ColorNeutral.neutral500} fontWeight="600">
                        {order.id}
                      </TextCaption>
                    </XStack>
                    <YStack alignItems="flex-end" gap={1}>
                      <TextCaption color={ColorNeutral.neutral500}>Total</TextCaption>
                      <TextBodyLg fontWeight="700" color={ColorPrimary.primary600}>
                        {formatPrice(order.grandTotal)}
                      </TextBodyLg>
                    </YStack>
                  </XStack>

                  <YStack gap={4}>
                    <TextBodyLg fontWeight="700">
                      {[order.tableLabel, order.customerName].filter(Boolean).join(" • ")}
                    </TextBodyLg>
                    <TextBodySm color="$colorSecondary">
                      {buildOrderItemsSummary(order)}
                    </TextBodySm>
                  </YStack>

                  <AppButton
                    variant="primary"
                    size="md"
                    fullWidth
                    title="Proses / Pembayaran"
                    onPress={() => handleConfirm(order.id)}
                  />
                </View>
              ))
            )}
          </YStack>

          <YStack gap="$3" flex={isTablet ? 0.85 : undefined}>
            <TextH3 fontWeight="700">Order expired</TextH3>
            {expiredOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <TextBodySm color="$colorSecondary">Belum ada web order expired.</TextBodySm>
              </View>
            ) : (
              expiredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <XStack justifyContent="space-between" alignItems="center" gap="$3">
                    <YStack gap={2} flex={1}>
                      <TextBodyLg fontWeight="700">{order.id}</TextBodyLg>
                      <TextBodySm color="$colorSecondary">
                        {[order.tableLabel, order.customerName].filter(Boolean).join(" • ")}
                      </TextBodySm>
                    </YStack>
                    <View style={styles.expiredBadge}>
                      <TextCaption color={ColorDanger.danger600} fontWeight="700">
                        EXPIRED
                      </TextCaption>
                    </View>
                  </XStack>
                  <TextBodySm color="$colorSecondary">
                    {buildOrderItemsSummary(order)}
                  </TextBodySm>
                </View>
              ))
            )}
          </YStack>
        </XStack>
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
    gap: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    flex: 1,
    minWidth: 220,
    borderRadius: 16,
    padding: 16,
  },
  summaryCardPrimary: {
    backgroundColor: ColorPrimary.primary600,
  },
  summaryCardWarning: {
    backgroundColor: ColorWarning.warning100,
  },
  orderCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary50,
  },
  expiredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: ColorDanger.danger25,
  },
  emptyCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
});
