import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import { posOrdersAtom, ensurePosSeedDataAtom, expireWebOrdersAtom } from "@/features/pos/store/pos.store";
import { buildOrderItemsSummary, calculateOrderRemainingAmount } from "@/features/pos/pos.utils";
import { ColorBase, ColorDanger, ColorNeutral, ColorPrimary, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

export default function WebOrdersTabPage() {
  const router = useRouter();
  const [orders, setOrders] = useAtom(posOrdersAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const expireWebOrders = useSetAtom(expireWebOrdersAtom);

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
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Web Orders"
        subtitle="Order dari QR/Web yang perlu dikonfirmasi dalam 30 menit"
        actions={
          <AppButton variant="outline" size="sm" onPress={() => expireWebOrders()}>
            Refresh
          </AppButton>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <XStack gap="$3">
          <View style={[styles.summaryCard, { backgroundColor: ColorPrimary.primary600 }]}>
            <TextCaption color="rgba(255,255,255,0.8)">Perlu Konfirmasi</TextCaption>
            <TextBodyLg fontWeight="700" color={ColorBase.white}>
              {activeOrders.length}
            </TextBodyLg>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: ColorWarning.warning100 }]}>
            <TextCaption color={ColorWarning.warning700}>Expired</TextCaption>
            <TextBodyLg fontWeight="700" color={ColorWarning.warning700}>
              {expiredOrders.length}
            </TextBodyLg>
          </View>
        </XStack>

        <YStack gap="$3">
          <TextH3 fontWeight="700">Daftar aktif</TextH3>
          {activeOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <TextBodySm color="$colorSecondary">Tidak ada web order aktif.</TextBodySm>
            </View>
          ) : (
            activeOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack gap={2}>
                    <TextBodyLg fontWeight="700">{order.id}</TextBodyLg>
                    <TextCaption color="$colorSecondary">
                      {order.customerName || "Pelanggan web"}
                    </TextCaption>
                  </YStack>
                  <View style={styles.pendingBadge}>
                    <TextCaption color={ColorPrimary.primary600} fontWeight="700">
                      PENDING
                    </TextCaption>
                  </View>
                </XStack>
                <TextBodySm color="$colorSecondary">
                  {buildOrderItemsSummary(order)}
                </TextBodySm>
                <XStack justifyContent="space-between" alignItems="center">
                  <TextBodySm fontWeight="700">{formatPrice(order.grandTotal)}</TextBodySm>
                  <TextCaption color="$colorSecondary">
                    Sisa {formatPrice(calculateOrderRemainingAmount(order))}
                  </TextCaption>
                </XStack>
                <AppButton
                  variant="primary"
                  size="md"
                  fullWidth
                  title="Konfirmasi & Lanjut Pembayaran"
                  onPress={() => handleConfirm(order.id)}
                />
              </View>
            ))
          )}
        </YStack>

        {expiredOrders.length > 0 && (
          <YStack gap="$3">
            <TextH3 fontWeight="700">Order expired</TextH3>
            {expiredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <XStack justifyContent="space-between" alignItems="center">
                  <TextBodyLg fontWeight="700">{order.id}</TextBodyLg>
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
            ))}
          </YStack>
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
    gap: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
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
