import { Redirect } from "expo-router";

import { useActiveShiftQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { getAuthenticatedEntryRoute, getLoginRoute } from "@/lib/routing/device-routes";

export default function TabletIndex() {
  const { isLoggedIn } = useAuth();
  const activeShiftQuery = useActiveShiftQuery(isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href={getLoginRoute(true) as never} />;
  }

  if (activeShiftQuery.isPending) {
    return null;
  }

  return (
    <Redirect
      href={getAuthenticatedEntryRoute(
        true,
        Boolean(activeShiftQuery.data),
      ) as never}
    />
  );
}
