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

// ─── Raw Color Palette ───────────────────────────────────────────────────────
const rawColors = {
  brand25: "#F7FAF7",
  brand50: "#EEF4EF",
  brand100: "#DDE8DE",
  brand200: "#C3D2C5",
  brand400: "#6B8F71",
  brand500: "#3D7B5C",
  brand600: "#2F6B4F",
  brand700: "#24543E",
  brand800: "#1A4031",
  brand900: "#142B22",

  teal50: "#EEF7F6",
  teal100: "#D8E9E6",
  teal300: "#8EBDB7",
  teal500: "#4F938B",
  teal600: "#327A74",
  teal800: "#1F4D49",

  blue50: "#EFF6FF",
  blue100: "#DBEAFE",
  blue300: "#93C5FD",
  blue400: "#60A5FA",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  blue800: "#1E40AF",
  blue900: "#1E3A8A",

  green50: "#F0F6F1",
  green100: "#DDEBDD",
  green300: "#9EC4A7",
  green500: "#3F8E5C",
  green600: "#2F7A48",
  green700: "#246238",
  green800: "#1D4F2F",
  green900: "#153A24",

  amber50: "#FBF7ED",
  amber100: "#F3E6C9",
  amber300: "#E3CA91",
  amber400: "#C99032",
  amber600: "#A26012",
  amber700: "#8B4F10",
  amber900: "#5C3712",

  red50: "#FDF0EE",
  red100: "#F5D5D1",
  red300: "#E69C94",
  red500: "#C84036",
  red600: "#B42318",
  red700: "#911B13",
  red900: "#7F1D1D",

  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#9CA3AF",
  gray600: "#6B7280",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  purple50: "#F4F2F6",
  purple100: "#E7E2EC",
  purple300: "#D2C8DC",
  purple600: "#684A7D",
  purple700: "#553A68",

  orange50: "#FAF3EA",
  orange100: "#F0DEC8",
  orange300: "#E1C09A",
  orange600: "#A65F1A",
  orange700: "#874914",

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
    3: 10,
    4: 12,
    5: 16,
    6: 24,
    full: 999,
    true: 10,
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
  danger: rawColors.red600,
  dangerLight: rawColors.red50,
  // Background
  background: rawColors.white,
  backgroundSecondary: "#F7F8F6",
  backgroundTertiary: rawColors.brand50,
  // Text
  color: "#17211B",
  colorSecondary: "#5B675F",
  colorTertiary: "#89928B",
  // Border
  borderColor: "#E3E6E0",
  // Surfaces
  white: rawColors.white,
  black: rawColors.black,
  transparent: rawColors.transparent,
};

const darkTheme = {
  // Primary
  primary: rawColors.brand400,
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
  background: "#101A15",
  backgroundSecondary: rawColors.brand900,
  backgroundTertiary: rawColors.brand800,
  // Text
  color: rawColors.white,
  colorSecondary: "#C9D3CA",
  colorTertiary: "#9AA89C",
  // Border
  borderColor: "#2B4638",
  // Surfaces
  white: rawColors.white,
  black: rawColors.black,
  transparent: rawColors.transparent,
};

// ─── Poppins Font ─────────────────────────────────────────────────────────────
const poppinsFont = createFont({
  family: "Poppins",
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
    "400": { normal: "Poppins_400Regular" },
    "500": { normal: "Poppins_500Medium" },
    "600": { normal: "Poppins_600SemiBold" },
    "700": { normal: "Poppins_700Bold" },
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
    body: poppinsFont,
    heading: poppinsFont,
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
