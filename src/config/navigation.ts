/**
 * Tab navigation configuration
 */

import type { TabConfig } from "@/types";

export const TAB_ICONS: Record<string, TabConfig> = {
  index: { active: "globe", inactive: "globe-outline" },
  transaksi: { active: "create", inactive: "create-outline" },
  inventori: { active: "bag-check", inactive: "bag-check-outline" },
  pengaturan: { active: "time", inactive: "time-outline" },
};

export const TAB_LABELS: Record<string, string> = {
  index: "Web Orders",
  transaksi: "Input Manual",
  inventori: "Siap Antar",
  pengaturan: "Riwayat",
};
