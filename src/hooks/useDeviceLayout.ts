import { useWindowDimensions } from "react-native";

export function useDeviceLayout() {
  const { width, height } = useWindowDimensions();
  // Temporary override: force tablet layout everywhere.
  const isTablet = true;
  const isLandscape = width > height;
  const showSidebarNav = true;
  const isCompactTablet = false;
  // Two-pane hanya aktif saat tablet tanpa sidebar (sidebar sudah handle nav, konten butuh ruang penuh)
  // For now, also force two-pane where supported.
  const useTwoPaneLayout = true;

  return {
    isTablet,
    isPhone: !isTablet,
    isLandscape,
    isCompactTablet,
    useTwoPaneLayout,
    showSidebarNav,
    // Tablet selalu 4 kolom; phone 2 kolom.
    catalogCols: isTablet ? 4 : 2,
    screenWidth: width,
    screenHeight: height,
  };
}
