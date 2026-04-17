import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
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
import { kasirShiftToShiftData } from "@/features/shift/utils/mapShift";
import { useOpenShiftMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import {
  ColorBase,
  ColorNeutral,
  ColorPrimary,
  ColorSuccess,
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
  const { user } = useAuth();
  const { mutateAsync: openShiftApi, isPending: isOpeningShift } = useOpenShiftMutation();
  const [inputValue, setInputValue] = useState("500000");
  const [note, setNote] = useState("");
  const [slot, setSlot] = useState<ShiftSlot>("PAGI");
  const [, setIsShiftStarted] = useAtom(isShiftStartedAtom);
  const [, setShiftData] = useAtom(shiftDataAtom);
  const {
    isTablet,
    contentMaxWidth,
    horizontalPadding,
    sectionGap,
  } = useResponsiveLayout();

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
  const cashierLabel =
    user?.role === "superadmin"
      ? "Super Admin"
      : user?.role
          ?.split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ") ?? "Kasir";
  const branchLabel = user?.branchId ? `Outlet ${user.branchId.slice(0, 6)}` : "Cabang belum diatur";
  const slotLabel = SHIFT_SLOTS.find((item) => item.id === slot)?.label ?? "Pagi";

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

  async function handleMulaiShift() {
    if (!user?.branchId) {
      Alert.alert(
        "Cabang belum diatur",
        "Akun Anda belum ditetapkan ke cabang. Hubungi admin outlet untuk mengatur cabang pada profil kasir.",
      );
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Modal tidak valid", "Masukkan modal awal kas yang valid.");
      return;
    }
    try {
      const shift = await openShiftApi({
        branchId: user.branchId,
        shiftSlot: slot,
        openingCash: Math.round(amount),
      });
      setShiftData({
        ...kasirShiftToShiftData(shift),
        note: note.trim() || undefined,
      });
      setIsShiftStarted(true);
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Gagal buka shift", getApiErrorMessage(e));
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Buka Shift"
        showBack
        onBack={() => router.back()}
        maxWidth={contentMaxWidth}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <XStack
          flex={1}
          flexDirection={isTablet ? "row" : "column"}
          gap={isTablet ? "$3" : "$4"}
          style={[
            styles.shell,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <YStack flex={isTablet ? 0.58 : undefined} gap={sectionGap}>
            <YStack
              alignItems="flex-start"
              gap="$3"
              style={[styles.heroCard, isTablet && styles.heroCardTablet]}
            >
              <XStack width="100%" alignItems="flex-start" gap="$3">
                <YStack gap="$3" flex={1} minWidth={0}>
                  <XStack
                    width="100%"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="$2"
                  >
                    <XStack alignItems="center" gap="$2" style={styles.statusChip}>
                      <View style={styles.statusDot} />
                      <TextCaption
                        fontWeight="700"
                        color={ColorSuccess.success700}
                      >
                        Siap mulai shift
                      </TextCaption>
                    </XStack>
                    <XStack alignItems="center" gap={6} style={styles.slotBadge}>
                      <Ionicons
                        name={slot === "MALAM" ? "moon-outline" : "sunny-outline"}
                        size={14}
                        color={ColorPrimary.primary700}
                      />
                      <TextCaption
                        fontWeight="700"
                        color={ColorPrimary.primary700}
                      >
                        {slotLabel}
                      </TextCaption>
                    </XStack>
                  </XStack>

                  <XStack alignItems="center" gap="$3" minWidth={0}>
                    <YStack style={styles.heroIconWrap}>
                      <YStack
                        width={isTablet ? 64 : 72}
                        height={isTablet ? 64 : 72}
                        borderRadius={999}
                        backgroundColor={ColorWarning.warning100}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons
                          name="sunny-outline"
                          size={isTablet ? 26 : 30}
                          color={ColorWarning.warning600}
                        />
                      </YStack>
                    </YStack>

                    <YStack gap={4} flex={1} minWidth={0}>
                      <TextH1 fontWeight="800" numberOfLines={1}>
                        Selamat Datang!
                      </TextH1>
                      <TextH3
                        fontWeight="700"
                        color={ColorPrimary.primary700}
                        numberOfLines={1}
                      >
                        {cashierLabel}
                      </TextH3>
                      <TextBodySm
                        color={ColorNeutral.neutral500}
                        numberOfLines={1}
                      >
                        {branchLabel}
                      </TextBodySm>
                    </YStack>
                  </XStack>
                </YStack>

                {isTablet ? (
                  <YStack
                    minWidth={220}
                    maxWidth={260}
                    gap="$2"
                    style={styles.heroAside}
                  >
                    <TextCaption
                      fontWeight="700"
                      color={ColorNeutral.neutral500}
                    >
                      Jadwal buka hari ini
                    </TextCaption>
                    <XStack alignItems="center" gap={6} style={styles.metaPill}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={ColorNeutral.neutral500}
                      />
                      <TextCaption
                        color={ColorNeutral.neutral500}
                        numberOfLines={1}
                      >
                        {currentDateTime}
                      </TextCaption>
                    </XStack>
                  </YStack>
                ) : null}
              </XStack>

              <XStack width="100%" gap="$2" flexWrap="wrap">
                <YStack style={styles.heroInfoCard}>
                  <TextCaption color={ColorNeutral.neutral500}>Jadwal</TextCaption>
                  <XStack alignItems="center" gap={6} marginTop={6}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={ColorNeutral.neutral500}
                    />
                    <TextBodySm
                      fontWeight="600"
                      color={ColorNeutral.neutral700}
                      flex={1}
                    >
                      {currentDateTime}
                    </TextBodySm>
                  </XStack>
                </YStack>
                <YStack style={styles.heroInfoCardCompact}>
                  <TextCaption color={ColorNeutral.neutral500}>Modal target</TextCaption>
                  <TextH3
                    fontWeight="800"
                    color={ColorPrimary.primary700}
                    numberOfLines={1}
                    marginTop={6}
                  >
                    {formatPrice(amount)}
                  </TextH3>
                </YStack>
              </XStack>
            </YStack>

            <YStack style={[styles.formCard, isTablet && styles.formCardTablet]}>
              <XStack
                width="100%"
                justifyContent="space-between"
                alignItems="flex-start"
                gap="$3"
                flexWrap="wrap"
              >
                <YStack gap={4} flex={1} minWidth={0}>
                  <TextH3 fontWeight="700">Pengaturan Shift</TextH3>
                  <TextBodySm color={ColorNeutral.neutral500}>
                    Pilih slot dan tentukan modal awal kas sebelum mulai jaga.
                  </TextBodySm>
                </YStack>
                <YStack
                  style={[
                    styles.amountSummary,
                    !isTablet && styles.amountSummaryMobile,
                  ]}
                >
                  <TextCaption color={ColorNeutral.neutral500}>
                    Modal saat ini
                  </TextCaption>
                  <TextH1 fontWeight="800" color={ColorPrimary.primary600}>
                    {formatPrice(amount)}
                  </TextH1>
                </YStack>
              </XStack>

              <View style={styles.sectionDivider} />

              <YStack gap={8}>
                <TextH3 fontWeight="700">Slot Shift</TextH3>
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
                          size={15}
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

              <YStack gap={8}>
                <TextH3 fontWeight="700">Preset Modal</TextH3>
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
              </YStack>

              <YStack gap={8}>
                <TextH3 fontWeight="700">Catatan</TextH3>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Catatan shift... (opsional)"
                  placeholderTextColor={ColorNeutral.neutral400}
                  value={note}
                  onChangeText={setNote}
                  multiline={false}
                />
              </YStack>

              {isTablet ? (
                <YStack gap={6} paddingTop="$2">
                  <AppButton
                    variant="success"
                    size="lg"
                    fullWidth
                    disabled={isOpeningShift}
                    title={isOpeningShift ? "Memproses…" : "Mulai Shift Sekarang"}
                    icon={
                      <Ionicons
                        name="sunny-outline"
                        size={18}
                        color={ColorBase.white}
                      />
                    }
                    onPress={() => void handleMulaiShift()}
                  />
                  <TextCaption
                    color={ColorNeutral.neutral400}
                    textAlign="center"
                  >
                    Shift akan tercatat otomatis
                  </TextCaption>
                </YStack>
              ) : null}
            </YStack>
          </YStack>

          <YStack flex={isTablet ? 0.42 : undefined} gap={sectionGap}>
            <View style={styles.numpadCard}>
              <YStack gap="$2">
                <TextH3 fontWeight="700">Input Manual</TextH3>
                <TextBodySm color={ColorNeutral.neutral500}>
                  Gunakan keypad untuk menyesuaikan nominal dengan cepat.
                </TextBodySm>
              </YStack>
              <View style={styles.numpadDivider} />
              <NumpadGrid onPress={handleNumpad} compact={isTablet} />
            </View>
          </YStack>
        </XStack>
      </ScrollView>

      {!isTablet ? (
        <BottomBar paddingBottom={18}>
          <AppButton
            variant="success"
            size="lg"
            fullWidth
            disabled={isOpeningShift}
            title={isOpeningShift ? "Memproses…" : "Mulai Shift Sekarang"}
            icon={
              <Ionicons name="sunny-outline" size={18} color={ColorBase.white} />
            }
            onPress={() => void handleMulaiShift()}
          />
          <TextCaption
            color={ColorNeutral.neutral400}
            textAlign="center"
            marginTop={6}
          >
            Shift akan tercatat otomatis
          </TextCaption>
        </BottomBar>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 8,
    paddingBottom: 18,
  },
  heroCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroCardTablet: {
    paddingVertical: 14,
  },
  heroIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: ColorPrimary.primary25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ColorPrimary.primary100,
  },
  heroAside: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  heroInfoCard: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: ColorNeutral.neutral50,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  heroInfoCardCompact: {
    minWidth: 140,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: ColorPrimary.primary50,
    borderWidth: 1,
    borderColor: ColorPrimary.primary100,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorNeutral.neutral100,
  },
  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: ColorSuccess.success50,
    borderWidth: 1,
    borderColor: ColorSuccess.success200,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: ColorSuccess.success500,
  },
  slotBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: ColorPrimary.primary50,
    borderWidth: 1,
    borderColor: ColorPrimary.primary100,
  },
  formCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  formCardTablet: {
    gap: 12,
  },
  numpadCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  numpadDivider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral200,
    marginVertical: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
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
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorNeutral.neutral50,
    paddingHorizontal: 14,
    fontFamily: "System",
    fontSize: 14,
    color: ColorNeutral.neutral800,
  },
  amountSummary: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ColorPrimary.primary50,
    borderWidth: 1,
    borderColor: ColorPrimary.primary100,
    minWidth: 210,
  },
  amountSummaryMobile: {
    minWidth: 0,
    width: "100%",
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
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
