/**
 * AppButton — Section 5.1
 *
 * Import: import { AppButton } from '@/design-system'
 *
 * variants: 'primary' | 'success' | 'danger' | 'warning' | 'outline' | 'outlineGray' | 'ghost' | 'disabled'
 * size:     'sm' (36dp) | 'md' (44dp) | 'lg' (52dp)
 * fullWidth: boolean
 * iconOnly:  boolean  — renders as 44×44 square button
 * disabled:  boolean
 */
import React from "react";
import { ActivityIndicator } from "react-native";
import { Button, Text } from "tamagui";

import { ColorBase } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AppButtonVariant =
  | "primary"
  | "success"
  | "danger"
  | "dangerDeep"
  | "warning"
  | "brand"
  | "outline"
  | "outlineGray"
  | "ghost"
  | "disabled"
  | "glass";

export type AppButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;

  // ─── Props Baru ───
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

// ─── Variant maps ─────────────────────────────────────────────────────────────
const variantStyles: Record<
  AppButtonVariant,
  {
    bg: string;
    border: string;
    labelColor: string;
    pressOpacity: number;
  }
> = {
  primary: {
    bg: "$primary",
    border: "$primary",
    labelColor: ColorBase.white,
    pressOpacity: 0.85,
  },
  success: {
    bg: "$success",
    border: "$success",
    labelColor: ColorBase.white,
    pressOpacity: 0.85,
  },
  danger: {
    bg: "$danger",
    border: "$danger",
    labelColor: ColorBase.white,
    pressOpacity: 0.85,
  },
  dangerDeep: {
    bg: "#be123c",
    border: "#be123c",
    labelColor: ColorBase.white,
    pressOpacity: 0.85,
  },
  warning: {
    bg: "$warning",
    border: "$warning",
    labelColor: ColorBase.white,
    pressOpacity: 0.85,
  },
  brand: {
    bg: BrandColors.buttonSolid,
    border: BrandColors.buttonSolid,
    labelColor: ColorBase.white,
    pressOpacity: 0.85,
  },
  outline: {
    bg: ColorBase.transparent,
    border: "$primary",
    labelColor: "$primary",
    pressOpacity: 0.7,
  },
  outlineGray: {
    bg: ColorBase.transparent,
    border: "$borderColor",
    labelColor: "$color",
    pressOpacity: 0.7,
  },
  ghost: {
    bg: ColorBase.transparent,
    border: ColorBase.transparent,
    labelColor: "$primary",
    pressOpacity: 0.6,
  },
  disabled: {
    bg: "$backgroundTertiary",
    border: "$backgroundTertiary",
    labelColor: "$colorTertiary",
    pressOpacity: 1,
  },
  glass: {
    bg: "rgba(255,255,255,0.15)",
    border: "rgba(255,255,255,0.3)",
    labelColor: ColorBase.white,
    pressOpacity: 0.7,
  },
};

const sizeMap: Record<
  AppButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 12 },
  md: { height: 44, paddingHorizontal: 16, fontSize: 14 },
  lg: { height: 52, paddingHorizontal: 20, fontSize: 16 },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AppButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  disabled = false,
  loading = false,
  onPress,
  children,
  title,
  icon,
  iconPosition = "left",
}: AppButtonProps) {
  const isDisabled = disabled || variant === "disabled";
  const resolvedVariant: AppButtonVariant = isDisabled ? "disabled" : variant;
  const styles = variantStyles[resolvedVariant];
  const dimensions = sizeMap[size];

  const width = iconOnly
    ? 44
    : fullWidth
      ? ("100%" as unknown as number)
      : undefined;

  // Render logic agar kode lebih bersih
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={
            ["outline", "outlineGray", "ghost"].includes(variant)
              ? undefined
              : ColorBase.white
          }
        />
      );
    }

    // Jika mode iconOnly aktif
    if (iconOnly && icon) {
      return icon;
    }

    // Jika menggunakan prop title dan/atau icon
    if (title || icon) {
      return (
        <>
          {iconPosition === "left" && icon}
          {!!title && (
            <Text
              fontFamily="$body"
              fontSize={dimensions.fontSize}
              fontWeight="700"
              color={styles.labelColor as any}
              numberOfLines={1}
              flex={1}
              textAlign="center"
            >
              {title}
            </Text>
          )}
          {iconPosition === "right" && icon}
        </>
      );
    }

    // Fallback ke children untuk backward compatibility
    if (typeof children === "string") {
      return (
        <Text
          fontFamily="$body"
          fontSize={dimensions.fontSize}
          fontWeight="600"
          color={styles.labelColor as any}
          numberOfLines={1}
          flex={1}
          textAlign="center"
        >
          {children}
        </Text>
      );
    }

    return children;
  };

  return (
    <Button
      onPress={isDisabled || loading ? undefined : onPress}
      backgroundColor={styles.bg as any}
      borderWidth={1}
      borderColor={styles.border as any}
      borderRadius="$3"
      height={iconOnly ? 44 : dimensions.height}
      width={iconOnly ? 44 : (width as any)}
      paddingHorizontal={iconOnly ? 0 : dimensions.paddingHorizontal}
      alignItems="center"
      justifyContent="center"
      flexDirection="row" // Pastikan icon dan text bersebelahan
      gap="$2" // Menambahkan jarak antar icon dan text (default dari theme tamagui, biasanya 8px)
      opacity={isDisabled ? 0.7 : 1}
      pressStyle={
        !isDisabled && !loading ? { opacity: styles.pressOpacity } : {}
      }
      cursor={isDisabled ? "not-allowed" : "pointer"}
      disabled={isDisabled}
      unstyled
    >
      {renderContent()}
    </Button>
  );
}
