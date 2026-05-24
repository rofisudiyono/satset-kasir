import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { LoginHeroBackground } from "@/features/auth/components/LoginHeroBackground";
import { loginLogoShadow } from "@/features/auth/login-background";
import { kasirLoginConfig } from "@/features/auth/login-config";
import { LoginColors } from "@/features/auth/login-styles";

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
            <Text
              fontFamily="PlusJakartaSans_800ExtraBold"
              fontSize={11}
              letterSpacing={1.98}
              color="#d1fae5"
              textTransform="uppercase"
            >
              {heroBadge}
            </Text>
          </View>
          <Text
            fontFamily="PlusJakartaSans_800ExtraBold"
            fontSize={48}
            lineHeight={52}
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
          <XStack gap={12} marginTop={32}>
            {heroTags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text
                  fontFamily="PlusJakartaSans_700Bold"
                  fontSize={14}
                  color="rgba(255, 255, 255, 0.85)"
                >
                  {tag}
                </Text>
              </View>
            ))}
          </XStack>
        </YStack>

        <XStack alignItems="center" gap={16}>
          <Text
            fontFamily="PlusJakartaSans_700Bold"
            fontSize={12}
            letterSpacing={2}
            color="rgba(255, 255, 255, 0.45)"
            textTransform="uppercase"
          >
            Est. 2026
          </Text>
          <View style={styles.footerDot} />
          <Text
            fontFamily="PlusJakartaSans_700Bold"
            fontSize={12}
            letterSpacing={2}
            color="rgba(255, 255, 255, 0.45)"
            textTransform="uppercase"
          >
            Satset Platform
          </Text>
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
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
});
