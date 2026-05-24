// src/components/atoms/AvatarBadge.tsx
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextBodySm } from "./Typography";

export interface AvatarBadgeProps {
  name: string;
  size?: number;
  bg?: string;
  textColor?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AvatarBadge({
  name,
  size = 36,
  bg = BrandColors.tint,
  textColor = BrandColors.deep,
}: AvatarBadgeProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const fontSize = Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <TextBodySm
        fontWeight="700"
        fontSize={fontSize}
        color={textColor}
        lineHeight={size}
      >
        {initials}
      </TextBodySm>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});
