import { Redirect } from "expo-router";

import { useActiveShiftQuery } from "@/hooks/api/use-kasir-api";
import { useDeviceProfile } from "@/hooks/use-device-profile";
import { useAuth } from "@/lib/auth";
import {
  getAuthenticatedEntryRoute,
  getLoginRoute,
} from "@/lib/routing/device-routes";

export default function Index() {
  const { isLoggedIn } = useAuth();
  const { isTablet } = useDeviceProfile();
  const activeShiftQuery = useActiveShiftQuery(isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href={getLoginRoute(isTablet) as never} />;
  }

  if (activeShiftQuery.isPending) {
    return null;
  }

  return (
    <Redirect
      href={getAuthenticatedEntryRoute(
        isTablet,
        Boolean(activeShiftQuery.data),
      ) as never}
    />
  );
}
