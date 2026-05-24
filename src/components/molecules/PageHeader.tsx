import React from "react";
import { StyleSheet, View } from "react-native";
import { XStack, YStack } from "tamagui";

import { IconButton } from "../atoms/IconButton";
import { TextBodySm, TextH2, TextH3 } from "../atoms/Typography";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ede9",
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
