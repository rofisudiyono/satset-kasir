import { Ionicons } from "@expo/vector-icons";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton, PageHeader, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components";
import { enqueueKdsFulfillmentEventAtom, ensurePosSeedDataAtom, markOrderServedAtom, posOrdersAtom } from "@/features/pos/store/pos.store";
import { buildOrderItemsSummary } from "@/features/pos/pos.utils";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSuccess, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

export default function SiapAntarTabPage() {
  const [orders] = useAtom(posOrdersAtom);
  const ensureSeedData = useSetAtom(ensurePosSeedDataAtom);
  const markServed = useSetAtom(markOrderServedAtom);
  const enqueueEvent = useSetAtom(enqueueKdsFulfillmentEventAtom);
  const { isTablet, contentMaxWidth, horizontalPadding, sectionGap } =
    useResponsiveLayout();

  useEffect(() => {
    ensureSeedData();
  }, [ensureSeedData]);

  const readyOrders = orders.filter((order) => order.fulfillment === "READY");
  const preparingOrders = orders.filter(
    (order) => order.fulfillment === "PREPARING" && order.status === "PAID",
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Siap Antar"
        subtitle="Order READY dari dapur dan aksi Sudah Diantar"
        maxWidth={contentMaxWidth}
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
        <YStack gap="$3">
          <XStack gap="$3" flexWrap="wrap">
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
        </YStack>

        <XStack
          gap="$4"
          flexDirection={isTablet ? "row" : "column"}
          alignItems="stretch"
        >
          <YStack gap="$3" flex={isTablet ? 1.05 : undefined}>
            <TextH3 fontWeight="700">Order siap diantar</TextH3>
            {readyOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <TextBodySm color="$colorSecondary">Belum ada order READY.</TextBodySm>
              </View>
            ) : (
              readyOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <XStack justifyContent="space-between" alignItems="center" gap="$3">
                    <YStack gap={2} flex={1}>
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
                  <XStack justifyContent="space-between" alignItems="center" gap="$3">
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

          <YStack gap="$3" flex={isTablet ? 0.95 : undefined}>
            <TextH3 fontWeight="700">Simulasi event dapur</TextH3>
            {preparingOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <TextBodySm color="$colorSecondary">Tidak ada order PREPARING.</TextBodySm>
              </View>
            ) : (
              preparingOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <XStack justifyContent="space-between" alignItems="center" gap="$3">
                    <YStack gap={2} flex={1}>
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
