/**
 * Typography atoms — Plus Jakarta Sans typeface
 *
 * Section 4 of the design spec.
 * Each component maps directly to a font-size token and weight.
 */
import { Text, styled } from "tamagui";

// ─── Base styled text ─────────────────────────────────────────────────────────
const AppText = styled(Text, {
  fontFamily: "$body",
  color: "$color",
});

// ─── Text components ──────────────────────────────────────────────────────────

/** 10sp / 400 — Bottom nav label, badge label */
export const TextMicro = styled(AppText, {
  name: "TextMicro",
  fontSize: "$micro",
  fontWeight: "400",
  lineHeight: "$micro",
});

/** 11sp / 500 — Section label (CAPS), timestamp */
export const TextCaption = styled(AppText, {
  name: "TextCaption",
  fontSize: "$caption",
  fontWeight: "500",
  lineHeight: "$caption",
});

/** 12sp / 400 — Subtitle, metadata, hint text */
export const TextBodySm = styled(AppText, {
  name: "TextBodySm",
  fontSize: "$sm",
  fontWeight: "400",
  lineHeight: "$sm",
});

/** 13sp / 400 — Konten utama, deskripsi produk */
export const TextBody = styled(AppText, {
  name: "TextBody",
  fontSize: "$base",
  fontWeight: "400",
  lineHeight: "$base",
});

/** 14sp / 500 — List title, form label, chip text */
export const TextBodyLg = styled(AppText, {
  name: "TextBodyLg",
  fontSize: "$md",
  fontWeight: "500",
  lineHeight: "$md",
});

/** 16sp / 500 — Section header, card sub-header */
export const TextH3 = styled(AppText, {
  name: "TextH3",
  fontSize: "$lg",
  fontWeight: "500",
  lineHeight: "$lg",
});

/** 18sp / 600 — Card title, nama produk besar */
export const TextH2 = styled(AppText, {
  name: "TextH2",
  fontSize: "$xl",
  fontWeight: "600",
  lineHeight: "$xl",
});

/** 22sp / 600 — Page title, screen header */
export const TextH1 = styled(AppText, {
  name: "TextH1",
  fontSize: "$2xl",
  fontWeight: "600",
  lineHeight: "$2xl",
});

/** 28sp / 600 — Total pendapatan, struk TOTAL */
export const TextDisplay = styled(AppText, {
  name: "TextDisplay",
  fontSize: "$3xl",
  fontWeight: "600",
  lineHeight: "$3xl",
});

/** 36sp / 600 — Cash input display nominal */
export const TextDisplayLg = styled(AppText, {
  name: "TextDisplayLg",
  fontSize: "$4xl",
  fontWeight: "600",
  lineHeight: "$4xl",
});

/** 44sp / 600 — Stock adjustment amount display */
export const TextDisplayXl = styled(AppText, {
  name: "TextDisplayXl",
  fontSize: "$5xl",
  fontWeight: "600",
  lineHeight: "$5xl",
});
