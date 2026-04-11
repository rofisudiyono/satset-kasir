export const kasirKeys = {
  all: ["kasir"] as const,
  activeShift: () => [...kasirKeys.all, "shifts", "active"] as const,
  readyOrders: () => [...kasirKeys.all, "orders", "ready"] as const,
};
