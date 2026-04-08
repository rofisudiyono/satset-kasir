import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  NumpadGrid,
  PageHeader,
  SuggestionChip,
  TextBody,
  TextBodySm,
  TextCaption,
  TextH1,
} from "@/components";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import {
  ColorBase,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import { formatPrice, getCashSuggestions } from "@/utils";

export default function PembayaranTunaiPage() {
  const router = useRouter();
  const { useTwoPaneLayout } = useDeviceLayout();
  const params = useLocalSearchParams<{
    total: string;
    totalItems: string;
    discount: string;
    items: string;
    customerLabel: string;
  }>();

  const total = Number(params.total ?? 88800);
  const totalItems = Number(params.totalItems ?? 0);
  const discount = Number(params.discount ?? 0);
  const items = params.items ?? "";
  const customerLabel = params.customerLabel ?? "";

  const [inputValue, setInputValue] = useState("0");

  const receivedAmount = Number(inputValue);
  const change = receivedAmount - total;
  const isEnough = receivedAmount >= total;

  const suggestions = getCashSuggestions(total);

  function handleNumpad(key: string) {
    setInputValue((prev) => {
      if (key === "DEL") {
        const next = prev.slice(0, -1);
        return next.length === 0 ? "0" : next;
      }
      if (key === "000") {
        if (prev === "0") return prev;
        if (prev.length >= 10) return prev;
        return prev + "000";
      }
      if (prev === "0") return key;
      if (prev.length >= 12) return prev;
      return prev + key;
    });
  }

  function handleSuggestion(amount: number) {
    setInputValue(String(amount));
  }

  function handleConfirm() {
    router.push({
      pathname: "/pembayaran-sukses",
      params: {
        total: String(total),
        totalItems: String(totalItems),
        discount: String(discount),
        method: "Tunai",
        methodId: "tunai",
        received: String(receivedAmount),
        change: String(change > 0 ? change : 0),
        items,
        customerLabel,
      },
    });
  }

  // ── Shared: info section ───────────────────────────────────────────────────
  const infoSection = (
    <YStack gap={16}>
      {/* Total display */}
      <YStack alignItems="center" gap={2}>
        <TextBodySm
          color={ColorNeutral.neutral500}
          fontWeight="600"
          letterSpacing={0.5}
        >
          TOTAL YANG HARUS DIBAYAR
        </TextBodySm>
        <TextH1 fontWeight="700" color={ColorPrimary.primary600} fontSize={26}>
          {formatPrice(total)}
        </TextH1>
      </YStack>

      {/* Received amount display */}
      <YStack alignItems="center">
        <TextBodySm color={ColorNeutral.neutral500} fontWeight="500">
          Uang Diterima
        </TextBodySm>
        <TextH1 fontWeight="800" marginTop={2} color={ColorNeutral.neutral900}>
          {formatPrice(receivedAmount)}
        </TextH1>
        <View style={styles.inputUnderline} />
      </YStack>

      {/* Suggestion chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {suggestions.map((amount) => (
          <SuggestionChip
            key={amount}
            amount={amount}
            selected={receivedAmount === amount}
            onPress={() => handleSuggestion(amount)}
          />
        ))}
      </ScrollView>

      {/* Info card */}
      <View style={styles.infoCard}>
        <XStack justifyContent="space-between" alignItems="center">
          <TextBodySm color={ColorNeutral.neutral700}>Total Tagihan</TextBodySm>
          <TextBodySm fontWeight="600" color={ColorNeutral.neutral700}>
            {formatPrice(total)}
          </TextBodySm>
        </XStack>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginTop={6}
        >
          <TextBodySm color={ColorNeutral.neutral700}>Uang Diterima</TextBodySm>
          <TextBodySm fontWeight="600" color={ColorNeutral.neutral700}>
            {formatPrice(receivedAmount)}
          </TextBodySm>
        </XStack>
        <View style={styles.divider} />
        <XStack justifyContent="space-between" alignItems="center">
          <TextBody fontWeight="700" color={ColorGreen.green600}>
            Kembalian
          </TextBody>
          <XStack alignItems="center" gap={6}>
            {isEnough && (
              <View style={styles.checkBadge}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={ColorGreen.green600}
                />
              </View>
            )}
            <TextBody fontWeight="800" color={ColorGreen.green600}>
              {isEnough ? formatPrice(change) : "Rp 0"}
            </TextBody>
          </XStack>
        </XStack>
      </View>
    </YStack>
  );

  // ── Shared: bottom action ──────────────────────────────────────────────────
  const bottomAction = (
    <>
      <AppButton
        title="Konfirmasi Pembayaran"
        variant="success"
        onPress={handleConfirm}
        disabled={!isEnough}
      />
      <TextCaption
        color={ColorNeutral.neutral500}
        textAlign="center"
        marginTop={6}
      >
        Kembalian akan otomatis tercatat
      </TextCaption>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.batalBtn}
        activeOpacity={0.7}
      >
        <TextBody fontWeight="700" color={ColorNeutral.neutral700} letterSpacing={1}>
          BATAL
        </TextBody>
      </TouchableOpacity>
    </>
  );

  // ── Tablet: 2-column layout ────────────────────────────────────────────────
  if (useTwoPaneLayout) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Pembayaran Tunai"
          showBack
          onBack={() => router.back()}
        />

        <XStack flex={1}>
          {/* Left: info */}
          <ScrollView
            style={styles.tabletInfoPanel}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
          >
            {infoSection}
          </ScrollView>

          {/* Divider */}
          <View style={styles.tabletDivider} />

          {/* Right: numpad + action */}
          <View style={styles.tabletNumpadPanel}>
            <View style={styles.tabletNumpadContent}>
              <NumpadGrid onPress={handleNumpad} />
            </View>
            <View style={styles.bottomBar}>{bottomAction}</View>
          </View>
        </XStack>
      </SafeAreaView>
    );
  }

  // ── Phone layout ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Pembayaran Tunai"
        showBack
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {infoSection}
        <NumpadGrid onPress={handleNumpad} />
      </View>

      <View style={styles.bottomBar}>{bottomAction}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  inputUnderline: {
    width: 220,
    height: 2,
    backgroundColor: ColorPrimary.primary200,
    marginTop: 6,
  },
  chipsContainer: {
    paddingHorizontal: 4,
    gap: 10,
    flexDirection: "row",
  },
  infoCard: {
    backgroundColor: ColorGreen.green75,
    borderRadius: 16,
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: ColorGreen.green150,
    marginVertical: 8,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ColorGreen.green125,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ColorGreen.green600,
  },
  bottomBar: {
    backgroundColor: ColorBase.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ColorNeutral.neutral200,
  },
  batalBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  // Tablet styles
  tabletNumpadPanel: {
    flex: 0.5,
    backgroundColor: ColorBase.bgScreen,
  },
  tabletNumpadContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  tabletInfoPanel: {
    flex: 0.5,
    backgroundColor: ColorBase.white,
  },
});
