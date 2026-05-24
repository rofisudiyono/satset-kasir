import React from "react";
import { Image, StyleSheet, Text as RNText, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { LoginHeroBackground } from "@/features/auth/components/LoginHeroBackground";
import { loginLogoShadow } from "@/features/auth/login-background";
import { kasirLoginConfig } from "@/features/auth/login-config";
import { LoginColors, loginStyles } from "@/features/auth/login-styles";

type LoginHeroPanelProps = {
  padding?: number;
};

export function LoginHeroPanel({ padding = 48 }: LoginHeroPanelProps) {
  const { heroBadge, heroTitle, heroDescription, heroTags, brandSubtitle } =
    kasirLoginConfig;

  return (
    <View style={styles.root}>
      <LoginHeroBackground />

      <YStack
        flex={1}
        justifyContent="space-between"
        padding={padding}
        zIndex={1}
      >
        <View>
          <XStack alignItems="center" gap={16}>
            <View style={styles.logoFrame}>
              <Image
                source={require("../../../../assets/images/satset_1024.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <YStack>
              <Text
                fontFamily="PlusJakartaSans_800ExtraBold"
                fontSize={24}
                color={LoginColors.white}
                letterSpacing={-0.5}
              >
                SATSET POS
              </Text>
              <Text
                fontFamily="PlusJakartaSans_600SemiBold"
                fontSize={14}
                color="rgba(209, 250, 229, 0.75)"
                marginTop={4}
              >
                {brandSubtitle}
              </Text>
            </YStack>
          </XStack>
        </View>

        <YStack maxWidth={576} width="100%">
          <View style={styles.badge}>
            <RNText style={loginStyles.heroBadge}>{heroBadge}</RNText>
          </View>
          <Text
            fontFamily="PlusJakartaSans_800ExtraBold"
            fontSize={48}
            lineHeight={58}
            color={LoginColors.white}
            letterSpacing={-1}
            marginTop={20}
          >
            {heroTitle}
          </Text>
          <Text
            fontFamily="PlusJakartaSans_500Medium"
            fontSize={18}
            lineHeight={29}
            color="rgba(236, 253, 245, 0.75)"
            marginTop={24}
          >
            {heroDescription}
          </Text>
          <XStack gap={12} marginTop={32} flexWrap="wrap">
            {heroTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text
                  fontFamily="PlusJakartaSans_700Bold"
                  fontSize={14}
                  lineHeight={20}
                  color="rgba(255, 255, 255, 0.85)"
                >
                  {tag}
                </Text>
              </View>
            ))}
          </XStack>
        </YStack>

        <XStack alignItems="center" gap={16} flexWrap="wrap">
          <RNText style={loginStyles.heroFooter}>Est. 2026</RNText>
          <View style={styles.footerDot} />
          <RNText style={loginStyles.heroFooter}>Satset Platform</RNText>
        </XStack>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: LoginColors.ink100,
    backgroundColor: LoginColors.ink900,
  },
  logoFrame: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: LoginColors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...loginLogoShadow,
  },
  logo: {
    width: 48,
    height: 48,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagChip: {
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
});
