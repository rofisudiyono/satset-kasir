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
    // Compact tablet tetap 3 kolom agar kartu tidak terlalu sempit.
    catalogCols: width >= 1200 ? 4 : 3,
    screenWidth: width,
    screenHeight: height,
  };
}
