import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { XStack, YStack } from "tamagui";

import { ColorBase } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

import { TextBodySm, TextH3 } from "@/components/atoms/Typography";

interface ProfileCardProps {
  name: string;
  role: string;
  status?: string;
  showNotifications?: boolean;
}

export function ProfileCard({
  name,
  role,
  status = "Online",
  showNotifications = false,
}: ProfileCardProps) {
  return (
    <YStack
      borderRadius={16}
      overflow="hidden"
      backgroundColor={BrandColors.buttonSolid}
    >
      <XStack alignItems="center" gap="$3" padding="$4">
        <YStack
          width={56}
          height={56}
          borderRadius={28}
          backgroundColor="rgba(240,253,232,0.2)"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          borderWidth={1}
          borderColor="rgba(218,247,166,0.3)"
        >
          <Ionicons name="person" size={28} color={ColorBase.white} />
        </YStack>
        <YStack flex={1} gap={2}>
          <TextH3 fontWeight="700" color={ColorBase.white}>
            {name}
          </TextH3>
          <TextBodySm color="rgba(240,253,232,0.82)">{role}</TextBodySm>
        </YStack>
        <YStack
          backgroundColor="rgba(240,253,232,0.18)"
          borderRadius={20}
          paddingHorizontal={12}
          paddingVertical={5}
          borderWidth={1}
          borderColor="rgba(218,247,166,0.3)"
        >
          <TextBodySm fontWeight="700" color={ColorBase.white}>
            {status}
          </TextBodySm>
        </YStack>
      </XStack>
    </YStack>
  );
}
