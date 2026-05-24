import { StyleSheet } from "react-native";

import {
  loginFormCardShadow,
  loginInputShadow,
  loginSubmitShadow,
} from "@/features/auth/login-background";

/**
 * Form styles — converted from pos-dashboard login-styles.ts + index.css
 * @see pos-dashboard/src/pages/auth/shared/login-styles.ts
 */

/** Semantic tokens aligned with pos-dashboard :root vars */
export const LoginColors = {
  ink50: "#f5f7f5",
  ink100: "#e9ede9",
  ink200: "#d8e0db",
  ink400: "#8a9c93",
  ink500: "#5b7268",
  ink900: "#0b1f17",
  mint500: "#10b981",
  mint600: "#059669",
  mint700: "#047857",
  emerald100: "rgba(209, 250, 229, 0.75)",
  emerald50: "rgba(236, 253, 245, 0.75)",
  white: "#FFFFFF",
} as const;

export const loginStyles = StyleSheet.create({
  fieldLabel: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 11,
    letterSpacing: 1.32,
    textTransform: "uppercase",
    color: LoginColors.ink500,
    marginBottom: 8,
  },
  fieldInput: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LoginColors.ink200,
    backgroundColor: LoginColors.white,
    paddingLeft: 44,
    paddingRight: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    color: LoginColors.ink900,
    ...loginInputShadow,
  },
  submitButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: LoginColors.mint600,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...loginSubmitShadow,
  },
  submitButtonText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 14,
    color: LoginColors.white,
  },
  formCard: {
    width: "100%",
    maxWidth: 448,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: LoginColors.ink100,
    backgroundColor: LoginColors.white,
    paddingHorizontal: 32,
    paddingVertical: 32,
    ...loginFormCardShadow,
  },
});
