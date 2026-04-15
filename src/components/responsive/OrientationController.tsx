import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useDeviceProfile } from "@/hooks/use-device-profile";

const PHONE_LOCK = ScreenOrientation.OrientationLock.PORTRAIT_UP;
const TABLET_LOCK = ScreenOrientation.OrientationLock.LANDSCAPE;

export function OrientationController() {
  const { isTablet } = useDeviceProfile();

  useEffect(() => {
    if (Platform.OS === "web") return;

    let active = true;

    async function syncOrientation() {
      const nextLock = isTablet ? TABLET_LOCK : PHONE_LOCK;

      try {
        await ScreenOrientation.lockAsync(nextLock);
      } catch (error) {
        if (__DEV__ && active) {
          console.warn("Failed to lock screen orientation", error);
        }
      }
    }

    void syncOrientation();

    return () => {
      active = false;
    };
  }, [isTablet]);

  return null;
}
