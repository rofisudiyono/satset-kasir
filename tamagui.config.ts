import { createAnimations } from "@tamagui/animations-react-native";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { createFont, createTamagui, createTokens } from "tamagui";

const animations = createAnimations({
  "0ms": {
    type: "timing",
    duration: 0,
  },
  "50ms": {
    type: "timing",
    duration: 50,
  },
  "75ms": {
    type: "timing",
    duration: 75,
  },
  "100ms": {
    type: "timing",
    duration: 100,
  },
  "200ms": {
    type: "timing",
    duration: 200,
  },
  "250ms": {
    type: "timing",
    duration: 250,
  },
  "300ms": {
    type: "timing",
    duration: 300,
  },
  "400ms": {
    type: "timing",
    duration: 400,
  },
  "500ms": {
    type: "timing",
    duration: 500,
  },
  bouncy: {
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },
  lazy: {
    damping: 18,
    stiffness: 50,
  },
  medium: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
  slow: {
    damping: 15,
    stiffness: 40,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  tooltip: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
});

const animationDrivers = {
  default: animations,
} as const;

// ─── Farmapro palette (aligned with pos-dashboard) ───────────────────────────
const rawColors = {
  // Mint (primary)
  brand25: "#f0fdf4",
  brand50: "#ecfdf5",
  brand100: "#d1fae5",
  brand200: "#a7f3d0",
  brand400: "#10b981",
  brand500: "#10b981",
  brand600: "#059669",
  brand700: "#047857",
  brand800: "#065f46",
  brand900: "#064e3b",

  // Green accents
  teal50: "#ecfdf5",
  teal100: "#d1fae5",
  teal300: "#6ee7b7",
  teal500: "#10b981",
  teal600: "#059669",
  teal800: "#047857",

  // Ink (neutral/text)
  blue50: "#f0f9ff",
  blue100: "#e0f2fe",
  blue300: "#7dd3fc",
  blue400: "#38bdf8",
  blue500: "#0ea5e9",
  blue600: "#0284c7",
  blue700: "#0369a1",
  blue800: "#075985",
  blue900: "#0c4a6e",

  green50: "#f0fdf4",
  green100: "#dcfce7",
  green300: "#86efac",
  green500: "#22c55e",
  green600: "#16a34a",
  green700: "#15803d",
  green800: "#166534",
  green900: "#14532d",

  amber50: "#fffbeb",
  amber100: "#fef3c7",
  amber300: "#fcd34d",
  amber400: "#f59e0b",
  amber600: "#d97706",
  amber700: "#b45309",
  amber900: "#78350f",

  red50: "#fff1f2",
  red100: "#ffe4e6",
  red300: "#fda4af",
  red500: "#f43f5e",
  red600: "#e11d48",
  red700: "#be123c",
  red900: "#881337",

  gray50: "#f5f7f5",
  gray100: "#e9ede9",
  gray200: "#d8e0db",
  gray300: "#b6c4bc",
  gray400: "#8a9c93",
  gray500: "#5b7268",
  gray600: "#3a5a52",
  gray700: "#1f4a3d",
  gray800: "#13322a",
  gray900: "#0b1f17",

  purple50: "#f4f2f6",
  purple100: "#e7e2ec",
  purple300: "#d2c8dc",
  purple600: "#684a7d",
  purple700: "#553a68",

  orange50: "#fffbeb",
  orange100: "#fef3c7",
  orange300: "#fcd34d",
  orange600: "#d97706",
  orange700: "#b45309",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "rgba(0,0,0,0)",
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
const tokens = createTokens({
  color: rawColors,
  space: {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    12: 48,
    true: 16,
  },
  size: {
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    true: 44,
  },
  radius: {
    1: 4,
    2: 8,
    3: 12,
    4: 12,
    5: 16,
    6: 24,
    full: 999,
    true: 12,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
    true: 0,
  },
});

// ─── Themes ───────────────────────────────────────────────────────────────────
const lightTheme = {
  // Primary
  primary: rawColors.brand600,
  primaryLight: rawColors.brand50,
  primaryMid: rawColors.brand100,
  primaryDark: rawColors.brand700,
  // Success
  success: rawColors.green600,
  successLight: rawColors.green50,
  successMid: rawColors.green100,
  // Warning
  warning: rawColors.amber600,
  warningLight: rawColors.amber50,
  // Danger
  danger: rawColors.red500,
  dangerLight: rawColors.red50,
  // Background
  background: rawColors.white,
  backgroundSecondary: rawColors.gray50,
  backgroundTertiary: rawColors.brand50,
  // Text
  color: rawColors.gray900,
  colorSecondary: rawColors.gray500,
  colorTertiary: rawColors.gray400,
  // Border
  borderColor: rawColors.gray100,
  // Surfaces
  white: rawColors.white,
  black: rawColors.black,
  transparent: rawColors.transparent,
};

const darkTheme = {
  // Primary
  primary: rawColors.teal300,
  primaryLight: rawColors.brand900,
  primaryMid: rawColors.brand800,
  primaryDark: rawColors.brand100,
  // Success
  success: rawColors.green500,
  successLight: rawColors.green900,
  successMid: rawColors.green800,
  // Warning
  warning: rawColors.amber400,
  warningLight: rawColors.amber900,
  // Danger
  danger: rawColors.red500,
  dangerLight: rawColors.red900,
  // Background
  background: rawColors.gray900,
  backgroundSecondary: rawColors.gray800,
  backgroundTertiary: rawColors.gray700,
  // Text
  color: rawColors.white,
  colorSecondary: rawColors.gray300,
  colorTertiary: rawColors.gray400,
  // Border
  borderColor: rawColors.gray700,
  // Surfaces
  white: rawColors.white,
  black: rawColors.black,
  transparent: rawColors.transparent,
};

// ─── Plus Jakarta Sans (matches pos-dashboard) ────────────────────────────────
const jakartaFont = createFont({
  family: "PlusJakartaSans",
  size: {
    micro: 10,
    caption: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 22,
    "3xl": 28,
    "4xl": 36,
    "5xl": 44,
    true: 14,
  },
  lineHeight: {
    micro: 14,
    caption: 16,
    sm: 18,
    base: 20,
    md: 20,
    lg: 24,
    xl: 26,
    "2xl": 30,
    "3xl": 36,
    "4xl": 44,
    "5xl": 52,
    true: 20,
  },
  weight: {
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    true: "400",
  },
  letterSpacing: {
    true: 0,
  },
  face: {
    "400": { normal: "PlusJakartaSans_400Regular" },
    "500": { normal: "PlusJakartaSans_500Medium" },
    "600": { normal: "PlusJakartaSans_600SemiBold" },
    "700": { normal: "PlusJakartaSans_700Bold" },
    "800": { normal: "PlusJakartaSans_800ExtraBold" },
  },
});

// ─── Final Config ─────────────────────────────────────────────────────────────
export const tamaguiConfig = createTamagui({
  animations: animationDrivers as never,
  defaultTheme: "light",
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    body: jakartaFont,
    heading: jakartaFont,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1650 },
    xxl: { maxWidth: 2650 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  }),
});

export default tamaguiConfig;
