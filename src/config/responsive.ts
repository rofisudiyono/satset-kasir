export const RESPONSIVE_BREAKPOINTS = {
  tabletMinWidth: 900,
  largeTabletMinWidth: 1280,
} as const;

export type FormFactor = "phone" | "tablet" | "large-tablet";
export type Orientation = "portrait" | "landscape";

export type DeviceProfile = {
  width: number;
  height: number;
  orientation: Orientation;
  formFactor: FormFactor;
  isPhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  sectionGap: number;
};

export function getFormFactor(width: number): FormFactor {
  if (width >= RESPONSIVE_BREAKPOINTS.largeTabletMinWidth) {
    return "large-tablet";
  }

  if (width >= RESPONSIVE_BREAKPOINTS.tabletMinWidth) {
    return "tablet";
  }

  return "phone";
}

export function buildDeviceProfile(
  width: number,
  height: number,
): DeviceProfile {
  const formFactor = getFormFactor(width);
  const isLargeTablet = formFactor === "large-tablet";
  const isTablet = formFactor === "tablet" || isLargeTablet;
  const isPhone = formFactor === "phone";

  return {
    width,
    height,
    orientation: width >= height ? "landscape" : "portrait",
    formFactor,
    isPhone,
    isTablet,
    isLargeTablet,
    contentMaxWidth: isLargeTablet ? 1480 : isTablet ? 1200 : width,
    horizontalPadding: isLargeTablet ? 28 : isTablet ? 24 : 16,
    sectionGap: isTablet ? 20 : 16,
  };
}
