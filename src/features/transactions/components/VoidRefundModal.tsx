import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppButton } from "@/components/atoms/AppButton";
import { ShadowCard } from "@/components/atoms/ShadowCard";
import { TextBody, TextBodyLg, TextBodySm, TextCaption, TextH3 } from "@/components/atoms/Typography";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import type { Transaction } from "@/types";

import { StatusBadge } from "./StatusBadge";

interface VoidRefundModalProps {
  tx: Transaction | null;
  visible: boolean;
  onClose: () => void;
  onVoid: (id: string) => void;
  onRefund: (id: string) => void;
}

/**
 * Bottom sheet modal detail transaksi untuk phone.
 */
export function VoidRefundModal({
  tx,
  visible,
  onClose,
  onVoid,
  onRefund,
}: VoidRefundModalProps) {
  if (!tx) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <YStack gap={12} padding={20}>
            <TextH3 fontWeight="700">Detail Transaksi</TextH3>

            <ShadowCard padding="$3" gap="$2">
              <XStack justifyContent="space-between">
                <TextBodySm color="$colorSecondary">No. Order</TextBodySm>
                <TextBodyLg fontWeight="700" color="$primary">
                  {tx.id}
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
                    onClose();
                    Alert.alert(
                      "Konfirmasi Refund",
                      `Refund transaksi ${tx.id} sebesar ${tx.amount}?`,
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
                    onClose();
                    Alert.alert(
                      "Konfirmasi Void",
                      `Batalkan transaksi ${tx.id}? Tindakan ini tidak bisa dibatalkan.`,
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

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <TextBody fontWeight="700" color={ColorNeutral.neutral600}>
                Tutup
              </TextBody>
            </TouchableOpacity>
          </YStack>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: ColorBase.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: ColorNeutral.neutral300,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  closeBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
});
