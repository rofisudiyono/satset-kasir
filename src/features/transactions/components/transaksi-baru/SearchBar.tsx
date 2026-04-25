import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity } from "react-native";
import { XStack } from "tamagui";

import { ColorBase, ColorNeutral } from "@/themes/Colors";

type SearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  onBarcodePress?: () => void;
  compact?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Cari produk atau scan barcode...",
  onBarcodePress,
  compact = false,
}: SearchBarProps) {
  return (
    <XStack
      backgroundColor={ColorBase.white}
      borderRadius={compact ? 10 : 12}
      height={compact ? 42 : 48}
      alignItems="center"
      paddingHorizontal={compact ? "$2" : "$3"}
      gap="$2"
      borderWidth={1}
      borderColor={compact ? ColorNeutral.neutral200 : "$borderColor"}
    >
      <Ionicons
        name="search-outline"
        size={compact ? 16 : 18}
        color={ColorNeutral.neutral400}
      />
      <TextInput
        style={{
          flex: 1,
          fontSize: compact ? 13 : 15,
          color: ColorNeutral.neutral900,
          padding: 0,
        }}
        placeholder={placeholder}
        placeholderTextColor={ColorNeutral.neutral400}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {onBarcodePress ? (
        <TouchableOpacity activeOpacity={0.75} onPress={onBarcodePress}>
          <Ionicons
            name="barcode-outline"
            size={compact ? 18 : 20}
            color={ColorNeutral.neutral500}
          />
        </TouchableOpacity>
      ) : null}
    </XStack>
  );
}
