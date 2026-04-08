import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { TextH3 } from "@/components/atoms/Typography";
import { ColorDanger, ColorNeutral } from "@/themes/Colors";

import type { NumpadButtonProps } from "./NumpadButton.types";

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  btnCompact: {
    height: 48,
    borderRadius: 10,
    marginHorizontal: 4,
  },
});

export function NumpadButton({
  label,
  onPress,
  textColor = ColorNeutral.neutral900,
  bgColor = ColorNeutral.neutral150,
  isIcon = false,
  compact = false,
  style,
}: NumpadButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.btn,
        compact && styles.btnCompact,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      {isIcon ? (
        <Ionicons
          name="backspace"
          size={compact ? 18 : 22}
          color={ColorDanger.danger600}
        />
      ) : (
        <TextH3 fontWeight="700" color={textColor} fontSize={compact ? 18 : 20}>
          {label}
        </TextH3>
      )}
    </TouchableOpacity>
  );
}
