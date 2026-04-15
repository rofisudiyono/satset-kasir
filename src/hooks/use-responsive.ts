import { useDeviceProfile } from "./use-device-profile";

export function useResponsiveLayout() {
  const profile = useDeviceProfile();

  return {
    ...profile,
    isLandscape: profile.orientation === "landscape",
  };
}
