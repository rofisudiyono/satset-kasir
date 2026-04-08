import React from "react";
import { StyleSheet, View } from "react-native";

import { ColorDanger, ColorPrimary, ColorSky } from "@/themes/Colors";

import { NumpadButton } from "./NumpadButton/index";

const DEFAULT_ROWS: string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "DEL"],
];

interface NumpadGridProps {
  onPress: (key: string) => void;
  /** Override baris numpad, default 1-9 + 000/0/DEL */
  rows?: string[][];
  compact?: boolean;
}

/**
 * Numpad grid yang digunakan di buka-shift, tutup-shift, dan pembayaran-tunai.
 */
export function NumpadGrid({
  onPress,
  rows = DEFAULT_ROWS,
  compact = false,
}: NumpadGridProps) {
  return (
    <View style={[styles.numpad, compact && styles.numpadCompact]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, compact && styles.rowCompact]}>
          {row.map((key) =>
            key === "DEL" ? (
              <NumpadButton
                key="DEL"
                label=""
                bgColor={ColorDanger.danger75}
                onPress={() => onPress("DEL")}
                isIcon
                compact={compact}
              />
            ) : key === "000" ? (
              <NumpadButton
                key="000"
                label="000"
                bgColor={ColorSky.indigo50}
                textColor={ColorPrimary.primary600}
                onPress={() => onPress("000")}
                compact={compact}
              />
            ) : (
              <NumpadButton
                key={key}
                label={key}
                onPress={() => onPress(key)}
                compact={compact}
              />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  numpad: {
    gap: 8,
  },
  numpadCompact: {
    gap: 6,
  },
  row: {
    height: 54,
    flexDirection: "row",
    gap: 8,
  },
  rowCompact: {
    height: 48,
    gap: 6,
  },
});
