import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { XStack, YStack } from "tamagui";

import {
  TextBodyLg,
  TextBodySm,
  TextCaption,
} from "@/components/atoms/Typography";
import {
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorWarning,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";

import type { ProductCardProps } from "./ProductCard.types";

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: ColorBase.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardEmpty: {
    opacity: 0.85,
  },
  cardImageArea: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImageAreaEmpty: {
    opacity: 0.5,
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stockBadgeLow: {
    backgroundColor: ColorWarning.warning500,
  },
  stockBadgeEmpty: {
    backgroundColor: ColorNeutral.neutral400,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonEnabled: {
    backgroundColor: ColorPrimary.primary600,
  },
  addButtonDisabled: {
    backgroundColor: ColorNeutral.neutral200,
  },
});

export const ProductCard = React.memo(function ProductCard({
  name,
  basePrice,
  categoryIcon,
  categoryIconBg,
  categoryIconColor,
  stockStatus,
  onAdd,
  width,
  style,
}: ProductCardProps) {
  const isEmpty = stockStatus === "empty";
  const isLow = stockStatus === "low";

  const cardStyle = useMemo(
    () => [styles.card, { width }, isEmpty && styles.cardEmpty, style],
    [width, isEmpty, style],
  );

  const imageAreaStyle = useMemo(
    () => [
      styles.cardImageArea,
      { backgroundColor: categoryIconBg },
      isEmpty && styles.cardImageAreaEmpty,
    ],
    [categoryIconBg, isEmpty],
  );

  const addButtonStyle = useMemo(
    () => [
      styles.addButton,
      isEmpty ? styles.addButtonDisabled : styles.addButtonEnabled,
    ],
    [isEmpty],
  );

  return (
    <View style={cardStyle}>
      <View style={imageAreaStyle}>
        <Ionicons name={categoryIcon} size={42} color={categoryIconColor} />

        {isLow && (
          <View style={[styles.stockBadge, styles.stockBadgeLow]}>
            <TextCaption fontWeight="700" color={ColorBase.white} fontSize={11}>
              Stok Tipis
            </TextCaption>
          </View>
        )}

        {isEmpty && (
          <View style={[styles.stockBadge, styles.stockBadgeEmpty]}>
            <TextCaption fontWeight="700" color={ColorBase.white} fontSize={11}>
              Habis
            </TextCaption>
          </View>
        )}
      </View>

      <YStack padding={12} gap={8}>
        <TextBodyLg
          fontWeight="700"
          numberOfLines={2}
          lineHeight={20}
          color={isEmpty ? "$colorTertiary" : "$color"}
        >
          {name}
        </TextBodyLg>

        <XStack alignItems="center" justifyContent="space-between">
          <TextBodySm
            fontWeight="700"
            color={isEmpty ? "$colorTertiary" : "$primary"}
          >
            {formatPrice(basePrice)}
          </TextBodySm>

          <Pressable
            onPress={() => !isEmpty && onAdd()}
            disabled={isEmpty}
            style={({ pressed }) => [
              addButtonStyle,
              !isEmpty && pressed && { opacity: 0.72 },
            ]}
          >
            <Ionicons
              name="add"
              size={20}
              color={isEmpty ? ColorNeutral.neutral400 : ColorBase.white}
            />
          </Pressable>
        </XStack>
      </YStack>
    </View>
  );
});
