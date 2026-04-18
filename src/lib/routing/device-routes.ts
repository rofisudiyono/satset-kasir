export type DeviceNamespace = "mobile" | "tablet";

export function getDeviceNamespace(isTablet: boolean): DeviceNamespace {
  return isTablet ? "tablet" : "mobile";
}

export function getNamespaceFromPathname(
  pathname: string,
): DeviceNamespace | null {
  if (pathname.startsWith("/tablet")) return "tablet";
  if (pathname.startsWith("/mobile")) return "mobile";
  return null;
}

export function getNamespacedRoute(
  namespace: DeviceNamespace,
  path: string,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${namespace}${normalized}`;
}

export function getLoginRoute(isTablet: boolean): string {
  return getNamespacedRoute(getDeviceNamespace(isTablet), "/login");
}

export function getOpenShiftRoute(isTablet: boolean): string {
  return getNamespacedRoute(getDeviceNamespace(isTablet), "/buka-shift");
}

export function getHomeRoute(isTablet: boolean): string {
  return getNamespacedRoute(getDeviceNamespace(isTablet), "/pesanan-web");
}

export function getInputManualRoute(isTablet: boolean): string {
  return getNamespacedRoute(getDeviceNamespace(isTablet), "/input-manual");
}

export function getHistoryRoute(isTablet: boolean): string {
  return getNamespacedRoute(getDeviceNamespace(isTablet), "/riwayat");
}

export function getSiapAntarRoute(isTablet: boolean): string {
  if (isTablet) {
    return getNamespacedRoute("tablet", "/siap-antar");
  }
  return "/siap-antar";
}

export function getSettingsRoute(isTablet: boolean): string {
  return getNamespacedRoute(getDeviceNamespace(isTablet), "/setting");
}
