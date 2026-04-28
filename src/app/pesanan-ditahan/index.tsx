import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { memo, useCallback } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  cartAtom,
  cartOrderDraftAtom,
  heldOrdersAtom,
  type HeldOrder,
} from "@/features/cart/store/cart.store";
import {
  PageHeader,
  TextBody,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import {
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PesananDitahanPage() {
  const router = useRouter();
  const [heldOrders, setHeldOrders] = useAtom(heldOrdersAtom);
  const [, setCart] = useAtom(cartAtom);
  const [, setOrderDraft] = useAtom(cartOrderDraftAtom);

  const handleResume = useCallback((order: HeldOrder) => {
    Alert.alert("Lanjutkan Pesanan", `Lanjutkan pesanan "${order.label}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Lanjutkan",
        onPress: () => {
          setCart(order.items);
          setOrderDraft({
            customerName: order.customerName ?? "",
            customerPhone: order.customerPhone ?? "",
            orderNote: order.orderNote ?? "",
            customerVisitStatus: order.customerVisitStatus ?? "returning",
            orderType: order.orderType,
            tableId: order.tableId,
            tableLabel: order.tableLabel ?? order.tableNumber,
          });
          setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
          router.back();
          router.push("/keranjang" as never);
        },
      },
    ]);
  }, [router, setCart, setHeldOrders, setOrderDraft]);

  const handleDelete = useCallback((order: HeldOrder) => {
    Alert.alert("Hapus Pesanan", `Hapus pesanan "${order.label}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () =>
          setHeldOrders((prev) => prev.filter((o) => o.id !== order.id)),
      },
    ]);
  }, [setHeldOrders]);

  const renderItem = useCallback<ListRenderItem<HeldOrder>>(
    ({ item }) => (
      <HeldOrderCard
        order={item}
        onResume={handleResume}
        onDelete={handleDelete}
      />
    ),
    [handleDelete, handleResume],
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Pesanan Ditahan"
        subtitle={`${heldOrders.length} pesanan`}
        showBack
        onBack={() => router.back()}
      />

      {heldOrders.length === 0 ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <Ionicons
            name="time-outline"
            size={56}
            color={ColorNeutral.neutral300}
          />
          <TextH3 fontWeight="700" color={ColorNeutral.neutral400}>
            Tidak Ada Pesanan Ditahan
          </TextH3>
          <TextBodySm
            color={ColorNeutral.neutral400}
            textAlign="center"
            paddingHorizontal={40}
          >
            Pesanan yang ditahan dari keranjang akan muncul di sini.
          </TextBodySm>
        </YStack>
      ) : (
        <FlashList
          data={heldOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ItemSeparatorComponent={HeldOrderSeparator}
          drawDistance={400}
        />
      )}
    </SafeAreaView>
  );
}

function HeldOrderSeparator() {
  return <View style={styles.itemSeparator} />;
}

// ─── Card Component ───────────────────────────────────────────────────────────

interface HeldOrderCardProps {
  order: HeldOrder;
  onResume: (order: HeldOrder) => void;
  onDelete: (order: HeldOrder) => void;
}

const HeldOrderCard = memo(function HeldOrderCard({
  order,
  onResume,
  onDelete,
}: HeldOrderCardProps) {
  const totalItems = order.items.reduce((s, c) => s + c.quantity, 0);
  const subtotal = order.items.reduce(
    (s, c) => s + c.unitPrice * c.quantity,
    0,
  );
  const itemsSummary = order.items
    .slice(0, 2)
    .map(
      (c) =>
        `${c.productName}${c.variantLabel ? ` (${c.variantLabel})` : ""} x${c.quantity}`,
    )
    .join(", ");
  const more =
    order.items.length > 2 ? ` +${order.items.length - 2} lainnya` : "";

  return (
    <View style={styles.card}>
      <XStack
        justifyContent="space-between"
        alignItems="flex-start"
        marginBottom={8}
      >
        <YStack flex={1} gap={2}>
          <XStack alignItems="center" gap={6}>
            <View style={styles.holdBadge}>
              <Ionicons name="time" size={12} color={ColorPrimary.primary600} />
            </View>
            <TextBody fontWeight="700">{order.label || "Tanpa Nama"}</TextBody>
          </XStack>
          <TextCaption color={ColorNeutral.neutral500}>
            {order.orderType} · Ditahan {order.createdAt}
          </TextCaption>
          {order.tableLabel ? (
            <TextCaption color={ColorNeutral.neutral500}>
              {order.tableLabel}
            </TextCaption>
          ) : null}
        </YStack>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(order)}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={ColorDanger.danger600}
          />
        </TouchableOpacity>
      </XStack>

      <TextBodySm color={ColorNeutral.neutral600} numberOfLines={2}>
        {itemsSummary}
        {more}
      </TextBodySm>

      <XStack justifyContent="space-between" alignItems="center" marginTop={12}>
        <YStack>
          <TextCaption color={ColorNeutral.neutral500}>
            {totalItems} item
          </TextCaption>
          <TextBody fontWeight="700" color={ColorGreen.green600}>
            {formatPrice(subtotal)}
          </TextBody>
        </YStack>
        <TouchableOpacity
          style={styles.resumeBtn}
          onPress={() => onResume(order)}
        >
          <Ionicons name="play" size={14} color={ColorBase.white} />
          <TextBodySm fontWeight="700" color={ColorBase.white}>
            Lanjutkan
          </TextBodySm>
        </TouchableOpacity>
      </XStack>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  itemSeparator: {
    height: 12,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  holdBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ColorPrimary.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ColorDanger.danger50,
    alignItems: "center",
    justifyContent: "center",
  },
  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: ColorPrimary.primary600,
    borderRadius: 12,
  },
});
