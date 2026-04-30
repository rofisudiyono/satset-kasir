import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { XStack, YStack } from "tamagui";

import {
  TextBodyLg,
  TextBodySm,
  TextCaption,
} from "@/components/atoms/Typography";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";

import type { ProductCardProps } from "./ProductCard.types";

const COMPACT_IMG_H = 92;
const DEFAULT_IMG_H = 110;

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: BrandColors.deep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardCompact: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  cardEmpty: {
    opacity: 0.8,
  },
  cardInactive: {
    opacity: 0.68,
  },
  cardImageArea: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  menuImage: {
    width: "100%",
    height: "100%",
  },
  cardImageAreaEmpty: {
    opacity: 0.45,
  },
  stockBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockBadgeLow: {
    backgroundColor: "rgba(180, 83, 9, 0.88)",
  },
  stockBadgeEmpty: {
    backgroundColor: "rgba(75, 85, 99, 0.82)",
  },
  stockBadgeInactive: {
    backgroundColor: "rgba(55, 65, 81, 0.78)",
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonEnabled: {
    backgroundColor: BrandColors.buttonSolid,
    borderRadius: 17,
    width: 34,
    height: 34,
  },
  addButtonCompact: {
    backgroundColor: BrandColors.tintStrong,
    borderWidth: 0,
    borderRadius: 999,
    width: 32,
    height: 32,
  },
  addButtonDisabled: {
    backgroundColor: ColorNeutral.neutral200,
    borderRadius: 14,
    width: 30,
    height: 30,
  },
});

export const ProductCard = React.memo(function ProductCard({
  name,
  imageUrl,
  basePrice,
  categoryIcon,
  categoryIconBg,
  categoryIconColor,
  stockStatus,
  availabilityReason,
  onAdd,
  width,
  compact = false,
  style,
}: ProductCardProps) {
  const isEmpty = stockStatus === "empty";
  const isInactive = stockStatus === "inactive";
  const isLow = stockStatus === "low";
  const isDisabled = isEmpty || isInactive;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const cardStyle = useMemo(
    () => [
      styles.card,
      { width },
      compact && styles.cardCompact,
      isEmpty && styles.cardEmpty,
      isInactive && styles.cardInactive,
      style,
    ],
    [width, compact, isEmpty, isInactive, style],
  );

  const imageHeight = compact ? COMPACT_IMG_H : DEFAULT_IMG_H;

  const imageAreaStyle = useMemo(
    () => [
      styles.cardImageArea,
      { backgroundColor: categoryIconBg, height: imageHeight },
      isDisabled && styles.cardImageAreaEmpty,
    ],
    [categoryIconBg, imageHeight, isDisabled],
  );

  const addButtonStyle = useMemo(
    () => [
      styles.addButton,
      isDisabled
        ? styles.addButtonDisabled
        : compact
          ? styles.addButtonCompact
          : styles.addButtonEnabled,
    ],
    [compact, isDisabled],
  );

  const shouldShowImage = Boolean(imageUrl && !imageFailed);

  return (
    <View style={cardStyle}>
      <View style={imageAreaStyle}>
        {shouldShowImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.menuImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Ionicons
            name={categoryIcon}
            size={compact ? 34 : 42}
            color={categoryIconColor}
          />
        )}

        {isLow && (
          <View style={[styles.stockBadge, styles.stockBadgeLow]}>
            <TextCaption
              fontWeight="700"
              color={ColorBase.white}
              fontSize={compact ? 9 : 11}
              lineHeight={compact ? 11 : undefined}
            >
              Stok Tipis
            </TextCaption>
          </View>
        )}

        {isEmpty && (
          <View style={[styles.stockBadge, styles.stockBadgeEmpty]}>
            <TextCaption
              fontWeight="700"
              color={ColorBase.white}
              fontSize={compact ? 9 : 11}
              lineHeight={compact ? 11 : undefined}
            >
              {availabilityReason === "NO_RECIPE" ? "Belum Ada Resep" : "Habis"}
            </TextCaption>
          </View>
        )}

        {isInactive && (
          <View style={[styles.stockBadge, styles.stockBadgeInactive]}>
            <TextCaption
              fontWeight="700"
              color={ColorBase.white}
              fontSize={compact ? 9 : 11}
              lineHeight={compact ? 11 : undefined}
            >
              {availabilityReason === "NO_RECIPE" ? "Belum Ada Resep" : "Tidak Aktif"}
            </TextCaption>
          </View>
        )}
      </View>

      <YStack
        padding={compact ? 10 : 12}
        gap={compact ? 6 : 8}
      >
        <TextBodyLg
          fontWeight="700"
          numberOfLines={compact ? 1 : 2}
          fontSize={compact ? 13 : undefined}
          lineHeight={compact ? 17 : 20}
          color={isDisabled ? "$colorTertiary" : BrandColors.text}
        >
          {name}
        </TextBodyLg>

        <XStack alignItems="center" justifyContent="space-between">
          <TextBodySm
            fontWeight="800"
            fontSize={compact ? 12 : undefined}
            lineHeight={compact ? 15 : undefined}
            color={isDisabled ? "$colorTertiary" : BrandColors.deep}
          >
            {formatPrice(basePrice)}
          </TextBodySm>

          <Pressable
            onPress={() => !isDisabled && onAdd()}
            disabled={isDisabled}
            style={({ pressed }) => [
              addButtonStyle,
              !isDisabled && pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="add"
              size={compact ? 17 : 20}
              color={
                isDisabled
                  ? ColorNeutral.neutral400
                  : compact
                    ? BrandColors.deep
                    : ColorBase.white
              }
            />
          </Pressable>
        </XStack>
      </YStack>
    </View>
  );
});
