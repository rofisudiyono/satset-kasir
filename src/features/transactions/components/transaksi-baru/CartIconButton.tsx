import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { TextCaption } from "@/components";
import { ColorBase, ColorNeutral } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

type Props = {
  totalItems: number;
};

export function CartIconButton({ totalItems }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.btn}>
        <Ionicons
          name="cart-outline"
          size={20}
          color={ColorNeutral.neutral700}
        />
      </View>
      {totalItems > 0 && (
        <View style={styles.badge}>
          <TextCaption
            fontWeight="700"
            color={ColorBase.white}
            fontSize={10}
            lineHeight={14}
          >
            {totalItems > 9 ? "9+" : totalItems}
          </TextCaption>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BrandColors.buttonSolid,
    alignItems: "center",
    justifyContent: "center",
  },
});
