import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { XStack } from "tamagui";

import { TextBodySm, TextCaption } from "@/components";
import {
  ColorBase,
  ColorGreen,
  ColorNeutral,
  ColorSurface,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import type { AppliedPromo } from "@/types";

interface PromoCardProps {
  promoCode: string;
  onPromoCodeChange: (v: string) => void;
  onApplyPromo: () => void;
  appliedPromo: AppliedPromo | null;
  promoEnabled: boolean;
  onTogglePromo: () => void;
  isLoading?: boolean;
}

export function PromoCard({
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  appliedPromo,
  promoEnabled,
  onTogglePromo,
  isLoading = false,
}: PromoCardProps) {
  return (
    <View style={styles.card}>
      <XStack gap={8} alignItems="center">
        <View style={styles.promoInputWrapper}>
          <TextInput
            value={promoCode}
            onChangeText={onPromoCodeChange}
            placeholder="Masukkan kode promo"
            placeholderTextColor={ColorNeutral.neutral400}
            style={styles.promoInput}
            autoCapitalize="characters"
            editable={!isLoading}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onApplyPromo}
          disabled={isLoading}
        >
          <View style={[styles.promoApplyBtn, isLoading && styles.promoApplyBtnDisabled]}>
            {isLoading ? (
              <ActivityIndicator size="small" color={ColorBase.white} />
            ) : (
              <TextBodySm fontWeight="700" color={ColorBase.white}>
                Pakai
              </TextBodySm>
            )}
          </View>
        </TouchableOpacity>
      </XStack>

      {appliedPromo && (
        <XStack
          alignItems="center"
          gap={8}
          marginTop={10}
          style={styles.promoChip}
        >
          <Ionicons
            name="pricetag-outline"
            size={14}
            color={ColorGreen.green600}
          />
          <TextCaption color={ColorGreen.green600} fontWeight="600" flex={1}>
            {appliedPromo.label}
          </TextCaption>
          <TouchableOpacity activeOpacity={0.7} onPress={onTogglePromo}>
            <View
              style={[
                styles.toggleTrack,
                promoEnabled && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  promoEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </XStack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorSurface.border,
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  promoInputWrapper: {
    flex: 1,
    backgroundColor: ColorNeutral.neutral50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    paddingHorizontal: 14,
    justifyContent: "center",
    height: 48,
  },
  promoInput: {
    fontSize: 14,
    color: ColorNeutral.neutral900,
    fontFamily: "Poppins_400Regular",
  },
  promoApplyBtn: {
    backgroundColor: BrandColors.buttonSolid,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },
  promoApplyBtnDisabled: {
    opacity: 0.6,
  },
  promoChip: {
    backgroundColor: ColorGreen.green50,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: ColorGreen.green200,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorNeutral.neutral300,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: BrandColors.buttonSolid,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ColorBase.white,
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
});
