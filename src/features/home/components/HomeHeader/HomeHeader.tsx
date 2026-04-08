import { Ionicons } from "@expo/vector-icons";
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
import { ColorPrimary } from "@/themes/Colors";

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
    <XStack
      paddingHorizontal="$4"
      paddingTop="$3"
      paddingBottom="$2"
      alignItems="center"
      gap="$3"
      flexWrap="wrap"
    >
      <YStack
        width={48}
        height={48}
        borderRadius={24}
        backgroundColor={ColorPrimary.primary100}
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Ionicons name="person" size={26} color={ColorPrimary.primary600} />
      </YStack>
      <YStack flex={1} minWidth={160}>
        <TextH3 fontWeight="700">Budi Santoso</TextH3>
        <TextBodySm color="$colorSecondary">Toko Makmur</TextBodySm>
      </YStack>
      <View style={{ marginLeft: "auto" }}>
        <YStack alignItems="flex-end" gap={2}>
          <TextCaption color="$colorSecondary">{formatDate(now)}</TextCaption>
          <TextBodyLg fontWeight="700">{formatTime(now)}</TextBodyLg>
        </YStack>
      </View>
      <View>
        <IconButton iconName="notifications-outline" size={40} />
      </View>
    </XStack>
  );
}
