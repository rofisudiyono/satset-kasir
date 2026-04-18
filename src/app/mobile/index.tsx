import { Redirect } from "expo-router";

import { useActiveShiftQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import { getAuthenticatedEntryRoute, getLoginRoute } from "@/lib/routing/device-routes";

export default function MobileIndex() {
  const { isLoggedIn } = useAuth();
  const activeShiftQuery = useActiveShiftQuery(isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href={getLoginRoute(false) as never} />;
  }

  if (activeShiftQuery.isPending) {
    return null;
  }

  return (
    <Redirect
      href={getAuthenticatedEntryRoute(
        false,
        Boolean(activeShiftQuery.data),
      ) as never}
    />
  );
}
