export const kasirKeys = {
  all: ["kasir"] as const,
  activeShift: () => [...kasirKeys.all, "shifts", "active"] as const,
  readyOrders: () => [...kasirKeys.all, "orders", "ready"] as const,
  pendingWebOrders: () => [...kasirKeys.all, "orders", "pending-web"] as const,
  menus: () => [...kasirKeys.all, "menus"] as const,
  tables: (branchId?: string) => [...kasirKeys.all, "tables", branchId ?? "active-branch"] as const,
  orderHistory: () => [...kasirKeys.all, "orders", "history"] as const,
};
