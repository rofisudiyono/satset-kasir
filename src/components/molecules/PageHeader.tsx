import { BrandColors } from "@/themes/brand";
import React from "react";
import { StyleSheet, View } from "react-native";
import { XStack, YStack } from "tamagui";

import { IconButton } from "../atoms/IconButton";
import { TextBodySm, TextH2, TextH3 } from "../atoms/Typography";

export interface PageHeaderProps {
  title: string;
  /** Secondary line shown below title when provided */
  subtitle?: string;
  /** Show a back arrow on the left. Default false */
  showBack?: boolean;
  onBack?: () => void;
  /** Slot for right-side actions (buttons / icon buttons) */
  actions?: React.ReactNode;
  /** Use TextH2 for title instead of TextH3. Default false */
  largeTitle?: boolean;
  maxWidth?: number | string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
  largeTitle = false,
  maxWidth = "100%",
}: PageHeaderProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.accent} />
      <XStack
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom="$3"
        alignItems="center"
        gap="$3"
        flexWrap="wrap"
        style={[styles.header, { maxWidth }]}
      >
        {showBack && <IconButton iconName="arrow-back" onPress={onBack} />}

        {subtitle ? (
          <YStack flex={1} gap={2} minWidth={220}>
            {largeTitle ? (
              <TextH2 fontWeight="700">{title}</TextH2>
            ) : (
              <TextH3 fontWeight="700">{title}</TextH3>
            )}
            <TextBodySm color="$colorSecondary">{subtitle}</TextBodySm>
          </YStack>
        ) : (
          <>
            {largeTitle ? (
              <TextH2 fontWeight="700" flex={1}>
                {title}
              </TextH2>
            ) : (
              <TextH3
                fontWeight="700"
                flex={1}
                textAlign={showBack ? "center" : "left"}
              >
                {title}
              </TextH3>
            )}
          </>
        )}

        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: BrandColors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    marginBottom: 0,
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: BrandColors.green,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  header: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 6,
  },
  actions: {
    marginLeft: "auto",
  },
});
