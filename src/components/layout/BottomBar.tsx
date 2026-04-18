import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ColorBase, ColorSurface } from "@/themes/Colors";

interface BottomBarProps {
  children: React.ReactNode;
  /** Tambahan style pada container */
  style?: StyleProp<ViewStyle>;
  /** Padding bawah, default 24 */
  paddingBottom?: number;
  /** Posisi absolute (fixed di bawah layar) */
  absolute?: boolean;
}

/**
 * Bottom action bar yang konsisten di semua halaman.
 * Gunakan `absolute` untuk floating di atas konten scroll.
 */
export function BottomBar({
  children,
  style,
  paddingBottom = 24,
  absolute = false,
}: BottomBarProps) {
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom },
        absolute && styles.absolute,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: ColorBase.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: ColorSurface.border,
  },
  absolute: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
