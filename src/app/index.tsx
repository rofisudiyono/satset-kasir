import { Redirect } from "expo-router";

import { useDeviceProfile } from "@/hooks/use-device-profile";
import { useAuth } from "@/lib/auth";
import { getHomeRoute, getLoginRoute } from "@/lib/routing/device-routes";

export default function Index() {
  const { isLoggedIn } = useAuth();
  const { isTablet } = useDeviceProfile();

  return (
    <Redirect
      href={(isLoggedIn ? getHomeRoute(isTablet) : getLoginRoute(isTablet)) as never}
    />
  );
}
