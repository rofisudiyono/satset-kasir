import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { XStack } from "tamagui";

import { ColorBase, ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

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
      borderRadius={999}
      height={compact ? 44 : 48}
      alignItems="center"
      paddingHorizontal={compact ? "$3" : "$4"}
      gap="$2"
      borderWidth={1}
      borderColor={compact ? ColorNeutral.neutral200 : "$borderColor"}
      style={compact ? styles.compactShadow : undefined}
    >
      <Ionicons
        name="search-outline"
        size={compact ? 18 : 18}
        color={BrandColors.sage}
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
            color={BrandColors.text}
          />
        </TouchableOpacity>
      ) : null}
    </XStack>
  );
}

const styles = StyleSheet.create({
  compactShadow: {
    shadowColor: BrandColors.deep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
});
