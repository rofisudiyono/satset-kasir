import type { KasirTaxSettings } from "@/lib/api/types";

export function calculateTaxBreakdown(
  settings: KasirTaxSettings | null | undefined,
  taxableBase: number,
) {
  const base = Math.max(0, Math.round(taxableBase));
  const rate = Number(settings?.rate ?? 0);

  if (!settings?.isEnabled || !Number.isFinite(rate) || rate <= 0) {
    return {
      rate: 0,
      taxAmount: 0,
      grandTotal: base,
    };
  }

  if (settings.type === "inclusive") {
    const taxAmount = Math.round((base * rate) / (1 + rate));
    return {
      rate,
      taxAmount,
      grandTotal: base,
    };
  }

  const taxAmount = Math.round(base * rate);
  return {
    rate,
    taxAmount,
    grandTotal: base + taxAmount,
  };
}
