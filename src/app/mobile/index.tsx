import { Redirect } from "expo-router";

import { useShiftEntryRoute } from "@/features/shift/hooks/use-shift-entry-route";

export default function MobileIndex() {
  const { href, isReady } = useShiftEntryRoute(false);

  if (!isReady) {
    return null;
  }

  return <Redirect href={href as never} />;
}
