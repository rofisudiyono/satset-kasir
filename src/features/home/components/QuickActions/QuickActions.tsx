import React from "react";
import { XStack } from "tamagui";

import { ActionCardButton } from "@/components/atoms/ActionCardButton";
import { ColorAccentPurple, ColorWarning } from "@/themes/Colors";

import { QuickActionsProps } from "./QuickActions.types";

export function QuickActions({ isShiftStarted }: QuickActionsProps) {
  const actions = [
    {
      iconName: "pause-circle-outline" as const,
      label: "Tahan Order",
      subtitle: isShiftStarted ? undefined : "Menunggu shift",
      iconBg: ColorWarning.warning50,
      iconColor: ColorWarning.warning600,
    },
    {
      iconName: "time-outline" as const,
      label: "Riwayat",
      subtitle: isShiftStarted ? undefined : "Lihat transaksi lalu",
      iconBg: ColorAccentPurple.purple50,
      iconColor: ColorAccentPurple.purple600,
    },
  ];

  return (
    <XStack gap="$3">
      {actions.map((item) => (
        <ActionCardButton
          key={item.label}
          label={item.label}
          subtitle={item.subtitle}
          iconName={item.iconName}
          iconBg={item.iconBg}
          iconColor={item.iconColor}
        />
      ))}
    </XStack>
  );
}
