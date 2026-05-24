/**
 * ShadowCard — Standard elevated card wrapper
 *
 * Shadow matches pos-dashboard shadow-xs: 0 1px 2px rgb(0 0 0 / 0.04)
 * Border matches pos-dashboard .page-card: border border-[ink-100]
 */
import { styled, YStack } from "tamagui";

import { ColorNeutral } from "@/themes/Colors";

export const ShadowCard = styled(YStack, {
  name: "ShadowCard",
  backgroundColor: "$background",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "$borderColor",
  shadowColor: ColorNeutral.neutral900,
  shadowOpacity: 0.06,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
});
