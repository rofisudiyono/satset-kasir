export const kasirKeys = {
  all: ["kasir"] as const,
  activeShift: () => [...kasirKeys.all, "shifts", "active"] as const,
  readyOrders: () => [...kasirKeys.all, "orders", "ready"] as const,
  pendingWebOrders: () => [...kasirKeys.all, "orders", "pending-web"] as const,
  menus: () => [...kasirKeys.all, "menus"] as const,
  tables: (branchId?: string) => [...kasirKeys.all, "tables", branchId ?? "active-branch"] as const,
  orderHistory: (params?: Record<string, unknown>) => [...kasirKeys.all, "orders", "history", params ?? {}] as const,
  orderDetail: (orderId?: string) => [...kasirKeys.all, "orders", "detail", orderId ?? "unknown"] as const,
  promos: () => [...kasirKeys.all, "promos"] as const,
  taxSettings: () => [...kasirKeys.all, "settings", "tax"] as const,
  tenantInfo: () => [...kasirKeys.all, "tenant-info"] as const,
};
