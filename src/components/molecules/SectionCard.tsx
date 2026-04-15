/**
 * SectionCard — Labelled section wrapper with shadow card
 *
 * Previously defined as a local component inside pengaturan.tsx.
 * Extracted so it can be reused across any settings-style page.
 */
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { YStack } from "tamagui";

import { ShadowCard } from "../atoms/ShadowCard";
import { TextBodyLg } from "../atoms/Typography";

export interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionCard({ title, children, style }: SectionCardProps) {
  return (
    <YStack gap="$2" style={style}>
      <TextBodyLg fontWeight="700">{title}</TextBodyLg>
      <ShadowCard overflow="hidden">{children}</ShadowCard>
    </YStack>
  );
}
