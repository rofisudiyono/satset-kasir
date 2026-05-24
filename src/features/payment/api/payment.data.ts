import type {
  CashNumpadKey,
  OrderType,
  PaymentMethodOption,
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
    iconBg: "#ecfdf5",
    iconColor: "#059669",
    title: "Tunai",
    subtitle: "Uang tunai & kembalian otomatis",
  },
  {
    id: "qris",
    icon: "qr-code-outline",
    iconBg: "#f0f9ff",
    iconColor: "#0ea5e9",
    title: "QRIS",
    subtitle: "Scan QR code untuk pembayaran digital",
  },
  {
    id: "transfer",
    icon: "business-outline",
    iconBg: "#E7E2EC",
    iconColor: "#684A7D",
    title: "Transfer Bank",
    subtitle: "Pembayaran via transfer ke rekening toko",
  },
  {
    id: "edc",
    icon: "card-outline",
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    title: "EDC / Kartu",
    subtitle: "Debit atau kartu kredit melalui mesin EDC",
  },
  {
    id: "ewallet",
    icon: "phone-portrait-outline",
    iconBg: "#ecfdf5",
    iconColor: "#047857",
    title: "E-Wallet",
    subtitle: "OVO, GoPay, DANA, atau dompet digital lain",
  },
];


export const cashNumpadRows: CashNumpadKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "DEL"],
];
