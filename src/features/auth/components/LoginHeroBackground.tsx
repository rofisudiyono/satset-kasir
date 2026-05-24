import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import {
  loginHeroAccentLine,
  loginHeroBottomFade,
  loginHeroDecorRing,
  loginHeroLinearBase,
  loginHeroRadialAmber,
  loginHeroRadialMint,
} from "@/features/auth/login-background";
import { LoginColors } from "@/features/auth/login-styles";

/**
 * Hero panel background — 1:1 conversion from pos-dashboard LoginLayout.tsx:
 *
 * radial-gradient(circle at 24% 18%, rgba(16,185,129,0.28), transparent 24rem),
 * radial-gradient(circle at 80% 70%, rgba(245,158,11,0.16), transparent 26rem),
 * linear-gradient(145deg, #0b1f17 0%, #0f3b2e 54%, #071511 100%)
 */
export function LoginHeroBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[...loginHeroLinearBase.colors]}
        locations={[...loginHeroLinearBase.locations]}
        start={loginHeroLinearBase.start}
        end={loginHeroLinearBase.end}
        style={StyleSheet.absoluteFill}
      />

      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="loginMintGlow"
            cx={loginHeroRadialMint.cx}
            cy={loginHeroRadialMint.cy}
            rx="42%"
            ry="38%"
            gradientUnits="objectBoundingBox"
          >
            <Stop
              offset="0%"
              stopColor={loginHeroRadialMint.color}
              stopOpacity={loginHeroRadialMint.opacity}
            />
            <Stop
              offset="100%"
              stopColor={loginHeroRadialMint.color}
              stopOpacity={0}
            />
          </RadialGradient>
          <RadialGradient
            id="loginAmberGlow"
            cx={loginHeroRadialAmber.cx}
            cy={loginHeroRadialAmber.cy}
            rx="44%"
            ry="40%"
            gradientUnits="objectBoundingBox"
          >
            <Stop
              offset="0%"
              stopColor={loginHeroRadialAmber.color}
              stopOpacity={loginHeroRadialAmber.opacity}
            />
            <Stop
              offset="100%"
              stopColor={loginHeroRadialAmber.color}
              stopOpacity={0}
            />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#loginMintGlow)" />
        <Rect width="100%" height="100%" fill="url(#loginAmberGlow)" />
      </Svg>

      <LinearGradient
        colors={[...loginHeroBottomFade.colors]}
        locations={[...loginHeroBottomFade.locations]}
        style={styles.bottomFade}
      />

      <LinearGradient
        colors={[...loginHeroAccentLine.colors]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.accentLine}
      />

      <View style={styles.decorRing} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  accentLine: {
    position: "absolute",
    top: loginHeroAccentLine.top,
    left: loginHeroAccentLine.left,
    width: loginHeroAccentLine.width,
    height: 1,
  },
  decorRing: {
    position: "absolute",
    bottom: loginHeroDecorRing.bottom,
    right: loginHeroDecorRing.right,
    width: loginHeroDecorRing.size,
    height: loginHeroDecorRing.size,
    borderRadius: loginHeroDecorRing.size / 2,
    borderWidth: 1,
    borderColor: loginHeroDecorRing.borderColor,
  },
});
