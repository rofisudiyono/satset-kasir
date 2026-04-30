/**
 * ProfileCard — User profile card with blue background
 *
 * Used in home page and settings page
 * Displays user avatar, name, role, and status
 */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
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
    <YStack borderRadius={16} overflow="hidden">
      <LinearGradient
        colors={["#1A9168", "#0E7A58", BrandColors.deep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
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

const styles = StyleSheet.create({
  gradient: {
    ...({ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as object),
  },
});
