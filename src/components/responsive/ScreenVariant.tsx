import React from "react";

import { useDeviceProfile } from "@/hooks/use-device-profile";

type ScreenVariantProps = {
  phone: React.ReactNode;
  tablet: React.ReactNode;
};

export function ScreenVariant({ phone, tablet }: ScreenVariantProps) {
  const { isTablet } = useDeviceProfile();
  return <>{isTablet ? tablet : phone}</>;
}
