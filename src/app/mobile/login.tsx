import { Redirect } from "expo-router";

import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { useShiftEntryRoute } from "@/features/shift/hooks/use-shift-entry-route";
import { useAuth } from "@/lib/auth";

export default function MobileLoginPage() {
  const { isLoggedIn } = useAuth();
  const { href, isReady } = useShiftEntryRoute(false);

  if (isLoggedIn) {
    if (!isReady) return null;
    return <Redirect href={href as never} />;
  }

  return <LoginScreen variant="mobile" />;
}
