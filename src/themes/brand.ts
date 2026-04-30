/**
 * Satset Kasir — tablet reference palette (eye-friendly teal, sage, soft coral).
 * Header ≈ #006D4E, active/highlight ≈ #589B7F, canvas ≈ #F8F9FA.
 */
export const BrandColors = {
  deep: "#006D4E",
  deepDark: "#004F3A",
  sage: "#589B7F",
  sageLight: "#6FAF94",
  mid: "#0E7A62",
  /** Legacy name: interactive tint; untuk teks di atas permukaan terang */
  green: "#589B7F",
  /**
   * Tombol isian & chip aktif berteks putih — teal medium (lebih lembut
   * dari deepDark, tetap lebih kontras daripada sage).
   */
  buttonSolid: "#0F6B57",
  /** Soft mint for secondary text on dark green / gradients */
  lime: "#A8D4C4",
  accentOnDark: "#D4EDE3",
  canvas: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceWarm: "#FDFEFE",
  tint: "#E8F1ED",
  tintStrong: "#D4E8E0",
  text: "#0F3D32",
  textMuted: "#5A6963",
  border: "rgba(0, 109, 78, 0.12)",
  borderStrong: "rgba(0, 109, 78, 0.22)",
  coral: "#E8756B",
  coralPressed: "#D9665C",
  headerGradientTop: "#0E8A6E",
  headerGradientMid: "#007A5E",
  headerGradientBottom: "#006D4E",
} as const;
