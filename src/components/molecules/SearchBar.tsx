/**
 * SearchBar — Standard search input row
 *
 * Shared between Transaksi and Inventori pages.
 * Supports both controlled (value + onChangeText) and visual-only (placeholder) usage.
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";
import { XStack } from "tamagui";

import { ColorNeutral } from "@/themes/Colors";

export interface SearchBarProps {
  placeholder?: string;
  /** Show the filter icon on the right side */
  showFilterIcon?: boolean;
  /** Controlled value */
  value?: string;
  /** Called when text changes */
  onChangeText?: (text: string) => void;
}

export function SearchBar({
  placeholder = "Cari...",
  showFilterIcon = false,
  value,
  onChangeText,
}: SearchBarProps) {
  return (
    <XStack
      backgroundColor="$background"
      borderRadius={12}
      height={44}
      alignItems="center"
      paddingHorizontal="$3"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Ionicons
        name="search-outline"
        size={16}
        color={ColorNeutral.neutral400}
      />
      <TextInput
        style={{ flex: 1, fontSize: 15, color: ColorNeutral.neutral900, padding: 0 }}
        placeholder={placeholder}
        placeholderTextColor={ColorNeutral.neutral400}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {showFilterIcon && (
        <Ionicons
          name="options-outline"
          size={16}
          color={ColorNeutral.neutral700}
        />
      )}
    </XStack>
  );
}
