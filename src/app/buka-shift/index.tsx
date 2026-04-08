import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, XStack, YStack } from "tamagui";

import {
  AppButton,
  BottomBar,
  NumpadGrid,
  PageHeader,
  TextBodySm,
  TextCaption,
  TextH1,
  TextH3,
} from "@/components";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import {
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorWarning,
} from "@/themes/Colors";
import { formatPrice } from "@/utils";
import type { ShiftSlot } from "@/types";

const PRESET_AMOUNTS = [200_000, 500_000, 1_000_000];
const SHIFT_SLOTS: { id: ShiftSlot; label: string; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { id: "PAGI", label: "Pagi", icon: "sunny-outline" },
    { id: "SIANG", label: "Siang", icon: "partly-sunny-outline" },
    { id: "MALAM", label: "Malam", icon: "moon-outline" },
  ];

export default function BukaShiftPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("500000");
  const [note, setNote] = useState("");
  const [slot, setSlot] = useState<ShiftSlot>("PAGI");
  const [, setIsShiftStarted] = useAtom(isShiftStartedAtom);
  const [, setShiftData] = useAtom(shiftDataAtom);

  const now = new Date();
  const currentDateTime =
    now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " • " +
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB";

  const amount = Number(inputValue);

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

  function handlePreset(value: number) {
    setInputValue(String(value));
  }

  function handleMulaiShift() {
    const openedAt = Date.now();
    const startTime =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    setShiftData({
      shiftId: `shift_${openedAt}`,
      openedAt,
      slot,
      openingCash: amount,
      startTime,
      cashierName: "Budi Santoso",
      note,
    });
    setIsShiftStarted(true);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Buka Shift" showBack onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack flex={1} paddingHorizontal={16} paddingTop={8} gap="$4">
          {/* ── Welcome ── */}
          <YStack alignItems="center" gap="$3">
            <YStack
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor={ColorWarning.warning100}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name="sunny-outline"
                size={32}
                color={ColorWarning.warning600}
              />
            </YStack>
            <YStack alignItems="center" gap={4}>
              <TextH1 fontWeight="800">Selamat Datang!</TextH1>
              <TextH3 fontWeight="700" color={ColorPrimary.primary600}>
                Budi Santoso
              </TextH3>
              <TextBodySm color={ColorNeutral.neutral500}>
                Toko Makmur
              </TextBodySm>
              <TextBodySm color={ColorNeutral.neutral400}>
                {currentDateTime}
              </TextBodySm>
            </YStack>
          </YStack>

          {/* ── Modal Awal Kas ── */}
          <YStack
            backgroundColor={ColorBase.white}
            borderRadius={16}
            padding="$4"
            gap="$3"
            borderWidth={1}
            borderColor={ColorNeutral.neutral200}
          >
            {/* Shift slot */}
            <YStack gap={8}>
              <TextH3 fontWeight="700">Slot Shift</TextH3>
              <TextBodySm color={ColorNeutral.neutral500}>
                Pilih slot shift untuk pencatatan laporan
              </TextBodySm>
              <XStack gap="$2" flexWrap="wrap">
                {SHIFT_SLOTS.map((s) => {
                  const active = slot === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSlot(s.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.slotChip,
                        active && styles.slotChipActive,
                      ]}
                    >
                      <Ionicons
                        name={s.icon}
                        size={16}
                        color={
                          active ? ColorBase.white : ColorNeutral.neutral600
                        }
                        style={{ marginRight: 6 }}
                      />
                      <TextBodySm
                        fontWeight="700"
                        color={active ? ColorBase.white : ColorNeutral.neutral700}
                      >
                        {s.label}
                      </TextBodySm>
                    </TouchableOpacity>
                  );
                })}
              </XStack>
            </YStack>

            <View style={styles.sectionDivider} />

            <YStack gap={4}>
              <TextH3 fontWeight="700">Modal Awal Kas</TextH3>
              <TextBodySm color={ColorNeutral.neutral500}>
                Masukkan jumlah uang di laci kasir
              </TextBodySm>
            </YStack>

            {/* Amount display */}
            <YStack alignItems="center" paddingVertical="$2">
              <TextH1 fontWeight="800" color={ColorPrimary.primary600}>
                {formatPrice(amount)}
              </TextH1>
            </YStack>

            {/* Preset chips */}
            <XStack flexWrap="wrap" gap="$2">
              {PRESET_AMOUNTS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handlePreset(preset)}
                  activeOpacity={0.7}
                  style={[
                    styles.presetChip,
                    amount === preset && styles.presetChipActive,
                  ]}
                >
                  <TextBodySm
                    fontWeight="600"
                    color={
                      amount === preset
                        ? ColorBase.white
                        : ColorNeutral.neutral700
                    }
                  >
                    {formatPrice(preset)}
                  </TextBodySm>
                </TouchableOpacity>
              ))}
            </XStack>

            {/* Note input */}
            <TextInput
              style={styles.noteInput}
              placeholder="Catatan shift... (opsional)"
              placeholderTextColor={ColorNeutral.neutral400}
              value={note}
              onChangeText={setNote}
              multiline={false}
            />
          </YStack>

          {/* ── Numpad ── */}
          <NumpadGrid onPress={handleNumpad} />
        </YStack>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <BottomBar>
        <AppButton
          variant="success"
          size="lg"
          fullWidth
          title="Mulai Shift Sekarang"
          icon={
            <Ionicons name="sunny-outline" size={18} color={ColorBase.white} />
          }
          onPress={handleMulaiShift}
        />
        <TextCaption
          color={ColorNeutral.neutral400}
          textAlign="center"
          marginTop={6}
        >
          Shift akan tercatat otomatis
        </TextCaption>
      </BottomBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorBase.white,
  },
  presetChipActive: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: ColorPrimary.primary600,
  },
  noteInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorBase.white,
    paddingHorizontal: 14,
    fontFamily: "System",
    fontSize: 14,
    color: ColorNeutral.neutral800,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorBase.white,
  },
  slotChipActive: {
    backgroundColor: ColorPrimary.primary600,
    borderColor: ColorPrimary.primary600,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
});
