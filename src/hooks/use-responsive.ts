import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

const TABLET_MIN_WIDTH = 900;
const LARGE_TABLET_MIN_WIDTH = 1280;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isLandscape = width >= height;
    const isTablet = width >= TABLET_MIN_WIDTH;
    const isLargeTablet = width >= LARGE_TABLET_MIN_WIDTH;

    return {
      width,
      height,
      isLandscape,
      isTablet,
      isLargeTablet,
      contentMaxWidth: isLargeTablet ? 1480 : isTablet ? 1200 : width,
      horizontalPadding: isLargeTablet ? 28 : isTablet ? 24 : 16,
      sectionGap: isTablet ? 20 : 16,
    };
  }, [height, width]);
}
