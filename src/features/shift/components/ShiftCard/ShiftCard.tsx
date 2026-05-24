import { Ionicons } from "@expo/vector-icons";
import { useAtomValue } from "jotai";
import React from "react";
import { XStack, YStack } from "tamagui";

import { shiftDataAtom } from "@/features/shift/store/shift.store";
import { AppButton } from "@/components/atoms/AppButton";
import { TextBodyLg, TextBodySm, TextCaption } from "@/components/atoms/Typography";
import {
  ColorBase,
  ColorNeutral,
  ColorSuccess,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

import { ShiftCardProps } from "./ShiftCard.types";

export function ShiftCard({
  isShiftStarted,
  onClose,
  onStart,
}: ShiftCardProps) {
  const shiftData = useAtomValue(shiftDataAtom);

  if (isShiftStarted) {
    return (
      <YStack
        backgroundColor={BrandColors.deep}
        borderRadius={16}
        padding="$4"
        gap="$3"
      >
        <XStack alignItems="center" gap="$2">
          <YStack
            width={8}
            height={8}
            borderRadius={4}
            backgroundColor={ColorSuccess.success400}
          />
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            Shift Aktif
          </TextBodyLg>
        </XStack>

        <TextBodySm color="rgba(240,253,232,0.78)">
          Mulai: {shiftData?.startTime ?? "08:00 WIB"}
        </TextBodySm>

        <XStack gap="$2">
          <YStack
            flex={1}
            backgroundColor="rgba(255,255,255,0.15)"
            borderRadius={10}
            padding="$3"
            gap={4}
          >
            <TextBodySm color="rgba(240,253,232,0.78)">
              Total Transaksi
            </TextBodySm>
            <TextBodyLg fontWeight="700" color={ColorBase.white}>
              24
            </TextBodyLg>
          </YStack>
          <YStack
            flex={1}
            backgroundColor="rgba(255,255,255,0.15)"
            borderRadius={10}
            padding="$3"
            gap={4}
          >
            <TextBodySm color="rgba(240,253,232,0.78)">Pendapatan</TextBodySm>
            <TextBodyLg
              fontWeight="700"
              color={ColorBase.white}
              numberOfLines={1}
            >
              Rp 1.250....
            </TextBodyLg>
          </YStack>
        </XStack>

        <AppButton
          variant="glass"
          size="lg"
          fullWidth
          title="Tutup Shift"
          onPress={onClose}
        />
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor={BrandColors.deep}
      borderRadius={16}
      padding="$4"
      gap="$3"
    >
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap="$2">
          <YStack
            width={8}
            height={8}
            borderRadius={4}
            backgroundColor={ColorNeutral.neutral300}
          />
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            Shift Akan Dimulai
          </TextBodyLg>
        </XStack>
        <YStack
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor="rgba(255,255,255,0.2)"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="sunny-outline" size={18} color={ColorBase.white} />
        </YStack>
      </XStack>

      <TextBodySm color="rgba(240,253,232,0.78)">
        Siapkan modal awal dan cek perangkat kasir sebelum mulai menerima
        transaksi.
      </TextBodySm>

      <XStack gap="$2">
        <YStack
          flex={1}
          backgroundColor="rgba(255,255,255,0.15)"
          borderRadius={10}
          padding="$3"
          gap={4}
        >
          <TextBodySm color="rgba(240,253,232,0.78)">Jadwal Shift</TextBodySm>
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            08:00 WIB
          </TextBodyLg>
        </YStack>
        <YStack
          flex={1}
          backgroundColor="rgba(255,255,255,0.15)"
          borderRadius={10}
          padding="$3"
          gap={4}
        >
          <TextBodySm color="rgba(240,253,232,0.78)">
            Kasir Bertugas
          </TextBodySm>
          <TextBodyLg
            fontWeight="700"
            color={ColorBase.white}
            numberOfLines={1}
          >
            Budi Santoso
          </TextBodyLg>
        </YStack>
      </XStack>

      <YStack
        backgroundColor="rgba(255,255,255,0.12)"
        borderRadius={12}
        padding="$3"
        gap={4}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.2)"
      >
        <XStack alignItems="flex-start" gap="$2">
          <Ionicons
            name="card-outline"
            size={18}
            color={BrandColors.lime}
            style={{ marginTop: 1 }}
          />
          <YStack flex={1} gap={2}>
            <TextBodySm fontWeight="600" color={ColorBase.white}>
              Modal awal direkomendasikan Rp 500.000
            </TextBodySm>
            <TextCaption color="rgba(240,253,232,0.78)">
              Jumlah ini akan dipakai sebagai saldo awal laci kasir saat shift
              dibuka.
            </TextCaption>
          </YStack>
        </XStack>
      </YStack>

      <AppButton
        variant="brand"
        size="lg"
        fullWidth
        title="Mulai Shift Sekarang"
        icon={
          <Ionicons name="play-outline" size={18} color={ColorBase.white} />
        }
        onPress={onStart}
      />
    </YStack>
  );
}
