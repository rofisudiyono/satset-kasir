/**
 * Login background tokens — converted from pos-dashboard LoginLayout.tsx
 * @see pos-dashboard/src/pages/auth/shared/LoginLayout.tsx
 */

/** radial-gradient(circle at 24% 18%, rgba(16,185,129,0.28), transparent 24rem) */
export const loginHeroRadialMint = {
  cx: "24%",
  cy: "18%",
  color: "#10b981",
  opacity: 0.28,
} as const;

/** radial-gradient(circle at 80% 70%, rgba(245,158,11,0.16), transparent 26rem) */
export const loginHeroRadialAmber = {
  cx: "80%",
  cy: "70%",
  color: "#f59e0b",
  opacity: 0.16,
} as const;

/** linear-gradient(145deg, #0b1f17 0%, #0f3b2e 54%, #071511 100%) */
export const loginHeroLinearBase = {
  colors: ["#0b1f17", "#0f3b2e", "#071511"] as const,
  locations: [0, 0.54, 1] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

/** linear-gradient(180deg, transparent 0%, rgba(7,21,17,0.82) 100%) — bottom half overlay */
export const loginHeroBottomFade = {
  colors: ["transparent", "rgba(7, 21, 17, 0.82)"] as const,
  locations: [0, 1] as const,
} as const;

/** from-[var(--mint-500)]/45 to-transparent — left-16 top-40 w-80 */
export const loginHeroAccentLine = {
  colors: ["rgba(16, 185, 129, 0.45)", "transparent"] as const,
  top: 160,
  left: 64,
  width: 320,
} as const;

/** bottom-24 right-12 h-44 w-44 rounded-full border border-white/10 */
export const loginHeroDecorRing = {
  bottom: 96,
  right: 48,
  size: 176,
  borderColor: "rgba(255, 255, 255, 0.1)",
} as const;

/** main grid: lg:grid-cols-[1.05fr_0.95fr] */
export const loginLayoutSplit = {
  heroFlex: 1.05,
  formFlex: 0.95,
} as const;

/** form card: shadow-[0_24px_70px_-42px_rgba(15,23,42,0.42)] */
export const loginFormCardShadow = {
  shadowColor: "#0f172a",
  shadowOpacity: 0.42,
  shadowRadius: 70,
  shadowOffset: { width: 0, height: 24 },
  elevation: 8,
} as const;

/** loginInputClass shadow-[var(--shadow-xs)] */
export const loginInputShadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

/** loginSubmitClass shadow-[0_14px_30px_-18px_rgba(5,150,105,0.9)] */
export const loginSubmitShadow = {
  shadowColor: "#059669",
  shadowOpacity: 0.9,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 14 },
  elevation: 6,
} as const;

/** logo shadow-[0_18px_48px_-24px_rgba(16,185,129,0.7)] */
export const loginLogoShadow = {
  shadowColor: "#10b981",
  shadowOpacity: 0.7,
  shadowRadius: 48,
  shadowOffset: { width: 0, height: 18 },
  elevation: 8,
} as const;
