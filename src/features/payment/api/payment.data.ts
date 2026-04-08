import type {
  CashNumpadKey,
  OrderType,
  PaymentMethodOption,
  PromoConfig,
} from "@/types";

export const orderTypeOptions: OrderType[] = [
  "Dine In",
  "Take Away",
  "Delivery",
];

export const paymentMethodOptions: PaymentMethodOption[] = [
  {
    id: "tunai",
    icon: "wallet-outline",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    title: "Tunai",
    subtitle: "Uang tunai & kembalian otomatis",
  },
  {
    id: "qris",
    icon: "qr-code-outline",
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    title: "QRIS",
    subtitle: "Scan QR code untuk pembayaran digital",
  },
  {
    id: "transfer",
    icon: "business-outline",
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    title: "Transfer Bank",
    subtitle: "Pembayaran via transfer ke rekening toko",
  },
  {
    id: "edc",
    icon: "card-outline",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    title: "EDC / Kartu",
    subtitle: "Debit atau kartu kredit melalui mesin EDC",
  },
  {
    id: "ewallet",
    icon: "phone-portrait-outline",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    title: "E-Wallet",
    subtitle: "OVO, GoPay, DANA, atau dompet digital lain",
  },
];

export const promoDefinitions: Record<string, PromoConfig> = {
  DISKON10: { discount: 5000, label: "DISKON10 - Hemat Rp 5.000" },
  HEMAT15: { discount: 15000, label: "HEMAT15 - Hemat Rp 15.000" },
};

export const cashNumpadRows: CashNumpadKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "DEL"],
];
