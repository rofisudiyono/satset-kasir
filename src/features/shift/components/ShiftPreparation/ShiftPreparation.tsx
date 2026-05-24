import React from "react";
import { View } from "react-native";
import { XStack, YStack } from "tamagui";

import { ShadowCard } from "@/components/atoms/ShadowCard";
import { TextBodyLg, TextBodySm, TextH3 } from "@/components/atoms/Typography";
import {
  ColorGreen,
  ColorNeutral,
  ColorSuccess,
  ColorWarning,
} from "@/themes/Colors";

const preparationItems = [
  {
    title: "Perangkat kasir",
    subtitle: "Scanner barcode dan printer struk terhubung",
    badge: { label: "Siap", type: "green" as const },
  },
  {
    title: "Modal awal kas",
    subtitle: "Tambahkan nominal awal sebelum mulai shift",
    badge: { label: "Isi dulu", type: "orange" as const },
  },
  {
    title: "Cek inventori cepat",
    subtitle: "3 produk stok hampir habis sebelum toko buka",
    badge: { label: "Periksa", type: "orange" as const },
  },
];

function PrepBadge({
  label,
  type,
}: {
  label: string;
  type: "green" | "orange";
}) {
  const bg = type === "green" ? ColorGreen.green100 : ColorWarning.warning100;
  const color =
    type === "green" ? ColorSuccess.success600 : ColorWarning.warning700;
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <TextBodySm fontWeight="600" color={color}>
        {label}
      </TextBodySm>
    </View>
  );
}

export function ShiftPreparation() {
  return (
    <YStack gap="$2">
      <TextH3 fontWeight="700">Persiapan Shift</TextH3>
      <ShadowCard overflow="hidden">
        {preparationItems.map((item, idx) => (
          <React.Fragment key={item.title}>
            {idx > 0 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: ColorNeutral.neutral200,
                  marginHorizontal: 16,
                }}
              />
            )}
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="flex-start"
              gap="$3"
            >
              <YStack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={ColorNeutral.neutral100}
              />
              <YStack flex={1} minWidth={0} gap={2}>
                <TextBodyLg fontWeight="600">{item.title}</TextBodyLg>
                <TextBodySm color="$colorSecondary">{item.subtitle}</TextBodySm>
              </YStack>
              <PrepBadge label={item.badge.label} type={item.badge.type} />
            </XStack>
          </React.Fragment>
        ))}
      </ShadowCard>
    </YStack>
  );
}
