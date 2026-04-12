import React from "react";
import { View } from "react-native";
import { XStack, YStack } from "tamagui";

import { useOrderHistoryQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import {
  ShadowCard,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import { ColorNeutral } from "@/themes/Colors";
import { StatusBadge } from "@/features/transactions/components/StatusBadge";
import { mapKasirOrderToTransaction } from "@/features/pos/pos.utils";
import { useAtomValue } from "jotai";

export function RecentTransactions() {
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const { data, isLoading } = useOrderHistoryQuery(isLoggedIn && isShiftStarted);
  const displayList = (data ?? []).slice(0, 5).map(mapKasirOrderToTransaction);

  return (
    <YStack gap="$2">
      <TextH3 fontWeight="700">Transaksi Terakhir</TextH3>
      <ShadowCard overflow="hidden">
        {isLoading ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
            <TextBodySm color="$colorSecondary">Memuat transaksi...</TextBodySm>
          </View>
        ) : null}
        {!isLoading && displayList.length === 0 ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
            <TextBodySm color="$colorSecondary">
              Belum ada transaksi di shift aktif.
            </TextBodySm>
          </View>
        ) : null}
        {displayList.map((trx, idx) => (
          <React.Fragment key={trx.id}>
            {idx > 0 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: ColorNeutral.neutral200,
                  marginHorizontal: 16,
                }}
              />
            )}
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              gap="$3"
            >
              <YStack flex={1} minWidth={0} gap={2}>
                <TextBodyLg fontWeight="700">{trx.id}</TextBodyLg>
                <TextCaption color="$colorSecondary">{trx.time}</TextCaption>
              </YStack>
              <XStack alignItems="center" gap="$3" flexShrink={0}>
                <TextBodyLg fontWeight="700" numberOfLines={1}>
                  {trx.amount}
                </TextBodyLg>
                <StatusBadge status={trx.status} />
              </XStack>
            </XStack>
          </React.Fragment>
        ))}
      </ShadowCard>
    </YStack>
  );
}
