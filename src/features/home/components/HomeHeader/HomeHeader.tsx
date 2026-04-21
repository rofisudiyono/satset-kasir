import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { XStack, YStack } from "tamagui";

import {
  IconButton,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import { ColorBase, ColorPrimary } from "@/themes/Colors";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function formatDate(date: Date) {
  const day = DAY_NAMES[date.getDay()];
  const d = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day}, ${d} ${month} ${year}`;
}

function formatTime(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m} WIB`;
}

export function HomeHeader() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <LinearGradient
      colors={[ColorPrimary.primary700, ColorPrimary.primary900]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
    >
      <XStack
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$3"
        alignItems="center"
        gap="$3"
        flexWrap="wrap"
      >
      <YStack
        width={48}
        height={48}
        borderRadius={24}
        backgroundColor="rgba(255,255,255,0.14)"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Image
          source={require("../../../../../assets/images/satset_1024.png")}
          style={{ width: 48, height: 48 }}
          contentFit="cover"
        />
      </YStack>
      <YStack flex={1} minWidth={160}>
        <TextH3 fontWeight="800" color={ColorBase.white}>
          Budi Santoso
        </TextH3>
        <TextBodySm color="rgba(255,255,255,0.78)">Toko Makmur</TextBodySm>
      </YStack>
      <View style={{ marginLeft: "auto" }}>
        <YStack alignItems="flex-end" gap={2}>
          <TextCaption color="rgba(255,255,255,0.72)">{formatDate(now)}</TextCaption>
          <TextBodyLg fontWeight="800" color={ColorBase.white}>
            {formatTime(now)}
          </TextBodyLg>
        </YStack>
      </View>
      <View>
        <IconButton
          iconName="notifications-outline"
          size={40}
          bg="rgba(255,255,255,0.16)"
          iconColor={ColorBase.white}
        />
      </View>
      </XStack>
    </LinearGradient>
  );
}
