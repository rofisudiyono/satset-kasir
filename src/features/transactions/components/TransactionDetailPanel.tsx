import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppButton } from "@/components/atoms/AppButton";
import { ShadowCard } from "@/components/atoms/ShadowCard";
import { TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components/atoms/Typography";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import type { Transaction } from "@/types";

import { StatusBadge } from "./StatusBadge";

interface TransactionDetailPanelProps {
  tx: Transaction | null;
  onVoid: (id: string) => void;
  onRefund: (id: string) => void;
}

/**
 * Panel detail transaksi untuk tablet (tampil inline di sisi kanan).
 */
export function TransactionDetailPanel({
  tx,
  onVoid,
  onRefund,
}: TransactionDetailPanelProps) {
  if (!tx) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap={12}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="receipt-outline"
            size={32}
            color={ColorNeutral.neutral400}
          />
        </View>
        <TextBodySm color="$colorSecondary" textAlign="center">
          Pilih transaksi untuk{"\n"}melihat detail
        </TextBodySm>
      </YStack>
    );
  }

  return (
    <YStack flex={1} gap={12} padding={20}>
      <TextH3 fontWeight="700">Detail Transaksi</TextH3>

      <ShadowCard padding="$3" gap="$2">
        <XStack justifyContent="space-between">
          <TextBodySm color="$colorSecondary">No. Nota</TextBodySm>
          <TextBodyLg fontWeight="700" color="$primary">
            {tx.orderNumber ?? tx.id}
          </TextBodyLg>
        </XStack>
        <XStack justifyContent="space-between">
          <TextBodySm color="$colorSecondary">Waktu</TextBodySm>
          <TextBodySm fontWeight="600">{tx.time}</TextBodySm>
        </XStack>
        {tx.table ? (
          <XStack justifyContent="space-between">
            <TextBodySm color="$colorSecondary">Pelanggan</TextBodySm>
            <TextBodySm fontWeight="600">{tx.table}</TextBodySm>
          </XStack>
        ) : null}
        {tx.items ? (
          <XStack justifyContent="space-between" gap={8}>
            <TextBodySm color="$colorSecondary">Item</TextBodySm>
            <TextBodySm
              fontWeight="600"
              flex={1}
              textAlign="right"
              numberOfLines={2}
            >
              {tx.items}
            </TextBodySm>
          </XStack>
        ) : null}
        <XStack justifyContent="space-between">
          <TextBodySm color="$colorSecondary">Total</TextBodySm>
          <TextBodyLg fontWeight="700">{tx.amount}</TextBodyLg>
        </XStack>
        <XStack justifyContent="space-between">
          <TextBodySm color="$colorSecondary">Status</TextBodySm>
          <StatusBadge status={tx.status} />
        </XStack>
      </ShadowCard>

      {tx.status !== "Void" && tx.status !== "Refund" ? (
        <YStack gap={8}>
          <AppButton
            variant="warning"
            size="md"
            fullWidth
            title="Refund"
            icon={
              <Ionicons
                name="return-up-back-outline"
                size={16}
                color={ColorBase.white}
              />
            }
            onPress={() => {
              Alert.alert(
                "Konfirmasi Refund",
                `Refund transaksi ${tx.orderNumber ?? tx.id} sebesar ${tx.amount}?`,
                [
                  { text: "Batal", style: "cancel" },
                  { text: "Refund", onPress: () => onRefund(tx.id) },
                ],
              );
            }}
          />
          <AppButton
            variant="danger"
            size="md"
            fullWidth
            title="Void (Batalkan)"
            icon={
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={ColorBase.white}
              />
            }
            onPress={() => {
              Alert.alert(
                "Konfirmasi Void",
                `Batalkan transaksi ${tx.orderNumber ?? tx.id}? Tindakan ini tidak bisa dibatalkan.`,
                [
                  { text: "Batal", style: "cancel" },
                  {
                    text: "Void",
                    style: "destructive",
                    onPress: () => onVoid(tx.id),
                  },
                ],
              );
            }}
          />
        </YStack>
      ) : (
        <TextCaption color={ColorNeutral.neutral500} textAlign="center">
          Transaksi ini sudah di-{tx.status.toLowerCase()} dan tidak dapat
          diubah.
        </TextCaption>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ColorNeutral.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
});
