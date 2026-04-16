/**
 * Payment types
 */

import type { IoniconName } from "@/types/icons.types";

export type PaymentMethod =
  | "tunai"
  | "qris"
  | "transfer"
  | "edc"
  | "ewallet";
export type OrderType = "Dine In" | "Take Away" | "Delivery";
export type CashNumpadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "000"
  | "DEL";

export interface AppliedPromo {
  promoId: string;
  code: string;
  name: string;
  type: "percent" | "fixed";
  value: string;
  discount: number;
  label: string;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  icon: IoniconName;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}
