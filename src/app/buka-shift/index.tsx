import { Redirect } from "expo-router";

import { useDeviceProfile } from "@/hooks/use-device-profile";
import { getOpenShiftRoute } from "@/lib/routing/device-routes";

export default function LegacyBukaShiftRedirect() {
  const { isTablet } = useDeviceProfile();
  return <Redirect href={getOpenShiftRoute(isTablet) as never} />;
}
