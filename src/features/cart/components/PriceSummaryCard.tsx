import React from "react";
import { StyleSheet, View } from "react-native";
import { XStack } from "tamagui";

import { TextBody, TextH3 } from "@/components/atoms/Typography";
import { ColorBase, ColorGreen, ColorNeutral, ColorSurface } from "@/themes/Colors";
import { formatPrice } from "@/utils";

interface PriceSummaryCardProps {
  subtotal: number;
  discount: number;
  ppn: number;
  total: number;
  taxLabel?: string;
  taxRate?: number;
}

export function PriceSummaryCard({
  subtotal,
  discount,
  ppn,
  total,
  taxLabel = "PPN",
  taxRate,
}: PriceSummaryCardProps) {
  const taxPercent = taxRate !== undefined
    ? `${Math.round(taxRate * 100)}%`
    : "11%";

  return (
    <View style={styles.card}>
      <XStack justifyContent="space-between" marginBottom={10}>
        <TextBody color="$colorSecondary">Subtotal</TextBody>
        <TextBody fontWeight="600">{formatPrice(subtotal)}</TextBody>
      </XStack>

      {discount > 0 && (
        <XStack justifyContent="space-between" marginBottom={10}>
          <TextBody color="$colorSecondary">Diskon</TextBody>
          <TextBody fontWeight="600" color={ColorGreen.green600}>
            -{formatPrice(discount)}
          </TextBody>
        </XStack>
      )}

      {ppn > 0 && (
        <XStack justifyContent="space-between" marginBottom={16}>
          <TextBody color="$colorSecondary">{taxLabel} {taxPercent}</TextBody>
          <TextBody fontWeight="600">{formatPrice(ppn)}</TextBody>
        </XStack>
      )}

      <View style={styles.divider} />

      <XStack justifyContent="space-between" marginTop={14}>
        <TextH3 fontWeight="700">Total Bayar</TextH3>
        <TextH3 fontWeight="700" color="$primary">
          {formatPrice(total)}
        </TextH3>
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorSurface.border,
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral100,
    marginVertical: 12,
  },
});
