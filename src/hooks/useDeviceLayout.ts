import { useWindowDimensions } from "react-native";

const TABLET_BREAKPOINT = 600;
const TWO_PANE_BREAKPOINT = 600;
const SIDEBAR_BREAKPOINT = 768;

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isLandscape = width > height;
  const isCompactTablet = isTablet && width < TWO_PANE_BREAKPOINT;
  const useTwoPaneLayout = width >= TWO_PANE_BREAKPOINT;
  const showSidebarNav = width >= SIDEBAR_BREAKPOINT;

  return {
    isTablet,
    isPhone: !isTablet,
    isLandscape,
    isCompactTablet,
    useTwoPaneLayout,
    showSidebarNav,
    // Compact tablet tetap 3 kolom agar kartu tidak terlalu sempit.
    catalogCols: width >= 1200 ? 4 : isTablet ? 3 : 2,
    screenWidth: width,
    screenHeight: height,
  };
}
