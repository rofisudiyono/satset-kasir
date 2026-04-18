import { Redirect } from "expo-router";

import { useDeviceProfile } from "@/hooks/use-device-profile";
import { getLoginRoute } from "@/lib/routing/device-routes";

export default function LegacyLoginRedirect() {
  const { isTablet } = useDeviceProfile();
  return <Redirect href={getLoginRoute(isTablet) as never} />;
}
