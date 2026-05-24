import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, XStack, YStack } from "tamagui";

import { AppButton } from "@/components/atoms/AppButton";
import { BottomBar } from "@/components/layout/BottomBar";
import { NumpadGrid } from "@/components/atoms/NumpadGrid";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TextBodySm, TextCaption, TextH1, TextH3 } from "@/components/atoms/Typography";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { kasirShiftToShiftData } from "@/features/shift/utils/mapShift";
import { useOpenShiftMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { getHomeRoute } from "@/lib/routing/device-routes";
import {
  ColorNeutral,
  ColorSuccess,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { formatPrice } from "@/utils";
import type { ShiftSlot } from "@/types";

const PRESET_AMOUNTS = [200_000, 500_000, 1_000_000];

const SHIFT_SLOTS: {
  id: ShiftSlot;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  time: string;
}[] = [
  { id: "PAGI", label: "Pagi", icon: "sunny-outline", time: "06.00 – 14.00" },
  { id: "SIANG", label: "Siang", icon: "partly-sunny-outline", time: "14.00 – 22.00" },
  { id: "MALAM", label: "Malam", icon: "moon-outline", time: "22.00 – 06.00" },
];

const SLOT_TARGETS: Record<ShiftSlot, number> = {
  PAGI: 200_000,
  SIANG: 500_000,
  MALAM: 1_000_000,
};

const QUICK_ADD = [10_000, 50_000, 100_000];

type BukaShiftScreenVariant = "mobile" | "tablet";

export function BukaShiftScreen({ variant }: { variant: BukaShiftScreenVariant }) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: openShiftApi, isPending: isOpeningShift } = useOpenShiftMutation();
  const [inputValue, setInputValue] = useState("200000");
  const [note, setNote] = useState("");
  const [slot, setSlot] = useState<ShiftSlot>("PAGI");
  const [, setIsShiftStarted] = useAtom(isShiftStartedAtom);
  const [, setShiftData] = useAtom(shiftDataAtom);
  const { contentMaxWidth, horizontalPadding, sectionGap } = useResponsiveLayout();
  const isTablet = variant === "tablet";

  const now = new Date();
  const hour = now.getHours();
  const greetingWord =
    hour < 12 ? "pagi" : hour < 15 ? "siang" : hour < 18 ? "sore" : "malam";
  const currentDateTime =
    now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
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
  const branchLabel = user?.branchId
    ? `Outlet ${user.branchId.slice(0, 6)}`
    : "Cabang belum diatur";
  const slotData = SHIFT_SLOTS.find((item) => item.id === slot)!;
  const slotTarget = SLOT_TARGETS[slot];
  const isMatchTarget = amount === slotTarget;

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

  function handleQuickAdd(value: number) {
    setInputValue((prev) => {
      const next = Number(prev) + value;
      return String(Math.min(next, 99_999_999));
    });
  }

  function handleReset() {
    setInputValue("0");
  }

  async function openShift() {
    try {
      const shift = await openShiftApi({
        branchId: user!.branchId!,
        shiftSlot: slot,
        openingCash: Math.round(amount),
      });
      setShiftData({
        ...kasirShiftToShiftData(shift),
        note: note.trim() || undefined,
      });
      setIsShiftStarted(true);
      router.replace(getHomeRoute(isTablet) as never);
    } catch (e) {
      Alert.alert("Gagal buka shift", getApiErrorMessage(e));
    }
  }

  function handleMulaiShift() {
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
    Alert.alert(
      "Buka shift sekarang?",
      `Slot: ${slotData.label}\nModal awal: ${formatPrice(amount)}\n\nPastikan kas awal sudah dihitung sebelum mulai menerima transaksi.`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Buka Shift", onPress: () => { void openShift(); } },
      ],
    );
  }

  const mulaiButton = (
    <AppButton
      variant="brand"
      size="lg"
      fullWidth
      disabled={isOpeningShift}
      title={isOpeningShift ? "Memproses…" : "Mulai shift sekarang"}
      icon={
        <Ionicons name="play" size={16} color={BrandColors.surface} />
      }
      onPress={() => void handleMulaiShift()}
    />
  );

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
            { maxWidth: contentMaxWidth, paddingHorizontal: horizontalPadding },
          ]}
        >
          {/* ── Left column ── */}
          <YStack flex={isTablet ? 0.58 : undefined} gap={sectionGap}>

            {/* Hero card */}
            <YStack style={[styles.heroCard, isTablet && styles.heroCardTablet]}>
              <XStack width="100%" alignItems="flex-start" justifyContent="space-between" gap="$3">
                <YStack gap={4} flex={1} minWidth={0}>
                  <TextCaption color={ColorNeutral.neutral400}>
                    {currentDateTime}
                  </TextCaption>
                  <TextH1 fontWeight="800" numberOfLines={1}>
                    Selamat {greetingWord}, {cashierLabel}
                  </TextH1>
                </YStack>

                {/* Modal target badge */}
                <YStack style={styles.targetBadge}>
                  <TextCaption
                    fontWeight="700"
                    color={ColorNeutral.neutral500}
                    style={styles.labelCaps}
                  >
                    MODAL TARGET
                  </TextCaption>
                  <TextH3 fontWeight="800" color={BrandColors.text} numberOfLines={1}>
                    {formatPrice(slotTarget)}
                  </TextH3>
                </YStack>
              </XStack>

              <View style={styles.heroDivider} />

              <XStack gap="$3" flexWrap="wrap">
                <XStack alignItems="center" gap={6}>
                  <Ionicons name="person-outline" size={14} color={ColorNeutral.neutral500} />
                  <TextBodySm color={ColorNeutral.neutral600}>{cashierLabel}</TextBodySm>
                </XStack>
                <XStack alignItems="center" gap={6}>
                  <Ionicons name="storefront-outline" size={14} color={ColorNeutral.neutral500} />
                  <TextBodySm color={ColorNeutral.neutral600}>{branchLabel}</TextBodySm>
                </XStack>
                <XStack alignItems="center" gap={6}>
                  <View style={styles.onlineDot} />
                  <TextBodySm color={ColorSuccess.success600}>Online</TextBodySm>
                </XStack>
              </XStack>
            </YStack>

            {/* Form card */}
            <YStack style={[styles.formCard, isTablet && styles.formCardTablet]}>
              <XStack
                width="100%"
                justifyContent="space-between"
                alignItems="flex-start"
                gap="$3"
                flexWrap="wrap"
              >
                <YStack gap={4} flex={1} minWidth={0}>
                  <TextH3 fontWeight="700">Pengaturan shift</TextH3>
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
                  <TextCaption
                    fontWeight="700"
                    color={ColorNeutral.neutral500}
                    style={styles.labelCaps}
                  >
                    MODAL SAAT INI
                  </TextCaption>
                  <TextH3 fontWeight="800" color={BrandColors.buttonSolid} numberOfLines={1}>
                    {formatPrice(amount)}
                  </TextH3>
                </YStack>
              </XStack>

              <View style={styles.sectionDivider} />

              {/* Slot shift */}
              <YStack gap={8}>
                <TextCaption fontWeight="700" color={ColorNeutral.neutral500} style={styles.labelCaps}>
                  SLOT SHIFT
                </TextCaption>
                <XStack gap="$2" flexWrap="wrap">
                  {SHIFT_SLOTS.map((s) => {
                    const active = slot === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => setSlot(s.id)}
                        activeOpacity={0.8}
                        style={[styles.slotChip, active && styles.slotChipActive]}
                      >
                        <Ionicons
                          name={s.icon}
                          size={14}
                          color={active ? BrandColors.surface : ColorNeutral.neutral500}
                          style={{ marginRight: 5 }}
                        />
                        <TextBodySm
                          fontWeight="700"
                          color={active ? BrandColors.surface : ColorNeutral.neutral700}
                        >
                          {s.label}
                        </TextBodySm>
                        <TextBodySm
                          color={active ? "rgba(255,255,255,0.92)" : ColorNeutral.neutral400}
                          style={{ marginLeft: 5 }}
                        >
                          {s.time}
                        </TextBodySm>
                      </TouchableOpacity>
                    );
                  })}
                </XStack>
              </YStack>

              {/* Preset modal */}
              <YStack gap={8}>
                <TextCaption fontWeight="700" color={ColorNeutral.neutral500} style={styles.labelCaps}>
                  PRESET MODAL
                </TextCaption>
                <XStack flexWrap="wrap" gap="$2">
                  {PRESET_AMOUNTS.map((preset) => {
                    const active = amount === preset;
                    return (
                      <TouchableOpacity
                        key={preset}
                        onPress={() => handlePreset(preset)}
                        activeOpacity={0.7}
                        style={[styles.presetChip, active && styles.presetChipActive]}
                      >
                        <TextBodySm
                          fontWeight="600"
                          color={active ? BrandColors.surface : ColorNeutral.neutral700}
                        >
                          {formatPrice(preset)}
                        </TextBodySm>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => handleReset()}
                    activeOpacity={0.7}
                    style={styles.presetChip}
                  >
                    <TextBodySm fontWeight="600" color={ColorNeutral.neutral700}>
                      Custom
                    </TextBodySm>
                  </TouchableOpacity>
                </XStack>
              </YStack>

              {/* Catatan */}
              <YStack gap={8}>
                <XStack justifyContent="space-between" alignItems="center">
                  <TextCaption fontWeight="700" color={ColorNeutral.neutral500} style={styles.labelCaps}>
                    CATATAN
                  </TextCaption>
                  <TextCaption color={ColorNeutral.neutral400}>opsional</TextCaption>
                </XStack>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Misal: stok kembalian Rp 50.000 belum tersedia"
                  placeholderTextColor={ColorNeutral.neutral400}
                  value={note}
                  onChangeText={setNote}
                  multiline={false}
                />
              </YStack>

              <View style={styles.sectionDivider} />

              {/* Footer info */}
              <YStack gap={2}>
                <TextBodySm color={ColorNeutral.neutral600}>
                  Shift akan tercatat otomatis pada laporan harian.
                </TextBodySm>
                <TextBodySm color={ColorNeutral.neutral400}>
                  Pastikan jumlah modal sesuai uang fisik di laci kas.
                </TextBodySm>
              </YStack>

              {isTablet ? (
                <YStack paddingTop={4}>
                  {mulaiButton}
                </YStack>
              ) : null}
            </YStack>
          </YStack>

          {/* ── Right column (numpad) ── */}
          <YStack flex={isTablet ? 0.42 : undefined} gap={sectionGap}>
            <YStack style={styles.numpadCard}>

              {/* Amount display */}
              <XStack justifyContent="space-between" alignItems="flex-start">
                <TextCaption fontWeight="700" color={ColorNeutral.neutral500} style={styles.labelCaps}>
                  MODAL AWAL KAS
                </TextCaption>
                <TextCaption fontWeight="700" color={ColorNeutral.neutral400} style={styles.labelCaps}>
                  IDR
                </TextCaption>
              </XStack>
              <TextH1 fontWeight="800" numberOfLines={1} style={styles.amountDisplay}>
                {formatPrice(amount)}
              </TextH1>

              <View style={styles.numpadDivider} />

              <NumpadGrid onPress={handleNumpad} compact={isTablet} />

              {/* Match validation */}
              {isMatchTarget ? (
                <XStack alignItems="center" gap={6} style={styles.matchChip}>
                  <Ionicons name="checkmark" size={14} color={ColorSuccess.success600} />
                  <TextBodySm color={ColorSuccess.success700}>
                    Modal cocok dengan target shift {slotData.label}.
                  </TextBodySm>
                </XStack>
              ) : null}

              <View style={styles.numpadDivider} />

              {/* Geser cepat */}
              <YStack gap={8}>
                <TextCaption fontWeight="700" color={ColorNeutral.neutral500} style={styles.labelCaps}>
                  GESER CEPAT
                </TextCaption>
                <XStack gap="$2" flexWrap="wrap">
                  {QUICK_ADD.map((val) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => handleQuickAdd(val)}
                      activeOpacity={0.7}
                      style={styles.quickAddChip}
                    >
                      <TextBodySm fontWeight="600" color={BrandColors.text}>
                        +{val >= 1_000_000 ? `${val / 1_000_000}jt` : `${val / 1_000}rb`}
                      </TextBodySm>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={handleReset}
                    activeOpacity={0.7}
                    style={styles.quickResetChip}
                  >
                    <TextBodySm fontWeight="600" color={ColorNeutral.neutral600}>
                      Reset
                    </TextBodySm>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </YStack>
          </YStack>
        </XStack>
      </ScrollView>

      {!isTablet ? (
        <BottomBar paddingBottom={18}>
          {mulaiButton}
        </BottomBar>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 8,
    paddingBottom: 18,
  },
  heroCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroCardTablet: {
    paddingVertical: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: BrandColors.border,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: ColorSuccess.success500,
  },
  targetBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.tint,
    alignItems: "flex-end",
  },
  formCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  formCardTablet: {
    gap: 12,
  },
  amountSummary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: BrandColors.tint,
    borderWidth: 1,
    borderColor: BrandColors.border,
    minWidth: 150,
    alignItems: "flex-end",
  },
  amountSummaryMobile: {
    minWidth: 0,
    width: "100%",
    alignItems: "flex-start",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: BrandColors.border,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.surface,
  },
  slotChipActive: {
    backgroundColor: BrandColors.buttonSolid,
    borderColor: BrandColors.buttonSolid,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.surface,
  },
  presetChipActive: {
    backgroundColor: BrandColors.buttonSolid,
    borderColor: BrandColors.buttonSolid,
  },
  noteInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: ColorNeutral.neutral50,
    paddingHorizontal: 14,
    fontFamily: "System",
    fontSize: 14,
    color: ColorNeutral.neutral800,
  },
  numpadCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  amountDisplay: {
    fontSize: 28,
    lineHeight: 34,
    color: ColorNeutral.neutral900,
  },
  numpadDivider: {
    height: 1,
    backgroundColor: BrandColors.border,
  },
  matchChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: ColorSuccess.success50,
    borderWidth: 1,
    borderColor: ColorSuccess.success200,
  },
  quickAddChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.borderStrong,
    backgroundColor: BrandColors.tint,
  },
  quickResetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: BrandColors.surface,
  },
  labelCaps: {
    letterSpacing: 0.5,
    fontSize: 11,
  },
});
