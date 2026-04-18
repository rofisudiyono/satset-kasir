import { Redirect } from "expo-router";

import { useShiftEntryRoute } from "@/features/shift/hooks/use-shift-entry-route";

export default function TabletIndex() {
  const { href, isReady } = useShiftEntryRoute(true);

  if (!isReady) {
    return null;
  }

  return <Redirect href={href as never} />;
}
