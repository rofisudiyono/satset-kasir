/**
 * SettingRow — Reusable setting item row component
 *
 * Used in pengaturan (settings) page
 * Displays icon, text, badge, value, toggle, or chevron
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, TouchableOpacity } from "react-native";
import { XStack, YStack } from "tamagui";

import { TextBodyLg, TextBodySm } from "@/components/atoms/Typography";
import { ColorGreen, ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import type { SettingRowProps } from "@/types";

export function SettingRow({
  iconName,
  iconBg,
  iconColor = ColorNeutral.neutral700,
  title,
  subtitle,
  badge,
  badgeColor,
  badgeBg,
  value,
  hasToggle,
  toggleValue,
  onToggle,
  showChevron = true,
  onPress,
}: SettingRowProps) {
  return (
    <TouchableOpacity disabled={hasToggle} onPress={onPress} activeOpacity={0.76}>
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$3"
        alignItems="center"
        gap="$3"
      >
        <YStack
          width={40}
          height={40}
          borderRadius={14}
          backgroundColor={iconBg}
          alignItems="center"
          justifyContent="center"
          style={styles.iconShell}
        >
          <Ionicons name={iconName} size={20} color={iconColor} />
        </YStack>
        <YStack flex={1} gap={2}>
          <TextBodyLg fontWeight="600">{title}</TextBodyLg>
          <TextBodySm color="$colorSecondary" numberOfLines={1}>
            {subtitle}
          </TextBodySm>
        </YStack>
        {badge && (
          <YStack
            backgroundColor={badgeBg ?? ColorGreen.green100}
            borderRadius={20}
            paddingHorizontal={10}
            paddingVertical={4}
          >
            <TextBodySm
              fontWeight="700"
              color={badgeColor ?? ColorGreen.green600}
            >
              {badge}
            </TextBodySm>
          </YStack>
        )}
        {value && <TextBodySm color="$colorSecondary">{value}</TextBodySm>}
        {hasToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{
              true: BrandColors.green,
              false: ColorNeutral.neutral300,
            }}
          />
        )}
        {showChevron && !hasToggle && (
          <YStack
            width={28}
            height={28}
            borderRadius={14}
            alignItems="center"
            justifyContent="center"
            backgroundColor={ColorNeutral.neutral50}
          >
            <Ionicons
              name="chevron-forward"
              size={15}
              color={ColorNeutral.neutral500}
            />
          </YStack>
        )}
      </XStack>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconShell: {
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
  },
});
