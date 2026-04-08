import { Ionicons } from "@expo/vector-icons";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import { enqueueKdsFulfillmentEventAtom, ensurePosSeedDataAtom, markOrderServedAtom, posOrdersAtom } from "@/features/pos/store/pos.store";
import { buildOrderItemsSummary } from "@/features/pos/pos.utils";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSuccess, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

export default function SiapAntarTabPage() {
  const [orders] = useAtom(posOrdersAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const markServed = useSetAtom(markOrderServedAtom);
  const enqueueEvent = useSetAtom(enqueueKdsFulfillmentEventAtom);

  useEffect(() => {
    ensureSeedData();
  }, [ensureSeedData]);

  const readyOrders = orders.filter((order) => order.fulfillment === "READY");
  const preparingOrders = orders.filter(
    (order) => order.fulfillment === "PREPARING" && order.status === "PAID",
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Siap Antar"
        subtitle="Order READY dari dapur dan aksi Sudah Diantar"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <YStack gap="$3">
          <XStack gap="$3">
            <View style={[styles.summaryCard, { backgroundColor: ColorSuccess.success50 }]}>
              <TextCaption color={ColorSuccess.success700}>READY</TextCaption>
              <TextBodyLg fontWeight="700" color={ColorSuccess.success700}>
                {readyOrders.length}
              </TextBodyLg>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: ColorWarning.warning50 }]}>
              <TextCaption color={ColorWarning.warning700}>PREPARING</TextCaption>
              <TextBodyLg fontWeight="700" color={ColorWarning.warning700}>
                {preparingOrders.length}
              </TextBodyLg>
            </View>
          </XStack>

          <TextH3 fontWeight="700">Order siap diantar</TextH3>
          {readyOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <TextBodySm color="$colorSecondary">Belum ada order READY.</TextBodySm>
            </View>
          ) : (
            readyOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack gap={2}>
                    <TextBodyLg fontWeight="700">{order.id}</TextBodyLg>
                    <TextCaption color="$colorSecondary">
                      {order.customerName || order.tableLabel || "Takeaway"}
                    </TextCaption>
                  </YStack>
                  <View style={styles.readyBadge}>
                    <TextCaption color={ColorSuccess.success700} fontWeight="700">
                      READY
                    </TextCaption>
                  </View>
                </XStack>
                <TextBodySm color="$colorSecondary">
                  {buildOrderItemsSummary(order)}
                </TextBodySm>
                <XStack justifyContent="space-between" alignItems="center">
                  <TextBodySm fontWeight="700">{formatPrice(order.grandTotal)}</TextBodySm>
                  <AppButton
                    variant="success"
                    size="sm"
                    onPress={() => markServed(order.id)}
                  >
                    Sudah Diantar
                  </AppButton>
                </XStack>
              </View>
            ))
          )}
        </YStack>

        <YStack gap="$3">
          <TextH3 fontWeight="700">Simulasi event dapur</TextH3>
          {preparingOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <TextBodySm color="$colorSecondary">Tidak ada order PREPARING.</TextBodySm>
            </View>
          ) : (
            preparingOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack gap={2}>
                    <TextBodyLg fontWeight="700">{order.id}</TextBodyLg>
                    <TextCaption color="$colorSecondary">
                      {order.customerName || order.tableLabel || "Takeaway"}
                    </TextCaption>
                  </YStack>
                  <TouchableOpacity
                    onPress={() =>
                      enqueueEvent({
                        id: `kds-sim-${Date.now()}`,
                        orderId: order.id,
                        fulfillment: "READY",
                        source: "MANUAL",
                        createdAt: Date.now(),
                      })
                    }
                    style={styles.simulateButton}
                  >
                    <Ionicons name="flash-outline" size={16} color={ColorPrimary.primary600} />
                    <TextCaption color={ColorPrimary.primary600} fontWeight="700">
                      Tandai READY
                    </TextCaption>
                  </TouchableOpacity>
                </XStack>
                <TextBodySm color="$colorSecondary">
                  {buildOrderItemsSummary(order)}
                </TextBodySm>
              </View>
            ))
          )}
        </YStack>
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
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: ColorSuccess.success50,
  },
  simulateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary50,
  },
  emptyCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
});
