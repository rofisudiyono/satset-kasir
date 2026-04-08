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

export interface PromoConfig {
  discount: number;
  label: string;
}

export interface AppliedPromo extends PromoConfig {
  code: string;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  icon: IoniconName;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}
