import React from "react";

import { ScreenVariant } from "@/components/responsive/ScreenVariant";

import { TransactionEntryPhoneScreen } from "./phone/TransactionEntryPhoneScreen";
import { TransactionEntryTabletScreen } from "./tablet/TransactionEntryTabletScreen";

export function TransactionEntryScreen() {
  return (
    <ScreenVariant
      phone={<TransactionEntryPhoneScreen />}
      tablet={<TransactionEntryTabletScreen />}
    />
  );
}
