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
    iconBg: "#DDEBDD",
    iconColor: "#2F7A48",
    title: "Tunai",
    subtitle: "Uang tunai & kembalian otomatis",
  },
  {
    id: "qris",
    icon: "qr-code-outline",
    iconBg: "#D8E9E6",
    iconColor: "#327A74",
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
    iconBg: "#F3E6C9",
    iconColor: "#8B4F10",
    title: "EDC / Kartu",
    subtitle: "Debit atau kartu kredit melalui mesin EDC",
  },
  {
    id: "ewallet",
    icon: "phone-portrait-outline",
    iconBg: "#EEF4EF",
    iconColor: "#2F6B4F",
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
