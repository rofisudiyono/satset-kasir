import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
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
  ColorSurface,
  ColorWarning,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";

import type { ProductCardProps } from "./ProductCard.types";

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ColorSurface.border,
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardEmpty: {
    opacity: 0.85,
  },
  cardInactive: {
    opacity: 0.72,
  },
  cardImageArea: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  menuImage: {
    width: "100%",
    height: "100%",
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
  stockBadgeInactive: {
    backgroundColor: ColorNeutral.neutral700,
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
  imageUrl,
  basePrice,
  categoryIcon,
  categoryIconBg,
  categoryIconColor,
  stockStatus,
  availabilityReason,
  onAdd,
  width,
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
    () => [styles.card, { width }, isEmpty && styles.cardEmpty, isInactive && styles.cardInactive, style],
    [width, isEmpty, isInactive, style],
  );

  const imageAreaStyle = useMemo(
    () => [
      styles.cardImageArea,
      { backgroundColor: categoryIconBg },
      isDisabled && styles.cardImageAreaEmpty,
    ],
    [categoryIconBg, isDisabled],
  );

  const addButtonStyle = useMemo(
    () => [
      styles.addButton,
      isDisabled ? styles.addButtonDisabled : styles.addButtonEnabled,
    ],
    [isDisabled],
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
          <Ionicons name={categoryIcon} size={42} color={categoryIconColor} />
        )}

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
              {availabilityReason === "NO_RECIPE" ? "Belum Ada Resep" : "Habis"}
            </TextCaption>
          </View>
        )}

        {isInactive && (
          <View style={[styles.stockBadge, styles.stockBadgeInactive]}>
            <TextCaption fontWeight="700" color={ColorBase.white} fontSize={11}>
              {availabilityReason === "NO_RECIPE" ? "Belum Ada Resep" : "Tidak Aktif"}
            </TextCaption>
          </View>
        )}
      </View>

      <YStack padding={12} gap={8}>
        <TextBodyLg
          fontWeight="700"
          numberOfLines={2}
          lineHeight={20}
          color={isDisabled ? "$colorTertiary" : "$color"}
        >
          {name}
        </TextBodyLg>

        <XStack alignItems="center" justifyContent="space-between">
          <TextBodySm
            fontWeight="700"
            color={isDisabled ? "$colorTertiary" : "$primary"}
          >
            {formatPrice(basePrice)}
          </TextBodySm>

          <Pressable
            onPress={() => !isDisabled && onAdd()}
            disabled={isDisabled}
            style={({ pressed }) => [
              addButtonStyle,
              !isDisabled && pressed && { opacity: 0.72 },
            ]}
          >
            <Ionicons
              name="add"
              size={20}
              color={isDisabled ? ColorNeutral.neutral400 : ColorBase.white}
            />
          </Pressable>
        </XStack>
      </YStack>
    </View>
  );
});
