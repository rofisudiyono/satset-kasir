import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { XStack } from "tamagui";

import { ShadowCard } from "@/components/atoms/ShadowCard";
import { TextBodyLg, TextBodySm } from "@/components/atoms/Typography";
import { ColorDanger, ColorNeutral, ColorPrimary } from "@/themes/Colors";
import type { Transaction } from "@/types";

import { StatusBadge } from "./StatusBadge";

interface TransactionCardProps {
  tx: Transaction;
  onPress: (tx: Transaction) => void;
  isSelected?: boolean;
}

export function TransactionCard({
  tx,
  onPress,
  isSelected,
}: TransactionCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(tx)}>
      <ShadowCard
        backgroundColor={
          isSelected
            ? ColorPrimary.primary50
            : tx.status === "Void"
              ? ColorDanger.danger25
              : "$background"
        }
        padding="$4"
        gap="$2"
        borderWidth={isSelected ? 1.5 : 0}
        borderColor={isSelected ? ColorPrimary.primary400 : "transparent"}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <TextBodyLg fontWeight="700" color="$primary">
            {tx.id}
          </TextBodyLg>
          <StatusBadge status={tx.status} />
        </XStack>

        <XStack alignItems="center" gap="$3">
          <XStack alignItems="center" gap={4}>
            <Ionicons
              name="time-outline"
              size={13}
              color={ColorNeutral.neutral400}
            />
            <TextBodySm color="$colorSecondary">{tx.time}</TextBodySm>
          </XStack>
          {tx.table ? (
            <XStack alignItems="center" gap={4}>
              <Ionicons
                name="person-outline"
                size={13}
                color={ColorNeutral.neutral400}
              />
              <TextBodySm color="$colorSecondary">{tx.table}</TextBodySm>
            </XStack>
          ) : null}
        </XStack>

        {tx.items ? (
          <TextBodySm
            color="$colorSecondary"
            fontStyle="italic"
            numberOfLines={1}
          >
            {tx.items}
          </TextBodySm>
        ) : null}

        <XStack alignItems="center" justifyContent="space-between">
          <TextBodyLg
            fontWeight="700"
            color={tx.status === "Void" ? ColorDanger.danger600 : "$color"}
            textDecorationLine={tx.status === "Void" ? "line-through" : "none"}
          >
            {tx.amount}
          </TextBodyLg>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={ColorNeutral.neutral400}
          />
        </XStack>
      </ShadowCard>
    </TouchableOpacity>
  );
}

export const MemoTransactionCard = React.memo(TransactionCard);
