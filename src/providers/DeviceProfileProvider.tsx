import React, { createContext, useContext, useMemo } from "react";
import { useWindowDimensions } from "react-native";

import {
  buildDeviceProfile,
  type DeviceProfile,
} from "@/config/responsive";

const DeviceProfileContext = createContext<DeviceProfile | null>(null);

export function DeviceProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { width, height } = useWindowDimensions();

  const profile = useMemo(
    () => buildDeviceProfile(width, height),
    [height, width],
  );

  return (
    <DeviceProfileContext.Provider value={profile}>
      {children}
    </DeviceProfileContext.Provider>
  );
}

export function useDeviceProfileContext() {
  const value = useContext(DeviceProfileContext);

  if (!value) {
    throw new Error(
      "useDeviceProfile must be used within DeviceProfileProvider",
    );
  }

  return value;
}
