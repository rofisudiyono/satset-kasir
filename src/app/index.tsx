import { Redirect } from "expo-router";

import { useShiftEntryRoute } from "@/features/shift/hooks/use-shift-entry-route";
import { useDeviceProfile } from "@/hooks/use-device-profile";

export default function Index() {
  const { isTablet } = useDeviceProfile();
  const { href, isReady } = useShiftEntryRoute(isTablet);

  if (!isReady) {
    return null;
  }

  return <Redirect href={href as never} />;
}
