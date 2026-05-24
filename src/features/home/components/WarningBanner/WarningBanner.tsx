import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { XStack } from "tamagui";

import { TextBodySm } from "@/components/atoms/Typography";
import { ColorAccentOrange } from "@/themes/Colors";

import { WarningBannerProps } from "./WarningBanner.types";

export function WarningBanner({
  isShiftStarted,
  onViewInventory,
}: WarningBannerProps) {
  if (isShiftStarted) {
    return (
      <XStack
        backgroundColor={ColorAccentOrange.orange100}
        borderRadius={12}
        padding="$3"
        alignItems="center"
        gap="$2"
      >
        <Ionicons
          name="warning-outline"
          size={18}
          color={ColorAccentOrange.orange600}
        />
      <TextBodySm
        fontWeight="500"
        color={ColorAccentOrange.orange700}
        flex={1}
        minWidth={0}
      >
        3 produk stok hampir habis
      </TextBodySm>
        <TouchableOpacity onPress={onViewInventory} activeOpacity={0.7}>
          <TextBodySm fontWeight="700" color={ColorAccentOrange.orange600}>
            Lihat
          </TextBodySm>
        </TouchableOpacity>
      </XStack>
    );
  }

  return (
    <XStack
      backgroundColor={ColorAccentOrange.orange100}
      borderRadius={12}
      padding="$3"
      alignItems="flex-start"
      gap="$2"
    >
      <Ionicons
        name="warning-outline"
        size={18}
        color={ColorAccentOrange.orange600}
        style={{ marginTop: 1 }}
      />
      <TextBodySm
        fontWeight="500"
        color={ColorAccentOrange.orange700}
        flex={1}
        minWidth={0}
      >
        Pastikan printer, scanner, dan koneksi internet sudah siap.
      </TextBodySm>
    </XStack>
  );
}
