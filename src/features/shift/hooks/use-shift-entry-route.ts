import { useMemo } from "react";

import { useActiveShiftQuery } from "@/hooks/api/use-kasir-api";
import { useAuth } from "@/lib/auth";
import {
  getAuthenticatedEntryRoute,
  getLoginRoute,
} from "@/lib/routing/device-routes";

export function useShiftEntryRoute(isTablet: boolean) {
  const { isLoggedIn } = useAuth();
  const activeShiftQuery = useActiveShiftQuery(isLoggedIn);

  const href = useMemo(() => {
    if (!isLoggedIn) {
      return getLoginRoute(isTablet);
    }

    return getAuthenticatedEntryRoute(
      isTablet,
      Boolean(activeShiftQuery.data),
    );
  }, [activeShiftQuery.data, isLoggedIn, isTablet]);

  return {
    href,
    isReady: !isLoggedIn || !activeShiftQuery.isPending,
  };
}
