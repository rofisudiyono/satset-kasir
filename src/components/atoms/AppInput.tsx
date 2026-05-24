/**
 * AppInput — Section 5.2
 *
 * Import: import { AppInput, AppInputWrapper, AppInputLabel, AppInputHint, AppInputError } from '@/design-system'
 *
 * state:        'default' | 'focused' | 'success' | 'error' | 'disabled'
 * size:         'sm' (36dp) | 'md' (44dp)
 * placeholder:  string
 * value:        string
 * onChangeText: function
 */
import React, { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { Text, useTheme, XStack, YStack } from "tamagui";

import {
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AppInputState =
  | "default"
  | "focused"
  | "success"
  | "error"
  | "disabled";
export type AppInputSize = "sm" | "md";

export interface AppInputProps extends Omit<TextInputProps, "style"> {
  state?: AppInputState;
  size?: AppInputSize;
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sizeMap: Record<
  AppInputSize,
  { height: number; fontSize: number; paddingHorizontal: number }
> = {
  sm: { height: 36, fontSize: 12, paddingHorizontal: 12 },
  md: { height: 44, fontSize: 14, paddingHorizontal: 14 },
};

function useBorderColor(state: AppInputState) {
  const theme = useTheme();
  const map: Record<AppInputState, string> = {
    default: theme.borderColor?.val ?? ColorNeutral.neutral200,
    focused: theme.primary?.val ?? ColorPrimary.primary600,
    success: theme.success?.val ?? ColorGreen.green600,
    error: theme.danger?.val ?? ColorDanger.danger600,
    disabled: theme.backgroundTertiary?.val ?? ColorNeutral.neutral100,
  };
  return map[state];
}

function useBgColor(state: AppInputState) {
  const theme = useTheme();
  if (state === "disabled") {
    return theme.backgroundTertiary?.val ?? ColorNeutral.neutral100;
  }
  return theme.background?.val ?? ColorBase.white;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Wrapper that stacks label + input + hint/error */
export function AppInputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <YStack gap="$1" width="100%">
      {children}
    </YStack>
  );
}

/** Label rendered above the input */
export function AppInputLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontFamily="$body"
      fontSize="$md"
      fontWeight="500"
      color="$color"
      marginBottom="$0.5"
    >
      {children}
    </Text>
  );
}

/** Hint text below the input (neutral) */
export function AppInputHint({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontFamily="$body"
      fontSize="$sm"
      fontWeight="400"
      color="$colorSecondary"
    >
      {children}
    </Text>
  );
}

/** Error text below the input */
export function AppInputError({ children }: { children: React.ReactNode }) {
  return (
    <Text fontFamily="$body" fontSize="$sm" fontWeight="400" color="$danger">
      {children}
    </Text>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AppInput({
  state: propState = "default",
  size = "md",
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  placeholder,
  value,
  onChangeText,
  editable,
  ...rest
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Derive state: if prop provides a concrete state, prefer it; otherwise manage focus locally
  const isDisabled = propState === "disabled" || editable === false;
  const state: AppInputState = isDisabled
    ? "disabled"
    : propState !== "default"
      ? propState
      : isFocused
        ? "focused"
        : "default";

  const theme = useTheme();
  const borderColor = useBorderColor(state);
  const backgroundColor = useBgColor(state);
  const dimensions = sizeMap[size];

  const placeholderColor = theme.colorTertiary?.val ?? ColorNeutral.neutral400;
  const textColor = isDisabled
    ? (theme.colorTertiary?.val ?? ColorNeutral.neutral400)
    : (theme.color?.val ?? ColorNeutral.neutral900);

  const inputContent = (
    <XStack
      borderWidth={1.5}
      borderColor={borderColor}
      borderRadius="$3"
      backgroundColor={backgroundColor}
      height={dimensions.height}
      paddingHorizontal={dimensions.paddingHorizontal}
      alignItems="center"
      gap="$2"
    >
      {leftIcon && <XStack>{leftIcon}</XStack>}

      <TextInput
        style={{
          flex: 1,
          height: "100%",
          fontSize: dimensions.fontSize,
          fontFamily: "PlusJakartaSans_400Regular",
          color: textColor,
          padding: 0,
          margin: 0,
        }}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        editable={!isDisabled}
        onFocus={() => !isDisabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />

      {rightIcon && <XStack>{rightIcon}</XStack>}
    </XStack>
  );

  if (label || hint || error) {
    return (
      <AppInputWrapper>
        {label && <AppInputLabel>{label}</AppInputLabel>}
        {inputContent}
        {error ? (
          <AppInputError>{error}</AppInputError>
        ) : hint ? (
          <AppInputHint>{hint}</AppInputHint>
        ) : null}
      </AppInputWrapper>
    );
  }

  return inputContent;
}
